const mongoose = require('mongoose');

const FieldTemplateSchema = new mongoose.Schema({
  // 🧾 Identification
  name: { type: String, required: true }, // clé technique
  label: { type: String, required: true }, // affichage humain
  description: { type: String },

  // 🎨 Type
  type: {
    type: String,
  },
  subtype: { type: String }, // email, tel, url (si string)

  // ⚙️ Config spécifique
  type_config: {
    type: Object,
    default: {}
    /*
      - select: { options: ['A', 'B'] }
      - number: { min: 0, max: 100 }
      - string: { regex: "..." }
      - relation: { refEntity: ObjectId }
    */
  },

  // ✅ Validation
  required: { type: Boolean, default: false },
  unique: { type: Boolean, default: false },
  defaultValue: mongoose.Schema.Types.Mixed,

  // 🧠 Formule (calcul)
  formula: {
    expression: { type: String }, // ex: "%prix_ht% * 0.21"
    fromFunction: { type: String }, // ex: "tva_21"
    sourceFields: { type: Object }, // ex: { prix_ht: "prix_ht" }
    dependsOn: [String]
  },

  // 👁️ Conditions d'affichage
  visibilityConditions: [{
    field: { type: String },
    operator: { type: String },
    value: mongoose.Schema.Types.Mixed
  }],

  // 🎛️ UI / Design
  ui: {
    placeholder: { type: String },
    readonly: { type: Boolean, default: false },
    visible: { type: Boolean, default: true },
    searchable: { type: Boolean, default: false },
    autocomplete: { type: Boolean, default: false },
    dataSource: {
      type: String, // "api", "static", "records", "entity" etc.
      source: String, // URL, entityId, liste d'options...
      labelField: String, // pour afficher la bonne valeur
      valueField: String  // valeur à stocker
    },
    width: { type: String, enum: ['full', 'half', 'third'], default: 'full' },
    order: { type: Number, default: 0 },
    icon: { type: String },    // ex: "tabler:coin"
    couleur: { type: String }, // ex: "#00FFAA" ou class tailwind
    image: { type: String }    // URL d’icône ou d’image
  },

  // 🔍 Filtres
  filterable: { type: Boolean, default: true },
  filter_operators: {
    type: [String],
    default: function () {
      switch (this.type) {
        case 'number': return ['equals', 'lt', 'lte', 'gt', 'gte', 'between'];
        case 'string': return ['equals', 'contains', 'startsWith'];
        case 'boolean': return ['equals'];
        case 'date': return ['equals', 'before', 'after', 'between'];
        case 'select': return ['equals', 'in'];
        default: return ['equals'];
      }
    }
  },
  htmlTemplate: { type: String }, // pour affichage personnalisé
  jsTemplate: { type: String }, // pour script personnalisé

  // 🔗 Lien logique
  entities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Entity' }],
  isCustom: { type: Boolean, default: true }

}, { timestamps: true });

module.exports = mongoose.model('FieldTemplate', FieldTemplateSchema);
