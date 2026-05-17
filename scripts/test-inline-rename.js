const puppeteer = require('puppeteer');

async function run() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 900 });

  await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle2' });
  await page.type('input[name="email"]', 'boukirou6@hotmail.com');
  await page.type('input[name="password"]', 'test');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2' })
  ]);
  
  await page.goto('http://localhost:3000/account/5096/record/opportunites/6a09be6c0052fd6c37c92ba9/drive', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Trigger context menu
  await page.evaluate(() => {
    // Find uploads folder
    const folderTitle = Array.from(document.querySelectorAll('.rm-item-title')).find(el => el.innerText.includes('uploads') || el.innerText.includes('Test'));
    if (folderTitle) {
      const folderItem = folderTitle.closest('.drive-folder-item');
      if (folderItem) {
        const rect = folderItem.getBoundingClientRect();
        const event = new MouseEvent('contextmenu', {
          bubbles: true,
          cancelable: true,
          clientX: rect.left + 10,
          clientY: rect.top + 10,
          button: 2
        });
        folderItem.dispatchEvent(event);
      }
    }
  });

  await new Promise(r => setTimeout(r, 500));

  // Click Rename in context menu
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const renameBtn = btns.find(b => b.innerText.includes('Renommer') && b.closest('div[x-show="contextMenu.show"]'));
    if (renameBtn) renameBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'scripts/inline_rename_focus.png' });

  // Type new name
  await page.keyboard.type('InlineRenameTest');
  await page.keyboard.press('Enter');

  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'scripts/inline_rename_done.png' });

  console.log("Inline rename test complete");
  await browser.close();
}

run().catch(console.error);
