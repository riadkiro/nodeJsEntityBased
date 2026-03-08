const mongoose = require('mongoose');

const accountPreferencesSchema = new mongoose.Schema({
    accountId: {
        type: String,
        required: true
    },
    viewId: {
        type: String,
        required: true
    },
    preferences: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index for fast lookups (one config per account per view)
accountPreferencesSchema.index({ accountId: 1, viewId: 1 }, { unique: true });

module.exports = mongoose.model('AccountPreferences', accountPreferencesSchema, 'account_preferences');
