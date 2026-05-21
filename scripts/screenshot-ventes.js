const puppeteer = require('puppeteer');
const path = require('path');

async function run() {
    console.log('Starting screenshot diagnostic...');
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    // Login
    await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle2' });
    await page.type('input[name="email"]', 'boukirou6@hotmail.com');
    await page.type('input[name="password"]', 'test');
    await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);
    
    // Go to Factures/Ventes
    const url = 'http://localhost:3000/account/5096/drive/Factures/Ventes';
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const screenshotPath = path.join(__dirname, '../screenshots/factures-ventes-debug.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    console.log('Screenshot saved to', screenshotPath);
    await browser.close();
}

run().catch(e => console.error('Fatal:', e));
