/**
 * IntegrationAction Model
 * Defines executable HTTP actions for a provider
 */
const mongoose = require("mongoose");

const IntegrationActionSchema = new mongoose.Schema(
    {
        // Reference to provider (by key)
        providerKey: {
            type: String,
            required: true,
            lowercase: true
        },
        // Human-readable action key (e.g., "search-photos")
        actionKey: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: String,
        // HTTP configuration
        http: {
            method: {
                type: String,
                enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
                default: "GET"
            },
            // Path appended to provider baseUrl (e.g., "/search/photos")
            path: {
                type: String,
                required: true,
                trim: true
            }
        },
        // JSON Schema for form generation
        inputSchema: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        // Request template with {{variable}} placeholders
        requestTemplate: {
            query: {
                type: mongoose.Schema.Types.Mixed,
                default: {}
            },
            headers: {
                type: mongoose.Schema.Types.Mixed,
                default: {}
            },
            body: {
                type: mongoose.Schema.Types.Mixed,
                default: {}
            }
        },
        // Response mapping: { outputKey: "path.to.value" }
        responseMapping: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        // Test payload for admin testing
        testPayload: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        isPublished: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

// Unique action per provider
IntegrationActionSchema.index({ providerKey: 1, actionKey: 1 }, { unique: true });
// For listing actions by provider
IntegrationActionSchema.index({ providerKey: 1, isPublished: 1 });

module.exports = mongoose.model("IntegrationAction", IntegrationActionSchema);
