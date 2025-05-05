const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema({
  entities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entity',
    required: true
  }],

  name: { type: String, required: true },
  label: String,
  icon: String,
  image: String,
  color: String,

  type: {
    type: String,
    enum: [
      'string', 'text', 'number', 'boolean', 'date',
      'enum', 'relation', 'multi-relation',
      'image', 'file', 'array:image'
    ],
    required: true
  },

  values: [String],
  refEntityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entity' },

  placeholder: String,
  required: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  visible: { type: Boolean, default: true },
  order: { type: Number, default: 0 },

  isCustom: { type: Boolean, default: true },

  // ✅ Champ de validation ajouté
  validation: {
    type: Object,
    default: {}
    /*
      Exemple de contenu possible :
      {
        regex: "^\\+\\d{9,}$",
        minLength: 3,
        maxLength: 255,
        min: 0,
        max: 100000
      }
    */
  }
}, { timestamps: true });

module.exports = mongoose.model('Field', FieldSchema);
