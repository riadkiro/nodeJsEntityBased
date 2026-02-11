const mongoose = require('mongoose');

const DenormJobSchema = new mongoose.Schema({
    // What triggered this job
    trigger: {
        type: String,
        enum: ['record_updated', 'record_created', 'classification_changed', 'bulk_migration'],
        required: true
    },

    // The source record that was modified (triggered the job)
    sourceRecordId: { type: mongoose.Schema.Types.ObjectId },
    sourceEntityId: { type: mongoose.Schema.Types.ObjectId },

    // Job status
    status: {
        type: String,
        enum: ['pending', 'running', 'done', 'failed'],
        default: 'pending'
    },

    // How many records were updated
    affectedCount: { type: Number, default: 0 },

    // Error tracking
    error: String,
    retries: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },

    // Timestamps
    startedAt: Date,
    completedAt: Date
}, { timestamps: true });

// Index for job processing: find pending jobs efficiently
DenormJobSchema.index({ status: 1, createdAt: 1 });

// TTL: auto-delete completed jobs after 7 days
DenormJobSchema.index({ completedAt: 1 }, { expireAfterSeconds: 604800 });

module.exports = mongoose.model('DenormJob', DenormJobSchema);
