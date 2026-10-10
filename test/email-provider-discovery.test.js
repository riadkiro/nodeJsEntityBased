const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ejs = require('ejs');

const {
    parseEmail,
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
    assert.deepEqual(gmail.provider.imap, { host: 'imap.gmail.com', port: 993, tls: true });
    assert.equal(gmail.provider.smtp.host, 'smtp.gmail.com');

    const hotmail = await discoverEmailProvider('hello@hotmail.fr', { resolveMx });
    assert.equal(hotmail.provider.name, 'Outlook / Hotmail');
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
    assert.match(view, /accountSetupStep === 'credentials'/);
    assert.match(view, /accountSetupStep === 'manual'/);
    assert.match(script, /accounts\/discover/);
    assert.match(script, /discoverAccountProvider\(\)/);
    assert.match(script, /connectDetectedAccount\(\)/);
    assert.match(routes, /accounts\/discover', mailboxController\.discoverProvider/);

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
