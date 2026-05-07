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
    path: '/account/9194/record/patients/69fb975ed9a96ee753d51d1b/fiche',
    headers: { 'Cookie': cookies }
  }, (res2) => {
    let body = '';
    res2.on('data', d => body += d);
    res2.on('end', () => {
      console.log('Fiche Status:', res2.statusCode);
      // Check for the actual header HTML element (not just CSS)
      const hasHeaderElement = body.includes('class="ov-card-header"');
      console.log('Has ov-card-header ELEMENT:', hasHeaderElement);
      console.log('Has Voir tout link:', body.includes('Voir tout'));
      
      // Check for ov-ef field elements
      const efMatches = body.match(/class="ov-ef"/g);
      console.log('ov-ef field count:', efMatches ? efMatches.length : 0);
      
      // Check for ov-ef-icon
      console.log('Has ov-ef-icon:', body.includes('class="ov-ef-icon"'));
      
      // Check CSS is present
      console.log('Has ov-ef CSS rule:', body.includes('.ov-ef{'));
      console.log('Has ov-ef-icon CSS:', body.includes('.ov-ef-icon{'));
    });
  });
});
loginReq.write(loginData);
loginReq.end();
