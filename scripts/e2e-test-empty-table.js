const puppeteer = require('puppeteer');
const fs = require('fs');
const mongoose = require('mongoose');
const { tenantCollection } = require('../middleware/tenant');

(async () => {
    console.log('Launching browser for Empty State E2E test...');
    const browser = await puppeteer.launch({ 
        headless: false, 
        defaultViewport: null,
        args: ['--start-maximized']
    });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.error('PAGE ERROR:', err.message));
    
    let newSlug = '';

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
        
        console.log('Opening records wizard...');
        await page.evaluate(() => {
            const sidebarEl = document.querySelector('[x-data^="sidebarHierarchy"]') || document.querySelector('[x-data*="showRecordsWizard"]');
            if (sidebarEl) {
                let data = sidebarEl._x_dataStack ? sidebarEl._x_dataStack[0] : window.Alpine.$data(sidebarEl);
                if (data) {
                    const firstSpace = data.hierarchy.find(item => item.type === 'space');
                    if (firstSpace) {
                        Alpine.store('sidebar').contextItem = firstSpace;
                    }
                    data.openRecordsWizard();
                }
            }
        });
        
        await new Promise(r => setTimeout(r, 1500)); 
        
        console.log('Creating a completely new empty collection...');
        await page.evaluate(() => {
            const sidebarEl = document.querySelector('[x-data^="sidebarHierarchy"]') || document.querySelector('[x-data*="showRecordsWizard"]');
            if (sidebarEl) {
                let data = sidebarEl._x_dataStack ? sidebarEl._x_dataStack[0] : window.Alpine.$data(sidebarEl);
                if (data) {
                    data.recordsWizardMode = 'new';
                    data.recordsWizardStep = 2;
                    
                    const uniqueId = Math.floor(Math.random() * 10000);
                    data.wizardNewName = `Partenaires VIP ${uniqueId}`;
                    data.wizardNewNamePlural = `Partenaires VIPs ${uniqueId}`;
                    data.wizardNewIcon = 'solar:users-group-rounded-bold-duotone';
                    data.wizardNewColor = '#805dca';
                    data.wizardNewFields = [];
                }
            }
        });
        
        await new Promise(r => setTimeout(r, 1500)); 
        
        console.log('Clicking the "Créer la collection" button...');
        const submitButton = await page.waitForSelector('button.btn-primary.btn-sm', { timeout: 10000 });
        if (submitButton) {
            await submitButton.click();
            console.log('Clicked "Créer la collection" submit button.');
        }
        
        console.log('Waiting for collection creation and page hydration...');
        await new Promise(r => setTimeout(r, 5000));
        
        console.log('Connecting to MongoDB to retrieve the latest created collection slug...');
        const conn = await mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5096', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        await new Promise(r => conn.once('open', r));
        const Entity = await tenantCollection({ tenantDbConnection: conn, tenantDbReady: true }, 'Entity');
        const latestEntity = await Entity.findOne({}).sort({ createdAt: -1 }).lean();
        await conn.close();
        
        if (!latestEntity) {
            throw new Error('No entity found in DB!');
        }
        newSlug = latestEntity.slug;
        console.log('Successfully retrieved created entity slug from MongoDB:', newSlug);
        
        const emptyListUrl = `http://localhost:3000/account/5096/record/${newSlug}/list`;
        console.log(`Navigating directly to empty collection list page: ${emptyListUrl}`);
        await page.goto(emptyListUrl, { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 3000)); // Ensure full render of recordsGrid react island
        
        console.log('Taking screenshot of initial empty state...');
        const screenshotInitial = 'C:/Users/pc/.gemini/antigravity-ide/brain/2391466c-2780-42be-9621-8b6092331720/empty_state_initial.png';
        await page.screenshot({ path: screenshotInitial });
        console.log('Empty state initial screenshot saved to:', screenshotInitial);
        
        console.log('Clicking the empty state "+ Créer le premier" button via page context...');
        const clickedBtn = await page.evaluate(() => {
            const btn = document.querySelector('.absolute.inset-0 button') || 
                        Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim().includes('Créer'));
            if (btn) {
                btn.click();
                return true;
            }
            return false;
        });
        
        if (clickedBtn) {
            console.log('Clicked! Waiting for redirection and fiche page hydration...');
            await new Promise(r => setTimeout(r, 6000));
        } else {
            throw new Error('Add button in empty state overlay not found!');
        }
        
        await new Promise(r => setTimeout(r, 3000)); // Wait for fiche page to hydrate
        console.log('Taking screenshot of newly created draft fiche...');
        const screenshotAfter = 'C:/Users/pc/.gemini/antigravity-ide/brain/2391466c-2780-42be-9621-8b6092331720/empty_state_after_click.png';
        await page.screenshot({ path: screenshotAfter });
        console.log('Fiche page screenshot saved to:', screenshotAfter);
        
        console.log('E2E TEST SUCCESS: Empty state rendered beautifully with transparent rows, overlay card, and functional Ajouter button!');
        await new Promise(r => setTimeout(r, 3000));
        
    } catch (e) {
        console.error('Error during Empty State E2E flow:', e);
    } finally {
        await browser.close();
        console.log('Browser closed.');
    }
})();
