/**
 * Diagnostic: capture the HTML that React Editor sends to the PDF generator
 * and compare with the SmartDoc structure
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1024 });

    // Login
    console.log('Logging in...');
    await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle0', timeout: 15000 });
    await page.type('input[type="email"]', 'boukirou6@hotmail.com');
    await page.type('input[type="password"]', 'test');
    
    // Click submit and wait for navigation simultaneously
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }),
        page.click('button[type="submit"]')
    ]);
    console.log('Logged in. URL:', page.url());

    // Go to the React Editor context-free page
    console.log('Going to React Editor...');
    const editorUrl = 'http://localhost:3000/account/5096/documents/6a0b60dc4f1758059dbb4c56/edit-react?contextFree=1&templateId=6a0b4221f1c5ddd28f737c9f&bindings=%5B%7B%22entityId%22%3A%226a0b4221f1c5ddd28f737c83%22%2C%22entityName%22%3A%22Entreprise%22%2C%22entityIcon%22%3A%22solar%3Abuildings-bold-duotone%22%2C%22entitySlug%22%3A%22entreprises%22%2C%22entityColor%22%3A%22%2364748b%22%2C%22relationKey%22%3Anull%2C%22relationLabel%22%3Anull%2C%22primaryEntityId%22%3A%226a0b4221f1c5ddd28f737c83%22%2C%22primaryEntitySlug%22%3A%22entreprises%22%2C%22primaryEntityName%22%3A%22Entreprise%22%2C%22tokens%22%3A%5B%22entreprises.title%22%2C%22entreprises.siret%22%2C%22entreprises.adresse%22%5D%7D%5D';
    await page.goto(editorUrl, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Wait for the React island to render
    await new Promise(r => setTimeout(r, 5000));
    
    // Screenshot the editor
    await page.screenshot({ path: path.join(__dirname, 'diag-editor-preview.png'), fullPage: true });
    console.log('Editor screenshot saved.');

    // Extract the HTML that would be sent to PDF generator
    const editorHtml = await page.evaluate(() => {
        const pages = document.querySelectorAll('.bg-white.shadow-2xl');
        if (pages.length === 0) return { error: 'No pages found', body: document.body.innerHTML.substring(0, 1000) };
        
        // Find the scrollable container with all pages
        const parent = pages[0].parentElement;
        const clone = parent.cloneNode(true);
        clone.querySelectorAll('[data-print-hide]').forEach(el => el.remove());
        clone.querySelectorAll('button').forEach(el => el.remove());
        clone.querySelectorAll('.mode-switcher').forEach(el => el.remove());
        
        // Get the structure of the first page
        const firstPage = pages[0];
        const pageInfo = {
            classList: Array.from(firstPage.classList),
            style: firstPage.getAttribute('style'),
            childrenCount: firstPage.children.length,
            children: Array.from(firstPage.children).map(c => ({
                tag: c.tagName,
                classList: Array.from(c.classList),
                style: (c.getAttribute('style') || '').substring(0, 300),
                contentLength: c.innerHTML.length
            }))
        };
        
        return { 
            html: clone.innerHTML, 
            pageCount: pages.length,
            firstPageInfo: pageInfo,
            firstPageHTML: firstPage.outerHTML.substring(0, 3000)
        };
    });

    if (editorHtml.error) {
        console.error('ERROR:', editorHtml.error);
        console.log('Body snippet:', editorHtml.body);
    } else {
        fs.writeFileSync(path.join(__dirname, 'diag-editor-html.html'), editorHtml.html, 'utf8');
        console.log(`\nEditor HTML saved (${editorHtml.pageCount} pages, ${editorHtml.html.length} chars).`);
        console.log('\n=== FIRST PAGE STRUCTURE ===');
        console.log(JSON.stringify(editorHtml.firstPageInfo, null, 2));
        console.log('\n=== FIRST PAGE HTML (first 3000 chars) ===');
        console.log(editorHtml.firstPageHTML);
    }

    await browser.close();
    console.log('\nDone.');
})();
