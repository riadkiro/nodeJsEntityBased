const tenantCollection = require("../middleware/tenant").tenantCollection;
const mongoose = require("mongoose");

module.exports = {
    list: async (req, res) => {
        try {
            const Classification = await tenantCollection(req, "Classification");
            const classifications = await Classification.find();
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
        res.render("classification/classification-edit", {
            account_number: req.account_number,
            layout: "layout-app",
            classification: null,
        });
    },

    editForm: async (req, res) => {
        try {
            const Classification = await tenantCollection(req, "Classification");
            const classification = await Classification.findById(req.params.id);
            res.render("classification/classification-edit", {
                account_number: req.account_number,
                layout: "layout-app",
                classification,
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    },

    save: async (req, res) => {
        try {
            const Classification = await tenantCollection(req, "Classification");
            const { name, key, description, options, type, allowMultiple } = req.body;

            const newClassification = new Classification({
                name,
                key,
                description,
                type: type || 'simple',
                allowMultiple: !!allowMultiple,
                options: options || [],
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
            const { name, key, description, options, type, allowMultiple } = req.body;

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
                options: options || []
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
            const classifications = await Classification.find();
            res.json(classifications);
        } catch (err) {
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
