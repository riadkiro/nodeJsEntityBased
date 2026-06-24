module.exports = {
    imap: {
        user: process.env.IMAP_USER || '',
        password: process.env.IMAP_PASSWORD || '',
        host: process.env.IMAP_HOST || 'imap.one.com',
        port: process.env.IMAP_PORT || 993,
        tls: true,
        authTimeout: 3000
    },

    // ═══ SMTP (Brevo / Sendinblue) ═══
    smtp: {
        host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: false, // true for 465, false for 587
        auth: {
            user: process.env.SMTP_USER || '',     // Brevo login email
            pass: process.env.SMTP_PASS || '',      // Brevo SMTP key
        },
    },

    // Default sender
    from: {
        name: process.env.MAIL_FROM_NAME || 'Dexapp',
        email: process.env.MAIL_FROM_EMAIL || 'noreply@actirama.com',
    },
};
