const mongoose = require('mongoose');
const dbConfig = require('../config/db');

async function main() {
    await mongoose.connect(dbConfig.globalDbUri);
    
    const Account = require('../models/account.model');
    const User = require('../models/user.model');
    
    const accounts = await Account.find({}).lean();
    console.log('\n=== ACCOUNTS ===');
    accounts.forEach(a => {
        console.log(`  #${a.account_number} | ${a.name} | owner: ${a.ownerId} | users: ${a.users?.length || 0}`);
        if (a.users) a.users.forEach(u => console.log(`    - ${u.email} (${u.role}) [${u.status}]`));
        if (a.invitations?.length) {
            console.log('    Invitations:');
            a.invitations.forEach(i => console.log(`    * ${i.email} (${i.role}) [${i.status}]`));
        }
    });
    
    const users = await User.find({}).lean();
    console.log('\n=== USERS ===');
    users.forEach(u => {
        console.log(`  ${u.email} | ${u.name} | accounts: ${u.accounts?.length || 0}`);
        if (u.accounts) u.accounts.forEach(a => console.log(`    - #${a.account_number} ${a.name} (${a.role})`));
    });
    
    await mongoose.disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
