const { tenantCollection } = require('../middleware/tenant');

function slugify(value, fallback = 'schema') {
    const base = String(value || '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    return base || fallback;
}

function columnKey(value, index, used) {
    const raw = String(value || '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '') || `col_${index + 1}`;
    let key = raw;
    let counter = 2;
    while (used.has(key)) {
        key = `${raw}_${counter}`;
        counter++;
    }
    used.add(key);
    return key;
}

function normalizeColumns(columns = []) {
    const used = new Set();
    return (Array.isArray(columns) ? columns : []).map((col, i) => {
        col = col || {};
        const label = String(col.label || col.key || `Colonne ${i + 1}`).trim();
        const key = columnKey(col.key || label, i, used);
        return {
            ...col,
            key,
            label,
            type: col.type || 'text',
            width: col.width || 'M',
            visible: col.visible !== false,
            order: col.order ?? i,
            config: col.config || {}
        };
    });
}

function normalizeEntityIds(appliesTo) {
    const ids = appliesTo?.entityIds;
    if (!Array.isArray(ids)) return [];
    return ids
        .map(id => {
            if (!id) return '';
            if (typeof id === 'object') return String(id._id || id.id || id);
            return String(id);
        })
        .map(id => id.trim())
        .filter(Boolean);
}

async function attachSchemaToConfiguredEntities(req, schema, appliesTo) {
    const entityIds = normalizeEntityIds(appliesTo);
    if (!entityIds.length || !schema?._id) return;

    const Entity = await tenantCollection(req, 'Entity');
    if (!Entity) return;

    for (const entityId of entityIds) {
        const entity = await Entity.findById(entityId).select('gridSchemas');
        if (!entity) continue;

        const gridSchemas = Array.isArray(entity.gridSchemas) ? entity.gridSchemas : [];
        if (gridSchemas.length === 0) continue;
        if (gridSchemas.some(gs => String(gs.schemaId) === String(schema._id))) continue;

        const maxOrder = gridSchemas.reduce((max, gs) => {
            const order = Number(gs?.order);
            return Number.isFinite(order) ? Math.max(max, order) : max;
        }, -1);

        entity.gridSchemas.push({
            schemaId: schema._id,
            position: 'main',
            order: maxOrder + 1,
            label: schema.name
        });
        await entity.save();
    }
}

async function uniqueLineSchemaSlug(LineSchema, requestedSlug, currentId = null) {
    const base = slugify(requestedSlug);
    let slug = base;
    let counter = 2;
    const queryFor = (candidate) => {
        const query = { slug: candidate };
        if (currentId) query._id = { $ne: currentId };
        return query;
    };
    while (await LineSchema.findOne(queryFor(slug)).select('_id').lean()) {
        slug = `${base}-${counter}`;
        counter++;
    }
    return slug;
}

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

            // If entity defines explicit gridSchemas, use that as the source of truth.
            // This prevents duplicated/unwanted tabs coming from broad appliesTo matches.
            if (entityId) {
                const Entity = await tenantCollection(req, 'Entity');
                if (Entity) {
                    const entity = await Entity.findById(entityId).select('gridSchemas').lean();
                    const configured = Array.isArray(entity?.gridSchemas) ? entity.gridSchemas : [];
                    if (configured.length > 0) {
                        const orderedIds = configured
                            .filter(gs => gs && gs.schemaId)
                            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                            .map(gs => gs.schemaId?.toString())
                            .filter(Boolean);

                        if (orderedIds.length > 0) {
                            const docs = await LineSchema.find({ _id: { $in: orderedIds } }).lean();
                            const byId = new Map(docs.map(d => [d._id.toString(), d]));
                            const orderedDocs = orderedIds.map(id => byId.get(id)).filter(Boolean);
                            return res.json({ data: orderedDocs });
                        }
                    }
                }
            }

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

            const { name, slug, description, appliesTo, sourceEntityId, lineTypes, columns, totals, defaultLineType, inputMode, dataMode, timeseriesConfig, analyticsConfig, snapshotConfig, catalogGroupBy } = req.body;
            const cleanName = String(name || '').trim();
            if (!cleanName) return res.status(400).json({ error: 'Name is required' });
            const cleanSlug = await uniqueLineSchemaSlug(LineSchema, slug || cleanName);

            // Sanitize snapshotConfig: empty strings → null for ObjectId fields
            const cleanSnapshot = snapshotConfig ? {
                ...snapshotConfig,
                targetEntityId: snapshotConfig.targetEntityId || null,
                targetRelationKey: snapshotConfig.targetRelationKey || null
            } : undefined;

            const schema = new LineSchema({
                name: cleanName,
                slug: cleanSlug,
                description,
                inputMode: inputMode || 'catalog',
                dataMode: dataMode || 'items',
                timeseriesConfig: timeseriesConfig || undefined,
                analyticsConfig: analyticsConfig || undefined,
                appliesTo: appliesTo || {},
                sourceEntityId: sourceEntityId || null,
                lineTypes: lineTypes || ['product'],
                columns: normalizeColumns(columns),
                totals: totals || {},
                snapshotConfig: cleanSnapshot,
                catalogGroupBy: catalogGroupBy ? {
                    classificationId: catalogGroupBy.classificationId || null
                } : undefined,
                defaultLineType: defaultLineType || (lineTypes && lineTypes[0]) || 'product',
                createdBy: req.user?._id
            });

            await schema.save();
            await attachSchemaToConfiguredEntities(req, schema, appliesTo);
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

            const { name, slug, description, appliesTo, sourceEntityId, lineTypes, columns, totals, defaultLineType, inputMode, dataMode, timeseriesConfig, analyticsConfig, snapshotConfig, catalogGroupBy } = req.body;

            const updateData = {};
            if (name !== undefined) {
                const cleanName = String(name || '').trim();
                if (!cleanName) return res.status(400).json({ error: 'Name is required' });
                updateData.name = cleanName;
            }
            if (slug !== undefined) updateData.slug = await uniqueLineSchemaSlug(LineSchema, slug || name, req.params.id);
            if (description !== undefined) updateData.description = description;
            if (inputMode !== undefined) updateData.inputMode = inputMode;
            if (dataMode !== undefined) updateData.dataMode = dataMode;
            if (timeseriesConfig !== undefined) updateData.timeseriesConfig = timeseriesConfig;
            if (analyticsConfig !== undefined) updateData.analyticsConfig = analyticsConfig;
            if (appliesTo !== undefined) updateData.appliesTo = appliesTo;
            if (sourceEntityId !== undefined) updateData.sourceEntityId = sourceEntityId || null;
            if (lineTypes !== undefined) updateData.lineTypes = lineTypes;
            if (columns !== undefined) {
                updateData.columns = normalizeColumns(columns);
            }
            if (totals !== undefined) updateData.totals = totals;
            if (snapshotConfig !== undefined) {
                updateData.snapshotConfig = {
                    ...snapshotConfig,
                    targetEntityId: snapshotConfig.targetEntityId || null,
                    targetRelationKey: snapshotConfig.targetRelationKey || null
                };
            }
            if (defaultLineType !== undefined) updateData.defaultLineType = defaultLineType;
            if (catalogGroupBy !== undefined) {
                updateData.catalogGroupBy = {
                    classificationId: catalogGroupBy.classificationId || null
                };
            }

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

            // Load classifications from source entity for catalog grouping
            let sourceClassifications = [];
            if (schema && schema.sourceEntityId) {
                const Classification = await tenantCollection(req, 'Classification');
                const sourceEntity = Entity ? await Entity.findById(schema.sourceEntityId).select('classifications').lean() : null;
                if (sourceEntity && Classification && sourceEntity.classifications && sourceEntity.classifications.length > 0) {
                    sourceClassifications = await Classification.find({ _id: { $in: sourceEntity.classifications } }).lean();
                }
            }

            res.render('account/line-schema-builder', {
                schema,
                entities,
                sourceClassifications,
                account_number: req.account_number,
                layout: 'layout-app'
            });
        } catch (error) {
            console.error('[LineSchema] Admin edit error:', error);
            res.status(500).send('Server Error');
        }
    }
};
