const http = require('http');

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
    // Login
    const loginRes = await makeRequest({
        hostname: '127.0.0.1', port: 3000, path: '/auth/login', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({ email: 'boukirou6@hotmail.com', password: 'test' }));
    
    const rawCookies = loginRes.headers['set-cookie'] || [];
    const cookieStr = rawCookies.map(c => c.split(';')[0]).join('; ');
    console.log('Login status:', loginRes.status, '| Cookie length:', cookieStr.length);
    
    // Get attachments
    const listRes = await makeRequest({
        hostname: '127.0.0.1', port: 3000,
        path: '/account/5096/api/records/6a09be6c0052fd6c37c92ba9/attachments',
        headers: { 'Cookie': cookieStr }
    });
    console.log('\n=== Attachments List Status:', listRes.status);
    
    // Follow redirect if needed
    if (listRes.status === 302) {
        console.log('Redirect to:', listRes.headers.location);
        console.log('Cookie was empty?', cookieStr.length === 0);
        return;
    }
    
    let data;
    try { data = JSON.parse(listRes.body); }
    catch(e) { console.error('Parse error:', listRes.body.substring(0, 200)); return; }
    
    if (!data.attachments || data.attachments.length === 0) {
        console.log('No attachments:', JSON.stringify(data).substring(0, 200)); return;
    }
    
    const first = data.attachments[0];
    console.log('Total attachments:', data.attachments.length);
    console.log('First _id:', JSON.stringify(first._id), '(type:', typeof first._id, ')');
    console.log('First originalName:', first.originalName);
    
    // Test DELETE
    const deleteUrl = `/account/5096/api/records/6a09be6c0052fd6c37c92ba9/attachments/${first._id}`;
    console.log('\nDELETE URL:', deleteUrl);
    const deleteRes = await makeRequest({
        hostname: '127.0.0.1', port: 3000,
        path: deleteUrl, method: 'DELETE',
        headers: { 'Cookie': cookieStr }
    });
    console.log('DELETE Status:', deleteRes.status);
    console.log('DELETE Response:', deleteRes.body.substring(0, 300));
}

main().catch(e => { console.error(e); process.exit(1); });
