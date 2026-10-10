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
const { MASKED_MAIL_PASSWORD, mailAccountForClient } = require('../services/mail-account-client.service');

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

test('saved account settings remain available to Configure without exposing passwords', () => {
    const account = mailAccountForClient({
        _id: 'mail-account-id',
        name: 'Commercial Belgique',
        email: 'contact@da-clean.be',
        authType: 'password',
        imap: { host: 'imap.one.com', port: 993, user: 'contact@da-clean.be', password: 'secret', tls: true },
        smtp: { host: 'send.one.com', port: 587, user: 'contact@da-clean.be', password: 'secret', secure: false }
    });

    assert.equal(account.name, 'Commercial Belgique');
    assert.equal(account.imap.host, 'imap.one.com');
    assert.equal(account.imap.user, 'contact@da-clean.be');
    assert.equal(account.smtp.host, 'send.one.com');
    assert.equal(account.smtp.port, 587);
    assert.equal(account.imap.password, MASKED_MAIL_PASSWORD);
    assert.equal(account.smtp.password, MASKED_MAIL_PASSWORD);
    assert.doesNotMatch(JSON.stringify(account), /secret/);
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
    const controller = fs.readFileSync(path.join(root, 'controllers', 'mailbox.controller.js'), 'utf8');

    assert.match(view, /Configuration automatique/);
    assert.match(view, /Fournisseur détecté/);
    assert.match(view, /Choisir votre fournisseur/);
    assert.match(view, /Autre fournisseur/);
    assert.match(view, /One\.com/);
    assert.match(view, /Hostinger/);
    assert.match(view, /Nom du compte \*/);
    assert.match(view, /x-model="editingAccount\.name"/);
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
    assert.doesNotMatch(script, /editingAccount\.name = provider\.name/);
    assert.match(script, /this\.mailAccounts = data\.accounts/);
    assert.match(script, /accountId: this\.editingAccount\._id/);
    assert.match(script, /connectDetectedAccount\(\)/);
    assert.match(script, /mailbox\/oauth\/microsoft\/start/);
    assert.match(routes, /oauth\/google\/start', mailboxController\.startGoogleOAuth/);
    assert.match(routes, /accounts\/discover', mailboxController\.discoverProvider/);
    assert.match(routes, /oauth\/microsoft\/callback', mailboxController\.finishMicrosoftOAuth/);
    assert.match(controller, /accounts\.map\(mailAccountForClient\)/);

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
