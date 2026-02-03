/**
 * IntegrationLog Model
 * Logs every action execution with redacted request/response
 */
const mongoose = require("mongoose");

const IntegrationLogSchema = new mongoose.Schema(
    {
        workspaceId: {
            type: String,
            required: true,
            index: true
        },
        providerKey: {
            type: String,
            required: true
        },
        actionKey: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["success", "error"],
            required: true
        },
        // HTTP status code
        httpStatus: {
            type: Number
        },
        // Error classification for filtering/analytics
        errorType: {
            type: String,
            enum: ["auth", "rate_limit", "network", "invalid_config", null],
            default: null
        },
        latencyMs: {
            type: Number
        },
        // Request metadata (secrets REDACTED)
        requestMeta: {
            method: String,
            url: String,
            headers: mongoose.Schema.Types.Mixed,  // redacted
            query: mongoose.Schema.Types.Mixed,    // redacted
            bodySize: Number
        },
        // Response metadata (body truncated to 2KB)
        responseMeta: {
            status: Number,
            headers: mongoose.Schema.Types.Mixed,
            bodyPreview: String,  // max 2KB
            bodySize: Number
        },
        // Error details if failed
        errorMessage: String
    },
    {
        timestamps: { createdAt: true, updatedAt: false }
    }
);

// Compound index for efficient log queries
IntegrationLogSchema.index({ workspaceId: 1, providerKey: 1, createdAt: -1 });

// TTL index to auto-delete old logs (90 days)
IntegrationLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model("IntegrationLog", IntegrationLogSchema);
