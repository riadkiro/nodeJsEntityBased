const mongoose = require('mongoose');

// ============================================
// DocumentLine Model
// ============================================
const DocumentLineSchema = new mongoose.Schema({
    // Parent document (Record or DocumentInstance)
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },

    // Line type from schema
    lineType: {
        type: String,
        default: 'product'              // "product","service","treatment","note"
    },

    // Edited values (keyed by column key)
    // e.g. { item: ObjectId, qty: 2, unitPrice: 100, description: "..." }
    values: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    // Backend-computed values (formula columns)
    // e.g. { lineTotal: 200, lineVat: 42 }
    computed: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    // Display order
    order: {
        type: Number,
        default: 0
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Indexes
DocumentLineSchema.index({ documentId: 1, order: 1 });

module.exports = mongoose.model('DocumentLine', DocumentLineSchema);
