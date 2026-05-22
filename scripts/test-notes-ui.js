const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\pc\\.gemini\\antigravity\\brain\\cf68d445-0e9d-459b-9c85-153dd2d55472';
const APP_URL = 'http://localhost:3000';

let idx = 0;
async function ss(page, name) {
    idx++;
    const f = `premium_${idx}_${name}.png`;
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, f) });
    console.log(`📸 [${idx}] ${name}`);
}
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    console.log('🚀 Testing remaining premium features...\n');
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });
    const page = (await browser.pages())[0];
    await page.setViewport({ width: 1400, height: 900 });

    // Login
    await page.goto(`${APP_URL}/auth/login`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
        document.querySelector('input[type="email"]').value = '';
        document.querySelector('input[type="password"]').value = '';
    });
    await page.type('input[type="email"]', 'boukirou6@hotmail.com');
    await page.type('input[type="password"]', 'test');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    if (page.url().includes('/user/accounts')) {
        await page.goto(`${APP_URL}/user/select-account/5096`, { waitUntil: 'networkidle2' });
    }
    console.log('✅ Logged in\n');

    // Navigate to notes
    await page.goto(`${APP_URL}/account/5096/record/contacts/6a0d6bf5491c52a4e438b729/notes`, { waitUntil: 'networkidle2' });
    await wait(3000);

    // Open "Test Complet Toolbar"
    console.log('📝 Opening "Test Complet Toolbar"...');
    await page.evaluate(() => {
        const items = document.querySelectorAll('.note-list-item');
        for (const item of items) {
            const title = item.querySelector('.note-list-item-title span');
            if (title && title.textContent.includes('Test Complet Toolbar')) {
                item.click();
                return;
            }
        }
    });
    await wait(2000);
    await ss(page, 'initial');

    // ═══ TEST 1: Image Resize to 25% then 100% ═══
    console.log('\n═══ TEST 1: Image resize (25% then back to 100%) ═══');
    // Click image via evaluate to avoid clickable issues
    await page.evaluate(() => {
        const img = document.querySelector('.ne-content img');
        if (img) img.click();
    });
    await wait(500);
    
    // Click 25%
    await page.evaluate(() => {
        const tb = document.querySelector('.ne-image-toolbar');
        if (tb) {
            const btn = Array.from(tb.querySelectorAll('button')).find(b => b.textContent.trim() === '25%');
            if (btn) btn.click();
        }
    });
    await wait(500);
    
    const w25 = await page.evaluate(() => document.querySelector('.ne-content img')?.style.width);
    console.log(`   25% resize: ${w25 === '25%' ? 'PASS ✅' : 'FAIL ❌ (got: ' + w25 + ')'}`);
    await ss(page, 'resize_25');
    
    // Click image again and resize to 100%
    await page.evaluate(() => {
        const img = document.querySelector('.ne-content img');
        if (img) img.click();
    });
    await wait(300);
    await page.evaluate(() => {
        const tb = document.querySelector('.ne-image-toolbar');
        if (tb) {
            const btn = Array.from(tb.querySelectorAll('button')).find(b => b.textContent.trim() === '100%');
            if (btn) btn.click();
        }
    });
    await wait(500);
    const w100 = await page.evaluate(() => document.querySelector('.ne-content img')?.style.width);
    console.log(`   100% resize: ${w100 === '100%' ? 'PASS ✅' : 'FAIL ❌ (got: ' + w100 + ')'}`);
    await ss(page, 'resize_100');

    // ═══ TEST 2: Link test ═══
    console.log('\n═══ TEST 2: Link functionality ═══');
    // Click away first to close image toolbar
    await page.evaluate(() => {
        const editor = document.querySelector('.ne-content');
        if (editor) editor.click();
    });
    await wait(300);
    
    const linkInfo = await page.evaluate(() => {
        const a = document.querySelector('.ne-content a');
        return a ? { href: a.getAttribute('href'), target: a.getAttribute('target'), text: a.textContent } : null;
    });
    if (linkInfo) {
        console.log(`   Link found: "${linkInfo.text}" → ${linkInfo.href}`);
        console.log(`   target="_blank": ${linkInfo.target === '_blank' ? 'PASS ✅' : 'FAIL ❌'}`);
    } else {
        console.log('   No links found — inserting a test link');
        // Click at end of content
        await page.evaluate(() => {
            const editor = document.querySelector('.ne-content');
            editor.focus();
            const sel = window.getSelection();
            sel.selectAllChildren(editor);
            sel.collapseToEnd();
        });
        await wait(200);
        
        // Click link button via evaluate
        await page.evaluate(() => {
            const btn = Array.from(document.querySelectorAll('.ne-toolbar button')).find(b => b.title === 'Insérer un lien');
            if (btn) btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
        });
        await wait(800);
        
        // Fill the modal
        await page.evaluate(() => {
            const inputs = document.querySelectorAll('.ne-inline-modal input');
            if (inputs[0]) { inputs[0].value = 'Google'; inputs[0].dispatchEvent(new Event('input')); }
            if (inputs[1]) { inputs[1].value = 'https://google.com'; inputs[1].dispatchEvent(new Event('input')); }
        });
        await wait(300);
        
        // Click insert
        await page.evaluate(() => {
            const btn = document.querySelector('.ne-inline-modal .btn-insert');
            if (btn) btn.click();
        });
        await wait(500);
        
        const newLink = await page.evaluate(() => {
            const a = document.querySelector('.ne-content a');
            return a ? { href: a.getAttribute('href'), target: a.getAttribute('target') } : null;
        });
        if (newLink) {
            console.log(`   Inserted link: target="${newLink.target}" href="${newLink.href}"`);
            console.log(`   ✅ Link with target="_blank": ${newLink.target === '_blank' ? 'PASS' : 'FAIL'}`);
        }
    }
    await ss(page, 'links');

    // ═══ TEST 3: Drive modal ═══
    console.log('\n═══ TEST 3: Drive images modal ═══');
    // Save selection first
    await page.evaluate(() => {
        const editor = document.querySelector('.ne-content');
        if (editor) editor.focus();
    });
    await wait(200);
    
    await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('.ne-toolbar button')).find(b => b.title === 'Insérer depuis le Drive');
        if (btn) btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    });
    await wait(2500);
    
    const driveModalInfo = await page.evaluate(() => {
        const overlay = document.querySelector('.ne-inline-modal-overlay');
        const items = document.querySelectorAll('.ne-drive-item');
        const emptyMsg = document.querySelector('.ne-drive-empty');
        return {
            visible: !!overlay,
            imageCount: items.length,
            hasEmptyMsg: !!emptyMsg,
            emptyText: emptyMsg?.textContent?.trim() || ''
        };
    });
    console.log(`   Drive modal visible: ${driveModalInfo.visible ? 'PASS ✅' : 'FAIL ❌'}`);
    console.log(`   Drive images found: ${driveModalInfo.imageCount}`);
    if (driveModalInfo.hasEmptyMsg) {
        console.log(`   Empty message: "${driveModalInfo.emptyText}"`);
    }
    await ss(page, 'drive_modal');
    
    // If images found, click one to insert
    if (driveModalInfo.imageCount > 0) {
        await page.evaluate(() => {
            const item = document.querySelector('.ne-drive-item');
            if (item) item.click();
        });
        await wait(1000);
        console.log('   ✅ Inserted Drive image');
        await ss(page, 'drive_inserted');
    } else {
        // Close modal
        await page.evaluate(() => {
            const btn = document.querySelector('.ne-inline-modal .btn-cancel');
            if (btn) btn.click();
        });
        await wait(300);
    }

    // ═══ TEST 4: Delete image ═══
    console.log('\n═══ TEST 4: Image delete ═══');
    const imgCount1 = await page.evaluate(() => document.querySelectorAll('.ne-content img').length);
    console.log(`   Images before delete: ${imgCount1}`);
    
    if (imgCount1 > 0) {
        // Click last image
        await page.evaluate(() => {
            const imgs = document.querySelectorAll('.ne-content img');
            const lastImg = imgs[imgs.length - 1];
            if (lastImg) lastImg.click();
        });
        await wait(500);
        
        // Click delete button
        await page.evaluate(() => {
            const tb = document.querySelector('.ne-image-toolbar');
            if (tb) {
                const delBtn = tb.querySelector('.delete-btn');
                if (delBtn) delBtn.click();
            }
        });
        await wait(500);
        
        const imgCount2 = await page.evaluate(() => document.querySelectorAll('.ne-content img').length);
        console.log(`   Images after delete: ${imgCount2}`);
        console.log(`   ✅ Image deleted: ${imgCount2 === imgCount1 - 1 ? 'PASS' : 'FAIL'}`);
        await ss(page, 'image_deleted');
    }

    // ═══ TEST 5: Notes Hub ═══
    console.log('\n═══ TEST 5: Notes Hub ═══');
    await page.goto(`${APP_URL}/account/5096/notes`, { waitUntil: 'networkidle2' });
    await wait(3000);
    
    const hubInfo = await page.evaluate(() => {
        return {
            title: document.title,
            hasAlpine: !!document.querySelector('[x-data]'),
            hasContent: document.body.innerText.length > 100,
            url: window.location.href
        };
    });
    console.log(`   URL: ${hubInfo.url}`);
    console.log(`   Title: ${hubInfo.title}`);
    console.log(`   Has Alpine: ${hubInfo.hasAlpine ? 'PASS ✅' : 'FAIL ❌'}`);
    console.log(`   Has content: ${hubInfo.hasContent ? 'PASS ✅' : 'FAIL ❌'}`);
    await ss(page, 'notes_hub');

    await wait(3000);

    console.log('\n═══════════════════════════════════════════');
    console.log('  🎉 ALL PREMIUM TESTS COMPLETE');
    console.log('═══════════════════════════════════════════');

    await browser.close();
})();
