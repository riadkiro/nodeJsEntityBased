const mongoose = require('mongoose');

const FieldBlockSchema = new mongoose.Schema({
  // 🧾 Infos générales
  name: { type: String, required: true, unique: true }, // ex: "adresse"
  label: { type: String, required: true },              // ex: "Adresse complète"
  description: { type: String },

  // 🎨 Apparence visuelle
  icon: { type: String },   // ex: "mdi:map-marker"
  color: { type: String },  // ex: "#3498db"

  // 🔗 Champs liés au bloc (avec UI layout local)
  fields: [{
    field_id: { type: mongoose.Schema.Types.ObjectId, ref: 'FieldTemplate' },
    width: { type: String, enum: ['full', 'half', 'third'], default: 'full' },
    order: { type: Number, default: 0 }
  }],

  // Optionnel : partage ou entités concernées
  entities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Entity' }],
  isGlobal: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('FieldBlock', FieldBlockSchema);
