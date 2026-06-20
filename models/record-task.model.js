const mongoose = require('mongoose');

/**
 * RecordTask — Individual tasks within a per-record TaskList
 * 
 * Lightweight task items belonging to a specific TaskList.
 * Scoped to a record via the taskListId → TaskList.recordId chain.
 */
const RecordTaskSchema = new mongoose.Schema({
    taskListId: { type: mongoose.Schema.Types.ObjectId, ref: 'TaskList', required: true, index: true },
    recordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Record', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, default: 'À faire' },
    statusColor: { type: String, default: '#9ca3af' },
    priority: { type: String, default: 'Aucune' },
    priorityColor: { type: String, default: '' },
    isDayPriority: { type: Boolean, default: false, index: true },
    startDate: { type: Date, default: null },
    dueDate: { type: Date, default: null },
    assignedTo: { type: String, default: '' },
    order: { type: Number, default: 0 },
    completedAt: { type: Date, default: null },
    attachments: [{
        filename: { type: String, required: true },
        originalName: { type: String, default: '' },
        mimeType: { type: String, default: '' },
        size: { type: Number, default: 0 },
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
}, { timestamps: true });

RecordTaskSchema.index({ taskListId: 1, order: 1 });
RecordTaskSchema.index({ recordId: 1 });
RecordTaskSchema.index({ completedAt: 1 });

module.exports = mongoose.model('RecordTask', RecordTaskSchema);
