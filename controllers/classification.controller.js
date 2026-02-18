const tenantCollection = require("../middleware/tenant").tenantCollection;
const mongoose = require("mongoose");

module.exports = {
    list: async (req, res) => {
        try {
            const Classification = await tenantCollection(req, "Classification");
            const classifications = await Classification.find().populate('entities', '_id name icon color');
            res.render("classification/classification-list", {
                account_number: req.account_number,
                layout: "layout-app",
                classifications,
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    },

    addForm: async (req, res) => {
        try {
            const Entity = await tenantCollection(req, "Entity");
            const allEntities = await Entity.find({}, '_id name icon color');
            res.render("classification/classification-edit", {
                account_number: req.account_number,
                layout: "layout-app",
                classification: null,
                allEntities,
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    },

    editForm: async (req, res) => {
        try {
            const Classification = await tenantCollection(req, "Classification");
            const Entity = await tenantCollection(req, "Entity");
            const classification = await Classification.findById(req.params.id);
            const allEntities = await Entity.find({}, '_id name icon color');
            res.render("classification/classification-edit", {
                account_number: req.account_number,
                layout: "layout-app",
                classification,
                allEntities,
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    },

    save: async (req, res) => {
        try {
            const Classification = await tenantCollection(req, "Classification");
            const { name, key, description, options, type, allowMultiple, defaultOptionId, entities } = req.body;

            const newClassification = new Classification({
                name,
                key,
                description,
                type: type || 'simple',
                allowMultiple: !!allowMultiple,
                entities: (entities || []).filter(Boolean),
                options: options || [],
                defaultOptionId: defaultOptionId || null,
                createdBy: req.user?._id
            });

            await newClassification.save();
            res.redirect(`/account/${req.account_number}/classification/list`);
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    },

    update: async (req, res) => {
        try {
            const Classification = await tenantCollection(req, "Classification");
            const RecordModel = await tenantCollection(req, "Record");
            const { name, key, description, options, type, allowMultiple, defaultOptionId, entities } = req.body;

            // 1. Get old version to handle cascade delete
            const oldCls = await Classification.findById(req.params.id);
            if (oldCls && options) {
                const oldIds = oldCls.options.map(o => o._id.toString());
                const newIds = options.filter(o => o._id).map(o => o._id.toString());
                const deletedIds = oldIds.filter(id => !newIds.includes(id));

                if (deletedIds.length > 0) {
                    // 2. Cascade delete: remove these options from all records
                    await RecordModel.updateMany(
                        { "classificationValues.optionId": { $in: deletedIds.map(id => new mongoose.Types.ObjectId(id)) } },
                        { $pull: { classificationValues: { optionId: { $in: deletedIds.map(id => new mongoose.Types.ObjectId(id)) } } } }
                    );
                }
            }

            await Classification.findByIdAndUpdate(req.params.id, {
                name,
                key,
                description,
                type: type || 'simple',
                allowMultiple: !!allowMultiple,
                entities: (entities || []).filter(Boolean),
                options: options || [],
                defaultOptionId: defaultOptionId || null
            });

            res.redirect(`/account/${req.account_number}/classification/list`);
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    },

    delete: async (req, res) => {
        try {
            const Classification = await tenantCollection(req, "Classification");
            const RecordModel = await tenantCollection(req, "Record");

            // Cascade delete: remove this classification from all records
            await RecordModel.updateMany(
                { "classificationValues.classificationId": req.params.id },
                { $pull: { classificationValues: { classificationId: req.params.id } } }
            );

            await Classification.findByIdAndDelete(req.params.id);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    list_Api: async (req, res) => {
        try {
            const Classification = await tenantCollection(req, "Classification");
            const { entityId } = req.query;
            let query = {};
            if (entityId) {
                // Return global classifications (no entities) + those assigned to this entity
                query = { $or: [{ entities: { $exists: true, $size: 0 } }, { entities: { $exists: false } }, { entities: entityId }] };
            }
            const classifications = await Classification.find(query).populate('entities', '_id name icon color');
            res.json(classifications);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // JSON API: Create classification (used by template system)
    createApi: async (req, res) => {
        try {
            const Classification = await tenantCollection(req, "Classification");
            const { name, slug, type, options, entities } = req.body;

            if (!name) return res.status(400).json({ error: 'Name is required' });

            // Generate a unique key (add short random suffix to avoid collisions)
            const baseKey = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const uniqueKey = baseKey + '-' + Date.now().toString(36).slice(-4);

            const newClassification = new Classification({
                name,
                key: uniqueKey,
                // Classification model only supports 'simple' or 'hierarchical'
                type: 'simple',
                allowMultiple: (type === 'tag' || type === 'category'),
                entities: (entities || []).filter(Boolean),
                options: (options || []).map((o, i) => ({
                    label: o.label,
                    color: o.color || '#4361ee',
                    icon: o.icon || 'solar:info-circle-bold',
                    type: 'normal',
                    order: o.order !== undefined ? o.order : i
                })),
                createdBy: req.user?._id
            });

            await newClassification.save();
            res.json({ success: true, classification: newClassification });
        } catch (err) {
            console.error('[ClassificationAPI] Create error:', err);
            res.status(500).json({ error: err.message });
        }
    },

    fastAdd: async (req, res) => {
        try {
            const { classificationId, label, parentId } = req.body;
            const Classification = await tenantCollection(req, "Classification");

            const classification = await Classification.findById(classificationId);
            if (!classification) return res.status(404).json({ error: "Classification non trouvée" });

            classification.options.push({
                label,
                color: '#4361ee', // Default
                icon: 'solar:info-circle-bold',
                type: 'normal',
                parentId: parentId || null,
                order: classification.options.length
            });

            await classification.save();
            res.json({ success: true, option: classification.options[classification.options.length - 1] });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    },

    reorderOptions: async (req, res) => {
        try {
            const { classificationId, options } = req.body;
            const Classification = await tenantCollection(req, "Classification");
            const classification = await Classification.findById(classificationId);
            if (!classification) return res.status(404).json({ error: "Classification non trouvée" });

            options.forEach(o => {
                const opt = classification.options.id(o.id);
                if (opt) {
                    opt.parentId = (o.parentId && o.parentId !== 'null' && o.parentId !== '') ? o.parentId : null;
                    opt.order = o.order;
                }
            });

            await classification.save();
            res.json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    }
};
