const mongoose = require('mongoose');

const RecordAgentStepSchema = new mongoose.Schema({
    id: { type: String, default: '' },
    type: { type: String, default: 'analysis' },
    title: { type: String, default: '' },
    detail: { type: String, default: '' },
    status: {
        type: String,
        enum: ['pending', 'ready', 'done', 'skipped', 'failed'],
        default: 'ready'
    }
}, { _id: false });

const RecordAgentActionSchema = new mongoose.Schema({
    id: { type: String, required: true },
    tool: {
        type: String,
        enum: ['create_note', 'update_fiche', 'create_task'],
        required: true
    },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    status: {
        type: String,
        enum: ['proposed', 'applied', 'failed', 'undone', 'rejected'],
        default: 'proposed'
    },
    input: { type: mongoose.Schema.Types.Mixed, default: {} },
    preview: { type: mongoose.Schema.Types.Mixed, default: {} },
    diff: { type: mongoose.Schema.Types.Mixed, default: null },
    result: { type: mongoose.Schema.Types.Mixed, default: null },
    error: { type: String, default: '' },
    appliedAt: { type: Date, default: null },
    undoneAt: { type: Date, default: null }
}, { _id: false });

const RecordAgentExecutionLogSchema = new mongoose.Schema({
    actionId: { type: String, default: '' },
    tool: { type: String, default: '' },
    status: {
        type: String,
        enum: ['applied', 'failed', 'undone'],
        default: 'applied'
    },
    before: { type: mongoose.Schema.Types.Mixed, default: null },
    after: { type: mongoose.Schema.Types.Mixed, default: null },
    inverse: { type: mongoose.Schema.Types.Mixed, default: null },
    result: { type: mongoose.Schema.Types.Mixed, default: null },
    error: { type: String, default: '' },
    appliedAt: { type: Date, default: null },
    undoneAt: { type: Date, default: null },
    actorId: { type: String, default: '' }
}, { _id: false });

const RecordAgentRunSchema = new mongoose.Schema({
    recordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Record', required: true, index: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entity', default: null, index: true },
    userId: { type: String, default: '', index: true },
    userName: { type: String, default: '' },

    goal: { type: String, required: true },
    status: {
        type: String,
        enum: ['drafting', 'review', 'applying', 'applied', 'partial', 'undoing', 'undone', 'error'],
        default: 'drafting',
        index: true
    },
    mode: { type: String, enum: ['review'], default: 'review' },

    summary: { type: String, default: '' },
    plan: {
        title: { type: String, default: '' },
        steps: { type: [RecordAgentStepSchema], default: [] }
    },
    proposedActions: { type: [RecordAgentActionSchema], default: [] },
    executionLog: { type: [RecordAgentExecutionLogSchema], default: [] },

    contextSelections: { type: mongoose.Schema.Types.Mixed, default: {} },
    contextItems: { type: [mongoose.Schema.Types.Mixed], default: [] },
    contextFingerprint: { type: String, default: '' },
    contextStats: { type: mongoose.Schema.Types.Mixed, default: {} },
    engine: { type: mongoose.Schema.Types.Mixed, default: {} },

    aiRaw: { type: String, default: '' },
    debugPayload: { type: mongoose.Schema.Types.Mixed, default: null },
    error: { type: String, default: '' }
}, { timestamps: true });

RecordAgentRunSchema.index({ recordId: 1, userId: 1, updatedAt: -1 });
RecordAgentRunSchema.index({ recordId: 1, status: 1, updatedAt: -1 });

module.exports = mongoose.model('RecordAgentRun', RecordAgentRunSchema);
