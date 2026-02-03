/**
 * OAuth Service
 * Handles OAuth2/OIDC flows: authorization URL, token exchange, refresh
 */

const crypto = require('crypto');
const axios = require('axios');
const SecretVault = require('./SecretVault');

/**
 * Decrypt OAuth client credentials from provider
 * @param {object} provider - IntegrationProvider document
 * @returns {object} - { clientId, clientSecret }
 */
function decryptClientSecrets(provider) {
    if (!provider.oauthClientSecrets?.ciphertext) {
        throw new Error('OAuth client credentials not configured');
    }
    return SecretVault.decrypt(provider.oauthClientSecrets);
}

/**
 * Generate cryptographically secure random string
 * @param {number} length - Length in bytes
 * @returns {string} - URL-safe base64 string
 */
function generateRandomString(length = 32) {
    return crypto.randomBytes(length)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

/**
 * Generate PKCE code verifier and challenge
 * @returns {object} - { codeVerifier, codeChallenge }
 */
function generatePKCE() {
    const codeVerifier = generateRandomString(32);
    const codeChallenge = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    return { codeVerifier, codeChallenge };
}

/**
 * Build OAuth authorization URL
 * @param {object} provider - IntegrationProvider document
 * @param {string} state - Random state string
 * @param {string} redirectUri - Callback URL
 * @param {string} codeChallenge - PKCE challenge (optional)
 * @returns {string} - Full authorization URL
 */
function buildAuthUrl(provider, state, redirectUri, codeChallenge = null) {
    const { clientId } = decryptClientSecrets(provider);
    const oauth = provider.oauth;

    if (!oauth?.authorizeUrl) {
        throw new Error('OAuth authorize URL not configured');
    }

    const url = new URL(oauth.authorizeUrl);
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('state', state);

    if (oauth.scopes?.length) {
        url.searchParams.set('scope', oauth.scopes.join(' '));
    }

    // PKCE
    if (oauth.pkce && codeChallenge) {
        url.searchParams.set('code_challenge', codeChallenge);
        url.searchParams.set('code_challenge_method', 'S256');
    }

    // Extra params
    if (oauth.extraParams) {
        const extras = oauth.extraParams instanceof Map
            ? Object.fromEntries(oauth.extraParams)
            : oauth.extraParams;
        for (const [key, value] of Object.entries(extras)) {
            url.searchParams.set(key, value);
        }
    }

    return url.toString();
}

/**
 * Exchange authorization code for tokens
 * @param {object} provider - IntegrationProvider document
 * @param {string} code - Authorization code
 * @param {string} redirectUri - Same redirect URI used in auth
 * @param {string} codeVerifier - PKCE verifier (optional)
 * @returns {Promise<object>} - Token response
 */
async function exchangeCode(provider, code, redirectUri, codeVerifier = null) {
    const { clientId, clientSecret } = decryptClientSecrets(provider);
    const oauth = provider.oauth;

    if (!oauth?.tokenUrl) {
        throw new Error('OAuth token URL not configured');
    }

    const params = new URLSearchParams();
    params.set('grant_type', 'authorization_code');
    params.set('client_id', clientId);
    params.set('client_secret', clientSecret);
    params.set('code', code);
    params.set('redirect_uri', redirectUri);

    if (oauth.pkce && codeVerifier) {
        params.set('code_verifier', codeVerifier);
    }

    const response = await axios.post(oauth.tokenUrl, params.toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        timeout: 30000
    });

    return response.data;
}

/**
 * Refresh access token
 * @param {object} provider - IntegrationProvider document
 * @param {string} refreshToken - Current refresh token
 * @returns {Promise<object>} - New token response
 */
async function refreshAccessToken(provider, refreshToken) {
    const { clientId, clientSecret } = decryptClientSecrets(provider);
    const oauth = provider.oauth;

    if (!oauth?.tokenUrl) {
        throw new Error('OAuth token URL not configured');
    }

    const params = new URLSearchParams();
    params.set('grant_type', 'refresh_token');
    params.set('client_id', clientId);
    params.set('client_secret', clientSecret);
    params.set('refresh_token', refreshToken);

    const response = await axios.post(oauth.tokenUrl, params.toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        timeout: 30000
    });

    return response.data;
}

/**
 * Process token response and build secrets/meta objects
 * @param {object} tokenResponse - Response from token endpoint
 * @param {string} existingRefreshToken - Existing refresh token (for rotation)
 * @returns {object} - { secrets, oauthMeta }
 */
function processTokenResponse(tokenResponse, existingRefreshToken = null) {
    const {
        access_token,
        refresh_token,
        expires_in,
        scope,
        token_type,
        id_token
    } = tokenResponse;

    // Build secrets object
    const secrets = {
        access_token,
        // Handle refresh token rotation: use new one if provided, else keep existing
        refresh_token: refresh_token || existingRefreshToken,
        scope: scope || null,
        id_token: id_token || null
    };

    // Build oauthMeta
    const oauthMeta = {
        tokenType: token_type || 'Bearer',
        lastRefreshedAt: new Date()
    };

    // Calculate expiration
    if (expires_in) {
        oauthMeta.tokenExpiresAt = new Date(Date.now() + (expires_in * 1000));
    }

    // Parse scopes
    if (scope) {
        oauthMeta.grantedScopes = scope.split(' ').filter(s => s);
    }

    return { secrets, oauthMeta };
}

module.exports = {
    decryptClientSecrets,
    generateRandomString,
    generatePKCE,
    buildAuthUrl,
    exchangeCode,
    refreshAccessToken,
    processTokenResponse
};
