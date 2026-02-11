/**
 * Record Denormalization Service
 * 
 * Central service for pre-computing display data on Record documents.
 * Called at save/update time to cache:
 * - computedTitle (resolved referenceTitleTokens)
 * - classificationValues label/color
 * - _denorm.relations (related record display info)
 * 
 * Also handles sync when referenced records change.
 */

const mongoose = require('mongoose');
const tenantCollection = require('../middleware/tenant').tenantCollection;

// ──────────────────────────────────────────────
// 1. COMPUTE TITLE
// ──────────────────────────────────────────────

/**
 * Resolve entity.referenceTitleTokens against a record's data.
 * Handles standard fields, custom fields, and rel: sub-fields.
 * 
 * @param {Object} recordData - { title, date, description, customFields, relations, ... }
 * @param {Object} entity - populated entity with referenceTitleTokens
 * @param {Model} RecordModel - tenant Record model (for loading related records)
 * @returns {string} resolved title
 */
async function computeTitle(recordData, entity, RecordModel) {
    const tokens = entity.referenceTitleTokens || [{ t: 'field', id: 'title' }];

    // Pre-load related records for rel: tokens
    const relTokens = tokens.filter(t => t.t === 'field' && t.id && t.id.startsWith('rel:'));
    const relatedRecordsMap = {};

    if (relTokens.length > 0 && RecordModel) {
        const allRelatedIds = new Set();
        const relations = recordData.relations || [];

        for (const rt of relTokens) {
            const dotIdx = rt.id.indexOf('.');
            const relKey = rt.id.substring(4, dotIdx);
            const rv = relations.find(r => r.relationKey === relKey);
            if (rv && rv.value) {
                const ids = Array.isArray(rv.value) ? rv.value : [rv.value];
                ids.forEach(id => { if (id) allRelatedIds.add(id.toString()); });
            }
        }

        if (allRelatedIds.size > 0) {
            const relatedRecords = await RecordModel.find({ _id: { $in: [...allRelatedIds] } })
                .select('title slug description date customFields computedTitle')
                .populate({ path: 'customFields.field_id', select: 'label fieldType' })
                .lean();
            relatedRecords.forEach(rr => { relatedRecordsMap[rr._id.toString()] = rr; });
        }
    }

    // Resolve tokens
    const parts = tokens.map(token => {
        if (token.t === 'text') return token.v || '';
        if (token.t === 'field') {
            // Relation sub-field: rel:<relKey>.<subFieldId>
            if (token.id && token.id.startsWith('rel:')) {
                const dotIdx = token.id.indexOf('.');
                const relKey = token.id.substring(4, dotIdx);
                const subFieldId = token.id.substring(dotIdx + 1);
                const rv = (recordData.relations || []).find(r => r.relationKey === relKey);
                if (rv && rv.value) {
                    const targetId = Array.isArray(rv.value) ? rv.value[0] : rv.value;
                    const targetRecord = relatedRecordsMap[targetId?.toString()];
                    if (targetRecord) {
                        if (['title', 'slug', 'date', 'description'].includes(subFieldId)) {
                            const val = targetRecord[subFieldId];
                            if (subFieldId === 'date' && val) {
                                return new Date(val).toISOString().split('T')[0];
                            }
                            return val || '';
                        }
                        const tcf = (targetRecord.customFields || []).find(c => {
                            const cfId = c.field_id?._id || c.field_id;
                            return cfId && cfId.toString() === subFieldId;
                        });
                        return tcf?.value || '';
                    }
                }
                return '';
            }
            // Standard fields
            if (['title', 'slug', 'description'].includes(token.id)) {
                return recordData[token.id] || '';
            }
            if (token.id === 'date') {
                const d = recordData.date;
                return d ? new Date(d).toISOString().split('T')[0] : '';
            }
            // Custom fields — match by field_id
            const customFields = recordData.customFields || [];
            if (Array.isArray(customFields)) {
                const cf = customFields.find(c => {
                    const cfId = c.field_id?._id || c.field_id;
                    return cfId && cfId.toString() === token.id;
                });
                if (cf?.value) {
                    // If date-like value, format it
                    if (typeof cf.value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(cf.value)) {
                        return cf.value.substring(0, 10);
                    }
                    return cf.value;
                }
            }
        }
        return '';
    });

    return parts.join('').trim() || recordData.title || 'Sans titre';
}


// ──────────────────────────────────────────────
// 2. ENRICH CLASSIFICATIONS
// ──────────────────────────────────────────────

/**
 * Add label + color to classificationValues from the entity's classification definitions.
 * 
 * @param {Array} classificationValuesArray - [{ classificationId, optionId }]
 * @param {Object} entity - populated entity with classifications
 * @returns {Array} enriched [{ classificationId, optionId, label, color }]
 */
function enrichClassifications(classificationValuesArray, entity) {
    if (!classificationValuesArray || classificationValuesArray.length === 0) return [];

    // Build a flat lookup: optionId → { label, color }
    const optionMap = {};
    const allClassifications = [
        ...(entity.classifications || []),
        ...(entity.statusClassification ? [entity.statusClassification] : [])
    ];

    for (const cls of allClassifications) {
        if (!cls || !cls.options) continue;
        for (const opt of cls.options) {
            if (opt._id) {
                optionMap[opt._id.toString()] = {
                    label: opt.label || opt.name || '',
                    color: opt.color || ''
                };
            }
        }
    }

    return classificationValuesArray.map(cv => {
        const optId = cv.optionId?.toString();
        const match = optId ? optionMap[optId] : null;
        return {
            classificationId: cv.classificationId,
            optionId: cv.optionId,
            label: match?.label || '',
            color: match?.color || ''
        };
    });
}


// ──────────────────────────────────────────────
// 3. ENRICH RELATIONS
// ──────────────────────────────────────────────

/**
 * Build denormalized relation display data for list view columns.
 * 
 * @param {Array} relationsArray - [{ relationKey, value }]
 * @param {Object} entity - entity with relations[] definitions
 * @param {Model} RecordModel - tenant Record model
 * @param {Model} EntityModel - tenant Entity model (to resolve target entity slug)
 * @returns {Array} [{ relationKey, records: [{ _id, title, entitySlug }] }]
 */
async function enrichRelations(relationsArray, entity, RecordModel, EntityModel) {
    if (!relationsArray || relationsArray.length === 0) return [];

    // Collect all related record IDs
    const allIds = new Set();
    for (const rel of relationsArray) {
        if (!rel.value) continue;
        const ids = Array.isArray(rel.value) ? rel.value : [rel.value];
        ids.forEach(id => { if (id) allIds.add(id.toString()); });
    }

    if (allIds.size === 0) return [];

    // Batch load all related records
    const relatedRecords = await RecordModel.find({ _id: { $in: [...allIds] } })
        .select('_id title computedTitle entityId')
        .lean();

    const recordMap = {};
    relatedRecords.forEach(rr => { recordMap[rr._id.toString()] = rr; });

    // Build entity slug map from entity relations definitions
    const entitySlugMap = {};
    if (EntityModel) {
        const targetEntityIds = (entity.relations || [])
            .map(r => r.targetEntity)
            .filter(Boolean);

        if (targetEntityIds.length > 0) {
            const targetEntities = await EntityModel.find({ _id: { $in: targetEntityIds } })
                .select('_id slug')
                .lean();
            targetEntities.forEach(e => { entitySlugMap[e._id.toString()] = e.slug; });
        }
    }

    // Build result
    const result = [];
    for (const rel of relationsArray) {
        if (!rel.value) continue;
        const ids = Array.isArray(rel.value) ? rel.value : [rel.value];

        // Find target entity slug from entity relations definition
        const relDef = (entity.relations || []).find(r => r.key === rel.relationKey);
        const targetEntitySlug = relDef?.targetEntity
            ? entitySlugMap[relDef.targetEntity.toString()] || ''
            : '';

        const records = [];
        for (const id of ids) {
            if (!id) continue;
            const rr = recordMap[id.toString()];
            if (rr) {
                records.push({
                    _id: rr._id,
                    title: rr.computedTitle || rr.title || 'Sans titre',
                    entitySlug: targetEntitySlug
                });
            }
        }

        if (records.length > 0) {
            result.push({ relationKey: rel.relationKey, records });
        }
    }

    return result;
}


// ──────────────────────────────────────────────
// 4. FULL DENORM (called at save/update)
// ──────────────────────────────────────────────

/**
 * Compute all denormalized fields for a record.
 * Call this before saving to enrich the record data.
 * 
 * @param {Object} recordData - the record data being saved
 * @param {Object} entity - populated entity (with classifications, relations, referenceTitleTokens)
 * @param {Model} RecordModel - tenant Record model
 * @param {Model} EntityModel - tenant Entity model
 * @returns {Object} { computedTitle, classificationValues, _denorm }
 */
async function computeDenorm(recordData, entity, RecordModel, EntityModel) {
    const [computedTitle, denormRelations] = await Promise.all([
        computeTitle(recordData, entity, RecordModel),
        enrichRelations(recordData.relations || [], entity, RecordModel, EntityModel)
    ]);

    const enrichedClassifications = enrichClassifications(
        recordData.classificationValues || [], entity
    );

    return {
        computedTitle,
        classificationValues: enrichedClassifications,
        _denorm: { relations: denormRelations }
    };
}


// ──────────────────────────────────────────────
// 5. SYNC DEPENDENTS (when a referenced record changes)
// ──────────────────────────────────────────────

/**
 * Re-denormalize all records that reference the given record.
 * Uses bulkWrite for performance. Tenant-scoped.
 * 
 * @param {string} changedRecordId - the record that was modified
 * @param {Object} req - Express request (for tenant context)
 * @param {Object} options - { source } anti-cascade guard
 */
async function syncDependents(changedRecordId, req, options = {}) {
    // Anti-cascade guard: don't re-trigger if this was called by denorm itself
    if (options.source === 'denorm') return;

    const RecordModel = await tenantCollection(req, "Record");
    const EntityModel = await tenantCollection(req, "Entity");
    const DenormJobSchema = require('../models/denorm-job.model').schema;
    const DenormJobModel = req.tenantDbConnection.models.DenormJob ||
        req.tenantDbConnection.model('DenormJob', DenormJobSchema);

    // Create a job record
    const job = await DenormJobModel.create({
        trigger: 'record_updated',
        sourceRecordId: changedRecordId,
        status: 'running',
        startedAt: new Date()
    });

    try {
        // Find all records that reference this record in their relations
        const dependentRecords = await RecordModel.find({
            'relations.value': changedRecordId
        })
            .select('_id entityId customFields relations classificationValues title date description slug')
            .lean();

        if (dependentRecords.length === 0) {
            await DenormJobModel.findByIdAndUpdate(job._id, {
                status: 'done',
                affectedCount: 0,
                completedAt: new Date()
            });
            return;
        }

        // Group by entityId for batch processing
        const byEntity = {};
        for (const rec of dependentRecords) {
            const eid = rec.entityId.toString();
            if (!byEntity[eid]) byEntity[eid] = [];
            byEntity[eid].push(rec);
        }

        const bulkOps = [];

        for (const [entityId, records] of Object.entries(byEntity)) {
            const entity = await EntityModel.findById(entityId)
                .populate('customFields')
                .populate('statusClassification')
                .populate('classifications')
                .lean();

            if (!entity) continue;

            for (const rec of records) {
                const denorm = await computeDenorm(rec, entity, RecordModel, EntityModel);

                bulkOps.push({
                    updateOne: {
                        filter: { _id: rec._id },
                        update: {
                            $set: {
                                computedTitle: denorm.computedTitle,
                                classificationValues: denorm.classificationValues,
                                '_denorm.relations': denorm._denorm.relations
                            }
                        }
                    }
                });
            }
        }

        let affectedCount = 0;
        if (bulkOps.length > 0) {
            // Process in batches of 500
            for (let i = 0; i < bulkOps.length; i += 500) {
                const batch = bulkOps.slice(i, i + 500);
                const result = await RecordModel.bulkWrite(batch, { ordered: false });
                affectedCount += result.modifiedCount || 0;
            }
        }

        await DenormJobModel.findByIdAndUpdate(job._id, {
            status: 'done',
            affectedCount,
            completedAt: new Date()
        });

        console.log(`[Denorm] Synced ${affectedCount} dependent records for source ${changedRecordId}`);
    } catch (error) {
        console.error('[Denorm Sync Error]', error.message);

        const retries = (job.retries || 0) + 1;
        await DenormJobModel.findByIdAndUpdate(job._id, {
            status: retries >= job.maxRetries ? 'failed' : 'pending',
            error: error.message,
            retries
        });
    }
}


module.exports = {
    computeTitle,
    enrichClassifications,
    enrichRelations,
    computeDenorm,
    syncDependents
};
