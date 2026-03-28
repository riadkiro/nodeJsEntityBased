const http = require('http');
const req = http.get('http://localhost:3000', (res) => {
    console.log('Server status:', res.statusCode);
    res.on('data', () => {});
    res.on('end', () => process.exit(0));
});
req.on('error', (e) => {
    console.log('Server not ready:', e.message);
    process.exit(1);
});
req.setTimeout(3000, () => {
    console.log('Server timeout');
    req.destroy();
    process.exit(1);
});
