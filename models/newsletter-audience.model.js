const mongoose = require('mongoose');

const NewsletterAudienceConditionSchema = new mongoose.Schema({
    field: { type: String, required: true },
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

const NewsletterAudienceSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
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
    filters: { type: [NewsletterAudienceConditionSchema], default: [] },
    status: { type: String, enum: ['active', 'archived'], default: 'active', index: true },
    stats: {
        totalRecipients: { type: Number, default: 0 },
        lastPreviewAt: Date
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

NewsletterAudienceSchema.index({ entitySlug: 1, updatedAt: -1 });

module.exports = mongoose.model('NewsletterAudience', NewsletterAudienceSchema);
