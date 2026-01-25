const mongoose = require('mongoose');

const SpaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  icon: String,
  color: String,
  order: { type: Number, default: 0 },

  // Propriétaire de l’espace
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Membres + rôles
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'editor', 'viewer'],
      default: 'viewer'
    }
  }],

  // Config de l’espace
  settings: {
    theme: String,
    locale: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Space', SpaceSchema);
