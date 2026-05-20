const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

async function checkDatabase() {
    try {
        const conn = await mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5096');
        await new Promise(r => conn.once('open', r));
        
        const doc = await conn.db.collection('documents').findOne({ _id: new mongoose.Types.ObjectId('6a0d4afbb7e23b5b93217d71') });
        const record = await conn.db.collection('records').findOne({ _id: new mongoose.Types.ObjectId('6a0b4221f1c5ddd28f737c99') });
        
        console.log('\n--- DATABASE STATUS ---');
        if (doc) {
            console.log(`Draft document still exists! isDraft: ${doc.isDraft}, status: ${doc.status}`);
        } else {
            console.log('Draft document has been deleted (Expected in Path A when attached to record)');
        }
        
        if (record) {
            console.log(`Record has ${record.attachments?.length || 0} attachments.`);
            const attachedGenerated = record.attachments?.filter(a => a.isGenerated);
            console.log('Generated attachments on record:', JSON.stringify(attachedGenerated, null, 2));
        } else {
            console.log('Record not found!');
        }
        
        await conn.close();
    } catch (err) {
        console.error('Database check error:', err);
    }
}

async function run() {
    console.log('Starting E2E verification of "Finaliser et générer" in React Editor...');
    
    // Check initial db state
    await checkDatabase();

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Listen to page console log for debugging
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    await page.setViewport({ width: 1440, height: 900 });

    console.log('Navigating to login page...');
    await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle2' });
    await page.type('input[name="email"]', 'boukirou6@hotmail.com');
    await page.type('input[name="password"]', 'test');
    
    console.log('Submitting login form...');
    await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);
    
    console.log('Navigating to target React editor URL...');
    await page.goto('http://localhost:3000/account/5096/documents/6a0d4afbb7e23b5b93217d71/edit-react', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for full rendering of Editor and iframe

    console.log('Taking editor screenshot before finalization...');
    const artifactsDir = 'C:\\Users\\pc\\.gemini\\antigravity\\brain\\be1783da-c47b-41e8-8631-3525dae30632';
    if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir, { recursive: true });
    }
    await page.screenshot({ path: path.join(artifactsDir, 'editor_before_finalization.png') });
    console.log('Editor screenshot captured!');

    // Look for emerald "Finaliser et générer" button
    console.log('Searching for "Finaliser et générer" button...');
    const btnExists = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const finalizeBtn = buttons.find(b => b.textContent.includes('Finaliser et générer'));
        if (finalizeBtn) {
            console.log('Found button! Text:', finalizeBtn.textContent);
            return true;
        }
        console.error('Could not find "Finaliser et générer" button on page');
        return false;
    });

    if (!btnExists) {
        console.error('Finalization button was not found. Exiting.');
        await browser.close();
        return;
    }

    console.log('Clicking "Finaliser et générer" button...');
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const finalizeBtn = buttons.find(b => b.textContent.includes('Finaliser et générer'));
        if (finalizeBtn) {
            finalizeBtn.click();
        }
    });

    console.log('Waiting for finalization to complete and success modal to render...');
    // The finalization triggers a POST request and then renders the Success Modal Overlay (backdrop-blur-sm)
    await page.waitForSelector('.backdrop-blur-sm', { timeout: 30000 });
    console.log('Success Modal found! Waiting 2 seconds for animations to settle...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Capturing Success Modal screenshot...');
    const successModalPath = path.join(artifactsDir, 'finalized_success_modal.png');
    await page.screenshot({ path: successModalPath });
    console.log(`Success Modal screenshot captured at: ${successModalPath}`);

    // Check final db state
    await checkDatabase();

    await browser.close();
    console.log('E2E verification completed successfully!');
}

run().catch(console.error);
