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
 * (to populate the SmartDoc template creation form)
 */
router.get('/smartdoc/documents', async (req, res) => {
    try {
        const Document = await tenantCollection(req, 'Document');
        const filter = { isTemplate: true };
        if (req.query.entityId) {
            filter.entityId = req.query.entityId;
        }
        const documents = await Document.find(filter)
            .select('name entityId format pages createdAt')
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

        // 3. Load the entity for custom field resolution
        const entity = await Entity.findById(smartDocTemplate.entityId).populate('customFields');

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
        const resolvedHtml = resolveDocumentTokens(docTemplate, record, entity, inputs);

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
            }
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
 */
function resolveDocumentTokens(docTemplate, record, entity, inputs) {
    // Build the token context
    const context = {
        // Standard record fields
        title: record.title || '',
        computedTitle: record.computedTitle || record.title || '',
        description: record.description || '',
        slug: record.slug || '',
        date: record.date ? formatDate(record.date) : '',
        createdAt: record.createdAt ? formatDate(record.createdAt) : '',
        updatedAt: record.updatedAt ? formatDate(record.updatedAt) : '',

        // Custom fields (from record.customFields Map)
        ...extractCustomFields(record, entity),

        // SmartDoc inputs
        ...inputs,

        // Computed values
        today: formatDate(new Date()),
        currentYear: new Date().getFullYear().toString(),
        currentMonth: formatDate(new Date(), 'month')
    };

    // Resolve in content blocks, pages, etc.
    let html = '';

    if (docTemplate.contentBlocks && docTemplate.contentBlocks.length > 0) {
        // Use content blocks (structured template mode)
        for (const block of docTemplate.contentBlocks) {
            if (block.type === 'text' && block.html) {
                html += resolveTokensInString(block.html, context);
            } else if (block.type === 'divider') {
                html += '<hr style="margin: 10px 0; border-color: #e5e7eb; border-width: 1px 0 0;">';
            }
        }
    } else if (docTemplate.pages && docTemplate.pages.length > 0) {
        // Use pages (WYSIWYG editor mode)
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

    // Wrap in a full HTML document for PDF generation
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
 */
function extractCustomFields(record, entity) {
    const result = {};
    if (!record.customFields) return result;

    // customFields is a Map in Mongoose
    const cfMap = record.customFields instanceof Map
        ? Object.fromEntries(record.customFields)
        : record.customFields;

    // If entity has populated custom fields, map by field name
    if (entity && entity.customFields) {
        const fieldDefs = Array.isArray(entity.customFields) ? entity.customFields : [];
        for (const fd of fieldDefs) {
            const fieldName = fd.name || fd.label;
            const fieldId = fd._id ? fd._id.toString() : '';
            // Try both ID and name keys
            const value = cfMap[fieldId] || cfMap[fieldName] || '';
            if (fieldName) result[fieldName] = value;
            if (fieldId) result['cf_' + fieldId] = value;
        }
    }

    // Also add all raw keys
    for (const [key, value] of Object.entries(cfMap)) {
        if (!result[key]) result[key] = value;
    }

    return result;
}

/**
 * Replace {{token}} patterns in a string with values from context
 */
function resolveTokensInString(str, context) {
    if (!str) return '';
    return str.replace(/\{\{([^}]+)\}\}/g, (match, token) => {
        const key = token.trim();
        // Support nested keys: record.title, cf.fieldName
        if (key.includes('.')) {
            const parts = key.split('.');
            let val = context;
            for (const part of parts) {
                if (val && typeof val === 'object') val = val[part];
                else { val = undefined; break; }
            }
            return val !== undefined ? String(val) : match;
        }
        return context[key] !== undefined ? String(context[key]) : match;
    });
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

module.exports = router;
