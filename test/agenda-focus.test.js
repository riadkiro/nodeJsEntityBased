const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ejs = require('ejs');
const puppeteer = require('puppeteer');

const projectRoot = path.resolve(__dirname, '..');
const viewPath = path.join(projectRoot, 'views', 'account', 'account-agenda-hub.ejs');
const tasksViewPath = path.join(projectRoot, 'views', 'account', 'account-tasks-hub.ejs');
const accountRoutesPath = path.join(projectRoot, 'routes', 'routes-inc-account.js');

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
    assert.match(view, /class="ah-new-event-btn"/);
    assert.match(view, /<template x-if="eventModalOpen">/);
    assert.match(view, /async saveEvent\(\)/);
    assert.match(view, /async deleteEvent\(\)/);
    assert.match(view, /dateClick:\s*\(info\)\s*=>\s*\{\s*self\.openCreateEvent\(info\.dateStr\)/);
    assert.match(view, /api\/agenda-hub\/events/);
    assert.match(view, /:type="eventForm\.allDay \? 'date' : 'datetime-local'"/);
    assert.match(view, /@change="setAllDay\(\$event\.target\.checked\)"/);
    assert.match(view, /if \(allDay\) payload\.dateKey = startKey/);
    assert.match(view, /Toute la journée/);
    assert.match(view, /allDaySlot:\s*true/);
    assert.match(view, /allDayText:\s*'Toute la journée'/);
    assert.match(view, /start:\s*startKey/);
    assert.match(view, /end:\s*inclusiveEndKey \? this\.nextDateKey\(inclusiveEndKey\) : undefined/);
    assert.ok(view.indexOf('class="ah-sidebar"') < view.indexOf('class="ah-main"'));
    assert.ok(view.indexOf('class="ah-main"') < view.indexOf('class="ah-upcoming-sidebar"'));
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
                <main class="ah-main"></main>
                <aside class="ah-upcoming-sidebar"></aside>
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

test('all-day agenda events never expose a fake hour in the tasks workspace', () => {
    const tasksView = fs.readFileSync(tasksViewPath, 'utf8');
    assert.match(tasksView, /x-text="formatEventTime\(ev\)"/);
    assert.match(tasksView, /agendaFieldValue\(ev, 'toute_la_journee'\)/);
    assert.match(tasksView, /if \(allDay\) return 'Toute la journée'/);
});

test('agenda hub exposes account CRUD endpoints for create, edit and delete', () => {
    const routes = fs.readFileSync(accountRoutesPath, 'utf8');
    assert.match(routes, /router\.post\("\/api\/agenda-hub\/events"/);
    assert.match(routes, /router\.patch\("\/api\/agenda-hub\/events\/:eventId"/);
    assert.match(routes, /router\.delete\("\/api\/agenda-hub\/events\/:eventId"/);
    assert.match(routes, /MobileAgendaService\.createAgendaEvent/);
    assert.match(routes, /MobileAgendaService\.updateAgendaEvent/);
});
