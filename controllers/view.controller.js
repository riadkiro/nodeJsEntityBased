const tenantCollection = require("../middleware/tenant").tenantCollection;
const mongoose = require("mongoose");

module.exports = {
    renderView: async (req, res) => {
        try {
            const ViewModel = await tenantCollection(req, "View");
            const EntityModel = await tenantCollection(req, "Entity");
            const RecordModel = await tenantCollection(req, "Record");
            await tenantCollection(req, "FieldTemplate");
            await tenantCollection(req, "Classification");
            const UserModel = await tenantCollection(req, "User"); // ✅

            const viewId = req.params.viewId;
            if (!mongoose.Types.ObjectId.isValid(viewId)) {
                return res.status(400).send("Invalid View ID");
            }

            const view = await ViewModel.findById(viewId);
            if (!view) return res.status(404).send("View not found");

            const entity = await EntityModel.findById(view.entity)
                .populate('customFields')
                .populate('statusClassification')
                .populate('classifications');
            if (!entity) return res.status(404).send("Entity not found");

            // ✅ récup prefs
            let preferences = {};
            if (req.user?._id) {
                const user = await UserModel.findById(req.user._id).select("preferences");
                preferences = user?.preferences || {};
            }

            // Build dynamic query
            let query = { entityId: entity._id };

            if (view.filters && view.filters.length > 0) {
                const filterQueries = view.filters.map(f => {
                    const isStandard = ['title', 'slug', 'status', 'createdAt'].includes(f.field);

                    let operatorValue;
                    switch (f.operator) {
                        case 'equals': operatorValue = f.value; break;
                        case 'not_equals': operatorValue = { $ne: f.value }; break;
                        case 'contains': operatorValue = { $regex: f.value, $options: 'i' }; break;
                        case 'greater_than': operatorValue = { $gt: f.value }; break;
                        case 'less_than': operatorValue = { $lt: f.value }; break;
                        case 'in': operatorValue = { $in: Array.isArray(f.value) ? f.value : [f.value] }; break;
                        default: operatorValue = f.value;
                    }

                    if (isStandard) {
                        return { [f.field]: operatorValue };
                    } else {
                        // Custom field filtering
                        return { customFields: { $elemMatch: { field_id: f.field, value: operatorValue } } };
                    }
                });

                if (filterQueries.length > 0) {
                    query.$and = filterQueries;
                }
            }

            // Sorting
            let sort = { createdAt: -1 };
            if (view.settings && view.settings.sortBy) {
                sort = { [view.settings.sortBy.field]: view.settings.sortBy.direction === 'asc' ? 1 : -1 };
            }

            const records = await RecordModel.find(query).sort(sort).populate('customFields.field_id').lean();

            // Compute referenceTitle for each record from entity.referenceTitleTokens
            const tokens = entity.referenceTitleTokens || [{ t: 'field', id: 'title' }];

            // Pre-load related records for rel: tokens
            const relTokens = tokens.filter(t => t.t === 'field' && t.id && t.id.startsWith('rel:'));
            const relatedRecordsMap = {};
            if (relTokens.length > 0) {
                const allRelatedIds = new Set();
                for (const record of records) {
                    for (const rt of relTokens) {
                        const dotIdx = rt.id.indexOf('.');
                        const relKey = rt.id.substring(4, dotIdx);
                        const rv = (record.relations || []).find(rel => rel.relationKey === relKey);
                        if (rv && rv.value) {
                            const ids = Array.isArray(rv.value) ? rv.value : [rv.value];
                            ids.forEach(id => allRelatedIds.add(id.toString()));
                        }
                    }
                }
                if (allRelatedIds.size > 0) {
                    const relatedRecords = await RecordModel.find({ _id: { $in: [...allRelatedIds] } })
                        .select('title slug description date customFields')
                        .populate({ path: 'customFields.field_id', select: 'label fieldType' })
                        .lean();
                    relatedRecords.forEach(rr => { relatedRecordsMap[rr._id.toString()] = rr; });
                }
            }

            records.forEach(record => {
                const parts = tokens.map(token => {
                    if (token.t === 'text') return token.v || '';
                    if (token.t === 'field') {
                        // Relation sub-field: rel:<relKey>.<subFieldId>
                        if (token.id && token.id.startsWith('rel:')) {
                            const dotIdx = token.id.indexOf('.');
                            const relKey = token.id.substring(4, dotIdx);
                            const subFieldId = token.id.substring(dotIdx + 1);
                            const rv = (record.relations || []).find(rel => rel.relationKey === relKey);
                            if (rv && rv.value) {
                                const targetId = Array.isArray(rv.value) ? rv.value[0] : rv.value;
                                const targetRecord = relatedRecordsMap[targetId?.toString()];
                                if (targetRecord) {
                                    if (['title', 'slug', 'date', 'description'].includes(subFieldId)) {
                                        return targetRecord[subFieldId] || '';
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
                        if (['title', 'slug', 'date', 'description'].includes(token.id)) {
                            return record[token.id] || '';
                        }
                        // Custom fields — match by field_id
                        if (record.customFields && Array.isArray(record.customFields)) {
                            const cf = record.customFields.find(c => {
                                const cfId = c.field_id?._id || c.field_id;
                                return cfId && cfId.toString() === token.id;
                            });
                            return cf?.value || '';
                        }
                    }
                    return '';
                });
                record.referenceTitle = parts.join('').trim() || record.title || 'Sans titre';
            });

            res.render("record/record-view-progressive", {
                view,
                entity,
                records,
                account_number: req.account_number,
                preferences,                 // ✅ IMPORTANT
                layout: "layout-app"
            });

        } catch (error) {
            console.error("[View Controller] Error:", error);
            res.status(500).send("Server Error");
        }
    },

    saveConfig: async (req, res) => {
        try {
            const ViewModel = await tenantCollection(req, "View");
            const { viewId, viewType, filters, settings } = req.body;

            const updatedView = await ViewModel.findByIdAndUpdate(viewId, {
                viewType,
                filters,
                settings
            }, { new: true });

            res.json({ success: true, view: updatedView });
        } catch (error) {
            console.error("[View Controller] Save Config Error:", error);
            res.status(500).json({ error: error.message });
        }
    }
};
