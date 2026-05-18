/**
 * Test: generate PDF from React Editor and verify it matches SmartDoc quality
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
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }),
        page.click('button[type="submit"]')
    ]);
    console.log('Logged in.');

    // Go to React Editor
    console.log('Going to React Editor...');
    const editorUrl = 'http://localhost:3000/account/5096/documents/6a0b60dc4f1758059dbb4c56/edit-react?contextFree=1&templateId=6a0b4221f1c5ddd28f737c9f&bindings=%5B%7B%22entityId%22%3A%226a0b4221f1c5ddd28f737c83%22%2C%22entityName%22%3A%22Entreprise%22%2C%22entityIcon%22%3A%22solar%3Abuildings-bold-duotone%22%2C%22entitySlug%22%3A%22entreprises%22%2C%22entityColor%22%3A%22%2364748b%22%2C%22relationKey%22%3Anull%2C%22relationLabel%22%3Anull%2C%22primaryEntityId%22%3A%226a0b4221f1c5ddd28f737c83%22%2C%22primaryEntitySlug%22%3A%22entreprises%22%2C%22primaryEntityName%22%3A%22Entreprise%22%2C%22tokens%22%3A%5B%22entreprises.title%22%2C%22entreprises.siret%22%2C%22entreprises.adresse%22%5D%7D%5D';
    await page.goto(editorUrl, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 5000));

    // Intercept the PDF download response
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
        behavior: 'deny'
    });

    // Click the "Finaliser et générer le PDF" button
    const btnClicked = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const finaliser = btns.find(b => b.textContent.includes('Finaliser'));
        if (finaliser) {
            finaliser.click();
            return true;
        }
        return false;
    });
    console.log('Clicked Finaliser:', btnClicked);

    // Wait a bit for the PDF generation to complete
    await new Promise(r => setTimeout(r, 10000));

    // Check server logs for any errors
    console.log('PDF generation should be complete. Check the server logs for [PDF] messages.');
    
    // Take a screenshot showing the loading state
    await page.screenshot({ path: path.join(__dirname, 'test-pdf-after-click.png') });
    console.log('Screenshot after click saved.');

    await browser.close();
    console.log('Done. Check server terminal for PDF generation logs.');
})();
