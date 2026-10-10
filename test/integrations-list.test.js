const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ejs = require('ejs');

const {
    getProviderLogo,
    withProviderPresentation
} = require('../src/integrations/provider-presentation');

const projectRoot = path.resolve(__dirname, '..');
const viewPath = path.join(projectRoot, 'views', 'integrations', 'tenant', 'integrations-list.ejs');
const mailboxScriptPath = path.join(projectRoot, 'views', 'mailbox', 'partials', 'mail-script.ejs');

test('OpenAI and App integrations always use reliable local logos', () => {
    assert.equal(getProviderLogo({ key: 'openai', logo: 'https://openai.com/favicon.ico' }), '/logos/ChatGPT-Logo.png');
    assert.equal(getProviderLogo({ key: 'app', logo: '⚡' }), '/assets/images/logo.svg');
    assert.equal(getProviderLogo({ key: 'google', logo: '/google.svg' }), '/google.svg');

    const presented = withProviderPresentation({ key: 'openai', name: 'OpenAI' });
    assert.equal(presented.logo, '/logos/ChatGPT-Logo.png');
    assert.equal(presented.name, 'OpenAI');
});

test('integrations page includes email connection and corrected provider logos', async () => {
    const integrations = [
        withProviderPresentation({ key: 'openai', name: 'OpenAI', category: 'AI', isConnected: true, credentialSource: 'platform' }),
        withProviderPresentation({ key: 'app', name: 'App (Internal)', category: 'internal', isConnected: false })
    ];
    const rendered = await ejs.renderFile(viewPath, {
        account_number: '6804',
        integrations,
        emailIntegration: {
            name: 'E-mails',
            category: 'Communication',
            description: 'Connectez Gmail, Outlook ou toute boite compatible IMAP/SMTP.',
            accountCount: 0,
            isConnected: false,
            href: '/account/6804/mailbox/inbox?connect=1'
        }
    });

    assert.match(rendered, /E-mails/);
    assert.match(rendered, /Gmail, Outlook/);
    assert.match(rendered, /\/account\/6804\/mailbox\/inbox\?connect=1/);
    assert.match(rendered, /\/logos\/ChatGPT-Logo\.png/);
    assert.match(rendered, /\/assets\/images\/logo\.svg/);
    assert.match(rendered, /Offert par DexApp/);
});

test('email connection link opens the existing mailbox account setup', () => {
    const mailboxScript = fs.readFileSync(mailboxScriptPath, 'utf8');
    assert.match(mailboxScript, /mailboxParams\.get\('connect'\) === '1'/);
    assert.match(mailboxScript, /this\.openAccountModal\(\)/);
});
