const { tenantCollection } = require('../middleware/tenant');

// ─── Safe formula evaluator (whitelist only) ──────────────────────────
function evaluateFormula(expression, context) {
    try {
        // Only allow: numbers, basic math ops, parentheses, and known variable names
        const safeExpr = expression.replace(/[a-zA-Z_]\w*/g, (varName) => {
            if (context.hasOwnProperty(varName)) {
                const val = parseFloat(context[varName]);
                return isNaN(val) ? '0' : val.toString();
            }
            return '0';
        });

        // Whitelist: only digits, dots, math operators, parentheses, spaces
        if (!/^[\d\s.+\-*/()]+$/.test(safeExpr)) {
            console.warn('[Formula] Rejected unsafe expression:', safeExpr);
            return 0;
        }

        return Function('"use strict"; return (' + safeExpr + ')')();
    } catch (e) {
        console.error('[Formula] Evaluation error:', e.message, 'expr:', expression);
        return 0;
    }
}

module.exports = {
    // ─── List lines for a document ─────────────────────────────────────
    listByDocument: async (req, res) => {
        try {
            const DocumentLine = await tenantCollection(req, 'DocumentLine');
            if (!DocumentLine) return res.status(500).json({ error: 'Model not available' });

            const filter = { documentId: req.params.documentId };
            // Optional: filter by schemaId
            if (req.query.schemaId) {
                filter.schemaId = req.query.schemaId;
            }

            const lines = await DocumentLine.find(filter)
                .sort({ order: 1 })
                .lean();

            res.json({ data: lines });
        } catch (error) {
            console.error('[DocumentLine] List error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // ─── Bulk save (upsert + delete removed) ───────────────────────────
    bulkSave: async (req, res) => {
        try {
            const DocumentLine = await tenantCollection(req, 'DocumentLine');
            const LineSchema = await tenantCollection(req, 'LineSchema');
            if (!DocumentLine || !LineSchema) return res.status(500).json({ error: 'Model not available' });

            const { documentId } = req.params;
            const { lines, schemaId } = req.body;

            if (!Array.isArray(lines)) {
                return res.status(400).json({ error: 'lines must be an array' });
            }

            // Load schema for formula computation
            let schema = null;
            if (schemaId) {
                schema = await LineSchema.findById(schemaId).lean();
            }

            // Get existing line IDs — SCOPED to this schema only
            const existFilter = { documentId };
            if (schemaId) existFilter.schemaId = schemaId;
            const existingLines = await DocumentLine.find(existFilter).select('_id').lean();
            const existingIds = new Set(existingLines.map(l => l._id.toString()));
            const incomingIds = new Set();

            const operations = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const lineData = {
                    documentId,
                    schemaId: schemaId || undefined,
                    lineType: line.lineType || 'product',
                    values: line.values || {},
                    order: i,
                    createdBy: line.createdBy || req.user?._id
                };

                // Compute formula columns
                if (schema) {
                    lineData.computed = computeLineFormulas(schema, lineData.values);
                }

                if (line._id) {
                    incomingIds.add(line._id);
                    operations.push({
                        updateOne: {
                            filter: { _id: line._id, documentId },
                            update: { $set: lineData },
                            upsert: true
                        }
                    });
                } else {
                    operations.push({
                        insertOne: { document: lineData }
                    });
                }
            }

            // Delete lines that were removed by the user
            const toDelete = [...existingIds].filter(id => !incomingIds.has(id));
            if (toDelete.length > 0) {
                operations.push({
                    deleteMany: {
                        filter: { _id: { $in: toDelete }, documentId }
                    }
                });
            }

            if (operations.length > 0) {
                await DocumentLine.bulkWrite(operations);
            }

            // Re-fetch saved lines — scoped to this schema
            const refetchFilter = { documentId };
            if (schemaId) refetchFilter.schemaId = schemaId;
            const savedLines = await DocumentLine.find(refetchFilter)
                .sort({ order: 1 })
                .lean();

            // Compute document totals
            let totals = {};
            if (schema && schema.totals) {
                totals = computeDocumentTotals(schema, savedLines);
            }

            res.json({ data: savedLines, totals });
        } catch (error) {
            console.error('[DocumentLine] BulkSave error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // ─── Recompute totals ──────────────────────────────────────────────
    recompute: async (req, res) => {
        try {
            const DocumentLine = await tenantCollection(req, 'DocumentLine');
            const LineSchema = await tenantCollection(req, 'LineSchema');
            if (!DocumentLine || !LineSchema) return res.status(500).json({ error: 'Model not available' });

            const { documentId } = req.params;
            const { schemaId } = req.body;

            const schema = await LineSchema.findById(schemaId).lean();
            if (!schema) return res.status(404).json({ error: 'Schema not found' });

            const lines = await DocumentLine.find({ documentId }).sort({ order: 1 });

            // Recompute each line's formula columns
            for (const line of lines) {
                const computed = computeLineFormulas(schema, line.values || {});
                line.computed = computed;
                line.markModified('computed');
                await line.save();
            }

            // Compute document totals
            const savedLines = await DocumentLine.find({ documentId }).sort({ order: 1 }).lean();
            const totals = computeDocumentTotals(schema, savedLines);

            res.json({ data: savedLines, totals });
        } catch (error) {
            console.error('[DocumentLine] Recompute error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // ─── Catalog search (products/treatments from a target entity) ─────
    catalogSearch: async (req, res) => {
        try {
            const mongoose = require('mongoose');
            const Record = await tenantCollection(req, 'Record');
            const Entity = await tenantCollection(req, 'Entity');
            if (!Record || !Entity) return res.status(500).json({ error: 'Model not available' });

            const { entityId, q, searchFields } = req.query;
            if (!entityId) return res.status(400).json({ error: 'entityId is required' });

            // Cast to ObjectId to ensure proper matching
            let entityOid;
            try {
                entityOid = new mongoose.Types.ObjectId(entityId);
            } catch (e) {
                return res.status(400).json({ error: 'Invalid entityId format' });
            }

            // Register FieldTemplate on tenant connection (needed for populate)
            await tenantCollection(req, 'FieldTemplate');

            const entity = await Entity.findById(entityOid)
                .select('referenceTitleTokens')
                .lean();

            console.log('[CatalogSearch] entityId:', entityId, 'q:', q, 'entity found:', !!entity);

            let query = { entityId: entityOid };
            if (q && q.trim()) {
                const searchFieldList = searchFields ? searchFields.split(',') : ['title'];
                const orConditions = [];

                for (const field of searchFieldList) {
                    if (['title', 'slug', 'description'].includes(field)) {
                        // Standard Record fields
                        orConditions.push({ [field]: { $regex: q, $options: 'i' } });
                    } else {
                        // Custom field search - match by field value in customFields array
                        orConditions.push({ 'customFields.value': { $regex: q, $options: 'i' } });
                    }
                }

                if (orConditions.length > 0) {
                    query.$or = orConditions;
                }
            }

            console.log('[CatalogSearch] query:', JSON.stringify(query));

            const records = await Record.find(query)
                .sort({ title: 1 })
                .limit(20)
                .select('title slug description customFields entityId lineDefaults')
                .populate({ path: 'customFields.field_id', select: 'name label fieldType' })
                .lean();

            console.log('[CatalogSearch] found', records.length, 'records, first:', records[0] ? { _id: records[0]._id, title: records[0].title, entityId: records[0].entityId } : 'none');

            // Build result with custom field values for default mapping
            const results = [];

            // Pre-load related records for rel: tokens
            const tokens = entity?.referenceTitleTokens || [{ t: 'field', id: 'title' }];
            const relTokens = tokens.filter(t => t.t === 'field' && t.id && t.id.startsWith('rel:'));
            const relatedRecordsMap = {};
            if (relTokens.length > 0) {
                const allRelatedIds = new Set();
                for (const r of records) {
                    for (const rt of relTokens) {
                        const dotIdx = rt.id.indexOf('.');
                        const relKey = rt.id.substring(4, dotIdx);
                        const rv = (r.relations || []).find(rel => rel.relationKey === relKey);
                        if (rv && rv.value) {
                            const ids = Array.isArray(rv.value) ? rv.value : [rv.value];
                            ids.forEach(id => allRelatedIds.add(id.toString()));
                        }
                    }
                }
                if (allRelatedIds.size > 0) {
                    const relatedRecords = await Record.find({ _id: { $in: [...allRelatedIds] } })
                        .select('title slug description date customFields')
                        .populate({ path: 'customFields.field_id', select: 'label fieldType' })
                        .lean();
                    relatedRecords.forEach(rr => { relatedRecordsMap[rr._id.toString()] = rr; });
                }
            }

            for (const r of records) {
                const cfMap = {};
                const templateVars = {
                    title: r.title || '',
                    slug: r.slug || '',
                    description: r.description || ''
                };
                
                (r.customFields || []).forEach(cf => {
                    const field = cf.field_id || {};
                    const fieldId = (field._id || field)?.toString();
                    if (fieldId) {
                        cfMap[fieldId] = cf.value;
                        if (field.name) templateVars[field.name] = cf.value;
                        // Also lowercase label as a fallback (e.g., {{code}})
                        if (field.label) templateVars[field.label.toLowerCase()] = cf.value;
                    }
                });

                // Function to deeply interpolate strings
                const interpolate = (val) => {
                    if (typeof val !== 'string') return val;
                    return val.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, varName) => {
                        const key = varName.trim();
                        // If exact match found
                        if (templateVars[key] !== undefined) return templateVars[key];
                        // If lowercase match found
                        if (templateVars[key.toLowerCase()] !== undefined) return templateVars[key.toLowerCase()];
                        return match; // Keep unresolved variables
                    });
                };

                let processedLineDefaults = r.lineDefaults || [];
                if (processedLineDefaults.length > 0) {
                    processedLineDefaults = processedLineDefaults.map(ld => {
                        if (!ld.defaults) return ld;
                        const newDefaults = {};
                        for (const [k, v] of Object.entries(ld.defaults)) {
                            newDefaults[k] = interpolate(v);
                        }
                        return { ...ld, defaults: newDefaults };
                    });
                }

                // Build label from tokens
                const parts = tokens.map(token => {
                    if (token.t === 'text') return token.v || '';
                    if (token.t === 'field') {
                        // Relation sub-field: rel:<relKey>.<subFieldId>
                        if (token.id && token.id.startsWith('rel:')) {
                            const dotIdx = token.id.indexOf('.');
                            const relKey = token.id.substring(4, dotIdx);
                            const subFieldId = token.id.substring(dotIdx + 1);
                            const rv = (r.relations || []).find(rel => rel.relationKey === relKey);
                            if (rv && rv.value) {
                                const targetId = Array.isArray(rv.value) ? rv.value[0] : rv.value;
                                const targetRecord = relatedRecordsMap[targetId?.toString()];
                                if (targetRecord) {
                                    if (['title', 'slug'].includes(subFieldId)) return targetRecord[subFieldId] || '';
                                    const tcf = (targetRecord.customFields || []).find(c => {
                                        const cfId = c.field_id?._id || c.field_id;
                                        return cfId && cfId.toString() === subFieldId;
                                    });
                                    return tcf?.value || '';
                                }
                            }
                            return '';
                        }
                        if (['title', 'slug'].includes(token.id)) return r[token.id] || '';
                        return cfMap[token.id] || '';
                    }
                    return '';
                });

                results.push({
                    _id: r._id,
                    label: parts.join('').trim() || r.title || r.slug,
                    title: r.title,
                    customFields: cfMap,
                    lineDefaults: processedLineDefaults
                });
            }

            res.json({ data: results });
        } catch (error) {
            console.error('[DocumentLine] CatalogSearch error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // ─── Catalog frequent (most used items) ─────────────────────────────
    catalogFrequent: async (req, res) => {
        try {
            const mongoose = require('mongoose');
            const Record = await tenantCollection(req, 'Record');
            const Entity = await tenantCollection(req, 'Entity');
            const DocumentLine = await tenantCollection(req, 'DocumentLine');
            if (!Record || !Entity || !DocumentLine) return res.status(500).json({ error: 'Model not available' });

            const { entityId } = req.query;
            if (!entityId) return res.status(400).json({ error: 'entityId is required' });

            let entityOid;
            try {
                entityOid = new mongoose.Types.ObjectId(entityId);
            } catch (e) {
                return res.status(400).json({ error: 'Invalid entityId format' });
            }

            // Register FieldTemplate on tenant connection (needed for populate)
            await tenantCollection(req, 'FieldTemplate');

            const entity = await Entity.findById(entityOid)
                .select('referenceTitleTokens')
                .lean();

            // Strategy 1: Aggregate from DocumentLine to find most used relation values
            // DocumentLine stores relation values as values.<relationKey> = recordId
            const pipeline = [
                // Unwind the values object to find relation references
                {
                    $project: {
                        valuesArray: { $objectToArray: '$values' }
                    }
                },
                { $unwind: '$valuesArray' },
                // Keep only values that look like ObjectId strings (24 hex chars)
                {
                    $match: {
                        'valuesArray.v': { $regex: /^[a-f0-9]{24}$/i }
                    }
                },
                // Group by the referenced record ID and count
                {
                    $group: {
                        _id: '$valuesArray.v',
                        count: { $sum: 1 }
                    }
                },
                // Sort by most used
                { $sort: { count: -1 } },
                { $limit: 20 }
            ];

            const frequentIds = await DocumentLine.aggregate(pipeline);
            
            let records = [];
            if (frequentIds.length > 0) {
                // Convert to ObjectIds and filter to ones belonging to this entity
                const candidateIds = frequentIds.map(f => {
                    try { return new mongoose.Types.ObjectId(f._id); } catch(e) { return null; }
                }).filter(Boolean);

                records = await Record.find({ 
                    _id: { $in: candidateIds },
                    entityId: entityOid
                })
                    .select('title slug description customFields entityId relations lineDefaults')
                    .populate({ path: 'customFields.field_id', select: 'name label fieldType' })
                    .limit(15)
                    .lean();

                // Sort records by their frequency count
                const countMap = {};
                frequentIds.forEach(f => { countMap[f._id] = f.count; });
                records.sort((a, b) => (countMap[b._id.toString()] || 0) - (countMap[a._id.toString()] || 0));
            }

            // Fallback: if no frequent items found, return most recent records from entity
            if (records.length === 0) {
                records = await Record.find({ entityId: entityOid })
                    .sort({ createdAt: -1 })
                    .limit(15)
                    .select('title slug description customFields entityId relations lineDefaults')
                    .populate({ path: 'customFields.field_id', select: 'name label fieldType' })
                    .lean();
            }

            // Build labels using referenceTitleTokens (same logic as catalogSearch)
            const tokens = entity?.referenceTitleTokens || [{ t: 'field', id: 'title' }];
            const relTokens = tokens.filter(t => t.t === 'field' && t.id && t.id.startsWith('rel:'));
            const relatedRecordsMap = {};
            if (relTokens.length > 0) {
                const allRelatedIds = new Set();
                for (const r of records) {
                    for (const rt of relTokens) {
                        const dotIdx = rt.id.indexOf('.');
                        const relKey = rt.id.substring(4, dotIdx);
                        const rv = (r.relations || []).find(rel => rel.relationKey === relKey);
                        if (rv && rv.value) {
                            const ids = Array.isArray(rv.value) ? rv.value : [rv.value];
                            ids.forEach(id => allRelatedIds.add(id.toString()));
                        }
                    }
                }
                if (allRelatedIds.size > 0) {
                    const relatedRecords = await Record.find({ _id: { $in: [...allRelatedIds] } })
                        .select('title slug description date customFields')
                        .populate({ path: 'customFields.field_id', select: 'label fieldType' })
                        .lean();
                    relatedRecords.forEach(rr => { relatedRecordsMap[rr._id.toString()] = rr; });
                }
            }

            const results = [];
            for (const r of records) {
                const cfMap = {};
                const templateVars = {
                    title: r.title || '',
                    slug: r.slug || '',
                    description: r.description || ''
                };
                
                (r.customFields || []).forEach(cf => {
                    const field = cf.field_id || {};
                    const fieldId = (field._id || field)?.toString();
                    if (fieldId) {
                        cfMap[fieldId] = cf.value;
                        if (field.name) templateVars[field.name] = cf.value;
                        if (field.label) templateVars[field.label.toLowerCase()] = cf.value;
                    }
                });

                const interpolate = (val) => {
                    if (typeof val !== 'string') return val;
                    return val.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, varName) => {
                        const key = varName.trim();
                        if (templateVars[key] !== undefined) return templateVars[key];
                        if (templateVars[key.toLowerCase()] !== undefined) return templateVars[key.toLowerCase()];
                        return match;
                    });
                };

                let processedLineDefaults = r.lineDefaults || [];
                if (processedLineDefaults.length > 0) {
                    processedLineDefaults = processedLineDefaults.map(ld => {
                        if (!ld.defaults) return ld;
                        const newDefaults = {};
                        for (const [k, v] of Object.entries(ld.defaults)) {
                            newDefaults[k] = interpolate(v);
                        }
                        return { ...ld, defaults: newDefaults };
                    });
                }

                const parts = tokens.map(token => {
                    if (token.t === 'text') return token.v || '';
                    if (token.t === 'field') {
                        if (token.id && token.id.startsWith('rel:')) {
                            const dotIdx = token.id.indexOf('.');
                            const relKey = token.id.substring(4, dotIdx);
                            const subFieldId = token.id.substring(dotIdx + 1);
                            const rv = (r.relations || []).find(rel => rel.relationKey === relKey);
                            if (rv && rv.value) {
                                const targetId = Array.isArray(rv.value) ? rv.value[0] : rv.value;
                                const targetRecord = relatedRecordsMap[targetId?.toString()];
                                if (targetRecord) {
                                    if (['title', 'slug'].includes(subFieldId)) return targetRecord[subFieldId] || '';
                                    const tcf = (targetRecord.customFields || []).find(c => {
                                        const cfId = c.field_id?._id || c.field_id;
                                        return cfId && cfId.toString() === subFieldId;
                                    });
                                    return tcf?.value || '';
                                }
                            }
                            return '';
                        }
                        if (['title', 'slug'].includes(token.id)) return r[token.id] || '';
                        return cfMap[token.id] || '';
                    }
                    return '';
                });

                results.push({
                    _id: r._id,
                    label: parts.join('').trim() || r.title || r.slug,
                    title: r.title,
                    customFields: cfMap,
                    lineDefaults: processedLineDefaults
                });
            }

            res.json({ data: results });
        } catch (error) {
            console.error('[DocumentLine] CatalogFrequent error:', error);
            res.status(500).json({ error: error.message });
        }
    }
};

// ─── Formula helpers ───────────────────────────────────────────────────
function computeLineFormulas(schema, values) {
    const computed = {};
    const formulaColumns = (schema.columns || []).filter(c => c.type === 'formula');

    for (const col of formulaColumns) {
        if (col.config && col.config.expression) {
            // Build context from values + already computed
            const context = { ...values, ...computed };
            computed[col.key] = evaluateFormula(col.config.expression, context);
        }
    }

    return computed;
}

function computeDocumentTotals(schema, lines) {
    const totals = {};

    if (schema.totals) {
        // SUM subtotalKey across all lines
        if (schema.totals.subtotalKey) {
            totals.subtotal = lines.reduce((sum, line) => {
                const val = (line.computed && line.computed[schema.totals.subtotalKey]) ||
                    (line.values && line.values[schema.totals.subtotalKey]) || 0;
                return sum + parseFloat(val || 0);
            }, 0);
        }

        // SUM vatKey across all lines
        if (schema.totals.vatKey) {
            totals.vat = lines.reduce((sum, line) => {
                const val = (line.computed && line.computed[schema.totals.vatKey]) ||
                    (line.values && line.values[schema.totals.vatKey]) || 0;
                return sum + parseFloat(val || 0);
            }, 0);
        }

        // Evaluate totalFormula
        if (schema.totals.totalFormula) {
            totals.total = evaluateFormula(schema.totals.totalFormula, totals);
        }
    }

    return totals;
}
