/**
 * OAuthState Model
 * Temporary storage for OAuth state and PKCE code_verifier
 * TTL: 10 minutes
 */
const mongoose = require("mongoose");

const OAuthStateSchema = new mongoose.Schema(
    {
        workspaceId: {
            type: String,
            required: true
        },
        providerKey: {
            type: String,
            required: true,
            lowercase: true
        },
        // Random state for CSRF protection
        state: {
            type: String,
            required: true,
            unique: true
        },
        // PKCE code_verifier (stored temporarily)
        codeVerifier: String,
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 600  // TTL: 10 minutes
        }
    }
);

// Index for quick lookup
OAuthStateSchema.index({ state: 1 });
// TTL index
OAuthStateSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

module.exports = mongoose.model("OAuthState", OAuthStateSchema);
