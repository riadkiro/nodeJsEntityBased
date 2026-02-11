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
      const allClassifications = await Classification.find();
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

      // 🔁 Ne garder que les _id
      const fieldIds = fieldsArray.map((f) => f && f._id).filter((id) => !!id);
      const layout = req.body.layout || [];

      console.log("🔄 IDs des champs :", fieldIds);
      console.log("🔄 Layout reçu :", layout);

      const updated = await Entity.findByIdAndUpdate(
        entityId,
        { customFields: fieldIds, layout: layout },
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

      const allClassifications = await Classification.find();
      const allEntities = await Entity.find({}, '_id name slug icon color');

      res.render("entity/entity-settings", {
        mode,
        entity,
        allClassifications,
        allEntities,
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
  }
};
