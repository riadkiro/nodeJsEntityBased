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

        const styles = await page.evaluate(() => {
            const container = document.querySelector('.main-container');
            const style = window.getComputedStyle(container);
            const bodyStyle = window.getComputedStyle(document.body);
            const htmlStyle = window.getComputedStyle(document.documentElement);

            return {
                html: {
                    marginTop: htmlStyle.marginTop,
                    paddingTop: htmlStyle.paddingTop,
                    top: document.documentElement.getBoundingClientRect().top
                },
                body: {
                    marginTop: bodyStyle.marginTop,
                    paddingTop: bodyStyle.paddingTop,
                    top: document.body.getBoundingClientRect().top
                },
                container: {
                    marginTop: style.marginTop,
                    paddingTop: style.paddingTop,
                    top: container.getBoundingClientRect().top,
                    position: style.position,
                    display: style.display
                }
            };
        });

        console.log('COMPUTED STYLES:', JSON.stringify(styles, null, 2));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await browser.close();
    }
}

run();
