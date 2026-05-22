const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String },
  name: { type: String },
  avatar: { type: String },
  role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'active',
  },

  // Google OAuth
  googleId: { type: String, unique: true, sparse: true },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },

  // Membership / Subscription
  membership: {
    plan: { type: String, enum: ['free', 'basic', 'premium', 'enterprise'], default: 'free' },
    startDate: { type: Date },
    expiresAt: { type: Date },
    autoRenew: { type: Boolean, default: false },
    maxAccounts: { type: Number, default: 1 },
    maxUsersPerAccount: { type: Number, default: 3 },
    storageLimit: { type: Number, default: 500 }, // MB
    features: [{ type: String }],
  },

  // Accounts
  accounts: [
    {
      account_number: { type: String },
      name: { type: String },
      icon: { type: String },
      role: { type: String, enum: ['owner', 'admin', 'manager', 'member', 'viewer', 'guest'], default: 'owner' },
      joinedAt: { type: Date, default: Date.now },
    },
  ],

  preferences: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  sidebarPreferences: {
    expandedIds: { type: [String], default: [] }
  },

  // Email verification
  emailVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },

  lastLogin: { type: Date },
  loginCount: { type: Number, default: 0 },

  // Security — Personal PIN
  pinHash: { type: String, default: null },   // bcrypt hash of 4-digit PIN
  pinEnabled: { type: Boolean, default: false },
  pinAttempts: { type: Number, default: 0 },  // failed attempts counter
  pinLockedUntil: { type: Date, default: null }, // lockout expiry

  created_on: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before save
UserSchema.pre("save", function (next) {
  const user = this;

  if (!user.isModified("password") || !user.password) {
    return next();
  }

  bcrypt.genSalt(10, function (err, salt) {
    if (err) {
      return next(err);
    }

    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) {
        return next(err);
      }

      user.password = hash;
      next();
    });
  });
});

// Compare password method
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Compare PIN method
UserSchema.methods.comparePin = function (candidatePin) {
  if (!this.pinHash) return Promise.resolve(false);
  return bcrypt.compare(String(candidatePin), this.pinHash);
};

// Check if membership is active
UserSchema.methods.isMembershipActive = function () {
  if (this.membership?.plan === 'free') return true;
  if (!this.membership?.expiresAt) return false;
  return new Date() < new Date(this.membership.expiresAt);
};

// Get plan limits
UserSchema.statics.getPlanLimits = function (plan) {
  const limits = {
    free: { maxAccounts: 1, maxUsersPerAccount: 3, storageLimit: 500, features: ['basic_views'] },
    basic: { maxAccounts: 3, maxUsersPerAccount: 10, storageLimit: 5000, features: ['basic_views', 'kanban', 'calendar', 'export'] },
    premium: { maxAccounts: 10, maxUsersPerAccount: 50, storageLimit: 50000, features: ['basic_views', 'kanban', 'calendar', 'export', 'automation', 'integrations', 'sharing'] },
    enterprise: { maxAccounts: -1, maxUsersPerAccount: -1, storageLimit: -1, features: ['all'] },
  };
  return limits[plan] || limits.free;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
