/**
 * Final Security Audit — Tests authenticated AND unauthenticated access
 */
const http = require('http');

function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const reqOpts = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {},
        };
        const req = http.request(reqOpts, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({
                status: res.statusCode,
                headers: res.headers,
                body: body.substring(0, 500),
                cookies: res.headers['set-cookie'],
            }));
        });
        req.on('error', reject);
        if (options.body) req.write(options.body);
        req.end();
    });
}

// Login and get session cookie
async function login() {
    // Step 1: Get the login page (grab CSRF or session cookie)
    const loginPage = await makeRequest('http://localhost:3000/auth/login');
    const initialCookies = (loginPage.cookies || []).map(c => c.split(';')[0]).join('; ');

    // Step 2: POST login
    const loginBody = 'email=boukirou6%40hotmail.com&password=test';
    const loginRes = await makeRequest('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': initialCookies,
        },
        body: loginBody,
    });
    
    // Collect all cookies
    const allCookies = [...(loginPage.cookies || []), ...(loginRes.cookies || [])];
    const cookieStr = allCookies.map(c => c.split(';')[0]).join('; ');
    return cookieStr;
}

async function audit() {
    console.log('=== FINAL SECURITY AUDIT ===\n');

    // Get a DB record filename to test
    const mongoose = require('mongoose');
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5096', { useNewUrlParser: true });
    const record = await mongoose.connection.db.collection('records').findOne(
        { 'attachments.0': { $exists: true } },
        { projection: { attachments: { $slice: 1 } } }
    );
    const testFilename = record?.attachments?.[0]?.filename;
    await mongoose.connection.close();
    
    console.log(`Test file from DB: ${testFilename}\n`);

    // ----- UNAUTHENTICATED TESTS -----
    console.log('=== UNAUTHENTICATED ACCESS TESTS ===\n');

    // Test 1: Direct static access (old path without UUID)
    console.log('TEST 1: Direct static /uploads/attachments/...');
    const t1 = await makeRequest('http://localhost:3000/uploads/attachments/5096/test.pdf');
    console.log(`  Status: ${t1.status} | ${t1.status === 403 ? '✅ BLOCKED' : '❌ EXPOSED'}`);
    if (t1.status === 403) console.log(`  Body: "${t1.body.trim()}"`);

    // Test 2: Direct access to private_uploads via URL
    console.log('\nTEST 2: Direct /private_uploads/... URL');
    const t2 = await makeRequest('http://localhost:3000/private_uploads/attachments/5096/anything.pdf');
    console.log(`  Status: ${t2.status} | ${t2.status !== 200 ? '✅ BLOCKED' : '❌ EXPOSED'}`);

    // Test 3: Authenticated route WITHOUT auth
    console.log('\nTEST 3: /account/5096/uploads/attachments/... without auth');
    if (testFilename) {
        const t3 = await makeRequest(`http://localhost:3000/account/5096/uploads/attachments/${testFilename}`);
        console.log(`  Status: ${t3.status} | ${t3.status !== 200 ? '✅ BLOCKED' : '❌ EXPOSED'}`);
        if (t3.status === 302) console.log(`  Redirect: ${t3.headers.location}`);
    }

    // Test 4: Path traversal attack
    console.log('\nTEST 4: Path traversal ../../server.js');
    const t4 = await makeRequest('http://localhost:3000/uploads/attachments/../../server.js');
    console.log(`  Status: ${t4.status} | ${t4.status !== 200 ? '✅ BLOCKED' : '❌ EXPOSED'}`);

    // ----- AUTHENTICATED TESTS -----
    console.log('\n\n=== AUTHENTICATED ACCESS TESTS ===\n');
    
    let cookies;
    try {
        cookies = await login();
        console.log(`Session cookies obtained: ${cookies ? 'YES' : 'NO'}\n`);
    } catch (e) {
        console.log(`Login failed: ${e.message}`);
        return;
    }

    // Test 5: Authenticated download — should work
    console.log('TEST 5: Authenticated download via /account/5096/uploads/attachments/...');
    if (testFilename) {
        const t5 = await makeRequest(`http://localhost:3000/account/5096/uploads/attachments/${testFilename}`, {
            headers: { Cookie: cookies },
        });
        console.log(`  Status: ${t5.status} | ${t5.status === 200 ? '✅ ACCESSIBLE (correct)' : '⚠️  Status ' + t5.status}`);
        if (t5.status === 200) console.log(`  Content-Type: ${t5.headers['content-type']}`);
    }

    // Test 6: Cross-tenant — user from account 5096 trying to download from 5001
    console.log('\nTEST 6: Cross-tenant access (5096 user → 5001 files)');
    const t6 = await makeRequest('http://localhost:3000/account/5001/uploads/attachments/test.pdf', {
        headers: { Cookie: cookies },
    });
    console.log(`  Status: ${t6.status} | ${t6.status !== 200 ? '✅ BLOCKED' : '❌ EXPOSED'}`);

    // Test 7: Direct static bypass EVEN with auth cookie
    console.log('\nTEST 7: Static bypass with auth cookie /uploads/attachments/5096/...');
    const t7 = await makeRequest('http://localhost:3000/uploads/attachments/5096/something.pdf', {
        headers: { Cookie: cookies },
    });
    console.log(`  Status: ${t7.status} | ${t7.status === 403 ? '✅ BLOCKED (static route is dead)' : '❌ EXPOSED'}`);

    console.log('\n=== AUDIT COMPLETE ===');
}

audit().catch(console.error);
