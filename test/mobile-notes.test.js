const test = require('node:test');
const assert = require('node:assert/strict');

const MobileNotes = require('../services/mobile-notes.service');
const { sortNotesByRecentActivity } = require('../services/note-recency.service');

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

test('sorts notes like the mobile list: pinned first, then latest activity', () => {
    const notes = sortNotesByRecentActivity([
        { id: 'old', createdAt: '2026-01-01T10:00:00.000Z' },
        { id: 'created', createdAt: '2026-03-01T10:00:00.000Z' },
        {
            id: 'updated',
            createdAt: '2026-01-15T10:00:00.000Z',
            updatedAt: '2026-04-01T10:00:00.000Z',
        },
        {
            id: 'pinned',
            pinned: true,
            createdAt: '2025-01-01T10:00:00.000Z',
        },
    ]);

    assert.deepEqual(notes.map(note => note.id), [
        'pinned',
        'updated',
        'created',
        'old',
    ]);
});

test('uses the creation date when a note has never been updated', () => {
    const notes = sortNotesByRecentActivity([
        { id: 'updated-old', updatedAt: '2026-02-01T10:00:00.000Z' },
        { id: 'created-new', createdAt: '2026-03-01T10:00:00.000Z' },
    ]);

    assert.deepEqual(notes.map(note => note.id), ['created-new', 'updated-old']);
});
