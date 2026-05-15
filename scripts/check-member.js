// Fix: Add Actirama to Saad's user.accounts array
require('dotenv').config();
const mongoose = require('mongoose');
const dbConfig = require('../config/db');

async function fix() {
    await mongoose.connect(dbConfig.globalDbUri);
    const db = mongoose.connection.db;

    // 1) Verify account 9194 has Saad in users
    const account = await db.collection('accounts').findOne({ account_number: '9194' });
    const saadInUsers = account.users?.find(u => u.email === 'contact@belgawebsite.be');
    console.log('Account 9194 users has Saad:', saadInUsers ? `YES (role: ${saadInUsers.role})` : 'NO');

    // 2) Check Saad's user.accounts
    const user = await db.collection('users').findOne({ email: 'contact@belgawebsite.be' });
    const hasActirama = user.accounts?.find(a => a.account_number === '9194');
    console.log('Saad user.accounts has Actirama:', hasActirama ? 'YES' : 'NO');

    if (!hasActirama) {
        // Fix: add Actirama to Saad's accounts
        const result = await db.collection('users').updateOne(
            { email: 'contact@belgawebsite.be' },
            { $push: { accounts: {
                account_number: '9194',
                name: account.name,
                icon: account.icon || 'solar:home-2-bold-duotone',
                role: saadInUsers?.role || 'guest',
                joinedAt: new Date(),
            }}}
        );
        console.log('\n✅ Fixed! Added Actirama to Saad accounts:', result.modifiedCount);
    }

    // Verify
    const userAfter = await db.collection('users').findOne({ email: 'contact@belgawebsite.be' });
    console.log('\nSaad accounts after fix:');
    userAfter.accounts?.forEach(a => console.log(`  ${a.account_number} - ${a.name} (${a.role})`));

    await mongoose.disconnect();
}

fix().catch(e => { console.error(e); process.exit(1); });
