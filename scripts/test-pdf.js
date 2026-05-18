const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({headless: 'new'});
    const page = await browser.newPage();
    await page.setViewport({width: 1280, height: 1024});
    console.log('Logging in...');
    await page.goto('http://localhost:3000/auth/login');
    await page.type('input[type="email"]', 'boukirou6@hotmail.com');
    await page.type('input[type="password"]', 'test');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({waitUntil: 'networkidle0'});
    console.log('Logged in!');

    // Get the SmartDoc template URL
    console.log('Going to React Editor...');
    await page.goto('http://localhost:3000/account/5096/documents/6a0b60dc4f1758059dbb4c56/edit-react?contextFree=1&templateId=6a0b4221f1c5ddd28f737c9f', {waitUntil: 'networkidle0'});
    
    // Wait for the document to render
    await page.waitForTimeout(3000);
    
    // Read the document's content that would be sent to PDF generator!
    const htmlContent = await page.evaluate(() => {
        const canvas = document.querySelector('.bg-white.shadow-2xl')?.parentElement?.parentElement;
        if (!canvas) return 'Canvas not found';
        const clone = canvas.cloneNode(true);
        clone.querySelectorAll('[data-print-hide]').forEach(el => el.remove());
        clone.querySelectorAll('button').forEach(el => el.remove());
        clone.querySelectorAll('.mode-switcher').forEach(el => el.remove());
        return clone.innerHTML;
    });

    fs.writeFileSync(path.join(__dirname, 'react-editor-output.html'), htmlContent);
    console.log('Saved react-editor-output.html');

    // Also download the PDF via API to see the actual result
    console.log('Generating PDF via API...');
    const pdfResponse = await page.evaluate(async (html) => {
        const res = await fetch('/account/5096/api/documents/6a0b60dc4f1758059dbb4c56/pdf', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({html})
        });
        const blob = await res.blob();
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    }, htmlContent);

    const base64Data = pdfResponse.replace(/^data:application\/pdf;base64,/, "");
    fs.writeFileSync(path.join(__dirname, 'react-editor-test.pdf'), base64Data, 'base64');
    console.log('Saved react-editor-test.pdf');

    // Now let's try to get the SmartDoc one
    // We don't have the exact record URL but we know it's a template generation
    
    await browser.close();
    console.log('Done.');
})();
