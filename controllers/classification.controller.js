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
            const { name, key, description, options, type, allowMultiple } = req.body;

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
