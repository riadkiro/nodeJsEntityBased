const mongoose = require('mongoose');

const TaskTagSchema = new mongoose.Schema({
    label: { type: String, required: true },
    labelKey: { type: String, required: true, index: true },
    color: { type: String, default: '#6366f1' },
    order: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

TaskTagSchema.index({ labelKey: 1 }, { unique: true });
TaskTagSchema.index({ order: 1, label: 1 });

module.exports = mongoose.model('TaskTag', TaskTagSchema);
