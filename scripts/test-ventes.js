const puppeteer = require('puppeteer');

async function run() {
    console.log('Starting diagnostic for Factures/Ventes...');
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    let loopCount = 0;
    
    page.on('console', msg => {
        const text = msg.text();
        console.log(`[BROWSER ${msg.type().toUpperCase()}]`, text);
        if (text.includes('loadGlobalFolderFiles') || text.includes('fetch')) loopCount++;
    });

    page.on('pageerror', err => {
        console.error('[BROWSER ERROR]', err.message);
    });

    // Login
    console.log('Logging in...');
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
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 }).catch(e => console.error('Navigation timeout:', e.message));
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const loadingVisible = await page.evaluate(() => {
        const spinner = Array.from(document.querySelectorAll('iconify-icon[icon="line-md:loading-twotone-loop"]')).find(el => el.getBoundingClientRect().width > 0);
        return !!spinner;
    });
    
    console.log('Is spinner visible?', loadingVisible);
    
    await browser.close();
    console.log('Diagnostic finished. Loop count:', loopCount);
}

run().catch(e => {
    console.error('Fatal:', e);
});
