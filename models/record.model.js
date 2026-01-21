const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema({
  // 🔗 Liens principaux
  entityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entity', required: true },
  spaces: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Space' }],
  folders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Folder' }],

  // 📄 Champs standards activables
  title: String,
  slug: String,
  content: String,
  description: String,
  image: String,
  icon: String,
  color: String,
  link: String,
  attachement: String,
  gallery: [String],
  medias: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  }],
  date: Date,
  end_date: Date,
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  published: { type: Boolean, default: false },
  order: { type: Number, default: 0 },

  // 🏷️ Tags & catégories (optionnelles, relation vers d'autres records)
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Record' }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Record' },

  // 🧩 Champs dynamiques (valeurs référencées à des FieldTemplate)
  customFields: [{
    field_id: { type: mongoose.Schema.Types.ObjectId, ref: 'FieldTemplate' },
    value: mongoose.Schema.Types.Mixed
  }],

  // 👤 Suivi
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Record', RecordSchema);
