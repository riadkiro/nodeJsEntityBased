const http = require('http');

const loginData = JSON.stringify({ email: 'boukirou6@hotmail.com', password: 'test' });
const loginOptions = {
    hostname: 'localhost', port: 3000, path: '/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginData) }
};

const loginReq = http.request(loginOptions, (loginRes) => {
    const cookies = loginRes.headers['set-cookie'] || [];
    const sid = cookies.map(c => c.split(';')[0]).join('; ');
    
    const apiReq = http.get('http://localhost:3000/account/7001/api/tasks-hub', {
        headers: { Cookie: sid }
    }, (apiRes) => {
        let data = '';
        apiRes.on('data', c => data += c);
        apiRes.on('end', () => {
            console.log('Status:', apiRes.statusCode);
            console.log('Response (first 500):', data.substring(0, 500));
        });
    });
});
loginReq.write(loginData);
loginReq.end();
