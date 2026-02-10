const mongoose = require('mongoose');
const Entity = require("../models/entity.model");
const Record = require("../models/record.model");
const FieldTemplate = require("../models/field-template.model");
const tenantCollection = require("../middleware/tenant").tenantCollection;
const WorkflowTriggers = require("../src/integrations/services/WorkflowTriggers");

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
            console.log('[Record addForm] CALLED with formId:', req.query.formId, 'entity:', req.params.entityName);
            await tenantCollection(req, "FieldTemplate");
            await tenantCollection(req, "Classification");
            const EntityModel = await tenantCollection(req, "Entity");

            const entity = await EntityModel.findOne({ slug: req.params.entityName })
                .populate('customFields')
                .populate('statusClassification')
                .populate('classifications')
                .populate('relations.targetEntity');
            if (!entity) return res.status(404).render("errors/404", {
                message: "Entity not found",
                account_number: req.account_number,
                layout: "layout-app"
            });

            const allFieldTemplates = await tenantCollection(req, "FieldTemplate").then(m => m.find({}));

            // Try to load from EntityForm (multi-form architecture)
            let resolvedLayout = entity.layout || [];
            let activeFormName = null;
            let entityFormLayout = null; // Full row/column layout from EntityForm
            let entityFormFieldDefs = null; // Field definitions for EntityForm rendering
            const EntityForm = await tenantCollection(req, "EntityForm");

            if (EntityForm) {
                let selectedForm = null;

                if (req.query.formId) {
                    // Specific form requested
                    selectedForm = await EntityForm.findById(req.query.formId);
                    console.log('[Record] FormId requested:', req.query.formId, 'Found:', !!selectedForm);
                } else {
                    // Auto-select: default published form, or first published form
                    selectedForm = await EntityForm.findOne({ entityId: entity._id, isDefault: true, status: 'published' });
                    if (!selectedForm) {
                        selectedForm = await EntityForm.findOne({ entityId: entity._id, status: 'published' }).sort({ order: 1 });
                    }
                    console.log('[Record] Auto-select form for entity:', entity._id, 'Found:', !!selectedForm);
                }

                if (selectedForm) {
                    console.log('[Record] Selected form:', selectedForm.name, 'Status:', selectedForm.status, 'Has layout.version:', !!selectedForm.layout?.version, 'Rows:', selectedForm.layout?.rows?.length);
                }

                if (selectedForm && selectedForm.layout && selectedForm.layout.version) {
                    activeFormName = selectedForm.name;

                    // Pass the full EntityForm layout for native rendering
                    entityFormLayout = selectedForm.layout;

                    // Build field definitions map for the template
                    const standardFieldDefs = {
                        title: { key: 'title', label: 'Titre', icon: 'solar:text-bold', inputType: 'text', inputName: 'standard[title]' },
                        description: { key: 'description', label: 'Description', icon: 'solar:document-text-bold-duotone', inputType: 'textarea', inputName: 'standard[description]' },
                        slug: { key: 'slug', label: 'Slug', icon: 'solar:link-bold', inputType: 'text', inputName: 'standard[slug]' },
                        date: { key: 'date', label: 'Date', icon: 'solar:calendar-bold-duotone', inputType: 'date', inputName: 'standard[date]' },
                        icon: { key: 'icon', label: 'Icône', icon: 'solar:star-bold-duotone', inputType: 'text', inputName: 'standard[icon]' },
                        image: { key: 'image', label: 'Image', icon: 'solar:gallery-bold-duotone', inputType: 'file', inputName: 'standard[image]' },
                        attachments: { key: 'attachments', label: 'Pièces jointes', icon: 'solar:paperclip-bold', inputType: 'file', inputName: 'standard[attachments]' }
                    };

                    const customFieldDefs = {};
                    (entity.customFields || []).forEach(cf => {
                        const typeConfig = cf.type_config || {};
                        customFieldDefs[cf._id.toString()] = {
                            _id: cf._id.toString(),
                            name: cf.name,
                            label: cf.label,
                            type: cf.type,
                            inputType: cf.inputType || cf.type || 'text',
                            htmlTemplate: cf.htmlTemplate || '',
                            options: typeConfig.options || cf.options || [],
                            multiple: typeConfig.multiple || false,
                            type_config: typeConfig,
                            ui: cf.ui || {}
                        };
                    });

                    const relationDefs = {};
                    (entity.relations || []).forEach(r => {
                        relationDefs[r.key] = {
                            key: r.key,
                            label: r.label,
                            cardinality: r.cardinality,
                            inputMode: r.inputMode || 'autocomplete',
                            searchFields: r.searchFields || [],
                            displayFields: r.displayFields || [],
                            targetEntity: r.targetEntity ? {
                                _id: (r.targetEntity._id || r.targetEntity).toString(),
                                name: r.targetEntity.name || '',
                                slug: r.targetEntity.slug || '',
                                icon: r.targetEntity.icon || '',
                                color: r.targetEntity.color || ''
                            } : null
                        };
                    });

                    const classificationDefs = {};
                    (entity.classifications || []).forEach(c => {
                        const cls = typeof c === 'object' ? c : null;
                        if (cls) {
                            classificationDefs[cls._id.toString()] = {
                                _id: cls._id.toString(),
                                name: cls.name,
                                options: (cls.options || []).map(o => ({ label: o.label || o.name || o, color: o.color || '' }))
                            };
                        }
                    });

                    entityFormFieldDefs = {
                        standard: standardFieldDefs,
                        custom: customFieldDefs,
                        relation: relationDefs,
                        classification: classificationDefs
                    };

                    // Also build flat layout for legacy canvas (custom fields only)
                    const flatFields = [];
                    (selectedForm.layout.rows || []).forEach(row => {
                        row.columns.forEach(col => {
                            (col.fields || []).forEach(field => {
                                if (field.type === 'custom') {
                                    flatFields.push({
                                        fieldId: field.fieldId,
                                        width: col.width,
                                        id: field.id,
                                        tabId: 'default'
                                    });
                                }
                            });
                        });
                    });
                    resolvedLayout = { tabs: [{ id: 'default', title: 'Attributs', icon: 'tabler:apps' }], fields: flatFields };
                }
            } else {
                console.log('[Record] EntityForm model NOT loaded');
            }

            // Fallback to legacy Entity.formLayout if no EntityForm was found
            if (!activeFormName && entity.formLayoutStatus === 'published' && entity.formLayout && entity.formLayout.version) {
                const flatFields = [];
                (entity.formLayout.rows || []).forEach(row => {
                    row.columns.forEach(col => {
                        (col.fields || []).forEach(field => {
                            if (field.type === 'custom') {
                                flatFields.push({
                                    fieldId: field.fieldId,
                                    width: col.width,
                                    id: field.id,
                                    tabId: 'default'
                                });
                            }
                        });
                    });
                });
                resolvedLayout = { tabs: [{ id: 'default', title: 'Attributs', icon: 'tabler:apps' }], fields: flatFields };
            }

            res.render("record/record-add", {
                entity,
                fields: entity.customFields,
                formLayout: resolvedLayout,
                formLayoutStatus: entity.formLayoutStatus || 'draft',
                activeFormName,
                entityFormLayout,
                entityFormFieldDefs,
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
                    const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
                    for (const [fieldId, value] of Object.entries(customFields)) {
                        if (value !== null && value !== undefined && value !== '') {
                            // Skip non-ObjectId keys (e.g. relation UUID keys)
                            if (!isValidObjectId(fieldId)) continue;
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

                // Emit workflow trigger (async, non-blocking)
                const WorkflowJobSchema = require("../src/integrations/models/WorkflowJob.model").schema;
                const WorkflowJobModel = req.tenantDbConnection.models.WorkflowJob ||
                    req.tenantDbConnection.model('WorkflowJob', WorkflowJobSchema);
                WorkflowTriggers.emitRecordCreated({
                    WorkflowJobModel,
                    workspaceId: req.account_number,
                    entityId: entity._id.toString(),
                    record: newRecord.toObject()
                }).catch(err => console.error('[Workflow Trigger Error]', err));

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
                const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
                for (const [fieldId, value] of Object.entries(custom)) {
                    // Skip non-ObjectId keys (e.g. relation UUID keys like "1ce30e77-...")
                    if (!isValidObjectId(fieldId)) continue;
                    // Parse JSON string values (e.g. recurrence field sends serialized JSON)
                    let parsedValue = value;
                    if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
                        try { parsedValue = JSON.parse(value); } catch (e) { }
                    }
                    customFieldsArray.push({ field_id: fieldId, value: parsedValue });
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

            // Emit workflow trigger (async, non-blocking)
            const WorkflowJobSchema = require("../src/integrations/models/WorkflowJob.model").schema;
            const WorkflowJobModel = req.tenantDbConnection.models.WorkflowJob ||
                req.tenantDbConnection.model('WorkflowJob', WorkflowJobSchema);
            WorkflowTriggers.emitRecordCreated({
                WorkflowJobModel,
                workspaceId: req.account_number,
                entityId: entity._id.toString(),
                record: newRecord.toObject()
            }).catch(err => console.error('[Workflow Trigger Error]', err));

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
                .populate('classifications')
                .populate('relations.targetEntity');
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

            // Build record values map for pre-population
            const recordValues = {};
            (record.customFields || []).forEach(cv => {
                const fid = (cv.field_id?._id || cv.field_id || '').toString();
                if (fid) recordValues[fid] = cv.value;
            });

            // Try to load from EntityForm (multi-form architecture)
            let resolvedLayout = entity.layout || [];
            let activeFormName = null;
            let entityFormLayout = null;
            let entityFormFieldDefs = null;
            const EntityForm = await tenantCollection(req, "EntityForm");

            if (EntityForm) {
                let selectedForm = null;

                if (req.query.formId) {
                    selectedForm = await EntityForm.findById(req.query.formId);
                } else {
                    selectedForm = await EntityForm.findOne({ entityId: entity._id, isDefault: true, status: 'published' });
                    if (!selectedForm) {
                        selectedForm = await EntityForm.findOne({ entityId: entity._id, status: 'published' }).sort({ order: 1 });
                    }
                }

                if (selectedForm && selectedForm.layout && selectedForm.layout.version) {
                    activeFormName = selectedForm.name;
                    entityFormLayout = selectedForm.layout;

                    // Build field definitions map
                    const standardFieldDefs = {
                        title: { key: 'title', label: 'Titre', icon: 'solar:text-bold', inputType: 'text', inputName: 'standard[title]' },
                        description: { key: 'description', label: 'Description', icon: 'solar:document-text-bold-duotone', inputType: 'textarea', inputName: 'standard[description]' },
                        slug: { key: 'slug', label: 'Slug', icon: 'solar:link-bold', inputType: 'text', inputName: 'standard[slug]' },
                        date: { key: 'date', label: 'Date', icon: 'solar:calendar-bold-duotone', inputType: 'date', inputName: 'standard[date]' },
                        icon: { key: 'icon', label: 'Icône', icon: 'solar:star-bold-duotone', inputType: 'text', inputName: 'standard[icon]' },
                        image: { key: 'image', label: 'Image', icon: 'solar:gallery-bold-duotone', inputType: 'file', inputName: 'standard[image]' },
                        attachments: { key: 'attachments', label: 'Pièces jointes', icon: 'solar:paperclip-bold', inputType: 'file', inputName: 'standard[attachments]' }
                    };

                    const customFieldDefs = {};
                    (entity.customFields || []).forEach(cf => {
                        const typeConfig = cf.type_config || {};
                        customFieldDefs[cf._id.toString()] = {
                            _id: cf._id.toString(),
                            name: cf.name,
                            label: cf.label,
                            type: cf.type,
                            inputType: cf.inputType || cf.type || 'text',
                            htmlTemplate: cf.htmlTemplate || '',
                            options: typeConfig.options || cf.options || [],
                            multiple: typeConfig.multiple || false,
                            type_config: typeConfig,
                            ui: cf.ui || {}
                        };
                    });

                    const relationDefs = {};
                    (entity.relations || []).forEach(r => {
                        relationDefs[r.key] = {
                            key: r.key,
                            label: r.label,
                            cardinality: r.cardinality,
                            inputMode: r.inputMode || 'autocomplete',
                            searchFields: r.searchFields || [],
                            displayFields: r.displayFields || [],
                            targetEntity: r.targetEntity ? {
                                _id: (r.targetEntity._id || r.targetEntity).toString(),
                                name: r.targetEntity.name || '',
                                slug: r.targetEntity.slug || '',
                                icon: r.targetEntity.icon || '',
                                color: r.targetEntity.color || ''
                            } : null
                        };
                    });

                    const classificationDefs = {};
                    (entity.classifications || []).forEach(c => {
                        const cls = typeof c === 'object' ? c : null;
                        if (cls) {
                            classificationDefs[cls._id.toString()] = {
                                _id: cls._id.toString(),
                                name: cls.name,
                                options: (cls.options || []).map(o => ({ label: o.label || o.name || o, color: o.color || '', _id: (o._id || '').toString() }))
                            };
                        }
                    });

                    entityFormFieldDefs = {
                        standard: standardFieldDefs,
                        custom: customFieldDefs,
                        relation: relationDefs,
                        classification: classificationDefs
                    };

                    // Build flat layout for legacy canvas fallback
                    const flatFields = [];
                    (selectedForm.layout.rows || []).forEach(row => {
                        row.columns.forEach(col => {
                            (col.fields || []).forEach(field => {
                                if (field.type === 'custom') {
                                    flatFields.push({
                                        fieldId: field.fieldId,
                                        width: col.width,
                                        id: field.id,
                                        tabId: 'default'
                                    });
                                }
                            });
                        });
                    });
                    resolvedLayout = { tabs: [{ id: 'default', title: 'Attributs', icon: 'tabler:apps' }], fields: flatFields };
                }
            }

            // Fallback to legacy Entity.formLayout
            if (!activeFormName && entity.formLayoutStatus === 'published' && entity.formLayout && entity.formLayout.version) {
                const flatFields = [];
                (entity.formLayout.rows || []).forEach(row => {
                    row.columns.forEach(col => {
                        (col.fields || []).forEach(field => {
                            if (field.type === 'custom') {
                                flatFields.push({
                                    fieldId: field.fieldId,
                                    width: col.width,
                                    id: field.id,
                                    tabId: 'default'
                                });
                            }
                        });
                    });
                });
                resolvedLayout = { tabs: [{ id: 'default', title: 'Attributs', icon: 'tabler:apps' }], fields: flatFields };
            }

            res.render("record/record-edit", {
                entity,
                record,
                fields: entity.customFields,
                formLayout: resolvedLayout,
                formLayoutStatus: entity.formLayoutStatus || 'draft',
                activeFormName,
                entityFormLayout,
                entityFormFieldDefs,
                recordValues,
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
                    // Parse JSON string values (e.g. recurrence field sends serialized JSON)
                    let parsedValue = value;
                    if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
                        try { parsedValue = JSON.parse(value); } catch (e) { }
                    }
                    customFieldsArray.push({ field_id: fieldId, value: parsedValue });
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
            const updatedRecord = await RecordModel.findByIdAndUpdate(req.params.id, {
                ...standard,
                customFields: customFieldsArray,
                classificationValues: classificationValuesArray,
                updatedBy: req.user._id
            }, { new: true });

            // Emit workflow trigger (async, non-blocking)
            const WorkflowJobSchema = require("../src/integrations/models/WorkflowJob.model").schema;
            const WorkflowJobModel = req.tenantDbConnection.models.WorkflowJob ||
                req.tenantDbConnection.model('WorkflowJob', WorkflowJobSchema);
            WorkflowTriggers.emitRecordUpdated({
                WorkflowJobModel,
                workspaceId: req.account_number,
                entityId: entity._id.toString(),
                record: updatedRecord.toObject(),
                changes: { ...standard, customFields: customFieldsArray }
            }).catch(err => console.error('[Workflow Trigger Error]', err));

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
            const displayFieldIds = req.query.displayFields ? req.query.displayFields.split(',') : [];
            const RecordModel = await tenantCollection(req, "Record");
            const Entity = await tenantCollection(req, "Entity");

            let query = { entityId: entityId };
            if (q) {
                query.$or = [
                    { title: { $regex: q, $options: 'i' } },
                    { slug: { $regex: q, $options: 'i' } },
                    { 'customFields.value': { $regex: q, $options: 'i' } }
                ];
            } else if (req.query.ids) {
                const ids = req.query.ids.split(',');
                query._id = { $in: ids };
            }

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const skip = (page - 1) * limit;

            // Get entity to access referenceTitleTokens
            const entity = await Entity.findById(entityId).select('referenceTitleTokens').lean();
            const tokens = entity?.referenceTitleTokens || [{ t: 'field', id: 'title' }];

            const records = await RecordModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('title slug _id customFields')
                .populate({ path: 'customFields.field_id', select: 'label fieldType' })
                .lean();

            const total = await RecordModel.countDocuments(query);

            const formatted = records.map(r => {
                // Compute referenceTitle from tokens
                const parts = tokens.map(token => {
                    if (token.t === 'text') return token.v || '';
                    if (token.t === 'field') {
                        if (['title', 'slug', 'date', 'description'].includes(token.id)) {
                            return r[token.id] || '';
                        }
                        if (r.customFields && Array.isArray(r.customFields)) {
                            const cf = r.customFields.find(c => {
                                const cfId = c.field_id?._id || c.field_id;
                                return cfId && cfId.toString() === token.id;
                            });
                            return cf?.value || '';
                        }
                    }
                    return '';
                });
                const label = parts.join('').trim() || r.title || r.slug || r._id.toString();

                const result = { id: r._id, label };

                // If displayFields requested, add field values for modal picker
                if (displayFieldIds.length > 0 && r.customFields) {
                    result.fields = {};
                    // Standard fields
                    ['title', 'slug', 'date', 'description'].forEach(key => {
                        if (displayFieldIds.includes(key)) {
                            result.fields[key] = r[key] || '';
                        }
                    });
                    // Custom fields
                    r.customFields.forEach(cf => {
                        const cfId = (cf.field_id?._id || cf.field_id)?.toString();
                        if (cfId && displayFieldIds.includes(cfId)) {
                            result.fields[cfId] = cf.value || '';
                        }
                    });
                }

                return result;
            });

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
    },

    // ===== Record Detail Page (Fiche) =====
    detailPage: async (req, res) => {
        try {
            await tenantCollection(req, "FieldTemplate");
            await tenantCollection(req, "Classification");
            const EntityModel = await tenantCollection(req, "Entity");
            const RecordModel = await tenantCollection(req, "Record");

            // Load entity with all related data
            const entity = await EntityModel.findOne({ slug: req.params.entityName })
                .populate('customFields')
                .populate('statusClassification')
                .populate('classifications')
                .populate('relations.targetEntity');

            if (!entity) return res.status(404).render("errors/404", {
                message: "Collection introuvable",
                account_number: req.account_number,
                layout: "layout-app"
            });

            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).render("errors/404", {
                    message: "ID de fiche invalide",
                    account_number: req.account_number,
                    layout: "layout-app"
                });
            }

            const record = await RecordModel.findById(req.params.id)
                .populate('createdBy', 'name email avatar')
                .populate('updatedBy', 'name email avatar');

            if (!record) return res.status(404).render("errors/404", {
                message: "Fiche introuvable",
                account_number: req.account_number,
                layout: "layout-app"
            });

            // Build record values map for display
            const recordValues = {};
            (record.customFields || []).forEach(cv => {
                const fid = (cv.field_id?._id || cv.field_id || '').toString();
                if (fid) recordValues[fid] = cv.value;
            });

            // Build field definitions for template
            const fieldDefs = [];
            (entity.customFields || []).forEach(cf => {
                if (!cf) return;
                const typeConfig = cf.type_config || {};
                fieldDefs.push({
                    _id: cf._id.toString(),
                    name: cf.name,
                    label: cf.label || cf.name,
                    type: cf.type,
                    icon: cf.ui?.icon || 'solar:widget-bold-duotone',
                    options: typeConfig.options || cf.options || [],
                    multiple: typeConfig.multiple || false,
                    type_config: typeConfig,
                    ui: cf.ui || {}
                });
            });

            // Load classifications data for display
            const classificationValues = record.classificationValues || [];
            const classificationDisplay = [];
            if (entity.statusClassification && classificationValues.length > 0) {
                const statusClassif = entity.statusClassification;
                const statusValue = classificationValues.find(
                    cv => cv.classificationId?.toString() === statusClassif._id?.toString()
                );
                if (statusValue && statusClassif.options) {
                    const option = statusClassif.options.find(
                        o => o._id?.toString() === statusValue.optionId?.toString()
                    );
                    if (option) {
                        classificationDisplay.push({
                            name: statusClassif.name,
                            label: option.label,
                            color: option.color || '#888',
                            isStatus: true
                        });
                    }
                }
            }
            if (entity.classifications && entity.classifications.length > 0) {
                entity.classifications.forEach(classif => {
                    const cv = classificationValues.find(
                        v => v.classificationId?.toString() === classif._id?.toString()
                    );
                    if (cv && classif.options) {
                        const option = classif.options.find(
                            o => o._id?.toString() === cv.optionId?.toString()
                        );
                        if (option) {
                            classificationDisplay.push({
                                name: classif.name,
                                label: option.label,
                                color: option.color || '#888',
                                isStatus: false
                            });
                        }
                    }
                });
            }

            // Load relation data
            const relationData = {};
            if (entity.relations && entity.relations.length > 0) {
                for (const rel of entity.relations) {
                    const cv = (record.customFields || []).find(
                        c => (c.field_id?._id || c.field_id || '').toString() === rel.key
                    );
                    if (cv && cv.value) {
                        const targetEntitySlug = rel.targetEntity?.slug;
                        if (rel.targetEntity) {
                            const TargetRecord = await tenantCollection(req, "Record");
                            const ids = Array.isArray(cv.value) ? cv.value : [cv.value];
                            const relatedRecords = await TargetRecord.find({ _id: { $in: ids } })
                                .select('title slug image icon');
                            relationData[rel.key] = {
                                label: rel.label,
                                targetSlug: targetEntitySlug,
                                records: relatedRecords
                            };
                        }
                    }
                }
            }

            // Load custom pages (PageConfig type: record_page) for this entity
            let customPages = [];
            try {
                const PageConfig = await tenantCollection(req, "PageConfig");
                customPages = await PageConfig.find({
                    entityRef: entity._id,
                    type: 'record_page',
                    status: 'published'
                }).select('name tabs header').sort({ createdAt: 1 });
            } catch (e) {
                // PageConfig may not exist in all tenants
            }

            // Compute referenceTitle from entity.referenceTitleTokens
            const tokens = entity.referenceTitleTokens || [{ t: 'field', id: 'title' }];
            const refParts = tokens.map(token => {
                if (token.t === 'text') return token.v || '';
                if (token.t === 'field') {
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
            const referenceTitle = refParts.join('').trim() || record.title || 'Sans titre';

            res.render("record/record-detail", {
                entity,
                record,
                recordValues,
                fieldDefs,
                classificationDisplay,
                relationData,
                customPages,
                referenceTitle,
                account_number: req.account_number,
                layout: "layout-app"
            });
        } catch (err) {
            console.error("❌ Error in record detailPage:", err);
            res.status(500).render("errors/500", {
                message: "Erreur serveur",
                layout: "layout-app",
                account_number: req.account_number
            });
        }
    }
};
