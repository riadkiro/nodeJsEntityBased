// Test the Global Drive API with proper auth
const http = require('http');
const querystring = require('querystring');

async function httpRequest(options, postData) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
        });
        req.on('error', reject);
        if (postData) req.write(postData);
        req.end();
    });
}

async function main() {
    // Step 1: Get login page (for session cookie)
    const loginPage = await httpRequest({ hostname: 'localhost', port: 3000, path: '/auth/login', method: 'GET' });
    const sessionCookie = loginPage.headers['set-cookie']?.[0]?.split(';')[0] || '';
    console.log('1. Got session cookie:', sessionCookie.substring(0, 40) + '...');

    // Step 2: POST login
    const loginData = querystring.stringify({ email: 'boukirou6@hotmail.com', password: 'test' });
    const loginRes = await httpRequest({
        hostname: 'localhost', port: 3000, path: '/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': sessionCookie
        }
    }, loginData);
    console.log('2. Login status:', loginRes.status);
    const postCookie = loginRes.headers['set-cookie']?.[0]?.split(';')[0] || sessionCookie;
    console.log('   Redirect:', loginRes.headers.location);

    // Step 3: Call the drive API
    const driveRes = await httpRequest({
        hostname: 'localhost', port: 3000, path: '/account/7846/api/drive',
        method: 'GET',
        headers: { 'Cookie': postCookie }
    });
    console.log('3. Drive API status:', driveRes.status);
    if (driveRes.status === 302) {
        console.log('   Redirect to:', driveRes.headers.location);
    } else {
        try {
            const json = JSON.parse(driveRes.body);
            console.log('   Response:', JSON.stringify({
                success: json.success,
                entityCount: json.stats?.entityCount,
                totalFiles: json.stats?.totalFiles,
                error: json.error
            }));
            if (json.entities?.length > 0) {
                json.entities.forEach(e => {
                    console.log(`   Entity: ${e.entityName} - ${e.fileCount} files`);
                    e.records.forEach(r => {
                        console.log(`     Record: ${r.recordTitle} - ${r.fileCount} files`);
                    });
                });
            }
        } catch (e) {
            console.log('   Body (first 300):', driveRes.body.substring(0, 300));
        }
    }
}

main().catch(console.error);
