/**
 * Workflow Model
 * Defines automation workflow with trigger, context bindings, and steps
 */
const mongoose = require("mongoose");

// ── Context Binding Schema ──
// Defines what data is available to the workflow at runtime
const ContextBindingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        validate: {
            validator: v => /^[a-z][a-z0-9_]{0,20}$/.test(v),
            message: 'Key must be lowercase alphanumeric (a-z, 0-9, _), max 20 chars'
        }
    },
    type: {
        type: String,
        enum: ["entity", "manual"],
        required: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Entity"
        // Required when type="entity"
    },
    source: {
        type: String,
        enum: ["currentRecord", "byId", "query", "static"],
        default: "currentRecord"
    },
    // For type="manual" — defines input fields schema
    schema: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    }
}, { _id: false });

// ── Workflow Step Schema ──
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

// ── Main Workflow Schema ──
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
                enum: ["record.created", "record.updated", "manual.button", "schedule", "webhook"],
                required: true
            },
            scope: {
                type: String,
                enum: ["global", "entity", "page"],
                default: "entity"
            },
            entityId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Entity"
                // Required only when scope="entity" and trigger is record.*
            }
        },
        // Context sources — what data is available to steps
        contextBindings: [ContextBindingSchema],
        steps: [WorkflowStepSchema],
        // Execution settings
        settings: {
            idempotencyWindow: { type: Number, default: 5000 },
            async: { type: Boolean, default: true },
            maxRetries: { type: Number, default: 0 }
        }
    },
    { timestamps: true }
);

// ── Validations ──

// record.* triggers MUST have scope="entity" and entityId
WorkflowSchema.pre('validate', function (next) {
    if (this.trigger?.type?.startsWith('record.')) {
        this.trigger.scope = 'entity';
        if (!this.trigger.entityId) {
            return next(new Error('record.* triggers require an entityId'));
        }
    }

    // Validate contextBindings key uniqueness + no reserved words
    if (this.contextBindings && this.contextBindings.length > 0) {
        const reserved = ['trigger', 'steps', 'actor', 'inputs'];
        const keys = this.contextBindings.map(b => b.key);
        const unique = new Set(keys);

        if (unique.size !== keys.length) {
            return next(new Error('Context binding keys must be unique'));
        }
        for (const k of keys) {
            if (reserved.includes(k)) {
                return next(new Error(`Context binding key "${k}" is reserved`));
            }
        }

        // entityId required when type="entity"
        for (const b of this.contextBindings) {
            if (b.type === 'entity' && !b.entityId) {
                return next(new Error(`Context binding "${b.key}" of type "entity" requires an entityId`));
            }
        }
    }

    next();
});

// ── Indexes ──
// New: scope-aware trigger matching
WorkflowSchema.index({ workspaceId: 1, "trigger.type": 1, "trigger.scope": 1, enabled: 1 });
// Legacy: entity-specific trigger matching (record.created / record.updated)
WorkflowSchema.index({ workspaceId: 1, "trigger.entityId": 1, "trigger.type": 1, enabled: 1 });

module.exports = mongoose.model("Workflow", WorkflowSchema);
