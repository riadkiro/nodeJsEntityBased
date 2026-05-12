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
    role: { type: String, default: 'member' },
    entityAccess: [{ type: String }],  // Legacy: Entity IDs (kept for backward compat)
    entityPermissions: [{
      entityId: { type: String },
      create: { type: Boolean, default: true },
      read:   { type: Boolean, default: true },
      update: { type: Boolean, default: true },
      delete: { type: Boolean, default: true },
    }],  // Granular CRUD per entity. Empty = full access to all entities
    // Per-member module access overrides (null = inherit from role defaults)
    moduleAccess: {
      chat:        { type: Boolean, default: null },
      tasks:       { type: Boolean, default: null },
      documents:   { type: Boolean, default: null },
      agenda:      { type: Boolean, default: null },
      drive:       { type: Boolean, default: null },
      email:       { type: Boolean, default: null },
      notes:       { type: Boolean, default: null },
      automations: { type: Boolean, default: null },
    },
    joinedAt: { type: Date, default: Date.now },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['active', 'pending', 'suspended', 'removed'], default: 'active' },
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
    role: { type: String, default: 'member' },
    token: { type: String },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    invitedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    status: { type: String, enum: ['pending', 'accepted', 'expired'], default: 'pending' },
  }],

  // Teams (groups of members)
  teams: [{
    name: { type: String, required: true },
    description: { type: String, default: '' },
    color: { type: String, default: '#4361ee' },
    icon: { type: String, default: 'solar:users-group-rounded-bold-duotone' },
    memberIds: [{ type: String }],
    leaderId: { type: String },
    // Legacy: team-wide entity permissions (kept for backward compat)
    entityPermissions: [{
      entityId: { type: String },
      create: { type: Boolean, default: true },
      read:   { type: Boolean, default: true },
      update: { type: Boolean, default: true },
      delete: { type: Boolean, default: true },
    }],
    // New: structured data access (used by resolveDataAccess)
    // Empty entities array = unrestricted access to all entities
    dataAccess: {
      entities: [{
        entityId: { type: String },
        create: { type: Boolean, default: true },
        read:   { type: Boolean, default: true },
        update: { type: Boolean, default: true },
        delete: { type: Boolean, default: true },
      }],
    },
    createdBy: { type: String },
    createdAt: { type: Date, default: Date.now },
  }],

  // Custom role permission overrides (per-workspace)
  // System roles: only stores diffs from the default PERMISSIONS matrix
  // Custom roles (isCustom=true): stores ALL permissions, baseRole for hierarchy
  customRoles: [{
    slug: { type: String, required: true },         // 'manager' or 'ops-lead' (custom)
    name: { type: String },                         // Display name
    description: { type: String, default: '' },
    color: { type: String },
    icon: { type: String },
    isCustom: { type: Boolean, default: false },     // true = user-created role
    baseRole: { type: String, default: 'member' },   // For custom roles: inherit defaults from this role
    level: { type: Number },                          // For custom roles: position in hierarchy
    // Permission overrides: { 'records.delete': false, 'chat.send': true, ... }
    // Using Mixed because keys contain dots (e.g. 'settings.view') which break Mongoose Map
    permissions: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  }],

  // Workspace settings
  settings: {
    defaultRole: { type: String, enum: ['member', 'external', 'guest'], default: 'member' },
    allowSelfSignup: { type: Boolean, default: false },
    requireApproval: { type: Boolean, default: false },
    modulesEnabled: {
      chat: { type: Boolean, default: true },
      tasks: { type: Boolean, default: true },
      documents: { type: Boolean, default: true },
      agenda: { type: Boolean, default: true },
      drive: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      notes: { type: Boolean, default: true },
    },
  },

  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }],

  created_on: {
    type: Date,
    default: Date.now,
  },
});

const Account = mongoose.model("Account", AccountSchema);

module.exports = Account;
