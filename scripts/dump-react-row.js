const puppeteer = require('puppeteer');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1920, height: 1200 } });
  const page = await browser.newPage();
  const url = 'http://localhost:3000/account/9194/record/consultations/69c232ce0fa7abd357abd6f3/edit';
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
    const input = Array.from(document.querySelectorAll('input[placeholder*="Traitement"], input[placeholder*="Article"]')).find(i => !(i.value||'').trim());
    if (input) { input.focus(); input.click(); }
  });
  await page.keyboard.type('doli', { delay: 70 });
  await sleep(1200);
  await page.evaluate(() => {
    const dd = Array.from(document.querySelectorAll('div')).find(d => (d.getAttribute('style')||'').includes('z-index: 100'));
    if (!dd) return;
    const item = Array.from(dd.querySelectorAll('div')).find(el => /doliprane 1000mg/i.test((el.textContent||'').trim()));
    if (item) {
      item.dispatchEvent(new MouseEvent('mousedown', { bubbles:true, cancelable:true }));
      item.dispatchEvent(new MouseEvent('click', { bubbles:true, cancelable:true }));
    }
  });
  await sleep(1200);
  const dump = await page.evaluate(() => {
    const row = Array.from(document.querySelectorAll('table tbody tr')).find(r => /Doliprane 1000mg/i.test(r.textContent||''));
    if (!row) return null;
    return Array.from(row.querySelectorAll('td')).map((td,i)=>({i,text:(td.textContent||'').replace(/\s+/g,' ').trim(),html:td.innerHTML.slice(0,220)}));
  });
  console.log(JSON.stringify(dump,null,2));
  await browser.close();
})();
