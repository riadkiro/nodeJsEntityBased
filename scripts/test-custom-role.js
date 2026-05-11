const mongoose = require('mongoose');

async function test() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saasDemo?directConnection=true');
    console.log('Connected');

    const Account = require('../models/account.model');
    const account = await Account.findOne({ account_number: 9194 });
    if (!account) {
        console.log('Account 9194 not found');
        process.exit(1);
    }

    console.log('Account found:', account.name);
    console.log('customRoles count:', (account.customRoles || []).length);

    // Try to add a custom role
    if (!account.customRoles) account.customRoles = [];

    const { PERMISSIONS, ROLE_HIERARCHY } = require('../middleware/permissions');
    
    const permissions = new Map();
    for (const perm of Object.keys(PERMISSIONS)) {
        permissions.set(perm, PERMISSIONS[perm].includes('manager'));
    }

    account.customRoles.push({
        slug: 'chef-de-projet',
        name: 'Chef de projet',
        description: 'Responsable de projets',
        color: '#8b5cf6',
        icon: 'solar:shield-bold-duotone',
        isCustom: true,
        baseRole: 'manager',
        level: 60,
        permissions,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    try {
        await account.save();
        console.log('SUCCESS: Custom role created');
        console.log('customRoles count after:', account.customRoles.length);
    } catch (err) {
        console.error('SAVE ERROR:', err.message);
        if (err.errors) {
            for (const [key, val] of Object.entries(err.errors)) {
                console.error(`  ${key}: ${val.message}`);
            }
        }
    }

    // Clean up - remove the test role
    account.customRoles = account.customRoles.filter(r => r.slug !== 'chef-de-projet');
    await account.save();
    console.log('Cleaned up');

    await mongoose.disconnect();
}

test().catch(e => { console.error('Fatal:', e); process.exit(1); });
