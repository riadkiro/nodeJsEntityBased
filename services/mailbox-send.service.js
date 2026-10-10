const path = require('node:path');
const nodemailer = require('nodemailer');
const { tenantCollection } = require('../middleware/tenant');
const GoogleMailOAuth = require('./google-mail-oauth.service');
const MicrosoftMailOAuth = require('./microsoft-mail-oauth.service');
const { normalizeRecipients, stripHtml } = require('./ai-email-draft.service');

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_ATTACHMENT_BYTES = 20 * 1024 * 1024;

class MailboxSendError extends Error {
    constructor(message, status = 400, code = 'MAIL_SEND_FAILED') {
        super(message);
        this.name = 'MailboxSendError';
        this.status = status;
        this.code = code;
    }
}

function cleanHeader(value, maxLength = 1000) {
    return String(value || '').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function sanitizeMailHtml(value = '') {
    return String(value || '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<(?:iframe|object|embed)[^>]*>[\s\S]*?<\/(?:iframe|object|embed)>/gi, '')
        .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
        .replace(/javascript\s*:/gi, '');
}

function attachmentBuffer(attachment = {}) {
    const name = path.basename(cleanHeader(attachment.name || 'piece-jointe', 180));
    const encoded = String(attachment.content || '').replace(/^data:[^;,]+;base64,/i, '');
    if (!encoded) throw new MailboxSendError(`Ajoutez de nouveau la pièce jointe « ${name} » avant l'envoi.`, 400, 'ATTACHMENT_CONTENT_MISSING');
    if (!/^[a-z0-9+/=\r\n]+$/i.test(encoded)) throw new MailboxSendError(`La pièce jointe « ${name} » est invalide.`, 400, 'ATTACHMENT_INVALID');
    const content = Buffer.from(encoded, 'base64');
    if (!content.length || content.length > MAX_ATTACHMENT_BYTES) {
        throw new MailboxSendError(`La pièce jointe « ${name} » dépasse la limite de 10 Mo.`, 400, 'ATTACHMENT_TOO_LARGE');
    }
    return {
        filename: name,
        content,
        contentType: cleanHeader(attachment.mimeType || 'application/octet-stream', 120),
    };
}

function normalizeAttachments(attachments = []) {
    const files = (Array.isArray(attachments) ? attachments : []).slice(0, 10).map(attachmentBuffer);
    const total = files.reduce((sum, file) => sum + file.content.length, 0);
    if (total > MAX_TOTAL_ATTACHMENT_BYTES) {
        throw new MailboxSendError("L'ensemble des pièces jointes dépasse la limite de 20 Mo.", 400, 'ATTACHMENTS_TOO_LARGE');
    }
    return files;
}

async function resolveAccount(MailAccount, accountId) {
    let account = null;
    if (accountId && /^[a-f\d]{24}$/i.test(String(accountId))) account = await MailAccount.findById(accountId);
    if (!account) account = await MailAccount.findOne({ isDefault: true, isActive: { $ne: false } });
    if (!account) account = await MailAccount.findOne({ isActive: { $ne: false } }).sort({ createdAt: 1 });
    if (!account) throw new MailboxSendError("Aucun compte e-mail actif n'est configuré.", 400, 'MAIL_ACCOUNT_MISSING');
    return account;
}

async function transporterOptions(account, oauthServices = {}) {
    const smtp = account.smtp || {};
    const host = cleanHeader(smtp.host, 255);
    const port = Number(smtp.port || 587);
    const user = cleanHeader(smtp.user || account.email, 320);
    if (!host || !user) throw new MailboxSendError('Les réglages SMTP de ce compte sont incomplets.', 400, 'SMTP_CONFIG_MISSING');

    let auth;
    if (account.authType === 'oauth2') {
        const provider = account.oauth?.provider;
        const oauthService = provider === 'google'
            ? (oauthServices.google || GoogleMailOAuth)
            : (oauthServices.microsoft || MicrosoftMailOAuth);
        const accessToken = await oauthService.getValidAccessToken(account);
        auth = { type: 'OAuth2', user, accessToken };
    } else {
        const password = String(smtp.password || account.imap?.password || '');
        if (!password) throw new MailboxSendError('Le mot de passe SMTP de ce compte est manquant.', 400, 'SMTP_PASSWORD_MISSING');
        auth = { user, pass: password };
    }

    const secure = smtp.secure === true || port === 465;
    return {
        host,
        port,
        secure,
        requireTLS: !secure && port === 587,
        auth,
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 30000,
    };
}

async function nextMailId(Mail) {
    const latest = await Mail.findOne().sort({ id: -1 }).select('id').lean();
    return Math.max((Date.now() * 1000) + Math.floor(Math.random() * 1000), Number(latest?.id || 0) + 1);
}

function publicMail(mail) {
    const output = typeof mail.toObject === 'function' ? mail.toObject() : { ...mail };
    delete output.__v;
    return output;
}

async function sendMailboxMail(req, input = {}, options = {}) {
    const getTenantCollection = options.tenantCollection || tenantCollection;
    const Mail = options.Mail || await getTenantCollection(req, 'Mail');
    const MailAccount = options.MailAccount || await getTenantCollection(req, 'MailAccount');
    const account = await resolveAccount(MailAccount, input.accountId);
    const to = normalizeRecipients(input.to);
    const cc = input.cc ? normalizeRecipients(input.cc) : '';
    const subject = cleanHeader(input.title || input.subject, 300);
    if (!subject) throw new MailboxSendError("L'objet de l'e-mail est requis.", 400, 'SUBJECT_MISSING');
    const html = sanitizeMailHtml(input.description || input.html || '');
    const text = stripHtml(html);
    if (!text && !html.trim()) throw new MailboxSendError("Le contenu de l'e-mail est vide.", 400, 'BODY_MISSING');
    const attachments = normalizeAttachments(input.attachments);

    let draft = null;
    const draftId = Number(input.id);
    if (Number.isFinite(draftId)) {
        draft = await Mail.findOne({ id: draftId, type: 'draft', accountId: account._id });
        if (!draft) throw new MailboxSendError('Ce brouillon est introuvable ou a déjà été envoyé.', 404, 'DRAFT_NOT_FOUND');
    }

    const createTransport = options.createTransport || nodemailer.createTransport;
    const transport = createTransport(await transporterOptions(account, options.oauthServices));
    let info;
    try {
        info = await transport.sendMail({
            from: account.name ? { name: cleanHeader(account.name, 120), address: account.email } : account.email,
            to,
            cc: cc || undefined,
            subject,
            html,
            text,
            attachments,
        });
    } catch (error) {
        const code = String(error?.code || '').toUpperCase();
        if (code === 'EAUTH') throw new MailboxSendError("Le serveur SMTP a refusé l'authentification. Reconnectez ce compte e-mail.", 400, 'SMTP_AUTH_FAILED');
        if (['ECONNECTION', 'ETIMEDOUT', 'ESOCKET'].includes(code)) {
            throw new MailboxSendError('Connexion au serveur SMTP impossible. Vérifiez les réglages du compte.', 502, 'SMTP_CONNECTION_FAILED');
        }
        throw new MailboxSendError("Le serveur e-mail a refusé l'envoi. Vérifiez le destinataire et réessayez.", 502, 'SMTP_REJECTED');
    } finally {
        if (typeof transport.close === 'function') transport.close();
    }

    const accepted = Array.isArray(info?.accepted) ? info.accepted : [];
    if (Array.isArray(info?.rejected) && info.rejected.length && !accepted.length) {
        throw new MailboxSendError("Le serveur e-mail a refusé tous les destinataires.", 502, 'RECIPIENTS_REJECTED');
    }

    const now = new Date();
    const storedAttachments = attachments.map(file => ({
        name: file.filename,
        size: `${(file.content.length / 1024).toFixed(1)}KB`,
        type: file.contentType.startsWith('image/') ? 'image' : 'file',
    }));
    const values = {
        accountId: account._id,
        email: account.email,
        from: account.email,
        to,
        cc,
        firstName: 'Moi',
        lastName: '',
        title: subject,
        description: html,
        displayDescription: text.slice(0, 150),
        type: 'sent_mail',
        isUnread: false,
        date: now,
        time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        attachments: storedAttachments,
        messageId: cleanHeader(info?.messageId, 500),
        sentAt: now,
    };

    let sentMail;
    if (draft) {
        Object.assign(draft, values);
        await draft.save();
        sentMail = draft;
    } else {
        sentMail = await Mail.create({ id: await nextMailId(Mail), ...values });
    }

    return { mail: publicMail(sentMail), accepted, messageId: info?.messageId || '' };
}

module.exports = {
    MailboxSendError,
    normalizeAttachments,
    sanitizeMailHtml,
    sendMailboxMail,
    transporterOptions,
};
