// Quick test: manually save a fiche preference
const http = require('http');

const data = JSON.stringify({
    viewId: 'fiche-patients',
    preferences: {
        ficheLayout: {
            fieldOrder: ['title', 'description', 'date'],
            hiddenFields: ['description', 'date']
        }
    }
});

// First, login to get the cookie
const loginData = JSON.stringify({
    email: 'boukirou6@hotmail.com',
    password: 'test'
});

const loginReq = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
    }
}, (loginRes) => {
    const cookies = loginRes.headers['set-cookie'];
    const cookieStr = cookies ? cookies.map(c => c.split(';')[0]).join('; ') : '';
    console.log('Login status:', loginRes.statusCode);
    console.log('Cookie:', cookieStr.substring(0, 80) + '...');
    
    // Now save preferences
    const req = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/account/9194/api/user/view-preferences',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length,
            'Cookie': cookieStr
        }
    }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            console.log('Save status:', res.statusCode);
            console.log('Response:', body);
        });
    });
    req.write(data);
    req.end();
});

loginReq.write(loginData);
loginReq.end();
