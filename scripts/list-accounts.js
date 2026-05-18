const mongoose = require('mongoose');
async function main() {
    const conn = await mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001').asPromise();
    const Account = conn.model('Account', new mongoose.Schema({}, { strict: false }), 'accounts');
    const accounts = await Account.find({}).select('accountNumber name tenantDbName').lean();
    console.log('Accounts:');
    accounts.forEach(a => console.log(`  #${a.accountNumber} — ${a.name} (${a.tenantDbName || 'no tenant db'})`));
    await conn.close();
}
main().catch(console.error);
