const http = require('http');
const fs = require('fs');

const loginReq = http.request({
    hostname: 'localhost', port: 3000, method: 'POST',
    path: '/auth/login',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
}, (res) => {
    const cookieStr = (res.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        const redirectReq = http.get({
            hostname: 'localhost', port: 3000,
            path: res.headers.location || '/account/9194/dashboard',
            headers: { Cookie: cookieStr }
        }, (r2) => {
            let b2 = '';
            r2.on('data', c => b2 += c);
            r2.on('end', () => {
                // Full schemas dump
                const schReq = http.get({
                    hostname: 'localhost', port: 3000,
                    path: '/account/9194/api/line-schemas/by-context?entityId=69c232cd0fa7abd357abd654',
                    headers: { Cookie: cookieStr }
                }, (r3) => {
                    let sBod = '';
                    r3.on('data', c => sBod += c);
                    r3.on('end', () => {
                        const out = [];
                        out.push('=== FULL SCHEMA DUMP ===');
                        const data = JSON.parse(sBod);
                        out.push(JSON.stringify(data, null, 2));
                        
                        // Test catalog search API (which URL pattern?)
                        const catUrl = '/account/9194/api/catalog-search?entityId=69c232cd0fa7abd357abd654&q=Doliprane&searchFields=title';
                        const catReq = http.get({
                            hostname: 'localhost', port: 3000,
                            path: catUrl,
                            headers: { Cookie: cookieStr }
                        }, (r4) => {
                            let cBod = '';
                            r4.on('data', c => cBod += c);
                            r4.on('end', () => {
                                out.push('\n=== CATALOG SEARCH (entityId=654) ===');
                                out.push('Status: ' + r4.statusCode);
                                out.push(cBod.substring(0, 2000));
                                
                                fs.writeFileSync('scripts/debug-output.txt', out.join('\n'));
                                console.log('Done');
                            });
                        });
                    });
                });
            });
        });
    });
});
loginReq.write('email=boukirou6@hotmail.com&password=test');
loginReq.end();
