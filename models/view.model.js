const mongoose = require('mongoose');

const ViewSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true },

    // The base entity this view is based on
    entity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entity',
        required: true
    },

    // Hierarchy position
    spaces: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Space'
    }],
    folders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder'
    }],

    // Future filter/config
    filters: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    settings: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('View', ViewSchema);
