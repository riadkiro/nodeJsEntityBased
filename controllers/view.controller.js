const tenantCollection = require("../middleware/tenant").tenantCollection;
const mongoose = require("mongoose");
const { buildRecordFilterQuery, sanitizeViewFilters } = require('../services/record-filter-query');

function slugBase(name) {
    return String(name || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'vue';
}

async function uniqueViewSlug(ViewModel, entityId, name, currentViewId = null) {
    const base = slugBase(name);
    const query = { entity: entityId, slug: base };
    if (currentViewId) query._id = { $ne: currentViewId };
    const existing = await ViewModel.findOne(query).select('_id').lean();
    if (!existing) return base;

    let counter = 2;
    while (await ViewModel.findOne({
        entity: entityId,
        slug: `${base}-${counter}`,
        ...(currentViewId ? { _id: { $ne: currentViewId } } : {})
    }).select('_id').lean()) {
        counter++;
    }
    return `${base}-${counter}`;
}

async function resolveViewForConfig(req, ViewModel, candidateId) {
    const directView = await ViewModel.findById(candidateId);
    if (directView) return directView;

    const EntityModel = await tenantCollection(req, "Entity");
    const entity = await EntityModel.findById(candidateId).select('_id name namePlural slug').lean();
    if (!entity) return null;

    const fallbackView = await ViewModel.findOne({
        entity: entity._id,
        viewType: { $in: ['list', 'table'] }
    }).sort({ order: 1, createdAt: 1 });
    if (fallbackView) return fallbackView;

    return ViewModel.create({
        name: entity.namePlural || entity.name || 'Vue',
        slug: entity.slug || `view-${entity._id}`,
        entity: entity._id,
        viewType: 'list',
        settings: {}
    });
}

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
            const viewFilterQuery = buildRecordFilterQuery(view.filters || []);
            if (Object.keys(viewFilterQuery).length > 0) {
                query = { $and: [query, viewFilterQuery] };
            }

            // Sorting
            let sort = { createdAt: -1 };
            if (view.settings && view.settings.sortBy) {
                sort = { [view.settings.sortBy.field]: view.settings.sortBy.direction === 'asc' ? 1 : -1 };
            }

            const records = await RecordModel.find(query).sort(sort).populate('customFields.field_id').lean();

            // Use pre-computed title (denormalized at save time)
            // If computedTitle is missing (un-migrated records), fall back to live resolution
            const denormService = require('../services/record-denorm.service');
            const tokens = entity.referenceTitleTokens || [{ t: 'field', id: 'title' }];
            const hasRelTokens = tokens.some(t => t.t === 'field' && t.id && t.id.startsWith('rel:'));

            // Only load related records if there are un-migrated records with rel: tokens
            const unmigrated = hasRelTokens ? records.filter(r => !r.computedTitle) : [];
            let relatedRecordsMap = {};

            if (unmigrated.length > 0) {
                const allRelatedIds = new Set();
                const relTokens = tokens.filter(t => t.t === 'field' && t.id && t.id.startsWith('rel:'));
                for (const record of unmigrated) {
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
                    const relRecs = await RecordModel.find({ _id: { $in: [...allRelatedIds] } })
                        .select('title slug description date customFields computedTitle')
                        .populate({ path: 'customFields.field_id', select: 'label fieldType' })
                        .lean();
                    relRecs.forEach(rr => { relatedRecordsMap[rr._id.toString()] = rr; });
                }
            }

            for (const record of records) {
                if (record.computedTitle) {
                    // Use denormalized title (fast path)
                    record.referenceTitle = record.computedTitle;
                } else {
                    // Live fallback for un-migrated records
                    record.referenceTitle = await denormService.computeTitle(record, entity, RecordModel)
                        || record.title || 'Sans titre';
                }
            }

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
            const { viewId, viewType, filters, settings, name } = req.body;
            if (!mongoose.Types.ObjectId.isValid(String(viewId || ''))) {
                return res.status(400).json({ success: false, error: 'Invalid View ID' });
            }

            const targetView = await resolveViewForConfig(req, ViewModel, viewId);
            if (!targetView) {
                return res.status(404).json({ success: false, error: 'View not found' });
            }

            const update = {};
            const cleanName = typeof name === 'string' ? name.trim() : '';
            if (cleanName) {
                update.name = cleanName;
                update.slug = await uniqueViewSlug(ViewModel, targetView.entity, cleanName, targetView._id);
            }
            if (viewType !== undefined) update.viewType = viewType;
            if (filters !== undefined) update.filters = sanitizeViewFilters(filters);
            if (settings !== undefined && settings && typeof settings === 'object') {
                Object.keys(settings).forEach(key => {
                    update[`settings.${key}`] = settings[key];
                });
            }

            const updatedView = await ViewModel.findByIdAndUpdate(targetView._id, update, { new: true });

            res.json({ success: true, view: updatedView });
        } catch (error) {
            console.error("[View Controller] Save Config Error:", error);
            res.status(500).json({ error: error.message });
        }
    }
};
