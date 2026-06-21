const mongoose = require('mongoose');

const SequenceConditionSchema = new mongoose.Schema({
    field: { type: String },
    fieldName: String,
    fieldType: String,
    operator: {
        type: String,
        enum: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty', 'gt', 'lt', 'gte', 'lte', 'between', 'in'],
        default: 'contains'
    },
    value: mongoose.Schema.Types.Mixed,
    value2: mongoose.Schema.Types.Mixed,
    logic: { type: String, enum: ['AND', 'OR'], default: 'AND' }
}, { _id: false });

const SequenceStepSchema = new mongoose.Schema({
    name: { type: String, default: 'Email' },
    delayDays: { type: Number, default: 0 },
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'NewsletterTemplate' },
    templateSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },
    subject: { type: String, default: '' },
    preheader: { type: String, default: '' },
    layout: { type: mongoose.Schema.Types.Mixed, default: null },
    bodyHtml: { type: String, default: '' },
    bodyText: { type: String, default: '' },
    conditions: { type: [SequenceConditionSchema], default: [] },
    order: { type: Number, default: 0 }
}, { _id: true });

const NewsletterSequenceSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    audienceId: { type: mongoose.Schema.Types.ObjectId, ref: 'NewsletterAudience', index: true },
    status: { type: String, enum: ['draft', 'active', 'paused', 'archived'], default: 'draft', index: true },
    sender: {
        name: { type: String, default: '' },
        email: { type: String, default: '' },
        replyTo: { type: String, default: '' }
    },
    steps: { type: [SequenceStepSchema], default: [] },
    stats: {
        enrolled: { type: Number, default: 0 },
        sent: { type: Number, default: 0 },
        failed: { type: Number, default: 0 }
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

NewsletterSequenceSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('NewsletterSequence', NewsletterSequenceSchema);
