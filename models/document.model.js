const mongoose = require('mongoose');

// ============================================
// Dynamic Template System - Collection Schemas
// ============================================

const FilterSchema = new mongoose.Schema({
    field: String,                              // "status" or standard field
    fieldId: mongoose.Schema.Types.ObjectId,    // Stable ref for custom fields
    operator: {
        type: String,
        enum: ['eq', 'ne', 'gt', 'lt', 'gte', 'lte', 'contains', 'in', 'ref']
    },
    value: mongoose.Schema.Types.Mixed,         // Static or "{{invoice._id}}"
    valueIsToken: { type: Boolean, default: false }
}, { _id: false });

const CollectionSchema = new mongoose.Schema({
    alias: { type: String, required: true },    // "client", "products"
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entity',
        required: true
    },
    type: {
        type: String,
        enum: ['single', 'query'],
        required: true
    },

    // For single bindings
    selectionMode: {
        type: String,
        enum: ['runtime', 'fixed']
    },
    fixedRecordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Record'
    },

    // For query bindings
    query: {
        filters: [FilterSchema],
        sort: [{
            field: String,
            fieldId: mongoose.Schema.Types.ObjectId,
            direction: { type: String, enum: ['asc', 'desc'], default: 'asc' }
        }],
        limit: { type: Number, default: 500 }
    }
}, { _id: true });

const ColumnSchema = new mongoose.Schema({
    key: String,
    label: String,
    expr: String,                               // "{{record.name}}", "{{record.price * row.qty}}"
    fieldId: mongoose.Schema.Types.ObjectId,    // Stable ref for cf.* fields
    input: { type: Boolean, default: false },
    inputType: {
        type: String,
        enum: ['number', 'text', 'select', 'date']
    },
    inputDefault: mongoose.Schema.Types.Mixed,
    width: String
}, { _id: true });

const TokenRefSchema = new mongoose.Schema({
    token: String,                              // "{{client.cf.customName}}"
    fieldId: mongoose.Schema.Types.ObjectId     // Stable ref
}, { _id: false });

const ContentBlockSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['text', 'table', 'image', 'divider']
    },

    // Text blocks
    html: String,
    tokenRefs: [TokenRefSchema],                // Stable field references

    // Table blocks
    mode: { type: String, enum: ['query', 'editable'] },
    source: String,                             // Collection alias (query mode)
    entityId: mongoose.Schema.Types.ObjectId,   // Entity ref (editable mode)
    datasetAlias: String,                       // "lineItems" - exposed for sum(), etc.
    columns: [ColumnSchema],
    showHeader: { type: Boolean, default: true },

    // Common styling
    style: mongoose.Schema.Types.Mixed
}, { _id: true });

// ============================================
// Existing Element/Row/Page Schemas
// ============================================

const elementSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['text', 'image', 'shape', 'variable', 'section', 'table', 'html', 'plain-text'],
        required: true
    },
    column: { type: Number, default: 0 },
    position: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 }
    },
    size: {
        width: { type: Number, default: 100 },
        height: { type: Number, default: 50 }
    },
    rotation: { type: Number, default: 0 },
    zIndex: { type: Number, default: 0 },
    style: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    content: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { _id: true });

const rowSchema = new mongoose.Schema({
    columns: { type: Number, default: 1 },
    elements: [elementSchema],
    style: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { _id: true });

const pageSchema = new mongoose.Schema({
    content: { type: String, default: '' },
    mode: { type: String, enum: ['edition', 'layout', 'designer'], default: 'edition' },
    elements: [elementSchema],
    rows: [rowSchema],
    background: {
        color: { type: String, default: '#ffffff' },
        image: { type: String }
    },
    order: { type: Number, required: true }
}, { _id: true });

const DocumentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    format: {
        type: String,
        enum: ['A4', 'A5', 'A3', 'Letter', 'Legal', 'Custom'],
        default: 'A4'
    },
    orientation: {
        type: String,
        enum: ['portrait', 'landscape'],
        default: 'portrait'
    },
    dimensions: {
        width: { type: Number, default: 794 },
        height: { type: Number, default: 1123 }
    },
    margins: {
        top: { type: Number, default: 40 },
        right: { type: Number, default: 40 },
        bottom: { type: Number, default: 40 },
        left: { type: Number, default: 40 }
    },
    // Global header/footer HTML applied to all pages
    headerHtml: { type: String, default: '' },
    footerHtml: { type: String, default: '' },
    pages: {
        type: [pageSchema],
        default: function () {
            return [{ elements: [], background: { color: '#ffffff' }, order: 0 }];
        }
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entity'
    },
    // Multi-entity linking for templates
    entityIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entity'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isTemplate: {
        type: Boolean,
        default: false
    },
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
    },
    sharedWith: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        permission: {
            type: String,
            enum: ['view', 'edit'],
            default: 'view'
        }
    }],
    tags: [String],
    status: {
        type: String,
        enum: ['draft', 'published', 'archived', 'finalized'],
        default: 'draft'
    },

    // ============================================
    // Dynamic Template System Fields
    // ============================================
    collections: [CollectionSchema],        // Data sources (single/query)
    contentBlocks: [ContentBlockSchema],    // Structured content blocks

    // Folder organization
    folderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DocumentFolder',
        default: null
    },

    // Draft generation fields (DEPRECATED — use generatedFrom/linkedRecords instead)
    isDraft: { type: Boolean, default: false },
    draftSourceTemplateId: { type: mongoose.Schema.Types.ObjectId, default: null },
    draftRecordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Record', default: null },
    draftOutputName: { type: String, default: '' },
    draftOutputFormat: { type: String, default: 'pdf' },
    isGenerationSnapshot: { type: Boolean, default: false },
    sourceGeneratedAttachmentId: { type: mongoose.Schema.Types.ObjectId, default: null },

    // ============================================
    // Structured Generation Metadata (v2)
    // ============================================

    // Source tracking: which template generated this doc
    generatedFrom: {
        templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
        smartDocId: { type: mongoose.Schema.Types.ObjectId, ref: 'SmartDocTemplate' },
        templateName: { type: String, default: '' },
        generatedAt: { type: Date }
    },

    // Linked records: which records this doc is associated with
    linkedRecords: [{
        recordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Record' },
        recordTitle: String,
        entityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entity' },
        entityName: String,
        entityIcon: String,
        entityColor: String,
        entitySlug: String,
        alias: String
    }],

    // Searchable extracted data from generation context
    extractedData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    generatedFile: {
        filename: String,
        originalName: String,
        mimeType: String,
        size: Number,
        generatedAt: Date,
        generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        generatedFromName: String,
        downloadUrl: String,
        recordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Record' },
        attachmentId: { type: mongoose.Schema.Types.ObjectId }
    },

    // Uploaded file info (for uploaded documents, not editor-created)
    uploadedFile: {
        originalName: String,
        mimeType: String,
        size: Number,                        // in bytes
        path: String                         // relative URL
    }
}, {
    timestamps: true
});

// Indexes
DocumentSchema.index({ name: 'text' });
DocumentSchema.index({ createdBy: 1, createdAt: -1 });
DocumentSchema.index({ isTemplate: 1 });
DocumentSchema.index({ entityId: 1 });
DocumentSchema.index({ entityIds: 1 });
DocumentSchema.index({ folderId: 1 });
DocumentSchema.index({ 'linkedRecords.recordId': 1 });
DocumentSchema.index({ 'generatedFrom.templateId': 1 });
DocumentSchema.index({ 'linkedRecords.entitySlug': 1 });
DocumentSchema.index({ isGenerationSnapshot: 1, sourceGeneratedAttachmentId: 1 });

// Virtual pour compter les pages
DocumentSchema.virtual('pageCount').get(function () {
    return this.pages ? this.pages.length : 0;
});

// Méthode pour dupliquer un document
DocumentSchema.methods.duplicate = function (userId) {
    const doc = this.toObject();
    delete doc._id;
    delete doc.createdAt;
    delete doc.updatedAt;
    doc.name = `${doc.name} (Copie)`;
    doc.createdBy = userId;
    doc.isTemplate = false;
    doc.isDraft = false;
    doc.isGenerationSnapshot = false;
    doc.sourceGeneratedAttachmentId = null;
    doc.generatedFile = undefined;
    return doc;
};

module.exports = mongoose.model('Document', DocumentSchema);
