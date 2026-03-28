const fs = require('fs');
const puppeteer = require('puppeteer');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const logs = [];
  const url = 'http://localhost:3000/account/9194/record/consultations/69c232ce0fa7abd357abd6f3/edit';
  const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1600, height: 1000 } });
  const page = await browser.newPage();

  page.on('console', msg => {
    const txt = msg.text();
    if (txt.includes('[LINES-HARDLOG]') || txt.includes('[selectRelation]')) {
      logs.push(txt);
      console.log(txt);
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

  await sleep(1500);

  // Prefer relation input by placeholder/icon-like text
  const selectors = [
    'input[placeholder*="Traitement"]',
    'input[placeholder*="🔍"]',
    'tbody tr:last-child input',
    'tbody tr input'
  ];

  let inputHandle = null;
  for (const s of selectors) {
    const list = await page.$$(s);
    if (list.length) {
      inputHandle = list[list.length - 1];
      break;
    }
  }

  if (!inputHandle) {
    await page.screenshot({ path: 'tmp-no-input-found.png', fullPage: true });
    console.log('NO_RELATION_INPUT_FOUND');
  } else {
    await inputHandle.click({ clickCount: 1 });
    await page.keyboard.type('doli', { delay: 80 });
    await sleep(1200);

    // Click dropdown item containing Doliprane
    await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('div,span,li,button'));
      const item = nodes.find(el => /doliprane/i.test((el.textContent || '').trim()));
      if (item) {
        item.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
        item.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }
    });

    await sleep(1500);
    await page.screenshot({ path: 'tmp-puppeteer-after-select.png', fullPage: true });
  }

  fs.writeFileSync('tmp-lines-hardlog.txt', logs.join('\n'), 'utf8');
  console.log('HARDLOG_COUNT=' + logs.length);
  await browser.close();
})();
