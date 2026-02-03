/**
 * WorkflowJob Model
 * Job queue for workflow executions with locking and retry support
 */
const mongoose = require("mongoose");

const StepResultSchema = new mongoose.Schema({
    stepId: String,
    status: {
        type: String,
        enum: ["pending", "success", "error", "skipped"]
    },
    result: mongoose.Schema.Types.Mixed,
    errorMessage: String,
    executedAt: Date,
    latencyMs: Number
}, { _id: false });

const WorkflowJobSchema = new mongoose.Schema(
    {
        workspaceId: {
            type: String,
            required: true,
            index: true
        },
        workflowId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workflow",
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "running", "completed", "failed"],
            default: "pending"
        },
        // Trigger data passed to the workflow
        triggerData: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        // Results from each step
        stepResults: [StepResultSchema],

        // Retry support
        attempts: {
            type: Number,
            default: 0
        },
        maxAttempts: {
            type: Number,
            default: 3
        },
        lastError: String,
        nextRunAt: {
            type: Date,
            default: Date.now
        },

        // Atomic locking for worker
        lockedAt: Date,
        lockedBy: String,

        // Timing
        startedAt: Date,
        completedAt: Date
    },
    { timestamps: true }
);

// Index for worker polling (pending jobs ready to run)
WorkflowJobSchema.index({ status: 1, nextRunAt: 1 });

// Index for workflow history
WorkflowJobSchema.index({ workspaceId: 1, workflowId: 1, createdAt: -1 });

// TTL index to auto-delete old completed jobs (30 days)
WorkflowJobSchema.index({ completedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model("WorkflowJob", WorkflowJobSchema);
