const puppeteer = require('puppeteer');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1920, height: 1200 } });
  const page = await browser.newPage();
  const url = 'http://localhost:3000/account/9194/record/consultations/69c232ce0fa7abd357abd6f3/edit';

  page.on('console', m => {
    const t = m.text();
    if (t.includes('[DynamicTable] handleSelectRelation') || t.includes('[DynamicTable] dropdown select')) console.log(t);
  });

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });
  const emailInput = await page.$('input[type="email"], input[name="email"], input#email');
  if (emailInput) {
    await page.type('input[type="email"], input[name="email"], input#email', 'boukirou6@hotmail.com');
    await page.type('input[type="password"], input[name="password"], input#password', 'test');
    const submit = await page.$('button[type="submit"], button');
    if (submit) await submit.click();
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 120000 }).catch(() => {});
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });
  }

  await sleep(2200);

  const input = await page.$('input[placeholder*="Search Traitement"], input[placeholder*="Traitement"]');
  if (!input) { console.log('NO_INPUT'); await browser.close(); return; }
  await input.click({ clickCount: 1 });
  await page.keyboard.down('Control'); await page.keyboard.press('KeyA'); await page.keyboard.up('Control'); await page.keyboard.press('Backspace');
  await page.keyboard.type('doli', { delay: 80 });
  await sleep(1200);

  const rect = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('div')).filter(d => /doliprane 1000mg/i.test((d.textContent||'').trim()));
    const el = items.find(d => (d.getAttribute('style')||'').includes('cursor: pointer')) || items[0];
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width/2, y: r.top + r.height/2, w: r.width, h: r.height, text: (el.textContent||'').trim() };
  });

  console.log('RECT=', rect);
  if (rect) {
    await page.mouse.click(rect.x, rect.y, { delay: 30 });
  }

  await sleep(1500);

  const summary = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table tbody tr'));
    return rows.map(r => (r.textContent||'').replace(/\s+/g,' ').trim()).slice(0,4);
  });
  console.log(JSON.stringify(summary,null,2));

  await page.screenshot({ path: 'tmp-click-coord.png', fullPage: true });
  await browser.close();
})();
