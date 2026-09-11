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

test('an explicit mobile opt-out overrides a legacy day-mode list', () => {
    const schedule = TaskListsService.taskListScheduleDefaults({
        displayOptions: { dayMode: true },
    }, {
        isDayPriority: false,
        timeZone: 'Africa/Casablanca',
    });

    assert.deepEqual(schedule, {
        isDayPriority: false,
        startDate: null,
        dueDate: null,
    });
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

test('a new list task is placed after the highest existing order', async () => {
    const calls = {};
    const query = {
        select(value) {
            calls.select = value;
            return this;
        },
        sort(value) {
            calls.sort = value;
            return this;
        },
        async lean() {
            return { order: 7 };
        },
    };
    const RecordTask = {
        findOne(filter) {
            calls.filter = filter;
            return query;
        },
    };

    const order = await TaskListsService.nextTaskOrder(RecordTask, 'list-1');

    assert.equal(order, 8);
    assert.deepEqual(calls.filter, { taskListId: 'list-1' });
    assert.equal(calls.select, 'order');
    assert.deepEqual(calls.sort, { order: -1, createdAt: -1 });
});

test('the first task in a list starts at order zero', async () => {
    const query = {
        select() { return this; },
        sort() { return this; },
        async lean() { return null; },
    };
    const RecordTask = { findOne: () => query };

    assert.equal(await TaskListsService.nextTaskOrder(RecordTask, 'list-1'), 0);
});
