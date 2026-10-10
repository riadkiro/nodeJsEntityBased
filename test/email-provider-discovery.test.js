const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ejs = require('ejs');

const {
    parseEmail,
    listEmailProviders,
    discoverEmailProvider
} = require('../services/email-provider-discovery.service');

test('known personal email domains are configured without a DNS lookup', async () => {
    let dnsCalls = 0;
    const resolveMx = async () => {
        dnsCalls += 1;
        return [];
    };

    const gmail = await discoverEmailProvider(' User.Name@GMAIL.com ', { resolveMx });
    assert.equal(gmail.found, true);
    assert.equal(gmail.email, 'user.name@gmail.com');
    assert.equal(gmail.provider.name, 'Gmail');
    assert.equal(gmail.provider.authType, 'oauth2');
    assert.deepEqual(gmail.provider.imap, { host: 'imap.gmail.com', port: 993, tls: true });
    assert.equal(gmail.provider.smtp.host, 'smtp.gmail.com');

    const hotmail = await discoverEmailProvider('hello@hotmail.fr', { resolveMx });
    assert.equal(hotmail.provider.name, 'Outlook / Hotmail');
    assert.equal(hotmail.provider.authType, 'oauth2');
    assert.equal(hotmail.provider.smtp.host, 'smtp-mail.outlook.com');
    assert.equal(hotmail.provider.smtp.port, 587);
    assert.equal(dnsCalls, 0);
});

test('custom professional domains detect Google Workspace and Microsoft 365 through MX', async () => {
    const google = await discoverEmailProvider('hello@company.test', {
        resolveMx: async () => [{ priority: 1, exchange: 'aspmx.l.google.com' }]
    });
    assert.equal(google.found, true);
    assert.equal(google.provider.key, 'gmail');
    assert.equal(google.provider.detectedBy, 'mx');

    const microsoft = await discoverEmailProvider('hello@another.test', {
        resolveMx: async () => [{ priority: 0, exchange: 'another-test.mail.protection.outlook.com' }]
    });
    assert.equal(microsoft.found, true);
    assert.equal(microsoft.provider.key, 'microsoft');
});

test('professional domains detect One.com, OVH, Hostinger and Titan through MX', async () => {
    const cases = [
        ['onecom', 'customer.example.mx.one.com'],
        ['onecom', 'cluster42.mx.service.one'],
        ['ovh', 'mx1.mail.ovh.net'],
        ['hostinger', 'mx1.hostinger.com'],
        ['titan', 'mx1.titan.email']
    ];

    for (const [expectedKey, exchange] of cases) {
        const result = await discoverEmailProvider(`hello@${expectedKey}.test`, {
            resolveMx: async () => [{ priority: 10, exchange }]
        });
        assert.equal(result.found, true, exchange);
        assert.equal(result.provider.key, expectedKey, exchange);
        assert.equal(result.provider.detectedBy, 'mx', exchange);
    }
});

test('provider selection exposes ready-to-use IMAP and SMTP presets', () => {
    const providers = listEmailProviders();
    const byKey = Object.fromEntries(providers.map(provider => [provider.key, provider]));

    assert.deepEqual(byKey.onecom.imap, { host: 'imap.one.com', port: 993, tls: true });
    assert.deepEqual(byKey.onecom.smtp, { host: 'send.one.com', port: 587, secure: false });
    assert.deepEqual(byKey.ovh.imap, { host: 'imap.mail.ovh.net', port: 993, tls: true });
    assert.deepEqual(byKey.ovh.smtp, { host: 'smtp.mail.ovh.net', port: 587, secure: false });
    assert.deepEqual(byKey.hostinger.smtp, { host: 'smtp.hostinger.com', port: 465, secure: true });
    assert.deepEqual(byKey.titan.imap, { host: 'imap.titan.email', port: 993, tls: true });
    assert.equal('domains' in byKey.onecom, false);
});

test('unknown and invalid addresses safely fall back to manual setup', async () => {
    assert.equal(parseEmail('not-an-email'), null);
    const invalid = await discoverEmailProvider('not-an-email', {
        resolveMx: async () => { throw new Error('should not run'); }
    });
    assert.deepEqual(invalid, { found: false, reason: 'invalid_email' });

    const unknown = await discoverEmailProvider('hello@unknown.test', {
        resolveMx: async () => [{ priority: 10, exchange: 'mx.unknown.test' }]
    });
    assert.equal(unknown.found, false);
    assert.equal(unknown.reason, 'unknown_provider');
});

test('mail account modal uses the guided auto-detection flow before manual settings', async () => {
    const root = path.resolve(__dirname, '..');
    const view = fs.readFileSync(path.join(root, 'views', 'mailbox', 'mailbox.ejs'), 'utf8');
    const script = fs.readFileSync(path.join(root, 'views', 'mailbox', 'partials', 'mail-script.ejs'), 'utf8');
    const routes = fs.readFileSync(path.join(root, 'routes', 'mailbox.router.js'), 'utf8');

    assert.match(view, /Configuration automatique/);
    assert.match(view, /Fournisseur détecté/);
    assert.match(view, /Choisir votre fournisseur/);
    assert.match(view, /Autre fournisseur/);
    assert.match(view, /One\.com/);
    assert.match(view, /Hostinger/);
    assert.match(view, /Continuer avec/);
    assert.match(view, /emailDiscovery\?\.key === 'gmail'.*'Google'.*'Microsoft'/s);
    assert.match(view, /Votre mot de passe ne transite jamais/);
    assert.match(view, /mot de passe d’application Google de 16 caractères/);
    assert.match(view, /accountSetupStep === 'credentials'/);
    assert.match(view, /accountSetupStep === 'manual'/);
    assert.match(script, /accounts\/discover/);
    assert.match(script, /discoverAccountProvider\(\)/);
    assert.match(script, /emailProviderOptions/);
    assert.match(script, /selectAccountProvider\(provider\)/);
    assert.match(script, /connectDetectedAccount\(\)/);
    assert.match(script, /mailbox\/oauth\/microsoft\/start/);
    assert.match(routes, /oauth\/google\/start', mailboxController\.startGoogleOAuth/);
    assert.match(routes, /accounts\/discover', mailboxController\.discoverProvider/);
    assert.match(routes, /oauth\/microsoft\/callback', mailboxController\.finishMicrosoftOAuth/);

    const rendered = await ejs.renderFile(path.join(root, 'views', 'mailbox', 'mailbox.ejs'), {
        account_number: '6804',
        initialMails: [],
        mailAccounts: [],
        selectedAccountId: null,
        user: { email: 'test@example.com', username: 'Test' }
    });
    for (const match of rendered.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
        if (match[1].trim()) assert.doesNotThrow(() => new Function(match[1]));
    }
});
