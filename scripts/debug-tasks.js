const http = require('http');
const loginData = JSON.stringify({ email: 'boukirou6@hotmail.com', password: 'test' });
const loginOpts = {
    hostname: 'localhost', port: 3000, path: '/auth/login',
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length }
};
const loginReq = http.request(loginOpts, (res) => {
    const cookies = res.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || '';
    const opts = {
        hostname: 'localhost', port: 3000,
        path: '/account/9194/api/record/6a04e0f67b394b4558fdb6e3/task-lists',
        method: 'GET', headers: { 'Cookie': cookies }
    };
    http.get(opts, (r) => {
        let data = '';
        r.on('data', c => data += c);
        r.on('end', () => {
            const json = JSON.parse(data);
            // Show full task structure
            if (json.lists && json.lists[0] && json.lists[0].tasks) {
                json.lists[0].tasks.forEach(t => {
                    console.log('--- Task:', t.title, '---');
                    console.log(JSON.stringify(t, null, 2));
                });
            }
        });
    });
});
loginReq.write(loginData);
loginReq.end();
