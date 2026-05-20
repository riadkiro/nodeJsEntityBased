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

        const elementsWithMargin = await page.evaluate(() => {
            const list = [];
            const walker = document.createTreeWalker(
                document.querySelector('.main-container'),
                NodeFilter.SHOW_ELEMENT
            );
            while (walker.nextNode()) {
                const el = walker.currentNode;
                const style = window.getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                const mt = parseFloat(style.marginTop);
                if (mt !== 0) {
                    list.push({
                        tagName: el.tagName,
                        className: el.className,
                        marginTop: style.marginTop,
                        top: rect.top,
                        height: rect.height
                    });
                }
            }
            return list;
        });

        console.log('ELEMENTS WITH MARGINS:');
        console.log(JSON.stringify(elementsWithMargin, null, 2));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await browser.close();
    }
}

run();
