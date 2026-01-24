const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attachmentSchema = new Schema({
    name: String,
    size: String,
    type: String, // 'file', 'image', 'zip', 'folder', etc.
    path: String // URL or path to file
});

const mailSchema = new Schema({
    id: { type: Number, required: true }, // We keep the ID from the template for now, or we can use _id
    path: String, // Profile picture path
    firstName: String,
    lastName: String,
    email: { type: String, required: true },
    date: Date,
    time: String, // Kept for compatibility with template, but derived from date usually
    title: String,
    displayDescription: String,
    description: String, // HTML content
    type: {
        type: String,
        enum: ['inbox', 'sent_mail', 'draft', 'spam', 'trash', 'archive', 'important'],
        default: 'inbox'
    },
    isImportant: { type: Boolean, default: false },
    isStar: { type: Boolean, default: false },
    isUnread: { type: Boolean, default: true },
    group: {
        type: String,
        enum: ['personal', 'work', 'social', 'private', ''],
        default: ''
    },
    attachments: [attachmentSchema],
    tenantId: { type: Schema.Types.ObjectId, ref: 'Account' } // Logical separation if needed
}, { timestamps: true });

// Index for search performance
mailSchema.index({ title: 'text', description: 'text', firstName: 'text', lastName: 'text', email: 'text' });

module.exports = mongoose.model('Mail', mailSchema);
