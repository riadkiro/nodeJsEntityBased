const mongoose = require('mongoose');

// ============================================
// Editable Table Row Schema
// ============================================
const EditableRowSchema = new mongoose.Schema({
    recordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Record',
        required: true
    },
    cells: {
        type: Object,
        default: {}  // { qty: 2, discount: 10 }
    }
}, { _id: true });

// ============================================
// Document Instance Schema
// ============================================
const DocumentInstanceSchema = new mongoose.Schema({
    // Reference to template
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true
    },
    name: {
        type: String,
        required: true
    },

    // Runtime bindings for single collections (plain object, not Map)
    // Example: { "client": ObjectId, "invoice": ObjectId }
    bindingsSelected: {
        type: Object,
        default: {}
    },

    // Editable table data (plain object)
    // Example: { "blockId123": { rows: [...] } }
    editableTablesData: {
        type: Object,
        default: {}
    },

    // Cached resolved content
    resolvedHtml: String,
    resolvedAt: Date,

    // Ownership & status
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['draft', 'finalized', 'archived'],
        default: 'draft'
    }
}, {
    timestamps: true
});

// Indexes
DocumentInstanceSchema.index({ templateId: 1 });
DocumentInstanceSchema.index({ createdBy: 1, createdAt: -1 });
DocumentInstanceSchema.index({ status: 1 });

// Virtual to check if resolved
DocumentInstanceSchema.virtual('isResolved').get(function () {
    return !!this.resolvedHtml && !!this.resolvedAt;
});

// Method to add row to editable table
DocumentInstanceSchema.methods.addTableRow = function (blockId, recordId, cells = {}) {
    if (!this.editableTablesData[blockId]) {
        this.editableTablesData[blockId] = { rows: [] };
    }
    this.editableTablesData[blockId].rows.push({
        _id: new mongoose.Types.ObjectId(),
        recordId,
        cells
    });
    this.markModified('editableTablesData');
    return this;
};

// Method to update row cells
DocumentInstanceSchema.methods.updateRowCells = function (blockId, rowId, cells) {
    const table = this.editableTablesData[blockId];
    if (!table) return this;

    const row = table.rows.find(r => r._id.toString() === rowId.toString());
    if (row) {
        row.cells = { ...row.cells, ...cells };
        this.markModified('editableTablesData');
    }
    return this;
};

// Method to remove row
DocumentInstanceSchema.methods.removeTableRow = function (blockId, rowId) {
    const table = this.editableTablesData[blockId];
    if (!table) return this;

    table.rows = table.rows.filter(r => r._id.toString() !== rowId.toString());
    this.markModified('editableTablesData');
    return this;
};

module.exports = mongoose.model('DocumentInstance', DocumentInstanceSchema);
