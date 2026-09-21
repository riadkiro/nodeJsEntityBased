const test = require('node:test');
const assert = require('node:assert/strict');

const TaskOverview = require('../services/task-overview.service');

test('a task serialized without a loaded record has no placeholder record title', () => {
    const row = TaskOverview.serializeTaskRow(
        { account_number: '5001' },
        {
            _id: '0123456789abcdef01234567',
            title: 'Tache modifiee',
            recordId: '0123456789abcdef01234569',
            status: 'A faire',
        },
        {
            _id: '0123456789abcdef01234568',
            label: 'Liste des taches',
        },
        null,
        null,
    );

    assert.equal(row.recordTitle, '');
    assert.equal(row.listLabel, 'Liste des taches');
});

test('tomorrow in Casablanca remains the next calendar date across clock changes', () => {
    const beforeWinterShift = TaskOverview.createDateTools(
        { day: 'tomorrow', tz: 'Africa/Casablanca' },
        new Date('2026-02-14T23:30:00Z'),
    );
    assert.equal(beforeWinterShift.todayKey, '2026-02-15');
    assert.equal(beforeWinterShift.dateKey, '2026-02-16');

    const beforeSummerShift = TaskOverview.createDateTools(
        { day: 'tomorrow', tz: 'Africa/Casablanca' },
        new Date('2026-03-21T23:30:00Z'),
    );
    assert.equal(beforeSummerShift.todayKey, '2026-03-21');
    assert.equal(beforeSummerShift.dateKey, '2026-03-22');
});
