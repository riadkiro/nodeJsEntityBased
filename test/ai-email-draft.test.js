const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
    createAiEmailDraft,
    normalizeRecipients,
    plainTextToHtml,
    replySubject,
} = require('../services/ai-email-draft.service');
const aiAssistant = require('../controllers/ai-assistant.controller');

function leanResult(value) {
    return {
        sort() { return this; },
        select() { return this; },
        lean: async () => value,
    };
}

function draftModels({ source = null } = {}) {
    const created = [];
    const account = {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
        email: 'owner@example.com',
        isActive: true,
        isDefault: true,
    };
    const Mail = {
        findOne(filter) {
            if (!filter) return leanResult({ id: 41 });
            if (filter.type === 'inbox') return leanResult(source);
            return leanResult(null);
        },
        async create(data) {
            created.push(data);
            return { ...data, _id: 'cccccccccccccccccccccccc' };
        },
    };
    const MailAccount = {
        findById() { return leanResult(account); },
        findOne(filter) {
            if (filter?.isDefault) return leanResult(account);
            return leanResult(account);
        },
    };
    return { Mail, MailAccount, created };
}

test('creates an AI email as a draft only and escapes its body', async () => {
    const models = draftModels();
    const result = await createAiEmailDraft({}, {
        to: 'client@example.com',
        subject: 'Compte rendu',
        body: 'Bonjour <script>alert(1)</script>\nMerci',
    }, models);

    assert.equal(result.type, 'draft');
    assert.equal(result.to, 'client@example.com');
    assert.equal(models.created.length, 1);
    assert.equal(models.created[0].type, 'draft');
    assert.equal(models.created[0].isAiDraft, true);
    assert.equal(models.created[0].to, 'client@example.com');
    assert.doesNotMatch(models.created[0].description, /<script>/i);
    assert.match(models.created[0].description, /&lt;script&gt;/);
    assert.equal(models.created[0].from, 'owner@example.com');
});

test('creates a reply draft from the matching inbox email', async () => {
    const source = {
        _id: 'bbbbbbbbbbbbbbbbbbbbbbbb',
        id: 12,
        accountId: 'aaaaaaaaaaaaaaaaaaaaaaaa',
        type: 'inbox',
        email: 'comptable@example.com',
        title: 'Documents TVA',
        description: '<p>Merci de transmettre les pièces.</p>',
    };
    const models = draftModels({ source });
    const result = await createAiEmailDraft({}, {
        mode: 'reply',
        query: 'comptable',
        body: 'Bonjour, voici les documents demandés.',
    }, models);

    assert.equal(result.type, 'draft');
    assert.equal(result.to, 'comptable@example.com');
    assert.equal(result.subject, 'Re: Documents TVA');
    assert.equal(models.created[0].sourceMailId, source._id);
    assert.match(models.created[0].description, /blockquote/);
    assert.match(models.created[0].description, /pièces/);
});

test('rejects invalid recipients and keeps helper output safe', () => {
    assert.throws(() => normalizeRecipients('pas-un-email'), /pas valide/);
    assert.equal(normalizeRecipients('Cabinet Dupont <COMPTA@example.com>'), 'compta@example.com');
    assert.equal(replySubject('Re: Bonjour'), 'Re: Bonjour');
    assert.equal(plainTextToHtml('<b>Bonjour</b>'), '&lt;b&gt;Bonjour&lt;/b&gt;');
});

test('AI draft formatting collapses excessive blank lines', () => {
    assert.equal(
        plainTextToHtml('Bonjour,\n\n\n\nNous avons reçu votre facture.\n\n\nCordialement,'),
        'Bonjour,<br><br>Nous avons reçu votre facture.<br><br>Cordialement,',
    );
});

test('system prompt authorizes drafts but explicitly forbids sending', () => {
    const prompt = aiAssistant.__test.buildSystemPrompt({ accountNumber: '6804' }, {});
    assert.match(prompt, /action `email-create`/);
    assert.match(prompt, /action `email-reply`/);
    assert.match(prompt, /Ne JAMAIS envoyer un e-mail/);
    assert.match(prompt, /l'utilisateur doit toujours ouvrir, relire et envoyer lui-même/);
});

test('home AI model selection only accepts the supported model allowlist', () => {
    const normalizeModel = aiAssistant.__test.normalizeAssistantModel;
    assert.equal(normalizeModel('gpt-5.5'), 'gpt-5.5');
    assert.equal(normalizeModel('GPT-4O'), 'gpt-4o');
    assert.equal(normalizeModel('gpt-4o-mini'), 'gpt-4o-mini');
    assert.equal(normalizeModel('untrusted-model'), 'gpt-4o-mini');
});

test('mailbox opens persisted drafts directly in the editor and saves through the draft-only endpoint', () => {
    const root = path.join(__dirname, '..');
    const routes = fs.readFileSync(path.join(root, 'routes', 'mailbox.router.js'), 'utf8');
    const script = fs.readFileSync(path.join(root, 'views', 'mailbox', 'partials', 'mail-script.ejs'), 'utf8');
    const detail = fs.readFileSync(path.join(root, 'views', 'mailbox', 'partials', 'mail-detail.ejs'), 'utf8');
    const draftService = fs.readFileSync(path.join(root, 'services', 'ai-email-draft.service.js'), 'utf8');
    assert.match(routes, /post\('\/api\/drafts', mailboxController\.saveDraft\)/);
    assert.match(script, /if \(mail\.type === 'draft'\) \{\s*this\.openMail\('draft', mail\);\s*return;/);
    assert.match(script, /mailSenderName\(mail\)/);
    assert.match(script, /mailRecipient\(mail\)/);
    assert.match(script, /this\.apiBase \+ '\/drafts'/);
    assert.match(script, /routeTabs = \{[^}]*draft: 'draft'/);
    assert.match(detail, /mailSenderName\(selectedMail\)/);
    assert.match(detail, /mailRecipient\(selectedMail\)/);
    assert.match(detail, /openMail\('draft', selectedMail\)/);
    assert.match(detail, /mailIframeDoc\(selectedMail\.description, selectedMail\.isAiDraft\)/);
    assert.match(script, /compactAiMailHtml\(rawHtml = ''\)/);
    assert.doesNotMatch(draftService, /nodemailer|sendMail\s*\(/);
});
