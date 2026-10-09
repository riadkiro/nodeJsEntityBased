const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ejs = require('ejs');
const puppeteer = require('puppeteer');

const projectRoot = path.resolve(__dirname, '..');
const viewPath = path.join(projectRoot, 'views', 'account', 'account-tasks-hub.ejs');

test('task workspace keeps white list rows and aligned headers', { timeout: 10_000 }, async (t) => {
    const browser = await puppeteer.launch({ headless: true });
    t.after(() => browser.close());
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

    const view = fs.readFileSync(viewPath, 'utf8');
	assert.match(view, /layoutMode:\s*'hyperfocus'/);
    assert.match(view, /await Promise\.all\(\[this\.loadHub\(\), this\.loadAgendaEvents\(\)\]\)/);
    assert.match(view, /get selectedDayEvents\(\)/);
    assert.match(view, /return 'Événements du jour'/);
    assert.ok(view.indexOf('class="th-open-task-rows"') < view.indexOf('class="th-day-events"'));
    assert.ok(view.indexOf('class="th-day-events"') < view.indexOf('class="th-task-composer"'));
    const styles = [...view.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(match => match[1]).join('\n');
    await page.setContent(`
        <style>${styles}</style>
        <div class="th-wrap th-simple">
            <div class="th-simple-shell">
                <aside class="th-nav-sidebar">
                    <div class="th-nav-header"><span>Tâches</span></div>
                    <div class="th-nav-list">
                        <button class="th-nav-item active"><span></span><span>Tâches du jour</span><span></span></button>
                        <div class="th-nav-section-head">Mes listes</div>
                        <button class="th-nav-item"><span></span><span>Amélioration App</span><span></span></button>
                    </div>
                </aside>
                <main class="th-detail-pane">
                    <div class="th-detail-scroll">
                        <div class="th-simple-grid">
                            <div class="th-center">
                                <section class="th-today-card">
                                    <div class="th-today-header">Tâches du jour</div>
                                    <div class="th-today-body">Contenu</div>
                                </section>
                            </div>
                            <aside class="th-side-stack"></aside>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    `);

    const layout = await page.evaluate(() => {
        const navHeader = document.querySelector('.th-nav-header').getBoundingClientRect();
        const taskHeader = document.querySelector('.th-today-header').getBoundingClientRect();
        const listRow = document.querySelector('.th-nav-item:not(.active)');
        const list = document.querySelector('.th-nav-list');
        const section = document.querySelector('.th-nav-section-head');
        return {
            navHeight: navHeader.height,
            taskHeight: taskHeader.height,
            bottomDelta: Math.abs(navHeader.bottom - taskHeader.bottom),
            listBackground: getComputedStyle(list).backgroundColor,
            rowBackground: getComputedStyle(listRow).backgroundColor,
            sectionBackground: getComputedStyle(section).backgroundColor,
            taskBorder: getComputedStyle(document.querySelector('.th-today-header')).borderBottomWidth,
        };
    });

    assert.deepEqual(layout, {
        navHeight: 64,
        taskHeight: 64,
        bottomDelta: 0,
        listBackground: 'rgb(255, 255, 255)',
        rowBackground: 'rgb(255, 255, 255)',
        sectionBackground: 'rgb(255, 255, 255)',
        taskBorder: '1px',
    });
});

test('task composers stay docked at the bottom with a WhatsApp-style send control', { timeout: 10_000 }, async (t) => {
    const browser = await puppeteer.launch({ headless: true });
    t.after(() => browser.close());
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

    const view = fs.readFileSync(viewPath, 'utf8');
    assert.equal((view.match(/class="th-task-composer"/g) || []).length, 2);
    assert.match(view, /solar:plain-2-bold/);
    const rendered = await ejs.renderFile(viewPath, { account_number: '6804' });
    for (const match of rendered.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
        assert.doesNotThrow(() => new Function(match[1]));
    }
    const styles = [...view.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(match => match[1]).join('\n');
    await page.setContent(`
        <style>${styles}</style>
        <div class="th-list-view" style="width:1000px;height:600px">
            <section class="th-list-task-card">
                <div class="th-list-task-head">Liste</div>
                <div class="th-list-panel-body">
                    <div class="th-list-open">
                        <div class="th-list-task-rows">
                            <div class="th-task-row-simple"><span></span><span>Tâche</span><span></span></div>
                        </div>
                        <div class="th-task-composer">
                            <form class="th-inline-form"><input placeholder="Ajouter"><button type="button">+</button></form>
                        </div>
                    </div>
                    <aside class="th-completed"></aside>
                </div>
            </section>
        </div>
    `);

    const layout = await page.evaluate(() => {
        const card = document.querySelector('.th-list-task-card').getBoundingClientRect();
        const composerElement = document.querySelector('.th-task-composer');
        const composer = composerElement.getBoundingClientRect();
        const rows = document.querySelector('.th-list-task-rows').getBoundingClientRect();
        const input = document.querySelector('.th-inline-form input').getBoundingClientRect();
        const button = document.querySelector('.th-inline-form button').getBoundingClientRect();
        const composerStyle = getComputedStyle(composerElement);
        const buttonStyle = getComputedStyle(document.querySelector('.th-inline-form button'));
        return {
            bottomDelta: Math.abs(card.bottom - composer.bottom),
            rowsEndAtComposer: Math.abs(rows.bottom - composer.top),
            inputHeight: input.height,
            buttonWidth: button.width,
            buttonHeight: button.height,
            buttonRadius: buttonStyle.borderRadius,
            buttonBackground: buttonStyle.backgroundColor,
            composerBorder: composerStyle.borderTopWidth,
            composerShadow: composerStyle.boxShadow
        };
    });

    assert.equal(layout.bottomDelta, 0);
    assert.equal(layout.rowsEndAtComposer, 0);
    assert.equal(layout.inputHeight, 42);
    assert.equal(layout.buttonWidth, 42);
    assert.equal(layout.buttonHeight, 42);
    assert.equal(layout.buttonRadius, '50%');
    assert.notEqual(layout.buttonBackground, 'rgba(0, 0, 0, 0)');
    assert.equal(layout.composerBorder, '1px');
    assert.notEqual(layout.composerShadow, 'none');
});
