const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ 
        headless: false, 
        defaultViewport: null,
        args: ['--start-maximized']
    });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.error('PAGE ERROR:', err.message));
    
    try {
        console.log('Navigating to login...');
        await page.goto('http://localhost:3000/auth/login');
        
        await new Promise(r => setTimeout(r, 2000));
        const currentUrl = page.url();
        console.log('Current URL after initial load:', currentUrl);
        
        if (currentUrl.includes('/auth/login')) {
            console.log('Logging in...');
            await page.waitForSelector('input[type="email"]', { timeout: 10000 });
            await page.type('input[type="email"]', 'boukirou6@hotmail.com');
            await page.type('input[type="password"]', 'test');
            await page.click('button[type="submit"]');
            console.log('Submit clicked, waiting for navigation...');
            await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 });
        } else {
            console.log('Already logged in, skipping login form.');
        }
        
        console.log('Redirected to accounts, choosing workspace...');
        await page.waitForSelector('a[href*="/account/"]', { timeout: 15000 });
        
        const workspaces = await page.$$('a[href*="/account/"]');
        console.log(`Found ${workspaces.length} workspaces.`);
        let clicked = false;
        for (const ws of workspaces) {
            const text = await page.evaluate(el => el.textContent, ws);
            console.log('Workspace option:', text.trim());
            if (text.toLowerCase().includes('klerens')) {
                console.log('Found Klerens Group! Clicking...');
                await ws.click();
                clicked = true;
                break;
            }
        }
        
        if (!clicked && workspaces.length > 0) {
            console.log('Klerens group not found in text, clicking first workspace...');
            await workspaces[0].click();
        }
        
        console.log('Waiting for sidebar page navigation...');
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 });
        
        console.log('Waiting for sidebar element...');
        await page.waitForSelector('nav.sidebar', { timeout: 15000 });
        
        console.log('Opening create menu records wizard via Alpine hierarchy store...');
        await page.evaluate(() => {
            const sidebarEl = document.querySelector('[x-data^="sidebarHierarchy"]') || document.querySelector('[x-data*="showRecordsWizard"]');
            if (sidebarEl) {
                let data = null;
                if (sidebarEl.__x) {
                    data = sidebarEl.__x.$data;
                } else if (window.Alpine) {
                    data = window.Alpine.$data(sidebarEl);
                } else if (sidebarEl._x_dataStack) {
                    data = sidebarEl._x_dataStack[0];
                }
                if (data) {
                    data.openRecordsWizard();
                    console.log('Successfully called openRecordsWizard()');
                } else {
                    console.error('Could not get Alpine data stack from element');
                }
            } else {
                console.error('Sidebar element not found in evaluate');
            }
        });
        
        console.log('Waiting for modal to transition and render Step 1...');
        await new Promise(r => setTimeout(r, 1500)); 
        
        console.log('Choosing "Nouvelle" collection step (Step 2)...');
        await page.evaluate(() => {
            const sidebarEl = document.querySelector('[x-data^="sidebarHierarchy"]') || document.querySelector('[x-data*="showRecordsWizard"]');
            if (sidebarEl) {
                let data = null;
                if (sidebarEl.__x) {
                    data = sidebarEl.__x.$data;
                } else if (window.Alpine) {
                    data = window.Alpine.$data(sidebarEl);
                } else if (sidebarEl._x_dataStack) {
                    data = sidebarEl._x_dataStack[0];
                }
                if (data) {
                    data.recordsWizardMode = 'new';
                    data.recordsWizardStep = 2;
                    data.wizardNewName = 'Entreprise';
                    console.log('Successfully transitioned to step 2 "new" mode and set name to Entreprise');
                } else {
                    console.error('Could not get Alpine data stack in step 2 transition');
                }
            } else {
                console.error('Sidebar element not found in step 2 transition');
            }
        });
        
        console.log('Waiting for Step 2 to render and React IconPicker Island to mount...');
        await new Promise(r => setTimeout(r, 2000));
        
        console.log('Clicking the icon picker trigger button inside the React Island...');
        const pickerTrigger = await page.waitForSelector('[data-island="icon-picker"] .picker-trigger--icon', { timeout: 10000 });
        if (pickerTrigger) {
            await pickerTrigger.click();
            console.log('Clicked! Waiting for icons to load via fetch...');
            await new Promise(r => setTimeout(r, 3000));
        } else {
            console.error('Could not find picker trigger inside React Island!');
        }
        
        console.log('Triggering AI fields generation...');
        await page.evaluate(() => {
            const sidebarEl = document.querySelector('[x-data^="sidebarHierarchy"]') || document.querySelector('[x-data*="showRecordsWizard"]');
            if (sidebarEl) {
                let data = null;
                if (sidebarEl.__x) {
                    data = sidebarEl.__x.$data;
                } else if (window.Alpine) {
                    data = window.Alpine.$data(sidebarEl);
                } else if (sidebarEl._x_dataStack) {
                    data = sidebarEl._x_dataStack[0];
                }
                if (data) {
                    data.generateAIFields();
                    console.log('Successfully called generateAIFields()');
                } else {
                    console.error('Could not get Alpine data stack in AI fields generation');
                }
            } else {
                console.error('Sidebar element not found in AI fields generation');
            }
        });
        console.log('Waiting for AI generation to mock fields (1s delay)...');
        await new Promise(r => setTimeout(r, 1500));
        
        console.log('Taking screenshot...');
        const screenshotPath = 'C:/Users/pc/.gemini/antigravity-ide/brain/2391466c-2780-42be-9621-8b6092331720/modal_screenshot_icons.png';
        await page.screenshot({ path: screenshotPath });
        console.log('Screenshot saved to:', screenshotPath);
        
        console.log('Waiting 10s for user/agent to see the browser before closing...');
        await new Promise(r => setTimeout(r, 10000));
        
    } catch (e) {
        console.error('Error during automation:', e);
    } finally {
        await browser.close();
        console.log('Browser closed.');
    }
})();
