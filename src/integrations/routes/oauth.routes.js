/**
 * OAuth Routes
 * Handles OAuth2/OIDC authorization flow
 */

const express = require('express');
const router = express.Router();

const IntegrationProvider = require('../models/IntegrationProvider.model');
const OAuthState = require('../models/OAuthState.model');
const OAuthService = require('../services/OAuthService');
const SecretVault = require('../services/SecretVault');

/**
 * GET /:providerKey/oauth/connect
 * Initiate OAuth flow - redirect to provider's authorization URL
 */
router.get('/:providerKey/oauth/connect', async (req, res) => {
    try {
        const { providerKey } = req.params;
        const workspaceId = req.account_number;

        // Get provider
        const provider = await IntegrationProvider.findOne({ key: providerKey });
        if (!provider) {
            return res.status(404).json({ success: false, error: 'Provider not found' });
        }

        if (!['oauth2', 'oidc'].includes(provider.authType)) {
            return res.status(400).json({ success: false, error: 'Provider does not support OAuth' });
        }

        // Generate state
        const state = OAuthService.generateRandomString(32);

        // Generate PKCE if required
        let codeVerifier = null;
        let codeChallenge = null;
        if (provider.oauth?.pkce) {
            const pkce = OAuthService.generatePKCE();
            codeVerifier = pkce.codeVerifier;
            codeChallenge = pkce.codeChallenge;
        }

        // Store state (TTL 10 min)
        await OAuthState.create({
            workspaceId,
            providerKey,
            state,
            codeVerifier
        });

        // Build redirect URI
        const protocol = req.secure ? 'https' : 'http';
        const redirectUri = `${protocol}://${req.get('host')}/account/${workspaceId}/integrations/${providerKey}/oauth/callback`;

        // Build authorization URL
        const authUrl = OAuthService.buildAuthUrl(provider, state, redirectUri, codeChallenge);

        // Redirect to provider
        res.redirect(authUrl);

    } catch (error) {
        console.error('[OAuth] Connect error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /:providerKey/oauth/callback
 * Handle OAuth callback - exchange code for tokens
 */
router.get('/:providerKey/oauth/callback', async (req, res) => {
    try {
        const { providerKey } = req.params;
        const { code, state, error: oauthError, error_description } = req.query;
        const workspaceId = req.account_number;

        // Handle OAuth error
        if (oauthError) {
            console.error('[OAuth] Provider error:', oauthError, error_description);
            return res.redirect(`/account/${workspaceId}/integrations/${providerKey}?error=${encodeURIComponent(error_description || oauthError)}`);
        }

        if (!code || !state) {
            return res.status(400).json({ success: false, error: 'Missing code or state' });
        }

        // Verify state
        const oauthState = await OAuthState.findOneAndDelete({ state, workspaceId, providerKey });
        if (!oauthState) {
            return res.status(400).json({ success: false, error: 'Invalid or expired state' });
        }

        // Get provider
        const provider = await IntegrationProvider.findOne({ key: providerKey });
        if (!provider) {
            return res.status(404).json({ success: false, error: 'Provider not found' });
        }

        // Build redirect URI (must match exactly)
        const protocol = req.secure ? 'https' : 'http';
        const redirectUri = `${protocol}://${req.get('host')}/account/${workspaceId}/integrations/${providerKey}/oauth/callback`;

        // Exchange code for tokens
        const tokenResponse = await OAuthService.exchangeCode(
            provider,
            code,
            redirectUri,
            oauthState.codeVerifier
        );

        // Process tokens
        const { secrets, oauthMeta } = OAuthService.processTokenResponse(tokenResponse);

        // Encrypt secrets
        const encryptedSecrets = SecretVault.encrypt(secrets);

        // Get tenant connection model
        const { tenantDbConnection } = req;
        const IntegrationConnectionSchema = require('../models/IntegrationConnection.model').schema;
        const ConnectionModel = tenantDbConnection.models.IntegrationConnection ||
            tenantDbConnection.model('IntegrationConnection', IntegrationConnectionSchema);

        // Upsert connection
        await ConnectionModel.findOneAndUpdate(
            { workspaceId, providerKey },
            {
                status: 'connected',
                secrets: encryptedSecrets,
                oauthMeta,
                connectedByUserId: req.user?._id,
                connectedAt: new Date(),
                lastError: null
            },
            { upsert: true, new: true }
        );

        // Redirect to integration page
        res.redirect(`/account/${workspaceId}/integrations/${providerKey}?success=connected`);

    } catch (error) {
        console.error('[OAuth] Callback error:', error);
        const { providerKey } = req.params;
        const workspaceId = req.account_number;
        res.redirect(`/account/${workspaceId}/integrations/${providerKey}?error=${encodeURIComponent(error.message)}`);
    }
});

/**
 * POST /:providerKey/oauth/refresh
 * Manually refresh OAuth token
 */
router.post('/:providerKey/oauth/refresh', async (req, res) => {
    try {
        const { providerKey } = req.params;
        const workspaceId = req.account_number;

        // Get provider
        const provider = await IntegrationProvider.findOne({ key: providerKey });
        if (!provider) {
            return res.status(404).json({ success: false, error: 'Provider not found' });
        }

        // Get tenant connection
        const { tenantDbConnection } = req;
        const IntegrationConnectionSchema = require('../models/IntegrationConnection.model').schema;
        const ConnectionModel = tenantDbConnection.models.IntegrationConnection ||
            tenantDbConnection.model('IntegrationConnection', IntegrationConnectionSchema);

        const connection = await ConnectionModel.findOne({ workspaceId, providerKey });
        if (!connection) {
            return res.status(404).json({ success: false, error: 'Connection not found' });
        }

        // Decrypt current secrets
        const currentSecrets = SecretVault.decrypt(connection.secrets);
        if (!currentSecrets.refresh_token) {
            return res.status(400).json({ success: false, error: 'No refresh token available' });
        }

        // Refresh token
        const tokenResponse = await OAuthService.refreshAccessToken(provider, currentSecrets.refresh_token);

        // Process new tokens (handle rotation)
        const { secrets, oauthMeta } = OAuthService.processTokenResponse(
            tokenResponse,
            currentSecrets.refresh_token
        );

        // Encrypt and save
        const encryptedSecrets = SecretVault.encrypt(secrets);
        await ConnectionModel.updateOne(
            { _id: connection._id },
            {
                secrets: encryptedSecrets,
                oauthMeta,
                lastError: null
            }
        );

        res.json({
            success: true,
            message: 'Token refreshed',
            expiresAt: oauthMeta.tokenExpiresAt
        });

    } catch (error) {
        console.error('[OAuth] Refresh error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
