const mongoose = require('mongoose');

const RecordAiDocumentSchema = new mongoose.Schema({
    recordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Record',
        default: null,
        index: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entity',
        default: null,
        index: true
    },
    source: {
        type: String,
        enum: ['record', 'drive', 'upload'],
        required: true,
        index: true
    },
    sourceId: {
        type: String,
        required: true,
        index: true
    },
    fileFingerprint: {
        type: String,
        required: true,
        index: true
    },
    name: {
        type: String,
        default: 'Document'
    },
    filename: {
        type: String,
        default: ''
    },
    mimeType: {
        type: String,
        default: ''
    },
    fileSize: {
        type: Number,
        default: 0
    },
    mtimeMs: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['indexing', 'ready', 'error'],
        default: 'indexing',
        index: true
    },
    pageCount: {
        type: Number,
        default: 0
    },
    processedPages: {
        type: Number,
        default: 0
    },
    truncated: {
        type: Boolean,
        default: false
    },
    charCount: {
        type: Number,
        default: 0
    },
    wordCount: {
        type: Number,
        default: 0
    },
    chunkCount: {
        type: Number,
        default: 0
    },
    indexedAt: {
        type: Date,
        default: null
    },
    error: {
        type: String,
        default: ''
    },
    meta: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true });

RecordAiDocumentSchema.index({ source: 1, sourceId: 1, fileFingerprint: 1 }, { unique: true });
RecordAiDocumentSchema.index({ recordId: 1, source: 1, sourceId: 1, updatedAt: -1 });

module.exports = mongoose.model('RecordAiDocument', RecordAiDocumentSchema);
