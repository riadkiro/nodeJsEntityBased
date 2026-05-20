const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function run() {
    const filePath = 'c:\\Users\\pc\\Documents\\nodeJsProject\\views\\document\\document-generate.ejs';
    const originalContent = fs.readFileSync(filePath, 'utf8');

    // Temp replace style block to have no styles at all
    const cleanedContent = originalContent.replace(/<style>[\s\S]*?<\/style>/, '');
    fs.writeFileSync(filePath, cleanedContent, 'utf8');
    console.log('Temporarily removed style block to test flexbox impact...');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    try {
        await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle2' });
        await page.waitForSelector('input[name="email"]');
        await page.type('input[name="email"]', 'boukirou6@hotmail.com');
        await page.type('input[name="password"]', 'test');
        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2' })
        ]);

        await page.goto('http://localhost:3000/account/5096/documents/6a0cc32c8582f628068fa250/generate', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 3000));

        const layout = await page.evaluate(() => {
            const container = document.querySelector('.main-container');
            const mainContent = document.querySelector('.main-content');
            return {
                containerTop: container.getBoundingClientRect().top,
                mainContentTop: mainContent.getBoundingClientRect().top
            };
        });

        console.log('LAYOUT WITHOUT FLEX OVERRIDES:', layout);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await browser.close();
        // Restore original content
        fs.writeFileSync(filePath, originalContent, 'utf8');
        console.log('Restored original document-generate.ejs content.');
    }
}

run();
