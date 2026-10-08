const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ejs = require('ejs');
const puppeteer = require('puppeteer');

const projectRoot = path.resolve(__dirname, '..');
const partialPath = path.join(projectRoot, 'views', 'partials', 'task-detail-modal.ejs');
const alpinePath = path.join(projectRoot, 'public', 'themes', 'default', 'assets', 'js', 'alpine.min.js');
const editorPath = path.join(projectRoot, 'public', 'js', 'rich-text-editor.js');

test('task modal exposes a two-by-two quick action grid and keeps Today membership in sync', { timeout: 20_000 }, async (t) => {
    const browser = await puppeteer.launch({ headless: true });
    t.after(() => browser.close());

    const page = await browser.newPage();
    page.setDefaultTimeout(5_000);
    await page.setViewport({ width: 1280, height: 860, deviceScaleFactor: 1 });
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    const template = fs.readFileSync(partialPath, 'utf8');
    const html = ejs.render(template, { account_number: 6804 }, { filename: partialPath });
    await page.setContent(html);
    await page.addScriptTag({ content: `
        window.__taskUpdates = [];
        window.showMessage = () => {};
        window.fetch = async (url, options = {}) => {
            if (String(url).endsWith('/api/team/members')) {
                return { ok: true, json: async () => ({ success: true, members: [], invitations: [] }) };
            }
            if (!options.method || options.method === 'GET') {
                if (String(url).endsWith('/comments')) {
                    return { ok: true, json: async () => ({ success: true, comments: [] }) };
                }
                return {
                    ok: true,
                    json: async () => ({ success: true, task: { ...window.Alpine.store('taskModal').task } }),
                };
            }
            const body = JSON.parse(options.body || '{}');
            window.__taskUpdates.push(body);
            const current = window.Alpine.store('taskModal').task;
            return { ok: true, json: async () => ({ success: true, task: { ...current, ...body } }) };
        };
    ` });
    await page.addScriptTag({ path: editorPath });
    await page.addScriptTag({ path: alpinePath });

    await page.waitForFunction(() => Boolean(window.Alpine?.store('taskModal')));
    await page.evaluate(async () => {
        await window.Alpine.store('taskModal').open({
            _id: '64b64c0f0000000000000001',
            title: 'Préparer le dossier',
            status: 'À faire',
            priority: 'Normal',
            tags: [],
            subtasks: [],
            attachments: [],
            taskListId: 'list-1',
            listLabel: 'Maison hidaya',
            startDate: null,
            dueDate: null,
            assignedTo: '',
            isDayPriority: false,
            createdAt: new Date().toISOString(),
        });
    });

    await page.waitForSelector('.tdm-quick-action.is-today');
    const paletteAndLabels = await page.evaluate(() => {
        const modal = document.querySelector('.tdm-modal');
        const styles = getComputedStyle(modal);
        const actions = Array.from(document.querySelectorAll('.tdm-quick-action'));
        const positions = actions.map(action => action.getBoundingClientRect());
        return {
            brand: styles.getPropertyValue('--tdm-brand').trim(),
            surface: styles.getPropertyValue('--tdm-surface').trim(),
            actions: Array.from(document.querySelectorAll('.tdm-quick-action-label')).map(node => node.textContent.trim()),
            twoColumns: /^repeat\(2,/.test(getComputedStyle(document.querySelector('.tdm-quick-actions')).gridTemplateColumns)
                || getComputedStyle(document.querySelector('.tdm-quick-actions')).gridTemplateColumns.split(' ').length === 2,
            firstRowAligned: Math.abs(positions[0].top - positions[1].top) < 1,
            secondRowAligned: Math.abs(positions[2].top - positions[3].top) < 1,
            rowHeightsEqual: Math.abs(positions[0].height - positions[1].height) < 1
                && Math.abs(positions[2].height - positions[3].height) < 1,
        };
    });
    assert.deepEqual(paletteAndLabels, {
        brand: '#634EFB',
        surface: '#FFFFFF',
        actions: ['Faire aujourd’hui', 'Reporter', 'Assigner', 'Rappel'],
        twoColumns: true,
        firstRowAligned: true,
        secondRowAligned: true,
        rowHeightsEqual: true,
    });

    await page.click('.tdm-quick-action.is-today');
    await page.waitForFunction(() => window.__taskUpdates.length === 1);
    const todayState = await page.evaluate(() => {
        const store = window.Alpine.store('taskModal');
        return { request: window.__taskUpdates[0], expected: store.localDayKey(0), active: store.isScheduledForDay(0) };
    });
    assert.deepEqual(todayState.request, { startDate: todayState.expected, isDayPriority: true });
    assert.equal(todayState.active, true);

    await page.waitForFunction(() => document.querySelector('.tdm-quick-action.is-today .tdm-quick-action-label')?.textContent.trim() === 'Retirer d’aujourd’hui');
    await page.click('.tdm-quick-action.is-today');
    await page.waitForFunction(() => window.__taskUpdates.length === 2);
    const removedState = await page.evaluate(() => {
        const store = window.Alpine.store('taskModal');
        return {
            request: window.__taskUpdates[1],
            active: store.isScheduledForDay(0),
            taskListId: store.task.taskListId,
            retention: store.todayRetentionLabel(),
        };
    });
    assert.deepEqual(removedState.request, { isDayPriority: false, startDate: null });
    assert.equal(removedState.active, false);
    assert.equal(removedState.taskListId, 'list-1');
    assert.equal(removedState.retention, 'Reste dans Maison hidaya');

    await page.click('.tdm-quick-action.is-schedule');
    await page.waitForFunction(() => window.Alpine.store('taskModal').scheduleMenu === true);
    await page.click('[data-schedule-tomorrow]');
    await page.waitForFunction(() => window.__taskUpdates.length === 3);
    const tomorrowState = await page.evaluate(() => {
        const store = window.Alpine.store('taskModal');
        return { request: window.__taskUpdates[2], expected: store.localDayKey(1), active: store.isScheduledForDay(1) };
    });
    assert.deepEqual(tomorrowState.request, { startDate: tomorrowState.expected, isDayPriority: false });
    assert.equal(tomorrowState.active, true);

    await page.click('.tdm-quick-action.is-schedule');
    await page.waitForFunction(() => window.Alpine.store('taskModal').scheduleMenu === true);
    await page.$eval('#tdm-schedule-custom-date', input => {
        input.value = '2030-01-15';
        input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForFunction(() => window.__taskUpdates.length === 4);
    const customDateRequest = await page.evaluate(() => window.__taskUpdates[3]);
    assert.deepEqual(customDateRequest, { startDate: '2030-01-15', isDayPriority: false });

    await page.evaluate(async () => {
        const store = window.Alpine.store('taskModal');
        store.task.startDate = store.localDayKey(0);
        store.task.isDayPriority = true;
        await store.updateTaskDatePart('startDate', 'date', '');
    });
    await page.waitForFunction(() => window.__taskUpdates.length === 5);
    const clearDateState = await page.evaluate(() => ({
        request: window.__taskUpdates[4],
        active: window.Alpine.store('taskModal').isScheduledForDay(0),
    }));
    assert.deepEqual(clearDateState.request, { startDate: null, isDayPriority: false });
    assert.equal(clearDateState.active, false);
    await page.waitForSelector('.tdm-quick-action-wrap:nth-child(2) .tdm-quick-popover', { hidden: true });

    if (process.env.TASK_MODAL_SCREENSHOT) {
        await page.screenshot({ path: process.env.TASK_MODAL_SCREENSHOT, fullPage: true });
    }
    await page.click('.tdm-quick-action.is-assign');
    await page.waitForFunction(() => window.Alpine.store('taskModal').assignMenu === true);
    await page.click('.tdm-quick-action.is-reminder');
    await page.waitForFunction(() => window.Alpine.store('taskModal').reminderMenu === true);
    const reminderState = await page.evaluate(() => {
        const store = window.Alpine.store('taskModal');
        store.task.listLabel = '';
        return {
            assignClosed: store.assignMenu === false,
            date: store.reminderDraft.date,
            time: store.reminderDraft.time,
            fallbackRetention: store.todayRetentionLabel(),
        };
    });
    assert.equal(reminderState.assignClosed, true);
    assert.match(reminderState.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(reminderState.time, /^\d{2}:\d{2}$/);
    assert.equal(reminderState.fallbackRetention, 'Reste dans Liste des tâches');
    assert.deepEqual(pageErrors, []);
});
