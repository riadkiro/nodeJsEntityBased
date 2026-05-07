const http = require('http');
const loginData = JSON.stringify({ email: 'boukirou6@hotmail.com', password: 'test' });
const loginReq = http.request({
  hostname: 'localhost', port: 3000, path: '/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length }
}, (res) => {
  const cookies = res.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || '';
  // Fetch the actual JS file
  http.get({
    hostname: 'localhost', port: 3000,
    path: '/themes/default/assets/js/custom.js',
    headers: { 'Cookie': cookies }
  }, (res2) => {
    let body = '';
    res2.on('data', d => body += d);
    res2.on('end', () => {
      console.log('JS Status:', res2.statusCode);
      console.log('Has Alpine.effect:', body.includes('Alpine.effect'));
      console.log('Has toggleTheme:', body.includes('toggleTheme'));
      // Check the theme init block
      const initBlock = body.substring(body.indexOf('init()'), body.indexOf('init()') + 300);
      console.log('\nInit block:\n', initBlock);
    });
  });
});
loginReq.write(loginData);
loginReq.end();
