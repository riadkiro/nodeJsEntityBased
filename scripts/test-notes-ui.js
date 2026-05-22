const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\pc\\.gemini\\antigravity\\brain\\cf68d445-0e9d-459b-9c85-153dd2d55472';
const APP_URL = 'http://localhost:3000';

let idx = 0;
async function ss(page, name) {
    idx++;
    const f = `ip_${idx}_${name}.png`;
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, f) });
    console.log(`📸 [${idx}] ${name}`);
}
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    console.log('🚀 Testing Universal Image Picker...\n');
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

    // Open a note
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

    // ═══ TEST 1: Click image button → opens Image Picker ═══
    console.log('\n═══ TEST 1: Open Image Picker ═══');
    // Click the image button
    await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('.ne-toolbar button')).find(b => b.title === 'Insérer une image');
        if (btn) btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    });
    await wait(2000);

    const pickerInfo = await page.evaluate(() => {
        const overlay = document.querySelector('.ip-overlay');
        const modal = document.querySelector('.ip-modal');
        const tabs = document.querySelectorAll('.ip-tab');
        const activeTab = document.querySelector('.ip-tab.active');
        return {
            overlayVisible: !!overlay,
            modalVisible: !!modal,
            tabCount: tabs.length,
            tabLabels: Array.from(tabs).map(t => t.textContent.trim()),
            activeTabLabel: activeTab?.textContent?.trim() || 'none'
        };
    });
    console.log(`   Overlay visible: ${pickerInfo.overlayVisible ? 'PASS ✅' : 'FAIL ❌'}`);
    console.log(`   Tab count: ${pickerInfo.tabCount} (expected 3)`);
    console.log(`   Tab labels: ${JSON.stringify(pickerInfo.tabLabels)}`);
    console.log(`   Active tab: "${pickerInfo.activeTabLabel}" (expected "Uploader")`);
    await ss(page, 'picker_open_upload_tab');

    // ═══ TEST 2: Check upload tab layout (dropzone + recent images) ═══
    console.log('\n═══ TEST 2: Upload tab layout ═══');
    const uploadInfo = await page.evaluate(() => {
        const dropzone = document.querySelector('.ip-dropzone');
        const urlRow = document.querySelector('.ip-url-row');
        const recentSection = document.querySelector('.ip-recent-section');
        const recentThumbs = document.querySelectorAll('.ip-recent-thumb');
        const openDriveBtn = document.querySelector('.ip-recent-link');
        return {
            hasDropzone: !!dropzone,
            hasUrlRow: !!urlRow,
            hasRecentSection: !!recentSection,
            recentCount: recentThumbs.length,
            hasOpenDriveBtn: !!openDriveBtn,
            openDriveBtnText: openDriveBtn?.textContent?.trim() || ''
        };
    });
    console.log(`   Dropzone: ${uploadInfo.hasDropzone ? 'PASS ✅' : 'FAIL ❌'}`);
    console.log(`   URL input row: ${uploadInfo.hasUrlRow ? 'PASS ✅' : 'FAIL ❌'}`);
    console.log(`   Recent section: ${uploadInfo.hasRecentSection ? 'PASS ✅' : 'FAIL ❌'}`);
    console.log(`   Recent thumbs: ${uploadInfo.recentCount}`);
    console.log(`   "Ouvrir le Drive" button: ${uploadInfo.hasOpenDriveBtn ? 'PASS ✅' : 'FAIL ❌'} ("${uploadInfo.openDriveBtnText}")`);
    await ss(page, 'upload_tab_layout');

    // ═══ TEST 3: Switch to Rechercher tab ═══
    console.log('\n═══ TEST 3: Rechercher tab ═══');
    await page.evaluate(() => {
        const tabs = document.querySelectorAll('.ip-tab');
        tabs[1]?.click(); // 2nd tab = Rechercher
    });
    await wait(500);
    const searchTabInfo = await page.evaluate(() => {
        const activeTab = document.querySelector('.ip-tab.active');
        const searchBar = document.querySelector('.ip-search-bar');
        return {
            activeLabel: activeTab?.textContent?.trim() || '',
            hasSearchBar: !!searchBar
        };
    });
    console.log(`   Active: "${searchTabInfo.activeLabel}" ${searchTabInfo.activeLabel.includes('Rechercher') ? '✅' : '❌'}`);
    console.log(`   Search bar: ${searchTabInfo.hasSearchBar ? 'PASS ✅' : 'FAIL ❌'}`);
    await ss(page, 'rechercher_tab');

    // ═══ TEST 4: Switch to Drive tab ═══
    console.log('\n═══ TEST 4: Drive tab ═══');
    await page.evaluate(() => {
        const tabs = document.querySelectorAll('.ip-tab');
        tabs[2]?.click(); // 3rd tab = Drive
    });
    await wait(2000);
    const driveTabInfo = await page.evaluate(() => {
        const activeTab = document.querySelector('.ip-tab.active');
        const breadcrumb = document.querySelector('.ip-breadcrumb');
        const grid = document.querySelector('.ip-grid');
        const items = document.querySelectorAll('.ip-grid-item');
        return {
            activeLabel: activeTab?.textContent?.trim() || '',
            hasBreadcrumb: !!breadcrumb,
            hasGrid: !!grid,
            itemCount: items.length
        };
    });
    console.log(`   Active: "${driveTabInfo.activeLabel}" ${driveTabInfo.activeLabel.includes('Drive') ? '✅' : '❌'}`);
    console.log(`   Breadcrumb: ${driveTabInfo.hasBreadcrumb ? 'PASS ✅' : 'FAIL ❌'}`);
    console.log(`   Images in grid: ${driveTabInfo.itemCount}`);
    await ss(page, 'drive_tab');

    // ═══ TEST 5: Close and verify no visual regressions ═══
    console.log('\n═══ TEST 5: Close picker ═══');
    await page.evaluate(() => {
        const closeBtn = document.querySelector('.ip-header-close');
        if (closeBtn) closeBtn.click();
    });
    await wait(500);
    const closed = await page.evaluate(() => !document.querySelector('.ip-overlay'));
    console.log(`   Picker closed: ${closed ? 'PASS ✅' : 'FAIL ❌'}`);
    await ss(page, 'picker_closed');

    // ═══ TEST 6: Only 1 image button in toolbar ═══
    console.log('\n═══ TEST 6: Single image button ═══');
    const imageButtons = await page.evaluate(() => {
        const btns = document.querySelectorAll('.ne-toolbar button');
        return Array.from(btns).filter(b => {
            const icon = b.querySelector('iconify-icon');
            return icon && icon.getAttribute('icon') === 'solar:gallery-bold-duotone';
        }).length;
    });
    console.log(`   Gallery buttons: ${imageButtons} (expected 1) ${imageButtons === 1 ? 'PASS ✅' : 'FAIL ❌'}`);

    console.log('\n═══════════════════════════════════════════');
    console.log('  🎉 ALL IMAGE PICKER TESTS COMPLETE');
    console.log('═══════════════════════════════════════════');

    await wait(2000);
    await browser.close();
})();
