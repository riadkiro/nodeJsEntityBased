const mongoose = require('mongoose');

const RecordAiDocumentChunkSchema = new mongoose.Schema({
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RecordAiDocument',
        required: true,
        index: true
    },
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
    sourceName: {
        type: String,
        default: 'Document'
    },
    chunkIndex: {
        type: Number,
        required: true
    },
    pageStart: {
        type: Number,
        default: 1
    },
    pageEnd: {
        type: Number,
        default: 1
    },
    text: {
        type: String,
        required: true
    },
    searchText: {
        type: String,
        default: ''
    },
    charCount: {
        type: Number,
        default: 0
    },
    wordCount: {
        type: Number,
        default: 0
    },
    indexedAt: {
        type: Date,
        default: Date.now
    },
    meta: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true });

RecordAiDocumentChunkSchema.index({ documentId: 1, chunkIndex: 1 }, { unique: true });
RecordAiDocumentChunkSchema.index({ source: 1, sourceId: 1, pageStart: 1 });
RecordAiDocumentChunkSchema.index({ sourceName: 'text', searchText: 'text' });

module.exports = mongoose.model('RecordAiDocumentChunk', RecordAiDocumentChunkSchema);
