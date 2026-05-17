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
    console.log('Login status:', loginRes.status);
    
    // Get attachments
    const listRes = await makeRequest({
        hostname: '127.0.0.1', port: 3000,
        path: '/account/5096/api/records/6a09be6c0052fd6c37c92ba9/attachments',
        headers: { 'Cookie': cookieStr }
    });
    const data = JSON.parse(listRes.body);
    const nonGenerated = (data.attachments || []).filter(a => !a.isGenerated);
    console.log('Non-generated attachments:', nonGenerated.length);
    
    if (nonGenerated.length === 0) {
        console.log('No non-generated files to test delete with'); return;
    }
    
    // Test bulk-delete with first 2 non-generated files
    const testIds = nonGenerated.slice(0, 2).map(a => a._id);
    console.log('Testing bulk-delete with IDs:', testIds);
    
    const bulkRes = await makeRequest({
        hostname: '127.0.0.1', port: 3000,
        path: `/account/5096/api/records/6a09be6c0052fd6c37c92ba9/attachments/bulk-delete`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': cookieStr }
    }, JSON.stringify({ ids: testIds }));
    console.log('\n=== Bulk delete status:', bulkRes.status);
    console.log('Bulk delete response:', bulkRes.body);
    
    // Test single DELETE too
    const singleFile = nonGenerated[2];
    if (singleFile) {
        console.log('\nTesting single DELETE for:', singleFile.originalName, '| ID:', singleFile._id);
        const singleRes = await makeRequest({
            hostname: '127.0.0.1', port: 3000,
            path: `/account/5096/api/records/6a09be6c0052fd6c37c92ba9/attachments/${singleFile._id}`,
            method: 'DELETE',
            headers: { 'Cookie': cookieStr }
        });
        console.log('Single delete status:', singleRes.status);
        console.log('Single delete response:', singleRes.body);
    }
}

main().catch(e => console.error(e));
