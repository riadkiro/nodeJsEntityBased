const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ejs = require('ejs');
const puppeteer = require('puppeteer');

const projectRoot = path.resolve(__dirname, '..');
const viewPath = path.join(projectRoot, 'views', 'account', 'account-agenda-hub.ejs');

test('agenda removes its full-width header and fills the focus workspace', { timeout: 10_000 }, async (t) => {
    const view = fs.readFileSync(viewPath, 'utf8');
    assert.doesNotMatch(view, /<div class="ah-topbar">/);
    assert.match(view, /focus-workspace-mode', 'agenda-focus-mode/);
    assert.match(view, /class="ah-sidebar-title"/);
    assert.match(view, /title="Calendrier"/);
    assert.match(view, /title="Liste"/);
    assert.match(view, /class="ah-upcoming-sidebar"/);
    assert.match(view, /x-for="ev in upcomingEvents"/);
    assert.match(view, /class="ah-upcoming-delay" x-text="relativeDayBadge\(ev\.date\)"/);
    assert.ok(view.indexOf('class="ah-sidebar"') < view.indexOf('class="ah-upcoming-sidebar"'));
    assert.ok(view.indexOf('class="ah-upcoming-sidebar"') < view.indexOf('class="ah-main"'));
    assert.match(view, /syncCalendarToolbarButtons\(\)/);
    assert.match(view, /datesSet:\s*\(\)\s*=>\s*self\.syncCalendarToolbarButtons\(\)/);
    assert.match(view, /style\.setProperty\('-webkit-text-fill-color',\s*color,\s*'important'\)/);
    const rendered = await ejs.renderFile(viewPath, { account_number: '6804' });
    for (const match of rendered.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
        assert.doesNotThrow(() => new Function(match[1]));
    }

    const styles = [...view.matchAll(/<style>([\s\S]*?)<\/style>/g)]
        .map(match => match[1])
        .join('\n');
    const browser = await puppeteer.launch({ headless: true });
    t.after(() => browser.close());
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.setContent(`
        <style>${styles}</style>
        <div class="ah-page">
            <div class="ah-body">
                <aside class="ah-sidebar"></aside>
                <aside class="ah-upcoming-sidebar"></aside>
                <main class="ah-main"></main>
            </div>
        </div>
    `);

    const layout = await page.evaluate(() => {
        const root = document.querySelector('.ah-page').getBoundingClientRect();
        const body = document.querySelector('.ah-body').getBoundingClientRect();
        const sidebar = document.querySelector('.ah-sidebar').getBoundingClientRect();
        const upcoming = document.querySelector('.ah-upcoming-sidebar').getBoundingClientRect();
        return {
            rootHeight: root.height,
            bodyHeight: body.height,
            sidebarHeight: sidebar.height,
            sidebarWidth: sidebar.width,
            upcomingHeight: upcoming.height,
            upcomingWidth: upcoming.width,
            overflow: getComputedStyle(document.querySelector('.ah-page')).overflow
        };
    });

    assert.deepEqual(layout, {
        rootHeight: 814,
        bodyHeight: 812,
        sidebarHeight: 812,
        sidebarWidth: 350,
        upcomingHeight: 812,
        upcomingWidth: 320,
        overflow: 'hidden'
    });
});
