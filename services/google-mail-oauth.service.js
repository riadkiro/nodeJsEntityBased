const SecretVault = require('../src/integrations/services/SecretVault');
const OAuthService = require('../src/integrations/services/OAuthService');
const IntegrationProvider = require('../src/integrations/models/IntegrationProvider.model');

const GOOGLE_MAIL_SCOPES = [
    'openid',
    'email',
    'profile',
    'https://mail.google.com/'
];

async function getProvider() {
    return IntegrationProvider.findOne({
        key: 'google',
        status: 'published',
        authType: { $in: ['oauth2', 'oidc'] }
    });
}

async function isConfigured() {
    try {
        const provider = await getProvider();
        if (!provider?.oauthClientSecrets?.ciphertext) return false;
        const credentials = OAuthService.decryptClientSecrets(provider);
        return Boolean(credentials.clientId && credentials.clientSecret);
    } catch (_) {
        return false;
    }
}

function createPkce() {
    return OAuthService.generatePKCE();
}

function createState() {
    return OAuthService.generateRandomString(32);
}

function getAuthorizationUrl({ provider, redirectUri, state, challenge, loginHint = '' }) {
    if (!provider?.oauthClientSecrets?.ciphertext) throw new Error('Google OAuth is not configured');
    const { clientId } = OAuthService.decryptClientSecrets(provider);
    const params = new URLSearchParams({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: redirectUri,
        scope: GOOGLE_MAIL_SCOPES.join(' '),
        state,
        access_type: 'offline',
        prompt: 'consent',
        include_granted_scopes: 'true',
        code_challenge: challenge,
        code_challenge_method: 'S256'
    });
    if (loginHint) params.set('login_hint', loginHint);
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

async function requestToken(provider, parameters) {
    if (!provider?.oauthClientSecrets?.ciphertext) throw new Error('Google OAuth is not configured');
    const { clientId, clientSecret } = OAuthService.decryptClientSecrets(provider);
    const body = new URLSearchParams({ client_id: clientId, client_secret: clientSecret, ...parameters });
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
    });
    const payload = await response.json();
    if (!response.ok || !payload.access_token) {
        throw new Error(payload.error_description || payload.error || 'Google token exchange failed');
    }
    return payload;
}

function exchangeAuthorizationCode({ provider, code, redirectUri, verifier }) {
    return requestToken(provider, {
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: verifier
    });
}

async function identityFromTokenSet(tokenSet, fallbackEmail = '') {
    const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: { Authorization: `Bearer ${tokenSet.access_token}` }
    });
    const profile = await response.json();
    if (!response.ok) throw new Error(profile.error_description || profile.error || 'Google profile lookup failed');
    const email = String(profile.email || fallbackEmail || '').trim().toLowerCase();
    if (!email || profile.email_verified === false) throw new Error('Google email is missing or not verified');
    return { email, name: String(profile.name || 'Gmail').trim() };
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
        scope: String(tokenSet.scope || GOOGLE_MAIL_SCOPES.join(' '))
    };
}

async function getValidAccessToken(account) {
    const tokens = SecretVault.decrypt(account?.oauth?.encryptedTokens);
    const expiresAt = account?.oauth?.expiresAt ? new Date(account.oauth.expiresAt).getTime() : 0;
    if (tokens.accessToken && expiresAt > Date.now() + 120000) return tokens.accessToken;
    if (!tokens.refreshToken) throw new Error('Google refresh token is missing');

    const provider = await getProvider();
    const refreshed = await requestToken(provider, {
        grant_type: 'refresh_token',
        refresh_token: tokens.refreshToken
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
    GOOGLE_MAIL_SCOPES,
    getProvider,
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
