const mongoose = require('mongoose');
const dbConfig = require('../config/db');

async function main() {
    await mongoose.connect(dbConfig.globalDbUri);
    const Account = require('../models/account.model');
    const User = require('../models/user.model');

    // Fix account #5001 - remove the broken user entry (no email, no userId)
    const acc5001 = await Account.findOne({ account_number: '5001' });
    if (acc5001) {
        // Remove broken entries (no email or no userId)
        const cleanUsers = acc5001.users.filter(u => u.email && u.userId);
        
        // Make sure boukirou6 is in the list as owner
        const owner = await User.findOne({ email: 'boukirou6@hotmail.com' });
        const hasOwner = cleanUsers.some(u => u.email === 'boukirou6@hotmail.com');
        if (!hasOwner && owner) {
            cleanUsers.unshift({
                userId: owner._id.toString(),
                email: 'boukirou6@hotmail.com',
                role: 'owner',
                status: 'active',
                joinedAt: acc5001.created_on || new Date(),
            });
        } else {
            // Ensure owner role
            const ownerEntry = cleanUsers.find(u => u.email === 'boukirou6@hotmail.com');
            if (ownerEntry) ownerEntry.role = 'owner';
        }

        acc5001.users = cleanUsers;
        acc5001.name = 'Demo Test'; // Fix the name
        await acc5001.save();
        console.log('Fixed account #5001:', cleanUsers.map(u => `${u.email} (${u.role})`));
    }

    // Also rename account #5001 in all users' accounts arrays
    await User.updateMany(
        { 'accounts.account_number': '5001' },
        { $set: { 'accounts.$.name': 'Demo Test' } }
    );
    console.log('Updated account name in all users');

    await mongoose.disconnect();
    console.log('Done!');
}
main().catch(e => { console.error(e); process.exit(1); });
