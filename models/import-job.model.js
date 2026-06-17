const mongoose = require('mongoose');

const ImportJobSchema = new mongoose.Schema({
    workspaceId: { type: String, required: true, index: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entity', required: true, index: true },
    entitySlug: { type: String, required: true },
    importId: { type: String, required: true },
    originalName: String,
    sheetName: String,

    status: {
        type: String,
        enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
        default: 'pending',
        index: true
    },
    progress: { type: Number, default: 0 },
    totalRows: { type: Number, default: 0 },
    processedRows: { type: Number, default: 0 },

    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    stats: {
        createdRows: { type: Number, default: 0 },
        updatedRows: { type: Number, default: 0 },
        deletedRows: { type: Number, default: 0 },
        skippedRows: { type: Number, default: 0 },
        duplicateRows: { type: Number, default: 0 },
        ignoredDuplicateRows: { type: Number, default: 0 },
        ambiguousDuplicateRows: { type: Number, default: 0 },
        fileDuplicateRows: { type: Number, default: 0 },
        createdFields: { type: Number, default: 0 }
    },
    result: { type: mongoose.Schema.Types.Mixed, default: null },
    error: String,

    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    nextRunAt: { type: Date, default: Date.now },
    lockedAt: Date,
    lockedBy: String,
    startedAt: Date,
    completedAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

ImportJobSchema.index({ status: 1, nextRunAt: 1, createdAt: 1 });
ImportJobSchema.index({ workspaceId: 1, createdAt: -1 });
ImportJobSchema.index({ completedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('ImportJob', ImportJobSchema);
