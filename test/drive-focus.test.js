const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ejs = require('ejs');
const puppeteer = require('puppeteer');

const projectRoot = path.resolve(__dirname, '..');
const viewPath = path.join(projectRoot, 'views', 'account', 'account-drive.ejs');
const partialPath = path.join(projectRoot, 'views', 'record', 'partials', 'drive-shared.ejs');

test('account Drive uses the shared focus layout with App and custom folders in its sidebar', { timeout: 10_000 }, async (t) => {
    const view = fs.readFileSync(viewPath, 'utf8');
    const partial = fs.readFileSync(partialPath, 'utf8');

    assert.doesNotMatch(view, /nav-breadcrumb/);
    assert.match(view, /focus-workspace-mode', 'drive-focus-mode/);
    assert.doesNotMatch(partial, /<!-- Global Drive Hero -->/);
    assert.match(partial, /class="drive-global-sidebar"/);
    assert.match(partial, />App</);
    assert.match(partial, />Dossiers personnalisés</);
    assert.match(partial, /recordSidebarFolders/);
    assert.match(partial, /globalLevel: '<%= driveMode === "global" \? "app-entities" : "root" %>'/);

    const globalHtml = await ejs.renderFile(viewPath, { account_number: '6804' });
    assert.match(globalHtml, /<aside class="drive-global-sidebar"/);
    assert.match(globalHtml, /<main class="drive-global-content"/);
    assert.doesNotMatch(globalHtml, /drive-hero">/);
    for (const match of globalHtml.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
        assert.doesNotThrow(() => new Function(match[1]));
    }

    const recordHtml = await ejs.renderFile(partialPath, {
        driveMode: 'record',
        account_number: '6804',
        entity: { _id: 'entity', name: 'Maisons', icon: '', color: '', slug: 'maisons' },
        record: { _id: 'record', title: 'Villa' },
        workspaceRole: 'owner'
    });
    assert.doesNotMatch(recordHtml, /<aside class="drive-global-sidebar"/);

    const styles = [view, partial]
        .flatMap(source => [...source.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(match => match[1]))
        .join('\n');
    const browser = await puppeteer.launch({ headless: true });
    t.after(() => browser.close());
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.setContent(`
        <style>${styles}</style>
        <div class="account-drive-page">
            <div class="drive-global-workspace">
                <aside class="drive-global-sidebar"></aside>
                <main class="drive-global-content"></main>
            </div>
        </div>
    `);

    const layout = await page.evaluate(() => {
        const pageBox = document.querySelector('.account-drive-page').getBoundingClientRect();
        const workspace = document.querySelector('.drive-global-workspace').getBoundingClientRect();
        const sidebar = document.querySelector('.drive-global-sidebar').getBoundingClientRect();
        return {
            pageHeight: pageBox.height,
            workspaceHeight: workspace.height,
            sidebarHeight: sidebar.height,
            sidebarWidth: sidebar.width,
            columns: getComputedStyle(document.querySelector('.drive-global-workspace')).gridTemplateColumns,
            sidebarBackground: getComputedStyle(document.querySelector('.drive-global-sidebar')).backgroundColor
        };
    });

    assert.equal(layout.pageHeight, 814);
    assert.equal(layout.workspaceHeight, 814);
    assert.equal(layout.sidebarHeight, 812);
    assert.equal(layout.sidebarWidth, 350);
    assert.match(layout.columns, /^350px /);
    assert.equal(layout.sidebarBackground, 'rgb(255, 255, 255)');
});
