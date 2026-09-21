const test = require('node:test');
const assert = require('node:assert/strict');

const Agenda = require('../services/mobile-agenda.service');
const EventsEntity = require('../services/events-entity.service');

test('exposes the mobile date categories in the events entity', () => {
    const typeField = EventsEntity.EVENT_FIELD_DEFS.find(field => field.name === 'type_evenement');
    const options = typeField.type_config.options;
    const values = options.map(option => option.value);

    assert.deepEqual(
        values.slice(0, 8),
        ['anniversaire', 'fete', 'jour_ferie', 'reunion', 'rendez_vous', 'echeance', 'rappel', 'autre'],
    );
    assert.ok(EventsEntity.TYPE_OPTIONS.slice(0, 8).every(option => option.icon));
    const recurrenceField = EventsEntity.EVENT_FIELD_DEFS.find(
        field => field.name === 'repetition_evenement',
    );
    assert.ok(recurrenceField.type_config.options.some(
        option => option.value === 'quarterly',
    ));
});

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

test('stores the recurrence and rejects unsupported values', () => {
    const input = Agenda.normalizeAgendaInput({
        title: 'Anniversaire',
        startAt: '2030-07-24T12:00:00.000Z',
        recurrence: 'yearly',
    });
    assert.equal(input.recurrence, 'yearly');
    assert.equal(Agenda.normalizeAgendaInput({
        title: 'Réunion trimestrielle', startAt: '2030-07-24',
        recurrence: 'quarterly',
    }).recurrence, 'quarterly');
    assert.equal(Agenda.normalizeAgendaInput({
        title: 'Sans répétition', startAt: '2030-07-24',
    }).recurrence, 'none');
    assert.throws(() => Agenda.normalizeAgendaInput({
        title: 'Invalide', startAt: '2030-07-24', recurrence: 'sometimes',
    }), error => error.code === 'AGENDA_VALIDATION_ERROR');
});

test('includes old recurring sources in a bounded list query', () => {
    const filter = Agenda.agendaEventListFilter({
        _id: 'events',
        customFields: [{ _id: 'repeat-field', name: 'repetition_evenement' }],
    }, { from: '2030-01-01', to: '2030-12-31' });
    assert.equal(filter.entityId, 'events');
    assert.equal(filter.$or.length, 2);
    assert.equal(filter.$or[1].customFields.$elemMatch.field_id, 'repeat-field');
    assert.deepEqual(filter.$or[1].customFields.$elemMatch.value.$in,
        ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']);
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
            { field_id: 'repeat', value: 'monthly' },
        ],
    };
    const entity = {
        customFields: [
            { _id: 'all-day', name: 'toute_la_journee' },
            { _id: 'important', name: 'widget_date_importante' },
            { _id: 'location', name: 'lieu_evenement' },
            { _id: 'repeat', name: 'repetition_evenement' },
        ],
    };

    const serialized = Agenda.serializeAgendaEvent(event, entity);
    assert.equal(serialized.id, 'event-1');
    assert.equal(serialized.allDay, false);
    assert.equal(serialized.isImportant, true);
    assert.equal(serialized.location, 'Casablanca');
    assert.equal(serialized.recurrence, 'monthly');
});

test('serializes several agenda reminders through the shared reminder model', () => {
    const event = {
        _id: '64a000000000000000000001',
        title: 'Voyage',
        date: new Date('2030-08-10T10:00:00.000Z'),
        customFields: [],
    };
    const reminders = [
        {
            _id: '64b000000000000000000001',
            targetType: 'agenda_event',
            targetId: '64a000000000000000000001',
            scheduledAt: new Date('2030-08-03T10:00:00.000Z'),
            status: 'scheduled',
            metadata: { mode: 'notification' },
        },
        {
            _id: '64b000000000000000000002',
            targetType: 'agenda_event',
            targetId: '64a000000000000000000001',
            scheduledAt: new Date('2030-08-07T10:00:00.000Z'),
            status: 'scheduled',
            metadata: { mode: 'alarm' },
        },
    ];

    const serialized = Agenda.serializeAgendaEvent(event, {}, reminders);
    assert.equal(serialized.reminders.length, 2);
    assert.equal(serialized.reminder.id, '64b000000000000000000001');
    assert.equal(serialized.reminders[1].metadata.mode, 'alarm');
});
