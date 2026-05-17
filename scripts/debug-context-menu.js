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

  // create folder
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Nouveau dossier'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.type('.drive-new-folder-input', 'TestCtx');
  await page.evaluate(() => {
    const btn = document.querySelector('.drive-new-folder-btn');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // Trigger context menu
  await page.evaluate(() => {
    const folderTitle = Array.from(document.querySelectorAll('.rm-item-title')).find(el => el.innerText === 'TestCtx');
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

  await new Promise(r => setTimeout(r, 100));

  // Check visibility
  const isVisible = await page.evaluate(() => {
    // Since it's teleported to body, it should be a direct child or somewhere in body
    const menus = Array.from(document.querySelectorAll('div')).filter(el => el.getAttribute('x-show') === 'contextMenu.show');
    if (menus.length === 0) return 'Not found in DOM';
    
    const menu = menus[0];
    return {
      display: window.getComputedStyle(menu).display,
      visibility: window.getComputedStyle(menu).visibility,
      xShowAttr: menu.getAttribute('x-show'),
      style: menu.getAttribute('style')
    };
  });

  console.log('Context menu state after right click:', isVisible);

  await page.screenshot({ path: 'scripts/debug_ctx_menu.png' });
  await browser.close();
}

run().catch(console.error);
