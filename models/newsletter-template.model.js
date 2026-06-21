const mongoose = require('mongoose');

const NewsletterTemplateSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'general', index: true },
    tags: { type: [String], default: [] },
    subject: { type: String, default: '' },
    preheader: { type: String, default: '' },
    format: { type: String, enum: ['builder', 'html', 'text', 'designed'], default: 'builder' },
    layout: { type: mongoose.Schema.Types.Mixed, default: null },
    bodyHtml: { type: String, default: '' },
    bodyText: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'ready', 'archived'], default: 'draft', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

NewsletterTemplateSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('NewsletterTemplate', NewsletterTemplateSchema);
