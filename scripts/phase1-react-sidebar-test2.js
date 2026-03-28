const puppeteer = require('puppeteer');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1920, height: 1200 } });
  const page = await browser.newPage();
  const url = 'http://localhost:3000/account/9194/record/consultations/69c232ce0fa7abd357abd6f3/edit';

  page.on('console', msg => {
    const t = msg.text();
    if (t.includes('[DynamicTable] handleSelectRelation') || t.includes('[DynamicTable] dropdown select') || t.includes('[DynamicTable] Found lineDefaults')) {
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

  await page.evaluate(() => {
    const input = Array.from(document.querySelectorAll('input[placeholder*="Traitement"], input[placeholder*="Article"]'))
      .find(i => !(i.value || '').trim());
    if (input) {
      input.focus();
      input.click();
    }
  });

  await page.keyboard.type('doli', { delay: 70 });
  await sleep(1200);

  const clicked = await page.evaluate(() => {
    const dropdowns = Array.from(document.querySelectorAll('div')).filter(d => {
      const s = d.getAttribute('style') || '';
      return s.includes('position: absolute') && s.includes('z-index: 100') && s.includes('background: rgb(255, 255, 255)');
    });
    for (const dd of dropdowns) {
      const item = Array.from(dd.querySelectorAll('div')).find(el => /doliprane 1000mg/i.test((el.textContent || '').trim()));
      if (item) {
        item.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
        item.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        return true;
      }
    }
    return false;
  });

  console.log('CLICKED_ITEM=' + clicked);
  await sleep(1400);

  const verify = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table tbody tr'));
    const row = rows.find(r => /Doliprane 1000mg/i.test(r.innerText || ''));
    if (!row) return { ok: false, reason: 'no_doliprane_row' };
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

  console.log('VERIFY2=' + JSON.stringify(verify));
  await page.screenshot({ path: 'tmp-phase1-react-sidebar-result2.png', fullPage: true });
  await browser.close();
})();
