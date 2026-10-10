const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const test = require('node:test');

const SecretVault = require('../src/integrations/services/SecretVault');
const GoogleMailOAuth = require('../services/google-mail-oauth.service');

function withTestVault() {
    const previous = process.env.INTEGRATION_SECRETS_KEY;
    process.env.INTEGRATION_SECRETS_KEY = crypto.randomBytes(32).toString('base64');
    return () => {
        if (previous === undefined) delete process.env.INTEGRATION_SECRETS_KEY;
        else process.env.INTEGRATION_SECRETS_KEY = previous;
    };
}

test('Google mail authorization requests offline XOAUTH2 access with PKCE', () => {
    const restore = withTestVault();
    try {
        const provider = {
            oauthClientSecrets: SecretVault.encrypt({ clientId: 'google-client', clientSecret: 'google-secret' })
        };
        const pkce = GoogleMailOAuth.createPkce();
        const url = new URL(GoogleMailOAuth.getAuthorizationUrl({
            provider,
            redirectUri: 'https://dexapp.example/account/6804/integrations/google/oauth/callback',
            state: 'secure-state',
            challenge: pkce.codeChallenge,
            loginHint: 'person@gmail.com'
        }));
        assert.equal(url.origin, 'https://accounts.google.com');
        assert.equal(url.searchParams.get('access_type'), 'offline');
        assert.equal(url.searchParams.get('prompt'), 'consent');
        assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
        assert.equal(url.searchParams.get('login_hint'), 'person@gmail.com');
        assert.match(url.searchParams.get('scope'), /https:\/\/mail\.google\.com\//);
        assert.ok(pkce.codeVerifier.length >= 43);
    } finally {
        restore();
    }
});

test('Google XOAUTH2 payload uses the authenticated mailbox', () => {
    const xoauth2 = GoogleMailOAuth.buildXoauth2('person@gmail.com', 'access-token');
    const decoded = Buffer.from(xoauth2, 'base64').toString('utf8');
    assert.equal(decoded, 'user=person@gmail.com\u0001auth=Bearer access-token\u0001\u0001');
});
