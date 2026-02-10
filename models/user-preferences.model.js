const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    viewId: {
        type: String,
        required: true
    },
    preferences: {
        columns: [{
            id: String,
            visible: Boolean,
            order: Number
        }],
        sort: {
            field: {
                type: String,
                default: 'createdAt'
            },
            direction: {
                type: String,
                enum: ['asc', 'desc'],
                default: 'desc'
            }
        },
        density: {
            type: String,
            enum: ['compact', 'normal', 'comfortable'],
            default: 'normal'
        },
        pageSize: {
            type: Number,
            default: 10
        },
        titleDisplay: {
            type: String,
            enum: ['avatar', 'icon', 'none'],
            default: 'avatar'
        }
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index for fast lookups
userPreferencesSchema.index({ userId: 1, viewId: 1 }, { unique: true });

module.exports = mongoose.model('UserPreferences', userPreferencesSchema, 'user_preferences');
