const dns = require('node:dns').promises;

const PROVIDERS = Object.freeze({
    gmail: {
        key: 'gmail', name: 'Gmail', color: '#ea4335',
        domains: ['gmail.com', 'googlemail.com'],
        imap: { host: 'imap.gmail.com', port: 993, tls: true },
        smtp: { host: 'smtp.gmail.com', port: 465, secure: true },
        passwordLabel: "Mot de passe d'application",
        helpText: "Gmail exige généralement un mot de passe d'application si la validation en deux étapes est activée."
    },
    microsoft: {
        key: 'microsoft', name: 'Outlook / Hotmail', color: '#1473e6',
        domains: ['outlook.com', 'hotmail.com', 'hotmail.fr', 'live.com', 'live.fr', 'msn.com'],
        imap: { host: 'outlook.office365.com', port: 993, tls: true },
        smtp: { host: 'smtp-mail.outlook.com', port: 587, secure: false },
        authType: 'oauth2',
        passwordLabel: 'Connexion Microsoft',
        helpText: 'Microsoft exige une connexion OAuth2 sécurisée. Votre mot de passe ne sera jamais demandé par DexApp.'
    },
    yahoo: {
        key: 'yahoo', name: 'Yahoo Mail', color: '#6001d2',
        domains: ['yahoo.com', 'yahoo.fr', 'ymail.com', 'rocketmail.com'],
        imap: { host: 'imap.mail.yahoo.com', port: 993, tls: true },
        smtp: { host: 'smtp.mail.yahoo.com', port: 465, secure: true },
        passwordLabel: "Mot de passe d'application",
        helpText: "Yahoo utilise un mot de passe d'application pour les logiciels de messagerie."
    },
    icloud: {
        key: 'icloud', name: 'iCloud Mail', color: '#4f8df7',
        domains: ['icloud.com', 'me.com', 'mac.com'],
        imap: { host: 'imap.mail.me.com', port: 993, tls: true },
        smtp: { host: 'smtp.mail.me.com', port: 587, secure: false },
        passwordLabel: "Mot de passe d'application",
        helpText: "iCloud exige un mot de passe spécifique à l'application."
    },
    zoho: {
        key: 'zoho', name: 'Zoho Mail', color: '#e42527',
        domains: ['zoho.com', 'zohomail.com', 'zoho.eu'],
        imap: { host: 'imap.zoho.com', port: 993, tls: true },
        smtp: { host: 'smtp.zoho.com', port: 465, secure: true },
        passwordLabel: 'Mot de passe', helpText: 'Utilisez le mot de passe de votre boite Zoho ou un mot de passe d’application.'
    },
    fastmail: {
        key: 'fastmail', name: 'Fastmail', color: '#0067b9',
        domains: ['fastmail.com', 'fastmail.fm'],
        imap: { host: 'imap.fastmail.com', port: 993, tls: true },
        smtp: { host: 'smtp.fastmail.com', port: 465, secure: true },
        passwordLabel: "Mot de passe d'application", helpText: "Fastmail recommande un mot de passe d'application."
    },
    gmx: {
        key: 'gmx', name: 'GMX', color: '#164194',
        domains: ['gmx.com', 'gmx.fr', 'gmx.net'],
        imap: { host: 'imap.gmx.com', port: 993, tls: true },
        smtp: { host: 'mail.gmx.com', port: 465, secure: true },
        passwordLabel: 'Mot de passe', helpText: 'Vérifiez que l’accès IMAP est activé dans GMX.'
    },
    aol: {
        key: 'aol', name: 'AOL Mail', color: '#111111',
        domains: ['aol.com', 'aol.fr'],
        imap: { host: 'imap.aol.com', port: 993, tls: true },
        smtp: { host: 'smtp.aol.com', port: 465, secure: true },
        passwordLabel: "Mot de passe d'application", helpText: "AOL peut exiger un mot de passe d'application."
    },
    orange: {
        key: 'orange', name: 'Orange Mail', color: '#ff7900',
        domains: ['orange.fr', 'wanadoo.fr'],
        imap: { host: 'imap.orange.fr', port: 993, tls: true },
        smtp: { host: 'smtp.orange.fr', port: 465, secure: true },
        passwordLabel: 'Mot de passe', helpText: 'Utilisez le mot de passe de votre boite Orange.'
    },
    free: {
        key: 'free', name: 'Free Mail', color: '#cd1e2c',
        domains: ['free.fr'],
        imap: { host: 'imap.free.fr', port: 993, tls: true },
        smtp: { host: 'smtp.free.fr', port: 465, secure: true },
        passwordLabel: 'Mot de passe', helpText: 'Utilisez le mot de passe de votre boite Free.'
    },
    laposte: {
        key: 'laposte', name: 'LaPoste.net', color: '#0b52a0',
        domains: ['laposte.net'],
        imap: { host: 'imap.laposte.net', port: 993, tls: true },
        smtp: { host: 'smtp.laposte.net', port: 465, secure: true },
        passwordLabel: 'Mot de passe', helpText: 'Utilisez le mot de passe de votre boite LaPoste.net.'
    },
    mailcom: {
        key: 'mailcom', name: 'Mail.com', color: '#1769aa',
        domains: ['mail.com', 'email.com'],
        imap: { host: 'imap.mail.com', port: 993, tls: true },
        smtp: { host: 'smtp.mail.com', port: 465, secure: true },
        passwordLabel: 'Mot de passe', helpText: 'Vérifiez que l’accès IMAP est activé sur votre compte Mail.com.'
    },
    infomaniak: {
        key: 'infomaniak', name: 'Infomaniak Mail', color: '#0098ff', domains: [],
        imap: { host: 'mail.infomaniak.com', port: 993, tls: true },
        smtp: { host: 'mail.infomaniak.com', port: 465, secure: true },
        passwordLabel: 'Mot de passe', helpText: 'Utilisez le mot de passe de votre adresse Infomaniak.'
    },
    ovh: {
        key: 'ovh', name: 'OVHcloud Mail', color: '#0050d7', domains: [],
        imap: { host: 'ssl0.ovh.net', port: 993, tls: true },
        smtp: { host: 'ssl0.ovh.net', port: 465, secure: true },
        passwordLabel: 'Mot de passe', helpText: 'Utilisez le mot de passe de votre adresse OVHcloud.'
    }
});

const DOMAIN_INDEX = new Map();
for (const provider of Object.values(PROVIDERS)) {
    for (const domain of provider.domains) DOMAIN_INDEX.set(domain, provider);
}

function parseEmail(value) {
    const email = String(value || '').trim().toLowerCase();
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
    const domain = email.slice(email.lastIndexOf('@') + 1);
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) return null;
    return { email, domain };
}

function publicProvider(provider, detectedBy) {
    return {
        key: provider.key,
        name: provider.name,
        color: provider.color,
        imap: { ...provider.imap },
        smtp: { ...provider.smtp },
        passwordLabel: provider.passwordLabel,
        helpText: provider.helpText,
        authType: provider.authType || 'password',
        detectedBy
    };
}

function providerFromMx(records = []) {
    const exchanges = records.map(record => String(record.exchange || '').toLowerCase());
    const has = pattern => exchanges.some(exchange => pattern.test(exchange));
    if (has(/(?:google|googlemail)\.com\.?$/)) return PROVIDERS.gmail;
    if (has(/(?:protection\.)?outlook\.com\.?$/)) return PROVIDERS.microsoft;
    if (has(/yahoodns\.net\.?$/)) return PROVIDERS.yahoo;
    if (has(/zoho\.(?:com|eu)\.?$/)) return PROVIDERS.zoho;
    if (has(/messagingengine\.com\.?$/)) return PROVIDERS.fastmail;
    if (has(/infomaniak\.(?:com|ch)\.?$/)) return PROVIDERS.infomaniak;
    if (has(/(?:mx\d*\.mail\.)?ovh\.net\.?$/) || has(/mx\.ovh\.com\.?$/)) return PROVIDERS.ovh;
    return null;
}

async function resolveMxWithTimeout(domain, resolveMx, timeoutMs) {
    let timeout;
    try {
        return await Promise.race([
            Promise.resolve(resolveMx(domain)),
            new Promise((_, reject) => {
                timeout = setTimeout(() => reject(new Error('MX lookup timeout')), timeoutMs);
            })
        ]);
    } finally {
        if (timeout) clearTimeout(timeout);
    }
}

async function discoverEmailProvider(value, options = {}) {
    const parsed = parseEmail(value);
    if (!parsed) return { found: false, reason: 'invalid_email' };

    const exactProvider = DOMAIN_INDEX.get(parsed.domain);
    if (exactProvider) {
        return { found: true, email: parsed.email, provider: publicProvider(exactProvider, 'domain') };
    }

    const resolveMx = options.resolveMx || dns.resolveMx.bind(dns);
    const timeoutMs = Number(options.timeoutMs) > 0 ? Number(options.timeoutMs) : 3000;
    try {
        const records = await resolveMxWithTimeout(parsed.domain, resolveMx, timeoutMs);
        const mxProvider = providerFromMx(records);
        if (mxProvider) {
            return { found: true, email: parsed.email, provider: publicProvider(mxProvider, 'mx') };
        }
    } catch (_) {
        // A DNS failure simply falls back to manual configuration.
    }

    return { found: false, email: parsed.email, domain: parsed.domain, reason: 'unknown_provider' };
}

module.exports = {
    PROVIDERS,
    parseEmail,
    providerFromMx,
    discoverEmailProvider
};
