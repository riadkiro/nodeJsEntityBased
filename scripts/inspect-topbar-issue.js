const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function main() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        
        console.log('Navigating to login page...');
        await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle2' });
        
        console.log('Filling login form...');
        await page.type('input[type="email"]', 'boukirou6@hotmail.com');
        await page.type('input[type="password"]', 'test');
        
        console.log('Submitting login form...');
        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2' })
        ]);
        
        console.log('Navigating to account home...');
        await page.goto('http://localhost:3000/account/5096/home', { waitUntil: 'networkidle2' });
        
        // Wait a bit for Alpine to load and render
        await new Promise(r => setTimeout(r, 2000));
        
        console.log('Extracting computed styles...');
        const data = await page.evaluate(() => {
            const getMetrics = (selector) => {
                const el = document.querySelector(selector);
                if (!el) return { error: `Selector not found: ${selector}` };
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);
                return {
                    tagName: el.tagName,
                    className: el.className,
                    rect: {
                        top: rect.top,
                        bottom: rect.bottom,
                        left: rect.left,
                        right: rect.right,
                        width: rect.width,
                        height: rect.height
                    },
                    margin: {
                        top: style.marginTop,
                        bottom: style.marginBottom,
                        left: style.marginLeft,
                        right: style.marginRight
                    },
                    padding: {
                        top: style.paddingTop,
                        bottom: style.paddingBottom,
                        left: style.paddingLeft,
                        right: style.paddingRight
                    },
                    position: style.position,
                    topVal: style.top,
                    display: style.display,
                    zIndex: style.zIndex,
                    background: style.background,
                    backgroundColor: style.backgroundColor
                };
            };
            
            return {
                html: getMetrics('html'),
                body: getMetrics('body'),
                mainContainer: getMetrics('.main-container'),
                mainContent: getMetrics('.main-content'),
                header: getMetrics('header'),
                shadowSm: getMetrics('.shadow-sm'),
                sidebar: getMetrics('.sidebar')
            };
        });
        
        console.log('Computed Metrics:\n', JSON.stringify(data, null, 2));
        
        const screenshotPath = path.join('C:', 'Users', 'pc', '.gemini', 'antigravity', 'brain', 'bd58b52a-a6ee-43de-8a31-7885ff1cc16e', 'inspect_home.png');
        console.log(`Taking screenshot to ${screenshotPath}...`);
        await page.screenshot({ path: screenshotPath });
        
    } catch (err) {
        console.error('Error during inspection:', err);
    } finally {
        await browser.close();
        console.log('Browser closed.');
    }
}

main();
