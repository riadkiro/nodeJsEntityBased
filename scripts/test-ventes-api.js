const http = require('http');

const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/account/5096/api/drive/files?folder=Factures%2FVentes',
    method: 'GET',
    headers: { 'Cookie': 'connect.sid=fakecookie' } // It might fail with 401 but it should return *something*
}, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('Response:', res.statusCode, data));
});

req.on('error', e => console.error('Error:', e));
req.setTimeout(5000, () => { console.error('TIMEOUT'); req.abort(); });
req.end();
