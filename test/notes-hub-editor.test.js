const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ejs = require('ejs');
const puppeteer = require('puppeteer');

const projectRoot = path.resolve(__dirname, '..');
const viewPath = path.join(projectRoot, 'views', 'account', 'account-notes-hub.ejs');
const richEditorPath = path.join(projectRoot, 'public', 'js', 'rich-text-editor.js');
const alpinePath = path.join(projectRoot, 'public', 'themes', 'default', 'assets', 'js', 'alpine.min.js');

function renderHub(notes = [{
    _id: 'note-1', recordId: 'record-1', entitySlug: 'maisons',
    entityName: 'Maisons', recordTitle: 'Maison test',
    title: 'Note initiale', content: '<p>Contenu initial</p>',
    color: '#8b5cf6', createdAt: '2026-10-08T08:00:00.000Z',
    updatedAt: '2026-10-08T08:00:00.000Z'
}]) {
    const template = fs.readFileSync(viewPath, 'utf8');
    const richEditor = fs.readFileSync(richEditorPath, 'utf8');
    const alpine = fs.readFileSync(alpinePath, 'utf8');
    const rendered = ejs.render(template, { account_number: '6804', user: { _id: 'user-1' } })
        .replace('<script src="/js/rich-text-editor.js"></script>', `<script>${richEditor}</script>`);

    return `<!doctype html><html><head><meta charset="utf-8"></head><body>
        <script>
            window.__fetchCalls = [];
            window.fetch = async (url, options = {}) => {
                window.__fetchCalls.push({ url: String(url), options });
                if (String(url).endsWith('/api/notes-hub')) {
                    return new Response(JSON.stringify({
                        success: true,
                        totalNotes: ${notes.length},
                        notes: ${JSON.stringify(notes)}
                    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
                }
                if (options.method === 'PUT') {
                    const body = JSON.parse(options.body || '{}');
                    return new Response(JSON.stringify({
                        success: true,
                        note: { ...body, _id: 'note-1', updatedAt: '2026-10-08T09:00:00.000Z' }
                    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
                }
                return new Response(JSON.stringify({ success: false }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                });
            };
        </script>
        ${rendered}
        <script>${alpine}</script>
    </body></html>`;
}

test('notes hub exposes the same rich editing tools and autosaves title and content', { timeout: 20_000 }, async (t) => {
    const browser = await puppeteer.launch({ headless: true });
    t.after(() => browser.close());
    const page = await browser.newPage();
    await page.setContent(renderHub(), { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.nh-editor-content[contenteditable="true"]');
    await page.waitForFunction(() => document.querySelector('.nh-editor-content')?.textContent.includes('Contenu initial'));

    const toolbar = await page.evaluate(() => ({
        buttons: document.querySelectorAll('.nh-toolbar button').length,
        hasFormat: !!document.querySelector('[title="Format du texte"]'),
        hasImage: !!document.querySelector('[title="Insérer une image"]'),
        hasHighlight: !!document.querySelector('[title="Surlignage"]')
    }));
    assert.ok(toolbar.buttons >= 20);
    assert.equal(toolbar.hasFormat, true);
    assert.equal(toolbar.hasImage, true);
    assert.equal(toolbar.hasHighlight, true);

    await page.$eval('.nh-title-input', input => {
        input.value = 'Note modifiée';
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.$eval('.nh-editor-content', editor => {
        editor.innerHTML = '<h2>Nouveau contenu</h2><p>Texte riche</p>';
        editor.dispatchEvent(new Event('input', { bubbles: true }));
    });

    await page.waitForFunction(() => window.__fetchCalls.some(call => call.options?.method === 'PUT'), { timeout: 5000 });
    const save = await page.evaluate(() => {
        const call = window.__fetchCalls.find(item => item.options?.method === 'PUT');
        return { url: call.url, body: JSON.parse(call.options.body) };
    });

    assert.equal(save.url, '/account/6804/api/record/record-1/notes/note-1');
    assert.equal(save.body.title, 'Note modifiée');
    assert.match(save.body.content, /Nouveau contenu/);
    await page.waitForFunction(() => document.querySelector('.nh-save-status')?.textContent.includes('Sauvegardé'));
});

test('notes hub keeps protected content tokens in the autosave payload', () => {
    const view = fs.readFileSync(viewPath, 'utf8');
    assert.match(view, /payload\.contentEditToken\s*=\s*note\._contentEditToken/);
    assert.match(view, /payload\.contentBaseHash\s*=\s*note\._contentHash/);
    assert.match(view, /data\.contentIgnored/);
    assert.match(view, /verify-pin/);
});

test('switching notes immediately saves the edited note before opening the next one', { timeout: 20_000 }, async (t) => {
    const browser = await puppeteer.launch({ headless: true });
    t.after(() => browser.close());
    const page = await browser.newPage();
    const notes = [
        {
            _id: 'note-1', recordId: 'record-1', entitySlug: 'maisons', entityName: 'Maisons',
            recordTitle: 'Maison test', title: 'Première', content: '<p>Premier contenu</p>',
            createdAt: '2026-10-08T10:00:00.000Z', updatedAt: '2026-10-08T10:00:00.000Z'
        },
        {
            _id: 'note-2', recordId: 'record-2', entitySlug: 'maisons', entityName: 'Maisons',
            recordTitle: 'Autre maison', title: 'Deuxième', content: '<p>Deuxième contenu</p>',
            createdAt: '2026-10-08T09:00:00.000Z', updatedAt: '2026-10-08T09:00:00.000Z'
        }
    ];
    await page.setContent(renderHub(notes), { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelector('.nh-editor-content')?.textContent.includes('Premier contenu'));

    await page.$eval('.nh-editor-content', editor => {
        editor.innerHTML = '<p>Brouillon à conserver</p>';
        editor.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.$$eval('.nh-note-list-item', items => items[1].click());

    await page.waitForFunction(() => window.__fetchCalls.some(call => call.options?.method === 'PUT'));
    const state = await page.evaluate(() => {
        const save = window.__fetchCalls.find(call => call.options?.method === 'PUT');
        return {
            body: JSON.parse(save.options.body),
            content: document.querySelector('.nh-editor-content')?.textContent
        };
    });
    assert.match(state.body.content, /Brouillon à conserver/);
    assert.match(state.content, /Deuxième contenu/);
});
