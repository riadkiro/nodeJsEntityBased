const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
    MailboxSendError,
    normalizeAttachments,
    sendMailboxMail,
    transporterOptions,
} = require('../services/mailbox-send.service');

function account() {
    return {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
        name: 'Bureau',
        email: 'owner@example.com',
        authType: 'password',
        isActive: true,
        smtp: { host: 'smtp.example.com', port: 587, user: 'owner@example.com', password: 'secret', secure: false },
        imap: {},
    };
}

function modelsForDraft(draft) {
    return {
        Mail: {
            async findOne(filter) {
                if (filter?.type === 'draft') return draft;
                throw new Error('Unexpected Mail.findOne query');
            },
        },
        MailAccount: {
            async findById() { return account(); },
        },
    };
}

test('sends an existing draft through SMTP before moving it to Sent', async () => {
    const calls = [];
    let saveCount = 0;
    const draft = {
        id: 100,
        type: 'draft',
        accountId: 'aaaaaaaaaaaaaaaaaaaaaaaa',
        async save() { saveCount += 1; },
        toObject() { return { ...this }; },
    };
    const models = modelsForDraft(draft);
    const result = await sendMailboxMail({}, {
        id: 100,
        accountId: account()._id,
        to: 'Client <client@example.com>',
        cc: 'copy@example.com',
        title: 'Test SMTP',
        description: '<p>Bonjour client</p>',
    }, {
        ...models,
        createTransport(options) {
            calls.push({ options });
            return {
                async sendMail(message) {
                    calls.push({ message });
                    return { accepted: ['client@example.com'], rejected: [], messageId: '<message@example.com>' };
                },
                close() {},
            };
        },
    });

    assert.equal(calls[0].options.host, 'smtp.example.com');
    assert.deepEqual(calls[0].options.auth, { user: 'owner@example.com', pass: 'secret' });
    assert.equal(calls[1].message.to, 'client@example.com');
    assert.equal(calls[1].message.cc, 'copy@example.com');
    assert.equal(saveCount, 1);
    assert.equal(draft.type, 'sent_mail');
    assert.equal(draft.to, 'client@example.com');
    assert.equal(result.mail.messageId, '<message@example.com>');
});

test('keeps the draft untouched when SMTP rejects the send', async () => {
    let saveCount = 0;
    const draft = {
        id: 101,
        type: 'draft',
        accountId: 'aaaaaaaaaaaaaaaaaaaaaaaa',
        async save() { saveCount += 1; },
        toObject() { return { ...this }; },
    };
    const models = modelsForDraft(draft);

    await assert.rejects(() => sendMailboxMail({}, {
        id: 101,
        accountId: account()._id,
        to: 'client@example.com',
        title: 'Échec',
        description: '<p>Message</p>',
    }, {
        ...models,
        createTransport() {
            return {
                async sendMail() { const error = new Error('Authentication failed'); error.code = 'EAUTH'; throw error; },
                close() {},
            };
        },
    }), error => error instanceof MailboxSendError && error.code === 'SMTP_AUTH_FAILED');

    assert.equal(saveCount, 0);
    assert.equal(draft.type, 'draft');
});

test('builds OAuth2 SMTP auth without exposing or requiring a password', async () => {
    const oauthAccount = {
        ...account(),
        authType: 'oauth2',
        smtp: { host: 'smtp.gmail.com', port: 465, user: 'owner@gmail.com', password: '', secure: true },
        oauth: { provider: 'google' },
    };
    const options = await transporterOptions(oauthAccount, {
        google: { async getValidAccessToken() { return 'access-token'; } },
    });
    assert.deepEqual(options.auth, { type: 'OAuth2', user: 'owner@gmail.com', accessToken: 'access-token' });
    assert.equal(options.secure, true);
});

test('validates attachment content and size before SMTP', () => {
    const files = normalizeAttachments([{
        name: 'document.txt',
        mimeType: 'text/plain',
        content: `data:text/plain;base64,${Buffer.from('bonjour').toString('base64')}`,
    }]);
    assert.equal(files[0].filename, 'document.txt');
    assert.equal(files[0].content.toString('utf8'), 'bonjour');
    assert.throws(() => normalizeAttachments([{ name: 'perdu.pdf' }]), /Ajoutez de nouveau/);
});

test('mail compose uses compact rows and the real send endpoint', () => {
    const root = path.join(__dirname, '..');
    const compose = fs.readFileSync(path.join(root, 'views', 'mailbox', 'partials', 'mail-compose.ejs'), 'utf8');
    const script = fs.readFileSync(path.join(root, 'views', 'mailbox', 'partials', 'mail-script.ejs'), 'utf8');
    const list = fs.readFileSync(path.join(root, 'views', 'mailbox', 'partials', 'mail-list.ejs'), 'utf8');
    assert.match(compose, /md:grid-cols-2/);
    assert.match(compose, /Ajouter une pièce jointe/);
    assert.match(compose, /showComposeOptions/);
    assert.match(script, /this\.apiBase \+ '\/send'/);
    assert.match(script, /mailDisplayName\(mail\)/);
    assert.match(list, /mailDisplayName\(mail\)/);
});
