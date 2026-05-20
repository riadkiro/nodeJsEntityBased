const puppeteer = require('puppeteer');

async function run() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    try {
        await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle2' });
        await page.waitForSelector('input[name="email"]');
        await page.type('input[name="email"]', 'boukirou6@hotmail.com');
        await page.type('input[name="password"]', 'test');
        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2' })
        ]);

        await page.goto('http://localhost:3000/account/5096/documents/6a0cc32c8582f628068fa250/generate', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 3000));

        const trace = await page.evaluate(() => {
            const path = [];
            let curr = document.querySelector('.main-content');
            while (curr && curr !== document.body) {
                const rect = curr.getBoundingClientRect();
                const style = window.getComputedStyle(curr);
                path.push({
                    tagName: curr.tagName,
                    className: curr.className,
                    top: rect.top,
                    height: rect.height,
                    marginTop: style.marginTop,
                    paddingTop: style.paddingTop,
                    display: style.display,
                    position: style.position
                });
                curr = curr.parentElement;
            }
            return path;
        });

        console.log('TRACE FROM MAIN-CONTENT UPWARDS:');
        console.log(JSON.stringify(trace, null, 2));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await browser.close();
    }
}

run();
