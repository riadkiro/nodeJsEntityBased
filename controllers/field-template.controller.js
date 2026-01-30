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
            account_number: accountNumber,
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
      const { name, label, description, type, subtype, htmlTemplate, jsTemplate } =
        req.body;

      const type_config = {};
      if (req.body["type_config.regex"]) {
        type_config.regex = req.body["type_config.regex"];
      }
      if (req.body["type_config.refEntity"]) {
        type_config.refEntity = req.body["type_config.refEntity"];
      }
      if (req.body["type_config.multiple"]) {
        type_config.multiple = req.body["type_config.multiple"] === 'on' || req.body["type_config.multiple"] === true || req.body["type_config.multiple"] === 'true';
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
        jsTemplate,
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
    try {
      const FieldTemplateModel = await tenantCollection(req, "FieldTemplate");
      const EntityModel = await tenantCollection(req, "Entity");

      const templates = await FieldTemplateModel.find({});
      const entities = await EntityModel.find({});

      res.render("field-template/field-template-list", {
        account_number: req.account_number,
        layout: "layout-app",
        fields: templates,
        entities: entities
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Erreur serveur");
    }
  },

  editForm: async (req, res) => {
    const FieldTemplateModel = await tenantCollection(req, "FieldTemplate");
    FieldTemplateModel.findById(req.params.id, (err, template) => {
      if (err || !template) {
        return res.status(404).render("errors/404", {
          message: "Modèle introuvable.",
          account_number: req.account_number,
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
    const id = req.params.id;

    try {
      const { name, label, description, type, subtype, htmlTemplate, jsTemplate } = req.body;

      const type_config = {};
      if (req.body["type_config.regex"]) {
        type_config.regex = req.body["type_config.regex"];
      }
      if (req.body["type_config.refEntity"]) {
        type_config.refEntity = req.body["type_config.refEntity"];
      }
      if (req.body["type_config.multiple"]) {
        type_config.multiple = req.body["type_config.multiple"] === 'on' || req.body["type_config.multiple"] === true || req.body["type_config.multiple"] === 'true';
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

      const fieldTemplateData = {
        name,
        label,
        description,
        type,
        subtype,
        htmlTemplate,
        jsTemplate,
        type_config,
        ui,
      };

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
      try {
        const FieldTemplateModel = await tenantCollection(req, "FieldTemplate");
        const EntityModel = await tenantCollection(req, "Entity");
        const templates = await FieldTemplateModel.find({});
        const entities = await EntityModel.find({});

        res.status(500).render("field-template/field-template-list", {
          errors: [{ msg: "Une erreur est survenue lors de la mise à jour : " + err.message }],
          account_number: req.account_number,
          layout: "layout-app",
          fields: templates,
          entities: entities
        });
      } catch (e) {
        res.status(500).send("Erreur fatale lors de la redirection après erreur d'update");
      }
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
          account_number: req.account_number,
          layout: "layout-app",
        });
      }
      res.render("field-template/field-template-single", {
        fieldTemplate: template,
        account_number: req.account_number,
        layout: "layout-app",
      });
    });
  },

  singlePage_Api: async (req, res) => {
    const FieldTemplateModel = await tenantCollection(req, "FieldTemplate");
    const field = await FieldTemplateModel.findById(req.params.id);
    res.json(field);
  },

  // System fields grouped by category for picker
  systemFields_Api: async (req, res) => {
    const FieldTemplateModel = await tenantCollection(req, "FieldTemplate");
    try {
      const fields = await FieldTemplateModel.find({ isSystem: true }).sort({ category: 1, label: 1 });

      // Group by category
      const categoryLabels = {
        popular: 'Populaires',
        text: 'Texte',
        numeric: 'Numérique',
        date: 'Date / Temps',
        choice: 'Choix',
        relation: 'Relation',
        media: 'Média',
        computed: 'Calcul',
        advanced: 'Avancé'
      };

      const grouped = {};
      for (const field of fields) {
        const cat = field.category || 'other';
        if (!grouped[cat]) {
          grouped[cat] = {
            key: cat,
            label: categoryLabels[cat] || cat,
            fields: []
          };
        }
        grouped[cat].fields.push({
          _id: field._id,
          name: field.name,
          label: field.label,
          description: field.description,
          type: field.type,
          subtype: field.subtype,
          icon: field.ui?.icon || 'solar:widget-bold-duotone',
          category: field.category
        });
      }

      // Order categories
      const order = ['popular', 'text', 'numeric', 'date', 'choice', 'relation', 'media', 'computed', 'advanced'];
      const result = order.filter(k => grouped[k]).map(k => grouped[k]);

      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
