const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle2' });
  await page.type('input[name="email"]', 'boukirou6@hotmail.com');
  await page.type('input[name="password"]', 'test');
  
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2' })
  ]);
  
  await page.goto('http://localhost:3000/account/5096/record/opportunites/6a09be6c0052fd6c37c92ba9/fiche', { waitUntil: 'networkidle2' });
  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));

  const htmlDumps = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.ov-ef')).map(el => {
      const label = el.querySelector('.ov-ef-label')?.innerText;
      if (label && (label.includes('CSC') || label.includes('IMAGE'))) {
        return {
          label,
          html: el.innerHTML
        };
      }
      return null;
    }).filter(Boolean);
  });

  fs.writeFileSync(path.join(__dirname, 'html-dump.json'), JSON.stringify(htmlDumps, null, 2));
  console.log('HTML dumps written to html-dump.json');

  await browser.close();
}

run().catch(console.error);
