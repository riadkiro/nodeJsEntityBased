const http = require('http');
let cookies = {};
function getCookieString() { return Object.entries(cookies).map(([k,v]) => `${k}=${v}`).join('; '); }
function parseCookies(res) { (res.headers['set-cookie'] || []).forEach(c => { const p = c.split(';')[0].split('='); cookies[p[0]] = p.slice(1).join('='); }); }
function request(method, path, body, ct) {
    return new Promise((resolve, reject) => {
        const req = http.request({ hostname:'localhost', port:3000, path, method, headers: { 'Cookie': getCookieString(), ...(ct ? {'Content-Type': ct} : {}) } }, (res) => {
            let d=''; res.on('data', c => d+=c); res.on('end', () => { parseCookies(res); resolve({status:res.statusCode, headers:res.headers, body:d}); });
        }); req.on('error', reject); if(body) req.write(body); req.end();
    });
}
async function main() {
    await request('GET', '/auth/login');
    await request('POST', '/auth/login', 'email=boukirou6%40hotmail.com&password=test', 'application/x-www-form-urlencoded');
    await request('GET', '/user/accounts');
    await request('GET', '/account/5096/home');

    const paths = [
        '/account/5096/drive',
        '/account/5096/drive/Factures',
        '/account/5096/drive/Factures/Ventes',
        '/account/5096/drive/app',
        '/account/5096/drive/app/some-entity-id',
        '/account/5096/drive/app/eid/rid',
    ];
    for (const p of paths) {
        const r = await request('GET', p);
        const ok = r.status === 200;
        const hasEjs = r.body.includes('SyntaxError');
        console.log(`${ok ? '✅' : '❌'} ${p} → ${r.status}${hasEjs ? ' EJS ERROR!' : ''}`);
    }
}
main().catch(e => console.error(e));
