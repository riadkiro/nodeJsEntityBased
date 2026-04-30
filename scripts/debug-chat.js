const http = require('http');

function makeReq(opts, body) {
    return new Promise((resolve, reject) => {
        const r = http.request(opts, (res) => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: d }));
        });
        r.on('error', reject);
        if (body) r.write(body);
        r.end();
    });
}

async function main() {
    const loginData = JSON.stringify({ email: 'boukirou6@hotmail.com', password: 'test' });
    const loginRes = await makeReq({
        hostname: 'localhost', port: 3000, path: '/auth/login', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginData) }
    }, loginData);
    const cookie = (loginRes.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');
    console.log('Login:', loginRes.status);

    const base = '/account/7846/api/record/69e9e3e85ca57f4b82f9279f/notes';

    // 1. List
    const list = await makeReq({ hostname:'localhost', port:3000, path:base, method:'GET', headers:{Cookie:cookie} });
    console.log('List:', list.status, list.body.substring(0, 200));

    // 2. Create
    const cb = JSON.stringify({ title: 'Test note', color: '#3b82f6' });
    const create = await makeReq({ hostname:'localhost', port:3000, path:base, method:'POST',
        headers:{Cookie:cookie, 'Content-Type':'application/json', 'Content-Length':Buffer.byteLength(cb)} }, cb);
    console.log('Create:', create.status, create.body.substring(0, 200));

    if (create.status === 200) {
        const noteId = JSON.parse(create.body).note?._id;
        if (noteId) {
            // 3. Update
            const ub = JSON.stringify({ title: 'Updated', content: '<b>Hello</b>' });
            const update = await makeReq({ hostname:'localhost', port:3000, path:base+'/'+noteId, method:'PUT',
                headers:{Cookie:cookie, 'Content-Type':'application/json', 'Content-Length':Buffer.byteLength(ub)} }, ub);
            console.log('Update:', update.status, update.body.substring(0, 150));
        }
    }

    console.log('\nDone!');
    process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
