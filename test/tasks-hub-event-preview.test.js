const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ejs = require('ejs');

const projectRoot = path.resolve(__dirname, '..');
const viewPath = path.join(projectRoot, 'views', 'account', 'account-tasks-hub.ejs');

test('day events open an in-place preview with postpone and edit actions', async () => {
    const view = fs.readFileSync(viewPath, 'utf8');

    assert.match(view, /<template x-if="eventModalOpen">/);
    assert.match(view, /class="th-event-overlay"/);
    assert.match(view, /Aperçu de l'événement/);
    assert.match(view, /Reporter à demain/);
    assert.match(view, /Choisir une date/);
    assert.match(view, /@click="editDayEvent\(\)"/);
    assert.match(view, /async postponeDayEvent\(dateKey\)/);
    assert.match(view, /async saveDayEvent\(\)/);
    assert.match(view, /method:'PATCH'/);
    assert.match(view, /await this\.loadAgendaEvents\(\)/);

    const openMethod = view.match(/openDayEvent\(ev = \{\}\) \{([\s\S]*?)\r?\n\s*\},\r?\n\s*closeDayEvent\(\)/);
    assert.ok(openMethod, 'openDayEvent method should be present');
    assert.match(openMethod[1], /this\.eventModalOpen = true/);
    assert.doesNotMatch(openMethod[1], /window\.location|location\.href/);

    const rendered = await ejs.renderFile(viewPath, { account_number: '6804' });
    for (const match of rendered.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
        assert.doesNotThrow(() => new Function(match[1]));
    }
});
