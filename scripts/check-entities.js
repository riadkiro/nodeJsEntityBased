const mongoose = require('mongoose');

async function check() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));

    // List all entities
    const entities = await conn.db.collection('entities').find({}).project({ name: 1, slug: 1, icon: 1 }).toArray();
    console.log('=== ALL ENTITIES ===');
    entities.forEach(e => console.log(`  ${e.slug} — ${e.name} [${e._id}]`));

    // Check if patients entity exists (for testing)
    const patients = await conn.db.collection('entities').findOne({ slug: 'patients' });
    if (patients) {
        console.log('\n=== PATIENTS ENTITY ===');
        console.log('  relations:', JSON.stringify((patients.relations || []).map(r => ({ key: r.key, label: r.label, target: r.targetEntity })), null, 2));
    }

    await conn.close();
    process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
