const { tenantCollection } = require('../middleware/tenant');

const MAX_SUBJECT_LENGTH = 300;
const MAX_BODY_LENGTH = 50000;

function cleanHeader(value, maxLength = 1000) {
    return String(value || '')
        .replace(/[\r\n]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, maxLength);
}

function extractAddress(value) {
    const text = cleanHeader(value);
    const angleMatch = text.match(/<([^<>\s]+@[^<>\s]+)>$/);
    return (angleMatch ? angleMatch[1] : text).trim().toLowerCase();
}

function normalizeRecipients(value) {
    const raw = (Array.isArray(value) ? value : [value]).map(item => cleanHeader(item)).filter(Boolean).join(', ');
    if (!raw) throw new Error("L'adresse e-mail du destinataire est requise.");
    const recipients = raw.match(/[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+/gi) || [];
    if (!recipients.length) throw new Error("L'adresse e-mail du destinataire n'est pas valide.");
    return [...new Set(recipients.map(recipient => recipient.toLowerCase()))].join(', ');
}

function stripHtml(value) {
    return String(value || '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<br\s*\/?\s*>/gi, '\n')
        .replace(/<\/p\s*>/gi, '\n')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function plainTextToHtml(value) {
    const normalized = String(value || '')
        .replace(/\r\n?/g, '\n')
        .replace(/[\t ]+\n/g, '\n')
        .replace(/\n[\t ]+/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    return escapeHtml(normalized).replace(/\n/g, '<br>');
}

function escapeRegex(value = '') {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replySearchFilter(query) {
    const terms = String(query || '')
        .split(/\s+(?:OR|OU)\s+|[|;,]+/i)
        .map(term => term.trim())
        .filter(Boolean)
        .slice(0, 12);
    if (!terms.length) return null;
    const fields = ['title', 'email', 'firstName', 'lastName', 'displayDescription', 'description'];
    return {
        $or: terms.flatMap(term => fields.map(field => ({
            [field]: { $regex: escapeRegex(term), $options: 'i' },
        }))),
    };
}

async function findSourceEmail(Mail, input = {}) {
    const emailId = String(input.emailId || '').trim();
    if (emailId) {
        const identifierFilter = /^[a-f\d]{24}$/i.test(emailId)
            ? { _id: emailId }
            : /^\d+$/.test(emailId)
                ? { id: Number(emailId) }
                : null;
        if (identifierFilter) {
            const byId = await Mail.findOne({ ...identifierFilter, type: 'inbox' }).lean();
            if (byId) return byId;
        }
    }

    const search = replySearchFilter(input.query);
    if (!search) throw new Error("L'e-mail auquel répondre est introuvable. Précisez l'expéditeur ou ouvrez l'e-mail concerné.");
    const source = await Mail.findOne({ type: 'inbox', ...search }).sort({ date: -1 }).lean();
    if (!source) throw new Error(`Aucun e-mail trouvé pour « ${cleanHeader(input.query, 120)} ».`);
    return source;
}

async function resolveMailAccount(MailAccount, requestedAccountId, sourceAccountId) {
    const accountId = requestedAccountId || sourceAccountId;
    if (accountId && /^[a-f\d]{24}$/i.test(String(accountId))) {
        const account = await MailAccount.findById(accountId).lean();
        if (account?.isActive !== false) return account;
    }
    const defaultAccount = await MailAccount.findOne({ isDefault: true, isActive: { $ne: false } }).lean();
    if (defaultAccount) return defaultAccount;
    return MailAccount.findOne({ isActive: { $ne: false } }).sort({ createdAt: 1 }).lean();
}

async function nextDraftId(Mail) {
    const latest = await Mail.findOne().sort({ id: -1 }).select('id').lean();
    const timeBasedId = (Date.now() * 1000) + Math.floor(Math.random() * 1000);
    return Math.max(timeBasedId, Number(latest?.id || 0) + 1);
}

function replySubject(subject) {
    const value = cleanHeader(subject || 'Sans objet', MAX_SUBJECT_LENGTH);
    return /^re\s*:/i.test(value) ? value : `Re: ${value}`;
}

async function createAiEmailDraft(req, input = {}, options = {}) {
    const getTenantCollection = options.tenantCollection || tenantCollection;
    const Mail = options.Mail || await getTenantCollection(req, 'Mail');
    const MailAccount = options.MailAccount || await getTenantCollection(req, 'MailAccount');
    const mode = input.mode === 'reply' ? 'reply' : 'create';
    const source = mode === 'reply' ? await findSourceEmail(Mail, input) : null;
    const account = await resolveMailAccount(MailAccount, input.accountId, source?.accountId);
    if (!account) throw new Error("Aucun compte e-mail actif n'est configuré. Connectez d'abord une messagerie.");

    const body = String(input.body || input.message || input.content || '').trim().slice(0, MAX_BODY_LENGTH);
    if (!body) throw new Error('Le contenu du brouillon est requis.');

    const to = normalizeRecipients(input.to || source?.email);
    const subject = mode === 'reply'
        ? cleanHeader(input.subject, MAX_SUBJECT_LENGTH) || replySubject(source?.title)
        : cleanHeader(input.subject, MAX_SUBJECT_LENGTH) || 'Sans objet';
    let description = plainTextToHtml(body);
    if (source) {
        const quoted = stripHtml(source.description || source.displayDescription || '').slice(0, 5000);
        if (quoted) {
            description += `<br><br><blockquote style="border-left:3px solid #d8ddeb;padding-left:12px;color:#6b7280">${plainTextToHtml(quoted)}</blockquote>`;
        }
    }

    const now = new Date();
    const draft = await Mail.create({
        id: await nextDraftId(Mail),
        accountId: account._id,
        email: account.email,
        from: account.email,
        to,
        cc: cleanHeader(input.cc),
        firstName: 'Moi',
        lastName: '',
        title: subject,
        date: now,
        time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        description,
        displayDescription: stripHtml(body).slice(0, 150),
        type: 'draft',
        isUnread: false,
        isStar: false,
        isImportant: false,
        group: '',
        attachments: [],
        sourceMailId: source?._id,
        isAiDraft: true,
    });

    return {
        id: draft.id,
        mongoId: String(draft._id),
        accountId: String(account._id),
        to,
        subject,
        mode,
        type: draft.type,
    };
}

module.exports = {
    createAiEmailDraft,
    extractAddress,
    normalizeRecipients,
    plainTextToHtml,
    replySearchFilter,
    replySubject,
    stripHtml,
};
