const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema({
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entity',
    required: true
  },

  // Un record peut être partagé entre plusieurs espaces
  spaces: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Space'
  }],

  // Un record peut appartenir à plusieurs dossiers (ex: favoris, organisation par type)
  folders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder'
  }],

  // Champs standards
  title: String,
  slug: String,
  content: String,
  description: String,
  image: String,
  icon: String,
  color: String,
  gallery: [String],
  attachment: String,
  date: Date,
  end_date: Date,
  status: {
    type: String,
    enum: ['draft', 'published', 'archived']
  },
  published: Boolean,
  order: Number,
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Record' }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Record' },

  // Champs dynamiques
  custom: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Record', RecordSchema);
