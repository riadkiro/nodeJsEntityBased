const mongoose = require('mongoose');

const PageConfigSchema = new mongoose.Schema({
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true,
        index: true
    },
    schemaVersion: {
        type: String,
        default: '1.0'
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['dashboard', 'record_page', 'analytics'],
        required: true
    },
    entityRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entity',
        default: null
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    version: {
        type: Number,
        default: 1
    },

    // Theme tokens
    theme: {
        spacing: {
            type: String,
            enum: ['compact', 'normal', 'relaxed'],
            default: 'normal'
        },
        radius: {
            type: String,
            enum: ['none', 'sm', 'md', 'lg', 'xl'],
            default: 'md'
        },
        fontScale: {
            type: Number,
            default: 1,
            min: 0.8,
            max: 1.5
        },
        accentColor: {
            type: String,
            default: '#4361ee'
        }
    },

    // Data loading strategy
    dataPlan: {
        prefetch: {
            type: [String],
            default: []
        },
        lazy: {
            type: [String],
            default: []
        },
        cacheTTL: {
            type: Number,
            default: 300
        }
    },

    // Header configuration
    header: {
        title: String,
        subtitle: String,
        icon: String,
        breadcrumb: {
            type: Boolean,
            default: true
        },
        actions: {
            type: [String],
            default: []
        }
    },

    // Tabs (for RecordPage)
    tabs: [{
        id: String,
        label: String,
        icon: String,
        default: {
            type: Boolean,
            default: false
        }
    }],

    // Layout structure: { tabId: [rows] }
    layout: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    // Blocks definition
    blocks: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    // Actions definition
    actions: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Indexes
PageConfigSchema.index({ accountId: 1, type: 1 });
PageConfigSchema.index({ accountId: 1, entityRef: 1 });
PageConfigSchema.index({ accountId: 1, status: 1 });

module.exports = mongoose.model('PageConfig', PageConfigSchema);
