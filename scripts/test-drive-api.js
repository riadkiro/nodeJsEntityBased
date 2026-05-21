/**
 * Test Drive API endpoints (authenticated with proper session handling)
 */
const http = require('http');

const ACCOUNT = '5096';
let cookies = {};

function getCookieString() {
    return Object.entries(cookies).map(([k,v]) => `${k}=${v}`).join('; ');
}

function parseCookies(res) {
    (res.headers['set-cookie'] || []).forEach(c => {
        const parts = c.split(';')[0].split('=');
        cookies[parts[0]] = parts.slice(1).join('=');
    });
}

function request(method, path, body, contentType) {
    return new Promise((resolve, reject) => {
        const opts = {
            hostname: 'localhost',
            port: 3000,
            path,
            method,
            headers: {
                'Cookie': getCookieString(),
            }
        };
        if (contentType) opts.headers['Content-Type'] = contentType;
        if (body && !contentType) opts.headers['Content-Type'] = 'application/json';
        
        const req = http.request(opts, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                parseCookies(res);
                resolve({ status: res.statusCode, headers: res.headers, body: data });
            });
        });
        req.on('error', reject);
        if (body) {
            if (contentType === 'application/x-www-form-urlencoded') {
                req.write(body);
            } else {
                req.write(JSON.stringify(body));
            }
        }
        req.end();
    });
}

async function login() {
    // Get login page first (for session cookie)
    await request('GET', '/auth/login');
    
    // POST login as form-urlencoded
    const body = 'email=boukirou6%40hotmail.com&password=test';
    const res = await request('POST', '/auth/login', body, 'application/x-www-form-urlencoded');
    console.log('Login status:', res.status, res.headers.location || '');
    
    // Follow redirect
    if (res.headers.location) {
        const r2 = await request('GET', res.headers.location);
        console.log('Redirect status:', r2.status, r2.headers.location || '');
        // If redirected again to workspace selection
        if (r2.headers.location) {
            await request('GET', r2.headers.location);
        }
    }
    
    // Select workspace 5096
    const ws = await request('GET', `/account/${ACCOUNT}/home`);
    console.log('Workspace access:', ws.status, ws.status === 200 ? 'OK' : (ws.headers.location || 'FAILED'));
}

async function main() {
    await login();
    
    console.log('\n=== Test 1: GET /api/drive (global entities) ===');
    const r1 = await request('GET', `/account/${ACCOUNT}/api/drive`);
    if (r1.status === 200) {
        const d = JSON.parse(r1.body);
        console.log('Success:', d.success);
        console.log('Entities:', d.entities?.length || 0);
        if (d.stats) console.log('Stats:', d.stats.totalFiles, 'files,', d.stats.totalSizeFormatted);
    } else {
        console.log('Status:', r1.status, r1.headers.location || '');
    }
    
    console.log('\n=== Test 2: GET /api/drive/files (root files) ===');
    const r2 = await request('GET', `/account/${ACCOUNT}/api/drive/files`);
    if (r2.status === 200) {
        const d = JSON.parse(r2.body);
        console.log('Success:', d.success);
        console.log('Files:', d.files?.length || 0);
        console.log('Folders:', JSON.stringify(d.folders || []));
    } else {
        console.log('Status:', r2.status, r2.headers.location || '');
    }
    
    console.log('\n=== Test 3: Create folder "Marketing" ===');
    const r3 = await request('POST', `/account/${ACCOUNT}/api/drive/folders`, { name: 'Marketing' });
    if (r3.status === 200) {
        const d = JSON.parse(r3.body);
        console.log('Success:', d.success);
        console.log('Folders:', JSON.stringify(d.folders || []));
    } else {
        console.log('Status:', r3.status, r3.body?.substring(0, 200));
    }
    
    console.log('\n=== Test 4: Delete folder "Marketing" ===');
    const r4 = await request('DELETE', `/account/${ACCOUNT}/api/drive/folders/Marketing`);
    if (r4.status === 200) {
        const d = JSON.parse(r4.body);
        console.log('Success:', d.success);
        console.log('Folders after:', JSON.stringify(d.folders || []));
    } else {
        console.log('Status:', r4.status, r4.body?.substring(0, 200));
    }

    console.log('\n=== Test 5: Drive page renders ===');
    const r5 = await request('GET', `/account/${ACCOUNT}/drive`);
    console.log('Status:', r5.status);
    if (r5.status === 200) {
        console.log('enterApp():', r5.body.includes('enterApp'));
        console.log('root level:', r5.body.includes("globalLevel === 'root'"));
        console.log('App folder:', r5.body.includes('solar:box-bold-duotone'));
        console.log('EJS error:', r5.body.includes('SyntaxError'));
    }
}

main().catch(e => console.error('Fatal:', e));
