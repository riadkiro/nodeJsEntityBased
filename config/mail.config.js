module.exports = {
    imap: {
        user: process.env.IMAP_USER || 'direction@da-clean.be',
        password: process.env.IMAP_PASSWORD || 'DidissNE7**',
        host: process.env.IMAP_HOST || 'imap.one.com',
        port: process.env.IMAP_PORT || 993,
        tls: true,
        authTimeout: 3000
    }
};
