const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema({
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'TaskContact', required: true, index: true },
    senderUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    senderName: { type: String, default: '' },
    text: { type: String, required: true },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

ContactMessageSchema.index({ contactId: 1, createdAt: 1 });

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);
