const puppeteer = require('puppeteer');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1920, height: 1200 } });
  const page = await browser.newPage();
  const url = 'http://localhost:3000/account/9194/record/consultations/69c232ce0fa7abd357abd6f3/edit';

  page.on('console', m => {
    const t = m.text();
    if (t.includes('[SIDEBAR-DT]')) console.log(t);
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

  await sleep(1800);

  // find empty treatment input
  const found = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input[placeholder*="🔍 Traitement"]'));
    const empty = inputs.find(i => !(i.value || '').trim());
    if (!empty) return { ok: false };
    empty.focus();
    empty.click();
    return { ok: true };
  });

  if (!found.ok) {
    console.log('NO_EMPTY_ROW_FOUND');
    await page.screenshot({ path: 'tmp-auto-no-empty-row.png', fullPage: true });
    await browser.close();
    return;
  }

  await page.keyboard.type('doli', { delay: 70 });
  await sleep(1000);

  await page.evaluate(() => {
    const opts = Array.from(document.querySelectorAll('div')).filter(d => /Doliprane 1000mg/i.test((d.textContent || '').trim()));
    const opt = opts[0];
    if (opt) {
      opt.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      opt.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    }
  });

  await sleep(1200);

  const check = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input[placeholder*="🔍 Traitement"]'));
    const row = inputs.find(i => /doliprane/i.test((i.value || '').toLowerCase()))?.closest('tr');
    if (!row) return { ok: false, reason: 'row_not_found' };
    const text = row.innerText || '';
    return {
      ok: true,
      rowText: text,
      hasMoment: /Matin/i.test(text),
      hasFreq: /3x\s*\/\s*jour/i.test(text),
      hasDuration: /7\s*jours/i.test(text),
      hasSelectPlaceholder: /Sélectionner/i.test(text)
    };
  });

  console.log('EMPTY_ROW_RESULT=' + JSON.stringify(check));
  await page.screenshot({ path: 'tmp-auto-empty-row-after-select.png', fullPage: true });
  await browser.close();
})();
