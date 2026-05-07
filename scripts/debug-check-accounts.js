const mongoose = require('mongoose');
async function check() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saasDemo');
    await new Promise(r => conn.once('open', r));
    const accounts = await conn.db.collection('accounts').find({}).limit(3).toArray();
    console.log('Sample accounts:', JSON.stringify(accounts.map(a => ({ _id: a._id, account_id: a.account_id, name: a.name })), null, 2));
    
    // Also check if there are other collection names
    const collections = await conn.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    await conn.close();
    process.exit(0);
}
check();
