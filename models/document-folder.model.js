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
    scope: {
        type: String,
        enum: ['global', 'record'],
        default: 'global'
    },
    recordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Record',
        default: null
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entity',
        default: null
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

DocumentFolderSchema.index({ createdBy: 1, order: 1 });
DocumentFolderSchema.index({ createdBy: 1, scope: 1, recordId: 1, order: 1 });

module.exports = mongoose.model('DocumentFolder', DocumentFolderSchema);
