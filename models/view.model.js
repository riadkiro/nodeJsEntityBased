const mongoose = require('mongoose');

const ViewSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true },

    // The base entity this view is based on
    entity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entity',
        required: true
    },

    icon: String,
    color: String,
    order: { type: Number, default: 0 },

    // Type of display
    viewType: {
        type: String,
        enum: ['list', 'kanban', 'checklist', 'calendar', 'table'],
        default: 'list'
    },

    // Hierarchy position
    spaces: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Space'
    }],
    folders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder'
    }],

    // Filter configuration
    // Example: [{ field: 'status', operator: 'equals', value: 'Active' }]
    filters: [{
        field: { type: String }, // Can be standard field or custom field ID
        operator: { type: String, enum: ['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'in'] },
        value: { type: mongoose.Schema.Types.Mixed }
    }],

    // Visual settings (columns for kanban, hidden fields, etc.)
    settings: {
        kanbanField: { type: String }, // For kanban, which field defines columns
        hiddenFields: [String],
        sortBy: {
            field: String,
            direction: { type: String, enum: ['asc', 'desc'], default: 'asc' }
        }
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('View', ViewSchema);
