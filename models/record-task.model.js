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
    status: { type: String, default: 'À faire', enum: ['À faire', 'En cours', 'En revue', 'Terminé', 'Bloqué'] },
    statusColor: { type: String, default: '#9ca3af' },
    order: { type: Number, default: 0 },
}, { timestamps: true });

RecordTaskSchema.index({ taskListId: 1, order: 1 });
RecordTaskSchema.index({ recordId: 1 });

module.exports = mongoose.model('RecordTask', RecordTaskSchema);
