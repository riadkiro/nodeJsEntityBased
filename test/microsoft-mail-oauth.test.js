const assert = require('node:assert/strict');
const test = require('node:test');

const MicrosoftMailOAuth = require('../services/microsoft-mail-oauth.service');

test('Microsoft mail authorization uses modern OAuth with IMAP and SMTP scopes', () => {
    const previousClientId = process.env.MICROSOFT_MAIL_CLIENT_ID;
    const previousTenant = process.env.MICROSOFT_MAIL_TENANT;
    process.env.MICROSOFT_MAIL_CLIENT_ID = 'test-client-id';
    process.env.MICROSOFT_MAIL_TENANT = 'common';
    try {
        const pkce = MicrosoftMailOAuth.createPkce();
        const url = new URL(MicrosoftMailOAuth.getAuthorizationUrl({
            redirectUri: 'https://dexapp.example/account/6804/mailbox/oauth/microsoft/callback',
            state: 'secure-state',
            challenge: pkce.challenge,
            loginHint: 'person@hotmail.com'
        }));
        assert.equal(url.origin, 'https://login.microsoftonline.com');
        assert.match(url.pathname, /\/common\/oauth2\/v2\.0\/authorize$/);
        assert.equal(url.searchParams.get('response_type'), 'code');
        assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
        assert.equal(url.searchParams.get('login_hint'), 'person@hotmail.com');
        assert.match(url.searchParams.get('scope'), /IMAP\.AccessAsUser\.All/);
        assert.match(url.searchParams.get('scope'), /SMTP\.Send/);
        assert.match(url.searchParams.get('scope'), /offline_access/);
        assert.ok(pkce.verifier.length >= 43);
    } finally {
        if (previousClientId === undefined) delete process.env.MICROSOFT_MAIL_CLIENT_ID;
        else process.env.MICROSOFT_MAIL_CLIENT_ID = previousClientId;
        if (previousTenant === undefined) delete process.env.MICROSOFT_MAIL_TENANT;
        else process.env.MICROSOFT_MAIL_TENANT = previousTenant;
    }
});

test('Microsoft identity and XOAUTH2 payload use the authenticated mailbox', () => {
    const claims = Buffer.from(JSON.stringify({
        preferred_username: 'Person@Hotmail.com',
        name: 'Person Test'
    })).toString('base64url');
    const identity = MicrosoftMailOAuth.identityFromTokenSet({ id_token: `header.${claims}.signature` });
    assert.deepEqual(identity, { email: 'person@hotmail.com', name: 'Person Test' });

    const xoauth2 = MicrosoftMailOAuth.buildXoauth2(identity.email, 'access-token');
    const decoded = Buffer.from(xoauth2, 'base64').toString('utf8');
    assert.equal(decoded, 'user=person@hotmail.com\u0001auth=Bearer access-token\u0001\u0001');
});
