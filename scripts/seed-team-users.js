/**
 * Seed Team Users — Create real users and attach them to accounts
 * 
 * Creates users with @actirama.com and @belgawebsite.be emails
 * and properly links them to existing accounts with roles.
 */
const mongoose = require('mongoose');
const dbConfig = require('../config/db');

const USERS_TO_CREATE = [
    {
        email: 'sophie.martin@actirama.com',
        name: 'Sophie Martin',
        password: 'test',
        accountLinks: [
            { account_number: '9194', role: 'admin' },   // Actirama
            { account_number: '5001', role: 'admin' },    // Demo Test
        ]
    },
    {
        email: 'marc.dubois@actirama.com',
        name: 'Marc Dubois',
        password: 'test',
        accountLinks: [
            { account_number: '9194', role: 'manager' },  // Actirama
            { account_number: '5001', role: 'manager' },   // Demo Test
        ]
    },
    {
        email: 'julie.moreau@actirama.com',
        name: 'Julie Moreau',
        password: 'test',
        accountLinks: [
            { account_number: '9194', role: 'member' },   // Actirama
        ]
    },
    {
        email: 'thomas.petit@belgawebsite.be',
        name: 'Thomas Petit',
        password: 'test',
        accountLinks: [
            { account_number: '7001', role: 'admin' },    // Belgawebsite
            { account_number: '5001', role: 'admin' },    // Demo Test
        ]
    },
    {
        email: 'claire.bernard@belgawebsite.be',
        name: 'Claire Bernard',
        password: 'test',
        accountLinks: [
            { account_number: '7001', role: 'member' },   // Belgawebsite
        ]
    },
    {
        email: 'lucas.roux@belgawebsite.be',
        name: 'Lucas Roux',
        password: 'test',
        accountLinks: [
            { account_number: '7001', role: 'member' },   // Belgawebsite
            { account_number: '5001', role: 'member' },   // Demo Test
        ]
    },
];

async function main() {
    await mongoose.connect(dbConfig.globalDbUri);
    console.log('[Seed] Connected to', dbConfig.globalDbUri);

    const User = require('../models/user.model');
    const Account = require('../models/account.model');

    // Cache accounts by number
    const accountsMap = {};
    const allAccounts = await Account.find({}).lean();
    allAccounts.forEach(a => { accountsMap[a.account_number] = a; });

    for (const userData of USERS_TO_CREATE) {
        console.log(`\n[Seed] Processing ${userData.email}...`);

        // Check if user already exists
        let user = await User.findOne({ email: userData.email });
        if (user) {
            console.log(`  User already exists (${user._id}), updating...`);
        } else {
            user = new User({
                email: userData.email,
                name: userData.name,
                password: userData.password,
                authProvider: 'local',
                status: 'active',
                role: 'user',
                membership: {
                    plan: 'premium',
                    startDate: new Date(),
                    maxAccounts: 10,
                    maxUsersPerAccount: 50,
                    storageLimit: 50000,
                },
                lastLogin: new Date(),
                loginCount: 0,
                accounts: [],
            });
            await user.save();
            console.log(`  Created user ${user._id}`);
        }

        // Link to accounts
        for (const link of userData.accountLinks) {
            const account = await Account.findOne({ account_number: link.account_number });
            if (!account) {
                console.log(`  ⚠ Account #${link.account_number} not found, skipping`);
                continue;
            }

            // Add user to Account.users if not already there
            const alreadyInAccount = account.users?.some(u => u.email === userData.email);
            if (!alreadyInAccount) {
                await Account.updateOne(
                    { account_number: link.account_number },
                    {
                        $push: {
                            users: {
                                userId: user._id.toString(),
                                email: userData.email,
                                role: link.role,
                                status: 'active',
                                joinedAt: new Date(),
                            }
                        }
                    }
                );
                console.log(`  ✓ Added to Account #${link.account_number} (${account.name}) as ${link.role}`);
            } else {
                console.log(`  Already in Account #${link.account_number}`);
            }

            // Add account to User.accounts if not already there
            const alreadyInUser = user.accounts?.some(a => a.account_number === link.account_number);
            if (!alreadyInUser) {
                await User.updateOne(
                    { _id: user._id },
                    {
                        $push: {
                            accounts: {
                                account_number: link.account_number,
                                name: account.name,
                                icon: account.icon || 'solar:settings-bold-duotone',
                                role: link.role,
                                joinedAt: new Date(),
                            }
                        }
                    }
                );
                console.log(`  ✓ Linked account #${link.account_number} to user`);
            }
        }
    }

    // Also fix existing users (sarah, karim) to have proper roles
    const fixUsers = [
        { email: 'sarah.test@demo.com', account_number: '5001', role: 'member' },
        { email: 'karim.test@demo.com', account_number: '5001', role: 'viewer' },
    ];
    for (const fix of fixUsers) {
        const account = await Account.findOne({ account_number: fix.account_number });
        if (!account) continue;
        const user = await User.findOne({ email: fix.email });
        if (!user) continue;

        const alreadyInAccount = account.users?.some(u => u.email === fix.email);
        if (!alreadyInAccount) {
            await Account.updateOne(
                { account_number: fix.account_number },
                {
                    $push: {
                        users: {
                            userId: user._id.toString(),
                            email: fix.email,
                            role: fix.role,
                            status: 'active',
                            joinedAt: user.created_on || new Date(),
                        }
                    }
                }
            );
            console.log(`\n[Fix] Added ${fix.email} to Account #${fix.account_number} as ${fix.role}`);
        }
        // Fix user's account role
        await User.updateOne(
            { _id: user._id, 'accounts.account_number': fix.account_number },
            { $set: { 'accounts.$.role': fix.role } }
        );
    }

    // Also fix the owner (boukirou6) role in accounts
    await User.updateOne(
        { email: 'boukirou6@hotmail.com', 'accounts.account_number': '5001' },
        { $set: { 'accounts.$.role': 'owner' } }
    );
    await User.updateOne(
        { email: 'boukirou6@hotmail.com', 'accounts.account_number': '5002' },
        { $set: { 'accounts.$.role': 'owner' } }
    );

    console.log('\n[Seed] ✅ Done! All users created and linked.');
    
    // Final summary
    const finalAccounts = await Account.find({ account_number: { $in: ['5001', '9194', '7001'] } }).lean();
    finalAccounts.forEach(a => {
        console.log(`\n  Account #${a.account_number} (${a.name}) — ${a.users?.length || 0} users:`);
        a.users?.forEach(u => console.log(`    ${u.email} (${u.role})`));
    });

    await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
