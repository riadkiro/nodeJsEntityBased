const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const puppeteer = require('puppeteer');

const projectRoot = path.resolve(__dirname, '..');

function stylesFromView(name) {
    const view = fs.readFileSync(path.join(projectRoot, 'views', 'account', name), 'utf8');
    return [...view.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(match => match[1]).join('\n');
}

test('tasks, notes and agenda share one desktop sidebar width', { timeout: 10_000 }, async (t) => {
    const mainCss = fs.readFileSync(path.join(projectRoot, 'public', 'css', 'app', 'main.css'), 'utf8');
    const styles = [
        mainCss,
        stylesFromView('account-tasks-hub.ejs'),
        stylesFromView('account-notes-hub.ejs'),
        stylesFromView('account-agenda-hub.ejs')
    ].join('\n');
    assert.match(mainCss, /--focus-sidebar-width:\s*350px/);

    const browser = await puppeteer.launch({ headless: true });
    t.after(() => browser.close());
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.setContent(`<!doctype html><html><head><style>${styles}</style></head>
        <body class="focus-workspace-mode">
            <div class="th-simple-shell"><aside class="th-nav-sidebar"></aside><main></main></div>
            <div class="nh-workspace"><aside class="nh-sidebar"></aside><main></main></div>
            <div class="ah-page"><div class="ah-body"><aside class="ah-sidebar"></aside><main class="ah-main"></main></div></div>
        </body></html>
    `);

    const widths = await page.evaluate(() => ({
        tasks: document.querySelector('.th-nav-sidebar').getBoundingClientRect().width,
        notes: document.querySelector('.nh-sidebar').getBoundingClientRect().width,
        agenda: document.querySelector('.ah-sidebar').getBoundingClientRect().width
    }));

    assert.deepEqual(widths, { tasks: 350, notes: 350, agenda: 350 });
});
