const mongoose = require('mongoose');

const savedViewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entity',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    color: {
        type: String,
        default: '#4361ee'
    },
    icon: {
        type: String,
        default: null
    },
    // Classification-based filters { classificationId: [optionId, ...] }
    filters: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    // Field-based filters [{ fieldId, operator, value }]
    fieldFilters: [{
        fieldId: String,
        fieldName: String,
        fieldType: String,
        operator: {
            type: String,
            enum: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty', 'gt', 'lt', 'gte', 'lte', 'between', 'in'],
            default: 'contains'
        },
        value: mongoose.Schema.Types.Mixed,
        value2: mongoose.Schema.Types.Mixed,
        logic: { type: String, enum: ['AND', 'OR'], default: 'AND' }
    }],
    // Sort override for this view
    sort: {
        field: String,
        direction: {
            type: String,
            enum: ['asc', 'desc']
        }
    },
    // Display order
    order: {
        type: Number,
        default: 0
    },
    // Whether this is pinned (always visible in tabs)
    pinned: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Compound index for fast lookups
savedViewSchema.index({ userId: 1, entityId: 1, order: 1 });

module.exports = mongoose.model('SavedView', savedViewSchema, 'saved_views');
