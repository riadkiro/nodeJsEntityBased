const http = require('http');

// First login to get session cookie
const loginData = JSON.stringify({ email: 'boukirou6@hotmail.com', password: 'test' });

const loginReq = http.request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length }
}, (res) => {
    const cookies = res.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || '';
    console.log('Login status:', res.statusCode);
    console.log('Cookies:', cookies.substring(0, 50) + '...');

    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        // Now fetch the kanban data
        const apiReq = http.request({
            hostname: '127.0.0.1',
            port: 3000,
            path: '/account/5001/api/entity/697c20e04b70c78bbe2e8702/views/697c20e04b70c78bbe2e8702/records?limit=2',
            method: 'GET',
            headers: { 'Cookie': cookies }
        }, (apiRes) => {
            let apiBody = '';
            apiRes.on('data', chunk => apiBody += chunk);
            apiRes.on('end', () => {
                try {
                    const data = JSON.parse(apiBody);
                    const sc = data.entity?.statusClassification;
                    console.log('\n=== API Response: entity.statusClassification ===');
                    console.log('Has statusClassification:', !!sc);
                    console.log('_id:', sc?._id);
                    console.log('id:', sc?.id);
                    console.log('Options count:', sc?.options?.length);
                    sc?.options?.forEach((opt, i) => {
                        console.log(`  [${i}] _id=${opt._id} id=${opt.id} label=${opt.label} color=${opt.color}`);
                    });
                } catch (e) {
                    console.log('API response (first 500):', apiBody.substring(0, 500));
                    console.log('Parse error:', e.message);
                }
            });
        });
        apiReq.end();
    });
});

loginReq.write(loginData);
loginReq.end();
