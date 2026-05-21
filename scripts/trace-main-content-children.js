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

        const mainContentChildren = await page.evaluate(() => {
            const mainContent = document.querySelector('.main-content');
            if (!mainContent) return [];
            
            return Array.from(mainContent.children).map((curr, idx) => {
                const rect = curr.getBoundingClientRect();
                const style = window.getComputedStyle(curr);
                
                let subChildren = [];
                if (curr.tagName === 'HEADER') {
                    subChildren = Array.from(curr.children).map((hChild, hIdx) => {
                        const hRect = hChild.getBoundingClientRect();
                        const hStyle = window.getComputedStyle(hChild);
                        
                        let shadowChildren = [];
                        if (hChild.className.includes('shadow-sm')) {
                            shadowChildren = Array.from(hChild.children).map((sChild, sIdx) => {
                                const sRect = sChild.getBoundingClientRect();
                                const sStyle = window.getComputedStyle(sChild);
                                return {
                                    tagName: sChild.tagName,
                                    className: sChild.className,
                                    id: sChild.id,
                                    top: sRect.top,
                                    height: sRect.height,
                                    marginTop: sStyle.marginTop,
                                    marginBottom: sStyle.marginBottom,
                                    paddingTop: sStyle.paddingTop,
                                    position: sStyle.position,
                                    display: sStyle.display
                                };
                            });
                        }
                        
                        return {
                            tagName: hChild.tagName,
                            className: hChild.className,
                            id: hChild.id,
                            top: hRect.top,
                            height: hRect.height,
                            marginTop: hStyle.marginTop,
                            marginBottom: hStyle.marginBottom,
                            paddingTop: hStyle.paddingTop,
                            position: hStyle.position,
                            display: hStyle.display,
                            children: shadowChildren
                        };
                    });
                }
                
                return {
                    tagName: curr.tagName,
                    className: curr.className,
                    id: curr.id,
                    top: rect.top,
                    height: rect.height,
                    marginTop: style.marginTop,
                    marginBottom: style.marginBottom,
                    paddingTop: style.paddingTop,
                    position: style.position,
                    display: style.display,
                    children: subChildren
                };
            });
        });

        console.log('--- MAIN CONTENT IMMEDIATE & HEADER CHILDREN ---');
        console.log(JSON.stringify(mainContentChildren, null, 2));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await browser.close();
    }
}

run();
