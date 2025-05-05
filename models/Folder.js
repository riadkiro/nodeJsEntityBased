const mongoose = require('mongoose');

const FolderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  description: String,

  // Multi-space
  spaces: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Space'
  }],

  // Multi-parent
  parentFolders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder'
  }],

  // Drapeau partagé
  isShared: { type: Boolean, default: false },

  icon: String,
  color: String,
  order: Number,

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Folder', FolderSchema);
