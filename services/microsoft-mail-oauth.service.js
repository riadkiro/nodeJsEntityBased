const crypto = require('node:crypto');
const SecretVault = require('../src/integrations/services/SecretVault');

const MICROSOFT_SCOPES = [
    'openid',
    'profile',
    'email',
    'offline_access',
    'https://outlook.office.com/IMAP.AccessAsUser.All',
    'https://outlook.office.com/SMTP.Send'
];

function getConfig() {
    return {
        clientId: String(process.env.MICROSOFT_MAIL_CLIENT_ID || process.env.MICROSOFT_CLIENT_ID || '').trim(),
        clientSecret: String(process.env.MICROSOFT_MAIL_CLIENT_SECRET || process.env.MICROSOFT_CLIENT_SECRET || '').trim(),
        tenant: String(process.env.MICROSOFT_MAIL_TENANT || 'common').trim() || 'common'
    };
}

function isConfigured() {
    return Boolean(getConfig().clientId);
}

function createPkce() {
    const verifier = crypto.randomBytes(48).toString('base64url');
    const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
    return { verifier, challenge };
}

function createState() {
    return crypto.randomBytes(24).toString('base64url');
}

function getAuthorizationUrl({ redirectUri, state, challenge, loginHint = '' }) {
    const config = getConfig();
    if (!config.clientId) throw new Error('Microsoft OAuth is not configured');
    const params = new URLSearchParams({
        client_id: config.clientId,
        response_type: 'code',
        redirect_uri: redirectUri,
        response_mode: 'query',
        scope: MICROSOFT_SCOPES.join(' '),
        state,
        code_challenge: challenge,
        code_challenge_method: 'S256',
        prompt: 'select_account'
    });
    if (loginHint) params.set('login_hint', loginHint);
    return `https://login.microsoftonline.com/${encodeURIComponent(config.tenant)}/oauth2/v2.0/authorize?${params}`;
}

async function requestToken(parameters) {
    const config = getConfig();
    if (!config.clientId) throw new Error('Microsoft OAuth is not configured');
    const body = new URLSearchParams({ client_id: config.clientId, ...parameters });
    if (config.clientSecret) body.set('client_secret', config.clientSecret);

    const response = await fetch(`https://login.microsoftonline.com/${encodeURIComponent(config.tenant)}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
    });
    const payload = await response.json();
    if (!response.ok || !payload.access_token) {
        throw new Error(payload.error_description || payload.error || 'Microsoft token exchange failed');
    }
    return payload;
}

function exchangeAuthorizationCode({ code, redirectUri, verifier }) {
    return requestToken({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: verifier,
        scope: MICROSOFT_SCOPES.join(' ')
    });
}

function decodeIdToken(idToken) {
    try {
        const payload = String(idToken || '').split('.')[1];
        return payload ? JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) : {};
    } catch (_) {
        return {};
    }
}

function identityFromTokenSet(tokenSet, fallbackEmail = '') {
    const claims = decodeIdToken(tokenSet.id_token);
    const email = String(claims.preferred_username || claims.email || fallbackEmail || '').trim().toLowerCase();
    return {
        email,
        name: String(claims.name || 'Outlook / Hotmail').trim()
    };
}

function encryptedTokenData(tokenSet, previousRefreshToken = '') {
    const expiresIn = Math.max(60, Number(tokenSet.expires_in) || 3600);
    const tokens = {
        accessToken: tokenSet.access_token,
        refreshToken: tokenSet.refresh_token || previousRefreshToken,
        idToken: tokenSet.id_token || ''
    };
    return {
        encryptedTokens: SecretVault.encrypt(tokens),
        expiresAt: new Date(Date.now() + (expiresIn * 1000)),
        scope: String(tokenSet.scope || MICROSOFT_SCOPES.join(' '))
    };
}

async function getValidAccessToken(account) {
    const encryptedTokens = account?.oauth?.encryptedTokens;
    const tokens = SecretVault.decrypt(encryptedTokens);
    const expiresAt = account?.oauth?.expiresAt ? new Date(account.oauth.expiresAt).getTime() : 0;
    if (tokens.accessToken && expiresAt > Date.now() + 120000) return tokens.accessToken;
    if (!tokens.refreshToken) throw new Error('Microsoft refresh token is missing');

    const refreshed = await requestToken({
        grant_type: 'refresh_token',
        refresh_token: tokens.refreshToken,
        scope: MICROSOFT_SCOPES.join(' ')
    });
    const stored = encryptedTokenData(refreshed, tokens.refreshToken);
    account.oauth.encryptedTokens = stored.encryptedTokens;
    account.oauth.expiresAt = stored.expiresAt;
    account.oauth.scope = stored.scope;
    await account.save();
    return refreshed.access_token;
}

function buildXoauth2(email, accessToken) {
    return Buffer.from(`user=${email}\u0001auth=Bearer ${accessToken}\u0001\u0001`).toString('base64');
}

module.exports = {
    MICROSOFT_SCOPES,
    getConfig,
    isConfigured,
    createPkce,
    createState,
    getAuthorizationUrl,
    exchangeAuthorizationCode,
    identityFromTokenSet,
    encryptedTokenData,
    getValidAccessToken,
    buildXoauth2
};
