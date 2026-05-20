const net = require('net');

const port = 3000;
const server = net.createServer()
    .once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is currently in use/running.`);
        } else {
            console.log(`Error:`, err);
        }
        process.exit(0);
    })
    .once('listening', () => {
        console.log(`Port ${port} is free!`);
        server.close();
        process.exit(0);
    })
    .listen(port);
