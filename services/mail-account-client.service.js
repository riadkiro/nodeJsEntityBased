const MASKED_MAIL_PASSWORD = '••••••••';

function mailAccountForClient(account) {
    const value = typeof account?.toObject === 'function' ? account.toObject() : account;
    if (!value) return null;
    return {
        _id: value._id,
        name: value.name,
        email: value.email,
        authType: value.authType || 'password',
        color: value.color,
        isDefault: value.isDefault,
        isActive: value.isActive,
        lastSync: value.lastSync,
        imap: value.imap ? {
            host: value.imap.host,
            port: value.imap.port,
            user: value.imap.user,
            password: value.authType === 'oauth2' ? '' : MASKED_MAIL_PASSWORD,
            tls: value.imap.tls !== false,
        } : undefined,
        smtp: value.smtp ? {
            host: value.smtp.host,
            port: value.smtp.port,
            user: value.smtp.user,
            password: value.authType === 'oauth2' ? '' : MASKED_MAIL_PASSWORD,
            secure: value.smtp.secure === true,
        } : undefined,
        oauth: value.oauth ? {
            provider: value.oauth.provider,
            expiresAt: value.oauth.expiresAt,
            scope: value.oauth.scope,
        } : undefined,
    };
}

module.exports = { MASKED_MAIL_PASSWORD, mailAccountForClient };
