// Test the update-field endpoint with the correct fieldKey parameter
const http = require('http');

// Login first to get session cookie
const loginData = JSON.stringify({ email: 'boukirou6@hotmail.com', password: 'test' });

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
    const loginRes = await makeRequest({
        hostname: '127.0.0.1',
        port: 3000,
        path: '/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, loginData);
    
    // Extract cookie
    const cookies = loginRes.headers['set-cookie'] || [];
    const cookieStr = cookies.map(c => c.split(';')[0]).join('; ');
    console.log('Login status:', loginRes.status);
    console.log('Cookie:', cookieStr.substring(0, 50) + '...');
    
    // Step 2: Test update-field with WRONG key (old bug)
    const wrongBody = JSON.stringify({ key: '6a09ce5e28942d4bd6b06754', value: 'test-file.jpeg' });
    const wrongRes = await makeRequest({
        hostname: '127.0.0.1',
        port: 3000,
        path: '/account/5096/record/opportunites/6a09be6c0052fd6c37c92ba9/update-field',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': cookieStr }
    }, wrongBody);
    console.log('\n=== OLD BUG (key instead of fieldKey) ===');
    console.log('Status:', wrongRes.status);
    console.log('Body:', wrongRes.body);
    
    // Step 3: Test update-field with CORRECT fieldKey (fix)
    const correctBody = JSON.stringify({ fieldKey: '6a09ce5e28942d4bd6b06754', value: 'test-file.jpeg' });
    const correctRes = await makeRequest({
        hostname: '127.0.0.1',
        port: 3000,
        path: '/account/5096/record/opportunites/6a09be6c0052fd6c37c92ba9/update-field',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': cookieStr }
    }, correctBody);
    console.log('\n=== FIX (fieldKey) ===');
    console.log('Status:', correctRes.status);
    console.log('Body:', correctRes.body);
}

main().catch(e => console.error(e));
