/**
 * Quick HTTP test: check if the drive pages return 200 (or redirect to login)
 * If the pages have EJS compilation errors, they'll return 500
 */
const http = require('http');

function checkUrl(url) {
    return new Promise((resolve) => {
        http.get(url, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                const hasError = body.includes('Error') && body.includes('views') && body.includes('.ejs');
                const hasEjsError = body.includes('SyntaxError') || body.includes('ReferenceError') || body.includes('is not defined');
                resolve({
                    url,
                    status: res.statusCode,
                    redirectTo: res.headers.location || null,
                    hasEjsError,
                    errorSnippet: hasEjsError ? body.substring(0, 500) : null,
                    bodyLength: body.length
                });
            });
        }).on('error', (e) => {
            resolve({ url, error: e.message });
        });
    });
}

async function main() {
    // Test 1: Global drive page
    console.log('=== Test 1: Global Drive ===');
    const r1 = await checkUrl('http://localhost:3000/account/5096/drive');
    console.log('Status:', r1.status);
    console.log('Redirect:', r1.redirectTo || 'none');
    console.log('Body length:', r1.bodyLength);
    console.log('EJS Error:', r1.hasEjsError);
    if (r1.errorSnippet) console.log('Error:', r1.errorSnippet);
    
    // Test 2: Record drive page  
    console.log('\n=== Test 2: Record Drive ===');
    const r2 = await checkUrl('http://localhost:3000/account/5096/record/entreprises/6a0d72aedf797cae52500958/drive');
    console.log('Status:', r2.status);
    console.log('Redirect:', r2.redirectTo || 'none');
    console.log('Body length:', r2.bodyLength);
    console.log('EJS Error:', r2.hasEjsError);
    if (r2.errorSnippet) console.log('Error:', r2.errorSnippet);
    
    // Test 3: API drive (should work without auth)
    console.log('\n=== Test 3: Drive API ===');
    const r3 = await checkUrl('http://localhost:3000/account/5096/api/drive');
    console.log('Status:', r3.status);
    console.log('Redirect:', r3.redirectTo || 'none');
}

main();
