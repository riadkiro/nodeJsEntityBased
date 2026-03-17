const { tenantCollection } = require('../middleware/tenant');

module.exports = {
    // ─── List all schemas ──────────────────────────────────────────────
    list: async (req, res) => {
        try {
            const LineSchema = await tenantCollection(req, 'LineSchema');
            if (!LineSchema) return res.status(500).json({ error: 'Model not available' });

            const schemas = await LineSchema.find({}).sort({ createdAt: -1 }).lean();
            res.json({ data: schemas });
        } catch (error) {
            console.error('[LineSchema] List error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // ─── Get by ID ─────────────────────────────────────────────────────
    getById: async (req, res) => {
        try {
            const LineSchema = await tenantCollection(req, 'LineSchema');
            if (!LineSchema) return res.status(500).json({ error: 'Model not available' });

            const schema = await LineSchema.findById(req.params.id).lean();
            if (!schema) return res.status(404).json({ error: 'Schema not found' });

            res.json({ data: schema });
        } catch (error) {
            console.error('[LineSchema] GetById error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // ─── Get by context (entityId or documentType) ─────────────────────
    getByContext: async (req, res) => {
        try {
            const LineSchema = await tenantCollection(req, 'LineSchema');
            if (!LineSchema) return res.status(500).json({ error: 'Model not available' });

            const { entityId, documentType } = req.query;

            // Build OR query: entity-specific + global schemas (no entityIds set or empty)
            const conditions = [];
            if (entityId) {
                conditions.push({ 'appliesTo.entityIds': entityId });
                // Backward compat: also match old single entityId field
                conditions.push({ 'appliesTo.entityId': entityId });
            }
            // Also include global schemas (no entity restriction)
            conditions.push({ 'appliesTo.entityIds': { $size: 0 } });
            conditions.push({ 'appliesTo.entityIds': { $exists: false } });
            conditions.push({ 'appliesTo': { $exists: false } });
            // Backward compat: old schemas with entityId: null
            conditions.push({ 'appliesTo.entityId': null, 'appliesTo.entityIds': { $exists: false } });

            let query = conditions.length > 0 ? { $or: conditions } : {};
            if (documentType) query['appliesTo.documentType'] = documentType;

            const schemas = await LineSchema.find(query).sort({ name: 1 }).lean();

            res.json({ data: schemas });
        } catch (error) {
            console.error('[LineSchema] GetByContext error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // ─── Create ────────────────────────────────────────────────────────
    create: async (req, res) => {
        try {
            const LineSchema = await tenantCollection(req, 'LineSchema');
            if (!LineSchema) return res.status(500).json({ error: 'Model not available' });

            const { name, slug, description, appliesTo, sourceEntityId, lineTypes, columns, totals, defaultLineType, inputMode, dataMode, timeseriesConfig, analyticsConfig } = req.body;

            const schema = new LineSchema({
                name,
                slug,
                description,
                inputMode: inputMode || 'catalog',
                dataMode: dataMode || 'items',
                timeseriesConfig: timeseriesConfig || undefined,
                analyticsConfig: analyticsConfig || undefined,
                appliesTo: appliesTo || {},
                sourceEntityId: sourceEntityId || null,
                lineTypes: lineTypes || ['product'],
                columns: (columns || []).map((col, i) => ({
                    ...col,
                    order: col.order ?? i
                })),
                totals: totals || {},
                defaultLineType: defaultLineType || (lineTypes && lineTypes[0]) || 'product',
                createdBy: req.user?._id
            });

            await schema.save();
            res.status(201).json({ data: schema });
        } catch (error) {
            console.error('[LineSchema] Create error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // ─── Update ────────────────────────────────────────────────────────
    update: async (req, res) => {
        try {
            const LineSchema = await tenantCollection(req, 'LineSchema');
            if (!LineSchema) return res.status(500).json({ error: 'Model not available' });

            const { name, slug, description, appliesTo, sourceEntityId, lineTypes, columns, totals, defaultLineType, inputMode, dataMode, timeseriesConfig, analyticsConfig } = req.body;

            const updateData = {};
            if (name !== undefined) updateData.name = name;
            if (slug !== undefined) updateData.slug = slug;
            if (description !== undefined) updateData.description = description;
            if (inputMode !== undefined) updateData.inputMode = inputMode;
            if (dataMode !== undefined) updateData.dataMode = dataMode;
            if (timeseriesConfig !== undefined) updateData.timeseriesConfig = timeseriesConfig;
            if (analyticsConfig !== undefined) updateData.analyticsConfig = analyticsConfig;
            if (appliesTo !== undefined) updateData.appliesTo = appliesTo;
            if (sourceEntityId !== undefined) updateData.sourceEntityId = sourceEntityId;
            if (lineTypes !== undefined) updateData.lineTypes = lineTypes;
            if (columns !== undefined) {
                updateData.columns = columns.map((col, i) => ({
                    ...col,
                    order: col.order ?? i
                }));
            }
            if (totals !== undefined) updateData.totals = totals;
            if (defaultLineType !== undefined) updateData.defaultLineType = defaultLineType;

            const schema = await LineSchema.findByIdAndUpdate(
                req.params.id,
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (!schema) return res.status(404).json({ error: 'Schema not found' });

            res.json({ data: schema });
        } catch (error) {
            console.error('[LineSchema] Update error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // ─── Delete ────────────────────────────────────────────────────────
    delete: async (req, res) => {
        try {
            const LineSchema = await tenantCollection(req, 'LineSchema');
            if (!LineSchema) return res.status(500).json({ error: 'Model not available' });

            const schema = await LineSchema.findByIdAndDelete(req.params.id);
            if (!schema) return res.status(404).json({ error: 'Schema not found' });

            res.json({ success: true });
        } catch (error) {
            console.error('[LineSchema] Delete error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // ─── Admin page: list schemas ──────────────────────────────────────
    adminList: async (req, res) => {
        try {
            const LineSchema = await tenantCollection(req, 'LineSchema');
            const schemas = LineSchema ? await LineSchema.find({}).sort({ createdAt: -1 }).lean() : [];

            res.render('account/line-schema-list', {
                schemas,
                account_number: req.account_number,
                layout: 'layout-app'
            });
        } catch (error) {
            console.error('[LineSchema] Admin list error:', error);
            res.status(500).send('Server Error');
        }
    },

    // ─── Admin page: edit schema ───────────────────────────────────────
    adminEdit: async (req, res) => {
        try {
            const LineSchema = await tenantCollection(req, 'LineSchema');
            if (!LineSchema) return res.status(500).send('Model not available');

            let schema = null;
            if (req.params.id && req.params.id !== 'new') {
                schema = await LineSchema.findById(req.params.id).lean();
                if (!schema) return res.status(404).send('Schema not found');
            }

            // Load entities for relation config
            const Entity = await tenantCollection(req, 'Entity');
            const entities = Entity ? await Entity.find({}).select('name slug icon').lean() : [];

            res.render('account/line-schema-builder', {
                schema,
                entities,
                account_number: req.account_number,
                layout: 'layout-app'
            });
        } catch (error) {
            console.error('[LineSchema] Admin edit error:', error);
            res.status(500).send('Server Error');
        }
    }
};
