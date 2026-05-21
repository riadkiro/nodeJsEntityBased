const http = require('http');

const BASE = 'http://localhost:3000';
let cookies = '';

function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE);
        const opts = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method,
            headers: { 'Cookie': cookies }
        };
        if (body) opts.headers['Content-Type'] = 'application/json';
        if (body && typeof body !== 'string') body = JSON.stringify(body);
        if (body) opts.headers['Content-Length'] = Buffer.byteLength(body);

        const req = http.request(opts, (res) => {
            const setCookies = res.headers['set-cookie'];
            if (setCookies) {
                setCookies.forEach(c => {
                    const name = c.split('=')[0];
                    const val = c.split(';')[0];
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
                if ([301, 302, 303].includes(res.statusCode) && res.headers.location) {
                    request('GET', res.headers.location, null).then(resolve).catch(reject);
                } else {
                    resolve({ status: res.statusCode, data });
                }
            });
        });
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

async function main() {
    console.log('=== Drive API Data Structure Test ===\n');

    // Login
    await request('POST', '/auth/login', { email: 'boukirou6@hotmail.com', password: 'test' });
    
    // Fetch drive API
    const apiRes = await request('GET', '/account/5096/api/drive');
    const data = JSON.parse(apiRes.data);
    
    if (!data.success) {
        console.log('❌ API failed');
        return;
    }

    console.log('Entities:', data.entities.length);
    
    data.entities.forEach((e, i) => {
        console.log(`\n--- Entity ${i}: ${e.entityName} ---`);
        console.log('  entityId:', e.entityId);
        console.log('  entityIcon:', e.entityIcon);
        console.log('  entityColor:', e.entityColor);
        console.log('  fileCount:', e.fileCount);
        console.log('  records:', e.records?.length);
        
        (e.records || []).forEach((r, j) => {
            console.log(`  Record ${j}: ${r.recordTitle}`);
            console.log('    recordId:', r.recordId);
            console.log('    fileCount:', r.fileCount);
            console.log('    folders:', JSON.stringify(r.folders?.map(f => f.name)));
            console.log('    rootFiles:', r.rootFiles?.length);
            
            if (r.rootFiles && r.rootFiles.length > 0) {
                console.log('    First file:', JSON.stringify({
                    _id: r.rootFiles[0]._id,
                    originalName: r.rootFiles[0].originalName,
                    category: r.rootFiles[0].category,
                    url: r.rootFiles[0].url,
                    sizeFormatted: r.rootFiles[0].sizeFormatted
                }));
            }
            
            if (r.folders && r.folders.length > 0) {
                r.folders.forEach(f => {
                    console.log(`    Folder "${f.name}": ${f.files?.length || f.fileCount || 0} files`);
                });
            }
        });
    });
    
    // Now simulate what _buildItems does at root level
    console.log('\n=== Simulated _buildItems at root ===');
    const items = data.entities.map(entity => ({
        id: 'e-' + entity.entityId,
        type: 'folder',
        label: entity.entityName,
        sublabel: (entity.fileCount || 0) + ' fichiers • ' + (entity.records || []).length + ' fiches',
        count: (entity.records || []).length,
        icon: entity.entityIcon,
        color: entity.entityColor
    }));
    
    console.log('Items count:', items.length);
    items.forEach(item => {
        console.log('  Item:', item.id, '-', item.label, '(' + item.sublabel + ')');
    });
}

main().catch(e => console.error('Error:', e));
