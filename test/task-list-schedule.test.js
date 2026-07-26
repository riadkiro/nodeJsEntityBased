const test = require('node:test');
const assert = require('node:assert/strict');

const TaskListsService = require('../services/task-lists.service');

test('a list keeps new tasks undated when day mode is disabled', () => {
    const schedule = TaskListsService.taskListScheduleDefaults({
        displayOptions: { dayMode: false },
    });

    assert.deepEqual(schedule, {
        isDayPriority: false,
        startDate: null,
        dueDate: null,
    });
});

test('a day-mode list automatically schedules a new task for today', () => {
    const schedule = TaskListsService.taskListScheduleDefaults({
        displayOptions: { dayMode: true },
    }, {
        timeZone: 'Africa/Casablanca',
    });

    assert.equal(schedule.isDayPriority, true);
    assert.match(schedule.startDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(schedule.dueDate, null);
});

test('an explicit task date takes precedence over the list day mode', () => {
    const dueDate = new Date('2030-03-20T10:00:00.000Z');
    const schedule = TaskListsService.taskListScheduleDefaults({
        displayOptions: { dayMode: true },
    }, {
        dueDate,
    });

    assert.equal(schedule.isDayPriority, false);
    assert.equal(schedule.startDate, null);
    assert.equal(schedule.dueDate, dueDate);
});
