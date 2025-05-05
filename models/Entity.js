const mongoose = require('mongoose');

const EntitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  },
  image: String,
  icon: String,
  color: String,
  // Pour une version future avec activation directe des champs
  enabledStandardFields: [String], // ex: ['title', 'slug', 'date']
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Entity', EntitySchema);
