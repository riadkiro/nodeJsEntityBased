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

test('editing a task title survives a stale detail response and blur saves once', { timeout: 15_000 }, async (t) => {
    const browser = await puppeteer.launch({ headless: true });
    t.after(() => browser.close());

    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    const template = fs.readFileSync(partialPath, 'utf8');
    const html = ejs.render(template, { account_number: 6804 }, { filename: partialPath });
    await page.setContent(html);
    await page.addScriptTag({ content: `
        window.__titleUpdates = [];
        window.__modalUpdates = [];
        window.__delayNextUpdate = false;
        window.__taskFetchReleased = false;
        window.__taskFetchPromise = new Promise(resolve => {
            window.__releaseTaskFetch = () => {
                window.__taskFetchReleased = true;
                resolve({
                    ok: true,
                    json: async () => ({
                        success: true,
                        task: {
                            _id: '64b64c0f0000000000000001',
                            title: 'Ancien titre',
                            status: 'A faire',
                            priority: 'Normal',
                            tags: [],
                            subtasks: [],
                            attachments: [],
                            taskListId: 'list-1',
                            listLabel: 'Maison hidaya'
                        }
                    })
                });
            };
        });
        window.showMessage = () => {};
        window.fetch = async (url, options = {}) => {
            const target = String(url);
            if (target.endsWith('/api/team/members')) {
                return { ok: true, json: async () => ({ success: true, members: [], invitations: [] }) };
            }
            if ((!options.method || options.method === 'GET') && target.endsWith('/comments')) {
                return { ok: true, json: async () => ({ success: true, comments: [] }) };
            }
            if (!options.method || options.method === 'GET') return window.__taskFetchPromise;
            const body = JSON.parse(options.body || '{}');
            window.__titleUpdates.push(body);
            const current = window.Alpine.store('taskModal').task;
            const response = {
                ok: true,
                json: async () => ({ success: true, task: { ...current, ...body } })
            };
            if (!window.__delayNextUpdate) return response;
            window.__delayNextUpdate = false;
            return new Promise(resolve => {
                window.__releaseDelayedUpdate = () => resolve(response);
            });
        };
    ` });
    await page.addScriptTag({ path: editorPath });
    await page.addScriptTag({ path: alpinePath });
    await page.waitForFunction(() => Boolean(window.Alpine?.store('taskModal')));

    await page.evaluate(() => {
        const store = window.Alpine.store('taskModal');
        window.__openFinished = false;
        store.open({
            _id: '64b64c0f0000000000000001',
            title: 'Ancien titre',
            status: 'A faire',
            priority: 'Normal',
            tags: [],
            subtasks: [],
            attachments: [],
            taskListId: 'list-1',
            listLabel: 'Maison hidaya',
            createdAt: new Date().toISOString(),
        }, {
            layoutMode: 'hyperfocus',
            onUpdate: (taskId, field, value, task) => {
                window.__modalUpdates.push({ taskId, field, value, title: task.title });
            },
        }).then(() => { window.__openFinished = true; });
    });

    await page.waitForSelector('.tdm-title-input', { visible: true });
    await page.click('.tdm-title-input');
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.type('Nouveau titre');
    await page.click('.tdm-section-label');

    await page.waitForFunction(() => window.__titleUpdates.length === 1 && window.__modalUpdates.length === 1);
    await page.evaluate(() => window.__releaseTaskFetch());
    await page.waitForFunction(() => window.__openFinished === true);

    const state = await page.evaluate(() => ({
        request: window.__titleUpdates[0],
        callback: window.__modalUpdates[0],
        title: window.Alpine.store('taskModal').task.title,
        inputTitle: document.querySelector('.tdm-title-input').value,
        openModals: document.querySelectorAll('.tdm-backdrop.open').length,
    }));

    assert.deepEqual(state, {
        request: { title: 'Nouveau titre' },
        callback: {
            taskId: '64b64c0f0000000000000001',
            field: 'title',
            value: 'Nouveau titre',
            title: 'Nouveau titre',
        },
        title: 'Nouveau titre',
        inputTitle: 'Nouveau titre',
        openModals: 1,
    });

    await page.evaluate(() => { window.__delayNextUpdate = true; });
    await page.click('.tdm-title-input');
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.type('Titre avant fermeture');
    await page.click('.tdm-close');
    await page.waitForFunction(() => window.__titleUpdates.length === 2 && window.Alpine.store('taskModal').task === null);
    await page.evaluate(() => window.__releaseDelayedUpdate());
    await page.waitForFunction(() => window.__modalUpdates.length === 2);

    const closedState = await page.evaluate(() => ({
        request: window.__titleUpdates[1],
        callback: window.__modalUpdates[1],
        task: window.Alpine.store('taskModal').task,
        openModals: document.querySelectorAll('.tdm-backdrop.open').length,
    }));
    assert.deepEqual(closedState, {
        request: { title: 'Titre avant fermeture' },
        callback: {
            taskId: '64b64c0f0000000000000001',
            field: 'title',
            value: 'Titre avant fermeture',
            title: 'Titre avant fermeture',
        },
        task: null,
        openModals: 0,
    });
    assert.deepEqual(pageErrors, []);
});
