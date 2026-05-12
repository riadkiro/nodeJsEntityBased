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
        },
        showSidebar: {
            type: Boolean,
            default: true
        },
        viewMode: {
            type: String,
            enum: ['table', 'kanban', 'notes', 'calendar', null],
            default: null
        },
        enabledViews: {
            type: [String],
            default: ['table', 'kanban', 'notes', 'calendar']
        },
        // Record-edit panel layout preferences
        columnWidths: {
            type: mongoose.Schema.Types.Mixed,
            default: undefined
        },
        extraColumns: {
            type: mongoose.Schema.Types.Mixed,
            default: undefined
        },
        panelLayout: {
            type: mongoose.Schema.Types.Mixed,
            default: undefined
        },
        sidebarWidth: {
            type: Number,
            default: undefined
        },
        // Kanban preferences
        kanban: {
            type: mongoose.Schema.Types.Mixed,
            default: undefined
        },
        // Relation tabs (record edit)
        relationTabs: {
            type: mongoose.Schema.Types.Mixed,
            default: undefined
        },
        // Sidebar panel visibility
        sidebar_panels: {
            type: mongoose.Schema.Types.Mixed,
            default: undefined
        },
        // Dynamic table column widths
        gridColumnWidths: {
            type: mongoose.Schema.Types.Mixed,
            default: undefined
        },
        // Overview layout builder (rows/columns/widgets)
        rows: {
            type: mongoose.Schema.Types.Mixed,
            default: undefined
        },
        // Record Agenda preferences
        agendaPrefs: {
            type: mongoose.Schema.Types.Mixed,
            default: undefined
        },
        // Fiche field layout (order + hidden fields)
        ficheLayout: {
            type: mongoose.Schema.Types.Mixed,
            default: undefined
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
