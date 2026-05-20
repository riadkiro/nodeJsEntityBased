const mongoose = require('mongoose');

async function main() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    await new Promise(r => conn.once('open', r));

    console.log("Connected to saas_app_rb_5096");

    // Fetch entity 'entreprises'
    const entity = await conn.db.collection('entities').findOne({ slug: 'entreprises' });
    console.log("=== Entity Definition ===");
    console.log(JSON.stringify(entity, null, 2));

    // Fetch record 6a0b4221f1c5ddd28f737c99
    const record = await conn.db.collection('records').findOne({ _id: new mongoose.Types.ObjectId('6a0b4221f1c5ddd28f737c99') });
    console.log("\n=== Record Definition ===");
    console.log(JSON.stringify(record, null, 2));

    await conn.close();
}

main().catch(console.error);
