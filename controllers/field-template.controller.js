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
      // Recurrence: structured options, slots, allowCustomText
      if (req.body["type_config.options"]) {
        try { type_config.options = typeof req.body["type_config.options"] === 'string' ? JSON.parse(req.body["type_config.options"]) : req.body["type_config.options"]; } catch (e) { }
      }
      if (req.body["type_config.slots"]) {
        try { type_config.slots = typeof req.body["type_config.slots"] === 'string' ? JSON.parse(req.body["type_config.slots"]) : req.body["type_config.slots"]; } catch (e) { }
      }
      if (req.body["type_config.allowCustomText"] !== undefined) {
        type_config.allowCustomText = req.body["type_config.allowCustomText"] === 'on' || req.body["type_config.allowCustomText"] === true || req.body["type_config.allowCustomText"] === 'true';
      }
      // Date: includeTime + defaultValue
      if (req.body["type_config.includeTime"] !== undefined) {
        type_config.includeTime = req.body["type_config.includeTime"] === 'on' || req.body["type_config.includeTime"] === true || req.body["type_config.includeTime"] === 'true';
      }
      if (req.body["type_config.defaultValue"]) {
        type_config.defaultValue = req.body["type_config.defaultValue"];
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
      if (req.body["ui.rows"]) {
        ui.rows = parseInt(req.body["ui.rows"], 10) || 1;
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
    // Editing is handled inline on the list page
    res.redirect(`/account/${req.account_number}/field-template/list`);
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
      // Recurrence: structured options, slots, allowCustomText
      if (req.body["type_config.options"]) {
        try { type_config.options = typeof req.body["type_config.options"] === 'string' ? JSON.parse(req.body["type_config.options"]) : req.body["type_config.options"]; } catch (e) { }
      }
      if (req.body["type_config.slots"]) {
        try { type_config.slots = typeof req.body["type_config.slots"] === 'string' ? JSON.parse(req.body["type_config.slots"]) : req.body["type_config.slots"]; } catch (e) { }
      }
      if (req.body["type_config.allowCustomText"] !== undefined) {
        type_config.allowCustomText = req.body["type_config.allowCustomText"] === 'on' || req.body["type_config.allowCustomText"] === true || req.body["type_config.allowCustomText"] === 'true';
      }
      // Date: includeTime + defaultValue
      if (req.body["type_config.includeTime"] !== undefined) {
        type_config.includeTime = req.body["type_config.includeTime"] === 'on' || req.body["type_config.includeTime"] === true || req.body["type_config.includeTime"] === 'true';
      }
      if (req.body["type_config.defaultValue"]) {
        type_config.defaultValue = req.body["type_config.defaultValue"];
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
      if (req.body["ui.rows"]) {
        ui.rows = parseInt(req.body["ui.rows"], 10) || 1;
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

  addOption_Api: async (req, res) => {
    const FieldTemplateModel = await tenantCollection(req, "FieldTemplate");
    try {
      const { label, value, color } = req.body;
      const optionLabel = (label || value || '').trim();
      const optionValue = (value || label || '').trim();

      if (!optionLabel || !optionValue) {
        return res.status(400).json({ success: false, error: "Option invalide" });
      }

      const field = await FieldTemplateModel.findById(req.params.id);
      if (!field) {
        return res.status(404).json({ success: false, error: "Champ introuvable" });
      }

      const typeConfig = field.type_config || {};
      const options = Array.isArray(typeConfig.options) ? [...typeConfig.options] : [];
      const sameOption = (opt) => {
        const optValue = typeof opt === 'object' ? (opt.value || opt.label) : opt;
        const optLabel = typeof opt === 'object' ? (opt.label || opt.value) : opt;
        return [optValue, optLabel].some(v => (v || '').toString().trim().toLowerCase() === optionValue.toLowerCase());
      };

      const existing = options.find(sameOption);
      if (existing) {
        const normalizedExisting = typeof existing === 'object'
          ? { label: existing.label || existing.value, value: existing.value || existing.label, color: existing.color }
          : { label: existing, value: existing };
        return res.json({ success: true, option: normalizedExisting, options, alreadyExists: true });
      }

      const option = { label: optionLabel, value: optionValue };
      if (color) option.color = color;
      options.push(option);

      field.type_config = { ...typeConfig, options };
      field.markModified('type_config');
      await field.save();

      res.json({ success: true, option, options });
    } catch (err) {
      console.error("addOption_Api error:", err);
      res.status(500).json({ success: false, error: err.message });
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
      // Récupérer tous les champs (système + personnalisés)
      const fields = await FieldTemplateModel.find({}).sort({ category: 1, label: 1 });

      // Group by category
      const categoryLabels = {
        popular: 'Populaires',
        pro: 'Entreprise / Professionnel',
        dates: 'Dates / Événements',
        finance: 'Financier / Commerce',
        workflow: 'Gestion / Workflow',
        content: 'Contenu / Description',
        media: 'Média',
        other: 'Divers',
        text: 'Texte',
        numeric: 'Numérique',
        date: 'Date / Temps',
        choice: 'Choix',
        relation: 'Relation',
        computed: 'Calcul',
        advanced: 'Avancé',
        custom: 'Personnalisés'
      };

      const grouped = {};
      for (const field of fields) {
        // Si le champ n'est pas système et n'a pas de catégorie connue, le mettre dans 'custom'
        let cat = field.category || 'other';
        const knownCategories = ['popular', 'pro', 'dates', 'finance', 'workflow', 'content', 'media', 'other', 'text', 'numeric', 'date', 'choice', 'relation', 'computed', 'advanced'];
        if (!field.isSystem && !knownCategories.includes(cat)) {
          cat = 'custom';
        }

        if (!grouped[cat]) {
          grouped[cat] = {
            key: cat,
            label: categoryLabels[cat] || cat,
            fields: []
          };
        }
        const fieldObj = {
          _id: field._id,
          name: field.name,
          label: field.label,
          description: field.description,
          type: field.type,
          subtype: field.subtype,
          icon: field.ui?.icon || 'solar:widget-bold-duotone',
          category: field.category,
          isSystem: field.isSystem || false
        };
        // Include computed field metadata
        if (field.category === 'computed') {
          fieldObj.formula = field.formula || null;
          fieldObj.render = field.render || null;
          fieldObj.color = field.color || '#4361ee';
        }
        grouped[cat].fields.push(fieldObj);
      }

      // Order categories - popular first, then business categories, then technical
      const order = ['popular', 'pro', 'dates', 'finance', 'workflow', 'content', 'media', 'other', 'custom', 'text', 'numeric', 'date', 'choice', 'relation', 'computed', 'advanced'];
      const result = order.filter(k => grouped[k]).map(k => grouped[k]);

      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Factory Reset - Supprime tous les champs et remet les champs par défaut
   */
  factoryReset: async (req, res) => {
    try {
      const FieldTemplate = await tenantCollection(req, "FieldTemplate");

      // Supprimer tous les champs existants
      await FieldTemplate.deleteMany({});

      // Champs métier prêts à l'emploi (pas des types génériques !)
      const defaultFields = [
        // ═══════════════════════════════════════════════════════════════
        // IDENTITÉ / CONTACT
        // ═══════════════════════════════════════════════════════════════
        { name: 'nom', label: 'Nom', type: 'string', icon: 'solar:user-bold-duotone', width: 'half', category: 'popular', isSystem: true, placeholder: 'Dupont' },
        { name: 'prenom', label: 'Prénom', type: 'string', icon: 'solar:user-bold-duotone', width: 'half', category: 'popular', isSystem: true, placeholder: 'Jean' },
        { name: 'email', label: 'Email', type: 'string', subType: 'email', icon: 'solar:letter-bold-duotone', width: 'half', category: 'popular', isSystem: true, placeholder: 'jean@exemple.com' },
        { name: 'telephone', label: 'Téléphone', type: 'string', subType: 'tel', icon: 'solar:phone-bold-duotone', width: 'half', category: 'popular', isSystem: true, placeholder: '+33 6 12 34 56 78' },
        { name: 'adresse', label: 'Adresse', type: 'text', icon: 'solar:map-point-bold-duotone', width: 'full', category: 'popular', isSystem: true, placeholder: '123 Rue de la Paix, 75001 Paris' },
        { name: 'ville', label: 'Ville', type: 'string', icon: 'solar:city-bold-duotone', width: 'half', category: 'popular', isSystem: true, placeholder: 'Paris' },
        { name: 'code_postal', label: 'Code postal', type: 'string', icon: 'solar:mailbox-bold-duotone', width: 'half', category: 'popular', isSystem: true, placeholder: '75001' },
        { name: 'pays', label: 'Pays', type: 'string', icon: 'solar:global-bold-duotone', width: 'half', category: 'popular', isSystem: true, placeholder: 'France' },

        // ═══════════════════════════════════════════════════════════════
        // ENTREPRISE / PROFESSIONNEL
        // ═══════════════════════════════════════════════════════════════
        { name: 'entreprise', label: 'Entreprise', type: 'string', icon: 'solar:buildings-bold-duotone', width: 'half', category: 'pro', isSystem: true, placeholder: 'Acme Inc.' },
        { name: 'poste', label: 'Poste / Fonction', type: 'string', icon: 'solar:case-bold-duotone', width: 'half', category: 'pro', isSystem: true, placeholder: 'Directeur Commercial' },
        { name: 'site_web', label: 'Site web', type: 'string', subType: 'url', icon: 'solar:global-bold-duotone', width: 'half', category: 'pro', isSystem: true, placeholder: 'https://www.exemple.com' },
        { name: 'linkedin', label: 'LinkedIn', type: 'string', subType: 'url', icon: 'mdi:linkedin', width: 'half', category: 'pro', isSystem: true, placeholder: 'https://linkedin.com/in/...' },
        { name: 'siret', label: 'SIRET', type: 'string', icon: 'solar:document-bold-duotone', width: 'half', category: 'pro', isSystem: true, placeholder: '123 456 789 00012' },
        { name: 'tva', label: 'N° TVA', type: 'string', icon: 'solar:document-bold-duotone', width: 'half', category: 'pro', isSystem: true, placeholder: 'FR12345678901' },

        // ═══════════════════════════════════════════════════════════════
        // DATES / ÉVÉNEMENTS
        // ═══════════════════════════════════════════════════════════════
        { name: 'date_naissance', label: 'Date de naissance', type: 'date', icon: 'solar:calendar-bold-duotone', width: 'half', category: 'dates', isSystem: true },
        { name: 'date_debut', label: 'Date de début', type: 'date', icon: 'solar:calendar-bold-duotone', width: 'half', category: 'dates', isSystem: true },
        { name: 'date_fin', label: 'Date de fin', type: 'date', icon: 'solar:calendar-bold-duotone', width: 'half', category: 'dates', isSystem: true },
        { name: 'echeance', label: 'Échéance', type: 'date', icon: 'solar:alarm-bold-duotone', width: 'half', category: 'dates', isSystem: true },
        { name: 'rappel', label: 'Date de rappel', type: 'date', subType: 'datetime', icon: 'solar:bell-bold-duotone', width: 'half', category: 'dates', isSystem: true },

        // ═══════════════════════════════════════════════════════════════
        // FINANCIER / COMMERCE
        // ═══════════════════════════════════════════════════════════════
        { name: 'montant', label: 'Montant', type: 'number', subType: 'currency', icon: 'solar:dollar-bold-duotone', width: 'half', category: 'finance', isSystem: true, placeholder: '1 500,00 €' },
        { name: 'prix_unitaire', label: 'Prix unitaire', type: 'number', subType: 'currency', icon: 'solar:tag-price-bold-duotone', width: 'half', category: 'finance', isSystem: true },
        { name: 'quantite', label: 'Quantité', type: 'number', icon: 'solar:box-bold-duotone', width: 'half', category: 'finance', isSystem: true, placeholder: '10' },
        { name: 'remise', label: 'Remise (%)', type: 'number', subType: 'percent', icon: 'solar:tag-bold-duotone', width: 'half', category: 'finance', isSystem: true },
        { name: 'total_ht', label: 'Total HT', type: 'number', subType: 'currency', icon: 'solar:calculator-bold-duotone', width: 'half', category: 'finance', isSystem: true },
        { name: 'total_ttc', label: 'Total TTC', type: 'number', subType: 'currency', icon: 'solar:calculator-bold-duotone', width: 'half', category: 'finance', isSystem: true },

        // ═══════════════════════════════════════════════════════════════
        // GESTION / WORKFLOW
        // ═══════════════════════════════════════════════════════════════
        {
          name: 'statut', label: 'Statut', type: 'select', icon: 'solar:verified-check-bold-duotone', width: 'half', category: 'workflow', isSystem: true, options: [
            { label: 'Brouillon', value: 'draft', color: '#94a3b8' },
            { label: 'En cours', value: 'in_progress', color: '#3b82f6' },
            { label: 'En attente', value: 'pending', color: '#f59e0b' },
            { label: 'Terminé', value: 'done', color: '#22c55e' },
            { label: 'Annulé', value: 'cancelled', color: '#ef4444' }
          ]
        },
        {
          name: 'priorite', label: 'Priorité', type: 'select', icon: 'solar:flag-bold-duotone', width: 'half', category: 'workflow', isSystem: true, options: [
            { label: 'Basse', value: 'low', color: '#94a3b8' },
            { label: 'Normale', value: 'normal', color: '#3b82f6' },
            { label: 'Haute', value: 'high', color: '#f59e0b' },
            { label: 'Urgente', value: 'urgent', color: '#ef4444' }
          ]
        },
        { name: 'assignee', label: 'Assigné à', type: 'relation', subType: 'user', icon: 'solar:user-check-bold-duotone', width: 'half', category: 'workflow', isSystem: true },
        { name: 'tags', label: 'Tags', type: 'select', subType: 'multi', icon: 'solar:tag-bold-duotone', width: 'full', category: 'workflow', isSystem: true, multiple: true },

        // ═══════════════════════════════════════════════════════════════
        // CONTENU / DESCRIPTION
        // ═══════════════════════════════════════════════════════════════
        { name: 'description', label: 'Description', type: 'text', icon: 'solar:document-text-bold-duotone', width: 'full', category: 'content', isSystem: true, placeholder: 'Description détaillée...' },
        { name: 'notes', label: 'Notes', type: 'text', icon: 'solar:notes-bold-duotone', width: 'full', category: 'content', isSystem: true, placeholder: 'Notes internes...' },
        { name: 'commentaire', label: 'Commentaire', type: 'text', icon: 'solar:chat-round-dots-bold-duotone', width: 'full', category: 'content', isSystem: true },

        // ═══════════════════════════════════════════════════════════════
        // MÉDIAS / FICHIERS
        // ═══════════════════════════════════════════════════════════════
        { name: 'photo', label: 'Photo', type: 'image', icon: 'solar:camera-bold-duotone', width: 'half', category: 'media', isSystem: true },
        { name: 'avatar', label: 'Avatar', type: 'image', icon: 'solar:user-circle-bold-duotone', width: 'half', category: 'media', isSystem: true },
        { name: 'logo', label: 'Logo', type: 'image', icon: 'solar:gallery-bold-duotone', width: 'half', category: 'media', isSystem: true },
        { name: 'document', label: 'Document', type: 'file', icon: 'solar:file-bold-duotone', width: 'full', category: 'media', isSystem: true },
        { name: 'signature', label: 'Signature', type: 'image', subType: 'signature', icon: 'solar:pen-bold-duotone', width: 'half', category: 'media', isSystem: true },

        // ═══════════════════════════════════════════════════════════════
        // DIVERS
        // ═══════════════════════════════════════════════════════════════
        { name: 'reference', label: 'Référence', type: 'string', icon: 'solar:hashtag-bold-duotone', width: 'half', category: 'other', isSystem: true, placeholder: 'REF-001' },
        { name: 'code', label: 'Code', type: 'string', icon: 'solar:qr-code-bold-duotone', width: 'half', category: 'other', isSystem: true },
        { name: 'actif', label: 'Actif', type: 'boolean', icon: 'solar:check-circle-bold-duotone', width: 'half', category: 'other', isSystem: true },
        { name: 'note_evaluation', label: 'Note / Évaluation', type: 'number', subType: 'rating', icon: 'solar:star-bold-duotone', width: 'half', category: 'other', isSystem: true }
      ];

      // Insérer les champs par défaut
      await FieldTemplate.insertMany(defaultFields);

      console.log(`✅ Factory reset: ${defaultFields.length} champs système restaurés`);

      res.json({ success: true, message: `${defaultFields.length} champs restaurés` });
    } catch (err) {
      console.error('❌ Factory reset error:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // JSON API: Create field template from entity template system
  createApi: async (req, res) => {
    try {
      const FieldTemplateModel = await tenantCollection(req, "FieldTemplate");
      const { name, label, type, subtype, description, icon, category, required, typeConfig, ui, formula, render, color } = req.body;

      if (!name || !label) return res.status(400).json({ error: 'name and label are required' });

      const fieldData = {
        name,
        label,
        description: description || '',
        type: type || 'string',
        subtype: subtype || undefined,
        required: required || false,
        isCustom: true,
        isSystem: false,
        category: category || 'custom',
        type_config: typeConfig || {},
        ui: {
          placeholder: ui?.placeholder || '',
          width: ui?.width || 'full',
          icon: icon || ui?.icon || 'solar:widget-bold-duotone',
          order: ui?.order || 0
        }
      };
      // Computed field properties
      if (category === 'computed' && formula) {
        fieldData.formula = formula;
        if (render) fieldData.render = render;
        if (color) fieldData.color = color;
      }
      const newField = new FieldTemplateModel(fieldData);

      await newField.save();
      const responseField = {
        _id: newField._id,
        name: newField.name,
        label: newField.label,
        type: newField.type,
        subtype: newField.subtype,
        icon: newField.ui?.icon || 'solar:widget-bold-duotone',
        category: newField.category,
        isSystem: false
      };
      if (newField.category === 'computed') {
        responseField.formula = newField.formula;
        responseField.render = newField.render;
        responseField.color = newField.color;
      }
      res.json({ success: true, field: responseField });
    } catch (err) {
      console.error('[FieldTemplateAPI] Create error:', err);
      res.status(500).json({ error: err.message });
    }
  },
};
