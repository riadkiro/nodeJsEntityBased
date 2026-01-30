const mongoose = require('mongoose');
const Entity = require("../models/entity.model");
const Record = require("../models/record.model");
const FieldTemplate = require("../models/field-template.model");
const tenantCollection = require("../middleware/tenant").tenantCollection;

module.exports = {
    list: async (req, res) => {
        try {
            await tenantCollection(req, "FieldTemplate");
            await tenantCollection(req, "Classification");
            const EntityModel = await tenantCollection(req, "Entity");
            const RecordModel = await tenantCollection(req, "Record");

            const entity = await EntityModel.findOne({ slug: req.params.entityName })
                .populate('customFields')
                .populate('statusClassification')
                .populate('classifications');
            if (!entity) return res.status(404).render("errors/404", {
                message: "Entity not found",
                account_number: req.account_number,
                layout: "layout-app"
            });

            const records = await RecordModel.find({ entityId: entity._id }).populate('customFields.field_id');

            res.render("record/record-list", {
                entity,
                records,
                account_number: req.account_number,
                preferences: req.user ? (req.user.preferences || {}) : {},
                layout: "layout-app"
            });
        } catch (error) {
            console.error(error);
            res.status(500).send("Server Error");
        }
    },

    // New list view with filters and datatable
    listView: async (req, res) => {
        try {
            const Entity = await tenantCollection(req, "Entity");
            const entity = await Entity.findOne({ slug: req.params.entityName })
                .populate('customFields')
                .populate('classifications')
                .populate('statusClassification');

            if (!entity) {
                return res.status(404).send("Entity not found");
            }

            res.render("record/record-list-view", {
                entity,
                layout: "layout-app",
                account_number: req.account_number,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send("Server Error");
        }
    },

    // API endpoint to get records as JSON
    listApi: async (req, res) => {
        try {
            const Entity = await tenantCollection(req, "Entity");
            const RecordModel = await tenantCollection(req, "Record");

            const entity = await Entity.findOne({ slug: req.params.entityName });
            if (!entity) {
                return res.status(404).json({ error: "Entity not found" });
            }

            const records = await RecordModel.find({ entityId: entity._id })
                .populate('customFields')
                .sort({ createdAt: -1 });

            res.json(records);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    tasks: async (req, res) => {
        try {
            await tenantCollection(req, "FieldTemplate");
            await tenantCollection(req, "Classification");
            const EntityModel = await tenantCollection(req, "Entity");
            const RecordModel = await tenantCollection(req, "Record");

            const entity = await EntityModel.findOne({ slug: req.params.entityName })
                .populate('customFields')
                .populate('statusClassification')
                .populate('classifications');
            if (!entity) return res.status(404).render("errors/404", {
                message: "Entity not found",
                account_number: req.account_number,
                layout: "layout-app"
            });

            const records = await RecordModel.find({ entityId: entity._id }).populate('customFields.field_id');

            res.render("record/record-tasks", {
                entity,
                records,
                account_number: req.account_number,
                preferences: req.user ? (req.user.preferences || {}) : {},
                layout: "layout-app"
            });
        } catch (error) {
            console.error(error);
            res.status(500).send("Server Error");
        }
    },

    addForm: async (req, res) => {
        try {
            await tenantCollection(req, "FieldTemplate");
            await tenantCollection(req, "Classification");
            const EntityModel = await tenantCollection(req, "Entity");

            const entity = await EntityModel.findOne({ slug: req.params.entityName })
                .populate('customFields')
                .populate('statusClassification')
                .populate('classifications');
            if (!entity) return res.status(404).render("errors/404", {
                message: "Entity not found",
                account_number: req.account_number,
                layout: "layout-app"
            });

            const allFieldTemplates = await tenantCollection(req, "FieldTemplate").then(m => m.find({}));

            res.render("record/record-add", {
                entity,
                fields: entity.customFields,
                formLayout: entity.layout || [],
                allFieldTemplates,
                account_number: req.account_number,
                layout: "layout-app"
            });
        } catch (error) {
            console.error(error);
            res.status(500).send("Server Error");
        }
    },

    save: async (req, res) => {
        try {
            const EntityModel = await tenantCollection(req, "Entity");
            const RecordModel = await tenantCollection(req, "Record");
            const entity = await EntityModel.findOne({ slug: req.params.entityName });
            if (!entity) return res.status(404).render("errors/404", {
                message: "Entity not found",
                account_number: req.account_number,
                layout: "layout-app"
            });

            // Check if request is JSON (from Quick Add)
            const isJson = req.headers['content-type']?.includes('application/json');

            if (isJson) {
                // Handle JSON request
                const { title, slug, date, entityId, customFields } = req.body;

                const customFieldsArray = [];
                if (customFields) {
                    for (const [fieldId, value] of Object.entries(customFields)) {
                        if (value !== null && value !== undefined && value !== '') {
                            customFieldsArray.push({ field_id: fieldId, value });
                        }
                    }
                }

                const newRecord = new RecordModel({
                    entityId: entity._id,
                    title: title || 'Sans titre',
                    slug: slug,
                    date: date,
                    published: true,
                    customFields: customFieldsArray,
                    createdBy: req.user?._id
                });

                await newRecord.save();
                return res.json({ success: true, _id: newRecord._id });
            }

            // 🛠️ Robust Body Parsing for Multipart/Form-Data (Multer doesn't nest objects)
            const data = { standard: {}, custom: {}, classifications: {} };

            Object.keys(req.body).forEach(key => {
                const match = key.match(/^(\w+)\[([^\]]+)\]/);
                if (match) {
                    const [_, group, field] = match;
                    if (data[group]) {
                        let val = req.body[key];
                        // Flatten array if it's a standard string field (standard browser/multer behavior)
                        if (Array.isArray(val) && group === 'standard' && field !== 'gallery') {
                            val = val.find(v => v !== '') || val[val.length - 1];
                        }
                        data[group][field] = val;
                    }
                } else if (key === 'standard' || key === 'custom' || key === 'classifications') {
                    if (typeof req.body[key] === 'object') {
                        data[key] = { ...data[key], ...req.body[key] };
                    }
                }
            });

            const { standard, custom, classifications } = data;

            // Fix boolean for published - use the already parsed 'standard.published'
            standard.published = (standard.published === 'on' || standard.published === true);

            // 🛡️ Final Safety for Status (Avoid CastError Array)
            if (standard.status && Array.isArray(standard.status)) {
                standard.status = standard.status.find(v => v !== '') || standard.status[standard.status.length - 1];
            }

            if (req.file) {
                standard.image = `/uploads/${req.account_number}/${req.file.filename}`;
            }

            const customFieldsArray = [];
            if (custom) {
                for (const [fieldId, value] of Object.entries(custom)) {
                    customFieldsArray.push({ field_id: fieldId, value });
                }
            }

            const classificationValuesArray = [];
            if (classifications) {
                for (const [classificationId, value] of Object.entries(classifications)) {
                    if (Array.isArray(value)) {
                        value.filter(v => v).forEach(optId => {
                            classificationValuesArray.push({ classificationId, optionId: optId });
                        });
                    } else if (value && value !== "") {
                        classificationValuesArray.push({ classificationId, optionId: value });
                    }
                }
            }

            const newRecord = new RecordModel({
                entityId: entity._id,
                ...standard,
                customFields: customFieldsArray,
                classificationValues: classificationValuesArray,
                createdBy: req.user._id
            });

            await newRecord.save();
            res.redirect(`/account/${req.account_number}/record/${entity.slug}/edit/${newRecord._id}?success=true`);
        } catch (error) {
            console.error(error);
            res.status(500).send("Server Error");
        }
    },

    editForm: async (req, res) => {
        try {
            await tenantCollection(req, "FieldTemplate");
            await tenantCollection(req, "Classification");
            const EntityModel = await tenantCollection(req, "Entity");
            const RecordModel = await tenantCollection(req, "Record");

            const entity = await EntityModel.findOne({ slug: req.params.entityName })
                .populate('customFields')
                .populate('statusClassification')
                .populate('classifications');
            if (!entity) return res.status(404).render("errors/404", {
                message: "Entity not found",
                account_number: req.account_number,
                layout: "layout-app"
            });

            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).send("Invalid Record ID");
            }
            const record = await RecordModel.findById(req.params.id);
            if (!record) return res.status(404).render("errors/404", {
                message: "Record not found",
                account_number: req.account_number,
                layout: "layout-app"
            });

            const allFieldTemplates = await tenantCollection(req, "FieldTemplate").then(m => m.find({}));

            res.render("record/record-edit", {
                entity,
                record,
                fields: entity.customFields,
                formLayout: entity.layout || [],
                allFieldTemplates,
                account_number: req.account_number,
                layout: "layout-app"
            });
        } catch (error) {
            console.error(error);
            res.status(500).send("Server Error");
        }
    },

    update: async (req, res) => {
        try {
            const EntityModel = await tenantCollection(req, "Entity");
            const RecordModel = await tenantCollection(req, "Record");
            const entity = await EntityModel.findOne({ slug: req.params.entityName });
            if (!entity) return res.status(404).render("errors/404", {
                message: "Entity not found",
                account_number: req.account_number,
                layout: "layout-app"
            });

            // 🛠️ Robust Body Parsing
            const data = { standard: {}, custom: {}, classifications: {} };

            Object.keys(req.body).forEach(key => {
                const match = key.match(/^(\w+)\[([^\]]+)\]/);
                if (match) {
                    const [_, group, field] = match;
                    if (data[group]) {
                        let val = req.body[key];
                        if (Array.isArray(val) && group === 'standard' && field !== 'gallery') {
                            val = val.find(v => v !== '') || val[val.length - 1];
                        }
                        data[group][field] = val;
                    }
                } else if (key === 'standard' || key === 'custom' || key === 'classifications') {
                    if (typeof req.body[key] === 'object') {
                        data[key] = { ...data[key], ...req.body[key] };
                    }
                }
            });

            const { standard, custom, classifications } = data;

            // Fix boolean for published - use the already parsed 'standard.published'
            standard.published = (standard.published === 'on' || standard.published === true);

            if (req.file) {
                standard.image = `/uploads/${req.account_number}/${req.file.filename}`;
            }

            const customFieldsArray = [];
            if (custom) {
                for (const [fieldId, value] of Object.entries(custom)) {
                    customFieldsArray.push({ field_id: fieldId, value });
                }
            }

            const classificationValuesArray = [];
            if (classifications) {
                for (const [classificationId, value] of Object.entries(classifications)) {
                    if (Array.isArray(value)) {
                        value.filter(v => v).forEach(optId => {
                            classificationValuesArray.push({ classificationId, optionId: optId });
                        });
                    } else if (value && value !== "") {
                        classificationValuesArray.push({ classificationId, optionId: value });
                    }
                }
            }

            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).send("Invalid Record ID");
            }
            await RecordModel.findByIdAndUpdate(req.params.id, {
                ...standard,
                customFields: customFieldsArray,
                classificationValues: classificationValuesArray,
                updatedBy: req.user._id
            });

            res.redirect(`/account/${req.account_number}/record/${entity.slug}/edit/${req.params.id}?success=true`);
        } catch (error) {
            console.error(error);
            res.status(500).send("Server Error");
        }
    },

    delete: async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).send("Invalid Record ID");
            }
            const RecordModel = await tenantCollection(req, "Record");
            await RecordModel.findByIdAndRemove(req.params.id);
            res.redirect(`/account/${req.account_number}/record/${req.params.entityName}/list`);
        } catch (error) {
            console.error(error);
            res.status(500).send("Server Error");
        }
    },

    searchAjax: async (req, res) => {
        try {
            const { entityId, q } = req.query;
            const RecordModel = await tenantCollection(req, "Record");

            let query = { entityId: entityId };
            if (q) {
                query.$or = [
                    { title: { $regex: q, $options: 'i' } },
                    { slug: { $regex: q, $options: 'i' } }
                ];
            } else if (req.query.ids) {
                const ids = req.query.ids.split(',');
                query._id = { $in: ids };
            }

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const skip = (page - 1) * limit;

            const records = await RecordModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('title slug _id');

            const total = await RecordModel.countDocuments(query);

            const formatted = records.map(r => ({
                id: r._id,
                label: r.title || r.slug || r._id.toString()
            }));

            res.json({
                data: formatted,
                meta: {
                    page,
                    limit,
                    total,
                    hasMore: total > (page * limit)
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Search failed" });
        }
    },

    updateStatus: async (req, res) => {
        try {
            const RecordModel = await tenantCollection(req, "Record");
            const { recordId, status } = req.body;

            const updatedRecord = await RecordModel.findByIdAndUpdate(recordId, { status }, { new: true });
            res.json({ success: true, record: updatedRecord });
        } catch (error) {
            console.error("[Record Controller] Update Status Error:", error);
            res.status(500).json({ error: error.message });
        }
    },

    updateClassification: async (req, res) => {
        try {
            const RecordModel = await tenantCollection(req, "Record");
            const { recordId, classificationId, optionId } = req.body;

            const record = await RecordModel.findById(recordId);
            if (!record) return res.status(404).json({ error: "Record not found" });

            // Remove existing values for this classification (Single Select Flow Behavior)
            record.classificationValues = record.classificationValues.filter(
                cv => cv.classificationId.toString() !== classificationId
            );

            // Add new value if it's not the "none" / "unclassified" column
            if (optionId && optionId !== 'none') {
                record.classificationValues.push({ classificationId, optionId });
            }

            await record.save();
            res.json({ success: true });
        } catch (error) {
            console.error("[Record Controller] Update Classification Error:", error);
            res.status(500).json({ error: error.message });
        }
    }
};
