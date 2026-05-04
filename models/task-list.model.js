const mongoose = require('mongoose');

/**
 * TaskList — Per-record task lists
 * 
 * Each record (patient, consultation, etc.) can have its own set of task lists.
 * Tasks within these lists are stored as Records in the 'taches' entity
 * with a taskListId reference.
 */
const TaskListSchema = new mongoose.Schema({
    recordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Record', required: true, index: true },
    label: { type: String, required: true },
    color: { type: String, default: '#6366f1' },
    icon: { type: String, default: 'tabler:list' },
    order: { type: Number, default: 0 },
    viewMode: { type: String, enum: ['list', 'kanban'], default: 'kanban' },
}, { timestamps: true });

TaskListSchema.index({ recordId: 1, order: 1 });

module.exports = mongoose.model('TaskList', TaskListSchema);
