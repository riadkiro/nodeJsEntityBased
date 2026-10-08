const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const puppeteer = require('puppeteer');

const projectRoot = path.resolve(__dirname, '..');
const viewPath = path.join(projectRoot, 'views', 'account', 'account-tasks-hub.ejs');
const alpinePath = path.join(projectRoot, 'public', 'themes', 'default', 'assets', 'js', 'alpine.min.js');

function tasksHubScript() {
    const view = fs.readFileSync(viewPath, 'utf8');
    const alpineMarker = "document.addEventListener('alpine:init'";
    const markerPosition = view.indexOf(alpineMarker);
    assert.notEqual(markerPosition, -1, 'tasks hub Alpine script not found');
    const start = view.lastIndexOf('<script>', markerPosition);
    assert.notEqual(start, -1, 'tasks hub script tag not found');
    const contentStart = start + '<script>'.length;
    const end = view.indexOf('</script>', contentStart);
    assert.notEqual(end, -1, 'tasks hub Alpine script is not closed');
    return view.slice(contentStart, end).replaceAll('<%= account_number %>', '6804');
}

test('task completion and reorder stay local while APIs are slow', { timeout: 15_000 }, async (t) => {
    const browser = await puppeteer.launch({ headless: true });
    t.after(() => browser.close());

    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.setContent(`
        <div x-data="tasksHubApp">
            <span id="open-count" x-text="selectedOpenTasks.length"></span>
            <span id="done-count" x-text="completedSelectedTasks.length"></span>
            <div class="th-open-list">
                <div class="th-open-task-rows" data-task-widget-id="tasks-page-today">
                    <template x-for="task in selectedOpenTasks" :key="task._id">
                        <div class="th-task-row-simple" :data-task-id="task._id">
                            <button class="toggle-open th-task-check-simple" type="button" @click="toggleTaskStatus(task, $event.currentTarget)">toggle</button>
                        </div>
                    </template>
                </div>
                <form class="th-inline-form"><input aria-label="Ajouter une tâche"></form>
            </div>
            <template x-for="task in completedSelectedTasks" :key="task._id">
                <button class="toggle-done th-done-action" type="button" @click="toggleTaskStatus(task, $event.currentTarget)">done</button>
            </template>
        </div>
    `);

    await page.addScriptTag({ content: `
        window.__statusRequestStarted = false;
        window.__statusRequestResolved = false;
        window.__statusRequestCount = 0;
        window.__hubRequestCount = 0;
        window.__reorderRequestStarted = false;
        window.__reorderRequestResolved = false;
        window.__reorderTaskIds = [];
        window.fetch = async (url, options = {}) => {
            if (String(url).endsWith('/api/tasks-hub')) {
                window.__hubRequestCount += 1;
                return {
                    ok: true,
                    json: async () => ({
                        success: true,
                        priorities: [],
                        myLists: [],
                        entities: [{
                            entityId: 'entity-1',
                            entityName: 'Famille',
                            entitySlug: 'famille',
                            totalTasks: 499,
                            doneTasks: 0,
                            records: [{
                                recordId: 'record-1',
                                recordTitle: 'Espace perso',
                                entityName: 'Famille',
                                entitySlug: 'famille',
                                totalTasks: 499,
                                doneTasks: 0,
                                lists: [{ id: 'list-1', listId: 'list-1', label: 'Liste des tâches', totalTasks: 499, doneTasks: 0 }],
                                tasks: Array.from({ length: 499 }, (_, index) => ({
                                    _id: index === 0
                                        ? '64b64c0f0000000000000001'
                                        : String(index + 1).padStart(24, '0'),
                                    title: 'Tâche lente ' + index,
                                    status: 'À faire',
                                    statusColor: '#9ca3af',
                                    isDayPriority: true,
                                    listId: 'list-1',
                                    taskListId: 'list-1',
                                    createdAt: new Date().toISOString(),
                                    updatedAt: new Date().toISOString()
                                }))
                            }]
                        }]
                    })
                };
            }

            if (String(url).includes('/api/record-tasks/')) {
                window.__statusRequestStarted = true;
                window.__statusRequestCount += 1;
                await new Promise(resolve => setTimeout(resolve, 1200));
                window.__statusRequestResolved = true;
                return {
                    ok: true,
                    json: async () => ({
                        success: true,
                        task: {
                            _id: '64b64c0f0000000000000001',
                            title: 'Tâche lente',
                            status: 'Terminé',
                            statusColor: '#22c55e',
                            isDayPriority: true,
                            listId: 'list-1',
                            taskListId: 'list-1',
                            completedAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        }
                    })
                };
            }

            if (String(url).endsWith('/api/tasks-hub/reorder')) {
                window.__reorderRequestStarted = true;
                window.__reorderTaskIds = JSON.parse(options.body || '{}').taskIds || [];
                await new Promise(resolve => setTimeout(resolve, 1200));
                window.__reorderRequestResolved = true;
                return { ok: true, json: async () => ({ success: true }) };
            }

            throw new Error('Unexpected fetch: ' + url + ' ' + (options.method || 'GET'));
        };
    ` });
    await page.addScriptTag({ content: tasksHubScript() });
    await page.addScriptTag({ path: alpinePath });

    await page.waitForFunction(() => document.querySelector('#open-count')?.textContent === '499');

    const immediateState = await page.evaluate(() => {
        const root = document.querySelector('[x-data="tasksHubApp"]');
        const state = window.Alpine.$data(root);
        document.querySelector('.toggle-open').click();
        const taskId = '64b64c0f0000000000000001';
        return {
            controlPainted: document.querySelector('.toggle-open').classList.contains('is-checked'),
            controlDisabled: document.querySelector('.toggle-open').disabled,
            pending: state.findTaskById(taskId)?.task?._togglePending === true,
            localStatus: state.findTaskById(taskId)?.task?.status || null,
            requestStarted: window.__statusRequestStarted,
            requestResolved: window.__statusRequestResolved,
        };
    });

    assert.deepEqual(immediateState, {
        controlPainted: true,
        controlDisabled: true,
        pending: true,
        localStatus: 'Terminé',
        requestStarted: true,
        requestResolved: false,
    });

    const renderStartedAt = Date.now();
    await page.waitForFunction(() => {
        const root = document.querySelector('[x-data="tasksHubApp"]');
        const state = window.Alpine.$data(root);
        return window.__statusRequestStarted
            && state.findTaskById('64b64c0f0000000000000001')?.task?._togglePending === true
            && state.findTaskById('64b64c0f0000000000000001')?.task?.status === 'Terminé';
    });
    await page.waitForFunction(() => (
        document.querySelector('#open-count')?.textContent === '498'
        && document.querySelector('#done-count')?.textContent === '1'
    ));
    assert.ok(Date.now() - renderStartedAt < 750, 'optimistic completion waited for the API');
    assert.equal(await page.evaluate(() => window.__statusRequestResolved), false);

    await page.waitForFunction(() => {
        const root = document.querySelector('[x-data="tasksHubApp"]');
        const state = window.Alpine.$data(root);
        return window.__statusRequestResolved
            && !state.findTaskById('64b64c0f0000000000000001')?.task?._togglePending;
    });

    const settledState = await page.evaluate(() => {
        const root = document.querySelector('[x-data="tasksHubApp"]');
        const state = window.Alpine.$data(root);
        return {
            pending: state.findTaskById('64b64c0f0000000000000001')?.task?._togglePending || false,
            cachedStatus: state.findTaskById('64b64c0f0000000000000001')?.task?.status,
            persistedStatus: state.entities[0].records[0].tasks[0].status,
            requestCount: window.__statusRequestCount,
            nullTaskTags: state.taskTagOptions(null),
        };
    });
    assert.deepEqual(settledState, {
        pending: false,
        cachedStatus: 'Terminé',
        persistedStatus: 'Terminé',
        requestCount: 1,
        nullTaskTags: [],
    });

    const reorderImmediate = await page.evaluate(() => {
        const root = document.querySelector('[x-data="tasksHubApp"]');
        const state = window.Alpine.$data(root);
        const container = document.querySelector('.th-task-row-simple')?.parentElement;
        const rows = Array.from(container.querySelectorAll(':scope > .th-task-row-simple'));
        const moved = rows[1];
        container.insertBefore(moved, rows[0]);
        state.persistTodayOrder({
            from: container,
            to: container,
            item: moved,
            oldDraggableIndex: 1,
            newDraggableIndex: 0,
        });
        const ordered = state.selectedOpenTasks.slice(0, 2);
        const addForm = document.querySelector('.th-inline-form');
        const rowsStayAboveInput = Array.from(container.querySelectorAll(':scope > .th-task-row-simple'))
            .every(row => Boolean(row.compareDocumentPosition(addForm) & Node.DOCUMENT_POSITION_FOLLOWING));
        return {
            requestStarted: window.__reorderRequestStarted,
            requestResolved: window.__reorderRequestResolved,
            firstTaskId: state.taskId(ordered[0]),
            firstTaskOrder: ordered[0]?.order,
            secondTaskId: state.taskId(ordered[1]),
            secondTaskOrder: ordered[1]?.order,
            addFormOutsideSortable: addForm.parentElement !== container,
            rowsStayAboveInput,
            hubRequestCount: window.__hubRequestCount,
        };
    });
    assert.deepEqual(reorderImmediate, {
        requestStarted: true,
        requestResolved: false,
        firstTaskId: '000000000000000000000003',
        firstTaskOrder: 0,
        secondTaskId: '000000000000000000000002',
        secondTaskOrder: 1,
        addFormOutsideSortable: true,
        rowsStayAboveInput: true,
        hubRequestCount: 1,
    });
    await page.waitForFunction(() => window.__reorderRequestResolved);
    assert.equal(await page.evaluate(() => window.__hubRequestCount), 1, 'reorder reloaded the whole hub');
    assert.deepEqual(
        (await page.evaluate(() => window.__reorderTaskIds.slice(0, 2))),
        ['000000000000000000000003', '000000000000000000000002'],
    );

    const titlePatchState = await page.evaluate(async () => {
        window.Alpine.store('taskModal', {
            open(task, options) {
                window.__taskModalOptions = options;
            },
        });
        const root = document.querySelector('[x-data="tasksHubApp"]');
        const state = window.Alpine.$data(root);
        const taskId = '64b64c0f0000000000000001';
        const task = state.findTaskById(taskId).task;
        await state.openTask(task);
        window.__taskModalOptions.onUpdate(taskId, 'title', 'Titre mis a jour', {
            ...task,
            title: 'Titre mis a jour',
        });
        await new Promise(resolve => window.Alpine.nextTick(resolve));
        return {
            cachedTitle: state.findTaskById(taskId).task.title,
            persistedTitle: state.entities[0].records[0].tasks[0].title,
            hubRequestCount: window.__hubRequestCount,
        };
    });
    assert.deepEqual(titlePatchState, {
        cachedTitle: 'Titre mis a jour',
        persistedTitle: 'Titre mis a jour',
        hubRequestCount: 1,
    });
    assert.deepEqual(pageErrors, []);
});
