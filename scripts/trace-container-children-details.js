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
        await page.waitForSelector('input[type="email"]');
        await page.type('input[type="email"]', 'boukirou6@hotmail.com');
        await page.type('input[type="password"]', 'test');
        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2' })
        ]);

        await page.goto('http://localhost:3000/account/5096/home', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 2000));

        const containerChildren = await page.evaluate(() => {
            const container = document.querySelector('.main-container');
            if (!container) return [];
            return Array.from(container.children).map((curr, idx) => {
                const rect = curr.getBoundingClientRect();
                const style = window.getComputedStyle(curr);
                return {
                    index: idx,
                    tagName: curr.tagName,
                    className: curr.className,
                    id: curr.id,
                    outerHTMLSnippet: curr.outerHTML.substring(0, 200),
                    top: rect.top,
                    height: rect.height,
                    marginTop: style.marginTop,
                    marginBottom: style.marginBottom,
                    paddingTop: style.paddingTop,
                    position: style.position,
                    display: style.display
                };
            });
        });

        console.log('--- MAIN CONTAINER CHILDREN DETAILS ---');
        console.log(JSON.stringify(containerChildren, null, 2));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await browser.close();
    }
}

run();
