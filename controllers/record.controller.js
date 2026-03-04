const mongoose = require('mongoose');
const Entity = require("../models/entity.model");
const Record = require("../models/record.model");
const FieldTemplate = require("../models/field-template.model");
const tenantCollection = require("../middleware/tenant").tenantCollection;
const WorkflowTriggers = require("../src/integrations/services/WorkflowTriggers");
const denormService = require("../services/record-denorm.service");

/**
 * Get inverse relations for an entity.
 * Finds all OTHER entities that have a relation targeting this entity,
 * and returns them as virtual relation objects with direction='inverse'.
 * This enables bidirectional display: if Consultation→Patient, then Patient sees "Consultations".
 */
async function getInverseRelations(EntityModel, entityId) {
    // Find all entities that have a relation targeting this entity
    const sourceEntities = await EntityModel.find({
        'relations.targetEntity': entityId,
        '_id': { $ne: entityId } // Exclude self-references (already shown as direct)
    }).select('_id name slug icon color relations').lean();

    const inverseRelations = [];
    for (const srcEntity of sourceEntities) {
        for (const rel of (srcEntity.relations || [])) {
            if (rel.targetEntity && rel.targetEntity.toString() === entityId.toString()) {
                // Check: don't create an inverse if the source entity already has an explicit
                // relation back (to avoid duplicates if both sides are manually configured)
                inverseRelations.push({
                    key: `inv_${rel.key}`,        // Prefixed key to distinguish from direct
                    sourceRelationKey: rel.key,     // Original relation key on source entity
                    targetEntity: {                 // The "target" for inverse = the SOURCE entity
                        _id: srcEntity._id,
                        name: srcEntity.name,
                        slug: srcEntity.slug,
                        icon: srcEntity.icon,
                        color: srcEntity.color
                    },
                    label: rel.inverseLabel || srcEntity.namePlural || srcEntity.name + 's',
                    cardinality: rel.cardinality === 'one-to-many' ? 'many-to-one' :
                        rel.cardinality === 'many-to-one' ? 'one-to-many' :
                            rel.cardinality === 'many-to-many' ? 'many-to-many' : 'one-to-one',
                    direction: 'inverse',           // Flag: this is an inverse relation
                    sourceEntityId: srcEntity._id,  // The entity that owns the actual relation
                    inputMode: 'readonly',          // Inverse relations are read-only (data is managed on the source side)
                });
            }
        }
    }
    return inverseRelations;
}


/**
 * Auto-generate a default form layout from entity.customFields
 * when no EntityForm or published formLayout exists.
 * Uses smart width assignments based on field type for aesthetic rendering.
 */
function generateDefaultLayout(customFields, relations) {
    const hasCustom = customFields && customFields.length > 0;
    const hasRelations = relations && relations.length > 0;
    if (!hasCustom && !hasRelations) return null;

    const fields = (customFields || []).map((cf, idx) => {
        const type = cf.type || 'string';
        const subtype = cf.subtype || '';

        // Smart width: full-width for long-content fields, half for others
        let width = 6; // Default: half-width (2 columns)
        if (['textarea', 'richtext'].includes(type) || ['textarea', 'richtext'].includes(subtype)) {
            width = 12; // Full width for text areas
        } else if (type === 'relation') {
            width = 6;
        }

        return {
            fieldId: cf._id.toString(),
            width,
            id: `auto_${cf._id.toString()}`,
            tabId: 'default'
        };
    });

    // Add relation fields to the layout
    (relations || []).forEach(rel => {
        fields.push({
            fieldId: rel.key, // UUID key for relation
            width: 6,
            id: `auto_rel_${rel.key}`,
            tabId: 'default'
        });
    });

    return {
        tabs: [{ id: 'default', title: 'Attributs', icon: 'tabler:apps' }],
        fields
    };
}

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

            // Get total count for mode decision
            const totalRecords = await RecordModel.countDocuments({ entityId: entity._id });

            // viewType from query param (table by default — RecordsGrid handles switching internally)
            const viewType = req.query.viewType || 'table';

            // Create view object for progressive template compatibility
            const view = {
                _id: entity._id,
                viewType: viewType,
                entity: entity._id,
                virtualize: totalRecords > 5000
            };

            res.render("record/record-view-progressive", {
                entity,
                records: [],
                view,
                totalRecords,
                limit: 0,
                pagination: {
                    page: 1,
                    limit: 25,
                    total: totalRecords,
                    pages: Math.ceil(totalRecords / 25)
                },
                layout: "layout-app-progressive",
                account_number: req.account_number,
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
                                defaultOptionId: cls.defaultOptionId ? cls.defaultOptionId.toString() : null,
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

            // Auto-generate default layout from entity.customFields when no form layout exists
            if (!activeFormName && (!resolvedLayout || (Array.isArray(resolvedLayout) && resolvedLayout.length === 0) || (!Array.isArray(resolvedLayout) && (!resolvedLayout.fields || resolvedLayout.fields.length === 0)))) {
                const autoLayout = generateDefaultLayout(entity.customFields, entity.relations);
                if (autoLayout) {
                    resolvedLayout = autoLayout;
                }
            }

            // Always inject missing relation fields into the layout (they may be absent from saved entity.layout)
            if (!activeFormName && !entityFormLayout && entity.relations && entity.relations.length > 0) {
                const layoutFields = !Array.isArray(resolvedLayout) ? (resolvedLayout.fields || []) : resolvedLayout;
                const existingFieldIds = new Set(layoutFields.map(f => f.fieldId));
                const missingRelations = entity.relations.filter(r => !existingFieldIds.has(r.key));
                if (missingRelations.length > 0) {
                    const relFields = missingRelations.map(rel => ({
                        fieldId: rel.key,
                        width: 6,
                        id: `auto_rel_${rel.key}`,
                        tabId: 'default'
                    }));
                    if (!Array.isArray(resolvedLayout) && resolvedLayout.fields) {
                        resolvedLayout.fields = [...resolvedLayout.fields, ...relFields];
                    } else if (Array.isArray(resolvedLayout)) {
                        resolvedLayout = [...resolvedLayout, ...relFields];
                    }
                }
            }

            // Build referenceTitleTokens metadata for client-side live preview
            const referenceTitleTokens = entity.referenceTitleTokens || [{ t: 'field', id: 'title' }];
            // Build a fieldId → fieldName map for resolving tokens client-side
            const fieldIdToName = {};
            (entity.customFields || []).forEach(cf => {
                fieldIdToName[cf._id.toString()] = cf.name || cf.label || '';
            });
            // Build a relationKey → { label, targetEntitySlug } map for rel: tokens
            const relationKeyMap = {};
            (entity.relations || []).forEach(r => {
                relationKeyMap[r.key] = {
                    label: r.label || '',
                    targetEntitySlug: r.targetEntity?.slug || (r.targetEntity?._id || r.targetEntity || '').toString()
                };
            });

            res.render("record/record-add", {
                entity,
                fields: entity.customFields,
                formLayout: resolvedLayout,
                formLayoutStatus: entity.formLayoutStatus || 'draft',
                activeFormName,
                entityFormLayout,
                entityFormFieldDefs,
                allFieldTemplates,
                referenceTitleTokens,
                fieldIdToName,
                relationKeyMap,
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
            const entity = await EntityModel.findOne({ slug: req.params.entityName })
                .populate('classifications')
                .populate('statusClassification');
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
                const relationsArray = [];
                if (customFields) {
                    const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
                    for (const [fieldId, value] of Object.entries(customFields)) {
                        if (value !== null && value !== undefined && value !== '') {
                            if (isValidObjectId(fieldId)) {
                                customFieldsArray.push({ field_id: fieldId, value });
                            } else if (fieldId) {
                                // Relation field (UUID key)
                                relationsArray.push({ relationKey: fieldId, value });
                            }
                        }
                    }
                }

                const recordData = {
                    entityId: entity._id,
                    title: title || 'Sans titre',
                    slug: slug,
                    date: date,
                    published: true,
                    customFields: customFieldsArray,
                    relations: relationsArray,
                    classificationValues: req.body.classificationValues || [],
                    createdBy: req.user?._id
                };

                // Compute denormalized fields
                const denorm = await denormService.computeDenorm(recordData, entity, RecordModel, EntityModel);
                Object.assign(recordData, denorm);

                const newRecord = new RecordModel(recordData);
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
            const classificationsObj2 = {};
            const data = { standard: {}, custom: {}, classifications: classificationsObj2, classification: classificationsObj2 };

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
                } else if (key === 'standard' || key === 'custom' || key === 'classifications' || key === 'classification') {
                    if (typeof req.body[key] === 'object') {
                        const targetKey = key === 'classification' ? 'classifications' : key;
                        data[targetKey] = { ...data[targetKey], ...req.body[key] };
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
            const relationsArray = [];
            if (custom) {
                const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
                for (const [fieldId, value] of Object.entries(custom)) {
                    if (isValidObjectId(fieldId)) {
                        // Regular custom field (ObjectId key → FieldTemplate)
                        let parsedValue = value;
                        if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
                            try { parsedValue = JSON.parse(value); } catch (e) { }
                        }
                        customFieldsArray.push({ field_id: fieldId, value: parsedValue });
                    } else if (fieldId && value) {
                        // Relation field (UUID key)
                        relationsArray.push({ relationKey: fieldId, value });
                    }
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

            const recordData = {
                entityId: entity._id,
                ...standard,
                customFields: customFieldsArray,
                relations: relationsArray,
                classificationValues: classificationValuesArray,
                createdBy: req.user._id
            };

            // Compute denormalized fields
            const denorm = await denormService.computeDenorm(recordData, entity, RecordModel, EntityModel);
            Object.assign(recordData, denorm);

            const newRecord = new RecordModel(recordData);
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
            // Include relation values (stored separately with UUID keys)
            (record.relations || []).forEach(rv => {
                if (rv.relationKey) recordValues[rv.relationKey] = rv.value;
            });

            // Load related records data for relation panels (Mission 3)
            const relatedRecordsData = {};
            for (const rel of (entity.relations || [])) {
                const relValue = recordValues[rel.key];
                if (relValue) {
                    const targetIds = Array.isArray(relValue) ? relValue : [relValue];
                    const validIds = targetIds.filter(id => mongoose.Types.ObjectId.isValid(id));
                    if (validIds.length > 0) {
                        const relRecords = await RecordModel.find({ _id: { $in: validIds } })
                            .populate({ path: 'customFields.field_id', select: 'label name type inputType ui' })
                            .lean();
                        relatedRecordsData[rel.key] = relRecords;
                    }
                }
            }

            // ═══ Inverse Relations: find other entities that target this entity ═══
            const inverseRelations = await getInverseRelations(EntityModel, entity._id);
            if (inverseRelations.length > 0) {
                // For each inverse relation, find records from the SOURCE entity that reference this record
                for (const invRel of inverseRelations) {
                    const sourceRecords = await RecordModel.find({
                        entityId: invRel.sourceEntityId,
                        'relations': {
                            $elemMatch: {
                                relationKey: invRel.sourceRelationKey,
                                value: record._id
                            }
                        }
                    })
                        .populate({ path: 'customFields.field_id', select: 'label name type inputType ui' })
                        .lean();

                    // Also check for value stored as array containing the record ID
                    const sourceRecordsArray = await RecordModel.find({
                        entityId: invRel.sourceEntityId,
                        'relations': {
                            $elemMatch: {
                                relationKey: invRel.sourceRelationKey,
                                value: { $in: [record._id, record._id.toString()] }
                            }
                        }
                    })
                        .populate({ path: 'customFields.field_id', select: 'label name type inputType ui' })
                        .lean();

                    // Merge and deduplicate
                    const allRecords = [...sourceRecords];
                    const existingIds = new Set(allRecords.map(r => r._id.toString()));
                    for (const r of sourceRecordsArray) {
                        if (!existingIds.has(r._id.toString())) {
                            allRecords.push(r);
                        }
                    }

                    if (allRecords.length > 0) {
                        relatedRecordsData[invRel.key] = allRecords;
                    }
                }

                // Keep inverse relations as a SEPARATE variable (don't inject into Mongoose entity.relations)
                // entity.relations stays untouched for direct relation form fields
            }

            // ═══ Build Relation Tabs Metadata (lightweight, for tab bar) ═══
            const relationTabsMeta = [];
            // Direct relations
            for (const rel of (entity.relations || [])) {
                const targetEnt = rel.targetEntity || {};
                const relValue = recordValues[rel.key];
                let count = 0;
                if (relValue) {
                    const targetIds = Array.isArray(relValue) ? relValue : [relValue];
                    count = targetIds.filter(id => mongoose.Types.ObjectId.isValid(id)).length;
                }
                relationTabsMeta.push({
                    key: rel.key,
                    label: rel.label || targetEnt.name || 'Relation',
                    icon: targetEnt.icon || 'solar:link-round-bold-duotone',
                    color: targetEnt.color || '#4361ee',
                    count,
                    direction: 'direct',
                    cardinality: rel.cardinality || 'one-to-many',
                    entitySlug: targetEnt.slug || '',
                    entityId: (targetEnt._id || '').toString(),
                });
            }
            // Inverse relations
            for (const invRel of inverseRelations) {
                const tgt = invRel.targetEntity || {};
                const count = (relatedRecordsData[invRel.key] || []).length;
                relationTabsMeta.push({
                    key: invRel.key,
                    label: invRel.label || tgt.name || 'Relation',
                    icon: tgt.icon || 'solar:link-round-bold-duotone',
                    color: tgt.color || '#4361ee',
                    count,
                    direction: 'inverse',
                    cardinality: invRel.cardinality || 'many-to-one',
                    entitySlug: tgt.slug || '',
                    entityId: (tgt._id || '').toString(),
                    sourceRelationKey: invRel.sourceRelationKey,
                    sourceEntityId: (invRel.sourceEntityId || '').toString(),
                });
            }

            // Try to load from EntityForm (multi-form architecture)
            let resolvedLayout = entity.layout || [];
            let activeFormName = null;
            let activeFormId = null;
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
                    activeFormId = selectedForm._id.toString();
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
                            ui: cf.ui || {},
                            category: cf.category || 'text',
                            formula: cf.formula || null,
                            color: cf.color || cf.ui?.couleur || '',
                            render: cf.render || {}
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
                                allowMultiple: !!cls.allowMultiple,
                                defaultOptionId: cls.defaultOptionId ? cls.defaultOptionId.toString() : null,
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

            // Auto-generate default layout from entity.customFields when no form layout exists
            // Filter out inverse relations — they are read-only and shown in sidebar only
            const directRelations = (entity.relations || []).filter(r => r.direction !== 'inverse');
            if (!activeFormName && (!resolvedLayout || (Array.isArray(resolvedLayout) && resolvedLayout.length === 0) || (!Array.isArray(resolvedLayout) && (!resolvedLayout.fields || resolvedLayout.fields.length === 0)))) {
                const autoLayout = generateDefaultLayout(entity.customFields, directRelations);
                if (autoLayout) {
                    resolvedLayout = autoLayout;
                }
            }

            // Always inject missing relation fields into the layout (they may be absent from saved entity.layout)
            // Only inject DIRECT relations (not inverse) — inverse are sidebar-only
            if (!activeFormName && !entityFormLayout && directRelations.length > 0) {
                const layoutFields = !Array.isArray(resolvedLayout) ? (resolvedLayout.fields || []) : resolvedLayout;
                const existingFieldIds = new Set(layoutFields.map(f => f.fieldId));
                const missingRelations = directRelations.filter(r => !existingFieldIds.has(r.key));
                if (missingRelations.length > 0) {
                    const relFields = missingRelations.map(rel => ({
                        fieldId: rel.key,
                        width: 6,
                        id: `auto_rel_${rel.key}`,
                        tabId: 'default'
                    }));
                    if (!Array.isArray(resolvedLayout) && resolvedLayout.fields) {
                        resolvedLayout.fields = [...resolvedLayout.fields, ...relFields];
                    } else if (Array.isArray(resolvedLayout)) {
                        resolvedLayout = [...resolvedLayout, ...relFields];
                    }
                }
            }

            // ═══ DataGrid: Load grid schemas + templates for this entity ═══
            let gridSchemas = [];
            let gridTemplates = [];
            let gridLines = {};
            try {
                // Populate gridSchemas from entity
                if (entity.gridSchemas && entity.gridSchemas.length > 0) {
                    const LineSchema = await tenantCollection(req, "LineSchema");
                    const GridSchemaTemplate = await tenantCollection(req, "GridSchemaTemplate");
                    const DocumentLine = await tenantCollection(req, "DocumentLine");

                    const schemaIds = entity.gridSchemas
                        .map(gs => gs.schemaId)
                        .filter(id => id);

                    if (schemaIds.length > 0) {
                        const schemas = await LineSchema.find({ _id: { $in: schemaIds } }).lean();
                        const schemaMap = {};
                        schemas.forEach(s => { schemaMap[s._id.toString()] = s; });

                        gridSchemas = entity.gridSchemas.map(gs => ({
                            ...gs.toObject ? gs.toObject() : gs,
                            schema: schemaMap[gs.schemaId?.toString()] || null
                        })).filter(gs => gs.schema);

                        // Load templates for these schemas
                        gridTemplates = await GridSchemaTemplate.find({
                            schemaId: { $in: schemaIds }
                        }).lean();

                        // Load existing lines for this record
                        if (record._id) {
                            const lines = await DocumentLine.find({
                                documentId: record._id,
                                schemaId: { $in: schemaIds }
                            }).sort({ order: 1 }).lean();

                            // Group by schemaId
                            lines.forEach(line => {
                                const sid = line.schemaId?.toString();
                                if (!gridLines[sid]) gridLines[sid] = [];
                                gridLines[sid].push(line);
                            });
                        }
                    }
                }
            } catch (gridErr) {
                console.error('[DataGrid] Error loading grid data:', gridErr);
            }

            // ═══ Computed Fields: Calculate dynamic values ═══
            let computedFieldValues = {};
            try {
                const { computeAllFields } = require('../services/computed-field-engine');
                const computedFields = (entity.customFields || []).filter(f => f.category === 'computed' && f.formula);
                if (computedFields.length > 0) {
                    const recordForCompute = {
                        ...record.toObject ? record.toObject() : record,
                        custom: recordValues
                    };
                    computedFieldValues = computeAllFields(computedFields, recordForCompute, entity.customFields);
                }
            } catch (computeErr) {
                console.warn('[ComputedFields] Calculation error:', computeErr.message);
            }

            // ═══ Header Config: Resolve related record for hero bar ═══
            let headerRelatedRecord = null;
            let headerRelatedMeta = null; // { attachmentCount, indirectRelations: [...] }
            try {
                const hc = entity.headerConfig || {};
                // Determine which relation key to use (titleSource, subtitle, OR avatar source)
                let headerRelationKey = null;
                if (hc.titleSource && hc.titleSource.type === 'relation' && hc.titleSource.relationKey) {
                    headerRelationKey = hc.titleSource.relationKey;
                } else if (hc.subtitleRelation && hc.subtitleRelation.relationKey) {
                    headerRelationKey = hc.subtitleRelation.relationKey;
                } else if (hc.avatarSource && hc.avatarSource.type === 'relation-image' && hc.avatarSource.relationKey) {
                    headerRelationKey = hc.avatarSource.relationKey;
                }

                if (headerRelationKey) {
                    // Find the related record value from record.relations
                    const relVal = recordValues[headerRelationKey];
                    const relId = Array.isArray(relVal) ? relVal[0] : relVal;
                    if (relId && mongoose.Types.ObjectId.isValid(relId)) {
                        headerRelatedRecord = await RecordModel.findById(relId)
                            .populate({ path: 'customFields.field_id', select: 'label name type inputType ui' })
                            .lean();

                        if (headerRelatedRecord) {
                            // Build meta: attachments count + indirect relations
                            const attachmentCount = (headerRelatedRecord.attachments || []).length;
                            const indirectRelations = [];

                            // Load the entity of the related record to find its own relations
                            const relatedEntity = await EntityModel.findById(headerRelatedRecord.entityId)
                                .populate({ path: 'relations.targetEntity', select: 'name slug icon color' })
                                .populate({ path: 'customFields', select: 'label name ui' })
                                .select('name slug icon color customFields relations')
                                .lean();

                            if (relatedEntity && relatedEntity.relations) {
                                // Build values map for the related record
                                const relRecValues = {};
                                (headerRelatedRecord.relations || []).forEach(rv => {
                                    if (rv.relationKey) relRecValues[rv.relationKey] = rv.value;
                                });

                                for (const rel of relatedEntity.relations) {
                                    const tgt = rel.targetEntity || {};
                                    // Skip relation back to current entity (avoid circular)
                                    if (tgt._id && tgt._id.toString() === entity._id.toString()) continue;

                                    const rv = relRecValues[rel.key];
                                    let count = 0;
                                    let records = [];
                                    if (rv) {
                                        const ids = Array.isArray(rv) ? rv : [rv];
                                        const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
                                        count = validIds.length;
                                        if (count > 0) {
                                            records = await RecordModel.find({ _id: { $in: validIds } })
                                                .select('title image _id entityId')
                                                .lean();
                                        }
                                    }

                                    // Also check inverse relations (records FROM other entities that point to this patient)
                                    const inverseCount = await RecordModel.countDocuments({
                                        entityId: tgt._id,
                                        $or: [
                                            { 'relations': { $elemMatch: { value: headerRelatedRecord._id } } },
                                            { 'relations': { $elemMatch: { value: headerRelatedRecord._id.toString() } } },
                                            { 'relations': { $elemMatch: { value: { $in: [headerRelatedRecord._id, headerRelatedRecord._id.toString()] } } } }
                                        ]
                                    });

                                    const totalCount = count + inverseCount;
                                    if (totalCount > 0) {
                                        indirectRelations.push({
                                            key: rel.key,
                                            label: rel.label || tgt.name || 'Relation',
                                            icon: tgt.icon || 'solar:link-round-bold-duotone',
                                            color: tgt.color || '#4361ee',
                                            slug: tgt.slug || '',
                                            entityId: (tgt._id || '').toString(),
                                            count: totalCount,
                                            records: records.slice(0, 5) // Only first 5 for preview
                                        });
                                    }
                                }
                            }

                            // Also find entities that have inverse relations to the patient's entity
                            if (relatedEntity) {
                                const invRels = await getInverseRelations(EntityModel, relatedEntity._id);
                                for (const invRel of invRels) {
                                    const tgt = invRel.targetEntity || {};
                                    // Skip current entity
                                    if (tgt._id && tgt._id.toString() === entity._id.toString()) continue;

                                    const invCount = await RecordModel.countDocuments({
                                        entityId: invRel.sourceEntityId,
                                        'relations': {
                                            $elemMatch: {
                                                relationKey: invRel.sourceRelationKey,
                                                value: { $in: [headerRelatedRecord._id, headerRelatedRecord._id.toString()] }
                                            }
                                        }
                                    });

                                    // Only add if not already in the list
                                    const exists = indirectRelations.find(r => r.entityId === (invRel.sourceEntityId || '').toString());
                                    if (!exists && invCount > 0) {
                                        indirectRelations.push({
                                            key: invRel.key,
                                            label: invRel.label || tgt.name || 'Relation',
                                            icon: tgt.icon || 'solar:link-round-bold-duotone',
                                            color: tgt.color || '#4361ee',
                                            slug: tgt.slug || '',
                                            entityId: (invRel.sourceEntityId || '').toString(),
                                            count: invCount,
                                            records: []
                                        });
                                    }
                                }
                            }

                            headerRelatedMeta = {
                                attachmentCount,
                                indirectRelations: indirectRelations.filter(r => r.count > 0),
                                relatedEntityIcon: relatedEntity ? (relatedEntity.icon || 'solar:user-bold-duotone') : '',
                                relatedEntityColor: relatedEntity ? (relatedEntity.color || '#4361ee') : '',
                                relatedEntityName: relatedEntity ? (relatedEntity.name || '') : '',
                                relatedFields: relatedEntity && relatedEntity.customFields
                                    ? relatedEntity.customFields.filter(f => f != null).map(f => ({
                                        _id: (f._id || '').toString(),
                                        label: f.label || f.name || '',
                                        icon: (f.ui && f.ui.icon) || 'solar:document-text-linear'
                                    })).slice(0, 12)
                                    : []
                            };
                        }
                    }
                }
            } catch (headerErr) {
                console.warn('[HeaderConfig] Error resolving related record:', headerErr.message);
            }

            // ═══ Related Card Widgets: Load card templates for sidebar ═══
            let relatedCardWidgets = [];
            try {
                const CardTemplate = await tenantCollection(req, "CardTemplate");
                if (CardTemplate) {
                    // Find all relations with actual records (direct + inverse)
                    const allRelations = [
                        ...(entity.relations || []).map(r => ({ ...r.toObject ? r.toObject() : r, direction: 'direct' })),
                        ...(inverseRelations || []).map(r => ({ ...r, direction: 'inverse' }))
                    ];

                    for (const rel of allRelations) {
                        const relRecs = (relatedRecordsData || {})[rel.key] || [];
                        if (relRecs.length === 0) continue;

                        const tgt = rel.targetEntity || {};
                        const targetEntityId = tgt._id ? tgt._id.toString() : null;
                        if (!targetEntityId) continue;

                        // Load card template: prefer sidebar > universal
                        let cardTemplate = await CardTemplate.findOne({
                            entityId: targetEntityId,
                            context: 'sidebar',
                            isDefault: true
                        }).lean();
                        if (!cardTemplate) {
                            cardTemplate = await CardTemplate.findOne({
                                entityId: targetEntityId,
                                context: 'sidebar'
                            }).lean();
                        }
                        if (!cardTemplate) {
                            cardTemplate = await CardTemplate.findOne({
                                entityId: targetEntityId,
                                context: 'universal',
                                isDefault: true
                            }).lean();
                        }
                        if (!cardTemplate) {
                            cardTemplate = await CardTemplate.findOne({
                                entityId: targetEntityId,
                                context: 'universal'
                            }).lean();
                        }

                        // Load the related entity fields + relations for rendering
                        const relEntity = await EntityModel.findById(targetEntityId)
                            .populate('customFields')
                            .populate({ path: 'relations.targetEntity', select: 'name slug icon color' })
                            .select('name slug icon color customFields statusClassification classifications relations')
                            .lean();

                        // Build entity data for CardRenderer
                        const entityFields = (relEntity?.customFields || []).filter(f => f != null).map(f => ({
                            _id: (f._id || '').toString(),
                            name: f.name || '',
                            label: f.label || f.name || '',
                            type: f.type || 'string',
                            icon: f.ui?.icon || '',
                            formula: f.formula || null
                        }));

                        // Build entity relations for relations component
                        // Include BOTH direct relations AND inverse relations
                        const directEntityRelations = (relEntity?.relations || []).map(r => ({
                            key: r.key || '',
                            label: r.label || (r.targetEntity && r.targetEntity.name) || '',
                            name: (r.targetEntity && r.targetEntity.name) || r.label || '',
                            slug: (r.targetEntity && r.targetEntity.slug) || '',
                            icon: (r.targetEntity && r.targetEntity.icon) || 'solar:link-bold-duotone',
                            color: (r.targetEntity && r.targetEntity.color) || '#4361ee',
                            targetName: (r.targetEntity && r.targetEntity.name) || '',
                            targetIcon: (r.targetEntity && r.targetEntity.icon) || '',
                            targetColor: (r.targetEntity && r.targetEntity.color) || '#4361ee',
                            cardinality: r.cardinality || 'one-to-many',
                            isInverse: false
                        }));

                        // Also get inverse relations (entities that point TO this entity)
                        let inverseEntityRelations = [];
                        try {
                            const invRels = await getInverseRelations(EntityModel, targetEntityId);
                            inverseEntityRelations = invRels.map(r => ({
                                key: r.key || '',
                                label: r.label || (r.targetEntity && r.targetEntity.name) || '',
                                name: (r.targetEntity && r.targetEntity.name) || r.label || '',
                                slug: (r.targetEntity && r.targetEntity.slug) || '',
                                icon: (r.targetEntity && r.targetEntity.icon) || 'solar:link-bold-duotone',
                                color: (r.targetEntity && r.targetEntity.color) || '#4361ee',
                                targetName: (r.targetEntity && r.targetEntity.name) || '',
                                targetIcon: (r.targetEntity && r.targetEntity.icon) || '',
                                targetColor: (r.targetEntity && r.targetEntity.color) || '#4361ee',
                                cardinality: r.cardinality || 'one-to-many',
                                isInverse: true
                            }));
                        } catch (invErr) {
                            console.warn('[RelatedCardWidgets] Inverse relations error:', invErr.message);
                        }

                        const entityRelations = [...directEntityRelations, ...inverseEntityRelations];

                        // Auto-create a sidebar card template in database if none exists
                        if (!cardTemplate && entityFields.length > 0) {
                            try {
                                const fieldElements = entityFields.slice(0, 12).map(f => ({
                                    type: 'field',
                                    fieldId: f._id,
                                    label: f.label,
                                    icon: f.icon || '',
                                    format: f.type === 'date' ? 'date' : 'text',
                                    fontSize: 'sm',
                                    fontWeight: 'normal',
                                    visible: true
                                }));
                                const newCard = await CardTemplate.create({
                                    name: 'Fiche ' + (tgt.name || 'Relation'),
                                    entityId: targetEntityId,
                                    context: 'sidebar',
                                    isDefault: true,
                                    layout: {
                                        accentPosition: 'none',
                                        accentSource: 'none',
                                        borderRadius: 0,
                                        shadow: 'none',
                                        zones: [{
                                            id: 'body',
                                            direction: 'column',
                                            gap: 4,
                                            padding: '8px 12px',
                                            align: 'stretch',
                                            elements: fieldElements
                                        }]
                                    },
                                    createdBy: req.user?._id
                                });
                                cardTemplate = newCard.toObject();
                                console.log(`[RelatedCardWidgets] Auto-created sidebar card for entity ${tgt.name} (${targetEntityId})`);
                            } catch (seedErr) {
                                console.warn('[RelatedCardWidgets] Auto-seed error:', seedErr.message);
                            }
                        }

                        for (const relRec of relRecs) {
                            relatedCardWidgets.push({
                                relationKey: rel.key,
                                relationLabel: rel.label || tgt.name || 'Relation',
                                direction: rel.direction,
                                entityId: targetEntityId,
                                entityName: tgt.name || '',
                                entitySlug: tgt.slug || '',
                                entityIcon: tgt.icon || 'solar:user-bold-duotone',
                                entityColor: tgt.color || '#4361ee',
                                entityFields,
                                entityRelations,
                                cardTemplate: cardTemplate || null,
                                record: {
                                    _id: (relRec._id || '').toString(),
                                    title: relRec.title || '',
                                    slug: relRec.slug || '',
                                    date: relRec.date || '',
                                    description: relRec.description || '',
                                    image: relRec.image || '',
                                    customFields: (relRec.customFields || []).map(cf => ({
                                        field_id: cf.field_id?._id ? cf.field_id._id.toString() : (cf.field_id || '').toString(),
                                        value: cf.value
                                    })),
                                    classificationValues: relRec.classificationValues || [],
                                    relations: relRec.relations || [],
                                    statusLabel: relRec.statusLabel || '',
                                    statusColor: relRec.statusColor || ''
                                }
                            });
                        }
                    }
                }
            } catch (cardWidgetErr) {
                console.warn('[RelatedCardWidgets] Error:', cardWidgetErr.message);
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
                activeFormId,
                recordValues,
                relatedRecordsData,
                inverseRelations: inverseRelations || [],
                relationTabsMeta: relationTabsMeta || [],
                allFieldTemplates,
                gridSchemas,
                gridTemplates,
                gridLines,
                computedFieldValues,
                headerRelatedRecord,
                headerRelatedMeta,
                relatedCardWidgets,
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
            const entity = await EntityModel.findOne({ slug: req.params.entityName })
                .populate('classifications')
                .populate('statusClassification');
            if (!entity) return res.status(404).render("errors/404", {
                message: "Entity not found",
                account_number: req.account_number,
                layout: "layout-app"
            });

            // 🛠️ Robust Body Parsing
            const classificationsObj = {};
            const data = { standard: {}, custom: {}, classifications: classificationsObj, classification: classificationsObj };

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
                } else if (key === 'standard' || key === 'custom' || key === 'classifications' || key === 'classification') {
                    if (typeof req.body[key] === 'object') {
                        const targetKey = key === 'classification' ? 'classifications' : key;
                        data[targetKey] = { ...data[targetKey], ...req.body[key] };
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
            const relationsArray = [];
            if (custom) {
                const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
                for (const [fieldId, value] of Object.entries(custom)) {
                    if (isValidObjectId(fieldId)) {
                        // Regular custom field (ObjectId key → FieldTemplate)
                        let parsedValue = value;
                        if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
                            try { parsedValue = JSON.parse(value); } catch (e) { }
                        }
                        customFieldsArray.push({ field_id: fieldId, value: parsedValue });
                    } else if (fieldId && value) {
                        // Relation field (UUID key)
                        relationsArray.push({ relationKey: fieldId, value });
                    }
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

            // Load existing record to preserve fields not in the form submission
            const existingRecord = await RecordModel.findById(req.params.id).lean();
            if (!existingRecord) {
                return res.status(404).send("Record not found");
            }

            // Compute denormalized fields — merge existing record data with form data
            // so that computeTitle can access fields like 'title' even if not submitted
            // Filter out empty-string standard fields so they don't override existing values
            const standardForDenorm = {};
            for (const [k, v] of Object.entries(standard)) {
                if (v !== undefined && v !== null && v !== '') {
                    standardForDenorm[k] = v;
                }
            }
            const recordDataForDenorm = {
                title: existingRecord.title,        // preserve existing title
                date: existingRecord.date,          // preserve existing date
                description: existingRecord.description, // preserve existing description
                slug: existingRecord.slug,          // preserve existing slug
                ...standardForDenorm,               // form-submitted NON-EMPTY fields override
                customFields: customFieldsArray.length > 0 ? customFieldsArray : existingRecord.customFields,
                relations: relationsArray.length > 0 ? relationsArray : existingRecord.relations,
                classificationValues: classificationValuesArray
            };
            const denorm = await denormService.computeDenorm(recordDataForDenorm, entity, RecordModel, EntityModel);

            const updatedRecord = await RecordModel.findByIdAndUpdate(req.params.id, {
                ...standard,
                customFields: customFieldsArray,
                relations: relationsArray,
                classificationValues: denorm.classificationValues,
                computedTitle: denorm.computedTitle,
                '_denorm.relations': denorm._denorm.relations,
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

            // Async: re-denorm records that reference this one (e.g., if patient name changed)
            denormService.syncDependents(req.params.id, req, { source: 'controller' })
                .catch(err => console.error('[Denorm Sync Error]', err));

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

    // Bulk delete records
    bulkDelete: async (req, res) => {
        try {
            const { ids } = req.body;
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({ success: false, error: "No record IDs provided" });
            }

            // Validate all IDs
            const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
            if (validIds.length === 0) {
                return res.status(400).json({ success: false, error: "No valid record IDs" });
            }

            const RecordModel = await tenantCollection(req, "Record");
            const result = await RecordModel.deleteMany({ _id: { $in: validIds } });

            res.json({
                success: true,
                deletedCount: result.deletedCount,
                message: `${result.deletedCount} enregistrement(s) supprimé(s)`
            });
        } catch (error) {
            console.error('[Record] Bulk delete error:', error);
            res.status(500).json({ success: false, error: "Server Error" });
        }
    },

    // Bulk update classification for records
    bulkUpdateClassification: async (req, res) => {
        try {
            const { ids, classificationId, optionId, optionLabel, optionColor } = req.body;
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({ success: false, error: "No record IDs provided" });
            }
            if (!classificationId || !optionId) {
                return res.status(400).json({ success: false, error: "Missing classification data" });
            }

            const RecordModel = await tenantCollection(req, "Record");
            let updatedCount = 0;

            for (const id of ids) {
                if (!mongoose.Types.ObjectId.isValid(id)) continue;

                const record = await RecordModel.findById(id);
                if (!record) continue;

                // Update or add the classification value
                const cvs = record.classificationValues || [];
                const existingIdx = cvs.findIndex(cv =>
                    (cv.classificationId?.toString() || cv.classificationId) === classificationId
                );

                const newCv = {
                    classificationId,
                    optionId,
                    label: optionLabel || '',
                    color: optionColor || ''
                };

                if (existingIdx >= 0) {
                    cvs[existingIdx] = newCv;
                } else {
                    cvs.push(newCv);
                }

                record.classificationValues = cvs;
                await record.save();
                updatedCount++;
            }

            res.json({
                success: true,
                updatedCount,
                message: `${updatedCount} enregistrement(s) mis à jour`
            });
        } catch (error) {
            console.error('[Record] Bulk update classification error:', error);
            res.status(500).json({ success: false, error: "Server Error" });
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

            // Get entity to access referenceTitleTokens and relations
            const entity = await Entity.findById(entityId).select('referenceTitleTokens relations').lean();
            const tokens = entity?.referenceTitleTokens || [{ t: 'field', id: 'title' }];

            const records = await RecordModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('title slug _id customFields relations')
                .populate({ path: 'customFields.field_id', select: 'label fieldType' })
                .lean();

            const total = await RecordModel.countDocuments(query);

            // Pre-load related records for rel: tokens
            const relTokens = tokens.filter(t => t.t === 'field' && t.id && t.id.startsWith('rel:'));
            const relatedRecordsMap = {}; // { recordId: record }
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
                    const relatedRecords = await RecordModel.find({ _id: { $in: [...allRelatedIds] } })
                        .select('title slug description date customFields')
                        .populate({ path: 'customFields.field_id', select: 'label fieldType' })
                        .lean();
                    relatedRecords.forEach(rr => { relatedRecordsMap[rr._id.toString()] = rr; });
                }
            }

            const formatted = records.map(r => {
                // Compute referenceTitle from tokens
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
            const { recordId, classificationId, optionId, optionIds, allowMultiple } = req.body;

            const record = await RecordModel.findById(recordId);
            if (!record) return res.status(404).json({ error: "Record not found" });

            // Remove existing values for this classification
            record.classificationValues = record.classificationValues.filter(
                cv => cv.classificationId.toString() !== classificationId
            );

            // Multi-select mode: optionIds is an array
            if (allowMultiple && Array.isArray(optionIds)) {
                optionIds.filter(id => id && id !== 'none').forEach(id => {
                    record.classificationValues.push({ classificationId, optionId: id });
                });
            } else if (optionId && optionId !== 'none') {
                // Single-select (backward compatible)
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

            // Pre-load related records for rel: tokens (single record view)
            const relTokensDetail = tokens.filter(t => t.t === 'field' && t.id && t.id.startsWith('rel:'));
            const relatedRecordsMapDetail = {};
            if (relTokensDetail.length > 0) {
                const allRelatedIds = new Set();
                for (const rt of relTokensDetail) {
                    const dotIdx = rt.id.indexOf('.');
                    const relKey = rt.id.substring(4, dotIdx);
                    const cv = (record.customFields || []).find(c => (c.field_id?._id || c.field_id || '').toString() === relKey);
                    if (cv && cv.value) {
                        const ids = Array.isArray(cv.value) ? cv.value : [cv.value];
                        ids.forEach(id => allRelatedIds.add(id.toString()));
                    }
                }
                if (allRelatedIds.size > 0) {
                    const RecordForRef = await tenantCollection(req, "Record");
                    const relRecs = await RecordForRef.find({ _id: { $in: [...allRelatedIds] } })
                        .select('title slug description date customFields')
                        .populate({ path: 'customFields.field_id', select: 'label fieldType' })
                        .lean();
                    relRecs.forEach(rr => { relatedRecordsMapDetail[rr._id.toString()] = rr; });
                }
            }

            const refParts = tokens.map(token => {
                if (token.t === 'text') return token.v || '';
                if (token.t === 'field') {
                    // Relation sub-field: rel:<relKey>.<subFieldId>
                    if (token.id && token.id.startsWith('rel:')) {
                        const dotIdx = token.id.indexOf('.');
                        const relKey = token.id.substring(4, dotIdx);
                        const subFieldId = token.id.substring(dotIdx + 1);
                        const cv = (record.customFields || []).find(c => (c.field_id?._id || c.field_id || '').toString() === relKey);
                        if (cv && cv.value) {
                            const targetId = Array.isArray(cv.value) ? cv.value[0] : cv.value;
                            const targetRecord = relatedRecordsMapDetail[targetId?.toString()];
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
    },

    // ═══ Update Relation (add/remove a related record on a source record) ═══
    updateRelation: async (req, res) => {
        try {
            const RecordModel = await tenantCollection(req, "Record");
            const { id } = req.params;
            const { relationKey, targetRecordId, action } = req.body;

            if (!relationKey || !targetRecordId) {
                return res.status(400).json({ success: false, message: 'Missing relationKey or targetRecordId' });
            }

            const record = await RecordModel.findById(id);
            if (!record) {
                return res.status(404).json({ success: false, message: 'Record not found' });
            }

            // Find existing relation entry
            const existingIdx = record.relations.findIndex(r => r.relationKey === relationKey);

            if (action === 'add') {
                if (existingIdx >= 0) {
                    // Relation entry exists — append to array or convert single to array
                    let currentVal = record.relations[existingIdx].value;
                    if (Array.isArray(currentVal)) {
                        if (!currentVal.map(String).includes(String(targetRecordId))) {
                            currentVal.push(targetRecordId);
                        }
                    } else if (currentVal) {
                        // Convert single value to array
                        if (String(currentVal) !== String(targetRecordId)) {
                            record.relations[existingIdx].value = [currentVal, targetRecordId];
                        }
                    } else {
                        record.relations[existingIdx].value = targetRecordId;
                    }
                } else {
                    // No entry yet — create one
                    record.relations.push({ relationKey, value: targetRecordId });
                }
            } else if (action === 'remove') {
                if (existingIdx >= 0) {
                    let currentVal = record.relations[existingIdx].value;
                    if (Array.isArray(currentVal)) {
                        record.relations[existingIdx].value = currentVal.filter(v => String(v) !== String(targetRecordId));
                        if (record.relations[existingIdx].value.length === 0) {
                            record.relations.splice(existingIdx, 1);
                        }
                    } else if (String(currentVal) === String(targetRecordId)) {
                        record.relations.splice(existingIdx, 1);
                    }
                }
            }

            record.markModified('relations');
            await record.save();

            return res.json({ success: true });
        } catch (err) {
            console.error('Error updating relation:', err);
            return res.status(500).json({ success: false, message: err.message });
        }
    }
};
