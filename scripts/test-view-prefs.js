// Test script: verify view-preferences API saves and loads 'rows'
const http = require('http');

const payload = JSON.stringify({
    viewId: 'overview_test123',
    preferences: {
        rows: [
            { id: 'r1', columns: [{ id: 'c1', width: 12, widgetIds: ['fields','tasks'] }] }
        ]
    }
});

// 1. First login to get session cookie
const loginPayload = JSON.stringify({ email: 'boukirou6@hotmail.com', password: 'test' });

function makeRequest(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) }); }
                catch(e) { resolve({ status: res.statusCode, headers: res.headers, body: body }); }
            });
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

async function test() {
    // Login
    console.log('1. Logging in...');
    const loginRes = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/auth/login',
        method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, loginPayload);
    
    const cookies = loginRes.headers['set-cookie'];
    const cookie = cookies ? cookies.map(c => c.split(';')[0]).join('; ') : '';
    console.log('Login status:', loginRes.status);
    
    if (!cookie) {
        // Try redirect-based login
        console.log('Login response:', loginRes.body);
        return;
    }
    
    // Save
    console.log('\n2. Saving layout...');
    const saveRes = await makeRequest({
        hostname: 'localhost', port: 3000,
        path: '/account/9194/api/user/view-preferences',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': cookie }
    }, payload);
    console.log('Save status:', saveRes.status);
    console.log('Save body:', JSON.stringify(saveRes.body));
    
    // Load
    console.log('\n3. Loading layout...');
    const loadRes = await makeRequest({
        hostname: 'localhost', port: 3000,
        path: '/account/9194/api/user/view-preferences/overview_test123',
        method: 'GET',
        headers: { 'Cookie': cookie }
    }, null);
    console.log('Load status:', loadRes.status);
    console.log('Load body:', JSON.stringify(loadRes.body));
    
    // Check if rows was persisted
    if (loadRes.body?.preferences?.rows) {
        console.log('\n✅ SUCCESS: rows field persisted correctly!');
        console.log('Saved rows:', JSON.stringify(loadRes.body.preferences.rows));
    } else {
        console.log('\n❌ FAIL: rows field NOT found in preferences');
        console.log('Full preferences:', JSON.stringify(loadRes.body?.preferences));
    }
}

test().catch(console.error);
