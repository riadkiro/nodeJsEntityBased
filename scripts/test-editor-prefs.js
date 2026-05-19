// Test the view-preferences API for document editor auto-save
const http = require('http');

// First, login to get cookies
function makeRequest(options, body) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
        });
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

async function main() {
    // Step 1: Login
    console.log('=== Step 1: Login ===');
    const loginBody = 'email=boukirou6%40hotmail.com&password=test';
    const loginRes = await makeRequest({
        hostname: 'localhost', port: 3000,
        path: '/auth/login', method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(loginBody) }
    }, loginBody);
    
    const cookies = (loginRes.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');
    console.log('Login status:', loginRes.status);
    console.log('Cookies:', cookies ? 'received' : 'NONE');
    
    if (!cookies) {
        console.error('No cookies received, cannot proceed');
        process.exit(1);
    }
    
    // Step 2: Save preference
    console.log('\n=== Step 2: Save preference (editorAutoSave: false) ===');
    const saveBody = JSON.stringify({
        viewId: 'document-editor',
        preferences: { editorAutoSave: false }
    });
    const saveRes = await makeRequest({
        hostname: 'localhost', port: 3000,
        path: '/account/5096/api/user/view-preferences', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(saveBody), 'Cookie': cookies }
    }, saveBody);
    console.log('Save status:', saveRes.status);
    console.log('Save response:', saveRes.body);
    
    // Step 3: Read preference back
    console.log('\n=== Step 3: Read preference back ===');
    const getRes = await makeRequest({
        hostname: 'localhost', port: 3000,
        path: '/account/5096/api/user/view-preferences/document-editor', method: 'GET',
        headers: { 'Cookie': cookies }
    }, null);
    console.log('Get status:', getRes.status);
    console.log('Get response:', getRes.body);
}

main().catch(e => { console.error(e); process.exit(1); });
