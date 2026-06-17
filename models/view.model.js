const mongoose = require('mongoose');

const ViewSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true },

    // The base entity this view is based on (optional for cockpits)
    entity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entity',
        default: null
    },

    // Reference to cockpit page config (for viewType 'cockpit')
    cockpitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PageConfig',
        default: null
    },

    // Direct sidebar shortcut to a record (personal "Hub" experience)
    hubRecord: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Record',
        default: null
    },

    icon: String,
    color: String,
    order: { type: Number, default: 0 },

    // Type of display
    viewType: {
        type: String,
        enum: ['list', 'kanban', 'checklist', 'calendar', 'table', 'cockpit', 'doc-listing', 'hub'],
        default: 'list'
    },

    // Hierarchy position
    spaces: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Space'
    }],
    environmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Environment',
        default: null
    },
    folders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder'
    }],

    // Filter configuration
    // Example: [{ field: 'status', operator: 'equals', value: 'Active' }]
    filters: [{
        field: { type: String }, // Standard field, custom field ID, classif:<id>, or rel:<key>
        fieldName: String,
        fieldType: String,
        operator: {
            type: String,
            enum: [
                'equals', 'not_equals', 'contains', 'not_contains',
                'starts_with', 'ends_with', 'gt', 'gte', 'lt', 'lte',
                'greater_than', 'less_than', 'between', 'in',
                'is_empty', 'is_not_empty', 'is_unique'
            ]
        },
        value: { type: mongoose.Schema.Types.Mixed },
        value2: { type: mongoose.Schema.Types.Mixed },
        logic: { type: String, enum: ['AND', 'OR'], default: 'AND' }
    }],

    // Visual settings (columns for kanban, hidden fields, etc.)
    settings: {
        viewMode: { type: String, enum: ['table', 'kanban', 'notes', 'calendar', null], default: undefined },
        kanbanField: { type: String }, // For kanban, which field defines columns
        kanbanTagFields: [String], // Custom select/multiselect fields shown as chips on kanban cards
        hiddenFields: [String],
        sortBy: {
            field: String,
            direction: { type: String, enum: ['asc', 'desc'], default: 'asc' }
        },
        // Default hidden record modules for direct record/hub views.
        hiddenRecordModules: [String],
        // For doc-listing views: references the SmartDocTemplate to list docs from
        smartDocTemplateId: { type: mongoose.Schema.Types.ObjectId, ref: 'SmartDocTemplate', default: null }
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('View', ViewSchema);
