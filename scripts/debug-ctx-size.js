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

  // Check dimensions
  const dimensions = await page.evaluate(() => {
    const menus = Array.from(document.querySelectorAll('div')).filter(el => el.getAttribute('x-show') === 'contextMenu.show');
    if (menus.length === 0) return 'Not found';
    
    const menu = menus[0];
    const rect = menu.getBoundingClientRect();
    const html = menu.innerHTML;
    return {
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
      htmlLength: html.length,
      htmlPreview: html.substring(0, 200)
    };
  });

  console.log('Context menu dimensions:', dimensions);
  await browser.close();
}

run().catch(console.error);
