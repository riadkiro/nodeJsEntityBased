const mongoose = require('mongoose');

async function main() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));
    const db = conn.db;
    
    const field = await db.collection('fieldtemplates').findOne({ name: 'note_medecin' });
    console.log(JSON.stringify(field, null, 2));
    
    await conn.close();
}

main().catch(console.error);
