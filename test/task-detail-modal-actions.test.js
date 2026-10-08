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

test('task modal uses the mobile palette and exposes quick scheduling actions', { timeout: 15_000 }, async (t) => {
    const browser = await puppeteer.launch({ headless: true });
    t.after(() => browser.close());

    const page = await browser.newPage();
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
            const body = JSON.parse(options.body || '{}');
            window.__taskUpdates.push(body);
            const current = window.Alpine.store('taskModal').task;
            return { ok: true, json: async () => ({ success: true, task: { ...current, ...body } }) };
        };
    ` });
    await page.addScriptTag({ path: editorPath });
    await page.addScriptTag({ path: alpinePath });

    await page.waitForFunction(() => Boolean(window.Alpine?.store('taskModal')));
    await page.evaluate(() => {
        window.Alpine.store('taskModal').task = {
            _id: '64b64c0f0000000000000001',
            title: 'Préparer le dossier',
            status: 'À faire',
            priority: 'Normal',
            tags: [],
            subtasks: [],
            attachments: [],
            listLabel: 'Liste des tâches',
            startDate: null,
            dueDate: null,
            assignedTo: '',
            isDayPriority: false,
            createdAt: new Date().toISOString(),
            _comments: [],
        };
    });

    await page.waitForSelector('.tdm-quick-action.is-today');
    const paletteAndLabels = await page.evaluate(() => {
        const modal = document.querySelector('.tdm-modal');
        const styles = getComputedStyle(modal);
        return {
            brand: styles.getPropertyValue('--tdm-brand').trim(),
            surface: styles.getPropertyValue('--tdm-surface').trim(),
            actions: Array.from(document.querySelectorAll('.tdm-quick-action-label')).map(node => node.textContent.trim()),
        };
    });
    assert.deepEqual(paletteAndLabels, {
        brand: '#634EFB',
        surface: '#FFFFFF',
        actions: ['Faire aujourd’hui', 'Reporter à demain', 'Assigner'],
    });

    await page.click('.tdm-quick-action.is-today');
    await page.waitForFunction(() => window.__taskUpdates.length === 1);
    const todayState = await page.evaluate(() => {
        const store = window.Alpine.store('taskModal');
        return { request: window.__taskUpdates[0], expected: store.localDayKey(0), active: store.isScheduledForDay(0) };
    });
    assert.deepEqual(todayState.request, { startDate: todayState.expected, isDayPriority: true });
    assert.equal(todayState.active, true);

    await page.click('.tdm-quick-action.is-tomorrow');
    await page.waitForFunction(() => window.__taskUpdates.length === 2);
    const tomorrowState = await page.evaluate(() => {
        const store = window.Alpine.store('taskModal');
        return { request: window.__taskUpdates[1], expected: store.localDayKey(1), active: store.isScheduledForDay(1) };
    });
    assert.deepEqual(tomorrowState.request, { startDate: tomorrowState.expected, isDayPriority: false });
    assert.equal(tomorrowState.active, true);

    if (process.env.TASK_MODAL_SCREENSHOT) {
        await page.screenshot({ path: process.env.TASK_MODAL_SCREENSHOT, fullPage: true });
    }
    await page.click('.tdm-quick-action.is-assign');
    await page.waitForFunction(() => window.Alpine.store('taskModal').assignMenu === true);
    assert.deepEqual(pageErrors, []);
});
