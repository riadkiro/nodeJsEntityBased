const assert = require('node:assert/strict');
const test = require('node:test');

const aiAssistant = require('../controllers/ai-assistant.controller');

const {
    buildEmailContext,
    buildEmailSearchFilter,
    emailSearchTerms,
} = aiAssistant.__test;

function fakeMailModel(documents = []) {
    return {
        find(query) {
            const matches = documents.filter(document => {
                if (query.type && document.type !== query.type) return false;
                if (query.isUnread !== undefined && document.isUnread !== query.isUnread) return false;
                if (!query.$or) return true;
                return query.$or.some(condition => {
                    const [field, matcher] = Object.entries(condition)[0];
                    return new RegExp(matcher.$regex, matcher.$options).test(String(document[field] || ''));
                });
            });
            return {
                sort() { return this; },
                limit(limit) { this.result = matches.slice(0, limit); return this; },
                async lean() { return this.result || matches; },
            };
        },
        async countDocuments(query) {
            return documents.filter(document => !query.type || document.type === query.type).length;
        },
    };
}

test('email search treats AI-generated OR synonyms as independent safe terms', () => {
    assert.deepEqual(
        emailSearchTerms('comptable OR comptabilité OR expert-comptable'),
        ['comptable', 'comptabilité', 'expert-comptable']
    );

    const filter = buildEmailSearchFilter('bureau comptable');
    const patterns = filter.$or.map(condition => Object.values(condition)[0].$regex);
    assert.ok(patterns.includes('bureau comptable'));
    assert.ok(patterns.includes('bureau'));
    assert.ok(patterns.includes('comptable'));
    assert.ok(filter.$or.some(condition => condition.description));
});

test('email search finds an accountant message in the tenant mailbox model', async () => {
    const mailModel = fakeMailModel([
        {
            _id: '507f1f77bcf86cd799439011',
            type: 'inbox',
            email: 'bureau@example.be',
            firstName: 'Bureau',
            lastName: 'Comptable',
            title: 'Documents pour la clôture',
            description: '<p>Merci de nous envoyer les factures du trimestre.</p>',
            date: new Date('2026-10-10T10:00:00Z'),
            isUnread: true,
        },
    ]);

    const context = await buildEmailContext({}, {
        searchQuery: 'comptable OR comptabilité OR expert-comptable',
        type: 'inbox',
        mailModel,
    });

    assert.equal(context.error, undefined);
    assert.equal(context.resultCount, 1);
    assert.equal(context.emails[0].from, 'Bureau Comptable');
    assert.equal(context.emails[0].subject, 'Documents pour la clôture');
});

test('email search can match text present only in the full email body', async () => {
    const mailModel = fakeMailModel([
        {
            _id: '507f1f77bcf86cd799439012',
            type: 'inbox',
            email: 'contact@example.be',
            title: 'Votre dossier',
            description: '<p>Votre expert-comptable confirme avoir reçu les documents.</p>',
            date: new Date('2026-10-09T10:00:00Z'),
        },
    ]);

    const context = await buildEmailContext({}, {
        searchQuery: 'expert-comptable',
        mailModel,
    });

    assert.equal(context.resultCount, 1);
    assert.match(context.emails[0].preview, /expert-comptable/);
});
