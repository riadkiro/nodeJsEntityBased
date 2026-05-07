const http = require('http');

const loginData = JSON.stringify({ email: 'boukirou6@hotmail.com', password: 'test' });
const loginReq = http.request({
  hostname: 'localhost', port: 3000, path: '/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length }
}, (res) => {
  const cookies = res.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || '';
  
  http.get({
    hostname: 'localhost', port: 3000,
    path: '/account/9194/record/patients/69ccfac0738ff763a647e297/overview',
    headers: { 'Cookie': cookies }
  }, (res2) => {
    let body = '';
    res2.on('data', d => body += d);
    res2.on('end', () => {
      console.log('Status:', res2.statusCode);
      // Print all text content
      const text = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      console.log('Response text:', text.substring(0, 500));
    });
  });
});
loginReq.write(loginData);
loginReq.end();
