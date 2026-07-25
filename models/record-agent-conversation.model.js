const mongoose = require('mongoose');

const RecordAgentConversationSchema = new mongoose.Schema({
    recordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Record', required: true, index: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entity', default: null, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, default: '' },
    title: { type: String, default: 'Nouvelle conversation agent' },
    contextType: {
        type: String,
        enum: ['', 'record', 'task', 'task_list', 'note'],
        default: '',
        index: true
    },
    contextId: { type: String, default: '', index: true },
    contextLabel: { type: String, default: '' },
    runCount: { type: Number, default: 0 },
    lastRun: {
        runId: { type: mongoose.Schema.Types.ObjectId, ref: 'RecordAgentRun', default: null },
        goal: { type: String, default: '' },
        status: { type: String, default: '' },
        actionCount: { type: Number, default: 0 },
        updatedAt: { type: Date, default: null }
    },
    archived: { type: Boolean, default: false, index: true },
    archivedAt: { type: Date, default: null }
}, { timestamps: true });

RecordAgentConversationSchema.index({ recordId: 1, userId: 1, archived: 1, updatedAt: -1 });
RecordAgentConversationSchema.index({ entityId: 1, updatedAt: -1 });
RecordAgentConversationSchema.index({
    recordId: 1,
    userId: 1,
    contextType: 1,
    contextId: 1,
    archived: 1,
    updatedAt: -1
});

module.exports = mongoose.model('RecordAgentConversation', RecordAgentConversationSchema);
