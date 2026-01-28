const mongoose = require('mongoose');

const elementSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['text', 'image', 'shape', 'variable', 'section', 'table'],
        required: true
    },
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

const pageSchema = new mongoose.Schema({
    content: { type: String, default: '' },
    mode: { type: String, enum: ['edition', 'layout', 'designer'], default: 'edition' },
    elements: [elementSchema],
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
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    }
}, {
    timestamps: true
});

// Indexes
DocumentSchema.index({ name: 'text' });
DocumentSchema.index({ createdBy: 1, createdAt: -1 });
DocumentSchema.index({ isTemplate: 1 });
DocumentSchema.index({ entityId: 1 });

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
    return doc;
};

module.exports = mongoose.model('Document', DocumentSchema);
