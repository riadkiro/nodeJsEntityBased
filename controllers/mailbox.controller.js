const Mail = require('../models/mail.model');
const { mailboxData } = require('./mailbox.data');
const imaps = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;
const mailConfig = require('../config/mail.config');

exports.sync = async (req, res) => {
    try {
        const account_number = req.account_number || req.params.account_number || req.params.id;

        // Use configuration from config/mail.config.js
        const config = mailConfig;

        if (!config.imap.user || !config.imap.password || config.imap.user.includes('your-email')) {
            console.warn("IMAP credentials not found or default in mail.config.js. Please set IMAP_USER and IMAP_PASSWORD in .env");
            return res.redirect(`/account/${account_number}/mailbox/inbox?error=missing_credentials`);
        }

        const connection = await imaps.connect(config);
        await connection.openBox('INBOX');

        const searchCriteria = ['ALL'];
        const fetchOptions = {
            bodies: ['HEADER', 'TEXT', ''],
            markSeen: false,
            struct: true
        };

        // Fetch last 50 messages
        // To keep it simple and compliant with the prompt "quick imap grab", we will use a date filter for last 30 days.
        const delay = 300 * 24 * 3600 * 1000;
        const since = new Date(Date.now() - delay);
        const searchCriteriaFiltered = [['SINCE', since]];

        const results = await connection.search(searchCriteriaFiltered, fetchOptions);

        // Take the last 50 from results (results might not be ordered, but usually are)
        const recentMessages = results.slice(-50);

        for (let item of recentMessages) {
            const all = item.parts.find(part => part.which === '');
            const id = item.attributes.uid;
            // We need full body to parse
            let simpleMail;
            if (all && all.body) {
                simpleMail = await simpleParser(all.body);
            } else {
                // Fallback if full body fetch fails (sometimes requires specific fetch options)
                // With fetchOptions bodies: [''], we normally get the full raw message in one part
                // Let's assume we got it.
                const raw = item.parts.find(p => p.which === '');
                if (raw) simpleMail = await simpleParser(raw.body);
            }

            if (simpleMail) {
                // Upsert to DB
                // Check if exists
                const existing = await Mail.findOne({ id: id }); // Using UID as ID conceptually
                if (!existing) {
                    await Mail.create({
                        id: id,
                        email: simpleMail.from.text, // or value[0].address
                        firstName: simpleMail.from.value[0]?.name?.split(' ')[0] || '',
                        lastName: simpleMail.from.value[0]?.name?.split(' ').slice(1).join(' ') || '',
                        title: simpleMail.subject,
                        date: simpleMail.date,
                        time: simpleMail.date ? new Date(simpleMail.date).toLocaleTimeString() : '',
                        description: simpleMail.html || simpleMail.textAsHtml || simpleMail.text,
                        displayDescription: simpleMail.text ? simpleMail.text.substring(0, 100) : '',
                        type: 'inbox',
                        isUnread: true, // simplified
                        // ... mapping other fields
                    });
                }
            }
        }

        connection.end();
        res.redirect(`/account/${account_number}/mailbox/inbox?message=Synced`);
    } catch (e) {
        console.error("Sync Error", e);
        // Fallback redirect if something fails, try to grab account number from params if possible, else fail gracefully
        const accNo = req.account_number || req.params.account_number || req.params.id || 1;
        res.redirect(`/account/${accNo}/mailbox/inbox?error=SyncFailed`);
    }
};

exports.index = async (req, res) => {
    try {

        // --- Temporary Seeding Logic ---
        // Check if we have any mails in DB, if not, seed them from mailbox.data.js
        const count = await Mail.countDocuments();
        if (count === 0) {
            console.log('Seeding Mail database...');
            await Mail.insertMany(mailboxData);
        }
        // -------------------------------

        // Fetch mails from DB, sorted by date descending (newest first)
        const mails = await Mail.find().sort({ date: -1 }).lean();

        // Used by the view
        const initialMails = mails.map(m => ({
            ...m,
            // Ensure ID is passed as expected by Alpine (though mongo uses _id, the template uses .id)
            // If we want to strictly use _id, we'd need to update the frontend. 
            // The schema has an 'id' field for now which matches the seed data.
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
