const mongoose = require('mongoose');

const NewsletterDeliverySchema = new mongoose.Schema({
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'NewsletterCampaign', required: true, index: true },
    templateKey: { type: String, required: true, index: true },
    recordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Record', index: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    subject: { type: String, default: '' },
    status: {
        type: String,
        enum: ['queued', 'sent', 'failed', 'skipped', 'dry_run'],
        default: 'queued',
        index: true
    },
    dryRun: { type: Boolean, default: false },
    providerMessageId: { type: String },
    error: { type: String },
    sentAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

NewsletterDeliverySchema.index(
    { campaignId: 1, templateKey: 1, recordId: 1, email: 1 },
    { unique: true, partialFilterExpression: { dryRun: false } }
);

module.exports = mongoose.model('NewsletterDelivery', NewsletterDeliverySchema);
