const mongoose = require('mongoose');

// ============================================
// GridSnapshot Model
// Stores a snapshot (copy) of grid lines at a point in time
// ============================================
const SnapshotLineSchema = new mongoose.Schema({
    lineType: { type: String, default: 'product' },
    values: { type: mongoose.Schema.Types.Mixed, default: {} },
    computed: { type: mongoose.Schema.Types.Mixed, default: {} },
    order: { type: Number, default: 0 }
}, { _id: false });

const GridSnapshotSchema = new mongoose.Schema({
    // Which schema (Traitement, Analyses...)
    schemaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LineSchema',
        required: true,
        index: true
    },

    // Source record (the record where the snapshot was taken from)
    recordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Record',
        required: true,
        index: true
    },

    // Target record (the record to which the snapshot is linked for history)
    // Can be the same as recordId (self) or a related record (e.g. Patient)
    targetRecordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Record',
        required: true,
        index: true
    },

    // Target entity (for efficient querying by entity type)
    targetEntityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entity'
    },

    // Snapshot date (default: today)
    date: {
        type: Date,
        default: Date.now
    },

    // Copy of lines at the time of the snapshot
    lines: [SnapshotLineSchema],

    // Optional note
    note: String,

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Indexes for efficient queries
GridSnapshotSchema.index({ schemaId: 1, targetRecordId: 1, date: -1 });
GridSnapshotSchema.index({ schemaId: 1, recordId: 1, date: -1 });

module.exports = mongoose.model('GridSnapshot', GridSnapshotSchema);
