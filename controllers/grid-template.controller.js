const { tenantCollection } = require('../middleware/tenant');

module.exports = {

    // ─── List all templates ────────────────────────────────────────
    async list(req, res) {
        try {
            const GridSchemaTemplate = await tenantCollection(req, "GridSchemaTemplate");
            const { schemaId, scope, tags, includeRecord } = req.query;

            const filter = {};
            if (schemaId) {
                // Support comma-separated IDs
                const ids = schemaId.split(',').map(id => id.trim()).filter(Boolean);
                filter.schemaId = ids.length > 1 ? { $in: ids } : ids[0];
            }
            if (scope) filter.scope = scope;
            if (tags) filter.tags = { $in: tags.split(',') };

            // When includeRecord is provided, return both:
            // - global/workspace presets (no recordId)
            // - record-specific presets for these records
            // Supports comma-separated IDs (e.g., includeRecord=consultationId,patientId)
            if (includeRecord) {
                const recordIds = includeRecord.split(',').map(id => id.trim()).filter(Boolean);
                filter.$or = [
                    { recordId: null },
                    { recordId: { $exists: false } },
                    ...(recordIds.length > 1
                        ? [{ recordId: { $in: recordIds } }]
                        : [{ recordId: recordIds[0] }])
                ];
            }

            const templates = await GridSchemaTemplate.find(filter)
                .populate('schemaId', 'name slug inputMode dataMode')
                .sort({ scope: 1, name: 1 });

            res.json({ success: true, templates });
        } catch (error) {
            console.error('GridTemplate list error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // ─── Get by ID ─────────────────────────────────────────────────
    async getById(req, res) {
        try {
            const GridSchemaTemplate = await tenantCollection(req, "GridSchemaTemplate");
            const template = await GridSchemaTemplate.findById(req.params.id)
                .populate('schemaId');

            if (!template) return res.status(404).json({ success: false, error: 'Template not found' });
            res.json({ success: true, template });
        } catch (error) {
            console.error('GridTemplate getById error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // ─── Get templates for a specific schema ───────────────────────
    async getBySchema(req, res) {
        try {
            const GridSchemaTemplate = await tenantCollection(req, "GridSchemaTemplate");
            const templates = await GridSchemaTemplate.find({ schemaId: req.params.schemaId })
                .sort({ name: 1 });

            res.json({ success: true, templates });
        } catch (error) {
            console.error('GridTemplate getBySchema error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // ─── Create ────────────────────────────────────────────────────
    async create(req, res) {
        try {
            const GridSchemaTemplate = await tenantCollection(req, "GridSchemaTemplate");
            const { name, slug, description, icon, color, schemaId, presetRows, formLayout, scope, tags } = req.body;

            if (!name || !schemaId) {
                return res.status(400).json({ success: false, error: 'name and schemaId are required' });
            }

            const template = new GridSchemaTemplate({
                name,
                slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, ''),
                description,
                icon: icon || 'solar:clipboard-list-bold-duotone',
                color: color || '#4361ee',
                schemaId,
                presetRows: presetRows || [],
                formLayout: formLayout || { columns: 3, fieldOrder: [] },
                scope: scope || 'workspace',
                tags: tags || [],
                createdBy: req.user?._id
            });

            await template.save();
            res.json({ success: true, template });
        } catch (error) {
            console.error('GridTemplate create error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // ─── Update ────────────────────────────────────────────────────
    async update(req, res) {
        try {
            const GridSchemaTemplate = await tenantCollection(req, "GridSchemaTemplate");
            const allowed = ['name', 'slug', 'description', 'icon', 'color', 'presetRows', 'formLayout', 'scope', 'tags'];
            const updates = {};

            for (const key of allowed) {
                if (req.body[key] !== undefined) updates[key] = req.body[key];
            }

            const template = await GridSchemaTemplate.findByIdAndUpdate(
                req.params.id,
                { $set: updates },
                { new: true, runValidators: true }
            );

            if (!template) return res.status(404).json({ success: false, error: 'Template not found' });
            res.json({ success: true, template });
        } catch (error) {
            console.error('GridTemplate update error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // ─── Delete ────────────────────────────────────────────────────
    async delete(req, res) {
        try {
            const GridSchemaTemplate = await tenantCollection(req, "GridSchemaTemplate");
            const result = await GridSchemaTemplate.findByIdAndDelete(req.params.id);

            if (!result) return res.status(404).json({ success: false, error: 'Template not found' });
            res.json({ success: true });
        } catch (error) {
            console.error('GridTemplate delete error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // ─── Save current record lines as a preset (from record) ───────
    async saveFromRecord(req, res) {
        try {
            const GridSchemaTemplate = await tenantCollection(req, "GridSchemaTemplate");
            const DocumentLine = await tenantCollection(req, "DocumentLine");

            const { name, schemaId, documentId, scope, recordId, recordLabel, icon, color, description, tags } = req.body;

            if (!name || !schemaId || !documentId) {
                return res.status(400).json({ success: false, error: 'name, schemaId and documentId are required' });
            }

            // Fetch current lines for this schema on this document
            const currentLines = await DocumentLine.find({ documentId, schemaId })
                .sort({ order: 1 })
                .lean();

            if (currentLines.length === 0) {
                return res.status(400).json({ success: false, error: 'No lines to save' });
            }

            // Build preset rows from current lines (strip IDs, documentId, timestamps)
            const presetRows = currentLines.map((line, idx) => ({
                lineType: line.lineType || 'default',
                values: line.values || {},
                order: idx
            }));

            const template = new GridSchemaTemplate({
                name,
                slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, ''),
                description: description || `Preset saved from record`,
                icon: icon || 'solar:clipboard-check-bold-duotone',
                color: color || '#4361ee',
                schemaId,
                presetRows,
                formLayout: { columns: 3, fieldOrder: [] },
                scope: scope || 'workspace',
                recordId: scope === 'record' ? recordId : null,
                recordLabel: scope === 'record' ? (recordLabel || '') : '',
                tags: tags || [],
                createdBy: req.user?._id
            });

            await template.save();

            // Populate schemaId for response
            await template.populate('schemaId', 'name slug inputMode dataMode');

            res.json({ success: true, template });
        } catch (error) {
            console.error('GridTemplate saveFromRecord error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // ─── Apply template to a record (create preset lines) ─────────
    async apply(req, res) {
        try {
            const GridSchemaTemplate = await tenantCollection(req, "GridSchemaTemplate");
            const DocumentLine = await tenantCollection(req, "DocumentLine");

            const template = await GridSchemaTemplate.findById(req.params.id);
            if (!template) return res.status(404).json({ success: false, error: 'Template not found' });

            const { documentId } = req.params;
            if (!documentId) return res.status(400).json({ success: false, error: 'documentId is required' });

            // Get current max order for this document
            const lastLine = await DocumentLine.findOne({ documentId, schemaId: template.schemaId })
                .sort({ order: -1 });
            let nextOrder = lastLine ? lastLine.order + 1 : 0;

            // Create lines from preset rows
            const createdLines = [];
            for (const preset of (template.presetRows || [])) {
                const line = new DocumentLine({
                    documentId,
                    schemaId: template.schemaId,
                    lineType: preset.lineType || 'default',
                    values: preset.values || {},
                    computed: {},
                    order: nextOrder++,
                    createdBy: req.user?._id
                });
                await line.save();
                createdLines.push(line);
            }

            res.json({
                success: true,
                lines: createdLines,
                count: createdLines.length
            });
        } catch (error) {
            console.error('GridTemplate apply error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
};
