const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
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
