const mongoose = require('mongoose');

const TaskListShareSchema = new mongoose.Schema({
    ownerAccountNumber: { type: String, required: true, index: true },
    listId: { type: String, required: true, index: true },
    recordId: { type: String, default: '', index: true },
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetType: { type: String, enum: ['contact', 'team', 'user'], required: true, index: true },
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    targetEmail: { type: String, default: '', lowercase: true, trim: true, index: true },
    targetPhone: { type: String, default: '', trim: true },
    targetName: { type: String, default: '' },
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'TaskContact', default: null, index: true },
    teamId: { type: String, default: '', index: true },
    role: { type: String, enum: ['viewer', 'editor', 'admin'], default: 'editor' },
    status: { type: String, enum: ['pending', 'active', 'revoked'], default: 'active', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    revokedAt: { type: Date, default: null },
}, { timestamps: true });

TaskListShareSchema.index({ ownerAccountNumber: 1, listId: 1, status: 1 });
TaskListShareSchema.index({ targetUserId: 1, status: 1 });
TaskListShareSchema.index({ targetEmail: 1, status: 1 });
TaskListShareSchema.index(
    { ownerAccountNumber: 1, listId: 1, targetType: 1, targetUserId: 1, targetEmail: 1, targetPhone: 1, teamId: 1 },
    { unique: true, partialFilterExpression: { status: { $ne: 'revoked' } } },
);

module.exports = mongoose.model('TaskListShare', TaskListShareSchema);
