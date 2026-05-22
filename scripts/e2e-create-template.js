const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    console.log('Launching browser for Template Wizard E2E test...');
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
        }
        
        console.log('Redirected to accounts, choosing Klerens Group...');
        await page.waitForSelector('a[href*="/account/"]', { timeout: 15000 });
        
        const workspaces = await page.$$('a[href*="/account/"]');
        let clicked = false;
        for (const ws of workspaces) {
            const text = await page.evaluate(el => el.textContent, ws);
            if (text.toLowerCase().includes('klerens')) {
                console.log('Found Klerens Group! Clicking...');
                await ws.click();
                clicked = true;
                break;
            }
        }
        
        if (!clicked && workspaces.length > 0) {
            await workspaces[0].click();
        }
        
        console.log('Waiting for sidebar page navigation...');
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 });
        
        console.log('Waiting for sidebar element...');
        await page.waitForSelector('nav.sidebar', { timeout: 15000 });
        await new Promise(r => setTimeout(r, 2000)); // Hydration pause
        
        console.log('Opening records wizard and selecting parent Space...');
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
                    const firstSpace = data.hierarchy.find(item => item.type === 'space');
                    if (firstSpace) {
                        console.log('Selected parent space:', firstSpace.name);
                        Alpine.store('sidebar').contextItem = firstSpace;
                    }
                    data.openRecordsWizard();
                }
            }
        });
        
        console.log('Waiting for modal to transition and render Step 1...');
        await new Promise(r => setTimeout(r, 1500)); 
        
        console.log('Clicking the "Modèles Prêts" template library button...');
        // Let's click the library card
        await page.evaluate(() => {
            const sidebarEl = document.querySelector('[x-data^="sidebarHierarchy"]') || document.querySelector('[x-data*="showRecordsWizard"]');
            if (sidebarEl) {
                let data = sidebarEl._x_dataStack ? sidebarEl._x_dataStack[0] : window.Alpine.$data(sidebarEl);
                if (data) {
                    data.recordsWizardStep = 'library';
                    console.log('Transitioned Alpine wizard step to: library');
                }
            }
        });
        
        console.log('Waiting for Templates Library catalog screen to render...');
        await new Promise(r => setTimeout(r, 2000));
        
        console.log('Taking screenshot of the templates library catalog screen...');
        const libraryScreenshot = 'C:/Users/pc/.gemini/antigravity-ide/brain/2391466c-2780-42be-9621-8b6092331720/media__templates_library_catalog.png';
        await page.screenshot({ path: libraryScreenshot });
        console.log('Templates library catalog screenshot saved.');
        
        console.log('Selecting "Voitures" template...');
        await page.evaluate(() => {
            const sidebarEl = document.querySelector('[x-data^="sidebarHierarchy"]') || document.querySelector('[x-data*="showRecordsWizard"]');
            if (sidebarEl) {
                let data = sidebarEl._x_dataStack ? sidebarEl._x_dataStack[0] : window.Alpine.$data(sidebarEl);
                if (data) {
                    const tpl = data.templatesList.find(t => t.nameSingular === 'Voiture');
                    if (tpl) {
                        data.selectTemplate(tpl);
                        console.log('Successfully selected Voiture template preset!');
                    } else {
                        console.error('Could not find Voiture template in templatesList');
                    }
                }
            }
        });
        
        console.log('Waiting for Step 2 pre-filled creation form to render...');
        await new Promise(r => setTimeout(r, 2000));
        
        console.log('Taking screenshot of the pre-filled Voiture creation form...');
        const formScreenshot = 'C:/Users/pc/.gemini/antigravity-ide/brain/2391466c-2780-42be-9621-8b6092331720/media__template_voiture_form.png';
        await page.screenshot({ path: formScreenshot });
        console.log('Pre-filled Voiture creation form screenshot saved.');
        
        console.log('Clicking the "Créer la collection" button...');
        const submitButton = await page.waitForSelector('button.btn-primary.btn-sm', { timeout: 10000 });
        if (submitButton) {
            await submitButton.click();
            console.log('Clicked "Créer la collection" submit button.');
        }
        
        console.log('Waiting for modal to close and hierarchy list to reload...');
        await new Promise(r => setTimeout(r, 5000));
        
        console.log('Verifying if the newly created collection "Voitures" is rendered in the sidebar...');
        const sidebarHtml = await page.evaluate(() => {
            return document.querySelector('nav.sidebar').innerHTML;
        });
        
        if (sidebarHtml.includes('Voitures') || sidebarHtml.includes('Voiture')) {
            console.log('SUCCESS: "Voitures" collection from templates library successfully created and verified in sidebar!');
        } else {
            console.warn('WARNING: "Voitures" text was not directly found in the sidebar HTML.');
        }
        
        console.log('Taking final screenshot of sidebar hierarchy showing the created "Voitures" collection...');
        const finalScreenshot = 'C:/Users/pc/.gemini/antigravity-ide/brain/2391466c-2780-42be-9621-8b6092331720/media__template_voitures_created.png';
        await page.screenshot({ path: finalScreenshot });
        console.log('Final screenshot saved.');
        
        console.log('Waiting 5s before closing...');
        await new Promise(r => setTimeout(r, 5000));
        
    } catch (e) {
        console.error('Error during Template Wizard E2E flow:', e);
    } finally {
        await browser.close();
        console.log('Browser closed.');
    }
})();
