const mongoose = require('mongoose');

const DocumentContentBlockSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    icon: {
        type: String,
        default: 'tabler:layout-board',
        trim: true
    },
    html: {
        type: String,
        required: true,
        default: ''
    },
    sourceType: {
        type: String,
        enum: ['custom', 'system'],
        default: 'custom'
    },
    systemKey: {
        type: String,
        default: '',
        trim: true
    },
    order: {
        type: Number,
        default: 0
    },
    active: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

DocumentContentBlockSchema.index({ active: 1, sourceType: 1, order: 1, updatedAt: -1 });
DocumentContentBlockSchema.index({ sourceType: 1, systemKey: 1 }, {
    unique: true,
    partialFilterExpression: { sourceType: 'system', systemKey: { $type: 'string', $gt: '' } }
});

module.exports = mongoose.model('DocumentContentBlock', DocumentContentBlockSchema);
