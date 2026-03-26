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
        const templates = await SmartDocTemplate.find({
            entityId: req.params.entityId,
            active: true
        })
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
        const template = new SmartDocTemplate({
            ...req.body,
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

        // Also remove entityId from the linked Document's entityIds array
        if (template.documentId && entityId) {
            await Document.findByIdAndUpdate(template.documentId, {
                $pull: { entityIds: entityId }
            });
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
        if (req.query.entityId) {
            // Search in both legacy entityId and new entityIds array
            filter.$or = [
                { entityId: req.query.entityId },
                { entityIds: req.query.entityId }
            ];
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
            { path: 'currentYear', label: "Année en cours", type: 'text', icon: 'solar:calendar-bold-duotone' },
            { path: 'currentMonth', label: "Mois en cours", type: 'text', icon: 'solar:calendar-bold-duotone' },
            { path: 'currentTime', label: "Heure actuelle", type: 'text', icon: 'solar:clock-circle-bold-duotone' }
        ];

        // 2. User variables
        variables.user = [
            { path: 'user.name', label: "Nom de l'utilisateur", type: 'text', icon: 'solar:user-bold-duotone' },
            { path: 'user.email', label: "Email de l'utilisateur", type: 'text', icon: 'solar:letter-bold-duotone' }
        ];

        // 3. Entity variables from linked entities
        const entityIds = [...(doc.entityIds || [])];
        if (doc.entityId && !entityIds.includes(doc.entityId.toString())) {
            entityIds.push(doc.entityId);
        }

        if (entityIds.length > 0 && Entity && FieldTemplate) {
            // Fetch all linked entities with their customFields populated
            const entities = await Entity.find({ _id: { $in: entityIds } })
                .populate('customFields')
                .populate('classifications')
                .populate('statusClassification')
                .populate({
                    path: 'relations.targetEntity',
                    select: 'name icon slug customFields classifications statusClassification',
                    populate: [
                        { path: 'customFields', model: 'FieldTemplate' },
                        { path: 'classifications', model: 'Classification' },
                        { path: 'statusClassification', model: 'Classification' }
                    ]
                })
                .lean();

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
                    { path: `${entity.slug}.createdAt`, label: 'Date de création', type: 'date', fieldId: null },
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
        const entity = await Entity.findById(smartDocTemplate.entityId)
            .populate('customFields')
            .populate('classifications')
            .populate('statusClassification')
            .populate({
                path: 'relations.targetEntity',
                select: 'name icon slug customFields classifications statusClassification',
                populate: [
                    { path: 'customFields', model: 'FieldTemplate' },
                    { path: 'classifications', model: 'Classification' },
                    { path: 'statusClassification', model: 'Classification' }
                ]
            })
            .lean();

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

        // 5b. Load DocumentLines for this record (for dynamic tables)
        let recordLines = [];
        let lineSchemas = {};
        if (DocumentLine && LineSchema) {
            recordLines = await DocumentLine.find({ documentId: record._id }).sort({ order: 1 }).lean();
            // Load all relevant line schemas
            const schemaIds = [...new Set(recordLines.map(l => l.schemaId).filter(Boolean))];
            if (schemaIds.length > 0) {
                const schemas = await LineSchema.find({ _id: { $in: schemaIds } }).lean();
                for (const s of schemas) lineSchemas[s._id.toString()] = s;
            }
            // Also load schemas by entity
            if (entity) {
                const entitySchemas = await LineSchema.find({ 'appliesTo.entityIds': entity._id }).lean();
                for (const s of entitySchemas) {
                    if (!lineSchemas[s._id.toString()]) lineSchemas[s._id.toString()] = s;
                }
            }
            // Pre-resolve relation values (ObjectId → record title)
            recordLines = await resolveRelationValues(recordLines, lineSchemas, Record);
        }

        // 6. Resolve tokens in the document template
        let resolvedHtml = resolveDocumentTokens(docTemplate, record, entity, inputs, relatedRecordsMap, req.user);

        // 6a. Resolve dynamic tables
        resolvedHtml = resolveDynamicTables(resolvedHtml, recordLines, lineSchemas);

        // 6b. Extract used variables for preview sidebar
        const usedVariables = extractUsedVariables(docTemplate, record, entity, inputs, relatedRecordsMap, req.user);

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
        const outputDir = path.join(__dirname, '../../public/uploads/attachments', String(req.account_number));
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
        res.status(500).json({ error: error.message || 'Erreur lors de la génération' });
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
        const entity = await Entity.findById(smartDocTemplate.entityId)
            .populate('customFields')
            .populate('classifications')
            .populate('statusClassification')
            .populate({
                path: 'relations.targetEntity',
                select: 'name icon slug customFields classifications statusClassification',
                populate: [
                    { path: 'customFields', model: 'FieldTemplate' },
                    { path: 'classifications', model: 'Classification' },
                    { path: 'statusClassification', model: 'Classification' }
                ]
            })
            .lean();

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

        // 5b. Load DocumentLines for dynamic tables in draft
        let recordLines = [];
        let lineSchemas = {};
        if (DocumentLine && LineSchema) {
            recordLines = await DocumentLine.find({ documentId: record._id }).sort({ order: 1 }).lean();
            const schemaIds = [...new Set(recordLines.map(l => l.schemaId).filter(Boolean))];
            if (schemaIds.length > 0) {
                const schemas = await LineSchema.find({ _id: { $in: schemaIds } }).lean();
                for (const s of schemas) lineSchemas[s._id.toString()] = s;
            }
            if (entity) {
                const entitySchemas = await LineSchema.find({ 'appliesTo.entityIds': entity._id }).lean();
                for (const s of entitySchemas) {
                    if (!lineSchemas[s._id.toString()]) lineSchemas[s._id.toString()] = s;
                }
            }
            // Pre-resolve relation values (ObjectId → record title)
            recordLines = await resolveRelationValues(recordLines, lineSchemas, Record);
        }

        // 6. Build token context (same as resolveDocumentTokens)
        const context = buildTokenContext(record, entity, inputs, relatedRecordsMap, req.user);

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
        const draftDoc = new Document({
            name: outputName,
            pages: draftPages,
            headerHtml: resolvedHeaderHtml,
            footerHtml: resolvedFooterHtml,
            format: docTemplate.format || 'A4',
            orientation: docTemplate.orientation || 'portrait',
            isTemplate: false,
            isDraft: true,               // Flag as draft for cleanup
            draftSourceTemplateId: smartDocTemplate._id,
            draftRecordId: req.body.recordId,
            draftOutputName: outputName,
            draftOutputFormat: smartDocTemplate.outputFormat || 'pdf',
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
        res.status(500).json({ error: error.message || 'Erreur lors de la création du brouillon' });
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

        // 2. Load the record
        const recordId = req.body.recordId || draftDoc.draftRecordId;
        const record = await Record.findById(recordId);
        if (!record) {
            return res.status(404).json({ error: 'Record introuvable' });
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
                // Pre-resolve relation values (ObjectId → record title)
                draftLines = await resolveRelationValues(draftLines, lineSchemas, Record);
            }
        } catch (e) {
            console.warn('[SmartDoc] Finalize: Could not load draft lines:', e.message);
        }

        // 3b. Build HTML from draft pages — resolve dynamic tables NOW for PDF
        let html = '';
        if (draftDoc.pages && draftDoc.pages.length > 0) {
            for (const page of draftDoc.pages) {
                if (page.content) {
                    // Resolve dynamic tables to static HTML for the final PDF output
                    html += resolveDynamicTables(page.content, draftLines, lineSchemas);
                }
                if (page.elements) {
                    for (const el of page.elements) {
                        if (el.content && typeof el.content === 'object') {
                            if (el.content.text) html += el.content.text;
                            if (el.content.html) html += el.content.html;
                        }
                    }
                }
            }
        }

        const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page { margin: 20mm; size: ${draftDoc.format || 'A4'}${draftDoc.orientation === 'landscape' ? ' landscape' : ''}; }
        body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            font-size: 12pt; 
            line-height: 1.5;
            color: #1a1a1a;
            margin: 0;
            padding: 20mm;
        }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: 600; }
        h1, h2, h3 { color: #333; }
        .header-block { text-align: center; margin-bottom: 30px; }
        .footer-block { text-align: center; margin-top: 30px; font-size: 10pt; color: #888; }
    </style>
</head>
<body>
${draftDoc.headerHtml || ''}
${html}
${draftDoc.footerHtml || ''}
</body>
</html>`;

        // 4. Generate output file
        const outputName = draftDoc.draftOutputName || draftDoc.name || 'Document';
        const outputFormat = draftDoc.draftOutputFormat || 'pdf';
        let savedFilename;
        let savedSize;
        const outputDir = path.join(__dirname, '../../public/uploads/attachments', String(req.account_number));
        fs.mkdirSync(outputDir, { recursive: true });

        if (outputFormat === 'pdf' || outputFormat === 'both') {
            const pdfFilename = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.pdf';
            const pdfPath = path.join(outputDir, pdfFilename);
            try {
                await generatePDF(fullHtml, pdfPath, draftDoc);
                savedFilename = pdfFilename;
                savedSize = fs.statSync(pdfPath).size;
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

        // 5. Save as record attachment
        const newAttachment = {
            filename: savedFilename,
            originalName: outputName + (savedFilename.endsWith('.pdf') ? '.pdf' : '.html'),
            mimeType: savedFilename.endsWith('.pdf') ? 'application/pdf' : 'text/html',
            size: savedSize,
            category: 'pdf',
            isGenerated: true,
            generatedFrom: (draftDoc.draftSourceTemplateId || '').toString(),
            uploadedAt: new Date(),
            uploadedBy: req.user?._id
        };

        record.attachments = record.attachments || [];
        record.attachments.push(newAttachment);
        await record.save();

        const addedAttachment = record.attachments[record.attachments.length - 1];

        // 6. Delete the draft document and its lines (cleanup)
        try {
            const DocumentLine = await tenantCollection(req, 'DocumentLine');
            if (DocumentLine) {
                await DocumentLine.deleteMany({ documentId: draftDoc._id });
            }
        } catch (e) { /* non-critical */ }
        await Document.findByIdAndDelete(draftDoc._id);
        console.log(`[SmartDoc] Draft ${draftDoc._id} finalized and deleted`);

        res.json({
            success: true,
            attachment: {
                _id: addedAttachment._id,
                ...newAttachment,
                url: `/account/${req.account_number}/uploads/attachments/${savedFilename}`,
                sizeFormatted: formatSize(savedSize)
            },
            outputName
        });

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

        context[entity.slug] = entityContext;
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

        context[entity.slug] = entityContext;
    }

    // Resolve in content blocks, pages, etc.
    let html = '';

    if (docTemplate.contentBlocks && docTemplate.contentBlocks.length > 0) {
        for (const block of docTemplate.contentBlocks) {
            if (block.type === 'text' && block.html) {
                html += resolveTokensInString(block.html, context);
            } else if (block.type === 'divider') {
                html += '<hr style="margin: 10px 0; border-color: #e5e7eb; border-width: 1px 0 0;">';
            }
        }
    } else if (docTemplate.pages && docTemplate.pages.length > 0) {
        for (const page of docTemplate.pages) {
            if (page.content) {
                html += resolveTokensInString(page.content, context);
            }
            if (page.elements) {
                for (const el of page.elements) {
                    if (el.content && typeof el.content === 'object') {
                        if (el.content.text) {
                            html += resolveTokensInString(el.content.text, context);
                        }
                        if (el.content.html) {
                            html += resolveTokensInString(el.content.html, context);
                        }
                    }
                }
            }
        }
    }

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page { margin: 20mm; size: A4; }
        body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            font-size: 12pt; 
            line-height: 1.5;
            color: #1a1a1a;
            margin: 0;
            padding: 20mm;
        }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: 600; }
        h1, h2, h3 { color: #333; }
        .header-block { text-align: center; margin-bottom: 30px; }
        .footer-block { text-align: center; margin-top: 30px; font-size: 10pt; color: #888; }
    </style>
</head>
<body>
${docTemplate.headerHtml ? resolveTokensInString(docTemplate.headerHtml, context) : ''}
${html}
${docTemplate.footerHtml ? resolveTokensInString(docTemplate.footerHtml, context) : ''}
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

                // Resolve value from context using dot notation
                return resolveNestedValue(context, path) ?? match;
            } catch (e) {
                console.warn('[SmartDoc] Could not parse template-token:', e.message);
                return match;
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
                return resolveNestedValue(context, path) ?? match;
            } catch (e) {
                return match;
            }
        }
    );

    // 3. Then resolve standard {{token}} text patterns
    result = result.replace(/\{\{([^}]+)\}\}/g, (match, token) => {
        const key = token.trim();
        return resolveNestedValue(context, key) ?? match;
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
 */
async function generatePDF(html, outputPath, docTemplate) {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const format = docTemplate.format || 'A4';
        const landscape = docTemplate.orientation === 'landscape';

        await page.pdf({
            path: outputPath,
            format: format,
            landscape: landscape,
            printBackground: true,
            margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' }
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
            group = 'Système';
            const labels = { today: 'Date du jour', currentYear: 'Année', currentMonth: 'Mois', currentTime: 'Heure' };
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
                group = entity.name || 'Entité';
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
            value: value !== null && value !== undefined ? String(value) : '—',
            group
        });
    }

    // Sort by group
    const groupOrder = ['Entité', 'Champ', 'Classification', 'Relation', 'Saisie', 'Utilisateur', 'Système', 'Autre'];
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
                        const schemaId = config.schemaId;
                        const style = config.style || 'professional';

                        if (schemaId && lineSchemas[schemaId]) {
                            const schema = lineSchemas[schemaId];
                            const lines = recordLines.filter(l => {
                                if (l.schemaId) return l.schemaId.toString() === schemaId;
                                return true;
                            });
                            const innerReplacement = renderDynamicTable(schema, lines, style, config);
                            result = result.substring(0, divOpenEnd + 1) + innerReplacement + result.substring(nextClose);
                            searchFrom = divOpenEnd + 1 + innerReplacement.length;
                        } else {
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
                        const schemaId = config.schemaId;
                        const style = config.style || 'professional';

                        if (schemaId && lineSchemas[schemaId]) {
                            const schema = lineSchemas[schemaId];
                            const lines = recordLines.filter(l => {
                                if (l.schemaId) return l.schemaId.toString() === schemaId;
                                return true;
                            });
                            const replacement = renderDynamicTable(schema, lines, style, config);
                            result = result.substring(0, divOpenStart) + replacement + result.substring(consumeEnd);
                            searchFrom = divOpenStart + replacement.length;
                        } else {
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
 * Pre-resolve relation column values (ObjectIds → record titles)
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
    if (visibleColumns.length === 0) return '<p><em>Aucune colonne définie</em></p>';

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
            return num.toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + ' €';
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
            // Format duration: "3w/j" → "3 fois/jour" etc.
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
