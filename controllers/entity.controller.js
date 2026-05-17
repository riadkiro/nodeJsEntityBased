const Entity = require("../models/entity.model");
const tenantCollection = require("../middleware/tenant").tenantCollection;

const mongoose = require("mongoose");

module.exports = {
  addForm: async (req, res) => {
    res.render("entity/entity-add", {
      account_number: req.account_number,
      layout: "layout-app",
    });
  },

  delete: async (req, res) => {
    let query = { _id: req.params.id };
    const Entity = await tenantCollection(req, "Entity");
    Entity.findById(req.params.id, function (err, entity) {
      Entity.remove(query, function (err) {
        if (err) {
          console.log(err);
          return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, message: "Deleted" });
      });
    });
  },

  delete_Api: async (req, res) => {
    const Entity = await tenantCollection(req, "Entity");
    let query = { _id: req.params.id };
    Entity.findById(req.params.id, function (err, entity) {
      Entity.remove(query, function (err) {
        if (err) {
          console.log(err);
          return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, message: "Deleted" });
      });
    });
  },

  bulkDelete: async (req, res) => {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, error: "No IDs provided" });
      }

      const Entity = await tenantCollection(req, "Entity");
      const Record = await tenantCollection(req, "Record");
      const View = await tenantCollection(req, "View");

      // Delete associated records
      await Record.deleteMany({ entityId: { $in: ids } });

      // Delete associated views
      await View.deleteMany({ entity: { $in: ids } });

      // Delete entities
      const result = await Entity.deleteMany({ _id: { $in: ids } });

      res.json({
        success: true,
        message: `${result.deletedCount} collection(s) supprimée(s)`,
        deletedCount: result.deletedCount
      });
    } catch (err) {
      console.error("[Entity] bulkDelete Error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  },
  editForm: async (req, res) => {
    try {
      // 1. Validate ID to prevent CastError
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).render("errors/404", {
          message: "ID non valide.",
          layout: "layout-app",
          account_number: req.account_number,
        });
      }

      const Entity = await tenantCollection(req, "Entity");
      const FieldTemplate = await tenantCollection(req, "FieldTemplate");
      const Classification = await tenantCollection(req, "Classification");

      const entity = await Entity.findById(req.params.id).populate('relations.targetEntity', '_id name slug icon color');
      const allClassifications = await Classification.find({
        $or: [
          { entities: { $exists: true, $size: 0 } },
          { entities: { $exists: false } },
          { entities: entity._id }
        ]
      });
      // All entities for relation display in form builder
      const allEntities = await Entity.find({}, '_id name slug icon color');
      if (!entity) {
        return res.status(404).render("errors/404", {
          message: "Entité introuvable.",
          layout: "layout-app",
        });
      }

      // 🔐 Échapper les caractères pour inclusion sécurisée dans <script type="application/json">
      const escapeForJSONScript = (str) => {
        return str
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"')
          .replace(/\n/g, "\\n")
          .replace(/\r/g, "")
          .replace(/<\/script>/gi, "<\\/script>");
      };

      const allFieldTemplatesRaw = await FieldTemplate.find();

      const allFieldTemplates = allFieldTemplatesRaw.map((template) => ({
        ...template.toObject(),
        htmlTemplate: template.htmlTemplate || "",
      }));

      const selectedFields = allFieldTemplates.filter((ft) =>
        entity.customFields
          ?.map((id) => id.toString())
          .includes(ft._id.toString())
      );

      res.render("entity/entity-edit", {
        entity,
        fields: selectedFields,
        allFieldTemplates,
        allClassifications,
        allEntities,
        formLayout: entity.formLayout || entity.layout || { version: 1, rows: [] },
        formLayoutStatus: entity.formLayoutStatus || 'draft',
        account_number: req.account_number,
        layout: "layout-app",
      });
    } catch (err) {
      console.error("Erreur :", err);
      return res.status(500).render("errors/500", {
        message: "Erreur serveur",
        layout: "layout-app",
      });
    }
  },
  updateCustomFields: async (req, res) => {
    try {
      const Entity = await tenantCollection(req, "Entity");
      const entityId = req.params.id;
      const fieldsArray = req.body.fields;

      console.log("🔄 Champs reçus :", fieldsArray);

      if (!Array.isArray(fieldsArray)) {
        return res
          .status(400)
          .json({ error: "Le champ 'fields' doit être un tableau." });
      }

      // 🔁 Ne garder que les _id valides pour Mongoose (évite les CastError avec les relations UUID)
      const fieldIds = fieldsArray.map((f) => f && f._id)
                                 .filter((id) => id && mongoose.Types.ObjectId.isValid(id));
      const layout = req.body.layout || [];

      console.log("🔄 IDs des champs :", fieldIds);
      console.log("🔄 Layout reçu :", layout);

      const updated = await Entity.findByIdAndUpdate(
        entityId,
        { 
          customFields: fieldIds, 
          layout: layout,
          formLayout: layout // Sync both for consistency
        },
        { new: true }
      );

      if (!updated) {
        return res.status(400).json({ error: "Entité non trouvée." });
      }

      res.json({
        message: "Champs personnalisés mis à jour avec succès.",
        entity: updated,
      });
    } catch (err) {
      console.error("Erreur updateCustomFields:", err);
      res.status(500).json({ error: "Erreur serveur." });
    }
  },

  list: async (req, res) => {
    const EntityModel = await tenantCollection(req, "Entity");

    EntityModel.find({}, function (err, entityAll) {
      if (err) {
        console.log(err);
      } else {
        res.render("entity/entity-list", {
          account_number: req.account_number,
          layout: "layout-app",
          entities: entityAll, // ← Important
        });
      }
    });
  },

  listPopulate: async (req, res) => {
    Entity.find({})
      .populate("Permission")
      .exec(function (err, entityAll) {
        if (err) {
          console.log(err);
        } else {
          res.send({
            entityAll,
          });
        }
      });
  },

  list_Api: async (req, res) => {
    Entity.find({}, function (err, entityAll) {
      if (err) {
        console.log(err);
      } else {
        res.send({
          entityAll,
        });
      }
    });
  },

  save: async (req, res) => {
    const Entity = await tenantCollection(req, "Entity");
    let accountNumber = req.account_number;
    const entityData = req.body;
    const isJsonRequest = req.headers['content-type']?.includes('application/json');

    console.log('Creating entity:', entityData);

    let errors = [];
    if (!entityData.name) {
      errors.push({ msg: 'Le nom est requis' });
    }

    if (errors.length > 0) {
      if (isJsonRequest) {
        return res.status(400).json({ success: false, errors });
      }
      return res.render("entity/entity-add", { errors });
    }

    try {
      const newEntity = new Entity(entityData);
      await newEntity.save();

      if (isJsonRequest) {
        return res.json({ success: true, entity: newEntity });
      }
      res.redirect(`/account/${accountNumber}/entity/list`);
    } catch (error) {
      console.error('Entity save error:', error);
      if (isJsonRequest) {
        if (error.code === 11000) {
          return res.status(400).json({ success: false, error: `Le slug "${entityData.slug}" existe déjà. Choisissez un slug unique.` });
        }
        return res.status(500).json({ success: false, error: error.message });
      }
      res.status(500).render("entity/entity-add", {
        errors: [{ msg: error.message }]
      });
    }
  },

  save_Api: async (req, res) => {
    const entity = req.body;
    let errors = [];
    if (errors.length > 0) {
      res.send({ errors });
    } else {
      const newEntity = new Entity(entity);
      newEntity.save().then((entity) => {
        res.send(`${entity} saved in databse`);
      });
    }
  },

  singlePage: async (req, res) => {
    try {
      // 1. Validate ID to prevent CastError (e.g. for "favicon.png")
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).render("errors/404", {
          message: "ID non valide.",
          layout: "layout-app", // Ensure this layout exists or use a default
          account_number: req.account_number,
        });
      }

      // 2. Register FieldTemplate model on the tenant connection so populate works
      await tenantCollection(req, "FieldTemplate");
      const Entity = await tenantCollection(req, "Entity");

      const entity = await Entity.findById(req.params.id).populate("customFields");

      if (!entity) {
        return res.status(404).render("errors/404", {
          message: "Entité introuvable.",
          layout: "layout-app",
          account_number: req.account_number,
        });
      }

      console.log(entity);
      res.render("entity/entity-single", {
        entity,
        layout: "layout-app",
        account_number: req.account_number,
      });
    } catch (err) {
      console.error("Error in singlePage:", err);
      res.status(500).render("errors/500", { // Assuming errors/500 exists
        message: "Erreur serveur",
        layout: "layout-app"
      });
    }
  },

  singlePage_Api: async (req, res) => {
    Entity.find({ entity_id: req.params.id }, function (err, entity) {
      if (err) {
        console.log(err);
      } else {
        res.send(entity);
      }
    });
  },

  update: async (req, res) => {
    const Entity = await tenantCollection(req, "Entity");
    const entityData = req.body;
    const entityId = req.params.id;

    console.log("🔄 Start Updating Entity");

    // Gérer le champ image si un fichier est uploadé
    if (req.file) {
      entityData.image = `/uploads/${req.account_number}/${req.file.filename}`;
    }

    if (!entityData.statusClassification) {
      entityData.statusClassification = null;
    }

    if (!entityData.classifications) {
      entityData.classifications = [];
    }

    console.log(entityData);

    let errors = [];
    if (!entityId) {
      errors.push({ msg: "ID d'entité manquant pour la mise à jour." });
    }

    if (errors.length > 0) {
      return res.render("entity/entity-edit", {
        errors,
        entity: entityData,
        account_number: req.account_number,
        layout: "layout-app",
      });
    }

    try {
      const updated = await Entity.findByIdAndUpdate(entityId, entityData, {
        new: true,
        runValidators: true,
      });

      if (!updated) {
        throw new Error("Mise à jour échouée");
      }

      console.log("✅ Entité mise à jour :", updated);
      res.redirect(`/account/${req.account_number}/entity/list`);
    } catch (err) {
      console.error("❌ Erreur lors de la mise à jour :", err);
      res.status(500).render("entity/entity-edit", {
        errors: [{ msg: "Une erreur est survenue lors de la mise à jour." }],
        entity: entityData,
        account_number: req.account_number,
        layout: "layout-app",
      });
    }
  },

  update_Api: async (req, res) => {
    try {
      const Entity = await tenantCollection(req, "Entity");
      const entityId = req.params.id;
      const entityData = req.body;

      // Extract quickFormFieldIds before saving entity (not a schema field)
      const quickFormFieldIds = entityData.quickFormFieldIds || null;
      delete entityData.quickFormFieldIds;
      const quickFormClassificationIds = entityData.quickFormClassificationIds || null;
      delete entityData.quickFormClassificationIds;

      console.log("🔄 API Update Entity:", entityId, entityData);

      // Check slug uniqueness if slug is being updated
      if (entityData.slug) {
        const existing = await Entity.findOne({ slug: entityData.slug, _id: { $ne: entityId } });
        if (existing) {
          return res.status(400).json({ error: `Le slug "${entityData.slug}" existe déjà. Choisissez un slug unique.` });
        }
      }

      const updated = await Entity.findByIdAndUpdate(entityId, entityData, {
        new: true,
        runValidators: true,
      });

      if (!updated) {
        return res.status(404).json({ error: "Entity not found" });
      }

      // Sync showOnQuickForm on FieldTemplates
      if (quickFormFieldIds !== null && updated.customFields?.length > 0) {
        const FieldTemplate = await tenantCollection(req, "FieldTemplate");
        const allFieldIds = updated.customFields.map(id => id.toString());
        const qfSet = new Set(quickFormFieldIds.map(String));

        // Batch update: set showOnQuickForm = true for selected, false for others
        const enableIds = allFieldIds.filter(id => qfSet.has(id));
        const disableIds = allFieldIds.filter(id => !qfSet.has(id));

        if (enableIds.length > 0) {
          await FieldTemplate.updateMany({ _id: { $in: enableIds } }, { showOnQuickForm: true });
        }
        if (disableIds.length > 0) {
          await FieldTemplate.updateMany({ _id: { $in: disableIds } }, { showOnQuickForm: false });
        }
      }

      // Sync showOnQuickForm on Classifications
      if (quickFormClassificationIds !== null) {
        const Classification = await tenantCollection(req, "Classification");
        const allClassifIds = [
          ...(updated.classifications || []).map(id => id.toString()),
          ...(updated.statusClassification ? [updated.statusClassification.toString()] : [])
        ].filter(Boolean);
        const qfClassifSet = new Set(quickFormClassificationIds.map(String));

        const enableClassifIds = allClassifIds.filter(id => qfClassifSet.has(id));
        const disableClassifIds = allClassifIds.filter(id => !qfClassifSet.has(id));

        if (enableClassifIds.length > 0) {
          await Classification.updateMany({ _id: { $in: enableClassifIds } }, { showOnQuickForm: true });
        }
        if (disableClassifIds.length > 0) {
          await Classification.updateMany({ _id: { $in: disableClassifIds } }, { showOnQuickForm: false });
        }
      }

      console.log("✅ Entity updated via API:", updated);
      res.json({ success: true, entity: updated });
    } catch (err) {
      console.error("❌ Error updating entity:", err);
      if (err.code === 11000) {
        return res.status(400).json({ error: `Le slug "${req.body.slug}" existe déjà. Choisissez un slug unique.` });
      }
      res.status(500).json({ error: err.message });
    }
  },

  // Publish form layout (save + set status to published)
  publishFormLayout_Api: async (req, res) => {
    try {
      const Entity = await tenantCollection(req, "Entity");
      const entityId = req.params.id;

      // Save formLayout if provided in body
      const updateData = { formLayoutStatus: 'published' };
      if (req.body.formLayout) {
        updateData.formLayout = req.body.formLayout;
      }

      const updated = await Entity.findByIdAndUpdate(entityId, updateData, {
        new: true,
        runValidators: true,
      });

      if (!updated) {
        return res.status(404).json({ error: "Entity not found" });
      }

      console.log("✅ Form layout published for entity:", entityId);
      res.json({ success: true, entity: updated });
    } catch (err) {
      console.error("❌ Error publishing form layout:", err);
      res.status(500).json({ error: err.message });
    }
  },

  getDetails_Api: async (req, res) => {
    try {
      const EntityModel = await tenantCollection(req, "Entity");
      const entity = await EntityModel.findById(req.params.id).populate('customFields');
      if (!entity) return res.status(404).json({ error: "Entity not found" });

      res.json(entity);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  // List all entities (for relation picker) — lightweight
  listAll_Api: async (req, res) => {
    try {
      const EntityModel = await tenantCollection(req, "Entity");
      const entities = await EntityModel.find({}, '_id name slug icon color');
      res.json(entities);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  // Get fields of a specific entity (for relation searchFields/displayFields config)
  getEntityFields_Api: async (req, res) => {
    try {
      const EntityModel = await tenantCollection(req, "Entity");
      const entity = await EntityModel.findById(req.params.id).populate('customFields');
      if (!entity) return res.status(404).json({ error: "Entity not found" });

      const fields = [];

      // Standard fields
      const standardFieldDefs = {
        title: { label: 'Titre', icon: 'solar:text-bold', type: 'string' },
        description: { label: 'Description', icon: 'solar:document-text-bold-duotone', type: 'string' },
        slug: { label: 'Slug', icon: 'solar:link-bold', type: 'string' },
        date: { label: 'Date', icon: 'solar:calendar-bold-duotone', type: 'date' },
        icon: { label: 'Icône', icon: 'solar:star-bold-duotone', type: 'string' },
        image: { label: 'Image', icon: 'solar:gallery-bold-duotone', type: 'media' },
        attachments: { label: 'Pièces jointes', icon: 'solar:paperclip-bold', type: 'media' }
      };

      (entity.enabledStandardFields || []).forEach(fieldKey => {
        const def = standardFieldDefs[fieldKey];
        if (def) {
          fields.push({ id: fieldKey, label: def.label, icon: def.icon, type: def.type, isStandard: true });
        }
      });

      // Custom fields (populated)
      (entity.customFields || []).forEach(cf => {
        if (cf && cf._id) {
          fields.push({
            id: cf._id.toString(),
            label: cf.label || cf.name,
            icon: cf.ui?.icon || 'solar:widget-bold',
            type: cf.type || 'string',
            isStandard: false
          });
        }
      });

      res.json(fields);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  // ===== SETTINGS PAGE =====
  settingsForm: async (req, res) => {
    try {
      const Entity = await tenantCollection(req, "Entity");
      const Classification = await tenantCollection(req, "Classification");

      const entityId = req.params.id;
      let entity = null;
      let mode = 'create';
      let templateData = null;

      if (entityId) {
        if (!mongoose.Types.ObjectId.isValid(entityId)) {
          return res.status(404).render("errors/404", {
            message: "ID non valide.",
            layout: "layout-app",
            account_number: req.account_number,
          });
        }
        entity = await Entity.findById(entityId).populate('relations.targetEntity', '_id name slug icon color');
        if (!entity) {
          return res.status(404).render("errors/404", {
            message: "Entité introuvable.",
            layout: "layout-app",
            account_number: req.account_number,
          });
        }
        mode = 'edit';
      }

      // ── Load template data if ?template= query param is present ──
      const templateId = req.query.template;
      if (templateId && !entityId) {
        try {
          const EntityTemplate = require('../models/entity-template.model');
          const tpl = await EntityTemplate.findById(templateId).lean();
          if (tpl) {
            templateData = {
              name: tpl.name || '',
              slug: tpl.slug || '',
              description: tpl.description || '',
              icon: tpl.icon || '',
              color: tpl.color || '',
              image: tpl.image || '',
              enabledStandardFields: tpl.enabledStandardFields || ['title'],
              fields: (tpl.fields || []).map(f => ({
                name: f.name,
                label: f.label,
                description: f.description || '',
                type: f.type || 'string',
                subtype: f.subtype || '',
                category: f.category || 'text',
                icon: f.icon || 'solar:widget-bold',
                required: f.required || false,
                typeConfig: f.typeConfig || {},
                ui: f.ui || {}
              })),
              classifications: (tpl.classifications || []).map(c => ({
                name: c.name,
                slug: c.slug || '',
                type: c.type || 'status',
                isStatus: c.isStatus || false,
                options: (c.options || []).map(o => ({
                  label: o.label,
                  value: o.value || '',
                  color: o.color || '#4361ee',
                  icon: o.icon || '',
                  order: o.order || 0
                }))
              })),
              referenceTitleTokens: tpl.referenceTitleTokens || [{ t: 'field', id: 'title' }]
            };
          }
        } catch (tplErr) {
          console.error("Template load error:", tplErr);
          // Continue without template — not critical
        }
      }

      let allClassifications;
      if (mode === 'edit' && entity) {
        allClassifications = await Classification.find({
          $or: [
            { entities: { $exists: true, $size: 0 } },
            { entities: { $exists: false } },
            { entities: entity._id }
          ]
        });
      } else {
        // New entity: show only global classifications
        allClassifications = await Classification.find({
          $or: [
            { entities: { $exists: true, $size: 0 } },
            { entities: { $exists: false } }
          ]
        });
      }
      const allEntities = await Entity.find({}, '_id name slug icon color');

      // Compute incoming (inverse) relations for the settings page
      let incomingRelations = [];
      if (mode === 'edit' && entity) {
        const entityIdStr = entity._id.toString();
        for (const ent of allEntities) {
          // Need to load full entity with relations for this check
          const fullEnt = await Entity.findById(ent._id).lean();
          if (!fullEnt || !fullEnt.relations) continue;
          for (const rel of fullEnt.relations) {
            if (rel.targetEntity && rel.targetEntity.toString() === entityIdStr) {
              incomingRelations.push({
                sourceEntityId: ent._id.toString(),
                sourceEntityName: ent.name,
                sourceEntitySlug: ent.slug,
                sourceEntityIcon: ent.icon || 'solar:widget-bold-duotone',
                sourceEntityColor: ent.color || '#4361ee',
                label: rel.label,
                inverseLabel: rel.inverseLabel || rel.label,
                cardinality: rel.cardinality || 'one-to-many',
                key: rel.key
              });
            }
          }
        }
      }

      res.render("entity/entity-settings", {
        mode,
        entity,
        templateData,
        allClassifications,
        allEntities,
        incomingRelations,
        account_number: req.account_number,
        layout: "layout-app",
      });
    } catch (err) {
      console.error("Settings form error:", err);
      return res.status(500).render("errors/500", {
        message: "Erreur serveur",
        layout: "layout-app",
        account_number: req.account_number,
      });
    }
  },

  // ===== CARDS PAGE =====
  cardsPage: async (req, res) => {
    try {
      const EntityModel = await tenantCollection(req, "Entity");
      await tenantCollection(req, "FieldTemplate");
      const entityId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(entityId)) {
        return res.status(404).render("errors/404", {
          message: "ID non valide.",
          layout: "layout-app",
          account_number: req.account_number,
        });
      }

      const entity = await EntityModel.findById(entityId)
        .populate('customFields')
        .populate('relations.targetEntity', 'name icon color slug');
      if (!entity) {
        return res.status(404).render("errors/404", {
          message: "Entité introuvable.",
          layout: "layout-app",
          account_number: req.account_number,
        });
      }

      const fields = entity.customFields || [];

      // Find inverse relations: entities whose relations target the current entity
      const inverseEntities = await EntityModel.find(
        { 'relations.targetEntity': entityId },
        'name icon color slug relations'
      ).lean();
      const entityIdStr = entityId.toString();
      const inverseRelations = [];
      for (const ent of inverseEntities) {
        for (const rel of (ent.relations || [])) {
          if (rel.targetEntity && rel.targetEntity.toString() === entityIdStr) {
            inverseRelations.push({
              key: `inv_${rel.key}`,
              label: rel.inverseLabel || rel.label || ent.name,
              targetName: ent.name,
              targetIcon: ent.icon || '',
              targetColor: ent.color || '',
              cardinality: rel.cardinality || 'one-to-many',
              isInverse: true,
              sourceKey: rel.key,
            });
          }
        }
      }

      res.render("entity/entity-cards", {
        entity,
        fields,
        inverseRelations,
        account_number: req.account_number,
        layout: "layout-app",
      });
    } catch (err) {
      console.error("Cards page error:", err);
      return res.status(500).render("errors/500", {
        message: "Erreur serveur",
        layout: "layout-app",
        account_number: req.account_number,
      });
    }
  },

  // ===== INLINE FIELD MANAGEMENT (from record Fiche) =====

  /**
   * Add a single field to an entity's customFields array.
   * POST /entity/api/:id/add-field  body: { fieldId }
   */
  addFieldToEntity_Api: async (req, res) => {
    try {
      const Entity = await tenantCollection(req, "Entity");
      const entityId = req.params.id;
      const { fieldId } = req.body;

      if (!fieldId || !mongoose.Types.ObjectId.isValid(fieldId)) {
        return res.status(400).json({ error: "fieldId invalide" });
      }

      const entity = await Entity.findById(entityId);
      if (!entity) return res.status(404).json({ error: "Entity not found" });

      // Check if field is already on this entity
      const alreadyExists = entity.customFields.some(
        (id) => id.toString() === fieldId.toString()
      );
      if (alreadyExists) {
        return res.json({ success: true, message: "Field already on entity", alreadyExists: true });
      }

      entity.customFields.push(fieldId);
      await entity.save();

      console.log(`✅ Field ${fieldId} added to entity ${entity.slug}`);
      res.json({ success: true, entity });
    } catch (err) {
      console.error("❌ addFieldToEntity error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Remove a single field from an entity's customFields array.
   * POST /entity/api/:id/remove-field  body: { fieldId }
   */
  removeFieldFromEntity_Api: async (req, res) => {
    try {
      const Entity = await tenantCollection(req, "Entity");
      const entityId = req.params.id;
      const { fieldId } = req.body;

      if (!fieldId || !mongoose.Types.ObjectId.isValid(fieldId)) {
        return res.status(400).json({ error: "fieldId invalide" });
      }

      const entity = await Entity.findById(entityId);
      if (!entity) return res.status(404).json({ error: "Entity not found" });

      entity.customFields = entity.customFields.filter(
        (id) => id.toString() !== fieldId.toString()
      );
      await entity.save();

      console.log(`✅ Field ${fieldId} removed from entity ${entity.slug}`);
      res.json({ success: true, entity });
    } catch (err) {
      console.error("❌ removeFieldFromEntity error:", err);
      res.status(500).json({ error: err.message });
    }
  },
};
