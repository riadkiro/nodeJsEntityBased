/**
 * IntegrationConnection Model
 * Tenant's connection to a provider with encrypted credentials
 */
const mongoose = require("mongoose");

const IntegrationConnectionSchema = new mongoose.Schema(
    {
        // Tenant workspace ID
        workspaceId: {
            type: String,
            required: true
        },
        providerKey: {
            type: String,
            required: true,
            lowercase: true
        },
        status: {
            type: String,
            enum: ["connected", "disconnected", "error"],
            default: "disconnected"
        },
        // Non-sensitive configuration
        config: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        // Versioned encrypted secrets (AES-256-GCM)
        // Structure: { v: 1, iv: base64, authTag: base64, ciphertext: base64 }
        // For api_key/bearer: { token }
        // For oauth2/oidc: { access_token, refresh_token, id_token?, scope }
        secrets: {
            v: { type: Number, default: 1 },
            iv: String,
            authTag: String,
            ciphertext: String
        },
        // OAuth metadata (visible, non-sensitive)
        oauthMeta: {
            tokenExpiresAt: Date,
            grantedScopes: [String],
            tokenType: String,
            lastRefreshedAt: Date
        },
        connectedByUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        connectedAt: Date,
        lastTestAt: Date,
        lastError: String
    },
    { timestamps: true }
);

// Unique connection per workspace + provider
IntegrationConnectionSchema.index(
    { workspaceId: 1, providerKey: 1 },
    { unique: true }
);

module.exports = mongoose.model("IntegrationConnection", IntegrationConnectionSchema);
