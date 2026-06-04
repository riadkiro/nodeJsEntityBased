const mongoose = require('mongoose');

const FolderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  type: { type: String, default: 'folder' }, // 'folder' | legacy 'environment' | 'workstation'
  description: String,

  // Parent sections (legacy field name: spaces)
  spaces: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Space'
  }],

  // Direct parent rail Space (legacy model name: Environment)
  environmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Environment',
    default: null
  },

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
