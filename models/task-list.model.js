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
    contextType: { type: String, enum: ['account', 'record'], default: 'record', index: true },
    isDefault: { type: Boolean, default: false, index: true },
    showInMyLists: { type: Boolean, default: false, index: true },
    myListOrder: { type: Number, default: 0 },
    viewMode: { type: String, enum: ['list', 'kanban'], default: 'kanban' },
    statuses: { type: [{
        label: { type: String, required: true },
        color: { type: String, required: true },
        order: { type: Number, default: 0 }
    }], default: [
        { label: 'À faire',  color: '#9ca3af', order: 0 },
        { label: 'En cours', color: '#3b82f6', order: 1 },
        { label: 'En revue', color: '#f59e0b', order: 2 },
        { label: 'Terminé',  color: '#22c55e', order: 3 },
        { label: 'Bloqué',   color: '#ef4444', order: 4 },
    ]},
    priorities: { type: [{
        label: { type: String, required: true },
        color: { type: String, default: '' },
        order: { type: Number, default: 0 }
    }], default: [
        { label: 'Aucune',  color: '#cbd5e1', order: 0 },
        { label: 'Normal', color: '#3b82f6', order: 1 },
        { label: 'Important', color: '#f59e0b', order: 2 },
        { label: 'Urgent', color: '#ef4444', order: 3 },
    ]},
    tags: { type: [{
        label: { type: String, required: true },
        color: { type: String, default: '#6366f1' },
        order: { type: Number, default: 0 }
    }], default: [] },
    displayOptions: {
        showPriority: { type: Boolean, default: true },
        showTags: { type: Boolean, default: true },
        showAttachments: { type: Boolean, default: true },
        showReminders: { type: Boolean, default: true },
        showCompleted: { type: Boolean, default: true },
        dayMode: { type: Boolean, default: false },
        compactMode: { type: Boolean, default: false },
        accentRows: { type: Boolean, default: true }
    },
}, { timestamps: true });

TaskListSchema.index({ recordId: 1, order: 1 });
TaskListSchema.index({ showInMyLists: 1, myListOrder: 1 });

module.exports = mongoose.model('TaskList', TaskListSchema);
