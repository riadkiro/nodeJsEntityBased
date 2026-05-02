const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, default: 'solar:settings-bold-duotone' },
  logo: { type: String },
  description: { type: String },

  // Owner
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Members with roles
  users: [{
    userId: { type: String },
    email: { type: String },
    role: { type: String, enum: ['owner', 'admin', 'manager', 'member', 'viewer'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['active', 'pending', 'removed'], default: 'active' },
  }],

  account_number: { type: String, unique: true },

  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'trial'],
    default: 'active',
  },

  // Sharing & Collaboration
  sharing: {
    enabled: { type: Boolean, default: false },
    publicLink: { type: String },
    sharedSpaces: [{
      spaceId: { type: mongoose.Schema.Types.ObjectId },
      spaceName: { type: String },
      sharedWith: [{
        accountNumber: { type: String },
        accountName: { type: String },
        permission: { type: String, enum: ['view', 'edit', 'admin'], default: 'view' },
        sharedAt: { type: Date, default: Date.now },
      }]
    }],
  },

  // Invitations
  invitations: [{
    email: { type: String },
    role: { type: String, enum: ['admin', 'manager', 'member', 'viewer'], default: 'member' },
    token: { type: String },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    invitedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    status: { type: String, enum: ['pending', 'accepted', 'expired'], default: 'pending' },
  }],

  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }],

  created_on: {
    type: Date,
    default: Date.now,
  },
});

const Account = mongoose.model("Account", AccountSchema);

module.exports = Account;
