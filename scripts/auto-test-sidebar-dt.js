const puppeteer = require('puppeteer');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function ensureLogged(page) {
  const emailInput = await page.$('input[type="email"], input[name="email"], input#email');
  if (!emailInput) return;
  await page.type('input[type="email"], input[name="email"], input#email', 'boukirou6@hotmail.com', { delay: 20 });
  await page.type('input[type="password"], input[name="password"], input#password', 'test', { delay: 20 });
  const submit = await page.$('button[type="submit"], button');
  if (submit) await submit.click();
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 120000 }).catch(() => {});
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1920, height: 1200 } });
  const page = await browser.newPage();
  const url = 'http://localhost:3000/account/9194/record/consultations/69c232ce0fa7abd357abd6f3/edit';

  page.on('console', m => {
    const t = m.text();
    if (t.includes('[SIDEBAR-DT]') || t.includes('[LINES-HARDLOG]')) console.log(t);
  });

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });
  await ensureLogged(page);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });
  await sleep(1800);

  const target = await page.$('input[placeholder*="🔍 Traitement"]');
  if (!target) {
    console.log('NO_TREATMENT_INPUT');
    await page.screenshot({ path: 'tmp-auto-no-treatment-input.png', fullPage: true });
    await browser.close();
    process.exit(1);
  }

  // Clear and type query
  await target.click({ clickCount: 1 });
  await page.keyboard.down('Control');
  await page.keyboard.press('KeyA');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await page.keyboard.type('doli', { delay: 70 });
  await sleep(900);

  // Click dropdown item in sidebar widget search
  const clicked = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('div'));
    const row = items.find(el => /Doliprane 1000mg/i.test((el.textContent || '').trim()) && (el.getAttribute('style') || '').includes('cursor:pointer'));
    if (!row) return false;
    row.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    row.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  });
  console.log('CLICKED=', clicked);

  await sleep(1300);

  const snapshot = await page.evaluate(() => {
    const input = document.querySelector('input[placeholder*="🔍 Traitement"]');
    const tr = input ? input.closest('tr') : null;
    if (!tr) return { ok: false, reason: 'no row' };
    const tds = Array.from(tr.querySelectorAll('td')).map(td => (td.innerText || '').trim());
    return { ok: true, tds };
  });

  console.log('ROW_SNAPSHOT=' + JSON.stringify(snapshot));
  await page.screenshot({ path: 'tmp-auto-after-select.png', fullPage: true });

  await browser.close();
})();
