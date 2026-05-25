const mongoose = require('mongoose');

const RECORD_MODULE_KEYS = ['overview', 'fiche', 'docs', 'drive', 'dataRoom', 'tasks', 'agenda', 'chat', 'emails', 'notes', 'team'];

function defaultModulePermissions() {
    return Object.fromEntries(RECORD_MODULE_KEYS.map(key => [
        key,
        { view: key !== 'team', edit: false },
    ]));
}

/**
 * RecordAccess — Per-record permission overrides
 * ────────────────────────────────────────────────
 * Allows granting specific users, teams, or roles
 * access to individual records beyond their default permissions.
 * 
 * Use cases:
 *   - Share a patient record with an external lab
 *   - Give temporary read access to a client
 *   - Create a public link for a document
 */
const RecordAccessSchema = new mongoose.Schema({
    recordId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    entityId: { type: String, required: true, index: true },

    // Access grants
    grants: [{
        granteeType: { type: String, enum: ['user', 'team', 'role'], required: true },
        granteeId: { type: String, required: true }, // userId, teamId, or role name
        permissions: {
            read:   { type: Boolean, default: true },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false },
            share:  { type: Boolean, default: false },
            modules: {
                type: mongoose.Schema.Types.Mixed,
                default: defaultModulePermissions,
            },
        },
        grantedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        grantedAt: { type: Date, default: Date.now },
        expiresAt: { type: Date }, // null = permanent
        note: { type: String },    // "Accès temporaire pour le labo"
    }],

    // Pending email invitations (user not yet in the system)
    pendingInvites: [{
        email: { type: String, required: true },
        permissions: {
            read:   { type: Boolean, default: true },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false },
            share:  { type: Boolean, default: false },
            modules: {
                type: mongoose.Schema.Types.Mixed,
                default: defaultModulePermissions,
            },
        },
        invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        invitedAt: { type: Date, default: Date.now },
    }],

    // Public sharing
    isPublic: { type: Boolean, default: false },
    publicLink: { type: String, unique: true, sparse: true },
    publicPermissions: {
        read:   { type: Boolean, default: true },
        update: { type: Boolean, default: false },
    },
    publicExpiresAt: { type: Date },

}, { timestamps: true });

// Compound index for fast lookups
RecordAccessSchema.index({ recordId: 1, 'grants.granteeId': 1 });
RecordAccessSchema.index({ publicLink: 1 }, { sparse: true });

// Clean expired grants on read
RecordAccessSchema.methods.cleanExpired = function () {
    const now = new Date();
    this.grants = this.grants.filter(g => !g.expiresAt || g.expiresAt > now);
    if (this.publicExpiresAt && this.publicExpiresAt < now) {
        this.isPublic = false;
        this.publicLink = null;
    }
};

// Check if a specific user has access
RecordAccessSchema.methods.hasAccess = function (userId, teamIds, action) {
    const now = new Date();

    for (const grant of this.grants) {
        // Skip expired
        if (grant.expiresAt && grant.expiresAt < now) continue;

        // Check user grant
        if (grant.granteeType === 'user' && grant.granteeId === String(userId)) {
            if (grant.permissions[action]) return true;
        }

        // Check team grant
        if (grant.granteeType === 'team' && teamIds && teamIds.includes(grant.granteeId)) {
            if (grant.permissions[action]) return true;
        }
    }

    return false;
};

const RecordAccess = mongoose.model('RecordAccess', RecordAccessSchema);
module.exports = RecordAccess;
