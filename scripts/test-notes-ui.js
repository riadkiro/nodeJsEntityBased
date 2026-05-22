const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\pc\\.gemini\\antigravity\\brain\\cf68d445-0e9d-459b-9c85-153dd2d55472';
const APP_URL = 'http://localhost:3000';

let idx = 0;
async function ss(page, name) {
    idx++;
    const f = `scope_${idx}_${name}.png`;
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, f) });
    console.log(`📸 [${idx}] ${name}`);
}
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    console.log('🚀 Testing SCOPED clear formatting on "Test Complet Toolbar"...\n');
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

    // Navigate
    await page.goto(`${APP_URL}/account/5096/record/contacts/6a0d6bf5491c52a4e438b729/notes`, { waitUntil: 'networkidle2' });
    await wait(3000);

    // Click on "Test Complet Toolbar"
    console.log('📝 Opening "Test Complet Toolbar"...');
    const noteItem = await page.evaluateHandle(() => {
        const items = document.querySelectorAll('.note-list-item');
        for (const item of items) {
            const title = item.querySelector('.note-list-item-title span');
            if (title && title.textContent.includes('Test Complet Toolbar')) return item;
        }
        return null;
    });
    
    if (noteItem) {
        await noteItem.click();
        await wait(2000);
    } else {
        console.log('   ❌ Note not found!');
        await browser.close();
        return;
    }

    // Get initial content info
    const initialState = await page.evaluate(() => {
        const editor = document.querySelector('.ne-content');
        if (!editor) return {};
        return {
            innerHTML: editor.innerHTML.substring(0, 500),
            h1Count: editor.querySelectorAll('h1').length,
            h2Count: editor.querySelectorAll('h2').length,
            h3Count: editor.querySelectorAll('h3').length,
            bCount: editor.querySelectorAll('b, strong').length,
            fontCount: editor.querySelectorAll('font').length,
            totalChildren: editor.children.length,
        };
    });
    console.log('\n   === INITIAL STATE ===');
    console.log(`   Children: ${initialState.totalChildren}`);
    console.log(`   H1: ${initialState.h1Count}, H2: ${initialState.h2Count}, H3: ${initialState.h3Count}`);
    console.log(`   Bold: ${initialState.bCount}, Font: ${initialState.fontCount}`);
    
    await ss(page, 'initial_state');

    // ═══ TEST: Select ONLY the first paragraph, clear it ═══
    console.log('\n═══ TEST: Select only FIRST paragraph and clear ═══');
    
    // Click at the start of the content
    await page.click('.ne-content');
    await wait(200);
    
    // Move to the very start
    await page.keyboard.down('Control');
    await page.keyboard.press('Home');
    await page.keyboard.up('Control');
    await wait(100);
    
    // Select just the first line (Home -> Shift+End)
    await page.keyboard.press('Home');
    await page.keyboard.down('Shift');
    await page.keyboard.press('End');
    await page.keyboard.up('Shift');
    await wait(300);
    
    await ss(page, 'first_line_selected');
    
    // Check what's selected
    const selectedText = await page.evaluate(() => {
        const sel = window.getSelection();
        return sel.toString().substring(0, 60);
    });
    console.log(`   Selected text: "${selectedText}..."`);
    
    // Click clear formatting
    const clearBtn = await page.evaluateHandle(() => {
        return Array.from(document.querySelectorAll('.ne-toolbar > button')).find(b => b.title === 'Effacer formatage');
    });
    await clearBtn.click();
    await wait(800);
    
    // Check the state after partial clear
    const afterPartialClear = await page.evaluate(() => {
        const editor = document.querySelector('.ne-content');
        if (!editor) return {};
        return {
            h1Count: editor.querySelectorAll('h1').length,
            h2Count: editor.querySelectorAll('h2').length,
            h3Count: editor.querySelectorAll('h3').length,
            bCount: editor.querySelectorAll('b, strong').length,
            fontCount: editor.querySelectorAll('font').length,
            totalChildren: editor.children.length,
            // Check if rest of content still has formatting
            hasFormattedContent: editor.querySelectorAll('b, strong, i, em, font, h1, h2, h3').length > 0
        };
    });
    console.log('\n   === AFTER PARTIAL CLEAR ===');
    console.log(`   H1: ${afterPartialClear.h1Count}, H2: ${afterPartialClear.h2Count}, H3: ${afterPartialClear.h3Count}`);
    console.log(`   Bold: ${afterPartialClear.bCount}, Font: ${afterPartialClear.fontCount}`);
    console.log(`   Rest still has formatting: ${afterPartialClear.hasFormattedContent}`);
    
    // The key test: if we only cleared the first line, the rest should still have formatting
    const scopedCorrectly = afterPartialClear.hasFormattedContent;
    console.log(`\n   ✅ Scoped to selection only: ${scopedCorrectly ? 'PASS — rest preserved!' : 'FAIL — everything got cleared!'}`);
    
    await ss(page, 'after_partial_clear');

    // ═══ TEST 2: Now select ALL and clear everything ═══
    console.log('\n═══ TEST 2: Select ALL and clear (should clean everything) ═══');
    
    await page.click('.ne-content');
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await wait(200);
    
    await clearBtn.click();
    await wait(800);
    
    const afterFullClear = await page.evaluate(() => {
        const editor = document.querySelector('.ne-content');
        return {
            h1Count: editor.querySelectorAll('h1').length,
            bCount: editor.querySelectorAll('b, strong').length,
            fontCount: editor.querySelectorAll('font').length,
            styledCount: editor.querySelectorAll('[style]').length,
        };
    });
    console.log(`   After Ctrl+A clear: H1=${afterFullClear.h1Count}, Bold=${afterFullClear.bCount}, Font=${afterFullClear.fontCount}, Styled=${afterFullClear.styledCount}`);
    const fullClean = afterFullClear.h1Count === 0 && afterFullClear.bCount === 0 && afterFullClear.fontCount === 0;
    console.log(`   ✅ Full clear works: ${fullClean ? 'PASS' : 'FAIL'}`);
    
    await ss(page, 'after_full_clear');

    await wait(3000);

    console.log('\n═══════════════════════════════════════════');
    console.log('  🎉 SCOPED CLEAR FORMATTING TEST COMPLETE');
    console.log('═══════════════════════════════════════════');

    await browser.close();
})();
