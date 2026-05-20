const puppeteer = require('puppeteer');

async function run() {
    console.log('=== STARTING COMPARATIVE INSPECTION ===');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    try {
        // 1. Login
        await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle2' });
        await page.waitForSelector('input[name="email"]');
        await page.type('input[name="email"]', 'boukirou6@hotmail.com');
        await page.type('input[name="password"]', 'test');
        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2' })
        ]);

        // 2. Open standard Documents page
        console.log('Navigating to standard documents page...');
        await page.goto('http://localhost:3000/account/5096/documents', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 2000));

        const standardLayout = await page.evaluate(() => {
            const getInfo = (sel) => {
                const el = document.querySelector(sel);
                if (!el) return null;
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);
                return {
                    selector: sel,
                    top: rect.top,
                    bottom: rect.bottom,
                    left: rect.left,
                    right: rect.right,
                    width: rect.width,
                    height: rect.height,
                    marginTop: style.marginTop,
                    paddingTop: style.paddingTop,
                    display: style.display,
                    position: style.position
                };
            };

            return {
                mainContainer: getInfo('.main-container'),
                mainContent: getInfo('.main-content'),
                header: getInfo('.main-content > header'),
                shadowSm: getInfo('.main-content > header > .shadow-sm'),
                navbar: getInfo('.main-content > header > .shadow-sm > div'),
                body: getInfo('body')
            };
        });

        console.log('STANDARD PAGE LAYOUT:', JSON.stringify(standardLayout, null, 2));

    } catch (err) {
        console.error('Inspection Error:', err);
    } finally {
        await browser.close();
    }
}

run();
