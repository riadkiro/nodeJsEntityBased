const mongoose = require('mongoose');

const DriveFileSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String },
    size: { type: Number, default: 0 },
    category: { type: String, default: 'other' },
    folder: { type: String, default: '' },
    uploadedAt: { type: Date, default: Date.now },
}, {
    timestamps: false,
    collection: 'drivefiles'
});

module.exports = mongoose.model('DriveFile', DriveFileSchema);
