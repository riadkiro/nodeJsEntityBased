const http = require('http');

http.get('http://localhost:3000/account/5096/api/smartdoc/variables/6a0c1a3fb9f3a14df0c944c2', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Response:', data));
}).on('error', err => console.log('Error:', err.message));
