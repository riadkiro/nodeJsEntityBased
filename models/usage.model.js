const mongoose = require('mongoose');

/**
 * Usage — Monthly usage tracking per workspace
 * ──────────────────────────────────────────────
 * Tracks resource consumption for billing and limit enforcement.
 * One document per workspace per month.
 * Stored in the GLOBAL database.
 */
const UsageSchema = new mongoose.Schema({
    accountNumber: { type: String, required: true, index: true },
    period: { type: String, required: true }, // 'YYYY-MM' format

    // Cumulative counters for the period
    counters: {
        activeUsers:       { type: Number, default: 0 },
        externalCollabs:   { type: Number, default: 0 },
        guests:            { type: Number, default: 0 },
        entities:          { type: Number, default: 0 },
        records:           { type: Number, default: 0 },
        storageMB:         { type: Number, default: 0 },
        aiCreditsUsed:     { type: Number, default: 0 },
        automationsRun:    { type: Number, default: 0 },
        apiCalls:          { type: Number, default: 0 },
        documentsGenerated:{ type: Number, default: 0 },
        emailsSent:        { type: Number, default: 0 },
    },

    // Daily snapshots for analytics
    snapshots: [{
        date: { type: Date },
        counters: { type: mongoose.Schema.Types.Mixed },
    }],

    // Peak values (for billing)
    peaks: {
        maxActiveUsers:  { type: Number, default: 0 },
        maxStorageMB:    { type: Number, default: 0 },
    },

}, { timestamps: true });

// Compound unique index
UsageSchema.index({ accountNumber: 1, period: 1 }, { unique: true });

// Get current period string
UsageSchema.statics.currentPeriod = function () {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// Increment a counter atomically
UsageSchema.statics.increment = async function (accountNumber, counterKey, amount = 1) {
    const period = this.currentPeriod();
    const update = {};
    update[`counters.${counterKey}`] = amount;

    return this.findOneAndUpdate(
        { accountNumber, period },
        { $inc: update },
        { upsert: true, new: true }
    );
};

// Get current usage for a workspace
UsageSchema.statics.getCurrent = async function (accountNumber) {
    const period = this.currentPeriod();
    return this.findOne({ accountNumber, period }).lean();
};

const Usage = mongoose.model('Usage', UsageSchema);
module.exports = Usage;
