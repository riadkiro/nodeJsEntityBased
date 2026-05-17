const mongoose = require('mongoose');

async function fix() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saasDemo');
    
    const Account = require('../models/account.model');
    const User = require('../models/user.model');
    
    const account = await Account.findOne({ account_number: '5756' });
    if (!account) { console.log('Account 5756 NOT FOUND'); process.exit(0); }
    
    console.log('=== Account 5756 ===');
    console.log('Name:', account.name);
    console.log('OwnerId:', account.ownerId);
    console.log('Users:');
    (account.users || []).forEach((u, i) => {
        console.log(`  [${i}] userId=${u.userId}, email=${u.email}, role=${u.role}, status=${u.status}`);
    });

    const user = await User.findOne({ email: 'boukirou6@hotmail.com' });
    console.log('\nUser ID:', user._id.toString());

    // Fix: set the user as owner in account.users
    const entry = account.users.find(u => String(u.userId) === String(user._id));
    if (entry) {
        console.log('\nFound user entry, current role:', entry.role, '-> setting to owner');
        entry.role = 'owner';
        entry.status = 'active';
    } else {
        console.log('\nUser NOT in account.users, adding as owner');
        account.users.push({
            userId: user._id.toString(),
            email: user.email,
            role: 'owner',
            status: 'active',
            joinedAt: new Date()
        });
    }
    
    // Also set ownerId
    account.ownerId = user._id;
    await account.save();
    
    console.log('\n=== Fixed! Verifying... ===');
    const updated = await Account.findOne({ account_number: '5756' });
    console.log('OwnerId:', updated.ownerId);
    (updated.users || []).forEach((u, i) => {
        console.log(`  [${i}] userId=${u.userId}, role=${u.role}, status=${u.status}`);
    });

    await mongoose.disconnect();
}

fix().catch(err => { console.error(err); process.exit(1); });
