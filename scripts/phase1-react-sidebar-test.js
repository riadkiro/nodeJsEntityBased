const puppeteer = require('puppeteer');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1920, height: 1200 } });
  const page = await browser.newPage();
  const url = 'http://localhost:3000/account/9194/record/consultations/69c232ce0fa7abd357abd6f3/edit';

  const logs = [];
  page.on('console', msg => {
    const t = msg.text();
    if (t.includes('[DynamicTable Island]') || t.includes('[DynamicTable]')) {
      logs.push(t);
      console.log(t);
    }
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

  await sleep(2000);

  // Ensure at least one React dynamic-table mounted in sidebar area
  const mountedCount = await page.evaluate(() => document.querySelectorAll('[data-island="dynamic-table"][data-mounted="1"]').length);
  console.log('MOUNTED_ISLANDS=' + mountedCount);

  // pick an empty treatment-like relation input
  const picked = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('input'));
    const target = all.find(i => {
      const ph = i.placeholder || '';
      return /Traitement|Article/i.test(ph) && !(i.value || '').trim();
    });
    if (!target) return false;
    target.focus();
    target.click();
    return true;
  });

  if (!picked) {
    console.log('NO_EMPTY_REL_INPUT');
    await page.screenshot({ path: 'tmp-phase1-no-empty-rel-input.png', fullPage: true });
    await browser.close();
    return;
  }

  await page.keyboard.type('doli', { delay: 70 });
  await sleep(1200);

  // click first doliprane result
  await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('div,span,li,button'));
    const hit = nodes.find(n => /doliprane 1000mg/i.test((n.textContent || '').trim()));
    if (hit) {
      hit.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      hit.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    }
  });

  await sleep(1400);

  const verify = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table tbody tr'));
    const row = rows.find(r => /Doliprane 1000mg/i.test(r.innerText || ''));
    if (!row) return { ok: false, reason: 'row_not_found' };
    const txt = row.innerText || '';
    return {
      ok: true,
      rowText: txt,
      hasMoment: /Matin/i.test(txt),
      hasFreq: /3x\s*\/\s*jour/i.test(txt),
      hasDuration: /7\s*jours/i.test(txt),
      hasInstruction: /prendre pendant les repas/i.test(txt)
    };
  });

  console.log('VERIFY=' + JSON.stringify(verify));
  await page.screenshot({ path: 'tmp-phase1-react-sidebar-result.png', fullPage: true });

  await browser.close();
})();
