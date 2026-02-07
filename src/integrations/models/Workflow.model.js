/**
 * Workflow Model
 * Defines automation workflow with trigger and steps
 */
const mongoose = require("mongoose");

const WorkflowStepSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["action"],
        default: "action"
    },
    providerKey: {
        type: String,
        required: true
    },
    actionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "IntegrationAction",
        required: true
    },
    // Input mapping using template syntax
    // e.g., { "query": "{{trigger.record.name}}" }
    inputMapping: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    // UI state for visual field mapping (persisted for reload)
    uiState: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    }
}, { _id: false });

const WorkflowSchema = new mongoose.Schema(
    {
        workspaceId: {
            type: String,
            required: true,
            index: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: String,
        category: {
            type: String,
            enum: ["automation", "action", "notification"],
            default: "automation"
        },
        enabled: {
            type: Boolean,
            default: false
        },
        trigger: {
            type: {
                type: String,
                enum: ["record.created", "record.updated", "manual.button"],
                required: true
            },
            entityId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Entity"
                // Not required — manual.button may not need an entity
            }
        },
        steps: [WorkflowStepSchema],
        // Execution settings
        settings: {
            idempotencyWindow: { type: Number, default: 5000 }, // ms cooldown between executions
            async: { type: Boolean, default: true },
            maxRetries: { type: Number, default: 0 }
        }
    },
    { timestamps: true }
);

// Index for trigger matching
WorkflowSchema.index({ workspaceId: 1, "trigger.entityId": 1, "trigger.type": 1, enabled: 1 });

module.exports = mongoose.model("Workflow", WorkflowSchema);
