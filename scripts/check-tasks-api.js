const http = require('http');

// First login to get session cookie
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
}, (res) => {
    const cookies = res.headers['set-cookie'];
    const cookieStr = cookies ? cookies.map(c => c.split(';')[0]).join('; ') : '';
    
    console.log('Login status:', res.statusCode);
    console.log('Cookies:', cookieStr ? 'obtained' : 'none');
    
    // Follow redirect if needed
    const tasksReq = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/account/9194/api/datagrid/tasks',
        method: 'GET',
        headers: {
            'Cookie': cookieStr
        }
    }, (res2) => {
        let body = '';
        res2.on('data', chunk => body += chunk);
        res2.on('end', () => {
            console.log('\n--- Tasks API Status:', res2.statusCode, '---');
            try {
                const data = JSON.parse(body);
                console.log('Rows count:', data.rows?.length || 0);
                console.log('Columns:', data.columns?.map(c => c.name).join(', '));
                if (data.rows?.length > 0) {
                    console.log('First task:', data.rows[0].title);
                }
                if (data.error) console.log('Error:', data.error);
            } catch(e) {
                console.log('Response (first 200 chars):', body.substring(0, 200));
            }
        });
    });
    tasksReq.end();
});

loginReq.write(loginData);
loginReq.end();
