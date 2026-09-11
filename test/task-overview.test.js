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
