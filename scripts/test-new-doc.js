/**
 * Test: create a new document template at /documents/new
 */
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    // Login
    await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle0', timeout: 15000 });
    await page.type('input[type="email"]', 'boukirou6@hotmail.com');
    await page.type('input[type="password"]', 'test');
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }),
        page.click('button[type="submit"]')
    ]);
    console.log('Logged in.');

    // Go to /documents/new
    console.log('Going to /documents/new...');
    await page.goto('http://localhost:3000/account/5096/documents/new', { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));

    // Check console errors
    page.on('console', msg => {
        if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
    });

    // Check what the page shows
    const pageInfo = await page.evaluate(() => {
        const island = document.querySelector('[data-island="document-editor"]');
        if (!island) return { error: 'No island found', body: document.body.innerHTML.substring(0, 1000) };
        return {
            hasIsland: true,
            mounted: island.dataset.mounted,
            isNew: island.dataset.isNew,
            documentData: island.dataset.document?.substring(0, 100),
            hasEditor: !!document.querySelector('[contenteditable="true"]'),
            pageCount: document.querySelectorAll('.bg-white.shadow-2xl').length,
            title: document.title
        };
    });
    console.log('\n=== PAGE STATE ===');
    console.log(JSON.stringify(pageInfo, null, 2));

    // Type some text
    const typed = await page.evaluate(() => {
        const editor = document.querySelector('[contenteditable="true"]');
        if (!editor) return false;
        editor.focus();
        return true;
    });
    
    if (typed) {
        await page.keyboard.type('Mon nouveau template de test');
        console.log('\nTyped text successfully.');
        
        // Wait for autosave (1 second debounce + network)
        await new Promise(r => setTimeout(r, 3000));

        // Check if save happened
        const saveResult = await page.evaluate(() => {
            const url = window.location.href;
            const island = document.querySelector('[data-island="document-editor"]');
            return {
                currentUrl: url,
                urlChanged: !url.includes('/new'),
            };
        });
        console.log('\n=== SAVE RESULT ===');
        console.log(JSON.stringify(saveResult, null, 2));
    } else {
        console.log('Could not find contenteditable!');
    }

    // Capture network requests
    await new Promise(r => setTimeout(r, 2000));

    await browser.close();
    console.log('\nDone.');
})();
