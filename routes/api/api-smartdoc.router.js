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

        // 6. Resolve tokens in the document template
        const resolvedHtml = resolveDocumentTokens(docTemplate, record, entity, inputs, relatedRecordsMap, req.user);

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
                url: `/uploads/attachments/${req.account_number}/${savedFilename}`,
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
// Helpers
// ============================================================================

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

module.exports = router;
