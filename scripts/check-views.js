const mongoose = require('mongoose');
const fs = require('fs');
const http = require('http');

function makeRequest(options, body) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
        });
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

async function run() {
    const lines = [];

    // Cleanup broken envs first
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));
    const envs = await conn.db.collection('environments').find({}).toArray();
    for (const env of envs) {
        const spaces = await conn.db.collection('spaces').find({ environmentId: env._id }).toArray();
        let totalViews = 0;
        for (const space of spaces) {
            totalViews += await conn.db.collection('views').countDocuments({ spaces: space._id });
        }
        if (!env.isDefault && totalViews === 0) {
            for (const space of spaces) {
                await conn.db.collection('spaces').deleteOne({ _id: space._id });
            }
            await conn.db.collection('environments').deleteOne({ _id: env._id });
            lines.push('Cleaned: ' + env.name);
        }
    }
    await conn.close();

    // Login
    const loginRes = await makeRequest({
        hostname: '127.0.0.1', port: 3000,
        path: '/auth/login', method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }, 'email=boukirou6@hotmail.com&password=test');
    const cookies = loginRes.headers['set-cookie'];
    const cookieStr = cookies ? cookies.map(c => c.split(';')[0]).join('; ') : '';

    // Apply gestion-projets
    const tplRes = await makeRequest({
        hostname: '127.0.0.1', port: 3000,
        path: '/account/5001/api/space-templates', method: 'GET',
        headers: { Cookie: cookieStr }
    });
    const tplData = JSON.parse(tplRes.body);
    const projTpl = tplData.templates.find(t => t.slug === 'gestion-projets');

    const applyRes = await makeRequest({
        hostname: '127.0.0.1', port: 3000,
        path: '/account/5001/api/space-templates/' + projTpl._id + '/apply',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cookieStr }
    }, JSON.stringify({
        envName: 'Gestion de Projets',
        envIcon: 'solar:checklist-bold-duotone',
        envColor: '#e7515a'
    }));

    lines.push('Status: ' + applyRes.status);

    if (applyRes.status === 200) {
        const data = JSON.parse(applyRes.body);
        lines.push('SUCCESS!');
        lines.push('Entities: ' + (data.entities || []).length);
        for (const e of (data.entities || [])) {
            lines.push('  - ' + e.name + ' (viewId: ' + e.viewId + ')');
        }

        // Verify hierarchy
        const hierRes = await makeRequest({
            hostname: '127.0.0.1', port: 3000,
            path: '/account/5001/api/hierarchy/list?environmentId=' + data.environment.id,
            method: 'GET',
            headers: { Cookie: cookieStr }
        });
        const hierData = JSON.parse(hierRes.body);
        const scan = (items, indent) => {
            for (const item of items) {
                lines.push(indent + item.type + ': ' + item.name);
                if (item.children) scan(item.children, indent + '  ');
            }
        };
        lines.push('\nHierarchy:');
        scan(hierData.hierarchy || [], '  ');
    } else {
        lines.push('FAILED! ' + applyRes.body);
    }

    fs.writeFileSync('scripts/db-check.log', lines.join('\n'), 'utf8');
    console.log('Done');
}

run().catch(e => { console.error(e); process.exit(1); });
