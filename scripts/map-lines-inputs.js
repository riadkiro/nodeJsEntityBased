const puppeteer = require('puppeteer');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const url = 'http://localhost:3000/account/9194/record/consultations/69c232ce0fa7abd357abd6f3/edit';
  const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1800, height: 1200 } });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });

  const emailInput = await page.$('input[type="email"], input[name="email"], input#email');
  if (emailInput) {
    await page.type('input[type="email"], input[name="email"], input#email', 'boukirou6@hotmail.com', { delay: 20 });
    await page.type('input[type="password"], input[name="password"], input#password', 'test', { delay: 20 });
    const submit = await page.$('button[type="submit"], button');
    if (submit) await submit.click();
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 120000 }).catch(() => {});
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });
  }

  await sleep(1800);

  const data = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input'));
    return inputs.slice(0, 80).map((el, i) => ({
      i,
      type: el.type,
      placeholder: el.placeholder || '',
      value: el.value || '',
      cls: el.className || '',
      visible: !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length),
      inTable: !!el.closest('table'),
      thText: el.closest('table') ? Array.from(el.closest('table').querySelectorAll('th')).map(th => (th.textContent||'').trim()).join(' | ') : ''
    }));
  });

  console.log(JSON.stringify(data, null, 2));
  await page.screenshot({ path: 'tmp-input-map.png', fullPage: true });
  await browser.close();
})();
