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

        const bodyChildren = await page.evaluate(() => {
            return Array.from(document.body.childNodes).map((curr, idx) => {
                if (curr.nodeType === Node.TEXT_NODE) {
                    const text = curr.textContent.trim();
                    if (text.length > 0) {
                        return {
                            index: idx,
                            type: 'TEXT_NODE',
                            content: text
                        };
                    }
                    return null;
                } else if (curr.nodeType === Node.ELEMENT_NODE) {
                    const rect = curr.getBoundingClientRect();
                    const style = window.getComputedStyle(curr);
                    return {
                        index: idx,
                        type: 'ELEMENT_NODE',
                        tagName: curr.tagName,
                        className: curr.className,
                        id: curr.id,
                        top: rect.top,
                        height: rect.height,
                        marginTop: style.marginTop,
                        marginBottom: style.marginBottom,
                        display: style.display,
                        position: style.position
                    };
                }
                return null;
            }).filter(Boolean);
        });

        console.log('--- BODY NODE CHILDREN ---');
        console.log(JSON.stringify(bodyChildren, null, 2));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await browser.close();
    }
}

run();
