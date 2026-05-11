const mongoose = require('mongoose');
const dbConfig = require('../config/db');

async function fix() {
    await mongoose.connect(dbConfig.globalDbUri);
    console.log('[Fix] Connected to', dbConfig.globalDbUri);

    const Account = require('../models/account.model');

    // Fix ALL accounts with 'viewer' role
    const accounts = await Account.find({ 'users.role': 'viewer' });
    console.log(`Found ${accounts.length} account(s) with 'viewer' role`);

    for (const account of accounts) {
        let changed = false;
        for (const user of account.users) {
            if (user.role === 'viewer') {
                console.log(`  Account ${account.account_number}: User ${user.email || user.userId} role 'viewer' → 'guest'`);
                user.role = 'guest';
                changed = true;
            }
        }
        if (changed) {
            await account.save();
            console.log(`  → Saved account ${account.account_number}`);
        }
    }

    console.log('\n✅ Fix complete');
    await mongoose.disconnect();
}

fix().catch(e => { console.error(e); process.exit(1); });
