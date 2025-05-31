const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Nom visible
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  type: {
    type: String,
    enum: ['image', 'video', 'audio', 'pdf', 'doc', 'other'],
    required: true
  },
  mimeType: { type: String }, // Exemple: "image/png", "application/pdf"
  size: { type: Number }, // en octets
  url: { type: String, required: true }, // Lien de téléchargement ou CDN
  thumbnail: { type: String }, // Prévisualisation si image ou vidéo
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true }, // Multi-tenant
  tags: [String],
  folder: { type: String }, // Optionnel : chemin virtuel ou organisation
  alt: { type: String },
  description: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed }, // Large info libre (dimensions, durée, etc.)

}, { timestamps: true });

module.exports = mongoose.model('Media', MediaSchema);
