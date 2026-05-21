const http = require('http');
const https = require('https');

const BASE = 'http://localhost:3000';
let cookies = '';

function request(method, path, body = null, followRedirects = true) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE);
        const opts = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method,
            headers: {
                'Cookie': cookies
            }
        };
        if (body) opts.headers['Content-Type'] = 'application/json';
        if (body && typeof body !== 'string') body = JSON.stringify(body);
        if (body) opts.headers['Content-Length'] = Buffer.byteLength(body);

        const req = http.request(opts, (res) => {
            // Capture cookies
            const setCookies = res.headers['set-cookie'];
            if (setCookies) {
                setCookies.forEach(c => {
                    const name = c.split('=')[0];
                    const val = c.split(';')[0];
                    // Replace or add cookie
                    if (cookies.includes(name + '=')) {
                        cookies = cookies.replace(new RegExp(name + '=[^;]*'), val);
                    } else {
                        cookies = cookies ? cookies + '; ' + val : val;
                    }
                });
            }

            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (followRedirects && [301, 302, 303].includes(res.statusCode) && res.headers.location) {
                    const loc = res.headers.location;
                    console.log(`  ↳ Redirect ${res.statusCode} → ${loc}`);
                    request('GET', loc, null, true).then(resolve).catch(reject);
                } else {
                    resolve({ status: res.statusCode, data, headers: res.headers });
                }
            });
        });
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

async function main() {
    console.log('=== Drive Page Test ===\n');

    // 1. Login
    console.log('1. Logging in...');
    const loginRes = await request('POST', '/auth/login', {
        email: 'boukirou6@hotmail.com',
        password: 'test'
    });
    console.log('   Login status:', loginRes.status);
    console.log('   Cookies set:', cookies ? 'YES' : 'NO');

    // 2. Select workspace 5096
    console.log('\n2. Selecting workspace 5096...');
    const wsRes = await request('GET', '/user/select-account/5096');
    console.log('   Workspace status:', wsRes.status);

    // 3. Fetch drive page
    console.log('\n3. Fetching /account/5096/drive ...');
    const driveRes = await request('GET', '/account/5096/drive');
    console.log('   Drive page status:', driveRes.status);
    console.log('   Page size:', driveRes.data.length, 'bytes');

    // Check for key elements in the page
    const html = driveRes.data;
    const checks = [
        ['globalDrive()', 'Alpine component function'],
        ['Drive Global', 'Hero title'],
        ['rm-hero', 'Hero section CSS'],
        ['ctx-menu', 'Context menu CSS'],
        ['batch-bar', 'Batch bar CSS'],
        ['rm-upload-btn', 'Upload button CSS'],
        ['drag-overlay', 'Drag overlay'],
        ['ctxMenu', 'Context menu state'],
        ['selectedIds', 'Selection state'],
        ['renameFolderModal', 'Rename folder modal'],
        ['createFolderModal', 'Create folder modal'],
        ['moveModal', 'Move modal'],
        ['uploadFiles', 'Upload function'],
        ['deleteFile', 'Delete function'],
        ['bulkDelete', 'Bulk delete function'],
        ['submitRename', 'Rename function'],
        ['submitMove', 'Move function'],
        ['promptCreateFolder', 'Create folder function'],
        ['deleteFolder', 'Delete folder function'],
        ['onItemContext', 'Context menu handler'],
        ['onBgContext', 'Background context menu'],
        ['toggleSelect', 'Selection toggle'],
        ['rm-item-check', 'Checkbox CSS class'],
        ['@contextmenu.prevent', 'Context menu event binding'],
        ['@dragover.prevent', 'Drag over event binding'],
        ['@drop.prevent', 'Drop event binding'],
        ['rm-rename-input', 'Rename input CSS'],
    ];

    console.log('\n4. Checking page elements:');
    let allPass = true;
    checks.forEach(([pattern, desc]) => {
        const found = html.includes(pattern);
        console.log(`   ${found ? '✅' : '❌'} ${desc} (${pattern})`);
        if (!found) allPass = false;
    });

    // 4. Fetch Drive API
    console.log('\n5. Testing Drive API...');
    const apiRes = await request('GET', '/account/5096/api/drive');
    console.log('   API status:', apiRes.status);
    try {
        const apiData = JSON.parse(apiRes.data);
        console.log('   Success:', apiData.success);
        console.log('   Entities:', apiData.entities?.length || 0);
        console.log('   Total files:', apiData.stats?.totalFiles || 0);
        console.log('   Total size:', apiData.stats?.totalSizeFormatted || '0');
        if (apiData.entities?.length > 0) {
            console.log('   First entity:', apiData.entities[0].entityName, '-', apiData.entities[0].fileCount, 'files');
            if (apiData.entities[0].records?.length > 0) {
                const rec = apiData.entities[0].records[0];
                console.log('   First record:', rec.recordTitle, '-', rec.fileCount, 'files,', (rec.folders || []).length, 'folders');
            }
        }
    } catch(e) {
        console.log('   Failed to parse API response:', e.message);
    }

    console.log('\n=== Result:', allPass ? '✅ ALL CHECKS PASSED' : '❌ SOME CHECKS FAILED', '===');
}

main().catch(e => console.error('Test failed:', e));
