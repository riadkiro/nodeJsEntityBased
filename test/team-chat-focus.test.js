const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const puppeteer = require('puppeteer');

const projectRoot = path.resolve(__dirname, '..');
const viewPath = path.join(projectRoot, 'views', 'account', 'account-team-chat.ejs');
const teamCssPath = path.join(projectRoot, 'public', 'css', 'app', 'team-system.css');

test('team chat removes the decorative header and fills the focus workspace', { timeout: 10_000 }, async (t) => {
    const view = fs.readFileSync(viewPath, 'utf8');
    assert.doesNotMatch(view, /<div class="ts-page-header">/);
    assert.match(view, /focus-workspace-mode', 'chat-focus-mode/);
    assert.match(view, /class="ts-chat-page"/);

    const inlineStyles = [...view.matchAll(/<style>([\s\S]*?)<\/style>/g)]
        .map(match => match[1])
        .join('\n');
    const teamCss = fs.readFileSync(teamCssPath, 'utf8');
    const browser = await puppeteer.launch({ headless: true });
    t.after(() => browser.close());
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.setContent(`
        <style>${teamCss}\n${inlineStyles}</style>
        <div class="ts-chat-page">
            <div class="ts-chat-layout">
                <aside class="ts-chat-sidebar"></aside>
                <main class="ts-chat-main"></main>
            </div>
        </div>
    `);

    const layout = await page.evaluate(() => {
        const pageBox = document.querySelector('.ts-chat-page').getBoundingClientRect();
        const chatBox = document.querySelector('.ts-chat-layout').getBoundingClientRect();
        return {
            pageHeight: pageBox.height,
            chatHeight: chatBox.height,
            columns: getComputedStyle(document.querySelector('.ts-chat-layout')).gridTemplateColumns,
            maxHeight: getComputedStyle(document.querySelector('.ts-chat-layout')).maxHeight
        };
    });

    assert.equal(layout.pageHeight, 814);
    assert.equal(layout.chatHeight, 814);
    assert.match(layout.columns, /260px/);
    assert.equal(layout.maxHeight, 'none');
});
