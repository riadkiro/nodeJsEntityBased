const mongoose = require('mongoose');

const DocumentFolderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    color: {
        type: String,
        default: '#e2a03f'   // Default folder yellow/amber
    },
    icon: {
        type: String,
        default: 'folder'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

DocumentFolderSchema.index({ createdBy: 1, order: 1 });

module.exports = mongoose.model('DocumentFolder', DocumentFolderSchema);
