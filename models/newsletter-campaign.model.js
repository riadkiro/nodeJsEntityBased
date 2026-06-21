const mongoose = require('mongoose');

const NewsletterConditionSchema = new mongoose.Schema({
    field: { type: String, required: true },
    fieldName: { type: String },
    fieldType: { type: String },
    operator: {
        type: String,
        enum: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty', 'gt', 'lt', 'gte', 'lte', 'between', 'in'],
        default: 'contains'
    },
    value: mongoose.Schema.Types.Mixed,
    value2: mongoose.Schema.Types.Mixed,
    logic: { type: String, enum: ['AND', 'OR'], default: 'AND' }
}, { _id: false });

const NewsletterTemplateSchema = new mongoose.Schema({
    key: { type: String, required: true },
    name: { type: String, default: 'Email' },
    enabled: { type: Boolean, default: true },
    subject: { type: String, default: '' },
    preheader: { type: String, default: '' },
    format: { type: String, enum: ['builder', 'text', 'html', 'designed'], default: 'html' },
    layout: { type: mongoose.Schema.Types.Mixed, default: null },
    bodyText: { type: String, default: '' },
    bodyHtml: { type: String, default: '' },
    ctaLabel: { type: String, default: '' },
    ctaUrl: { type: String, default: '' },
    conditions: { type: [NewsletterConditionSchema], default: [] },
    order: { type: Number, default: 0 }
}, { _id: false });

const NewsletterCampaignSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entity', required: true, index: true },
    entitySlug: { type: String, required: true, index: true },
    sourceView: {
        viewId: { type: mongoose.Schema.Types.ObjectId, ref: 'View' },
        slug: { type: String, default: '' },
        name: { type: String, default: '' }
    },
    emailField: {
        field: { type: String, default: '' },
        fieldName: { type: String, default: '' },
        source: { type: String, enum: ['standard', 'custom'], default: 'custom' }
    },
    sender: {
        name: { type: String, default: '' },
        email: { type: String, default: '' },
        replyTo: { type: String, default: '' }
    },
    filters: { type: [NewsletterConditionSchema], default: [] },
    templates: { type: [NewsletterTemplateSchema], default: [] },
    status: {
        type: String,
        enum: ['draft', 'ready', 'sending', 'sent', 'paused'],
        default: 'draft',
        index: true
    },
    stats: {
        totalRecipients: { type: Number, default: 0 },
        sent: { type: Number, default: 0 },
        failed: { type: Number, default: 0 },
        skipped: { type: Number, default: 0 },
        lastPreviewAt: Date,
        lastSentAt: Date
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

NewsletterCampaignSchema.index({ entitySlug: 1, updatedAt: -1 });

module.exports = mongoose.model('NewsletterCampaign', NewsletterCampaignSchema);
