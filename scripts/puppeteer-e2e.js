const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 900 });

  console.log('Navigating to login page...');
  await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle2' });
  await page.type('input[name="email"]', 'boukirou6@hotmail.com');
  await page.type('input[name="password"]', 'test');
  
  console.log('Submitting login form...');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2' })
  ]);
  
  // 1. Test Fiche page Drive Picker Modal
  console.log('Navigating to Fiche page...');
  await page.goto('http://localhost:3000/account/5096/record/opportunites/6a09be6c0052fd6c37c92ba9/fiche', { waitUntil: 'networkidle2' });
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('Clicking on CSC field to enter edit mode...');
  await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('.ov-ef'));
    const cscRow = rows.find(r => r.innerText.includes('CSC'));
    if (cscRow) {
      cscRow.click();
    } else {
      console.error('CSC row not found on Fiche page');
    }
  });
  await new Promise(resolve => setTimeout(resolve, 800));

  console.log('Clicking "Choisir" to open Drive Picker Modal...');
  await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('.ov-ef'));
    const cscRow = rows.find(r => r.innerText.includes('CSC'));
    if (cscRow) {
      const btn = Array.from(cscRow.querySelectorAll('button')).find(b => b.innerText.includes('Choisir'));
      if (btn) {
        btn.click();
      } else {
        console.error('"Choisir" button not found inside CSC row');
      }
    }
  });
  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log('Capturing Fiche page Drive Picker screenshot...');
  const artifactsDir = 'C:\\Users\\pc\\.gemini\\antigravity\\brain\\b7385ccc-f6c6-4222-a8b8-fb7de8a51ae5';
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }
  const ficheScreenshotPath = path.join(artifactsDir, 'fiche_drive_picker_modal.png');
  await page.screenshot({ path: ficheScreenshotPath });
  console.log(`Fiche screenshot captured at: ${ficheScreenshotPath}`);

  // 2. Test Overview page Drive Picker Modal
  console.log('Navigating to Overview page...');
  await page.goto('http://localhost:3000/account/5096/record/opportunites/6a09be6c0052fd6c37c92ba9/overview', { waitUntil: 'networkidle2' });
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('Clicking on CSC field on Overview page...');
  await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('.ov-ef'));
    const cscRow = rows.find(r => r.innerText.includes('CSC'));
    if (cscRow) {
      cscRow.click();
    } else {
      console.error('CSC row not found on Overview page');
    }
  });
  await new Promise(resolve => setTimeout(resolve, 800));

  console.log('Clicking "Choisir" on Overview page...');
  await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('.ov-ef'));
    const cscRow = rows.find(r => r.innerText.includes('CSC'));
    if (cscRow) {
      const btn = Array.from(cscRow.querySelectorAll('button')).find(b => b.innerText.includes('Choisir'));
      if (btn) {
        btn.click();
      } else {
        console.error('"Choisir" button not found inside CSC row on Overview');
      }
    }
  });
  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log('Capturing Overview page Drive Picker screenshot...');
  const overviewScreenshotPath = path.join(artifactsDir, 'overview_drive_picker_modal.png');
  await page.screenshot({ path: overviewScreenshotPath });
  console.log(`Overview screenshot captured at: ${overviewScreenshotPath}`);

  await browser.close();
  console.log('E2E testing complete successfully!');
}

run().catch(console.error);
