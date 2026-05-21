const puppeteer = require('puppeteer');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
    // Launch with no autofill
    const browser = await puppeteer.launch({ 
        headless: false, 
        defaultViewport: null,
        args: ['--disable-autofill', '--disable-features=AutofillServerCommunication']
    });
    const page = await browser.newPage();

    try {
        console.log('Navigating to login...');
        await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle2', timeout: 10000 });
        await sleep(2000);

        // Clear fields via JS first, then type via keyboard
        console.log('Clearing and typing email...');
        await page.$eval('input[type="email"]', el => { el.value = ''; el.focus(); });
        await sleep(200);
        await page.keyboard.type('boukirou6@hotmail.com', { delay: 20 });
        
        // Verify what's in the field
        const emailVal = await page.$eval('input[type="email"]', el => el.value);
        console.log('Email field value:', emailVal);

        console.log('Clearing and typing password...');
        await page.$eval('input[type="password"]', el => { el.value = ''; el.focus(); });
        await sleep(200);
        await page.keyboard.type('test', { delay: 20 });

        const passVal = await page.$eval('input[type="password"]', el => el.value);
        console.log('Password field value:', passVal);

        // Submit
        console.log('Submitting...');
        await page.click('button[type="submit"]');
        await sleep(4000);

        const urlAfterLogin = page.url();
        console.log('URL after login:', urlAfterLogin);

        if (urlAfterLogin.includes('error')) {
            console.log('Login failed! Trying again with form submit...');
            await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle2' });
            await sleep(1000);
            // Set values and submit form directly
            await page.evaluate(() => {
                const form = document.querySelector('form');
                const email = document.querySelector('input[type="email"]');
                const pass = document.querySelector('input[type="password"]');
                // Use native setter to bypass framework
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                nativeInputValueSetter.call(email, 'boukirou6@hotmail.com');
                email.dispatchEvent(new Event('input', { bubbles: true }));
                nativeInputValueSetter.call(pass, 'test');
                pass.dispatchEvent(new Event('input', { bubbles: true }));
            });
            await sleep(500);
            await page.click('button[type="submit"]');
            await sleep(4000);
            console.log('URL after retry:', page.url());
        }

        // Handle workspace selection
        if (page.url().includes('/user/accounts')) {
            console.log('Selecting workspace...');
            await page.evaluate(() => {
                const links = [...document.querySelectorAll('a')];
                const link = links.find(a => a.href && a.href.includes('5096'));
                if (link) { link.click(); return; }
                // Click first workspace
                const firstCard = document.querySelector('.card, [onclick]');
                if (firstCard) firstCard.click();
            });
            await sleep(3000);
        }

        // Navigate to deep link
        const testUrl = 'http://localhost:3000/account/5096/drive/app/6a0d6bf5491c52a4e438b718/6a0d6bf5491c52a4e438b72e';
        console.log('Navigating to:', testUrl);
        await page.goto(testUrl, { waitUntil: 'networkidle2', timeout: 15000 });
        await sleep(6000);

        const finalUrl = page.url();
        console.log('Final URL:', finalUrl);

        if (finalUrl.includes('/auth/login')) {
            console.log('❌ Still on login page - auth failed');
        } else {
            console.log('\n=== FIRST LOAD ===');
            const r1 = await page.evaluate(() => {
                const spinners = [...document.querySelectorAll('iconify-icon[icon="line-md:loading-twotone-loop"]')].filter(s => { const r = s.getBoundingClientRect(); return r.width > 0 && r.height > 0; }).length;
                const items = document.querySelectorAll('.rm-item').length;
                const el = document.querySelector('[x-data="driveModule"]');
                let alpine = null;
                if (el && el._x_dataStack) { const d = el._x_dataStack[0]; alpine = { loading: d.loading, globalLevel: d.globalLevel, files: (d.allFiles||[]).length }; }
                return { spinners, items, alpine };
            });
            console.log('Spinners:', r1.spinners, '| Items:', r1.items, '| Alpine:', JSON.stringify(r1.alpine));
            if (r1.spinners > 0 && r1.items > 0) console.log('❌ BUG');
            else if (r1.spinners === 0 && r1.items > 0) console.log('✅ OK');
            else if (r1.spinners > 0) console.log('❌ SPINNER STUCK');
            else console.log('⚠️ Empty');

            console.log('\n=== AFTER REFRESH ===');
            await page.reload({ waitUntil: 'networkidle2', timeout: 15000 });
            await sleep(6000);
            const r2 = await page.evaluate(() => {
                const spinners = [...document.querySelectorAll('iconify-icon[icon="line-md:loading-twotone-loop"]')].filter(s => { const r = s.getBoundingClientRect(); return r.width > 0 && r.height > 0; }).length;
                const items = document.querySelectorAll('.rm-item').length;
                const el = document.querySelector('[x-data="driveModule"]');
                let alpine = null;
                if (el && el._x_dataStack) { const d = el._x_dataStack[0]; alpine = { loading: d.loading, globalLevel: d.globalLevel, files: (d.allFiles||[]).length }; }
                return { spinners, items, alpine };
            });
            console.log('Spinners:', r2.spinners, '| Items:', r2.items, '| Alpine:', JSON.stringify(r2.alpine));
            if (r2.spinners > 0 && r2.items > 0) console.log('❌ BUG AFTER REFRESH');
            else if (r2.spinners === 0 && r2.items > 0) console.log('✅ REFRESH OK');
            else if (r2.spinners > 0) console.log('❌ SPINNER STUCK');
            else console.log('⚠️ Empty after refresh');
        }

        await page.screenshot({ path: 'scripts/drive-test-result.png', fullPage: true });
        console.log('Screenshot saved.');
    } catch (err) {
        console.error('Error:', err.message);
        await page.screenshot({ path: 'scripts/drive-test-error.png', fullPage: true }).catch(()=>{});
    }
    await sleep(3000);
    await browser.close();
    console.log('Done.');
})();
