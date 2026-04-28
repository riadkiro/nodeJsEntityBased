// Test the update-relation endpoint directly
const http = require('http');

const data = JSON.stringify({
    relationKey: 'd804cdfd-26f8-40c4-a6e2-484dc64807a5', // Symptomes
    action: 'add',
    targetId: '69e9e4165ca57f4b82f92a0b'  // some symptom ID
});

// First we need to login
const loginData = JSON.stringify({
    email: 'boukirou6@hotmail.com',
    password: 'test'
});

function makeRequest(options, body) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => responseBody += chunk);
            res.on('end', () => {
                resolve({ statusCode: res.statusCode, headers: res.headers, body: responseBody });
            });
        });
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

async function main() {
    // Login first
    const loginRes = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, loginData);

    console.log('Login status:', loginRes.statusCode);
    const cookies = loginRes.headers['set-cookie'];
    console.log('Cookies:', cookies ? cookies.map(c => c.split(';')[0]).join('; ') : 'none');

    if (!cookies) {
        console.log('Login body:', loginRes.body);
        process.exit(1);
    }
    const cookieStr = cookies.map(c => c.split(';')[0]).join('; ');

    // Now test update-relation
    const updateRes = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/account/5756/record/consultations/69e9e4165ca57f4b82f92b9e/update-relation',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookieStr
        }
    }, data);

    console.log('\nUpdate-relation status:', updateRes.statusCode);
    console.log('Response:', updateRes.body);
}

main().catch(e => console.error(e));
