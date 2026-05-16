/**
 * Debug: HTTP request to the records API endpoint 
 */
const http = require('http');

// First login to get a cookie
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
    const loginBody = 'email=boukirou6%40hotmail.com&password=test';
    const loginRes = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/auth/login',
        method: 'POST',
        headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(loginBody)
        }
    }, loginBody);
    
    console.log('Login status:', loginRes.status);
    
    // Extract cookie
    const cookies = loginRes.headers['set-cookie'];
    const cookieStr = cookies ? cookies.map(c => c.split(';')[0]).join('; ') : '';
    console.log('Cookie:', cookieStr.substring(0, 80) + '...');
    
    // Step 2: Hit the records API
    const entityId = '69ccfabf738ff763a647e155';
    const viewId = '69ccfabf738ff763a647e155';
    const apiPath = `/account/9194/api/entity/${entityId}/views/${viewId}/records?limit=10000&sort=createdAt:desc`;
    console.log('\nRequesting:', apiPath);
    
    const apiRes = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: apiPath,
        method: 'GET',
        headers: { 'Cookie': cookieStr }
    });
    
    console.log('API status:', apiRes.status);
    if (apiRes.status !== 200) {
        console.log('API response body:', apiRes.body.substring(0, 500));
    } else {
        try {
            const data = JSON.parse(apiRes.body);
            console.log('Records count:', (data.records || []).length);
            console.log('Columns count:', (data.columns || []).length);
            console.log('Has preferences:', !!data.preferences);
            console.log('Has entity:', !!data.entity);
            console.log('Has filters:', !!data.filters);
        } catch (e) {
            console.log('Parse error:', e.message);
            console.log('Body:', apiRes.body.substring(0, 300));
        }
    }

    // Step 3: Also try the patients list page directly
    console.log('\n--- Checking the HTML page ---');
    const pageRes = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/account/9194/record/patients/list',
        method: 'GET',
        headers: { 'Cookie': cookieStr }
    });
    
    console.log('Page status:', pageRes.status);
    if (pageRes.status !== 200) {
        console.log('Page response:', pageRes.body.substring(0, 500));
    } else {
        // Extract the data-entity-id from the HTML
        const entityIdMatch = pageRes.body.match(/data-entity-id="([^"]*)"/);
        const viewIdMatch = pageRes.body.match(/data-view-id="([^"]*)"/);
        const accountIdMatch = pageRes.body.match(/data-account-id="([^"]*)"/);
        console.log('data-entity-id:', entityIdMatch ? entityIdMatch[1] : 'NOT FOUND');
        console.log('data-view-id:', viewIdMatch ? viewIdMatch[1] : 'NOT FOUND');
        console.log('data-account-id:', accountIdMatch ? accountIdMatch[1] : 'NOT FOUND');
        
        // Check if there's an error in the page
        if (pageRes.body.includes('Server Error') || pageRes.body.includes('Error')) {
            const errorIdx = pageRes.body.indexOf('Server Error');
            if (errorIdx > -1) console.log('Found Server Error in page');
        }
    }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
