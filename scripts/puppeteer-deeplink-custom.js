const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function run() {
  console.log('Starting Puppeteer E2E debugging for root vs deep-link...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 900 });

  // Capture console logs and errors
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[BROWSER ${type.toUpperCase()}] ${text}`);
  });

  page.on('pageerror', err => {
    console.error('[BROWSER ERROR]', err.message);
    if (err.stack) console.error(err.stack);
  });

  // 1. Login
  console.log('Navigating to login page...');
  await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle2' });
  await page.type('input[name="email"]', 'boukirou6@hotmail.com');
  await page.type('input[name="password"]', 'test');
  
  console.log('Submitting login...');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2' })
  ]);
  
  const screenshotsDir = path.join(__dirname, '..', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // 2. Access Root Drive
  const rootLink = 'http://localhost:3000/account/5096/drive';
  console.log(`\n--- NAVIGATING TO ROOT DRIVE: ${rootLink} ---`);
  await page.goto(rootLink, { waitUntil: 'networkidle2' });
  console.log('Waiting 3 seconds for root page load...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  await page.screenshot({ path: path.join(screenshotsDir, 'root_drive_test.png') });

  // 3. Access Custom Deep Link
  const deepLink = 'http://localhost:3000/account/5096/drive/Factures/Achats';
  console.log(`\n--- NAVIGATING TO CUSTOM DEEP LINK: ${deepLink} ---`);
  await page.goto(deepLink, { waitUntil: 'networkidle2' });
  console.log('Waiting 3 seconds for deep link page load...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  await page.screenshot({ path: path.join(screenshotsDir, 'custom_deeplink_test.png') });

  await browser.close();
  console.log('Done.');
}

run().catch(err => {
  console.error('Fatal Puppeteer Error:', err);
});
