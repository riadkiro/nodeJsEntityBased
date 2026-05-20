/**
 * SmartDoc API Router
 * 
 * Handles SmartDoc template management and document generation.
 * 
 * Routes:
 *   GET    /api/smartdoc/templates/:entityId        - List templates for an entity
 *   POST   /api/smartdoc/templates                  - Create a SmartDoc template
 *   PUT    /api/smartdoc/templates/:id              - Update a SmartDoc template
 *   DELETE /api/smartdoc/templates/:id              - Delete a SmartDoc template
 *   POST   /api/smartdoc/generate/:templateId       - Generate a document from template
 *   GET    /api/smartdoc/documents                  - List available document templates
 */

const express = require('express');
const router = express.Router();
const { tenantCollection } = require('../../middleware/tenant');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// ============================================================================
// SHARED HELPER: Resolve custom fields of type 'relation' asynchronously on-the-fly
// ============================================================================
async function resolveRelationCustomFields(record, entity, RecordModel) {
    if (!entity || !entity.customFields || !Array.isArray(entity.customFields)) return;
    if (!record) return;
    for (const cfDef of entity.customFields) {
        if (cfDef && cfDef.type === 'relation') {
            const fieldId = cfDef._id.toString();
            const relVal = (record.relations || []).find(r => r.relationKey === fieldId);
            if (relVal && relVal.value) {
                const ids = Array.isArray(relVal.value) ? relVal.value : [relVal.value];
                const validIds = ids.filter(id => id && mongoose.Types.ObjectId.isValid(id));
                if (validIds.length > 0) {
                    try {
                        const relRecs = await RecordModel.find({ _id: { $in: validIds } }).select('title').lean();
                        const displayVal = relRecs.map(r => r.title || 'Sans titre').join(', ');
                        
                        if (!record.customFields) record.customFields = [];
                        const existingIndex = record.customFields.findIndex(cf => cf.field_id && cf.field_id.toString() === fieldId);
                        if (existingIndex > -1) {
                            record.customFields[existingIndex].value = displayVal;
                        } else {
                            record.customFields.push({
                                field_id: cfDef._id,
                                value: displayVal
                            });
                        }
                    } catch (e) {
                        console.error('[Relation Custom Field Resolution] Error:', e.message);
                    }
                }
            }
        }
    }
}

// ============================================================================
// SHARED HELPER: Load entity with all related fields (tenant-safe)
// ============================================================================


/**
 * Load an entity by ID with customFields, classifications, statusClassification populated,
 * plus targetEntity for each relation — all using tenant-aware models.
 * This avoids the "Schema hasn't been registered for model 'FieldTemplate'" error
 * that occurs when using model:'FieldTemplate' strings in nested populate on a
 * multi-tenant Mongoose connection.
 */
async function loadEntityWithFields(req, entityId) {
    const Entity = await tenantCollection(req, 'Entity');
    const FieldTemplate = await tenantCollection(req, 'FieldTemplate');
    const Classification = await tenantCollection(req, 'Classification');

    if (!Entity || !entityId) return null;

    // Load entity with only refs (no nested populate) — lean for perf
    const entity = await Entity.findById(entityId).lean();
    if (!entity) return null;

    // Manually resolve customFields
    if (entity.customFields && entity.customFields.length > 0) {
        const ids = entity.customFields.map(f => (typeof f === 'object' ? f._id || f : f)).filter(Boolean);
        if (FieldTemplate && ids.length > 0) {
            entity.customFields = await FieldTemplate.find({ _id: { $in: ids } }).lean();
        }
    }

    // Manually resolve classifications
    if (Classification) {
        if (entity.classifications && entity.classifications.length > 0) {
            const ids = entity.classifications.map(c => (typeof c === 'object' ? c._id || c : c)).filter(Boolean);
            if (ids.length > 0) {
                entity.classifications = await Classification.find({ _id: { $in: ids } }).lean();
            }
        }
        if (entity.statusClassification) {
            const scId = typeof entity.statusClassification === 'object'
                ? entity.statusClassification._id || entity.statusClassification
                : entity.statusClassification;
            const sc = await Classification.findById(scId).lean();
            entity.statusClassification = sc || null;
        }
    }

    // Manually resolve relations.targetEntity and their fields
    if (entity.relations && entity.relations.length > 0) {
        for (const rel of entity.relations) {
            if (!rel.targetEntity) continue;
            const teId = typeof rel.targetEntity === 'object'
                ? rel.targetEntity._id || rel.targetEntity
                : rel.targetEntity;
            if (!teId) continue;

            const te = await Entity.findById(teId).select('name icon slug customFields classifications statusClassification').lean();
            if (!te) { rel.targetEntity = null; continue; }

            // Resolve targetEntity.customFields
            if (te.customFields && te.customFields.length > 0 && FieldTemplate) {
                const ids = te.customFields.map(f => (typeof f === 'object' ? f._id || f : f)).filter(Boolean);
                te.customFields = ids.length > 0 ? await FieldTemplate.find({ _id: { $in: ids } }).lean() : [];
            }

            // Resolve targetEntity.classifications
            if (te.classifications && te.classifications.length > 0 && Classification) {
                const ids = te.classifications.map(c => (typeof c === 'object' ? c._id || c : c)).filter(Boolean);
                te.classifications = ids.length > 0 ? await Classification.find({ _id: { $in: ids } }).lean() : [];
            }
            if (te.statusClassification && Classification) {
                const scId = typeof te.statusClassification === 'object'
                    ? te.statusClassification._id || te.statusClassification
                    : te.statusClassification;
                const sc = await Classification.findById(scId).lean();
                te.statusClassification = sc || null;
            }

            rel.targetEntity = te;
        }
    }

    return entity;
}

/**
 * Load multiple entities by IDs with full field resolution (tenant-safe)
 */
async function loadEntitiesWithFields(req, entityIds) {
    if (!entityIds || entityIds.length === 0) return [];
    const results = await Promise.all(entityIds.map(id => loadEntityWithFields(req, id)));
    return results.filter(Boolean);
}

// ============================================================================
// TEMPLATE MANAGEMENT
// ============================================================================

/**
 * GET /api/smartdoc/templates/:entityId
 * List all active SmartDoc templates for a given entity
 */
router.get('/smartdoc/templates/:entityId', async (req, res) => {
    try {
        const SmartDocTemplate = await tenantCollection(req, 'SmartDocTemplate');
        const entityId = req.params.entityId;
        const includeAll = String(req.query.all || '') === '1' || String(req.query.all || '').toLowerCase() === 'true';
        const recordId = String(req.query.recordId || '').trim();

        let linkedRecords = [];
        if (req.query.linkedRecords) {
            try {
                const parsed = JSON.parse(req.query.linkedRecords);
                if (Array.isArray(parsed)) linkedRecords = parsed;
            } catch (e) {
                // ignore malformed query payload
            }
        }

        const linkedRecordIds = Array.from(new Set(
            linkedRecords
                .map(r => String(r?.recordId || '').trim())
                .filter(v => mongoose.Types.ObjectId.isValid(v))
        ));
        const linkedRelationKeys = Array.from(new Set(
            linkedRecords
                .map(r => String(r?.relationKey || '').trim())
                .filter(Boolean)
        ));

        const visibilityClauses = [
            { scopeType: 'entity' },
            { scopeType: { $exists: false } },
            { scopeType: null },
            { scopeType: '' }
        ];

        if (mongoose.Types.ObjectId.isValid(recordId)) {
            visibilityClauses.push({
                scopeType: 'record',
                scopeRecordId: recordId
            });
        }

        if (linkedRecordIds.length > 0) {
            const relationScopeClause = {
                scopeType: 'relation',
                scopeRecordId: { $in: linkedRecordIds }
            };
            if (linkedRelationKeys.length > 0) {
                relationScopeClause.$or = [
                    { scopeRelationKey: { $in: linkedRelationKeys } },
                    { scopeRelationKey: { $exists: false } },
                    { scopeRelationKey: '' }
                ];
            }
            visibilityClauses.push(relationScopeClause);
        }

        const filter = includeAll
            ? { entityId, active: true }
            : { entityId, active: true, $or: visibilityClauses };

        const templates = await SmartDocTemplate.find(filter)
            .sort({ order: 1, name: 1 })
            .lean();

        res.json({ success: true, templates });
    } catch (error) {
        console.error('[SmartDoc] List templates error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/smartdoc/templates
 * Create a new SmartDoc template
 */
router.post('/smartdoc/templates', async (req, res) => {
    try {
        const SmartDocTemplate = await tenantCollection(req, 'SmartDocTemplate');
        const payload = { ...req.body };

        if (!['entity', 'record', 'relation'].includes(payload.scopeType)) {
            payload.scopeType = 'entity';
        }

        if (payload.scopeType === 'entity') {
            payload.scopeRecordId = null;
            payload.scopeRelationKey = '';
            payload.scopeRecordLabel = '';
            payload.scopeRelationLabel = '';
        } else if (!payload.scopeRecordId || !mongoose.Types.ObjectId.isValid(String(payload.scopeRecordId))) {
            return res.status(400).json({ error: 'scopeRecordId requis pour cette portee' });
        }

        const template = new SmartDocTemplate({
            ...payload,
            createdBy: req.user?._id
        });
        await template.save();
        res.json({ success: true, template });
    } catch (error) {
        console.error('[SmartDoc] Create template error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/smartdoc/templates/:id
 * Update a SmartDoc template
 */
router.put('/smartdoc/templates/:id', async (req, res) => {
    try {
        const SmartDocTemplate = await tenantCollection(req, 'SmartDocTemplate');
        const template = await SmartDocTemplate.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!template) return res.status(404).json({ error: 'Template introuvable' });
        res.json({ success: true, template });
    } catch (error) {
        console.error('[SmartDoc] Update template error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/smartdoc/templates/:id
 * Delete a SmartDoc template
 */
router.delete('/smartdoc/templates/:id', async (req, res) => {
    try {
        const SmartDocTemplate = await tenantCollection(req, 'SmartDocTemplate');
        await SmartDocTemplate.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('[SmartDoc] Delete template error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/smartdoc/templates/:id/unlink
 * Unlink a SmartDoc template from an entity (removes entityId reference)
 * Body: { entityId: "..." }
 */
router.post('/smartdoc/templates/:id/unlink', async (req, res) => {
    try {
        const SmartDocTemplate = await tenantCollection(req, 'SmartDocTemplate');
        const Document = await tenantCollection(req, 'Document');
        const template = await SmartDocTemplate.findById(req.params.id);
        if (!template) return res.status(404).json({ error: 'Template introuvable' });

        const entityId = req.body.entityId;

        // Remove from SmartDocTemplate
        await SmartDocTemplate.findByIdAndUpdate(req.params.id, { active: false });

        // Also remove association from the linked Document
        const scopeType = template.scopeType || 'entity';
        if (template.documentId) {
            if (scopeType === 'entity' && entityId) {
                await Document.findByIdAndUpdate(template.documentId, {
                    $pull: { entityIds: entityId }
                });
            } else if (scopeType === 'record' && template.scopeRecordId) {
                await Document.findByIdAndUpdate(template.documentId, {
                    $pull: { linkedRecords: { recordId: String(template.scopeRecordId) } }
                });
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error('[SmartDoc] Unlink template error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/smartdoc/documents?entityId=xxx
 * List available Document templates that are linked to an entity
 * Supports both legacy entityId and new entityIds array
 */
router.get('/smartdoc/documents', async (req, res) => {
    try {
        const Document = await tenantCollection(req, 'Document');
        const filter = { isTemplate: true };
        if (req.query.entityId || req.query.recordId) {
            // Search in legacy entityId, new entityIds array, and record-specific scopes
            filter.$or = [];
            if (req.query.entityId) {
                filter.$or.push({ entityId: req.query.entityId });
                filter.$or.push({ entityIds: req.query.entityId });
            }
            if (req.query.recordId) {
                filter.$or.push({ 'linkedRecords.recordId': req.query.recordId });
            }
        }
        const documents = await Document.find(filter)
            .select('name entityId entityIds format pages createdAt')
            .sort({ name: 1 })
            .lean();

        // Add page count
        documents.forEach(d => {
            d.pageCount = d.pages ? d.pages.length : 0;
            delete d.pages;
        });

        res.json({ success: true, documents });
    } catch (error) {
        console.error('[SmartDoc] List documents error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/smartdoc/generated-docs?entityId=xxx&smartDocTemplateId=yyy
 * List all documents generated via a specific SmartDoc template.
 * Aggregates from record attachments where isGenerated=true and generatedFrom matches.
 */
router.get('/smartdoc/generated-docs', async (req, res) => {
    try {
        const Record = await tenantCollection(req, 'Record');
        const { entityId, smartDocTemplateId } = req.query;

        if (!smartDocTemplateId) {
            return res.status(400).json({ error: 'smartDocTemplateId requis' });
        }

        // Find records with generated attachments from this template
        const query = {
            'attachments.isGenerated': true,
            'attachments.generatedFrom': smartDocTemplateId
        };
        if (entityId) {
            query.entityId = entityId;
        }

        const records = await Record.find(query)
            .select('title computedTitle attachments entityId')
            .sort({ updatedAt: -1 })
            .lean();

        // Flatten: extract matching attachments with record context
        const docs = [];
        for (const record of records) {
            const matchingAtts = (record.attachments || []).filter(
                att => att.isGenerated && att.generatedFrom === smartDocTemplateId
            );
            for (const att of matchingAtts) {
                docs.push({
                    _id: att._id,
                    filename: att.filename,
                    originalName: att.originalName,
                    mimeType: att.mimeType,
                    size: att.size,
                    category: att.category,
                    uploadedAt: att.uploadedAt,
                    createdAt: att.uploadedAt || record.createdAt,
                    recordId: record._id,
                    recordTitle: record.computedTitle || record.title || 'Sans titre',
                    downloadUrl: `/account/${req.account_number}/uploads/attachments/${att.filename}`,
                    viewUrl: `/account/${req.account_number}/uploads/attachments/${att.filename}`
                });
            }
        }

        // Sort by most recent first
        docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({ success: true, docs });
    } catch (error) {
        console.error('[SmartDoc] Generated docs listing error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/smartdoc/variables/:documentId
 * Get available variables for a document based on its linked entities
 * Returns: system vars, user vars, entity fields, related entity fields, classifications
 */
router.get('/smartdoc/variables/:documentId', async (req, res) => {
    try {
        const Document = await tenantCollection(req, 'Document');
        const Entity = await tenantCollection(req, 'Entity');
        const FieldTemplate = await tenantCollection(req, 'FieldTemplate');
        const Classification = await tenantCollection(req, 'Classification');

        const doc = await Document.findById(req.params.documentId).lean();
        if (!doc) return res.status(404).json({ error: 'Document introuvable' });

        const variables = {
            system: [],
            user: [],
            entities: []
        };

        // 1. System variables
        variables.system = [
            { path: 'today', label: "Date du jour", type: 'date', icon: 'solar:calendar-bold-duotone' },
            { path: 'currentYear', label: "Annee en cours", type: 'text', icon: 'solar:calendar-bold-duotone' },
            { path: 'currentMonth', label: "Mois en cours", type: 'text', icon: 'solar:calendar-bold-duotone' },
            { path: 'currentTime', label: "Heure actuelle", type: 'text', icon: 'solar:clock-circle-bold-duotone' }
        ];

        // 2. User variables
        variables.user = [
            { path: 'user.name', label: "Nom de l'utilisateur", type: 'text', icon: 'solar:user-bold-duotone' },
            { path: 'user.email', label: "Email de l'utilisateur", type: 'text', icon: 'solar:letter-bold-duotone' }
        ];

        // 3. Entity variables from linked entities
        const entityIds = [...(doc.entityIds || [])].map(id => id.toString());
        if (doc.entityId && !entityIds.includes(doc.entityId.toString())) {
            entityIds.push(doc.entityId.toString());
        }
        
        // Also include entities from linked records
        if (doc.linkedRecords && doc.linkedRecords.length > 0) {
            doc.linkedRecords.forEach(lr => {
                if (lr.entityId && !entityIds.includes(lr.entityId.toString())) {
                    entityIds.push(lr.entityId.toString());
                }
            });
        }

        console.log(`[SmartDoc Variables] doc.entityId: ${doc.entityId}, entityIds:`, entityIds);

        if (entityIds.length > 0 && Entity && FieldTemplate) {
            // Fetch all linked entities with their customFields populated
            // Using tenant-safe helper to avoid "Schema hasn't been registered" errors
            const entities = await loadEntitiesWithFields(req, entityIds);

            console.log(`[SmartDoc Variables] Found ${entities.length} entities from Entity.find()`);

            for (const entity of entities) {
                const entityVar = {
                    entityId: entity._id.toString(),
                    name: entity.name,
                    icon: entity.icon || 'solar:layers-bold-duotone',
                    slug: entity.slug,
                    fields: [],
                    classifications: [],
                    relations: []
                };

                // Standard fields
                entityVar.fields.push(
                    { path: `${entity.slug}.title`, label: 'Titre', type: 'text', fieldId: null },
                    { path: `${entity.slug}.description`, label: 'Description', type: 'text', fieldId: null },
                    { path: `${entity.slug}.createdAt`, label: 'Date de creation', type: 'date', fieldId: null },
                    { path: `${entity.slug}.updatedAt`, label: 'Date de modification', type: 'date', fieldId: null }
                );

                // Custom fields from FieldTemplate
                if (entity.customFields && entity.customFields.length > 0) {
                    for (const field of entity.customFields) {
                        if (!field) continue;
                        // Check overrides for label
                        const overrides = entity.fieldOverrides && entity.fieldOverrides instanceof Map
                            ? entity.fieldOverrides.get(field._id.toString())
                            : (entity.fieldOverrides?.[field._id.toString()] || null);
                        const displayLabel = overrides?.label || field.label || field.name;

                        entityVar.fields.push({
                            path: `${entity.slug}.${field.name}`,
                            label: displayLabel,
                            type: field.type || 'text',
                            fieldId: field._id.toString()
                        });
                    }
                }

                // Classifications for this entity
                const allClassifications = [
                    ...(entity.statusClassification ? [entity.statusClassification] : []),
                    ...(entity.classifications || [])
                ];
                for (const classif of allClassifications) {
                    if (!classif) continue;
                    entityVar.classifications.push({
                        path: `${entity.slug}.classification.${classif.key}`,
                        label: classif.name,
                        classificationId: classif._id.toString(),
                        options: (classif.options || []).map(o => ({ label: o.label, color: o.color }))
                    });
                }

                // Relations (related entities with their fields)
                if (entity.relations && entity.relations.length > 0) {
                    for (const relation of entity.relations) {
                        const targetEntity = relation.targetEntity;
                        if (!targetEntity || typeof targetEntity !== 'object') continue;

                        const relVar = {
                            relationKey: relation.key,
                            label: relation.label || targetEntity.name,
                            entityName: targetEntity.name,
                            entityIcon: targetEntity.icon || 'solar:link-bold-duotone',
                            entitySlug: targetEntity.slug,
                            cardinality: relation.cardinality,
                            fields: [],
                            classifications: []
                        };

                        // Standard fields of related entity
                        relVar.fields.push(
                            { path: `${entity.slug}.${targetEntity.slug}.title`, label: 'Titre', type: 'text', fieldId: null },
                            { path: `${entity.slug}.${targetEntity.slug}.description`, label: 'Description', type: 'text', fieldId: null }
                        );

                        // Custom fields of related entity
                        if (targetEntity.customFields && targetEntity.customFields.length > 0) {
                            for (const field of targetEntity.customFields) {
                                if (!field) continue;
                                relVar.fields.push({
                                    path: `${entity.slug}.${targetEntity.slug}.${field.name}`,
                                    label: field.label || field.name,
                                    type: field.type || 'text',
                                    fieldId: field._id.toString()
                                });
                            }
                        }

                        // Classifications of related entity
                        const relClassifications = [
                            ...(targetEntity.statusClassification ? [targetEntity.statusClassification] : []),
                            ...(targetEntity.classifications || [])
                        ];
                        for (const classif of relClassifications) {
                            if (!classif) continue;
                            relVar.classifications.push({
                                path: `${entity.slug}.${targetEntity.slug}.classification.${classif.key}`,
                                label: classif.name,
                                classificationId: classif._id.toString()
                            });
                        }

                        entityVar.relations.push(relVar);
                    }
                }

                // Custom fields of type 'relation' (e.g., Contact, Représentant)
                // Expose their target entity's fields as relation sub-sections
                if (entity.customFields && entity.customFields.length > 0) {
                    const FieldTemplate = await tenantCollection(req, 'FieldTemplate');
                    for (const field of entity.customFields) {
                        if (!field || field.type !== 'relation') continue;
                        const typeConfig = field.type_config || {};
                        const targetEntityId = typeConfig.refEntity;
                        if (!targetEntityId) continue;

                        // Load target entity with its fields and classifications
                        const targetEntity = await loadEntityWithFields(req, targetEntityId);
                        if (!targetEntity) continue;

                        // Use the field name as the relation prefix (e.g., 'contact', 'representant')
                        const fieldName = field.name || field.label?.toLowerCase().replace(/\s+/g, '_') || field._id.toString();

                        const relVar = {
                            relationKey: field._id.toString(),
                            label: field.label || field.name,
                            entityName: targetEntity.name,
                            entityIcon: targetEntity.icon || 'solar:user-bold-duotone',
                            entitySlug: targetEntity.slug,
                            cardinality: typeConfig.multiple ? 'many' : 'one',
                            isCustomField: true,
                            fields: [],
                            classifications: []
                        };

                        // Standard fields of related entity
                        relVar.fields.push(
                            { path: `${entity.slug}.${fieldName}.title`, label: 'Titre', type: 'text', fieldId: null },
                            { path: `${entity.slug}.${fieldName}.description`, label: 'Description', type: 'text', fieldId: null }
                        );

                        // Custom fields of related entity
                        if (targetEntity.customFields && targetEntity.customFields.length > 0) {
                            for (const tf of targetEntity.customFields) {
                                if (!tf) continue;
                                relVar.fields.push({
                                    path: `${entity.slug}.${fieldName}.${tf.name}`,
                                    label: tf.label || tf.name,
                                    type: tf.type || 'text',
                                    fieldId: tf._id.toString()
                                });
                            }
                        }

                        // Classifications of related entity
                        const relClassifications = [
                            ...(targetEntity.statusClassification ? [targetEntity.statusClassification] : []),
                            ...(targetEntity.classifications || [])
                        ];
                        for (const classif of relClassifications) {
                            if (!classif) continue;
                            relVar.classifications.push({
                                path: `${entity.slug}.${fieldName}.classification.${classif.key}`,
                                label: classif.name,
                                classificationId: classif._id.toString()
                            });
                        }

                        entityVar.relations.push(relVar);
                    }
                }

                variables.entities.push(entityVar);
            }
        }

        // 4. Available line schemas for linked entities (for dynamic tables)
        variables.lineSchemas = [];
        try {
            const LineSchema = await tenantCollection(req, 'LineSchema');
            if (LineSchema && entityIds.length > 0) {
                const schemas = await LineSchema.find({
                    'appliesTo.entityIds': { $in: entityIds }
                }).lean();
                for (const schema of schemas) {
                    variables.lineSchemas.push({
                        _id: schema._id.toString(),
                        name: schema.name,
                        slug: schema.slug,
                        description: schema.description || '',
                        columns: (schema.columns || []).filter(c => c.visible !== false).map(c => ({
                            key: c.key,
                            label: c.label,
                            type: c.type
                        }))
                    });
                }
            }
        } catch (e) {
            console.warn('[SmartDoc] Could not load line schemas:', e.message);
        }

        res.json({ success: true, variables });
    } catch (error) {
        console.error('[SmartDoc] Variables error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// DOCUMENT GENERATION
// ============================================================================

/**
 * POST /api/smartdoc/generate/:templateId
 * Generate a document from a SmartDoc template
 * 
 * Body:
 *   - recordId: ID of the record to generate for
 *   - inputs: { dateFrom: "...", dateTo: "...", ... } - extra inputs if required
 */
router.post('/smartdoc/generate/:templateId', async (req, res) => {
    try {
        const SmartDocTemplate = await tenantCollection(req, 'SmartDocTemplate');
        const Document = await tenantCollection(req, 'Document');
        const Record = await tenantCollection(req, 'Record');
        const Entity = await tenantCollection(req, 'Entity');
        const Classification = await tenantCollection(req, 'Classification');
        const DocumentLine = await tenantCollection(req, 'DocumentLine');
        const GridSnapshot = await tenantCollection(req, 'GridSnapshot');
        const LineSchema = await tenantCollection(req, 'LineSchema');

        // 1. Load the SmartDoc template
        const smartDocTemplate = await SmartDocTemplate.findById(req.params.templateId);
        if (!smartDocTemplate) {
            return res.status(404).json({ error: 'SmartDoc template introuvable' });
        }

        // 2. Load the record
        const record = await Record.findById(req.body.recordId);
        if (!record) {
            return res.status(404).json({ error: 'Record introuvable' });
        }

        // 3. Load the entity with full population (custom fields, relations, classifications)
        // Use the record's actual entity if available, fallback to template's entity
        const targetEntityId = record.entityId || smartDocTemplate.entityId;
        const entity = await loadEntityWithFields(req, targetEntityId);

        // 3b. Load related records for relations
        const relatedRecordsMap = {};
        if (entity && entity.relations && record.relations) {
            for (const rel of entity.relations) {
                const targetEntity = rel.targetEntity;
                if (!targetEntity || typeof targetEntity !== 'object') continue;

                const recRelation = record.relations.find(r => r.relationKey === rel.key);
                if (!recRelation || !recRelation.value) continue;

                // Get the first related record (for single cardinality)
                const relatedId = Array.isArray(recRelation.value) ? recRelation.value[0] : recRelation.value;
                if (!relatedId) continue;

                try {
                    const relatedRecord = await Record.findById(relatedId).lean();
                    if (relatedRecord) {
                        relatedRecordsMap[rel.key] = {
                            record: relatedRecord,
                            entity: targetEntity
                        };
                    }
                } catch (e) {
                    console.warn('[SmartDoc] Could not load related record:', relatedId, e.message);
                }
            }
        }

        // 3b2. Also load related records for custom fields of type 'relation'
        if (entity && entity.customFields && record.relations) {
            for (const cfDef of entity.customFields) {
                if (!cfDef || cfDef.type !== 'relation') continue;
                const fieldId = cfDef._id.toString();
                const typeConfig = cfDef.type_config || {};
                const targetEntityId = typeConfig.refEntity;
                if (!targetEntityId) continue;

                const recRelation = record.relations.find(r => r.relationKey === fieldId);
                if (!recRelation || !recRelation.value) continue;

                const relatedId = Array.isArray(recRelation.value) ? recRelation.value[0] : recRelation.value;
                if (!relatedId) continue;

                try {
                    const relatedRecord = await Record.findById(relatedId).lean();
                    if (relatedRecord) {
                        // Load the target entity for field resolution
                        const targetEntity = await loadEntityWithFields(req, targetEntityId);
                        if (targetEntity) {
                            relatedRecordsMap[fieldId] = {
                                record: relatedRecord,
                                entity: targetEntity
                            };
                        }
                    }
                } catch (e) {
                    console.warn('[SmartDoc] Could not load custom relation record:', relatedId, e.message);
                }
            }
        }

        // 3c. Pre-resolve custom fields of type 'relation' asynchronously
        // Clone the mongoose record object to avoid modifying/saving the DB model directly
        const recordForTokens = record.toObject ? record.toObject() : JSON.parse(JSON.stringify(record));
        await resolveRelationCustomFields(recordForTokens, entity, Record);

        // Also pre-resolve for any related records in relatedRecordsMap
        if (relatedRecordsMap) {
            for (const relKey of Object.keys(relatedRecordsMap)) {
                const relData = relatedRecordsMap[relKey];
                if (relData && relData.record && relData.entity) {
                    await resolveRelationCustomFields(relData.record, relData.entity, Record);
                }
            }
        }

        // 4. Validate required inputs
        const inputs = req.body.inputs || {};
        const missingInputs = [];
        for (const field of smartDocTemplate.inputFields || []) {
            if (field.required && !inputs[field.key] && inputs[field.key] !== 0) {
                missingInputs.push(field.label || field.key);
            }
        }
        if (missingInputs.length > 0) {
            return res.status(400).json({
                error: 'Champs obligatoires manquants',
                missingFields: missingInputs
            });
        }

        // 5. Load the document template
        const docTemplate = await Document.findById(smartDocTemplate.documentId);
        if (!docTemplate) {
            return res.status(404).json({ error: 'Document template introuvable' });
        }
        const templateSchemaIds = extractDynamicTableSchemaIdsFromDocument(docTemplate);

        // 5b. Load DocumentLines for this record (for dynamic tables)
        let recordLines = [];
        let lineSchemas = {};
        if (DocumentLine && LineSchema) {
            const linesData = await loadRecordLinesWithSnapshotFallback({
                DocumentLine,
                LineSchema,
                GridSnapshot,
                record,
                entityId: entity?._id,
                extraSchemaIds: templateSchemaIds
            });
            recordLines = linesData.recordLines;
            lineSchemas = linesData.lineSchemas;
            // Pre-resolve relation values (ObjectId → record title)
            recordLines = await resolveRelationValues(recordLines, lineSchemas, Record);
        }

        // 6. Resolve tokens in the document template
        let resolvedHtml = resolveDocumentTokens(docTemplate, recordForTokens, entity, inputs, relatedRecordsMap, req.user);

        // 6a. Resolve dynamic tables
        resolvedHtml = resolveDynamicTables(resolvedHtml, recordLines, lineSchemas);

        // 6b. Extract used variables for preview sidebar
        const usedVariables = extractUsedVariables(docTemplate, recordForTokens, entity, inputs, relatedRecordsMap, req.user);

        // 7. Generate output file name
        const outputName = resolveOutputName(
            smartDocTemplate.outputNameTemplate || '{{templateName}} - {{recordTitle}}',
            smartDocTemplate.name,
            record.computedTitle || record.title || 'Record',
            inputs
        );

        // 8. Generate PDF if requested
        let savedFilename;
        let savedSize;
        const outputDir = path.join(__dirname, '../../private_uploads/attachments', String(req.account_number));
        fs.mkdirSync(outputDir, { recursive: true });

        if (smartDocTemplate.outputFormat === 'pdf' || smartDocTemplate.outputFormat === 'both') {
            const pdfFilename = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.pdf';
            const pdfPath = path.join(outputDir, pdfFilename);

            try {
                await generatePDF(resolvedHtml, pdfPath, docTemplate);
                savedFilename = pdfFilename;
                savedSize = fs.statSync(pdfPath).size;
            } catch (pdfErr) {
                console.error('[SmartDoc] PDF generation error:', pdfErr);
                // Fallback: save as HTML
                const htmlFilename = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.html';
                const htmlPath = path.join(outputDir, htmlFilename);
                fs.writeFileSync(htmlPath, resolvedHtml, 'utf8');
                savedFilename = htmlFilename;
                savedSize = fs.statSync(htmlPath).size;
            }
        } else {
            // HTML output
            const htmlFilename = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.html';
            const htmlPath = path.join(outputDir, htmlFilename);
            fs.writeFileSync(htmlPath, resolvedHtml, 'utf8');
            savedFilename = htmlFilename;
            savedSize = fs.statSync(htmlPath).size;
        }

        // 9. Save as record attachment
        const newAttachment = {
            filename: savedFilename,
            originalName: outputName + (savedFilename.endsWith('.pdf') ? '.pdf' : '.html'),
            mimeType: savedFilename.endsWith('.pdf') ? 'application/pdf' : 'text/html',
            size: savedSize,
            category: 'pdf',
            isGenerated: true,
            generatedFrom: smartDocTemplate._id.toString(),
            generatedFromName: smartDocTemplate.name,
            uploadedAt: new Date(),
            uploadedBy: req.user?._id
        };

        record.attachments = record.attachments || [];
        record.attachments.push(newAttachment);
        await record.save();

        // Get the ID of the newly added attachment
        const addedAttachment = record.attachments[record.attachments.length - 1];

        res.json({
            success: true,
            attachment: {
                _id: addedAttachment._id,
                ...newAttachment,
                url: `/account/${req.account_number}/uploads/attachments/${savedFilename}`,
                sizeFormatted: formatSize(savedSize)
            },
            previewHtml: resolvedHtml,
            usedVariables,
            outputName
        });
    } catch (error) {
        console.error('[SmartDoc] Generate error:', error);
        res.status(500).json({ error: error.message || 'Erreur lors de la generation' });
    }
});

// ============================================================================
// DRAFT-BASED GENERATION (Mission 9)
// Generate an editable draft document from a template, allowing user
// modifications before finalizing into a PDF attachment.
// ============================================================================

/**
 * POST /api/smartdoc/generate-draft/:templateId
 * Creates a temporary copy of the template document with tokens resolved,
 * so the user can edit it in the React editor before finalizing.
 * 
 * Body:
 *   - recordId: ID of the record to generate for
 *   - inputs: { ... } - extra inputs if required
 * 
 * Returns: { success, draftDocumentId, outputName }
 */
router.post('/smartdoc/generate-draft/:templateId', async (req, res) => {
    try {
        const SmartDocTemplate = await tenantCollection(req, 'SmartDocTemplate');
        const Document = await tenantCollection(req, 'Document');
        const Record = await tenantCollection(req, 'Record');
        const Entity = await tenantCollection(req, 'Entity');
        const DocumentLine = await tenantCollection(req, 'DocumentLine');
        const GridSnapshot = await tenantCollection(req, 'GridSnapshot');
        const LineSchema = await tenantCollection(req, 'LineSchema');

        // 1. Load the SmartDoc template
        const smartDocTemplate = await SmartDocTemplate.findById(req.params.templateId);
        if (!smartDocTemplate) {
            return res.status(404).json({ error: 'SmartDoc template introuvable' });
        }

        // 2. Load the record
        const record = await Record.findById(req.body.recordId);
        if (!record) {
            return res.status(404).json({ error: 'Record introuvable' });
        }

        // 3. Load the entity with full population
        // Use the record's actual entity if available, fallback to template's entity
        const targetEntityId = record.entityId || smartDocTemplate.entityId;
        const entity = await loadEntityWithFields(req, targetEntityId);

        // 3b. Load related records
        const relatedRecordsMap = {};
        if (entity && entity.relations && record.relations) {
            for (const rel of entity.relations) {
                const targetEntity = rel.targetEntity;
                if (!targetEntity || typeof targetEntity !== 'object') continue;
                const recRelation = record.relations.find(r => r.relationKey === rel.key);
                if (!recRelation || !recRelation.value) continue;
                const relatedId = Array.isArray(recRelation.value) ? recRelation.value[0] : recRelation.value;
                if (!relatedId) continue;
                try {
                    const relatedRecord = await Record.findById(relatedId).lean();
                    if (relatedRecord) {
                        relatedRecordsMap[rel.key] = { record: relatedRecord, entity: targetEntity };
                    }
                } catch (e) {
                    console.warn('[SmartDoc] Could not load related record:', relatedId, e.message);
                }
            }
        }

        // 3b2. Also load related records for custom fields of type 'relation'
        if (entity && entity.customFields && record.relations) {
            for (const cfDef of entity.customFields) {
                if (!cfDef || cfDef.type !== 'relation') continue;
                const fieldId = cfDef._id.toString();
                const typeConfig = cfDef.type_config || {};
                const targetEntityId2 = typeConfig.refEntity;
                if (!targetEntityId2) continue;

                const recRelation = record.relations.find(r => r.relationKey === fieldId);
                if (!recRelation || !recRelation.value) continue;
                const relatedId = Array.isArray(recRelation.value) ? recRelation.value[0] : recRelation.value;
                if (!relatedId) continue;

                try {
                    const relatedRecord = await Record.findById(relatedId).lean();
                    if (relatedRecord) {
                        const targetEnt = await loadEntityWithFields(req, targetEntityId2);
                        if (targetEnt) {
                            relatedRecordsMap[fieldId] = { record: relatedRecord, entity: targetEnt };
                        }
                    }
                } catch (e) {
                    console.warn('[SmartDoc] Could not load custom relation record:', relatedId, e.message);
                }
            }
        }

        // 3c. Pre-resolve custom fields of type 'relation' asynchronously
        // Clone the mongoose record object to avoid modifying/saving the DB model directly
        const recordForTokens = record.toObject ? record.toObject() : JSON.parse(JSON.stringify(record));
        await resolveRelationCustomFields(recordForTokens, entity, Record);

        // Also pre-resolve for any related records in relatedRecordsMap
        if (relatedRecordsMap) {
            for (const relKey of Object.keys(relatedRecordsMap)) {
                const relData = relatedRecordsMap[relKey];
                if (relData && relData.record && relData.entity) {
                    await resolveRelationCustomFields(relData.record, relData.entity, Record);
                }
            }
        }

        // 4. Auto-fill required inputs with defaults for draft generation
        //    (drafts are editable, so we fill sensible defaults instead of rejecting)
        const inputs = req.body.inputs || {};
        for (const field of smartDocTemplate.inputFields || []) {
            if (field.required && !inputs[field.key] && inputs[field.key] !== 0) {
                // Auto-fill with sensible defaults based on field type
                if (field.type === 'date') {
                    inputs[field.key] = new Date().toISOString().split('T')[0]; // today
                } else if (field.type === 'number') {
                    inputs[field.key] = 0;
                } else {
                    inputs[field.key] = ''; // empty string for text/textarea
                }
            }
        }

        // 5. Load the document template
        const docTemplate = await Document.findById(smartDocTemplate.documentId);
        if (!docTemplate) {
            return res.status(404).json({ error: 'Document template introuvable' });
        }
        const templateSchemaIds = extractDynamicTableSchemaIdsFromDocument(docTemplate);

        // 5b. Load DocumentLines for dynamic tables in draft
        let recordLines = [];
        let lineSchemas = {};
        if (DocumentLine && LineSchema) {
            const linesData = await loadRecordLinesWithSnapshotFallback({
                DocumentLine,
                LineSchema,
                GridSnapshot,
                record,
                entityId: entity?._id,
                extraSchemaIds: templateSchemaIds
            });
            recordLines = linesData.recordLines;
            lineSchemas = linesData.lineSchemas;
            // Pre-resolve relation values (ObjectId → record title)
            recordLines = await resolveRelationValues(recordLines, lineSchemas, Record);
        }

        // 6. Build token context (same as resolveDocumentTokens)
        const context = buildTokenContext(recordForTokens, entity, inputs, relatedRecordsMap, req.user);

        // 6b. Inject variables for any OTHER records specifically linked to this template
        if (docTemplate.linkedRecords && docTemplate.linkedRecords.length > 0) {
            for (const lr of docTemplate.linkedRecords) {
                if (!lr.recordId || !lr.entityId) continue;
                // Skip if this is the primary record we just loaded
                if (lr.recordId.toString() === record._id.toString()) continue;
                
                try {
                    const lrRecord = await Record.findById(lr.recordId).lean();
                    const lrEntity = await loadEntityWithFields(req, lr.entityId);
                    
                    if (lrRecord && lrEntity && lrEntity.slug) {
                        await resolveRelationCustomFields(lrRecord, lrEntity, Record);
                        const lrContext = buildTokenContext(lrRecord, lrEntity, {}, {}, req.user);
                        // Merge the entity-specific context into the main context
                        if (lrContext[lrEntity.slug]) {
                            context[lrEntity.slug] = lrContext[lrEntity.slug];
                        }
                    }
                } catch (err) {
                    console.warn(`[SmartDoc] Could not load linked record ${lr.recordId} for context:`, err.message);
                }
            }
        }

        // 6c. Inject variables for any manually selected additional context records passed in req.body
        const additionalRecordsLoaded = [];
        if (req.body.additionalRecordIds && Array.isArray(req.body.additionalRecordIds)) {
            for (const addId of req.body.additionalRecordIds) {
                if (!addId || addId.toString() === record._id.toString()) continue;
                
                try {
                    const addRecord = await Record.findById(addId).lean();
                    if (addRecord) {
                        const addEntity = await loadEntityWithFields(req, addRecord.entityId);
                        if (addEntity && addEntity.slug) {
                            await resolveRelationCustomFields(addRecord, addEntity, Record);
                            additionalRecordsLoaded.push({ record: addRecord, entity: addEntity });
                            const addContext = buildTokenContext(addRecord, addEntity, {}, {}, req.user);
                            if (addContext[addEntity.slug]) {
                                context[addEntity.slug] = addContext[addEntity.slug];
                            }
                        }
                    }
                } catch (err) {
                    console.warn(`[SmartDoc] Could not load additional record ${addId} for context:`, err.message);
                }
            }
        }

        // 7. Create a COPY of the document with tokens resolved in pages
        //    NOTE: Dynamic tables are NOT resolved to static HTML here.
        //    They are kept as <div class="dynamic-table"> placeholders so the
        //    React document editor can render them interactively (add lines, presets, catalog).
        const draftPages = (docTemplate.pages || []).map(page => {
            const resolvedPage = { ...page.toObject ? page.toObject() : { ...page } };
            // Resolve tokens in page content (but NOT dynamic tables)
            if (resolvedPage.content) {
                resolvedPage.content = resolveTokensInString(resolvedPage.content, context);
                resolvedPage.content = previewDynamicTablesForDraft(resolvedPage.content, recordLines, lineSchemas);
            }
            // Resolve tokens in elements
            if (resolvedPage.elements && Array.isArray(resolvedPage.elements)) {
                resolvedPage.elements = resolvedPage.elements.map(el => {
                    const resolvedEl = { ...el };
                    if (resolvedEl.content && typeof resolvedEl.content === 'object') {
                        resolvedEl.content = { ...resolvedEl.content };
                        if (resolvedEl.content.text) {
                            resolvedEl.content.text = resolveTokensInString(resolvedEl.content.text, context);
                        }
                        if (resolvedEl.content.html) {
                            resolvedEl.content.html = resolveTokensInString(resolvedEl.content.html, context);
                        }
                    }
                    return resolvedEl;
                });
            }
            // Resolve tokens in rows (layout mode)
            if (resolvedPage.rows && Array.isArray(resolvedPage.rows)) {
                resolvedPage.rows = resolvedPage.rows.map(row => {
                    const resolvedRow = { ...row.toObject ? row.toObject() : { ...row } };
                    if (resolvedRow.columns && Array.isArray(resolvedRow.columns)) {
                        resolvedRow.columns = resolvedRow.columns.map(col => {
                            const resolvedCol = { ...col.toObject ? col.toObject() : { ...col } };
                            if (resolvedCol.blocks && Array.isArray(resolvedCol.blocks)) {
                                resolvedCol.blocks = resolvedCol.blocks.map(block => {
                                    const resolvedBlock = { ...block.toObject ? block.toObject() : { ...block } };
                                    if (resolvedBlock.content) {
                                        resolvedBlock.content = resolveTokensInString(resolvedBlock.content, context);
                                        resolvedBlock.content = previewDynamicTablesForDraft(resolvedBlock.content, recordLines, lineSchemas);
                                    }
                                    if (resolvedBlock.html) {
                                        resolvedBlock.html = resolveTokensInString(resolvedBlock.html, context);
                                        resolvedBlock.html = previewDynamicTablesForDraft(resolvedBlock.html, recordLines, lineSchemas);
                                    }
                                    return resolvedBlock;
                                });
                            }
                            return resolvedCol;
                        });
                    }
                    return resolvedRow;
                });
            }
            return resolvedPage;
        });

        // Resolve header/footer
        const resolvedHeaderHtml = docTemplate.headerHtml
            ? resolveTokensInString(docTemplate.headerHtml, context) : '';
        const resolvedFooterHtml = docTemplate.footerHtml
            ? resolveTokensInString(docTemplate.footerHtml, context) : '';

        // 8. Generate output name
        const outputName = resolveOutputName(
            smartDocTemplate.outputNameTemplate || '{{templateName}} - {{recordTitle}}',
            smartDocTemplate.name,
            record.computedTitle || record.title || 'Record',
            inputs
        );

        // 9. Save as a draft document (temporary, flagged for cleanup)
        // Build linkedRecords: source record + only relations used by the template
        const draftLinkedRecords = [];
        if (record && entity) {
            draftLinkedRecords.push({
                recordId: record._id,
                recordTitle: record.computedTitle || record.title || '',
                entityId: entity._id,
                entityName: entity.name || '',
                entityIcon: entity.icon || '',
                entityColor: entity.color || '',
                entitySlug: entity.slug || '',
                alias: entity.slug || ''
            });
            // Only add related records that are referenced by the template's collections
            const templateCollectionEntityIds = new Set();
            if (docTemplate.entityId) templateCollectionEntityIds.add(docTemplate.entityId.toString());
            (docTemplate.entityIds || []).forEach(eid => templateCollectionEntityIds.add(eid.toString()));
            (docTemplate.collections || []).forEach(c => {
                if (c.entityId) templateCollectionEntityIds.add(c.entityId.toString());
            });

            for (const [relKey, relData] of Object.entries(relatedRecordsMap)) {
                if (!relData.record || !relData.entity) continue;
                const targetEntityId = relData.entity._id?.toString();
                // Only include if this relation's entity is referenced by the template
                if (targetEntityId && templateCollectionEntityIds.has(targetEntityId)) {
                    draftLinkedRecords.push({
                        recordId: relData.record._id,
                        recordTitle: relData.record.computedTitle || relData.record.title || '',
                        entityId: relData.entity._id,
                        entityName: relData.entity.name || '',
                        entityIcon: relData.entity.icon || '',
                        entityColor: relData.entity.color || '',
                        entitySlug: relData.entity.slug || '',
                        alias: relKey
                    });
                }
            }
            // Fallback: if no template-referenced relations found, add the first parent
            if (draftLinkedRecords.length === 1 && Object.keys(relatedRecordsMap).length > 0) {
                const firstRel = Object.entries(relatedRecordsMap)[0];
                if (firstRel) {
                    const [relKey, relData] = firstRel;
                    draftLinkedRecords.push({
                        recordId: relData.record._id,
                        recordTitle: relData.record.computedTitle || relData.record.title || '',
                        entityId: relData.entity._id,
                        entityName: relData.entity.name || '',
                        entityIcon: relData.entity.icon || '',
                        entityColor: relData.entity.color || '',
                        entitySlug: relData.entity.slug || '',
                        alias: relKey
                    });
                }
            }
        }

        // Also append any manually selected additional context records passed from the wizard
        if (typeof additionalRecordsLoaded !== 'undefined' && additionalRecordsLoaded.length > 0) {
            for (const addRec of additionalRecordsLoaded) {
                if (draftLinkedRecords.some(lr => lr.recordId.toString() === addRec.record._id.toString())) continue;
                draftLinkedRecords.push({
                    recordId: addRec.record._id,
                    recordTitle: addRec.record.computedTitle || addRec.record.title || '',
                    entityId: addRec.entity._id,
                    entityName: addRec.entity.name || '',
                    entityIcon: addRec.entity.icon || '',
                    entityColor: addRec.entity.color || '',
                    entitySlug: addRec.entity.slug || '',
                    alias: addRec.entity.slug || ''
                });
            }
        }

        const draftDoc = new Document({
            name: outputName,
            pages: draftPages,
            headerHtml: resolvedHeaderHtml,
            footerHtml: resolvedFooterHtml,
            format: docTemplate.format || 'A4',
            orientation: docTemplate.orientation || 'portrait',
            margins: docTemplate.margins || { top: 40, right: 40, bottom: 40, left: 40 },
            dimensions: docTemplate.dimensions || { width: 794, height: 1123 },
            isTemplate: false,
            isDraft: true,               // Legacy flag
            draftSourceTemplateId: smartDocTemplate._id,
            draftRecordId: req.body.recordId,
            draftOutputName: outputName,
            draftOutputFormat: smartDocTemplate.outputFormat || 'pdf',
            // New structured metadata (v2)
            generatedFrom: {
                templateId: docTemplate._id,
                smartDocId: smartDocTemplate._id,
                templateName: smartDocTemplate.name || docTemplate.name || '',
                generatedAt: new Date()
            },
            linkedRecords: draftLinkedRecords,
            status: 'draft',
            createdBy: req.user?._id,
            createdAt: new Date()
        });

        await draftDoc.save();

        // 9b. Copy DocumentLines from the source record to the draft document
        //     This populates the interactive treatment table with existing data
        if (DocumentLine && recordLines.length > 0) {
            const lineCopies = recordLines.map((line, i) => ({
                documentId: draftDoc._id,
                schemaId: line.schemaId,
                lineType: line.lineType || 'treatment',
                values: { ...(line.values || {}) },
                computed: { ...(line.computed || {}) },
                order: line.order != null ? line.order : i,
                createdBy: req.user?._id,
                createdAt: new Date(),
                updatedAt: new Date()
            }));
            // Only copy non-empty lines (filter out empty trailing rows)
            const validCopies = lineCopies.filter(l => {
                if (!l.values) return false;
                return Object.values(l.values).some(v =>
                    v !== null && v !== undefined && v !== '' &&
                    !(Array.isArray(v) && v.length === 0)
                );
            });
            if (validCopies.length > 0) {
                await DocumentLine.insertMany(validCopies);
                console.log(`[SmartDoc] Copied ${validCopies.length} DocumentLines to draft ${draftDoc._id}`);
            }
        }

        console.log(`[SmartDoc] Draft created: ${draftDoc._id} from template "${smartDocTemplate.name}" for record ${req.body.recordId}`);

        res.json({
            success: true,
            draftDocumentId: draftDoc._id.toString(),
            outputName
        });

    } catch (error) {
        console.error('[SmartDoc] Generate-draft error:', error);
        res.status(500).json({ error: error.message || 'Erreur lors de la creation du brouillon' });
    }
});

/**
 * POST /api/smartdoc/finalize-draft/:draftDocId
 * Takes the draft document (possibly edited by user), generates PDF/HTML,
 * attaches it to the record, and deletes the draft document.
 * 
 * Body:
 *   - recordId: ID of the record to attach the file to
 */
router.post('/smartdoc/finalize-draft/:draftDocId', async (req, res) => {
    try {
        const Document = await tenantCollection(req, 'Document');
        const Record = await tenantCollection(req, 'Record');

        // 1. Load the draft document
        const draftDoc = await Document.findById(req.params.draftDocId);
        if (!draftDoc) {
            return res.status(404).json({ error: 'Document brouillon introuvable' });
        }
        console.log(`[SmartDoc] Finalizing draft ${draftDoc._id} | name: "${draftDoc.name}" | recordId: ${draftDoc.draftRecordId || 'NONE'}`);

        // 2. Try to load the record (optional — may be null for Docs Hub context-free generation)
        const recordId = req.body.recordId || draftDoc.draftRecordId || (draftDoc.linkedRecords && draftDoc.linkedRecords.length > 0 ? draftDoc.linkedRecords[0].recordId : null);
        let record = null;
        if (recordId) {
            record = await Record.findById(recordId);
            if (!record) {
                console.warn(`[SmartDoc] Record ${recordId} not found — proceeding as standalone document`);
            }
        }

        // 3. Load DocumentLines for the draft (interactive table data) and resolve dynamic tables
        let draftLines = [];
        let lineSchemas = {};
        try {
            const DocumentLine = await tenantCollection(req, 'DocumentLine');
            const LineSchema = await tenantCollection(req, 'LineSchema');
            if (DocumentLine && LineSchema) {
                draftLines = await DocumentLine.find({ documentId: draftDoc._id }).sort({ order: 1 }).lean();
                const schemaIds = [...new Set(draftLines.map(l => l.schemaId).filter(Boolean))];
                if (schemaIds.length > 0) {
                    const schemas = await LineSchema.find({ _id: { $in: schemaIds } }).lean();
                    for (const s of schemas) lineSchemas[s._id.toString()] = s;
                }
                // Pre-resolve relation values (ObjectId -> record title)
                draftLines = await resolveRelationValues(draftLines, lineSchemas, Record);
            }
        } catch (e) {
            console.warn('[SmartDoc] Finalize: Could not load draft lines:', e.message);
        }

        // 3b. Build per-page HTML matching editor layout pixel-perfectly
        // CRITICAL: Prefer pagesContent from the request body (live DOM from the React editor)
        // over draftDoc.pages from MongoDB. The contenteditable is uncontrolled — user edits
        // only exist in the DOM until explicitly saved. Without this, the PDF is generated from
        // the stale initial draft content (just resolved tokens), ignoring all user edits.
        const domPagesContent = Array.isArray(req.body.pagesContent) ? req.body.pagesContent : null;
        const docMargins = draftDoc.margins || { top: 40, right: 40, bottom: 40, left: 40 };
        const docDims = draftDoc.dimensions || { width: 794, height: 1123 };
        const hasHeader = !!(draftDoc.headerHtml && draftDoc.headerHtml.trim());
        const hasFooter = !!(draftDoc.footerHtml && draftDoc.footerHtml.trim());
        // Match editor: reduce content padding when header/footer present
        const contentPaddingTop = hasHeader ? 8 : docMargins.top;
        const contentPaddingBottom = hasFooter ? 8 : docMargins.bottom;

        let pagesHtml = '';
        if (draftDoc.pages && draftDoc.pages.length > 0) {
            for (let i = 0; i < draftDoc.pages.length; i++) {
                const page = draftDoc.pages[i];
                let pageContent = '';

                if (domPagesContent && domPagesContent[i] !== undefined) {
                    // Use live DOM content from React editor — this is what the user sees
                    pageContent = domPagesContent[i] || '';
                    // Still resolve dynamic tables in the DOM content (interactive tables may have been added)
                    pageContent = resolveDynamicTables(pageContent, draftLines, lineSchemas);
                } else if (page.content) {
                    // Fallback: DB content (only if no DOM content was sent)
                    pageContent = resolveDynamicTables(page.content, draftLines, lineSchemas);
                }

                if (page.elements) {
                    for (const el of page.elements) {
                        if (el.content && typeof el.content === 'object') {
                            if (el.content.text) pageContent += el.content.text;
                            if (el.content.html) pageContent += el.content.html;
                        }
                    }
                }
                const isLastPage = i === draftDoc.pages.length - 1;
                pagesHtml += `<div class="doc-page" ${!isLastPage ? 'style="page-break-after: always;"' : ''}>`;
                if (hasHeader) {
                    pagesHtml += `<div class="doc-header" style="padding: ${docMargins.top}px ${docMargins.right}px 0 ${docMargins.left}px;">${draftDoc.headerHtml}</div>`;
                }
                pagesHtml += `<div class="doc-content" style="padding: ${contentPaddingTop}px ${docMargins.right}px ${contentPaddingBottom}px ${docMargins.left}px;">${pageContent}</div>`;
                if (hasFooter) {
                    pagesHtml += `<div class="doc-footer" style="padding: 0 ${docMargins.right}px ${docMargins.bottom}px ${docMargins.left}px;">${draftDoc.footerHtml}</div>`;
                }
                pagesHtml += `</div>`;
            }
        }

        const appUrl = process.env.APP_URL || 'http://localhost:3000';
        const baseUrl = appUrl.endsWith('/') ? appUrl : appUrl + '/';

        const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <base href="${baseUrl}">
    <link rel="stylesheet" href="themes/default/assets/css/style.css">
    <link rel="stylesheet" href="css/app/main.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = { darkMode: 'class' };
    </script>
    <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
    <style>
        @page {
            margin: 0;
            size: ${docDims.width}px ${docDims.height}px;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: 'Inter', system-ui, -apple-system, sans-serif; 
            font-size: 12pt; 
            line-height: 1.6;
            color: #000000;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        /* Tailwind Preflight resets — match editor environment */
        p, h1, h2, h3, h4, h5, h6, blockquote, pre, ul, ol, figure, hr { margin: 0; }
        h1, h2, h3, h4, h5, h6 { font-size: inherit; font-weight: inherit; }
        
        /* Base typography matching the React Document Editor */
        h1 { font-size: 2em !important; font-weight: bold !important; margin-top: 0.67em !important; margin-bottom: 0.67em !important; line-height: 1.2 !important; color: #000000 !important; }
        h2 { font-size: 1.5em !important; font-weight: bold !important; margin-top: 0.83em !important; margin-bottom: 0.83em !important; line-height: 1.3 !important; color: #000000 !important; }
        h3 { font-size: 1.17em !important; font-weight: bold !important; margin-top: 1em !important; margin-bottom: 1em !important; line-height: 1.4 !important; color: #000000 !important; }
        p { margin-top: 0 !important; margin-bottom: 0 !important; line-height: 1.6 !important; }
        ul { list-style-type: disc !important; padding-left: 40px !important; }
        ol { list-style-type: decimal !important; padding-left: 40px !important; }
        blockquote { border-left: 4px solid #cbd5e1 !important; margin: 1em 0 !important; padding-left: 1em !important; color: #475569 !important; }
        
        img, svg { display: block; max-width: 100%; }
        .doc-page {
            width: ${docDims.width}px;
            height: ${docDims.height}px;
            min-height: ${docDims.height}px;
            max-height: ${docDims.height}px;
            background: #ffffff;
            position: relative;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-sizing: border-box;
            page-break-inside: avoid;
            page-break-after: always;
        }
        .doc-header, .doc-footer {
            flex-shrink: 0;
            user-select: none;
            box-sizing: border-box;
        }
        .doc-content {
            flex: 1;
            min-height: 0;
            overflow: hidden;
            word-wrap: break-word;
            overflow-wrap: break-word;
            box-sizing: border-box;
            line-height: 1.6;
        }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: 600; }
    </style>
</head>
<body>
${pagesHtml}
</body>
</html>`;

        // 4. Generate output file
        const outputName = draftDoc.draftOutputName || draftDoc.name || 'Document';
        const outputFormat = draftDoc.draftOutputFormat || 'pdf';
        let savedFilename;
        let savedSize;
        const outputDir = path.join(__dirname, '../../private_uploads/attachments', String(req.account_number));
        fs.mkdirSync(outputDir, { recursive: true });

        if (outputFormat === 'pdf' || outputFormat === 'both') {
            const pdfFilename = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.pdf';
            const pdfPath = path.join(outputDir, pdfFilename);
            try {
                await generatePDF(fullHtml, pdfPath, draftDoc);
                savedFilename = pdfFilename;
                savedSize = fs.statSync(pdfPath).size;
                console.log(`[SmartDoc] PDF generated: ${pdfFilename} (${savedSize} bytes)`);
            } catch (pdfErr) {
                console.error('[SmartDoc] PDF generation error:', pdfErr);
                const htmlFilename = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.html';
                const htmlPath = path.join(outputDir, htmlFilename);
                fs.writeFileSync(htmlPath, fullHtml, 'utf8');
                savedFilename = htmlFilename;
                savedSize = fs.statSync(htmlPath).size;
            }
        } else {
            const htmlFilename = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.html';
            const htmlPath = path.join(outputDir, htmlFilename);
            fs.writeFileSync(htmlPath, fullHtml, 'utf8');
            savedFilename = htmlFilename;
            savedSize = fs.statSync(htmlPath).size;
        }

        // 5. Resolve template name for metadata
        let generatedFromName = 'Document genere';
        try {
            if (draftDoc.draftSourceTemplateId) {
                const SmartDocTemplate = await tenantCollection(req, 'SmartDocTemplate');
                const tpl = await SmartDocTemplate.findById(draftDoc.draftSourceTemplateId);
                if (tpl) generatedFromName = tpl.name;
            }
        } catch(e) {}

        // ── PATH A: Record exists → save as record attachment (original behavior) ───
        // ── PATH B: No record → convert draft to standalone finalized document ──────
        let responsePayload;

        if (record) {
            // PATH A: Save as record attachment
            const newAttachment = {
                filename: savedFilename,
                originalName: outputName + (savedFilename.endsWith('.pdf') ? '.pdf' : '.html'),
                mimeType: savedFilename.endsWith('.pdf') ? 'application/pdf' : 'text/html',
                size: savedSize,
                category: 'pdf',
                isGenerated: true,
                generatedFrom: (draftDoc.draftSourceTemplateId || '').toString(),
                generatedFromName: generatedFromName,
                uploadedAt: new Date(),
                uploadedBy: req.user?._id
            };

            record.attachments = record.attachments || [];
            record.attachments.push(newAttachment);
            await record.save();

            const addedAttachment = record.attachments[record.attachments.length - 1];

            // Delete draft
            try {
                const DocumentLine = await tenantCollection(req, 'DocumentLine');
                if (DocumentLine) {
                    await DocumentLine.deleteMany({ documentId: draftDoc._id });
                }
            } catch (e) { /* non-critical */ }
            await Document.findByIdAndDelete(draftDoc._id);
            console.log(`[SmartDoc] Draft ${draftDoc._id} finalized as record attachment and deleted`);

            responsePayload = {
                success: true,
                mode: 'record-attachment',
                attachment: {
                    _id: addedAttachment._id,
                    ...newAttachment,
                    url: `/account/${req.account_number}/uploads/attachments/${savedFilename}`,
                    sizeFormatted: formatSize(savedSize)
                },
                outputName
            };
        } else {
            // PATH B: No record — convert draft to a standalone finalized document
            // Instead of deleting the draft, convert it to a finalized document with file metadata.
            // This allows it to appear in the "Générés" tab of the Docs Hub.
            draftDoc.isDraft = false;
            draftDoc.status = 'finalized';
            draftDoc.generatedFile = {
                filename: savedFilename,
                originalName: outputName + (savedFilename.endsWith('.pdf') ? '.pdf' : '.html'),
                mimeType: savedFilename.endsWith('.pdf') ? 'application/pdf' : 'text/html',
                size: savedSize,
                generatedAt: new Date(),
                generatedBy: req.user?._id,
                generatedFromName: generatedFromName,
                downloadUrl: `/account/${req.account_number}/uploads/attachments/${savedFilename}`
            };
            await draftDoc.save();
            console.log(`[SmartDoc] Draft ${draftDoc._id} finalized as standalone document (no record)`);

            responsePayload = {
                success: true,
                mode: 'standalone-document',
                attachment: {
                    _id: draftDoc._id,
                    filename: savedFilename,
                    originalName: outputName + (savedFilename.endsWith('.pdf') ? '.pdf' : '.html'),
                    url: `/account/${req.account_number}/uploads/attachments/${savedFilename}`,
                    sizeFormatted: formatSize(savedSize)
                },
                outputName
            };
        }

        res.json(responsePayload);

    } catch (error) {
        console.error('[SmartDoc] Finalize-draft error:', error);
        res.status(500).json({ error: error.message || 'Erreur lors de la finalisation' });
    }
});

/**
 * DELETE /api/smartdoc/draft/:draftDocId
 * Cancel and delete a draft document without generating anything
 */
router.delete('/smartdoc/draft/:draftDocId', async (req, res) => {
    try {
        const Document = await tenantCollection(req, 'Document');
        const result = await Document.findByIdAndDelete(req.params.draftDocId);
        if (!result) {
            return res.status(404).json({ error: 'Document brouillon introuvable' });
        }
        console.log(`[SmartDoc] Draft ${req.params.draftDocId} cancelled and deleted`);
        res.json({ success: true });
    } catch (error) {
        console.error('[SmartDoc] Delete draft error:', error);
        res.status(500).json({ error: error.message || 'Erreur' });
    }
});

// ============================================================================
// Helpers
// ============================================================================

function hasMeaningfulGridValue(value, depth = 0) {
    if (value === null || value === undefined) return false;
    if (typeof value === 'number') return !Number.isNaN(value);
    if (typeof value === 'boolean') return true;
    if (typeof value === 'string') return value.trim() !== '';
    if (value instanceof Date) return !Number.isNaN(value.getTime());
    if (Array.isArray(value)) return value.some(v => hasMeaningfulGridValue(v, depth + 1));
    if (typeof value === 'object') {
        if (depth > 5) return false;
        const keys = Object.keys(value);
        if (keys.length === 0) return false;
        return keys.some(k => hasMeaningfulGridValue(value[k], depth + 1));
    }
    return false;
}

function isFilledGridLine(line) {
    if (!line || typeof line !== 'object') return false;
    return hasMeaningfulGridValue(line.values) || hasMeaningfulGridValue(line.computed);
}

function resolveSnapshotTargetRecordId(schema, record) {
    const fallback = record?._id ? String(record._id) : '';
    const cfg = schema?.snapshotConfig || {};

    if (cfg.targetType === 'relation' && cfg.targetRelationKey && Array.isArray(record?.relations)) {
        const relation = record.relations.find(r => r && r.relationKey === cfg.targetRelationKey);
        const related = Array.isArray(relation?.value) ? relation.value[0] : relation?.value;
        if (related && mongoose.Types.ObjectId.isValid(String(related))) {
            return String(related);
        }
    }

    return fallback;
}

function decodeHtmlDataTableValue(rawValue) {
    return String(rawValue || '')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'");
}

function normalizeSchemaIdValue(value) {
    if (!value) return '';
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'object') {
        if (value.$oid) return String(value.$oid).trim();
        if (value._id) return String(value._id).trim();
        if (value.id) return String(value.id).trim();
    }
    return String(value).trim();
}

function extractDynamicTableSchemaIdsFromHtml(html, schemaSet) {
    if (!html || !schemaSet) return;

    const attrRegex = /data-table=(['"])([\s\S]*?)\1/gi;
    let match;
    while ((match = attrRegex.exec(html)) !== null) {
        try {
            const decoded = decodeHtmlDataTableValue(match[2]);
            const config = JSON.parse(decoded);
            const schemaId = normalizeSchemaIdValue(config?.schemaId);
            if (schemaId && mongoose.Types.ObjectId.isValid(schemaId)) {
                schemaSet.add(schemaId);
            }
            if (Array.isArray(config?.schemaIds)) {
                for (const rawId of config.schemaIds) {
                    const id = normalizeSchemaIdValue(rawId);
                    if (id && mongoose.Types.ObjectId.isValid(id)) {
                        schemaSet.add(id);
                    }
                }
            }
        } catch (e) {
            // ignore malformed placeholder config
        }
    }
}

function extractDynamicTableSchemaIdsFromDocument(docTemplate) {
    const schemaSet = new Set();
    if (!docTemplate) return [];

    if (docTemplate.headerHtml) extractDynamicTableSchemaIdsFromHtml(docTemplate.headerHtml, schemaSet);
    if (docTemplate.footerHtml) extractDynamicTableSchemaIdsFromHtml(docTemplate.footerHtml, schemaSet);

    for (const page of (docTemplate.pages || [])) {
        if (page?.content) extractDynamicTableSchemaIdsFromHtml(page.content, schemaSet);
        for (const row of (page?.rows || [])) {
            for (const col of (row?.columns || [])) {
                for (const block of (col?.blocks || [])) {
                    if (block?.content) extractDynamicTableSchemaIdsFromHtml(block.content, schemaSet);
                    if (block?.html) extractDynamicTableSchemaIdsFromHtml(block.html, schemaSet);
                }
            }
        }
    }

    return [...schemaSet];
}

function resolveDynamicTableSchemaAndLines(config, lineSchemas, recordLines) {
    const schemaMap = lineSchemas || {};
    const lines = Array.isArray(recordLines) ? recordLines : [];

    const allSchemaEntries = Object.entries(schemaMap);
    const allSchemas = allSchemaEntries.map(([, schema]) => schema).filter(Boolean);

    const requestedSchemaIds = [];
    const primaryId = normalizeSchemaIdValue(config?.schemaId);
    if (primaryId) requestedSchemaIds.push(primaryId);
    if (Array.isArray(config?.schemaIds)) {
        for (const rawId of config.schemaIds) {
            const id = normalizeSchemaIdValue(rawId);
            if (id) requestedSchemaIds.push(id);
        }
    }
    const uniqueRequestedIds = [...new Set(requestedSchemaIds)];

    const linesBySchemaId = {};
    for (const line of lines) {
        const sid = normalizeSchemaIdValue(line?.schemaId);
        if (!sid) continue;
        if (!linesBySchemaId[sid]) linesBySchemaId[sid] = [];
        linesBySchemaId[sid].push(line);
    }

    let chosenSchema = null;
    let chosenSchemaId = '';

    for (const sid of uniqueRequestedIds) {
        if (schemaMap[sid]) {
            chosenSchema = schemaMap[sid];
            chosenSchemaId = sid;
            break;
        }
    }

    const wantedName = config?.schemaName ? String(config.schemaName).trim().toLowerCase() : '';
    if (!chosenSchema && wantedName) {
        for (const [sid, schema] of allSchemaEntries) {
            if (String(schema?.name || '').trim().toLowerCase() === wantedName) {
                chosenSchema = schema;
                chosenSchemaId = sid;
                break;
            }
        }
    }

    if (!chosenSchema && allSchemas.length === 1) {
        chosenSchema = allSchemas[0];
        chosenSchemaId = normalizeSchemaIdValue(chosenSchema?._id);
    }

    if (!chosenSchema) return { schema: null, lines: [] };

    let selectedLines = [];
    const directId = chosenSchemaId || normalizeSchemaIdValue(chosenSchema?._id);
    if (directId && linesBySchemaId[directId]) {
        selectedLines = linesBySchemaId[directId];
    }

    if (selectedLines.length === 0 && wantedName) {
        const matchingSchemaIdsByName = allSchemaEntries
            .filter(([, schema]) => String(schema?.name || '').trim().toLowerCase() === wantedName)
            .map(([sid]) => sid);

        for (const sid of matchingSchemaIdsByName) {
            if (linesBySchemaId[sid] && linesBySchemaId[sid].length > 0) {
                selectedLines = linesBySchemaId[sid];
                if (!chosenSchema || normalizeSchemaIdValue(chosenSchema?._id) !== sid) {
                    chosenSchema = schemaMap[sid] || chosenSchema;
                }
                break;
            }
        }
    }

    if (selectedLines.length === 0 && uniqueRequestedIds.length > 0) {
        for (const sid of uniqueRequestedIds) {
            if (linesBySchemaId[sid] && linesBySchemaId[sid].length > 0) {
                selectedLines = linesBySchemaId[sid];
                break;
            }
        }
    }

    // Fallback: if requested schema has no lines, reuse lines from the closest schema
    // by column-key similarity (useful when template points to legacy schemaId).
    if (selectedLines.length === 0 && chosenSchema) {
        const chosenKeys = new Set((chosenSchema.columns || []).map(c => c?.key).filter(Boolean));
        let bestSid = '';
        let bestScore = 0;
        let bestLineCount = 0;

        for (const sid of Object.keys(linesBySchemaId)) {
            const candLines = linesBySchemaId[sid] || [];
            if (candLines.length === 0) continue;

            const candSchema = schemaMap[sid];
            const candKeys = new Set((candSchema?.columns || []).map(c => c?.key).filter(Boolean));
            let overlap = 0;
            for (const key of candKeys) {
                if (chosenKeys.has(key)) overlap++;
            }

            // Prefer stronger overlap, then more available lines
            if (
                overlap > bestScore ||
                (overlap === bestScore && candLines.length > bestLineCount)
            ) {
                bestScore = overlap;
                bestSid = sid;
                bestLineCount = candLines.length;
            }
        }

        if (bestSid && bestScore > 0) {
            selectedLines = linesBySchemaId[bestSid];
        }
    }

    if (selectedLines.length === 0) {
        const schemaIdsWithLines = Object.keys(linesBySchemaId);
        if (schemaIdsWithLines.length === 1) {
            const sid = schemaIdsWithLines[0];
            selectedLines = linesBySchemaId[sid];
            if (schemaMap[sid]) chosenSchema = schemaMap[sid];
        }
    }

    return { schema: chosenSchema, lines: selectedLines };
}

async function loadRecordLinesWithSnapshotFallback({ DocumentLine, LineSchema, GridSnapshot, record, entityId, extraSchemaIds = [] }) {
    const empty = { recordLines: [], lineSchemas: {} };
    if (!DocumentLine || !LineSchema || !record?._id) return empty;

    const recordId = record._id;
    const currentLines = await DocumentLine.find({ documentId: recordId }).sort({ order: 1 }).lean();

    const schemaIdsFromCurrent = [...new Set(
        currentLines
            .map(l => (l?.schemaId ? String(l.schemaId) : ''))
            .filter(Boolean)
    )];
    const schemaIdsFromTemplate = [...new Set(
        (extraSchemaIds || [])
            .map(id => String(id || '').trim())
            .filter(id => mongoose.Types.ObjectId.isValid(id))
    )];

    let entitySchemas = [];
    if (entityId) {
        entitySchemas = await LineSchema.find({ 'appliesTo.entityIds': entityId }).lean();
    }

    const lineSchemas = {};
    for (const s of entitySchemas) {
        lineSchemas[String(s._id)] = s;
    }

    const entitySchemaIds = entitySchemas.map(s => String(s._id));
    const wantedSchemaIds = [...new Set([...schemaIdsFromCurrent, ...schemaIdsFromTemplate])];
    const missingSchemaIds = wantedSchemaIds.filter(id => !lineSchemas[id]);
    if (missingSchemaIds.length > 0) {
        const missingSchemas = await LineSchema.find({ _id: { $in: missingSchemaIds } }).lean();
        for (const s of missingSchemas) {
            lineSchemas[String(s._id)] = s;
        }
    }

    const allSchemaIds = [...new Set([...entitySchemaIds, ...schemaIdsFromCurrent, ...schemaIdsFromTemplate])];
    const linesBySchema = {};
    for (const line of currentLines) {
        const schemaId = line?.schemaId ? String(line.schemaId) : '';
        if (!schemaId) continue;
        if (!linesBySchema[schemaId]) linesBySchema[schemaId] = [];
        linesBySchema[schemaId].push(line);
    }

    const finalLines = [];
    const fallbackSchemaIds = [];

    for (const schemaId of allSchemaIds) {
        const schemaLines = linesBySchema[schemaId] || [];
        if (schemaLines.some(isFilledGridLine)) {
            finalLines.push(...schemaLines);
        } else {
            fallbackSchemaIds.push(schemaId);
        }
    }

    if (GridSnapshot && fallbackSchemaIds.length > 0) {
        const fallbackSnapshots = await Promise.all(
            fallbackSchemaIds.map(async (schemaId) => {
                const schema = lineSchemas[schemaId];
                const targetRecordId = resolveSnapshotTargetRecordId(schema, record);
                const query = { schemaId };
                if (targetRecordId && mongoose.Types.ObjectId.isValid(targetRecordId)) {
                    query.targetRecordId = targetRecordId;
                } else {
                    query.recordId = recordId;
                }
                const snapshot = await GridSnapshot.findOne(query)
                    .sort({ date: -1, createdAt: -1 })
                    .lean();
                return { schemaId, snapshot };
            })
        );

        for (const item of fallbackSnapshots) {
            if (!item?.snapshot || !Array.isArray(item.snapshot.lines) || item.snapshot.lines.length === 0) continue;
            if (!item.snapshot.lines.some(isFilledGridLine)) continue;

            const mapped = item.snapshot.lines
                .slice()
                .sort((a, b) => (a?.order || 0) - (b?.order || 0))
                .map((line, index) => ({
                    schemaId: item.schemaId,
                    lineType: line?.lineType || 'product',
                    values: { ...(line?.values || {}) },
                    computed: { ...(line?.computed || {}) },
                    order: line?.order != null ? line.order : index
                }));

            finalLines.push(...mapped);
        }
    }

    finalLines.sort((a, b) => {
        const aSchema = a?.schemaId ? String(a.schemaId) : '';
        const bSchema = b?.schemaId ? String(b.schemaId) : '';
        if (aSchema === bSchema) return (a?.order || 0) - (b?.order || 0);
        return 0;
    });

    return { recordLines: finalLines, lineSchemas };
}

/**
 * Build token context from record + entity data (shared between generate and generate-draft)
 */
function buildTokenContext(record, entity, inputs, relatedRecordsMap, user) {
    const context = {
        title: record.title || '',
        computedTitle: record.computedTitle || record.title || '',
        description: record.description || '',
        slug: record.slug || '',
        date: record.date ? formatDate(record.date) : '',
        createdAt: record.createdAt ? formatDate(record.createdAt) : '',
        updatedAt: record.updatedAt ? formatDate(record.updatedAt) : '',
        ...extractCustomFields(record, entity),
        ...inputs,
        today: formatDate(new Date()),
        currentYear: new Date().getFullYear().toString(),
        currentMonth: formatDate(new Date(), 'month'),
        currentTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        user: {
            name: user ? (user.name || user.fullName || user.email || '') : '',
            email: user ? (user.email || '') : ''
        }
    };

    if (entity && entity.slug) {
        const entityContext = {
            title: record.title || '',
            computedTitle: record.computedTitle || record.title || '',
            description: record.description || '',
            slug: record.slug || '',
            date: record.date ? formatDate(record.date) : '',
            createdAt: record.createdAt ? formatDate(record.createdAt) : '',
            updatedAt: record.updatedAt ? formatDate(record.updatedAt) : '',
            ...extractCustomFields(record, entity)
        };

        if (record.classificationValues && record.classificationValues.length > 0) {
            const classifContext = {};
            const allClassifs = [
                ...(entity.statusClassification ? [entity.statusClassification] : []),
                ...(entity.classifications || [])
            ];
            for (const cv of record.classificationValues) {
                const classifDef = allClassifs.find(c => c && c._id && c._id.toString() === cv.classificationId?.toString());
                if (classifDef && classifDef.key) {
                    classifContext[classifDef.key] = cv.label || '';
                }
                if (cv.classificationId) {
                    classifContext[cv.classificationId.toString()] = cv.label || '';
                }
            }
            entityContext.classification = classifContext;
        }

        if (entity.relations && relatedRecordsMap) {
            for (const rel of entity.relations) {
                const targetEntity = rel.targetEntity;
                if (!targetEntity || typeof targetEntity !== 'object') continue;
                const relData = relatedRecordsMap[rel.key];
                if (relData && relData.record) {
                    const relRecord = relData.record;
                    const relEntityDef = relData.entity;
                    const relContext = {
                        title: relRecord.title || '',
                        computedTitle: relRecord.computedTitle || relRecord.title || '',
                        description: relRecord.description || '',
                        createdAt: relRecord.createdAt ? formatDate(relRecord.createdAt) : '',
                        updatedAt: relRecord.updatedAt ? formatDate(relRecord.updatedAt) : '',
                        ...extractCustomFields(relRecord, relEntityDef)
                    };
                    if (relRecord.classificationValues && relRecord.classificationValues.length > 0) {
                        const relClassifContext = {};
                        const relAllClassifs = [
                            ...(relEntityDef.statusClassification ? [relEntityDef.statusClassification] : []),
                            ...(relEntityDef.classifications || [])
                        ];
                        for (const cv of relRecord.classificationValues) {
                            const classifDef = relAllClassifs.find(c => c && c._id && c._id.toString() === cv.classificationId?.toString());
                            if (classifDef && classifDef.key) {
                                relClassifContext[classifDef.key] = cv.label || '';
                            }
                        }
                        relContext.classification = relClassifContext;
                    }
                    entityContext[targetEntity.slug] = relContext;
                }
            }
        }

        // Add custom relation fields data (e.g., Contact, Représentant)
        if (entity.customFields && relatedRecordsMap) {
            for (const cfDef of entity.customFields) {
                if (!cfDef || cfDef.type !== 'relation') continue;
                const fieldId = cfDef._id.toString();
                const fieldName = cfDef.name || cfDef.label?.toLowerCase().replace(/\s+/g, '_') || fieldId;

                const relData = relatedRecordsMap[fieldId];
                if (relData && relData.record) {
                    const relRecord = relData.record;
                    const relEntityDef = relData.entity;

                    const relContext = {
                        title: relRecord.title || '',
                        computedTitle: relRecord.computedTitle || relRecord.title || '',
                        description: relRecord.description || '',
                        createdAt: relRecord.createdAt ? formatDate(relRecord.createdAt) : '',
                        updatedAt: relRecord.updatedAt ? formatDate(relRecord.updatedAt) : '',
                        ...extractCustomFields(relRecord, relEntityDef)
                    };

                    if (relRecord.classificationValues && relRecord.classificationValues.length > 0) {
                        const relClassifContext = {};
                        const relAllClassifs = [
                            ...(relEntityDef.statusClassification ? [relEntityDef.statusClassification] : []),
                            ...(relEntityDef.classifications || [])
                        ];
                        for (const cv of relRecord.classificationValues) {
                            const classifDef = relAllClassifs.find(c => c && c._id && c._id.toString() === cv.classificationId?.toString());
                            if (classifDef && classifDef.key) {
                                relClassifContext[classifDef.key] = cv.label || '';
                            }
                        }
                        relContext.classification = relClassifContext;
                    }

                    entityContext[fieldName] = relContext;
                }
            }
        }

        context[entity.slug] = entityContext;
    }

    // Mirror any nested relation contexts (e.g. context.opportunites.contacts) at the root level (e.g. context.contacts)
    for (const [entitySlug, entityContext] of Object.entries(context)) {
        if (entityContext && typeof entityContext === 'object' && !Array.isArray(entityContext)) {
            for (const [key, value] of Object.entries(entityContext)) {
                if (value && typeof value === 'object' && !Array.isArray(value) && key !== 'classification' && key !== 'user') {
                    if (!context[key]) {
                        context[key] = value;
                    }
                }
            }
        }
    }

    return context;
}

/**
 * Resolve document tokens by replacing {{token}} patterns with record data
 * Supports: flat keys, entity-scoped keys (entity.field), related entity keys,
 * classification values, user info, and system variables.
 */
function resolveDocumentTokens(docTemplate, record, entity, inputs, relatedRecordsMap, user) {
    // Build the token context
    const context = {
        // Standard record fields (flat, for backward compatibility)
        title: record.title || '',
        computedTitle: record.computedTitle || record.title || '',
        description: record.description || '',
        slug: record.slug || '',
        date: record.date ? formatDate(record.date) : '',
        createdAt: record.createdAt ? formatDate(record.createdAt) : '',
        updatedAt: record.updatedAt ? formatDate(record.updatedAt) : '',

        // Custom fields (flat, for backward compatibility)
        ...extractCustomFields(record, entity),

        // SmartDoc inputs
        ...inputs,

        // Computed values
        today: formatDate(new Date()),
        currentYear: new Date().getFullYear().toString(),
        currentMonth: formatDate(new Date(), 'month'),
        currentTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),

        // User info
        user: {
            name: user ? (user.name || user.fullName || user.email || '') : '',
            email: user ? (user.email || '') : ''
        }
    };

    // Entity-scoped variables: entity.slug.fieldName
    if (entity && entity.slug) {
        const entityContext = {
            title: record.title || '',
            computedTitle: record.computedTitle || record.title || '',
            description: record.description || '',
            slug: record.slug || '',
            date: record.date ? formatDate(record.date) : '',
            createdAt: record.createdAt ? formatDate(record.createdAt) : '',
            updatedAt: record.updatedAt ? formatDate(record.updatedAt) : '',
            ...extractCustomFields(record, entity)
        };

        // Add classification values for the entity
        if (record.classificationValues && record.classificationValues.length > 0) {
            const classifContext = {};
            // Build lookup of classification key by ID
            const allClassifs = [
                ...(entity.statusClassification ? [entity.statusClassification] : []),
                ...(entity.classifications || [])
            ];
            for (const cv of record.classificationValues) {
                const classifDef = allClassifs.find(c => c && c._id && c._id.toString() === cv.classificationId?.toString());
                if (classifDef && classifDef.key) {
                    classifContext[classifDef.key] = cv.label || '';
                }
                // Also map by classificationId for fallback
                if (cv.classificationId) {
                    classifContext[cv.classificationId.toString()] = cv.label || '';
                }
            }
            entityContext.classification = classifContext;
        }

        // Add related entity data
        if (entity.relations && relatedRecordsMap) {
            for (const rel of entity.relations) {
                const targetEntity = rel.targetEntity;
                if (!targetEntity || typeof targetEntity !== 'object') continue;

                const relData = relatedRecordsMap[rel.key];
                if (relData && relData.record) {
                    const relRecord = relData.record;
                    const relEntityDef = relData.entity;

                    // Build the related record's context
                    const relContext = {
                        title: relRecord.title || '',
                        computedTitle: relRecord.computedTitle || relRecord.title || '',
                        description: relRecord.description || '',
                        createdAt: relRecord.createdAt ? formatDate(relRecord.createdAt) : '',
                        updatedAt: relRecord.updatedAt ? formatDate(relRecord.updatedAt) : '',
                        ...extractCustomFields(relRecord, relEntityDef)
                    };

                    // Classification values of related record
                    if (relRecord.classificationValues && relRecord.classificationValues.length > 0) {
                        const relClassifContext = {};
                        const relAllClassifs = [
                            ...(relEntityDef.statusClassification ? [relEntityDef.statusClassification] : []),
                            ...(relEntityDef.classifications || [])
                        ];
                        for (const cv of relRecord.classificationValues) {
                            const classifDef = relAllClassifs.find(c => c && c._id && c._id.toString() === cv.classificationId?.toString());
                            if (classifDef && classifDef.key) {
                                relClassifContext[classifDef.key] = cv.label || '';
                            }
                        }
                        relContext.classification = relClassifContext;
                    }

                    // Mount under entity slug: e.g. consultations.patient = { title, nom, ... }
                    entityContext[targetEntity.slug] = relContext;
                }
            }
        }

        // Add custom relation fields data (e.g., Contact, Représentant)
        if (entity.customFields && relatedRecordsMap) {
            for (const cfDef of entity.customFields) {
                if (!cfDef || cfDef.type !== 'relation') continue;
                const fieldId = cfDef._id.toString();
                const fieldName = cfDef.name || cfDef.label?.toLowerCase().replace(/\s+/g, '_') || fieldId;

                const relData = relatedRecordsMap[fieldId];
                if (relData && relData.record) {
                    const relRecord = relData.record;
                    const relEntityDef = relData.entity;

                    const relContext = {
                        title: relRecord.title || '',
                        computedTitle: relRecord.computedTitle || relRecord.title || '',
                        description: relRecord.description || '',
                        createdAt: relRecord.createdAt ? formatDate(relRecord.createdAt) : '',
                        updatedAt: relRecord.updatedAt ? formatDate(relRecord.updatedAt) : '',
                        ...extractCustomFields(relRecord, relEntityDef)
                    };

                    // Classification values of related record
                    if (relRecord.classificationValues && relRecord.classificationValues.length > 0) {
                        const relClassifContext = {};
                        const relAllClassifs = [
                            ...(relEntityDef.statusClassification ? [relEntityDef.statusClassification] : []),
                            ...(relEntityDef.classifications || [])
                        ];
                        for (const cv of relRecord.classificationValues) {
                            const classifDef = relAllClassifs.find(c => c && c._id && c._id.toString() === cv.classificationId?.toString());
                            if (classifDef && classifDef.key) {
                                relClassifContext[classifDef.key] = cv.label || '';
                            }
                        }
                        relContext.classification = relClassifContext;
                    }

                    // Mount under field name: e.g. entreprises.contact = { title, tel, email, ... }
                    entityContext[fieldName] = relContext;
                }
            }
        }

        context[entity.slug] = entityContext;
    }

    // Mirror any nested relation contexts (e.g. context.opportunites.contacts) at the root level (e.g. context.contacts)
    for (const [entitySlug, entityContext] of Object.entries(context)) {
        if (entityContext && typeof entityContext === 'object' && !Array.isArray(entityContext)) {
            for (const [key, value] of Object.entries(entityContext)) {
                if (value && typeof value === 'object' && !Array.isArray(value) && key !== 'classification' && key !== 'user') {
                    if (!context[key]) {
                        context[key] = value;
                    }
                }
            }
        }
    }

    // Resolve in content blocks, pages, etc.
    // Build per-page HTML with embedded margins matching editor layout
    const docMargins = docTemplate.margins || { top: 40, right: 40, bottom: 40, left: 40 };
    const docDims = docTemplate.dimensions || { width: 794, height: 1123 };
    const hasHeader = !!(docTemplate.headerHtml && docTemplate.headerHtml.trim());
    const hasFooter = !!(docTemplate.footerHtml && docTemplate.footerHtml.trim());
    const contentPaddingTop = hasHeader ? 8 : docMargins.top;
    const contentPaddingBottom = hasFooter ? 8 : docMargins.bottom;
    const resolvedHeader = hasHeader ? resolveTokensInString(docTemplate.headerHtml, context) : '';
    const resolvedFooter = hasFooter ? resolveTokensInString(docTemplate.footerHtml, context) : '';

    let pagesHtml = '';

    if (docTemplate.contentBlocks && docTemplate.contentBlocks.length > 0) {
        let blockHtml = '';
        for (const block of docTemplate.contentBlocks) {
            if (block.type === 'text' && block.html) {
                blockHtml += resolveTokensInString(block.html, context);
            } else if (block.type === 'divider') {
                blockHtml += '<hr style="margin: 10px 0; border-color: #e5e7eb; border-width: 1px 0 0;">';
            }
        }
        pagesHtml = `<div class="doc-page">`;
        if (hasHeader) pagesHtml += `<div class="doc-header" style="padding: ${docMargins.top}px ${docMargins.right}px 0 ${docMargins.left}px;">${resolvedHeader}</div>`;
        pagesHtml += `<div class="doc-content" style="padding: ${contentPaddingTop}px ${docMargins.right}px ${contentPaddingBottom}px ${docMargins.left}px;">${blockHtml}</div>`;
        if (hasFooter) pagesHtml += `<div class="doc-footer" style="padding: 0 ${docMargins.right}px ${docMargins.bottom}px ${docMargins.left}px;">${resolvedFooter}</div>`;
        pagesHtml += `</div>`;
    } else if (docTemplate.pages && docTemplate.pages.length > 0) {
        for (let i = 0; i < docTemplate.pages.length; i++) {
            const page = docTemplate.pages[i];
            let pageContent = '';
            if (page.content) {
                pageContent += resolveTokensInString(page.content, context);
            }
            if (page.elements) {
                for (const el of page.elements) {
                    if (el.content && typeof el.content === 'object') {
                        if (el.content.text) pageContent += resolveTokensInString(el.content.text, context);
                        if (el.content.html) pageContent += resolveTokensInString(el.content.html, context);
                    }
                }
            }
            const isLastPage = i === docTemplate.pages.length - 1;
            pagesHtml += `<div class="doc-page" ${!isLastPage ? 'style="page-break-after: always;"' : ''}>`;
            if (hasHeader) pagesHtml += `<div class="doc-header" style="padding: ${docMargins.top}px ${docMargins.right}px 0 ${docMargins.left}px;">${resolvedHeader}</div>`;
            pagesHtml += `<div class="doc-content" style="padding: ${contentPaddingTop}px ${docMargins.right}px ${contentPaddingBottom}px ${docMargins.left}px;">${pageContent}</div>`;
            if (hasFooter) pagesHtml += `<div class="doc-footer" style="padding: 0 ${docMargins.right}px ${docMargins.bottom}px ${docMargins.left}px;">${resolvedFooter}</div>`;
            pagesHtml += `</div>`;
        }
    }

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const baseUrl = appUrl.endsWith('/') ? appUrl : appUrl + '/';

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <base href="${baseUrl}">
    <link rel="stylesheet" href="themes/default/assets/css/style.css">
    <link rel="stylesheet" href="css/app/main.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = { darkMode: 'class' };
    </script>
    <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
    <style>
        @page {
            margin: 0;
            size: ${docDims.width}px ${docDims.height}px;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: 'Inter', system-ui, -apple-system, sans-serif; 
            font-size: 12pt; 
            line-height: 1.6;
            color: #000000;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        /* Tailwind Preflight resets — match editor environment */
        p, h1, h2, h3, h4, h5, h6, blockquote, pre, ul, ol, figure, hr { margin: 0; }
        h1, h2, h3, h4, h5, h6 { font-size: inherit; font-weight: inherit; }
        
        /* Base typography matching the React Document Editor */
        h1 { font-size: 2em !important; font-weight: bold !important; margin-top: 0.67em !important; margin-bottom: 0.67em !important; line-height: 1.2 !important; color: #000000 !important; }
        h2 { font-size: 1.5em !important; font-weight: bold !important; margin-top: 0.83em !important; margin-bottom: 0.83em !important; line-height: 1.3 !important; color: #000000 !important; }
        h3 { font-size: 1.17em !important; font-weight: bold !important; margin-top: 1em !important; margin-bottom: 1em !important; line-height: 1.4 !important; color: #000000 !important; }
        p { margin-top: 0 !important; margin-bottom: 0 !important; line-height: 1.6 !important; }
        ul { list-style-type: disc !important; padding-left: 40px !important; }
        ol { list-style-type: decimal !important; padding-left: 40px !important; }
        blockquote { border-left: 4px solid #cbd5e1 !important; margin: 1em 0 !important; padding-left: 1em !important; color: #475569 !important; }
        
        img, svg { display: block; max-width: 100%; }
        .doc-page {
            width: ${docDims.width}px;
            height: ${docDims.height}px;
            min-height: ${docDims.height}px;
            max-height: ${docDims.height}px;
            background: #ffffff;
            position: relative;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-sizing: border-box;
            page-break-inside: avoid;
            page-break-after: always;
        }
        .doc-header, .doc-footer {
            flex-shrink: 0;
            user-select: none;
            box-sizing: border-box;
        }
        .doc-content {
            flex: 1;
            min-height: 0;
            overflow: hidden;
            word-wrap: break-word;
            overflow-wrap: break-word;
            box-sizing: border-box;
            line-height: 1.6;
        }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: 600; }
    </style>
</head>
<body>
${pagesHtml}
</body>
</html>`;

    return fullHtml;
}

/**
 * Extract custom fields from record into a flat key-value object
 * Supports both Map-based and Array-based customFields formats
 */
function extractCustomFields(record, entity) {
    const result = {};
    if (!record.customFields) return result;

    // customFields can be either:
    // 1. A Map (older format): { fieldId: value, fieldName: value }
    // 2. An Array (current format): [{ field_id, value }]
    const isArray = Array.isArray(record.customFields);

    if (isArray) {
        // Array format: [{ field_id, value }]
        const fieldDefs = (entity && entity.customFields && Array.isArray(entity.customFields))
            ? entity.customFields : [];

        for (const cf of record.customFields) {
            if (!cf.field_id) continue;
            const fieldId = cf.field_id.toString();
            const fieldDef = fieldDefs.find(fd => fd._id && fd._id.toString() === fieldId);
            const value = cf.value !== undefined && cf.value !== null ? cf.value : '';

            // Format dates
            const formattedValue = (fieldDef && fieldDef.type === 'date' && value)
                ? formatDate(value)
                : (typeof value === 'object' ? JSON.stringify(value) : String(value));

            if (fieldDef) {
                const fieldName = fieldDef.name || fieldDef.label;
                if (fieldName) result[fieldName] = formattedValue;
            }
            result['cf_' + fieldId] = formattedValue;
        }
    } else {
        // Map format (legacy)
        const cfMap = record.customFields instanceof Map
            ? Object.fromEntries(record.customFields)
            : record.customFields;

        if (entity && entity.customFields) {
            const fieldDefs = Array.isArray(entity.customFields) ? entity.customFields : [];
            for (const fd of fieldDefs) {
                const fieldName = fd.name || fd.label;
                const fieldId = fd._id ? fd._id.toString() : '';
                const value = cfMap[fieldId] || cfMap[fieldName] || '';
                if (fieldName) result[fieldName] = value;
                if (fieldId) result['cf_' + fieldId] = value;
            }
        }

        for (const [key, value] of Object.entries(cfMap)) {
            if (!result[key]) result[key] = value;
        }
    }

    return result;
}

/**
 * Replace {{token}} patterns AND <span class="template-token"> elements in a string with values from context
 */
function resolveTokensInString(str, context) {
    if (!str) return '';

    // 1. First resolve <span class="template-token" data-token="...">label</span> elements
    //    These are inserted by the visual editor's insertVariableToken function
    let result = str.replace(
        /<span[^>]*class="[^"]*template-token[^"]*"[^>]*data-token="([^"]*)"[^>]*>[^<]*<\/span>/gi,
        (match, encodedTokenData) => {
            try {
                // data-token is HTML-encoded JSON, decode it
                const decoded = encodedTokenData
                    .replace(/&quot;/g, '"')
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&#39;/g, "'");
                const tokenData = JSON.parse(decoded);
                const path = tokenData.path;
                if (!path) return match;

                // Resolve value from context using dot notation.
                // If missing, return empty string to avoid leaking raw token syntax in generated docs.
                return resolveNestedValue(context, path) ?? '';
            } catch (e) {
                console.warn('[SmartDoc] Could not parse template-token:', e.message);
                return '';
            }
        }
    );

    // 2. Also handle data-token with single quotes (some serializations)
    result = result.replace(
        /<span[^>]*class="[^"]*template-token[^"]*"[^>]*data-token='([^']*)'[^>]*>[^<]*<\/span>/gi,
        (match, tokenDataStr) => {
            try {
                const tokenData = JSON.parse(tokenDataStr);
                const path = tokenData.path;
                if (!path) return match;
                return resolveNestedValue(context, path) ?? '';
            } catch (e) {
                return '';
            }
        }
    );

    // 3. Then resolve standard {{token}} text patterns
    result = result.replace(/\{\{([^}]+)\}\}/g, (match, token) => {
        const key = token.trim();
        return resolveNestedValue(context, key) ?? '';
    });

    return result;
}

/**
 * Resolve a dot-separated path in a nested context object
 * Returns the resolved value as a string, or null if not found
 */
function resolveNestedValue(context, path) {
    if (!path || !context) return null;
    const key = path.trim();

    if (key.includes('.')) {
        const parts = key.split('.');
        let val = context;
        for (const part of parts) {
            if (val && typeof val === 'object') val = val[part];
            else { val = undefined; break; }
        }
        return val !== undefined ? String(val) : null;
    }

    return context[key] !== undefined ? String(context[key]) : null;
}

/**
 * Resolve output filename template
 */
function resolveOutputName(template, templateName, recordTitle, inputs) {
    let name = template
        .replace(/\{\{templateName\}\}/g, templateName)
        .replace(/\{\{recordTitle\}\}/g, recordTitle)
        .replace(/\{\{today\}\}/g, formatDate(new Date()))
        .replace(/\{\{date\}\}/g, formatDate(new Date()));

    // Resolve inputs in name
    for (const [key, value] of Object.entries(inputs || {})) {
        name = name.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
    }

    // Sanitize for filename
    return name.replace(/[<>:"/\\|?*]/g, '_').trim();
}

/**
 * Format date for display
 */
function formatDate(date, mode = 'full') {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    if (mode === 'month') {
        return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Format file size for display
 */
function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' o';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
    return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
}

/**
 * Generate a PDF from HTML using Puppeteer
 * Margins are expected to be embedded as CSS padding in the HTML content
 * (matching the editor's layout), so Puppeteer uses margin: 0.
 */
async function generatePDF(html, outputPath, docTemplate) {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Set viewport to exactly match editor page dimensions
        // This ensures 1:1 pixel rendering with the editor canvas
        const dims = docTemplate.dimensions || { width: 794, height: 1123 };
        await page.setViewport({ width: dims.width, height: dims.height });

        const appUrl = process.env.APP_URL || 'http://localhost:3000';
        const baseUrl = appUrl.endsWith('/') ? appUrl : appUrl + '/';

        let wrappedHtml = html;
        if (!html.includes('<html') && !html.includes('<HTML')) {
            wrappedHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <base href="${baseUrl}">
                    <link rel="stylesheet" href="themes/default/assets/css/style.css">
                    <link rel="stylesheet" href="css/app/main.css">
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
                    <script src="https://cdn.tailwindcss.com"></script>
                    <script>
                        tailwind.config = { darkMode: 'class' };
                    </script>
                    <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
                    <style>
                        @page {
                            margin: 0;
                            size: ${dims.width}px ${dims.height}px;
                        }
                        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                        body { 
                            font-family: 'Inter', system-ui, -apple-system, sans-serif; 
                            font-size: 12pt; 
                            line-height: 1.6;
                            color: #000000;
                            margin: 0;
                            padding: 0;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        /* Tailwind Preflight resets — match editor environment */
                        p, h1, h2, h3, h4, h5, h6, blockquote, pre, ul, ol, figure, hr { margin: 0; }
                        h1, h2, h3, h4, h5, h6 { font-size: inherit; font-weight: inherit; }
                        
                        /* Base typography matching the React Document Editor */
                        h1 { font-size: 2em !important; font-weight: bold !important; margin-top: 0.67em !important; margin-bottom: 0.67em !important; line-height: 1.2 !important; color: #000000 !important; }
                        h2 { font-size: 1.5em !important; font-weight: bold !important; margin-top: 0.83em !important; margin-bottom: 0.83em !important; line-height: 1.3 !important; color: #000000 !important; }
                        h3 { font-size: 1.17em !important; font-weight: bold !important; margin-top: 1em !important; margin-bottom: 1em !important; line-height: 1.4 !important; color: #000000 !important; }
                        p { margin-top: 0 !important; margin-bottom: 0 !important; line-height: 1.6 !important; }
                        ul { list-style-type: disc !important; padding-left: 40px !important; }
                        ol { list-style-type: decimal !important; padding-left: 40px !important; }
                        blockquote { border-left: 4px solid #cbd5e1 !important; margin: 1em 0 !important; padding-left: 1em !important; color: #475569 !important; }
                        
                        img, svg { display: block; max-width: 100%; }
                        .doc-page {
                            width: ${dims.width}px;
                            height: ${dims.height}px;
                            min-height: ${dims.height}px;
                            max-height: ${dims.height}px;
                            background: #ffffff;
                            position: relative;
                            display: flex;
                            flex-direction: column;
                            overflow: hidden;
                            box-sizing: border-box;
                            page-break-inside: avoid;
                            page-break-after: always;
                        }
                        .doc-header, .doc-footer {
                            flex-shrink: 0;
                            user-select: none;
                            box-sizing: border-box;
                        }
                        .doc-content {
                            flex: 1;
                            min-height: 0;
                            overflow: hidden;
                            word-wrap: break-word;
                            overflow-wrap: break-word;
                            box-sizing: border-box;
                            line-height: 1.6;
                        }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f5f5f5; font-weight: 600; }
                    </style>
                </head>
                <body>
                    ${html}
                </body>
                </html>
            `;
        }

        await page.setContent(wrappedHtml, { waitUntil: ['networkidle0', 'load'], timeout: 30000 });

        const format = docTemplate.format || 'A4';
        const landscape = docTemplate.orientation === 'landscape';

        await page.pdf({
            path: outputPath,
            format: format,
            landscape: landscape,
            printBackground: true,
            margin: { top: 0, bottom: 0, left: 0, right: 0 },
            preferCSSPageSize: true
        });
    } finally {
        if (browser) await browser.close();
    }
}

/**
 * Extract which variables were used in the document and their resolved values
 * Returns an array of { path, label, value, group }
 */
function extractUsedVariables(docTemplate, record, entity, inputs, relatedRecordsMap, user) {
    // Build the same context as resolveDocumentTokens
    const context = {
        title: record.title || '',
        computedTitle: record.computedTitle || record.title || '',
        description: record.description || '',
        today: formatDate(new Date()),
        currentYear: new Date().getFullYear().toString(),
        currentMonth: formatDate(new Date(), 'month'),
        currentTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        user: {
            name: user ? (user.name || user.fullName || user.email || '') : '',
            email: user ? (user.email || '') : ''
        },
        ...extractCustomFields(record, entity),
        ...inputs
    };

    // Entity-scoped context
    if (entity && entity.slug) {
        const entityContext = {
            title: record.title || '',
            computedTitle: record.computedTitle || record.title || '',
            description: record.description || '',
            createdAt: record.createdAt ? formatDate(record.createdAt) : '',
            updatedAt: record.updatedAt ? formatDate(record.updatedAt) : '',
            ...extractCustomFields(record, entity)
        };

        // Classification values
        if (record.classificationValues && record.classificationValues.length > 0) {
            const classifContext = {};
            const allClassifs = [
                ...(entity.statusClassification ? [entity.statusClassification] : []),
                ...(entity.classifications || [])
            ];
            for (const cv of record.classificationValues) {
                const classifDef = allClassifs.find(c => c && c._id && c._id.toString() === cv.classificationId?.toString());
                if (classifDef && classifDef.key) {
                    classifContext[classifDef.key] = cv.label || '';
                }
            }
            entityContext.classification = classifContext;
        }

        // Related entity data
        if (entity.relations && relatedRecordsMap) {
            for (const rel of entity.relations) {
                const targetEntity = rel.targetEntity;
                if (!targetEntity || typeof targetEntity !== 'object') continue;
                const relData = relatedRecordsMap[rel.key];
                if (relData && relData.record) {
                    const relRecord = relData.record;
                    const relEntityDef = relData.entity;
                    entityContext[targetEntity.slug] = {
                        title: relRecord.title || '',
                        computedTitle: relRecord.computedTitle || relRecord.title || '',
                        description: relRecord.description || '',
                        ...extractCustomFields(relRecord, relEntityDef)
                    };
                }
            }
        }

        // Custom relation fields
        if (entity.customFields && relatedRecordsMap) {
            for (const cfDef of entity.customFields) {
                if (!cfDef || cfDef.type !== 'relation') continue;
                const fieldId = cfDef._id.toString();
                const fieldName = cfDef.name || cfDef.label?.toLowerCase().replace(/\s+/g, '_') || fieldId;
                const relData = relatedRecordsMap[fieldId];
                if (relData && relData.record) {
                    const relRecord = relData.record;
                    const relEntityDef = relData.entity;
                    entityContext[fieldName] = {
                        title: relRecord.title || '',
                        computedTitle: relRecord.computedTitle || relRecord.title || '',
                        description: relRecord.description || '',
                        ...extractCustomFields(relRecord, relEntityDef)
                    };
                }
            }
        }

        context[entity.slug] = entityContext;
    }

    // Now scan document content for tokens
    const usedTokenPaths = new Set();
    let contentStr = '';

    if (docTemplate.contentBlocks && docTemplate.contentBlocks.length > 0) {
        for (const block of docTemplate.contentBlocks) {
            if (block.html) contentStr += block.html + ' ';
        }
    } else if (docTemplate.pages && docTemplate.pages.length > 0) {
        for (const page of docTemplate.pages) {
            if (page.content) contentStr += page.content + ' ';
            if (page.elements) {
                for (const el of page.elements) {
                    if (el.content && typeof el.content === 'object') {
                        if (el.content.text) contentStr += el.content.text + ' ';
                        if (el.content.html) contentStr += el.content.html + ' ';
                    }
                }
            }
        }
    }

    // Also scan header/footer
    if (docTemplate.headerHtml) contentStr += docTemplate.headerHtml + ' ';
    if (docTemplate.footerHtml) contentStr += docTemplate.footerHtml + ' ';

    // Extract {{token}} patterns
    const tokenRegex = /\{\{([^}]+)\}\}/g;
    let match;
    while ((match = tokenRegex.exec(contentStr)) !== null) {
        usedTokenPaths.add(match[1].trim());
    }

    // Extract data-token from template-token spans
    const spanRegex = /data-token=["']([^"']*?)["']/gi;
    while ((match = spanRegex.exec(contentStr)) !== null) {
        try {
            const decoded = match[1]
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&#39;/g, "'");
            const tokenData = JSON.parse(decoded);
            if (tokenData.path) usedTokenPaths.add(tokenData.path);
        } catch (e) { /* skip unparseable */ }
    }

    // Resolve each token to its value and categorize
    const variables = [];
    for (const tokenPath of usedTokenPaths) {
        const value = resolveNestedValue(context, tokenPath);
        let group = 'Autre';
        let label = tokenPath;

        if (tokenPath.startsWith('user.')) {
            group = 'Utilisateur';
            label = tokenPath === 'user.name' ? "Nom de l'utilisateur" : tokenPath === 'user.email' ? 'Email' : tokenPath;
        } else if (['today', 'currentYear', 'currentMonth', 'currentTime'].includes(tokenPath)) {
            group = 'Systeme';
            const labels = { today: 'Date du jour', currentYear: 'Annee', currentMonth: 'Mois', currentTime: 'Heure' };
            label = labels[tokenPath] || tokenPath;
        } else if (entity && entity.slug && tokenPath.startsWith(entity.slug + '.')) {
            const rest = tokenPath.slice(entity.slug.length + 1);
            if (rest.startsWith('classification.')) {
                group = 'Classification';
                label = rest.replace('classification.', '');
            } else if (rest.includes('.')) {
                group = 'Relation';
                label = rest;
            } else {
                group = entity.name || 'Entite';
                label = rest;
            }
        } else if (inputs && inputs[tokenPath] !== undefined) {
            group = 'Saisie';
            label = tokenPath;
        } else {
            group = 'Champ';
        }

        variables.push({
            path: tokenPath,
            label,
            value: value !== null && value !== undefined ? String(value) : '-',
            group
        });
    }

    // Sort by group
    const groupOrder = ['Entite', 'Champ', 'Classification', 'Relation', 'Saisie', 'Utilisateur', 'Systeme', 'Autre'];
    variables.sort((a, b) => {
        const ai = groupOrder.indexOf(a.group) === -1 ? 99 : groupOrder.indexOf(a.group);
        const bi = groupOrder.indexOf(b.group) === -1 ? 99 : groupOrder.indexOf(b.group);
        return ai - bi;
    });

    return variables;
}

/**
 * Generate interactive previews for Dynamic Table in Drafts
 * Replaces the inner HTML of <div class="dynamic-table"...> with the rendered <table>,
 * leaving the outer div intact so that it remains clickable and editable via UI.
 */
function previewDynamicTablesForDraft(html, recordLines, lineSchemas) {
    if (!html) return html;

    let result = html;
    let searchFrom = 0;
    let safety = 0;

    while (safety++ < 50) {
        const markerIdx = result.indexOf('dynamic-table', searchFrom);
        if (markerIdx === -1) break;

        // Find the opening <div that contains this class
        const divOpenStart = result.lastIndexOf('<div', markerIdx);
        if (divOpenStart === -1) { searchFrom = markerIdx + 1; continue; }

        const divOpenEnd = result.indexOf('>', divOpenStart);
        if (divOpenEnd === -1) { searchFrom = markerIdx + 1; continue; }

        const openingTag = result.substring(divOpenStart, divOpenEnd + 1);

        // Extract data-table attribute
        let dataTableValue = '';
        const sqMatch = openingTag.match(/data-table='([^']*)'/);
        const dqMatch = openingTag.match(/data-table="([^"]*)"/);
        if (sqMatch) {
            dataTableValue = sqMatch[1];
        } else if (dqMatch) {
            dataTableValue = dqMatch[1];
        } else {
            searchFrom = markerIdx + 1;
            continue;
        }

        // Count nested divs to find matching closing </div>
        let depth = 1;
        let pos = divOpenEnd + 1;
        while (depth > 0 && pos < result.length) {
            const nextOpen = result.indexOf('<div', pos);
            const nextClose = result.indexOf('</div>', pos);
            if (nextClose === -1) break;

            if (nextOpen !== -1 && nextOpen < nextClose) {
                depth++;
                pos = nextOpen + 4;
            } else {
                depth--;
                if (depth === 0) {
                    try {
                        const decoded = dataTableValue
                            .replace(/&quot;/g, '"')
                            .replace(/&amp;/g, '&')
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/&#39;/g, "'");
                        const config = JSON.parse(decoded);
                        const style = config.style || 'professional';
                        const resolved = resolveDynamicTableSchemaAndLines(config, lineSchemas, recordLines);
                        if (resolved.schema) {
                            const schema = resolved.schema;
                            const lines = resolved.lines || [];
                            if (lines.length === 0) {
                                console.warn('[SmartDoc] Dynamic table resolved but no lines in draft preview', {
                                    schemaName: schema?.name,
                                    schemaId: schema?._id,
                                    requestedSchemaId: config?.schemaId,
                                    requestedSchemaIds: config?.schemaIds,
                                    recordLinesCount: Array.isArray(recordLines) ? recordLines.length : 0
                                });
                            }
                            const innerReplacement = renderDynamicTable(schema, lines, style, config);
                            result = result.substring(0, divOpenEnd + 1) + innerReplacement + result.substring(nextClose);
                            searchFrom = divOpenEnd + 1 + innerReplacement.length;
                        } else {
                            console.warn('[SmartDoc] Dynamic table schema unresolved in draft preview', {
                                schemaId: config?.schemaId,
                                schemaIds: config?.schemaIds,
                                schemaName: config?.schemaName,
                                availableSchemaIds: Object.keys(lineSchemas || {})
                            });
                            // If missing schema or lines, replace with clickable box
                            const innerReplacement = `
                                <div style="padding: 16px; background: #f3f4f6; border: 1px dashed #d1d5db; color: #1f2937; border-radius: 8px; text-align: center;">
                                    <iconify-icon icon="solar:database-bold-duotone" width="24" style="margin-bottom: 8px"></iconify-icon>
                                    <div style="font-weight: 500">${config.schemaName || 'Tableau Dynamique'}</div>
                                    <div style="font-size: 11px; opacity: 0.7; margin-top: 4px;">Cliquez pour configurer les lignes</div>
                                </div>
                            `;
                            result = result.substring(0, divOpenEnd + 1) + innerReplacement + result.substring(nextClose);
                            searchFrom = divOpenEnd + 1 + innerReplacement.length;
                        }
                    } catch (e) {
                        console.warn('[SmartDoc] Could not preview dynamic-table:', e.message);
                        searchFrom = nextClose + 6;
                    }
                    break;
                }
                pos = nextClose + 6;
            }
        }
        if (depth > 0) searchFrom = markerIdx + 1;
    }

    return result;
}

/**
 * Resolve dynamic table placeholders in HTML
 * Finds <div class="dynamic-table" data-table="{...}"> elements and replaces with rendered tables
 */
function resolveDynamicTables(html, recordLines, lineSchemas) {
    if (!html) return html;

    let result = html;
    let searchFrom = 0;
    let safety = 0;

    while (safety++ < 50) {
        const markerIdx = result.indexOf('dynamic-table', searchFrom);
        if (markerIdx === -1) break;

        // Find the opening <div that contains this class
        const divOpenStart = result.lastIndexOf('<div', markerIdx);
        if (divOpenStart === -1) { searchFrom = markerIdx + 1; continue; }

        const divOpenEnd = result.indexOf('>', divOpenStart);
        if (divOpenEnd === -1) { searchFrom = markerIdx + 1; continue; }

        const openingTag = result.substring(divOpenStart, divOpenEnd + 1);

        // Extract data-table attribute (single quotes for JSON with double quotes inside)
        let dataTableValue = '';
        const sqMatch = openingTag.match(/data-table='([^']*)'/);
        const dqMatch = openingTag.match(/data-table="([^"]*)"/);
        if (sqMatch) {
            dataTableValue = sqMatch[1];
        } else if (dqMatch) {
            dataTableValue = dqMatch[1];
        } else {
            searchFrom = markerIdx + 1;
            continue;
        }

        // Count nested divs to find matching closing </div>
        let depth = 1;
        let pos = divOpenEnd + 1;
        while (depth > 0 && pos < result.length) {
            const nextOpen = result.indexOf('<div', pos);
            const nextClose = result.indexOf('</div>', pos);
            if (nextClose === -1) break;

            if (nextOpen !== -1 && nextOpen < nextClose) {
                depth++;
                pos = nextOpen + 4;
            } else {
                depth--;
                if (depth === 0) {
                    let consumeEnd = nextClose + 6;
                    const afterDiv = result.substring(consumeEnd);
                    const trailingBr = afterDiv.match(/^(\s*<p>\s*<br\s*\/?>\s*<\/p>)/);
                    if (trailingBr) consumeEnd += trailingBr[1].length;

                    try {
                        const decoded = dataTableValue
                            .replace(/&quot;/g, '"')
                            .replace(/&amp;/g, '&')
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/&#39;/g, "'");
                        const config = JSON.parse(decoded);
                        const style = config.style || 'professional';
                        const resolved = resolveDynamicTableSchemaAndLines(config, lineSchemas, recordLines);
                        if (resolved.schema) {
                            const schema = resolved.schema;
                            const lines = resolved.lines || [];
                            if (lines.length === 0) {
                                console.warn('[SmartDoc] Dynamic table resolved but no lines in render', {
                                    schemaName: schema?.name,
                                    schemaId: schema?._id,
                                    requestedSchemaId: config?.schemaId,
                                    requestedSchemaIds: config?.schemaIds,
                                    recordLinesCount: Array.isArray(recordLines) ? recordLines.length : 0
                                });
                            }
                            const replacement = renderDynamicTable(schema, lines, style, config);
                            result = result.substring(0, divOpenStart) + replacement + result.substring(consumeEnd);
                            searchFrom = divOpenStart + replacement.length;
                        } else {
                            console.warn('[SmartDoc] Dynamic table schema unresolved in render', {
                                schemaId: config?.schemaId,
                                schemaIds: config?.schemaIds,
                                schemaName: config?.schemaName,
                                availableSchemaIds: Object.keys(lineSchemas || {})
                            });
                            searchFrom = consumeEnd;
                        }
                    } catch (e) {
                        console.warn('[SmartDoc] Could not parse dynamic-table:', e.message);
                        searchFrom = consumeEnd;
                    }
                    break;
                }
                pos = nextClose + 6;
            }
        }
        if (depth > 0) searchFrom = markerIdx + 1;
    }

    return result;
}

/**
 * Pre-resolve relation column values (ObjectIds -> record titles)
 * This mutates recordLines in-place, replacing ObjectIds with resolved titles
 */
async function resolveRelationValues(recordLines, lineSchemas, Record) {
    if (!Record || recordLines.length === 0) return recordLines;

    // Collect all relation column keys and their ObjectId values
    const idsToResolve = new Set();
    const relationColumns = {}; // { colKey: true }

    for (const schemaId in lineSchemas) {
        const schema = lineSchemas[schemaId];
        for (const col of (schema.columns || [])) {
            if (col.type === 'relation') {
                relationColumns[col.key] = col;
            }
        }
    }

    // Gather all ObjectIds from relation columns
    for (const line of recordLines) {
        for (const colKey in relationColumns) {
            const val = line.values?.[colKey];
            if (val && typeof val === 'string' && /^[a-f0-9]{24}$/i.test(val)) {
                idsToResolve.add(val);
            } else if (val && typeof val === 'object' && val.toString && /^[a-f0-9]{24}$/i.test(val.toString())) {
                idsToResolve.add(val.toString());
            }
        }
    }

    if (idsToResolve.size === 0) return recordLines;

    // Batch-fetch all referenced records
    try {
        const ids = [...idsToResolve];
        const records = await Record.find({ _id: { $in: ids } })
            .select('title computedTitle')
            .lean();
        const titleMap = {};
        for (const r of records) {
            titleMap[r._id.toString()] = r.computedTitle || r.title || r._id.toString();
        }

        // Replace ObjectIds with titles in line values
        for (const line of recordLines) {
            if (!line.values) continue;
            for (const colKey in relationColumns) {
                const val = line.values[colKey];
                if (val) {
                    const id = typeof val === 'string' ? val : val.toString();
                    if (titleMap[id]) {
                        // Store resolved title, keep original id as _originalId
                        line.values[colKey] = titleMap[id];
                    }
                }
            }
        }
    } catch (e) {
        console.warn('[SmartDoc] Could not resolve relation values:', e.message);
    }

    return recordLines;
}

/**
 * Render an HTML table from LineSchema + DocumentLines
 * Supports 3 styles: 'minimal', 'professional', 'modern'
 */
function renderDynamicTable(schema, lines, style = 'professional', config = {}) {
    const visibleColumns = (schema.columns || []).filter(c => c.visible !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
    if (visibleColumns.length === 0) return '<p><em>Aucune colonne definie</em></p>';

    const showTotals = config.showTotals !== false;
    const title = config.title || '';

    // Style definitions
    const styles = {
        minimal: {
            table: 'width:100%;border-collapse:collapse;margin:16px 0;font-family:inherit;font-size:11pt;',
            thead: 'border-bottom:2px solid #333;',
            th: 'padding:8px 12px;text-align:left;font-weight:600;color:#333;border:none;border-bottom:2px solid #333;',
            td: 'padding:8px 12px;border:none;border-bottom:1px solid #e5e7eb;color:#374151;',
            trAlt: '',
            tfoot: 'border-top:2px solid #333;font-weight:600;',
            tfootTd: 'padding:8px 12px;border:none;border-top:2px solid #333;font-weight:600;',
            titleStyle: 'font-size:13pt;font-weight:600;margin:16px 0 8px;color:#333;'
        },
        professional: {
            table: 'width:100%;border-collapse:collapse;margin:16px 0;font-family:inherit;font-size:11pt;border:1px solid #d1d5db;',
            thead: 'background:#f3f4f6;',
            th: 'padding:10px 12px;text-align:left;font-weight:600;color:#1f2937;border:1px solid #d1d5db;font-size:10pt;',
            td: 'padding:8px 12px;border:1px solid #d1d5db;color:#374151;',
            trAlt: 'background:#f9fafb;',
            tfoot: 'background:#f3f4f6;font-weight:600;',
            tfootTd: 'padding:10px 12px;border:1px solid #d1d5db;font-weight:600;color:#1f2937;',
            titleStyle: 'font-size:13pt;font-weight:600;margin:16px 0 8px;color:#1f2937;'
        },
        modern: {
            table: 'width:100%;border-collapse:separate;border-spacing:0;margin:16px 0;font-family:inherit;font-size:11pt;border-radius:8px;overflow:hidden;border:1px solid #e0e7ff;',
            thead: 'background:linear-gradient(135deg,#4f46e5,#6366f1);',
            th: 'padding:12px 14px;text-align:left;font-weight:600;color:#ffffff;border:none;font-size:10pt;',
            td: 'padding:10px 14px;border:none;border-bottom:1px solid #e0e7ff;color:#374151;',
            trAlt: 'background:#f5f3ff;',
            tfoot: 'background:#eef2ff;font-weight:600;',
            tfootTd: 'padding:12px 14px;border:none;border-top:2px solid #c7d2fe;font-weight:700;color:#4338ca;',
            titleStyle: 'font-size:13pt;font-weight:700;margin:16px 0 8px;color:#4338ca;'
        }
    };

    const s = styles[style] || styles.professional;

    let html = '';
    if (title) {
        html += `<p style="${s.titleStyle}">${escapeHtml(title)}</p>`;
    }

    html += `<table style="${s.table}">`;

    // Header
    html += `<thead style="${s.thead}"><tr>`;
    html += `<th style="${s.th}width:40px;text-align:center;">#</th>`;
    for (const col of visibleColumns) {
        const align = ['number', 'money', 'formula'].includes(col.type) ? 'text-align:right;' : '';
        html += `<th style="${s.th}${align}">${escapeHtml(col.label)}</th>`;
    }
    html += '</tr></thead>';

    // Body
    html += '<tbody>';
    if (lines.length === 0) {
        html += `<tr><td colspan="${visibleColumns.length + 1}" style="${s.td}text-align:center;color:#9ca3af;font-style:italic;padding:20px;">Aucune ligne</td></tr>`;
    } else {
        const totals = {};
        lines.forEach((line, idx) => {
            const altStyle = idx % 2 === 1 ? s.trAlt : '';
            html += `<tr style="${altStyle}">`;
            html += `<td style="${s.td}text-align:center;color:#9ca3af;width:40px;">${idx + 1}</td>`;
            for (const col of visibleColumns) {
                // For relation columns, prefer the _label companion field (e.g. treatment_label)
                let raw;
                if (col.type === 'relation') {
                    raw = line.values?.[col.key + '_label'] || line.values?.[col.key] || '';
                } else {
                    raw = line.values?.[col.key] ?? line.computed?.[col.key] ?? '';
                }
                const align = ['number', 'money', 'formula'].includes(col.type) ? 'text-align:right;' : '';
                const formatted = formatLineValue(raw, col);
                html += `<td style="${s.td}${align}">${escapeHtml(String(formatted))}</td>`;

                // Accumulate totals for numeric columns
                if (['number', 'money', 'formula'].includes(col.type)) {
                    const num = parseFloat(raw) || 0;
                    totals[col.key] = (totals[col.key] || 0) + num;
                }
            }
            html += '</tr>';
        });

        // Footer totals
        if (showTotals && Object.keys(totals).length > 0) {
            html += `<tfoot style="${s.tfoot}"><tr>`;
            html += `<td style="${s.tfootTd}"></td>`;
            for (const col of visibleColumns) {
                if (totals[col.key] !== undefined) {
                    const formatted = formatLineValue(totals[col.key], col);
                    html += `<td style="${s.tfootTd}text-align:right;">${escapeHtml(String(formatted))}</td>`;
                } else if (col === visibleColumns[0]) {
                    html += `<td style="${s.tfootTd}">Total</td>`;
                } else {
                    html += `<td style="${s.tfootTd}"></td>`;
                }
            }
            html += '</tr></tfoot>';
        }
    }
    html += '</tbody></table>';

    return html;
}

/**
 * Format a line value based on column type
 */
function formatLineValue(value, column) {
    if (value === null || value === undefined || value === '') return '';
    switch (column.type) {
        case 'money':
            const decimals = column.config?.decimals ?? 2;
            const num = parseFloat(value);
            if (isNaN(num)) return value;
            return num.toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + ' EUR';
        case 'number':
        case 'formula':
            const n = parseFloat(value);
            if (isNaN(n)) return value;
            return n.toLocaleString('fr-FR');
        case 'date':
            return formatDate(value);
        case 'select': {
            // Map value to label from config options
            const options = column.config?.options || [];
            const opt = options.find(o => o.value === value || o.label === value);
            return opt ? opt.label : String(value);
        }
        case 'multiselect': {
            // Map array of values to labels
            const msOptions = column.config?.options || [];
            const arr = Array.isArray(value) ? value : [value];
            return arr.map(v => {
                const o = msOptions.find(opt => opt.value === v || opt.label === v);
                return o ? o.label : String(v);
            }).join(', ');
        }
        case 'relation':
            // Already resolved to title by resolveRelationValues
            if (typeof value === 'object' && value !== null) {
                return value.title || value.computedTitle || value.name || JSON.stringify(value);
            }
            return String(value);
        case 'dosage':
            // Format dosage value: { value: 12, unit: 'g' } or { amount: 500, unit: 'mg' }
            if (typeof value === 'object' && value !== null) {
                const amt = value.value || value.amount || '';
                const unit = value.unit || '';
                return `${amt} ${unit}`.trim();
            }
            return String(value);
        case 'duration':
            // Format duration: "3w/j" -> "3 fois/jour" etc.
            if (typeof value === 'string') {
                return value
                    .replace(/w\/j/g, ' fois/jour')
                    .replace(/\/j/g, '/jour');
            }
            if (Array.isArray(value)) {
                return value.map(v => String(v).replace(/w\/j/g, ' fois/jour').replace(/\/j/g, '/jour')).join(', ');
            }
            return String(value);
        default:
            if (Array.isArray(value)) return value.join(', ');
            if (typeof value === 'object') return JSON.stringify(value);
            return String(value);
    }
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * POST /api/smartdoc/render-table
 * Renders the HTML block for a dynamic table so the React Editor can update the DOM immediately
 * after the user edits lines in the modal.
 * Body: { schemaId, style, config, lines }
 */
router.post('/smartdoc/render-table', async (req, res) => {
    try {
        const { schemaId, style, config, lines } = req.body;
        if (!schemaId) return res.status(400).json({ error: 'Missing schemaId' });

        const LineSchema = await tenantCollection(req, 'LineSchema');
        const schema = await LineSchema.findById(schemaId).lean();
        if (!schema) return res.status(404).json({ error: 'Schema not found' });

        const Record = await tenantCollection(req, 'Record');
        const resolvedLines = await resolveRelationValues(lines || [], { [schemaId]: schema }, Record);

        const html = renderDynamicTable(schema, resolvedLines, style || 'professional', config || {});
        res.json({ success: true, html });
    } catch (error) {
        console.error('[SmartDoc] render-table error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

