const net = require('net');

function checkPort(port) {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(true); // Port is occupied, so server is running
            } else {
                resolve(false);
            }
        });
        server.once('listening', () => {
            server.close();
            resolve(false); // Port is free
        });
        server.listen(port);
    });
}

checkPort(3000).then(running => {
    console.log(running ? "SERVER_RUNNING" : "SERVER_NOT_RUNNING");
    process.exit(0);
});
