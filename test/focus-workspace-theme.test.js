const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const puppeteer = require('puppeteer');

const projectRoot = path.resolve(__dirname, '..');

function stylesFromView(name) {
    const view = fs.readFileSync(path.join(projectRoot, 'views', 'account', name), 'utf8');
    return [...view.matchAll(/<style>([\s\S]*?)<\/style>/g)]
        .map(match => match[1])
        .join('\n');
}

test('tasks, notes and agenda use the Flutter focus palette and button language', { timeout: 10_000 }, async (t) => {
    const mainCss = fs.readFileSync(path.join(projectRoot, 'public', 'css', 'app', 'main.css'), 'utf8');
    assert.match(mainCss, /--focus-brand:\s*#634efb/);
    assert.match(mainCss, /--focus-brand-soft:\s*#ebe8ff/);
    assert.match(mainCss, /--focus-page:\s*#fcfcfd/);
    assert.match(mainCss, /--focus-border:\s*#e5e7eb/);

    const styles = [
        mainCss,
        stylesFromView('account-tasks-hub.ejs'),
        stylesFromView('account-notes-hub.ejs'),
        stylesFromView('account-agenda-hub.ejs')
    ].join('\n');

    const browser = await puppeteer.launch({ headless: true });
    t.after(() => browser.close());
    const page = await browser.newPage();
    await page.setContent(`<!doctype html><html><head><style>${styles}</style></head>
        <body class="focus-workspace-mode">
            <button class="th-nav-item active">Tâche</button>
            <button class="nh-note-list-item nh-note-list-item--active">Note</button>
            <button class="ah-sidebar-all active">Agenda</button>
            <button class="th-list-btn primary">Enregistrer</button>
            <button class="nh-inline-insert">Insérer</button>
            <button class="ah-modal-btn ah-modal-btn-primary">Modifier</button>
            <div class="nh-sidebar"><div class="nh-sidebar-list"></div></div>
            <div class="ah-sidebar"><div class="ah-sidebar-body"></div></div>
            <div class="ah-calendar-container"><div class="fc"><h2 class="fc-toolbar-title">octobre 2026</h2><button class="fc-button fc-button-primary">Mois</button><button class="fc-button fc-button-primary fc-button-active">Jour</button></div></div>
        </body></html>`);

    const visual = await page.evaluate(() => {
        const color = selector => getComputedStyle(document.querySelector(selector)).color;
        const background = selector => getComputedStyle(document.querySelector(selector)).backgroundColor;
        return {
            brand: getComputedStyle(document.body).getPropertyValue('--focus-brand').trim(),
            taskActive: background('.th-nav-item.active'),
            noteActive: background('.nh-note-list-item--active'),
            agendaActive: background('.ah-sidebar-all.active'),
            taskButton: background('.th-list-btn.primary'),
            noteButton: background('.nh-inline-insert'),
            agendaButton: background('.ah-modal-btn-primary'),
            noteSidebar: background('.nh-sidebar'),
            agendaSidebar: background('.ah-sidebar'),
            calendarButton: background('.ah-calendar-container .fc-button:not(.fc-button-active)'),
            calendarButtonText: color('.ah-calendar-container .fc-button:not(.fc-button-active)'),
            calendarActiveButton: background('.ah-calendar-container .fc-button-active'),
            calendarTitleTransform: getComputedStyle(document.querySelector('.fc-toolbar-title')).textTransform,
            taskButtonText: color('.th-list-btn.primary'),
            noteButtonText: color('.nh-inline-insert'),
            agendaButtonText: color('.ah-modal-btn-primary')
        };
    });

    assert.deepEqual(visual, {
        brand: '#634efb',
        taskActive: 'rgb(235, 232, 255)',
        noteActive: 'rgb(235, 232, 255)',
        agendaActive: 'rgb(235, 232, 255)',
        taskButton: 'rgb(99, 78, 251)',
        noteButton: 'rgb(99, 78, 251)',
        agendaButton: 'rgb(99, 78, 251)',
        noteSidebar: 'rgb(255, 255, 255)',
        agendaSidebar: 'rgb(255, 255, 255)',
        calendarButton: 'rgb(255, 255, 255)',
        calendarButtonText: 'rgb(99, 78, 251)',
        calendarActiveButton: 'rgb(99, 78, 251)',
        calendarTitleTransform: 'capitalize',
        taskButtonText: 'rgb(255, 255, 255)',
        noteButtonText: 'rgb(255, 255, 255)',
        agendaButtonText: 'rgb(255, 255, 255)'
    });
});
