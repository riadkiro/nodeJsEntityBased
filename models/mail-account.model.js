const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mailAccountSchema = new Schema({
    name: { type: String, required: true }, // Display name (e.g. "Work Gmail", "Personal")
    email: { type: String, required: true }, // Email address
    imap: {
        host: { type: String, required: true },
        port: { type: Number, default: 993 },
        user: { type: String, required: true },
        password: { type: String, required: true },
        tls: { type: Boolean, default: true },
    },
    smtp: {
        host: { type: String },
        port: { type: Number, default: 587 },
        user: { type: String },
        password: { type: String },
        secure: { type: Boolean, default: false },
    },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastSync: { type: Date },
    color: { type: String, default: '#4361ee' }, // Account color for UI
}, { timestamps: true });

module.exports = mongoose.model('MailAccount', mailAccountSchema);
