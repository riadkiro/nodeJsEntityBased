const mongoose = require('mongoose');

async function checkUsers() {
    const conn = await mongoose.createConnection('mongodb://127.0.0.1:27017/saasDemo');
    await new Promise(r => conn.once('open', r));
    
    const users = await conn.db.collection('users').find({}).toArray();
    console.log('=== Users in saasDemo (' + users.length + ') ===');
    users.forEach(u => {
        console.log('\n--- User:', u._id.toString(), '---');
        console.log('  name:', u.name);
        console.log('  email:', u.email);
        if (u.accounts) {
            console.log('  accounts:', JSON.stringify(u.accounts));
        }
        // Check all top-level keys for account references
        const keys = Object.keys(u);
        const accountKeys = keys.filter(k => k.toLowerCase().includes('account') || k.toLowerCase().includes('tenant'));
        if (accountKeys.length > 0) {
            accountKeys.forEach(k => console.log('  [' + k + ']:', JSON.stringify(u[k])));
        }
    });
    
    await conn.close();
    process.exit(0);
}

checkUsers().catch(e => { console.error(e); process.exit(1); });
