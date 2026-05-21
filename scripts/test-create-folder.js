const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function run() {
  console.log('Starting Puppeteer folder creation test...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 900 });

  page.on('console', msg => {
    console.log(`[BROWSER ${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.error('[BROWSER ERROR]', err.message);
  });

  // 1. Login
  console.log('Navigating to login page...');
  await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle2' });
  await page.type('input[name="email"]', 'boukirou6@hotmail.com');
  await page.type('input[name="password"]', 'test');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2' })
  ]);
  
  // 2. Go to Factures folder
  const facturesLink = 'http://localhost:3000/account/5096/drive/Factures';
  console.log(`\n--- NAVIGATING TO FACTURES FOLDER: ${facturesLink} ---`);
  await page.goto(facturesLink, { waitUntil: 'networkidle2' });
  await new Promise(resolve => setTimeout(resolve, 2000));

  const screenshotsDir = path.join(__dirname, '..', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // 3. Create a folder named "Achats" inside "Factures"
  console.log('Clicking "Nouveau dossier" button via page.evaluate...');
  const clicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.drive-action-btn'));
    const btn = btns.find(b => b.textContent.includes('Nouveau dossier'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Button click status:', clicked);
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('Typing folder name "Achats" via page.evaluate...');
  const typed = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('.drive-new-folder-input'));
    const input = inputs.find(i => i.getBoundingClientRect().width > 0);
    if (input) {
      input.value = 'Achats';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }
    return false;
  });
  console.log('Typing status:', typed);
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log('Submitting folder creation via page.evaluate...');
  const submitted = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.drive-new-folder-btn'));
    const btn = btns.find(b => b.getBoundingClientRect().width > 0);
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Submit status:', submitted);
  await new Promise(resolve => setTimeout(resolve, 3000));

  await page.screenshot({ path: path.join(screenshotsDir, 'folder_created_factures.png') });

  // 4. Verify we can navigate into "Factures/Achats"
  console.log('Navigating to deep-link: http://localhost:3000/account/5096/drive/Factures/Achats');
  await page.goto('http://localhost:3000/account/5096/drive/Factures/Achats', { waitUntil: 'networkidle2' });
  await new Promise(resolve => setTimeout(resolve, 2000));
  await page.screenshot({ path: path.join(screenshotsDir, 'folder_achats_verified.png') });

  await browser.close();
  console.log('Done.');
}

run().catch(err => {
  console.error('Fatal Puppeteer Error:', err);
});
