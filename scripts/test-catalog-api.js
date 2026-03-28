const http = require('http');

// Test the catalog-search API to see the lineDefaults format
const options = {
    hostname: 'localhost',
    port: 3000,
    // First need to login
    method: 'POST',
    path: '/auth/login',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
};

// Step 1: Login
const loginData = 'email=boukirou6@hotmail.com&password=test';
const loginReq = http.request(options, (res) => {
    let cookies = res.headers['set-cookie'] || [];
    const cookieStr = cookies.map(c => c.split(';')[0]).join('; ');
    
    console.log('Login status:', res.statusCode);
    console.log('Cookies:', cookieStr.substring(0, 100) + '...');
    
    // Read body
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        // Step 2: Search catalog
        const searchUrl = '/account/9194/api/document-lines/catalog-search?entityId=69c232cd0fa7abd357abd65e&q=Doliprane';
        const searchReq = http.get({
            hostname: 'localhost',
            port: 3000,
            path: searchUrl,
            headers: { Cookie: cookieStr }
        }, (sRes) => {
            let sBody = '';
            sRes.on('data', (chunk) => sBody += chunk);
            sRes.on('end', () => {
                console.log('\n=== CATALOG SEARCH RESPONSE ===');
                try {
                    const json = JSON.parse(sBody);
                    console.log('Status:', sRes.statusCode);
                    console.log('Results count:', json.data?.length);
                    
                    if (json.data && json.data.length > 0) {
                        const item = json.data[0];
                        console.log('\nFirst item:');
                        console.log('  _id:', item._id);
                        console.log('  label:', item.label);
                        console.log('  title:', item.title);
                        console.log('  lineDefaults type:', typeof item.lineDefaults);
                        console.log('  lineDefaults isArray:', Array.isArray(item.lineDefaults));
                        console.log('  lineDefaults:', JSON.stringify(item.lineDefaults, null, 2));
                        console.log('  customFields:', JSON.stringify(item.customFields, null, 2));
                    }
                } catch(e) {
                    console.log('Parse error:', e.message);
                    console.log('Raw body:', sBody.substring(0, 500));
                }
            });
        });
        searchReq.on('error', (e) => console.log('Search error:', e.message));
    });
});
loginReq.on('error', (e) => console.log('Login error:', e.message));
loginReq.write(loginData);
loginReq.end();
