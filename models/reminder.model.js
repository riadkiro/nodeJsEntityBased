const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
    accountNumber: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetType: { type: String, required: true, trim: true, lowercase: true, index: true },
    targetModel: { type: String, default: '', trim: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    slotKey: { type: String, default: 'default', trim: true },
    title: { type: String, default: '', trim: true },
    message: { type: String, default: '', trim: true },
    scheduledAt: { type: Date, required: true, index: true },
    timeZone: { type: String, default: 'UTC', trim: true },
    channel: {
        type: String,
        enum: ['local', 'push', 'in_app'],
        default: 'local',
        index: true,
    },
    status: {
        type: String,
        enum: ['scheduled', 'sent', 'cancelled', 'failed'],
        default: 'scheduled',
        index: true,
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    deliveredAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

ReminderSchema.index({ accountNumber: 1, userId: 1, status: 1, scheduledAt: 1 });
ReminderSchema.index({ accountNumber: 1, targetType: 1, targetId: 1, status: 1 });
ReminderSchema.index(
    { accountNumber: 1, userId: 1, targetType: 1, targetId: 1, slotKey: 1, status: 1 },
    {
        unique: true,
        partialFilterExpression: { status: 'scheduled' },
        name: 'unique_scheduled_reminder_per_target_slot',
    }
);

module.exports = mongoose.model('Reminder', ReminderSchema);
