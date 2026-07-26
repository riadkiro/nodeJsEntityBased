const test = require('node:test');
const assert = require('node:assert/strict');

const MobileNotes = require('../services/mobile-notes.service');

test('redacts protected note content from mobile lists', () => {
    const note = MobileNotes.serializeMobileNote({
        _id: 'note-1',
        recordId: 'record-1',
        title: 'Codes importants',
        content: '<p>Contenu secret</p>',
        isProtected: true,
        pinned: true,
    }, {
        recordTitle: 'Voiture',
        entityName: 'Dossiers',
    });

    assert.equal(note.content, '');
    assert.equal(note.contentLocked, true);
    assert.equal(note.isProtected, true);
    assert.equal(note.recordTitle, 'Voiture');
});

test('returns protected content only after the biometric flow', () => {
    const note = MobileNotes.serializeMobileNote({
        _id: 'note-2',
        recordId: 'record-1',
        title: 'Privé',
        content: '<p>Secret</p>',
        isProtected: true,
    }, {}, true);

    assert.equal(note.content, '<p>Secret</p>');
    assert.equal(note.contentLocked, false);
});

test('keeps regular note content available', () => {
    const note = MobileNotes.serializeMobileNote({
        _id: 'note-3',
        recordId: 'record-1',
        content: '<p>Texte public</p>',
        isProtected: false,
    });

    assert.equal(note.content, '<p>Texte public</p>');
    assert.equal(note.contentLocked, false);
});
