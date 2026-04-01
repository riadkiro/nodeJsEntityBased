const http = require('http');
const mongoose = require('mongoose');

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_9194');
    const Entity = mongoose.connection.collection('entities');
    const acteEntity = await Entity.findOne({ slug: 'actes' });
    const entityId = acteEntity._id.toString();
    console.log('Actes Entity ID:', entityId);
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        method: 'POST',
        path: '/auth/login',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    };

    const loginReq = http.request(options, (res) => {
        let cookies = res.headers['set-cookie'] || [];
        const cookieStr = cookies.map(c => c.split(';')[0]).join('; ');
        
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            const searchUrl = `/account/9194/api/catalog-search?entityId=${entityId}&q=Consultation`;
            console.log('Fetching:', searchUrl);
            
            http.get({
                hostname: 'localhost',
                port: 3000,
                path: searchUrl,
                headers: { Cookie: cookieStr }
            }, (sRes) => {
                let sBody = '';
                sRes.on('data', chunk => sBody += chunk);
                sRes.on('end', () => {
                    try {
                        const json = JSON.parse(sBody);
                        if (json.data && json.data.length > 0) {
                            const item = json.data[0];
                            console.log('SUCCESS!');
                            console.log('Item lineDefaults[0].defaults:', item.lineDefaults[0].defaults);
                        } else {
                            console.log('No results found.');
                        }
                    } catch(e) {
                        console.log('Error:', e.message);
                    }
                    process.exit(0);
                });
            });
        });
    });
    loginReq.write('email=boukirou6@hotmail.com&password=test');
    loginReq.end();
}

run();
