/**
 * Browser-equivalent test: Login with cookies, then test file download
 */
const http = require('http');
const mongoose = require('mongoose');

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
            let body = Buffer.alloc(0);
            res.on('data', (chunk) => body = Buffer.concat([body, chunk]));
            res.on('end', () => resolve({
                status: res.statusCode,
                headers: res.headers,
                bodyLength: body.length,
                bodyText: body.toString('utf8').substring(0, 300),
                cookies: res.headers['set-cookie'],
            }));
        });
        req.on('error', reject);
        if (options.body) req.write(options.body);
        req.end();
    });
}

function followRedirect(url, cookies, maxRedirects = 5) {
    return new Promise(async (resolve) => {
        let currentUrl = url;
        let currentCookies = cookies;
        for (let i = 0; i < maxRedirects; i++) {
            const res = await makeRequest(currentUrl, {
                headers: { Cookie: currentCookies },
            });
            // Collect cookies
            if (res.cookies) {
                const newC = res.cookies.map(c => c.split(';')[0]).join('; ');
                currentCookies = currentCookies + '; ' + newC;
            }
            if (res.status === 301 || res.status === 302) {
                let loc = res.headers.location;
                if (loc.startsWith('/')) loc = `http://localhost:3000${loc}`;
                currentUrl = loc;
                continue;
            }
            return resolve(res);
        }
        resolve({ status: 'TOO_MANY_REDIRECTS' });
    });
}

async function main() {
    // Get a real filename from DB
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5096', { useNewUrlParser: true });
    const record = await mongoose.connection.db.collection('records').findOne(
        { 'attachments.0': { $exists: true } },
        { projection: { attachments: 1 } }
    );
    const att = record.attachments[0];
    console.log(`Test attachment: filename="${att.filename}" originalName="${att.originalName}"`);
    await mongoose.connection.close();

    // Step 1: Get initial session
    const loginPage = await makeRequest('http://localhost:3000/auth/login');
    let cookies = (loginPage.cookies || []).map(c => c.split(';')[0]).join('; ');

    // Step 2: Login
    const loginBody = 'email=boukirou6%40hotmail.com&password=test';
    const loginRes = await followRedirect('http://localhost:3000/auth/login', cookies + '; __POST__=1');
    // Actually POST
    const postRes = await makeRequest('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Cookie: cookies,
        },
        body: loginBody,
    });
    if (postRes.cookies) {
        cookies += '; ' + postRes.cookies.map(c => c.split(';')[0]).join('; ');
    }
    
    console.log(`\nLogin response: ${postRes.status}`);
    console.log(`Session cookies: ${cookies.substring(0, 100)}...`);

    // Step 3: TEST - Authenticated download
    console.log('\n=== TEST: Authenticated download ===');
    const dlRes = await followRedirect(
        `http://localhost:3000/account/5096/uploads/attachments/${att.filename}`,
        cookies
    );
    console.log(`Status: ${dlRes.status}`);
    if (dlRes.status === 200) {
        console.log(`✅ File served successfully!`);
        console.log(`Content-Type: ${dlRes.headers['content-type']}`);
        console.log(`Body length: ${dlRes.bodyLength} bytes`);
    } else {
        console.log(`Status details: ${dlRes.bodyText}`);
    }

    // Step 4: TEST - Unauthenticated download (no cookies)
    console.log('\n=== TEST: Unauthenticated download (NO cookies) ===');
    const noAuthRes = await makeRequest(
        `http://localhost:3000/account/5096/uploads/attachments/${att.filename}`
    );
    console.log(`Status: ${noAuthRes.status} | ${noAuthRes.status !== 200 ? '✅ BLOCKED' : '❌ EXPOSED'}`);
    if (noAuthRes.status === 302) console.log(`Redirects to: ${noAuthRes.headers.location}`);

    // Step 5: TEST - Direct static bypass
    console.log('\n=== TEST: Static bypass /uploads/attachments/... ===');
    const staticRes = await makeRequest('http://localhost:3000/uploads/attachments/5096/' + att.filename);
    console.log(`Status: ${staticRes.status} | ${staticRes.status === 403 ? '✅ BLOCKED' : '❌ EXPOSED'}`);
    console.log(`Body: "${staticRes.bodyText.trim()}"`);
}

main().catch(console.error).finally(() => process.exit(0));
