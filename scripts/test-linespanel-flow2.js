const puppeteer = require('puppeteer');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const logs = [];
  const url = 'http://localhost:3000/account/9194/record/consultations/69c232ce0fa7abd357abd6f3/edit';
  const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1800, height: 1200 } });
  const page = await browser.newPage();

  page.on('console', msg => {
    const t = msg.text();
    if (t.includes('[LINES-HARDLOG]') || t.includes('[selectRelation]')) {
      logs.push(t);
      console.log(t);
    }
  });

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

  await sleep(2000);

  const input = await page.$('input[placeholder*="Traitement"]');
  if (!input) {
    console.log('NO_TREATMENT_INPUT');
  } else {
    await input.click({ clickCount: 1 });
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('doli', { delay: 90 });
    await sleep(1300);

    await page.evaluate(() => {
      const dropdownItems = Array.from(document.querySelectorAll('[x-text], div, li, span'));
      const hit = dropdownItems.find(el => /doliprane/i.test((el.textContent || '').trim()));
      if (hit) {
        hit.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
        hit.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }
    });

    await sleep(1500);
  }

  console.log('COUNT=' + logs.length);
  await page.screenshot({ path: 'tmp-puppeteer-flow2.png', fullPage: true });
  await browser.close();
})();
