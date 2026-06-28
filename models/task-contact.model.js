const mongoose = require('mongoose');

const TaskContactSchema = new mongoose.Schema({
    requesterUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    requesterAccountNumber: { type: String, default: '', index: true },
    requesterEmail: { type: String, default: '', lowercase: true, trim: true, index: true },
    requesterName: { type: String, default: '' },
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    targetEmail: { type: String, default: '', lowercase: true, trim: true, index: true },
    targetPhone: { type: String, default: '', trim: true, index: true },
    targetName: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'accepted', 'declined', 'blocked'], default: 'pending', index: true },
    token: { type: String, default: '', index: true },
    requestedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date, default: null },
    declinedAt: { type: Date, default: null },
}, { timestamps: true });

TaskContactSchema.index({ requesterUserId: 1, targetEmail: 1 });
TaskContactSchema.index({ requesterUserId: 1, targetPhone: 1 });
TaskContactSchema.index({ targetUserId: 1, status: 1 });
TaskContactSchema.index({ targetEmail: 1, status: 1 });

module.exports = mongoose.model('TaskContact', TaskContactSchema);
