/**
 * IntegrationProvider Model
 * Defines external service providers with their auth configuration
 */
const mongoose = require("mongoose");

const IntegrationProviderSchema = new mongoose.Schema(
    {
        // Unique slug identifier (e.g., "unsplash", "stripe")
        key: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: /^[a-z0-9-]+$/
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        logo: String,
        category: {
            type: String,
            default: "other"
        },
        // Base URL for all API calls (e.g., "https://api.unsplash.com")
        baseUrl: {
            type: String,
            required: true,
            trim: true
        },
        // Authentication type
        authType: {
            type: String,
            enum: ["api_key", "bearer", "oauth2", "oidc", "none"],
            default: "none"
        },
        // How to inject authentication into requests
        authInjection: {
            mode: {
                type: String,
                enum: ["header", "query"],
                default: "header"
            },
            // Header/param name (e.g., "Authorization", "client_id")
            name: {
                type: String,
                default: "Authorization"
            },
            // Format with {{token}} placeholder (e.g., "Bearer {{token}}")
            format: {
                type: String,
                default: "{{token}}"
            }
        },
        // OAuth2/OIDC configuration (public config, no secrets)
        oauth: {
            authorizeUrl: String,
            tokenUrl: String,
            scopes: [String],
            pkce: { type: Boolean, default: false },
            extraParams: { type: Map, of: String }
        },
        // Encrypted OAuth app credentials (clientId + clientSecret)
        // Structure: { v: 1, iv, authTag, ciphertext } via SecretVault
        oauthClientSecrets: {
            v: { type: Number },
            iv: String,
            authTag: String,
            ciphertext: String
        },
        // Default headers sent with every request
        defaultHeaders: {
            type: Map,
            of: String,
            default: new Map()
        },
        // Action used for connection test (optional)
        testActionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "IntegrationAction"
        },
        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft"
        }
    },
    { timestamps: true }
);

// Index for listing published providers
IntegrationProviderSchema.index({ status: 1, category: 1 });

module.exports = mongoose.model("IntegrationProvider", IntegrationProviderSchema);
