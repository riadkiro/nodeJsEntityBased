const mongoose = require('mongoose');

// ============================================
// SmartDoc Template Schema
// ============================================
// Links a document template to an entity for 1-click generation
// on records. Some templates need extra inputs (date, text, etc.)

const InputFieldSchema = new mongoose.Schema({
    key: { type: String, required: true },          // "dateFrom", "dateTo", "note"
    label: { type: String, required: true },        // "Date de début"
    type: {
        type: String,
        enum: ['text', 'date', 'number', 'select', 'textarea'],
        default: 'text'
    },
    required: { type: Boolean, default: true },
    placeholder: String,                             // "Sélectionnez une date"
    defaultValue: mongoose.Schema.Types.Mixed,       // Pre-filled default
    options: [{                                      // For select type
        label: String,
        value: String
    }]
}, { _id: true });

const SmartDocTemplateSchema = new mongoose.Schema({
    // Display info
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    icon: {
        type: String,
        default: 'solar:document-bold-duotone'
    },
    color: {
        type: String,
        default: '#4361ee'
    },

    // Link to the document template used for generation
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true
    },

    // Link to the entity this SmartDoc applies to
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entity',
        required: true
    },

    // Scope / visibility of this SmartDoc link
    // entity  : visible for all records of the entity
    // record  : visible only on one specific record
    // relation: visible when current record is linked to a target related record
    scopeType: {
        type: String,
        enum: ['entity', 'record', 'relation'],
        default: 'entity'
    },
    scopeRecordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Record',
        default: null
    },
    scopeRelationKey: {
        type: String,
        default: ''
    },
    scopeRecordLabel: {
        type: String,
        default: ''
    },
    scopeRelationLabel: {
        type: String,
        default: ''
    },

    // Extra input fields the user must fill before generation
    // If empty → 1-click auto generation, no modal needed
    inputFields: [InputFieldSchema],

    // Output config
    outputFormat: {
        type: String,
        enum: ['pdf', 'html', 'both'],
        default: 'pdf'
    },
    outputNameTemplate: {
        type: String,
        default: '{{templateName}} - {{recordTitle}}'       // Token-based naming
    },

    // Ordering & visibility
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },

    // Audit
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Indexes
SmartDocTemplateSchema.index({ entityId: 1, active: 1, order: 1 });
SmartDocTemplateSchema.index({ documentId: 1 });
SmartDocTemplateSchema.index({ entityId: 1, scopeType: 1, scopeRecordId: 1, active: 1 });

module.exports = mongoose.model('SmartDocTemplate', SmartDocTemplateSchema);
