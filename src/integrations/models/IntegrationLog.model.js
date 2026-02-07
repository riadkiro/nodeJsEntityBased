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
            enum: ["auth", "rate_limit", "network", "invalid_config", "internal", "validation", null],
            default: null
        },
        latencyMs: {
            type: Number
        },
        // Request metadata (secrets REDACTED)
        requestMeta: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        // Response metadata (body truncated to 2KB)
        responseMeta: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        // Workflow tracking (optional, for workflow executions)
        workflowId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workflow"
        },
        workflowJobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "WorkflowJob"
        },
        stepId: String,
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
