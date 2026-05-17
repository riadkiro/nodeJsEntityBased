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
  
  console.log('Navigating to Fiche page...');
  await page.goto('http://localhost:3000/account/5096/record/opportunites/6a09be6c0052fd6c37c92ba9/fiche', { waitUntil: 'networkidle2' });
  await new Promise(resolve => setTimeout(resolve, 2000));

  const artifactsDir = 'C:\\Users\\pc\\.gemini\\antigravity\\brain\\b7385ccc-f6c6-4222-a8b8-fb7de8a51ae5';
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  // Take an initial screenshot
  console.log('Taking screenshot of initial Fiche page...');
  await page.screenshot({ path: path.join(artifactsDir, 'fiche_initial.png') });

  console.log('Clicking on Galerie field to enter edit mode...');
  await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('.ov-ef'));
    const galleryRow = rows.find(r => r.innerText.includes('Galerie'));
    if (galleryRow) {
      galleryRow.click();
    } else {
      console.error('Galerie row not found on Fiche page');
    }
  });
  await new Promise(resolve => setTimeout(resolve, 800));

  console.log('Clicking "Choisir" to open Drive Picker Modal...');
  await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('.ov-ef'));
    const galleryRow = rows.find(r => r.innerText.includes('Galerie'));
    if (galleryRow) {
      const btn = Array.from(galleryRow.querySelectorAll('button')).find(b => b.innerText.includes('Choisir'));
      if (btn) {
        btn.click();
      } else {
        console.error('"Choisir" button not found inside Galerie row');
      }
    }
  });
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('Taking screenshot of opened Drive Picker Modal...');
  await page.screenshot({ path: path.join(artifactsDir, 'fiche_drive_picker_modal_opened.png') });

  console.log('Selecting an image file in the modal...');
  await page.evaluate(() => {
    // Let's find all the 'Choisir' buttons inside the modal that are for files
    // The option div might contain buttons. Let's find one that does not say '✓ Ajouté' and click it.
    const buttons = Array.from(document.querySelectorAll('button'));
    const selectBtn = buttons.find(b => b.innerText.includes('Choisir') && !b.getAttribute('style')?.includes('color:#475569')); // exclude the main 'Choisir' trigger
    if (selectBtn) {
      selectBtn.click();
      console.log('Clicked select file button inside modal');
    } else {
      console.error('No select file button found inside modal');
    }
  });
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('Taking screenshot after selecting the file (but before Terminer)...');
  await page.screenshot({ path: path.join(artifactsDir, 'fiche_file_selected.png') });

  console.log('Clicking "Terminer" to confirm and save...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const terminerBtn = buttons.find(b => b.innerText.includes('Terminer'));
    if (terminerBtn) {
      terminerBtn.click();
      console.log('Clicked Terminer button');
    } else {
      console.error('Terminer button not found');
      // If Terminer button is not found (because only 1 is selected or it is already closed), we close by clicking outside or close button
      const closeBtn = buttons.find(b => b.querySelector('iconify-icon[icon="solar:close-circle-bold"]'));
      if (closeBtn) closeBtn.click();
    }
  });
  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log('Taking final screenshot of Fiche page (showing updated gallery)...');
  const finalScreenshotPath = path.join(artifactsDir, 'fiche_gallery_updated.png');
  await page.screenshot({ path: finalScreenshotPath });
  console.log(`Final updated gallery screenshot captured at: ${finalScreenshotPath}`);

  await browser.close();
  console.log('E2E testing complete successfully!');
}

run().catch(console.error);
