const FieldTemplate = require("../models/field-template.model");
const tenantCollection = require("../middleware/tenant").tenantCollection;

module.exports = {
  addForm: async (req, res) => {
    const { fieldtype, subtype, customType } = req.query;
    const accountNumber = req.account_number;
    const Entity = await tenantCollection(req, "Entity");
    const entities = await Entity.find();

    // Si un type est sélectionné, on redirige vers le formulaire dédié
    if (fieldtype) {
      let templateFile = "";

      // Mapping du type vers le nom du fichier EJS
      switch (fieldtype) {
        case "string":
          templateFile = "field-template-add-string";
          break;
        case "text":
          templateFile = "field-template-add-text";
          break;
        case "number":
          templateFile = "field-template-add-number";
          break;
        case "boolean":
          templateFile = "field-template-add-boolean";
          break;
        case "date":
          templateFile = "field-template-add-date";
          break;
        case "select":
          templateFile = "field-template-add-select";
          break;
        case "relation":
          templateFile = "field-template-add-relation";
          break;
        case "file":
          templateFile = "field-template-add-file";
          break;
        case "image":
          templateFile = "field-template-add-image";
          break;
        case "email":
          templateFile = "field-template-add-email";
          break;
        case "tel":
          templateFile = "field-template-add-tel";
          break;
        case "map":
          templateFile = "field-template-add-map";
          break;
        case "monetary":
          templateFile = "field-template-add-monetary";
          break;
        default:
          // Fallback si type inconnu
          return res.status(400).render("errors/404", {
            message: "Type de champ inconnu.",
            layout: "layout-app",
          });
      }

      return res.render(`field-template/field-types/${templateFile}`, {
        account_number: accountNumber,
        fieldtype,
        subtype,
        customType,
        entities,
        layout: "layout-app",
      });
    }

    // Si aucun type n’est encore sélectionné, affiche la sélection des types
    res.render("field-template/field-template-add", {
      account_number: accountNumber,
      layout: "layout-app",
    });
  },
  save: async (req, res) => {
    const FieldTemplateModel = await tenantCollection(req, "FieldTemplate");
    const accountNumber = req.account_number;

    try {
      // 1. Récupération des champs simples + imbriqués
      const { name, label, description, type, subtype, htmlTemplate } =
        req.body;

      const type_config = {};
      if (req.body["type_config.regex"]) {
        type_config.regex = req.body["type_config.regex"];
      }

      const ui = {};
      if (req.body["ui.placeholder"]) {
        ui.placeholder = req.body["ui.placeholder"];
      }
      if (req.body["ui.width"]) {
        ui.width = req.body["ui.width"];
      }
      if (req.body["ui.icon"]) {
        ui.icon = req.body["ui.icon"];
      }

      // 2. Création du field
      const fieldTemplateData = {
        name,
        label,
        description,
        type,
        subtype,
        htmlTemplate,
        type_config,
        ui,
      };

      const newField = new FieldTemplateModel(fieldTemplateData);
      await newField.save();

      // 3. Redirection
      res.redirect(`/account/${accountNumber}/field-template/list`);
    } catch (err) {
      console.error("Erreur d'enregistrement :", err);
      res.status(500).render("field-template/field-template-add", {
        errors: [{ msg: "Erreur lors de l’enregistrement." }],
        account_number: accountNumber,
        layout: "layout-app",
      });
    }
  },
  list: async (req, res) => {
    const FieldTemplateModel = await tenantCollection(req, "FieldTemplate");
    FieldTemplateModel.find({}, (err, templates) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Erreur serveur");
      }
      res.render("field-template/field-template-list", {
        account_number: req.account_number,
        layout: "layout-app",
        fields: templates,
      });
    });
  },

  editForm: async (req, res) => {
    const FieldTemplateModel = await tenantCollection(req, "FieldTemplate");
    FieldTemplateModel.findById(req.params.id, (err, template) => {
      if (err || !template) {
        return res.status(404).render("errors/404", {
          message: "Modèle introuvable.",
          layout: "layout-app",
        });
      }
      res.render("field-template/field-template-edit", {
        fieldTemplate: template,
        account_number: req.account_number,
        layout: "layout-app",
      });
    });
  },

  update: async (req, res) => {
    const FieldTemplateModel = await tenantCollection(req, "FieldTemplate");
    const fieldTemplateData = req.body;
    const id = req.params.id;

    try {
      const updated = await FieldTemplateModel.findByIdAndUpdate(
        id,
        fieldTemplateData,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updated) throw new Error("Échec de la mise à jour");

      res.redirect(`/account/${req.account_number}/field-template/list`);
    } catch (err) {
      console.error("Erreur update :", err);
      res.status(500).render("field-template/field-template-edit", {
        errors: [{ msg: "Une erreur est survenue lors de la mise à jour." }],
        fieldTemplate: fieldTemplateData,
        account_number: req.account_number,
        layout: "layout-app",
      });
    }
  },

  delete: async (req, res) => {
    const FieldTemplateModel = await tenantCollection(req, "FieldTemplate");
    try {
      await FieldTemplateModel.findByIdAndDelete(req.params.id);
      res.send("Deleted");
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur lors de la suppression");
    }
  },

  // API (optionnels)
  list_Api: async (req, res) => {
    const FieldTemplateModel = await tenantCollection(req, "FieldTemplate");
    const list = await FieldTemplateModel.find({});
    res.json(list);
  },

  save_Api: async (req, res) => {
    const FieldTemplateModel = await tenantCollection(req, "FieldTemplate");
    const newField = new FieldTemplateModel(req.body);
    try {
      await newField.save();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  update_Api: async (req, res) => {
    const FieldTemplateModel = await tenantCollection(req, "FieldTemplate");
    try {
      const updated = await FieldTemplateModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  singlePage: async (req, res) => {
    const FieldTemplateModel = await tenantCollection(req, "FieldTemplate");
    FieldTemplateModel.findById(req.params.id, (err, template) => {
      if (err || !template) {
        return res.status(404).render("errors/404", {
          message: "Modèle introuvable.",
          layout: "layout-app",
        });
      }
      res.render("field-template/field-template-single", {
        fieldTemplate: template,
        layout: "layout-app",
      });
    });
  },

  singlePage_Api: async (req, res) => {
    const FieldTemplateModel = await tenantCollection(req, "FieldTemplate");
    const field = await FieldTemplateModel.findById(req.params.id);
    res.json(field);
  },
};
