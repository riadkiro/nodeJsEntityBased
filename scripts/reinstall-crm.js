/**
 * Create a fresh account and install CRM preset
 */
const mongoose = require('mongoose');
const crypto = require('crypto');

async function main() {
    // 1. Find the user in global DB
    const globalConn = await mongoose.createConnection('mongodb://127.0.0.1:27017/saasDemo').asPromise();
    const User = globalConn.model('User', new mongoose.Schema({}, { strict: false }), 'users');
    const user = await User.findOne({ email: 'boukirou6@hotmail.com' }).lean();
    if (!user) { console.error('User not found!'); process.exit(1); }
    console.log(`Found user: ${user.email} (${user._id})`);

    // 2. Create account in saas_app_rb_5001
    const centralConn = await mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001').asPromise();
    const Account = centralConn.model('Account', new mongoose.Schema({}, { strict: false }), 'accounts');
    
    const accountNumber = 5096;
    const tenantDbName = `saas_app_rb_${accountNumber}`;
    
    let account = await Account.findOne({ accountNumber }).lean();
    if (!account) {
        account = await Account.create({
            accountNumber,
            name: 'CRM Demo',
            tenantDbName,
            owner: user._id,
            members: [{ userId: user._id, role: 'admin' }],
            plan: 'premium',
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log(`Created account #${accountNumber}`);
    } else {
        console.log(`Account #${accountNumber} already exists`);
    }

    await centralConn.close();
    await globalConn.close();

    // 3. Install CRM preset
    const { installPreset } = require('./seed-app-presets');
    await installPreset({
        tenantDbName,
        presetSlug: 'crm',
        userId: user._id.toString(),
        mode: 'factoryReset'
    });

    console.log('\n✅ CRM preset installed on account #' + accountNumber);
    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
