const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function run() {
    console.log('=== STARTING AUTOMATED BROWSER TEST ===');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    try {
        // 1. Login
        console.log('[1/8] Navigating to login page at http://localhost:3000/auth/login...');
        await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle2' });
        
        console.log('[2/8] Entering credentials...');
        await page.waitForSelector('input[name="email"], input[type="email"]');
        await page.type('input[name="email"], input[type="email"]', 'boukirou6@hotmail.com');
        await page.type('input[name="password"], input[type="password"]', 'test');
        
        console.log('[3/8] Submitting login form...');
        await Promise.all([
            page.click('button[type="submit"], input[type="submit"], button'),
            page.waitForNavigation({ waitUntil: 'networkidle2' })
        ]);
        console.log('Login successful! Current URL:', page.url());

        // 2. Open Document Generation Wizard
        console.log('[4/8] Navigating to document generation wizard...');
        await page.goto('http://localhost:3000/account/5096/documents/6a0cc32c8582f628068fa250/generate', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 4000));

        const artifactDir = 'C:\\Users\\pc\\.gemini\\antigravity\\brain\\86f93efc-12db-4081-8233-7a854733cf75';
        fs.mkdirSync(artifactDir, { recursive: true });

        console.log('Taking screenshot of Step 1 (Record Selection)...');
        await page.screenshot({ path: path.join(artifactDir, '1_wizard_init.png') });
        console.log('Screenshot saved to 1_wizard_init.png');

        // 3. Select a record
        console.log('[5/8] Finding and selecting a record in Step 1...');
        const buttons = await page.$$('button');
        let recordButton = null;
        for (const btn of buttons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text && (text.includes('Acme Corp') || text.includes('TechCorp France'))) {
                recordButton = btn;
                break;
            }
        }
        
        if (recordButton) {
            const labelText = await page.evaluate(el => el.textContent, recordButton);
            console.log(`Clicking record button with label: "${labelText.trim().replace(/\s+/g, ' ')}"`);
            await recordButton.click();
        } else {
            console.log('No specific record button found via heuristics, clicking fallback selector...');
            await page.click('button:nth-of-type(3)');
        }

        // 4. Wait for Step 2
        console.log('[6/8] Waiting for Step 2 (Context grouping)...');
        await new Promise(r => setTimeout(r, 5000));
        
        console.log('Taking screenshot of Step 2 (Grouped related contexts)...');
        await page.screenshot({ path: path.join(artifactDir, '2_wizard_contexts.png') });
        console.log('Screenshot saved to 2_wizard_contexts.png');

        // 5. Generate document
        console.log('[7/8] Submitting context and generating document...');
        const confirmButtons = await page.$$('button');
        let generateBtn = null;
        for (const btn of confirmButtons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text && text.includes('Générer')) {
                generateBtn = btn;
                break;
            }
        }

        if (generateBtn) {
            console.log('Clicking "Générer" button...');
            await Promise.all([
                generateBtn.click(),
                page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 45000 })
            ]);
        } else {
            throw new Error('Générer button not found in Step 2');
        }

        // 6. Arrived at the Document Editor
        console.log('[8/8] Redirected to editor! Current URL:', page.url());
        console.log('Waiting for document editor to settle...');
        await new Promise(r => setTimeout(r, 7000));

        console.log('Taking screenshot of the generated draft editor page...');
        await page.screenshot({ path: path.join(artifactDir, '3_generated_draft.png') });
        console.log('Screenshot saved to 3_generated_draft.png');

        console.log('=== AUTOMATED TEST COMPLETED SUCCESSFULLY ===');
    } catch (err) {
        console.error('!!! TEST ERROR !!!', err);
    } finally {
        await browser.close();
    }
}

run();
