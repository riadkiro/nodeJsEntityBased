const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function screenshot(page, name) {
    const filePath = path.join(SCREENSHOTS_DIR, `${name}.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`  📸 Screenshot: ${filePath}`);
    return filePath;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
    console.log('=== Launching browser ===');
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1400, height: 900 },
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    
    // Collect console logs
    const consoleLogs = [];
    page.on('console', msg => {
        const text = msg.text();
        consoleLogs.push(text);
        if (text.includes('[Drive]') || text.includes('Error') || text.includes('error')) {
            console.log('  🔹 Console:', text);
        }
    });

    // --- Step 1: Navigate to drive ---
    console.log('\n=== Step 1: Navigate to drive ===');
    await page.goto('http://localhost:3000/account/5096/drive', { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(2000);
    
    const currentUrl = page.url();
    console.log('  URL:', currentUrl);

    // --- Step 2: Login if redirected ---
    if (currentUrl.includes('/auth/login') || currentUrl.includes('/login')) {
        console.log('\n=== Step 2: Login ===');
        
        await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 5000 });
        await page.click('input[type="email"], input[name="email"]');
        await page.keyboard.down('Control');
        await page.keyboard.press('a');
        await page.keyboard.up('Control');
        await page.keyboard.press('Delete');
        await page.type('input[type="email"], input[name="email"]', 'boukirou6@hotmail.com', { delay: 30 });
        
        await page.click('input[type="password"], input[name="password"]');
        await page.keyboard.down('Control');
        await page.keyboard.press('a');
        await page.keyboard.up('Control');
        await page.keyboard.press('Delete');
        await page.type('input[type="password"], input[name="password"]', 'test', { delay: 30 });
        
        // Click submit
        await page.click('button[type="submit"]');
        console.log('  Submitted login');
        await sleep(3000);
        console.log('  URL after login:', page.url());
        await screenshot(page, 'test2_01_after_login');

        // If on accounts page, look for workspace
        if (page.url().includes('/user/accounts')) {
            console.log('  Looking for DEMO TEST workspace...');
            await sleep(1000);
            
            const clicked = await page.evaluate(() => {
                const links = document.querySelectorAll('a');
                for (const link of links) {
                    if (link.textContent.includes('DEMO') || link.textContent.includes('5096')) {
                        link.click();
                        return link.textContent.trim().substring(0, 60);
                    }
                }
                // Try any clickable element
                const all = document.querySelectorAll('[onclick], button, .account-card, .workspace-card');
                for (const el of all) {
                    if (el.textContent.includes('DEMO')) {
                        el.click();
                        return el.textContent.trim().substring(0, 60);
                    }
                }
                return null;
            });
            
            if (clicked) {
                console.log('  Clicked workspace:', clicked);
                await sleep(2000);
            } else {
                console.log('  No DEMO workspace found, trying direct navigate');
            }
        }

        // Navigate to drive
        console.log('  Navigating to drive...');
        await page.goto('http://localhost:3000/account/5096/drive', { waitUntil: 'networkidle2', timeout: 15000 });
        await sleep(3000);
    }

    // --- Step 3: Drive root page ---
    console.log('\n=== Step 3: Drive root page ===');
    console.log('  URL:', page.url());
    await screenshot(page, 'test2_02_drive_root');

    // Wait for Alpine to render
    await sleep(1000);

    // Get the Alpine component state
    const driveState = await page.evaluate(() => {
        const el = document.querySelector('[x-data]');
        if (!el && !el.__x) return { error: 'No Alpine component found' };
        
        // List all .rm-item elements
        const items = document.querySelectorAll('.rm-item');
        return {
            itemCount: items.length,
            items: Array.from(items).map(item => ({
                text: item.querySelector('.rm-item-title')?.textContent?.trim() || '',
                sublabel: item.querySelector('.rm-item-date')?.textContent?.trim() || '',
                badge: item.querySelector('.rm-item-badge')?.textContent?.trim() || ''
            }))
        };
    });
    console.log('  Drive items:', JSON.stringify(driveState, null, 2));

    // --- Step 4: Click on Entreprise folder ---
    console.log('\n=== Step 4: Click Entreprise ===');
    
    const clickResult = await page.evaluate(() => {
        const items = document.querySelectorAll('.rm-item');
        for (const item of items) {
            const title = item.querySelector('.rm-item-title');
            if (title && title.textContent.trim() === 'Entreprise') {
                item.click();
                return { clicked: true, text: title.textContent.trim() };
            }
        }
        return { clicked: false, availableItems: Array.from(document.querySelectorAll('.rm-item-title')).map(t => t.textContent.trim()) };
    });
    console.log('  Click result:', JSON.stringify(clickResult));
    await sleep(2000);
    await screenshot(page, 'test2_03_after_entreprise');

    // List items at entity level (should show records like Acme Corp, TechCorp)
    const entityItems = await page.evaluate(() => {
        const items = document.querySelectorAll('.rm-item');
        return {
            count: items.length,
            items: Array.from(items).map(item => ({
                text: item.querySelector('.rm-item-title')?.textContent?.trim() || '',
                sublabel: item.querySelector('.rm-item-date')?.textContent?.trim() || ''
            }))
        };
    });
    console.log('  Entity level items:', JSON.stringify(entityItems, null, 2));

    // Check breadcrumb
    const breadcrumb = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.drive-breadcrumb-item')).map(b => b.textContent.trim());
    });
    console.log('  Breadcrumb:', breadcrumb);

    // --- Step 5: Click Acme Corp ---
    console.log('\n=== Step 5: Click Acme Corp ===');
    
    const acmeResult = await page.evaluate(() => {
        const items = document.querySelectorAll('.rm-item');
        for (const item of items) {
            const title = item.querySelector('.rm-item-title');
            if (title && title.textContent.trim().includes('Acme')) {
                item.click();
                return { clicked: true, text: title.textContent.trim() };
            }
        }
        return { clicked: false, availableItems: Array.from(document.querySelectorAll('.rm-item-title')).map(t => t.textContent.trim()) };
    });
    console.log('  Acme click result:', JSON.stringify(acmeResult));
    await sleep(2000);
    await screenshot(page, 'test2_04_after_acme');

    // List files
    const recordItems = await page.evaluate(() => {
        const items = document.querySelectorAll('.rm-item');
        return {
            count: items.length,
            items: Array.from(items).map(item => ({
                text: item.querySelector('.rm-item-title')?.textContent?.trim() || '',
                sublabel: item.querySelector('.rm-item-date')?.textContent?.trim() || '',
                badge: item.querySelector('.rm-item-badge')?.textContent?.trim() || ''
            }))
        };
    });
    console.log('  Record items (files):', JSON.stringify(recordItems, null, 2));

    // Check breadcrumb
    const breadcrumb2 = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.drive-breadcrumb-item')).map(b => b.textContent.trim());
    });
    console.log('  Breadcrumb:', breadcrumb2);

    // --- Step 6: Get full page text ---
    console.log('\n=== Step 6: Final page state ===');
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 2000));
    console.log('  Body text:\n', bodyText);

    // Check console logs for errors
    const errors = consoleLogs.filter(l => l.toLowerCase().includes('error'));
    if (errors.length > 0) {
        console.log('\n=== Console errors ===');
        errors.forEach(e => console.log('  ❌', e));
    }

    console.log('\n=== DONE ===');
    console.log('All screenshots in:', SCREENSHOTS_DIR);
    
    // Keep alive briefly then close
    await sleep(15000);
    await browser.close();
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
