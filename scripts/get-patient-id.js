const mongoose = require('mongoose');

async function check() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));

    // Find patients entity
    const entity = await conn.db.collection('entities').findOne({ slug: 'patients' });
    if (!entity) { console.log('No patients entity'); process.exit(1); }

    // Get first 3 records
    const records = await conn.db.collection('records').find({ entityId: entity._id })
        .project({ title: 1 }).limit(3).toArray();
    console.log('Patient records:');
    records.forEach(r => console.log(`  ${r._id} — ${r.title}`));

    await conn.close();
    process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
