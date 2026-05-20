const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function run() {
    console.log('=== STARTING WIZARD CONSOLE DEBUG ===');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // Capture console messages
    page.on('console', msg => {
        console.log(`[BROWSER CONSOLE] [${msg.type()}] ${msg.text()}`);
    });

    // Capture page errors
    page.on('pageerror', err => {
        console.log('[BROWSER ERROR]', err.message, err.stack);
    });

    // Capture failed requests
    page.on('requestfailed', request => {
        console.log(`[REQUEST FAILED] ${request.url()} - ${request.failure()?.errorText}`);
    });

    try {
        console.log('Navigating to login page...');
        await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle2' });
        
        console.log('Entering credentials...');
        await page.waitForSelector('input[name="email"]');
        await page.type('input[name="email"]', 'boukirou6@hotmail.com');
        await page.type('input[name="password"]', 'test');
        
        console.log('Submitting login...');
        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2' })
        ]);
        console.log('Logged in successfully!');

        console.log('Navigating to generation wizard...');
        await page.goto('http://localhost:3000/account/5096/documents/6a0cc32c8582f628068fa250/generate', { waitUntil: 'networkidle2' });
        
        console.log('Waiting for wizard to render (5 seconds)...');
        await new Promise(r => setTimeout(r, 5000));

        console.log('Taking a diagnostic screenshot...');
        const artifactDir = 'C:\\Users\\pc\\.gemini\\antigravity\\brain\\86f93efc-12db-4081-8233-7a854733cf75';
        await page.screenshot({ path: path.join(artifactDir, 'wizard_debug_screenshot.png') });
        console.log('Screenshot saved to wizard_debug_screenshot.png');

        console.log('Done!');
    } catch (err) {
        console.error('Error during execution:', err);
    } finally {
        await browser.close();
    }
}

run();
