const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function run() {
    console.log('=== STARTING TOPBAR INSPECTION ===');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    try {
        // 1. Login
        console.log('Navigating to login page...');
        await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle2' });
        
        console.log('Entering credentials...');
        await page.waitForSelector('input[name="email"]');
        await page.type('input[name="email"]', 'boukirou6@hotmail.com');
        await page.type('input[name="password"]', 'test');
        
        console.log('Submitting login...');
        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2' })
        ]);

        // 2. Open Document Generation Wizard
        console.log('Navigating to document generation wizard...');
        await page.goto('http://localhost:3000/account/5096/documents/6a0cc32c8582f628068fa250/generate', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 4000));

        // 3. Inspect top elements layout
        const layoutInfo = await page.evaluate(() => {
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
                mainContent: getInfo('.main-content'),
                header: getInfo('.main-content > header'),
                shadowSm: getInfo('.main-content > header > .shadow-sm'),
                navbar: getInfo('.main-content > header > .shadow-sm > div'),
                body: getInfo('body')
            };
        });

        console.log('Layout Info:', JSON.stringify(layoutInfo, null, 2));

        // Save a screenshot specifically of the top area
        const artifactDir = 'C:\\Users\\pc\\.gemini\\antigravity\\brain\\86f93efc-12db-4081-8233-7a854733cf75';
        await page.screenshot({ path: path.join(artifactDir, 'topbar_layout.png') });
        console.log('Screenshot saved to topbar_layout.png');

    } catch (err) {
        console.error('Inspection Error:', err);
    } finally {
        await browser.close();
    }
}

run();
