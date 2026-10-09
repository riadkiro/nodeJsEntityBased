const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const puppeteer = require('puppeteer');

const projectRoot = path.resolve(__dirname, '..');
const viewPath = path.join(projectRoot, 'views', 'account', 'account-tasks-hub.ejs');

test('normal task style uses clean cards while compact uses subtle mobile separators', { timeout: 10_000 }, async (t) => {
    const browser = await puppeteer.launch({ headless: true });
    t.after(() => browser.close());
    const page = await browser.newPage();

    const view = fs.readFileSync(viewPath, 'utf8');
    const styles = [...view.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(match => match[1]).join('\n');
    await page.setContent(`
        <style>${styles}</style>
        <div class="th-today-body">
            <div class="th-open-task-rows">
                <div id="today-normal" class="th-task-row-simple is-accented">
                    <button class="th-task-check-simple"></button><span class="th-task-title-simple">Tache normale</span><span></span>
                </div>
            </div>
        </div>
        <div class="th-list-panel-body">
            <div class="th-list-task-rows">
                <div id="list-normal" class="th-task-row-simple">
                    <button class="th-task-check-simple"></button><span class="th-task-title-simple">Tache de liste</span><span></span>
                </div>
            </div>
        </div>
        <div class="th-today-body is-compact">
            <div class="th-open-task-rows">
                <div id="today-compact" class="th-task-row-simple is-accented" style="--task-accent-color:#f97316">
                    <button class="th-task-check-simple"></button><span class="th-task-title-simple">Tache compacte</span><span></span>
                </div>
            </div>
        </div>
        <div class="th-today-body">
            <div class="th-day-events-list">
                <button id="event-normal" class="th-day-event-card"><span class="th-day-event-copy"><span class="th-day-event-name">Film</span><span class="th-day-event-meta">Toute la journée</span></span><span class="th-day-event-badge">Événement</span><span></span></button>
            </div>
        </div>
        <div class="th-today-body is-compact">
            <div class="th-day-events-list">
                <button id="event-compact" class="th-day-event-card"><span class="th-day-event-copy"><span class="th-day-event-name">Film</span><span class="th-day-event-meta">Toute la journée</span></span><span class="th-day-event-badge">Événement</span><span></span></button>
            </div>
        </div>
    `);

    const result = await page.evaluate(() => {
        const read = (selector) => {
            const element = document.querySelector(selector);
            const style = getComputedStyle(element);
            const accent = getComputedStyle(element, '::before');
            return {
                height: element.getBoundingClientRect().height,
                background: style.backgroundColor,
                backgroundImage: style.backgroundImage,
                borderWidth: style.borderTopWidth,
                borderColor: style.borderTopColor,
                borderBottomWidth: style.borderBottomWidth,
                radius: style.borderRadius,
                shadow: style.boxShadow,
                accent: {
                    height: accent.height,
                    left: accent.left,
                    radius: accent.borderRadius,
                },
            };
        };
        return {
            todayNormal: read('#today-normal'),
            listNormal: read('#list-normal'),
            todayCompact: read('#today-compact'),
            eventNormal: read('#event-normal'),
            eventCompact: read('#event-compact'),
            compactEventBadge: getComputedStyle(document.querySelector('#event-compact .th-day-event-badge')).display,
        };
    });

    for (const card of [result.todayNormal, result.listNormal]) {
        assert.equal(card.height, 50);
        assert.equal(card.borderWidth, '1px');
        assert.equal(card.borderColor, 'rgb(240, 243, 248)');
        assert.equal(card.radius, '12px');
        assert.notEqual(card.shadow, 'none');
    }
    assert.notEqual(result.todayNormal.background, 'rgb(255, 255, 255)');
    assert.equal(result.todayNormal.accent.height, '22px');
    assert.equal(result.todayNormal.accent.left, '6px');
    assert.equal(result.listNormal.background, 'rgb(255, 255, 255)');
    assert.equal(result.todayCompact.height, 24);
    assert.equal(result.todayCompact.borderWidth, '0px');
    assert.equal(result.todayCompact.borderBottomWidth, '1px');
    assert.equal(result.todayCompact.radius, '0px');
    assert.notEqual(result.todayCompact.backgroundImage, 'none');
    assert.equal(result.todayCompact.shadow, 'none');
    assert.equal(result.todayCompact.accent.height, '16px');
    assert.equal(result.todayCompact.accent.left, '4px');
    assert.equal(result.todayCompact.accent.radius, '999px');
    assert.equal(result.eventNormal.height, 50);
    assert.equal(result.eventNormal.borderWidth, '1px');
    assert.equal(result.eventNormal.borderColor, 'rgb(240, 243, 248)');
    assert.equal(result.eventNormal.radius, '12px');
    assert.notEqual(result.eventNormal.shadow, 'none');
    assert.equal(result.eventCompact.borderWidth, '0px');
    assert.equal(result.eventCompact.borderBottomWidth, '1px');
    assert.equal(result.eventCompact.radius, '0px');
    assert.equal(result.eventCompact.shadow, 'none');
    assert.equal(result.compactEventBadge, 'none');
    assert.doesNotMatch(view, /class="th-day-event-date"/);
});
