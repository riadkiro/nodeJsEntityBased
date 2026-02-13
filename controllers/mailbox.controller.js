const tenantCollection = require("../middleware/tenant").tenantCollection;
const { mailboxData } = require('./mailbox.data');
const imaps = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;
const mailConfig = require('../config/mail.config');

exports.sync = async (req, res) => {
    try {
        const Mail = await tenantCollection(req, "Mail");
        const MailAccount = await tenantCollection(req, "MailAccount");

        // Determine which account to sync
        const accountId = req.body.accountId || req.query.accountId;
        let account;
        if (accountId) {
            account = await MailAccount.findById(accountId);
        } else {
            account = await MailAccount.findOne({ isDefault: true });
            if (!account) account = await MailAccount.findOne();
        }

        if (!account) {
            return res.json({ success: false, error: 'No mail account configured' });
        }

        if (!account.imap || !account.imap.user || !account.imap.password) {
            return res.json({ success: false, error: 'IMAP credentials missing for account: ' + account.name });
        }

        // Build IMAP config from account
        const config = {
            imap: {
                user: account.imap.user,
                password: account.imap.password,
                host: account.imap.host,
                port: account.imap.port || 993,
                tls: account.imap.tls !== false,
                authTimeout: 10000,
            }
        };

        const connection = await imaps.connect(config);
        await connection.openBox('INBOX');

        // Incremental sync: use lastSync if available, otherwise 300 days
        const since = account.lastSync
            ? new Date(new Date(account.lastSync).getTime() - 60000) // 1min overlap to avoid missing emails
            : new Date(Date.now() - 300 * 24 * 3600 * 1000);

        const searchCriteria = [['SINCE', since]];
        const fetchOptions = {
            bodies: ['HEADER', 'TEXT', ''],
            markSeen: false,
            struct: true
        };

        const results = await connection.search(searchCriteria, fetchOptions);
        // On first sync, limit to 50 most recent; on incremental, take all
        const messages = account.lastSync ? results : results.slice(-50);

        let addedCount = 0;
        for (let item of messages) {
            const all = item.parts.find(part => part.which === '');
            const id = item.attributes.uid;
            let simpleMail;
            if (all && all.body) {
                simpleMail = await simpleParser(all.body);
            } else {
                const raw = item.parts.find(p => p.which === '');
                if (raw) simpleMail = await simpleParser(raw.body);
            }

            if (simpleMail) {
                const existing = await Mail.findOne({ id: id, accountId: account._id });
                if (!existing) {
                    await Mail.create({
                        id: id,
                        accountId: account._id,
                        email: simpleMail.from.text,
                        firstName: simpleMail.from.value[0]?.name?.split(' ')[0] || '',
                        lastName: simpleMail.from.value[0]?.name?.split(' ').slice(1).join(' ') || '',
                        title: simpleMail.subject,
                        date: simpleMail.date,
                        time: simpleMail.date ? new Date(simpleMail.date).toLocaleTimeString() : '',
                        description: simpleMail.html || simpleMail.textAsHtml || simpleMail.text,
                        displayDescription: simpleMail.text ? simpleMail.text.substring(0, 100) : '',
                        type: 'inbox',
                        isUnread: true,
                    });
                    addedCount++;
                }
            }
        }

        connection.end();

        // Update lastSync
        account.lastSync = new Date();
        await account.save();

        // Return updated mail list for this account
        const mails = await Mail.find({ accountId: account._id }).sort({ date: -1 }).lean();
        const mailList = mails.map(m => ({
            ...m,
            _id: undefined,
            __v: undefined,
        }));

        console.log(`Synced ${addedCount} new mails for account "${account.name}"`);
        res.json({ success: true, addedCount, totalCount: mails.length, mails: mailList });
    } catch (e) {
        console.error("Sync Error:", e.message);
        res.json({ success: false, error: 'Sync failed: ' + e.message });
    }
};

// ===== API: Toggle Star =====
exports.toggleStar = async (req, res) => {
    try {
        const Mail = await tenantCollection(req, "Mail");
        const mail = await Mail.findOne({ id: parseInt(req.params.mailId) });
        if (!mail) return res.status(404).json({ error: 'Mail not found' });
        mail.isStar = !mail.isStar;
        await mail.save();
        res.json({ success: true, isStar: mail.isStar });
    } catch (error) {
        console.error('toggleStar Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ===== API: Toggle Important =====
exports.toggleImportant = async (req, res) => {
    try {
        const Mail = await tenantCollection(req, "Mail");
        const mail = await Mail.findOne({ id: parseInt(req.params.mailId) });
        if (!mail) return res.status(404).json({ error: 'Mail not found' });
        mail.isImportant = !mail.isImportant;
        await mail.save();
        res.json({ success: true, isImportant: mail.isImportant });
    } catch (error) {
        console.error('toggleImportant Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ===== API: Set Group (label) =====
exports.setGroup = async (req, res) => {
    try {
        const Mail = await tenantCollection(req, "Mail");
        const { ids, group } = req.body;
        if (!ids || !ids.length) return res.status(400).json({ error: 'No mail IDs provided' });
        await Mail.updateMany(
            { id: { $in: ids.map(id => parseInt(id)) } },
            { $set: { group: group || '' } }
        );
        res.json({ success: true });
    } catch (error) {
        console.error('setGroup Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ===== API: Set Type (move to folder) =====
exports.setType = async (req, res) => {
    try {
        const Mail = await tenantCollection(req, "Mail");
        const { ids, type } = req.body;
        if (!ids || !ids.length) return res.status(400).json({ error: 'No mail IDs provided' });
        await Mail.updateMany(
            { id: { $in: ids.map(id => parseInt(id)) } },
            { $set: { type: type } }
        );
        res.json({ success: true });
    } catch (error) {
        console.error('setType Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ===== API: Set Read/Unread =====
exports.setReadStatus = async (req, res) => {
    try {
        const Mail = await tenantCollection(req, "Mail");
        const { ids, isUnread } = req.body;
        if (!ids || !ids.length) return res.status(400).json({ error: 'No mail IDs provided' });
        await Mail.updateMany(
            { id: { $in: ids.map(id => parseInt(id)) } },
            { $set: { isUnread: isUnread } }
        );
        res.json({ success: true });
    } catch (error) {
        console.error('setReadStatus Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ===== API: Delete permanently =====
exports.deleteMails = async (req, res) => {
    try {
        const Mail = await tenantCollection(req, "Mail");
        const { ids } = req.body;
        if (!ids || !ids.length) return res.status(400).json({ error: 'No mail IDs provided' });
        await Mail.deleteMany({ id: { $in: ids.map(id => parseInt(id)) } });
        res.json({ success: true });
    } catch (error) {
        console.error('deleteMails Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ===== MAIL ACCOUNTS CRUD =====
exports.getAccounts = async (req, res) => {
    try {
        const MailAccount = await tenantCollection(req, "MailAccount");
        const accounts = await MailAccount.find().sort({ createdAt: 1 }).lean();
        // Hide passwords in response
        const safe = accounts.map(a => ({
            ...a,
            imap: { ...a.imap, password: '••••••••' },
            smtp: a.smtp ? { ...a.smtp, password: '••••••••' } : undefined,
        }));
        res.json({ success: true, accounts: safe });
    } catch (error) {
        console.error('getAccounts Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.createAccount = async (req, res) => {
    try {
        const MailAccount = await tenantCollection(req, "MailAccount");
        const { name, email, imap, smtp, color } = req.body;

        if (!name || !email || !imap || !imap.host || !imap.user || !imap.password) {
            return res.status(400).json({ error: 'Name, email, and IMAP credentials are required' });
        }

        // If first account, set as default
        const count = await MailAccount.countDocuments();
        const account = await MailAccount.create({
            name,
            email,
            imap: {
                host: imap.host,
                port: imap.port || 993,
                user: imap.user,
                password: imap.password,
                tls: imap.tls !== false,
            },
            smtp: smtp ? {
                host: smtp.host,
                port: smtp.port || 587,
                user: smtp.user || imap.user,
                password: smtp.password || imap.password,
                secure: smtp.secure || false,
            } : undefined,
            color: color || '#4361ee',
            isDefault: count === 0,
        });

        res.json({ success: true, account: { ...account.toObject(), imap: { ...account.imap, password: '••••••••' } } });
    } catch (error) {
        console.error('createAccount Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updateAccount = async (req, res) => {
    try {
        const MailAccount = await tenantCollection(req, "MailAccount");
        const { name, email, imap, smtp, color } = req.body;
        const account = await MailAccount.findById(req.params.accountId);
        if (!account) return res.status(404).json({ error: 'Account not found' });

        if (name) account.name = name;
        if (email) account.email = email;
        if (color) account.color = color;
        if (imap) {
            if (imap.host) account.imap.host = imap.host;
            if (imap.port) account.imap.port = imap.port;
            if (imap.user) account.imap.user = imap.user;
            if (imap.password && imap.password !== '••••••••') account.imap.password = imap.password;
            if (imap.tls !== undefined) account.imap.tls = imap.tls;
        }
        if (smtp) {
            if (!account.smtp) account.smtp = {};
            if (smtp.host) account.smtp.host = smtp.host;
            if (smtp.port) account.smtp.port = smtp.port;
            if (smtp.user) account.smtp.user = smtp.user;
            if (smtp.password && smtp.password !== '••••••••') account.smtp.password = smtp.password;
            if (smtp.secure !== undefined) account.smtp.secure = smtp.secure;
        }

        await account.save();
        res.json({ success: true });
    } catch (error) {
        console.error('updateAccount Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const MailAccount = await tenantCollection(req, "MailAccount");
        await MailAccount.findByIdAndDelete(req.params.accountId);
        res.json({ success: true });
    } catch (error) {
        console.error('deleteAccount Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.setDefaultAccount = async (req, res) => {
    try {
        const MailAccount = await tenantCollection(req, "MailAccount");
        await MailAccount.updateMany({}, { $set: { isDefault: false } });
        await MailAccount.findByIdAndUpdate(req.params.accountId, { $set: { isDefault: true } });
        res.json({ success: true });
    } catch (error) {
        console.error('setDefaultAccount Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.testConnection = async (req, res) => {
    try {
        const { host, port, user, password, tls } = req.body;
        if (!host || !user || !password) {
            return res.status(400).json({ error: 'Host, user and password are required' });
        }

        const config = {
            imap: { host, port: port || 993, user, password, tls: tls !== false, authTimeout: 5000 }
        };

        const connection = await imaps.connect(config);
        await connection.openBox('INBOX');
        connection.end();

        res.json({ success: true, message: 'Connection successful!' });
    } catch (error) {
        console.error('testConnection Error:', error.message);
        res.status(400).json({ success: false, error: 'Connection failed: ' + error.message });
    }
};

exports.index = async (req, res) => {
    try {
        const Mail = await tenantCollection(req, "Mail");
        const MailAccount = await tenantCollection(req, "MailAccount");

        // Load mail accounts
        const accounts = await MailAccount.find().sort({ createdAt: 1 }).lean();
        const mailAccounts = accounts.map(a => ({
            _id: a._id,
            name: a.name,
            email: a.email,
            color: a.color,
            isDefault: a.isDefault,
            isActive: a.isActive,
            lastSync: a.lastSync,
        }));

        // Determine selected account (from query or default)
        let selectedAccountId = req.query.accountId || null;
        if (!selectedAccountId && accounts.length > 0) {
            const defaultAcc = accounts.find(a => a.isDefault) || accounts[0];
            selectedAccountId = defaultAcc._id.toString();
        }

        // Build query: if we have an account selected, filter by it
        let query = {};
        if (selectedAccountId) {
            query.accountId = selectedAccountId;
        }

        // Fetch mails from DB, sorted by date descending
        const mails = await Mail.find(query).sort({ date: -1 }).lean();

        // If no synced mails and no accounts, show demo data
        if (mails.length === 0 && accounts.length === 0) {
            const count = await Mail.countDocuments();
            if (count === 0) {
                console.log('Seeding Mail database with demo data...');
                await Mail.insertMany(mailboxData);
                const seededMails = await Mail.find().sort({ date: -1 }).lean();
                const initialMails = seededMails.map(m => ({
                    ...m,
                    _id: undefined,
                    __v: undefined,
                }));
                return res.render('mailbox/mailbox', {
                    account_number: req.account_number,
                    initialMails,
                    mailAccounts,
                    selectedAccountId: null,
                    title: 'Messagerie',
                    user: req.user,
                    path: req.originalUrl,
                    layout: 'layout-app'
                });
            }
        }

        const initialMails = mails.map(m => ({
            ...m,
            _id: undefined,
            __v: undefined,
        }));

        res.render('mailbox/mailbox', {
            account_number: req.account_number,
            initialMails,
            mailAccounts,
            selectedAccountId,
            title: 'Messagerie',
            user: req.user,
            path: req.originalUrl,
            layout: 'layout-app'
        });
    } catch (error) {
        console.error('Mailbox Error:', error);
        res.status(500).send('Internal Server Error');
    }
};
