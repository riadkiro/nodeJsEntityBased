const tenantCollection = require("../middleware/tenant").tenantCollection;
const mongoose = require("mongoose");

module.exports = {

    // ========== PAGES ==========

    /**
     * List all forms for an entity
     * GET /entity/:entityId/forms
     */
    listForms: async (req, res) => {
        try {
            const Entity = await tenantCollection(req, "Entity");
            const EntityForm = await tenantCollection(req, "EntityForm");

            const entity = await Entity.findById(req.params.entityId);
            if (!entity) {
                return res.status(404).render("errors/404", {
                    message: "Entité introuvable",
                    account_number: req.account_number,
                    layout: "layout-app"
                });
            }

            const forms = await EntityForm.find({ entityId: entity._id }).sort({ order: 1, createdAt: -1 });

            res.render("entity/entity-forms-list", {
                entity,
                forms,
                account_number: req.account_number,
                layout: "layout-app"
            });
        } catch (err) {
            console.error("❌ Error listing forms:", err);
            res.status(500).render("errors/500", { message: "Erreur serveur", layout: "layout-app" });
        }
    },

    /**
     * Form builder page — new form
     * GET /entity/:entityId/forms/add
     */
    addFormBuilder: async (req, res) => {
        try {
            const Entity = await tenantCollection(req, "Entity");
            const FieldTemplate = await tenantCollection(req, "FieldTemplate");
            const Classification = await tenantCollection(req, "Classification");

            const entity = await Entity.findById(req.params.entityId)
                .populate('relations.targetEntity', '_id name slug icon color');
            if (!entity) {
                return res.status(404).render("errors/404", {
                    message: "Entité introuvable",
                    account_number: req.account_number,
                    layout: "layout-app"
                });
            }

            const allFieldTemplates = (await FieldTemplate.find()).map(t => ({
                ...t.toObject(),
                htmlTemplate: t.htmlTemplate || ""
            }));
            const allClassifications = await Classification.find({
                $or: [
                    { entities: { $exists: true, $size: 0 } },
                    { entities: { $exists: false } },
                    { entities: entity._id }
                ]
            });
            const selectedFields = allFieldTemplates.filter(ft =>
                entity.customFields?.map(id => id.toString()).includes(ft._id.toString())
            );

            res.render("entity/entity-form-builder", {
                entity,
                form: null,  // new form = no existing form
                fields: selectedFields,
                allFieldTemplates,
                allClassifications,
                formLayout: { version: 1, rows: [] },
                formStatus: 'draft',
                formName: 'Nouveau formulaire',
                account_number: req.account_number,
                layout: "layout-app"
            });
        } catch (err) {
            console.error("❌ Error loading form builder:", err);
            res.status(500).render("errors/500", { message: "Erreur serveur", layout: "layout-app" });
        }
    },

    /**
     * Form builder page — edit existing form
     * GET /entity/:entityId/forms/:formId/edit
     */
    editFormBuilder: async (req, res) => {
        try {
            const Entity = await tenantCollection(req, "Entity");
            const EntityForm = await tenantCollection(req, "EntityForm");
            const FieldTemplate = await tenantCollection(req, "FieldTemplate");
            const Classification = await tenantCollection(req, "Classification");

            const entity = await Entity.findById(req.params.entityId)
                .populate('relations.targetEntity', '_id name slug icon color');
            if (!entity) {
                return res.status(404).render("errors/404", {
                    message: "Entité introuvable",
                    account_number: req.account_number,
                    layout: "layout-app"
                });
            }

            const form = await EntityForm.findById(req.params.formId);
            if (!form) {
                return res.status(404).render("errors/404", {
                    message: "Formulaire introuvable",
                    account_number: req.account_number,
                    layout: "layout-app"
                });
            }

            const allFieldTemplates = (await FieldTemplate.find()).map(t => ({
                ...t.toObject(),
                htmlTemplate: t.htmlTemplate || ""
            }));
            const allClassifications = await Classification.find({
                $or: [
                    { entities: { $exists: true, $size: 0 } },
                    { entities: { $exists: false } },
                    { entities: entity._id }
                ]
            });
            const selectedFields = allFieldTemplates.filter(ft =>
                entity.customFields?.map(id => id.toString()).includes(ft._id.toString())
            );

            res.render("entity/entity-form-builder", {
                entity,
                form,
                fields: selectedFields,
                allFieldTemplates,
                allClassifications,
                formLayout: form.layout || { version: 1, rows: [] },
                formStatus: form.status || 'draft',
                formName: form.name || 'Formulaire',
                account_number: req.account_number,
                layout: "layout-app"
            });
        } catch (err) {
            console.error("❌ Error loading form builder:", err);
            res.status(500).render("errors/500", { message: "Erreur serveur", layout: "layout-app" });
        }
    },

    // ========== API ==========

    /**
     * Create a new form
     * POST /entity/:entityId/forms/api/save
     */
    saveForm_Api: async (req, res) => {
        try {
            const EntityForm = await tenantCollection(req, "EntityForm");
            const { name, layout, isDefault } = req.body;

            const count = await EntityForm.countDocuments({ entityId: req.params.entityId });

            const form = new EntityForm({
                entityId: req.params.entityId,
                name: name || 'Formulaire ' + (count + 1),
                layout: layout || { version: 1, rows: [] },
                status: 'draft',
                isDefault: count === 0 ? true : (isDefault || false),
                order: count
            });

            await form.save();
            console.log("✅ Form created:", form._id);
            res.json({ success: true, form });
        } catch (err) {
            console.error("❌ Error saving form:", err);
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Update existing form
     * POST /entity/:entityId/forms/api/update/:formId
     */
    updateForm_Api: async (req, res) => {
        try {
            const EntityForm = await tenantCollection(req, "EntityForm");
            const updateData = {};

            if (req.body.name !== undefined) updateData.name = req.body.name;
            if (req.body.layout !== undefined) updateData.layout = req.body.layout;
            if (req.body.icon !== undefined) updateData.icon = req.body.icon;
            if (req.body.color !== undefined) updateData.color = req.body.color;
            if (req.body.description !== undefined) updateData.description = req.body.description;

            const form = await EntityForm.findByIdAndUpdate(req.params.formId, updateData, {
                new: true,
                runValidators: true
            });

            if (!form) {
                return res.status(404).json({ error: "Form not found" });
            }

            console.log("✅ Form updated:", form._id);
            res.json({ success: true, form });
        } catch (err) {
            console.error("❌ Error updating form:", err);
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Publish form
     * POST /entity/:entityId/forms/api/publish/:formId
     */
    publishForm_Api: async (req, res) => {
        try {
            const EntityForm = await tenantCollection(req, "EntityForm");

            const updateData = { status: 'published' };
            if (req.body.layout) updateData.layout = req.body.layout;

            const form = await EntityForm.findByIdAndUpdate(req.params.formId, updateData, {
                new: true,
                runValidators: true
            });

            if (!form) {
                return res.status(404).json({ error: "Form not found" });
            }

            console.log("✅ Form published:", form._id);
            res.json({ success: true, form });
        } catch (err) {
            console.error("❌ Error publishing form:", err);
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Delete form
     * DELETE /entity/:entityId/forms/api/:formId
     */
    deleteForm_Api: async (req, res) => {
        try {
            const EntityForm = await tenantCollection(req, "EntityForm");
            const form = await EntityForm.findByIdAndDelete(req.params.formId);

            if (!form) {
                return res.status(404).json({ error: "Form not found" });
            }

            // If deleted form was default, make the first remaining form default
            if (form.isDefault) {
                const firstForm = await EntityForm.findOne({ entityId: req.params.entityId }).sort({ order: 1 });
                if (firstForm) {
                    firstForm.isDefault = true;
                    await firstForm.save();
                }
            }

            console.log("✅ Form deleted:", form._id);
            res.json({ success: true });
        } catch (err) {
            console.error("❌ Error deleting form:", err);
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Set form as default
     * POST /entity/:entityId/forms/api/set-default/:formId
     */
    setDefault_Api: async (req, res) => {
        try {
            const EntityForm = await tenantCollection(req, "EntityForm");

            // Remove default from all other forms
            await EntityForm.updateMany(
                { entityId: req.params.entityId },
                { isDefault: false }
            );

            const form = await EntityForm.findByIdAndUpdate(
                req.params.formId,
                { isDefault: true },
                { new: true }
            );

            if (!form) {
                return res.status(404).json({ error: "Form not found" });
            }

            console.log("✅ Form set as default:", form._id);
            res.json({ success: true, form });
        } catch (err) {
            console.error("❌ Error setting default form:", err);
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Auto-create a form from entity fields (used by design mode on record-edit)
     * POST /entity/:entityId/forms/api/auto-create
     */
    autoCreateForm_Api: async (req, res) => {
        try {
            const Entity = await tenantCollection(req, "Entity");
            const EntityForm = await tenantCollection(req, "EntityForm");
            const FieldTemplate = await tenantCollection(req, "FieldTemplate");

            const entity = await Entity.findById(req.params.entityId)
                .populate('customFields')
                .populate('classifications')
                .populate('relations.targetEntity');

            if (!entity) {
                return res.status(404).json({ error: "Entity not found" });
            }

            // Check if a form already exists
            const existingForm = await EntityForm.findOne({ entityId: entity._id, status: 'published' });
            if (existingForm) {
                return res.json({ success: true, form: existingForm, existing: true });
            }

            // Build rows/columns from entity fields
            const rows = [];
            let currentRowFields = [];

            // Helper: flush current row fields into a row
            const flushRow = () => {
                if (currentRowFields.length === 0) return;
                const totalWidth = currentRowFields.reduce((sum, f) => sum + f.width, 0);
                // If total width exceeds 12, split into multiple rows
                if (totalWidth <= 12) {
                    rows.push({
                        columns: currentRowFields.map(f => ({
                            width: f.width,
                            fields: [{ id: f.id, fieldId: f.fieldId, type: f.type, label: f.label }]
                        }))
                    });
                } else {
                    // Split evenly
                    currentRowFields.forEach(f => {
                        rows.push({
                            columns: [{ width: 12, fields: [{ id: f.id, fieldId: f.fieldId, type: f.type, label: f.label }] }]
                        });
                    });
                }
                currentRowFields = [];
            };

            // Add standard "enabled" fields
            const standardFields = [];
            const enabled = entity.enabledStandardFields || [];
            if (enabled.includes('description')) {
                standardFields.push({ id: `std_description`, fieldId: 'description', type: 'standard', label: 'Description', width: 12 });
            }
            if (enabled.includes('date')) {
                standardFields.push({ id: `std_date`, fieldId: 'date', type: 'standard', label: 'Date', width: 6 });
            }
            if (enabled.includes('slug')) {
                standardFields.push({ id: `std_slug`, fieldId: 'slug', type: 'standard', label: 'Slug', width: 6 });
            }

            // Add custom fields with smart widths
            const customFieldItems = (entity.customFields || []).map((cf, idx) => {
                const cfType = cf.type || 'string';
                const cfSubtype = cf.subtype || '';
                let width = 6;
                if (['textarea', 'richtext'].includes(cfType) || ['textarea', 'richtext'].includes(cfSubtype)) {
                    width = 12;
                }
                return {
                    id: `cf_${cf._id.toString()}`,
                    fieldId: cf._id.toString(),
                    type: 'custom',
                    label: cf.label || cf.name || 'Champ',
                    width
                };
            });

            // Add relation fields
            const relationItems = (entity.relations || []).map(r => ({
                id: `rel_${r.key}`,
                fieldId: r.key,
                type: 'relation',
                label: r.label || (r.targetEntity && r.targetEntity.name) || 'Relation',
                width: 6
            }));

            // Add classification fields
            const classificationItems = (entity.classifications || []).map(c => {
                const cls = typeof c === 'object' ? c : null;
                if (!cls) return null;
                return {
                    id: `cls_${cls._id.toString()}`,
                    fieldId: cls._id.toString(),
                    type: 'classification',
                    label: cls.name || 'Classification',
                    width: 6
                };
            }).filter(Boolean);

            // Combine all and build rows (pair fields into 2-column rows)
            const allFields = [...standardFields, ...customFieldItems, ...relationItems, ...classificationItems];

            for (let i = 0; i < allFields.length; i++) {
                const field = allFields[i];
                if (field.width >= 12) {
                    flushRow();
                    rows.push({
                        columns: [{ width: 12, fields: [{ id: field.id, fieldId: field.fieldId, type: field.type, label: field.label }] }]
                    });
                } else {
                    currentRowFields.push(field);
                    if (currentRowFields.reduce((s, f) => s + f.width, 0) >= 12) {
                        flushRow();
                    }
                }
            }
            flushRow();

            const layout = {
                version: 1,
                rows,
                settings: { showRightSidebar: true }
            };

            // Create the form
            const count = await EntityForm.countDocuments({ entityId: entity._id });
            const form = new EntityForm({
                entityId: entity._id,
                name: 'Formulaire principal',
                layout,
                status: 'published',
                isDefault: true,
                order: 0
            });

            // Remove default from other forms
            if (count > 0) {
                await EntityForm.updateMany({ entityId: entity._id }, { isDefault: false });
            }

            await form.save();
            console.log("✅ Auto-created form:", form._id, "with", rows.length, "rows");
            res.json({ success: true, form, created: true });
        } catch (err) {
            console.error("❌ Error auto-creating form:", err);
            res.status(500).json({ error: err.message });
        }
    }
};
