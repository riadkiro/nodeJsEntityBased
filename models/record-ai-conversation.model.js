const mongoose = require('mongoose');

const RecordAiMessageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant', 'system'],
        required: true
    },
    content: {
        type: String,
        default: ''
    },
    messageType: {
        type: String,
        enum: ['text', 'context'],
        default: 'text'
    },
    contextSelections: {
        type: mongoose.Schema.Types.Mixed,
        default: undefined
    },
    contextItems: {
        type: [mongoose.Schema.Types.Mixed],
        default: undefined
    },
    contextFingerprint: {
        type: String,
        default: ''
    },
    debugPayload: {
        type: mongoose.Schema.Types.Mixed,
        default: undefined
    },
    contextStats: {
        sections: { type: Number, default: 0 },
        chars: { type: Number, default: 0 },
        estimatedTokens: { type: Number, default: 0 },
        included: { type: Boolean, default: false }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const RecordAiConversationSchema = new mongoose.Schema({
    recordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Record',
        required: true,
        index: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entity',
        default: null,
        index: true
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    title: {
        type: String,
        default: 'Nouvelle conversation'
    },
    model: {
        type: String,
        default: ''
    },
    contextSelections: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    contextFingerprint: {
        type: String,
        default: ''
    },
    openAI: {
        responseId: { type: String, default: '' },
        updatedAt: { type: Date, default: null }
    },
    messages: {
        type: [RecordAiMessageSchema],
        default: []
    },
    lastMessage: {
        text: { type: String, default: '' },
        role: { type: String, default: '' },
        sentAt: { type: Date, default: null }
    },
    archived: {
        type: Boolean,
        default: false,
        index: true
    }
}, { timestamps: true });

RecordAiConversationSchema.index({ recordId: 1, userId: 1, archived: 1, updatedAt: -1 });
RecordAiConversationSchema.index({ entityId: 1, updatedAt: -1 });

module.exports = mongoose.model('RecordAiConversation', RecordAiConversationSchema);
