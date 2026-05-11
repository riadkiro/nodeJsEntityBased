const mongoose = require('mongoose');

async function check() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saasDemo?directConnection=true');
    await new Promise(r => conn.once('open', r));
    
    // List all accounts
    const accounts = await conn.db.collection('accounts').find({}, { projection: { account_number: 1, name: 1 } }).toArray();
    console.log('All accounts:');
    for (const a of accounts) {
        console.log(`  ${a.account_number} (${typeof a.account_number}) - ${a.name}`);
    }
    
    // Try to find 9194 with string
    const acc = await conn.db.collection('accounts').findOne({ account_number: "9194" });
    if (acc) {
        console.log('\nFound account 9194 (as string):');
        console.log('Users:');
        for (const u of acc.users || []) {
            console.log(`  userId=${u.userId}, email=${u.email}, role=${u.role}, status='${u.status}'`);
        }
    }
    
    await conn.close();
}

check().catch(e => { console.error(e); process.exit(1); });
