const http = require('http');

// First login to get cookie
const loginData = JSON.stringify({ email: 'boukirou6@hotmail.com', password: 'test' });
const loginOpts = {
    hostname: 'localhost', port: 3000, path: '/auth/login',
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length }
};

const loginReq = http.request(loginOpts, (res) => {
    const cookies = res.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || '';
    console.log('Login status:', res.statusCode);
    
    // Fetch task-lists for the record
    const recordId = '6a04e0f67b394b4558fdb6e3';
    const opts = {
        hostname: 'localhost', port: 3000,
        path: `/account/9194/api/record/${recordId}/task-lists`,
        method: 'GET',
        headers: { 'Cookie': cookies }
    };
    
    http.get(opts, (r) => {
        let data = '';
        r.on('data', c => data += c);
        r.on('end', () => {
            console.log('Task-lists status:', r.statusCode);
            try {
                const json = JSON.parse(data);
                console.log('Task-lists response:', JSON.stringify(json, null, 2).substring(0, 2000));
                
                if (json.taskLists && json.taskLists.length > 0) {
                    // Fetch tasks for first list
                    const listId = json.taskLists[0]._id;
                    const tOpts = {
                        hostname: 'localhost', port: 3000,
                        path: `/account/9194/api/task-lists/${listId}/tasks`,
                        method: 'GET',
                        headers: { 'Cookie': cookies }
                    };
                    http.get(tOpts, (tr) => {
                        let td = '';
                        tr.on('data', c => td += c);
                        tr.on('end', () => {
                            console.log('\nTasks for list', listId, ':', td.substring(0, 2000));
                        });
                    });
                }
            } catch(e) {
                console.log('Raw response:', data.substring(0, 500));
            }
        });
    });
});
loginReq.write(loginData);
loginReq.end();
