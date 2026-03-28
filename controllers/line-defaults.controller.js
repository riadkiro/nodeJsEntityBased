const { tenantCollection } = require('../middleware/tenant');

module.exports = {
    // ─── Get line defaults for a record ──────────────────────────────
    // Returns defaults enriched with schema/column metadata
    getDefaults: async (req, res) => {
        try {
            const Record = await tenantCollection(req, 'Record');
            const LineSchema = await tenantCollection(req, 'LineSchema');
            const Entity = await tenantCollection(req, 'Entity');
            if (!Record || !LineSchema || !Entity) {
                return res.status(500).json({ error: 'Model not available' });
            }

            const record = await Record.findById(req.params.recordId)
                .select('entityId lineDefaults')
                .lean();
            if (!record) return res.status(404).json({ error: 'Record not found' });

            // Find all LineSchemas where this record's entity is the source
            const schemas = await LineSchema.find({
                sourceEntityId: record.entityId
            }).select('name slug columns sourceEntityId').lean();

            if (schemas.length === 0) {
                return res.json({ schemas: [] });
            }

            // Build response: merge schema columns with record's stored defaults
            const result = schemas.map(schema => {
                const storedDefaults = (record.lineDefaults || [])
                    .find(ld => ld.schemaId && ld.schemaId.toString() === schema._id.toString());

                const defaults = storedDefaults?.defaults || {};
                const availableOptions = storedDefaults?.availableOptions || {};
                const excludedColumns = storedDefaults?.excludedColumns || [];

                // Only include configurable columns (not formula, not relation)
                const columns = (schema.columns || [])
                    .filter(c => c.type !== 'formula' && c.type !== 'relation')
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map(col => ({
                        key: col.key,
                        label: col.label || col.key,
                        type: col.type,
                        allOptions: col.config?.options || [],
                        defaultValue: defaults[col.key] !== undefined ? defaults[col.key] : null,
                        availableOptions: availableOptions[col.key] || [],
                        excluded: excludedColumns.includes(col.key)
                    }));

                return {
                    schemaId: schema._id.toString(),
                    schemaName: schema.name,
                    schemaSlug: schema.slug,
                    columns
                };
            });

            res.json({ schemas: result });
        } catch (error) {
            console.error('[LineDefaults] Get error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // ─── Save line defaults for a record ─────────────────────────────
    saveDefaults: async (req, res) => {
        try {
            const Record = await tenantCollection(req, 'Record');
            if (!Record) return res.status(500).json({ error: 'Model not available' });

            const { schemaId, defaults, availableOptions, excludedColumns } = req.body;
            if (!schemaId) return res.status(400).json({ error: 'schemaId is required' });

            const record = await Record.findById(req.params.recordId);
            if (!record) return res.status(404).json({ error: 'Record not found' });

            // Update or insert the lineDefault for this schema
            const lineDefaults = record.lineDefaults || [];
            const existingIdx = lineDefaults.findIndex(
                ld => ld.schemaId && ld.schemaId.toString() === schemaId
            );

            const newEntry = {
                schemaId,
                defaults: defaults || {},
                availableOptions: availableOptions || {},
                excludedColumns: excludedColumns || []
            };

            if (existingIdx >= 0) {
                lineDefaults[existingIdx] = newEntry;
            } else {
                lineDefaults.push(newEntry);
            }

            record.lineDefaults = lineDefaults;
            record.markModified('lineDefaults');
            await record.save();

            res.json({ success: true, lineDefaults: record.lineDefaults });
        } catch (error) {
            console.error('[LineDefaults] Save error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // ─── Get schemas where an entity is the source ───────────────────
    getSchemasBySourceEntity: async (req, res) => {
        try {
            const LineSchema = await tenantCollection(req, 'LineSchema');
            if (!LineSchema) return res.status(500).json({ error: 'Model not available' });

            const schemas = await LineSchema.find({
                sourceEntityId: req.params.entityId
            }).select('name slug columns sourceEntityId').lean();

            res.json({ data: schemas });
        } catch (error) {
            console.error('[LineDefaults] GetSchemasBySource error:', error);
            res.status(500).json({ error: error.message });
        }
    }
};
