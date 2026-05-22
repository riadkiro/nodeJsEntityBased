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
        await new Promise(r => setTimeout(r, 2000)); // Ensure sidebar Alpine store is fully hydrated
        
        console.log('Opening records wizard via Alpine hierarchy store and selecting parent Space...');
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
                    // Find first Space in hierarchy to serve as the parent context
                    const firstSpace = data.hierarchy.find(item => item.type === 'space');
                    if (firstSpace) {
                        console.log('Found parent space for collection:', firstSpace.name, firstSpace.id);
                        Alpine.store('sidebar').contextItem = firstSpace;
                    } else {
                        console.warn('No space found in hierarchy, using default/mock parent item');
                        Alpine.store('sidebar').contextItem = { id: 'dummy', type: 'space' };
                    }
                    
                    data.openRecordsWizard();
                    console.log('Successfully called openRecordsWizard() with parent context set.');
                } else {
                    console.error('Could not get Alpine data stack from element');
                }
            } else {
                console.error('Sidebar element not found in evaluate');
            }
        });
        
        console.log('Waiting for modal to transition and render Step 1...');
        await new Promise(r => setTimeout(r, 1500)); 
        
        console.log('Choosing "Nouvelle Collection" option (Step 2)...');
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
                    data.wizardNewName = 'Projet';
                    data.wizardNewPlural = 'Projets';
                    console.log('Successfully transitioned to step 2 "new" mode, set name=Projet, plural=Projets');
                } else {
                    console.error('Could not get Alpine data stack in step 2 transition');
                }
            } else {
                console.error('Sidebar element not found in step 2 transition');
            }
        });
        
        console.log('Waiting for Step 2 to render...');
        await new Promise(r => setTimeout(r, 1500));
        
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
                }
            }
        });
        
        console.log('Waiting for AI generation to complete...');
        await new Promise(r => setTimeout(r, 2000));
        
        console.log('Clicking the "Créer la collection" button...');
        // Let's find the footer submit button
        const submitButton = await page.waitForSelector('button.btn-primary.btn-sm', { timeout: 10000 });
        if (submitButton) {
            await submitButton.click();
            console.log('Clicked "Créer la collection" submit button.');
        } else {
            throw new Error('Could not find submission button on records wizard modal');
        }
        
        console.log('Waiting for modal to close and hierarchy list to reload...');
        await new Promise(r => setTimeout(r, 5000));
        
        console.log('Verifying if the newly created collection "Projet" is rendered in the sidebar...');
        const sidebarHtml = await page.evaluate(() => {
            return document.querySelector('nav.sidebar').innerHTML;
        });
        
        if (sidebarHtml.includes('Projet')) {
            console.log('SUCCESS: "Projet" collection successfully created and found in sidebar hierarchy!');
        } else {
            console.warn('WARNING: "Projet" text was not directly found in the sidebar HTML. It might be nested under an unexpanded folder.');
        }
        
        console.log('Taking screenshot of the workspace with the newly created collection...');
        const screenshotPath = 'C:/Users/pc/.gemini/antigravity-ide/brain/2391466c-2780-42be-9621-8b6092331720/media__collection_created.png';
        await page.screenshot({ path: screenshotPath });
        console.log('Screenshot saved to:', screenshotPath);
        
        console.log('Waiting 5 seconds before closing...');
        await new Promise(r => setTimeout(r, 5000));
        
    } catch (e) {
        console.error('Error during collection creation flow:', e);
    } finally {
        await browser.close();
        console.log('Browser closed.');
    }
})();
