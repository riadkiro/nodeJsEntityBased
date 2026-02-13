const tenantCollection = require("../middleware/tenant").tenantCollection;
const { mailboxData } = require('./mailbox.data');
const imaps = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;
const mailConfig = require('../config/mail.config');

exports.sync = async (req, res) => {
    try {
        const account_number = req.account_number || req.params.account_number || req.params.id;
        const Mail = await tenantCollection(req, "Mail");

        // Use configuration from config/mail.config.js
        const config = mailConfig;

        if (!config.imap.user || !config.imap.password || config.imap.user.includes('your-email')) {
            console.warn("IMAP credentials not found or default in mail.config.js. Please set IMAP_USER and IMAP_PASSWORD in .env");
            return res.redirect(`/account/${account_number}/mailbox/inbox?error=missing_credentials`);
        }

        const connection = await imaps.connect(config);
        await connection.openBox('INBOX');

        const delay = 300 * 24 * 3600 * 1000;
        const since = new Date(Date.now() - delay);
        const searchCriteriaFiltered = [['SINCE', since]];
        const fetchOptions = {
            bodies: ['HEADER', 'TEXT', ''],
            markSeen: false,
            struct: true
        };

        const results = await connection.search(searchCriteriaFiltered, fetchOptions);
        const recentMessages = results.slice(-50);

        for (let item of recentMessages) {
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
                const existing = await Mail.findOne({ id: id });
                if (!existing) {
                    await Mail.create({
                        id: id,
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
                }
            }
        }

        connection.end();
        res.redirect(`/account/${account_number}/mailbox/inbox?message=Synced`);
    } catch (e) {
        console.error("Sync Error", e);
        const accNo = req.account_number || req.params.account_number || req.params.id || 1;
        res.redirect(`/account/${accNo}/mailbox/inbox?error=SyncFailed`);
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

exports.index = async (req, res) => {
    try {
        const Mail = await tenantCollection(req, "Mail");

        // Seed if empty
        const count = await Mail.countDocuments();
        if (count === 0) {
            console.log('Seeding Mail database...');
            await Mail.insertMany(mailboxData);
        }

        // Fetch mails from DB, sorted by date descending
        const mails = await Mail.find().sort({ date: -1 }).lean();

        const initialMails = mails.map(m => ({
            ...m,
            _id: undefined,
            __v: undefined,
        }));

        res.render('mailbox/mailbox', {
            account_number: req.account_number,
            initialMails,
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
