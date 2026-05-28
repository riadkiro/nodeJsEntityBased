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
    contentHash: {
        type: String,
        default: '',
        index: true
    },
    ragConfigHash: {
        type: String,
        default: '',
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
    embeddingStatus: {
        type: String,
        enum: ['none', 'indexing', 'ready', 'partial', 'error'],
        default: 'none',
        index: true
    },
    embeddingModel: {
        type: String,
        default: ''
    },
    embeddingConfig: {
        type: String,
        default: ''
    },
    embeddingDimensions: {
        type: Number,
        default: 0
    },
    embeddedChunkCount: {
        type: Number,
        default: 0
    },
    embeddedAt: {
        type: Date,
        default: null
    },
    embeddingError: {
        type: String,
        default: ''
    },
    indexedAt: {
        type: Date,
        default: null
    },
    lastUsedAt: {
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
RecordAiDocumentSchema.index({ contentHash: 1, ragConfigHash: 1, status: 1, indexedAt: 1 });
RecordAiDocumentSchema.index({ recordId: 1, source: 1, sourceId: 1, updatedAt: -1 });

module.exports = mongoose.model('RecordAiDocument', RecordAiDocumentSchema);
