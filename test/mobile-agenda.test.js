const test = require('node:test');
const assert = require('node:assert/strict');

const Agenda = require('../services/mobile-agenda.service');

test('normalizes an all-day important date', () => {
    const input = Agenda.normalizeAgendaInput({
        title: 'Anniversaire maman',
        dateKey: '2030-07-24',
        allDay: true,
        isImportant: true,
        type: 'personnel',
        tags: ['Famille', 'famille', 'Important'],
    });

    assert.equal(input.title, 'Anniversaire maman');
    assert.equal(input.allDay, true);
    assert.equal(input.isImportant, true);
    assert.equal(input.dateKey, '2030-07-24');
    assert.equal(input.startAt.toISOString(), '2030-07-24T12:00:00.000Z');
    assert.deepEqual(input.tags, ['Famille', 'Important']);
});

test('rejects an end before the start', () => {
    assert.throws(
        () => Agenda.normalizeAgendaInput({
            title: 'Reunion',
            startAt: '2030-07-24T15:00:00.000Z',
            endAt: '2030-07-24T14:00:00.000Z',
        }),
        error => error.code === 'AGENDA_END_BEFORE_START',
    );
});

test('serializes existing event entity fields for mobile', () => {
    const event = {
        _id: 'event-1',
        title: 'Controle technique',
        date: new Date('2030-07-27T10:00:00.000Z'),
        customFields: [
            { field_id: 'all-day', value: false },
            { field_id: 'important', value: true },
            { field_id: 'location', value: 'Casablanca' },
        ],
    };
    const entity = {
        customFields: [
            { _id: 'all-day', name: 'toute_la_journee' },
            { _id: 'important', name: 'widget_date_importante' },
            { _id: 'location', name: 'lieu_evenement' },
        ],
    };

    const serialized = Agenda.serializeAgendaEvent(event, entity);
    assert.equal(serialized.id, 'event-1');
    assert.equal(serialized.allDay, false);
    assert.equal(serialized.isImportant, true);
    assert.equal(serialized.location, 'Casablanca');
});
