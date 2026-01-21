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
        }
        res.send("Deleted");
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
        }
        res.send("Deleted");
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

      const entity = await Entity.findById(req.params.id);
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
        formLayout: entity.layout || [],
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

    console.log(entityData); // ✅

    let errors = [];
    if (errors.length > 0) {
      res.render("entity/entity-add", {
        errors,
      });
    } else {
      const newEntity = new Entity(entityData);
      newEntity.save().then((entity) => {
        res.redirect(`/account/${accountNumber}/entity/list`);
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
    res.send("Edit function here");
  },
};
