const mongoose = require('mongoose');
const path = require('path');
const config = require(path.join(__dirname, '..', 'config', 'db'));

async function migrate() {
    await mongoose.connect(config.globalDbUri);
    const cn = mongoose.createConnection(config.uri + 'saas_app_rb_5001');
    await new Promise(r => cn.once('open', r));

    const col = cn.db.collection('lineschemas');

    // Migrate prescription_v1: old entityId -> entityIds array  
    const r1 = await col.updateOne(
        { slug: 'prescription_v1' },
        {
            $set: { 'appliesTo.entityIds': ['699857ef027e29bba9654b44'] },
            $unset: { 'appliesTo.entityId': 1 }
        }
    );
    console.log('prescription_v1:', JSON.stringify(r1));

    // Migrate invoice_v1: no entity (global) -> empty entityIds
    const r2 = await col.updateOne(
        { slug: 'invoice_v1' },
        {
            $set: { 'appliesTo.entityIds': [] },
            $unset: { 'appliesTo.entityId': 1 }
        }
    );
    console.log('invoice_v1:', JSON.stringify(r2));

    // Verify
    const all = await col.find({}).toArray();
    for (const s of all) {
        console.log(s.slug, '-> entityIds:', s.appliesTo?.entityIds, ', entityId:', s.appliesTo?.entityId || 'REMOVED');
    }

    await cn.close();
    await mongoose.connection.close();
    process.exit(0);
}

migrate().catch(e => { console.error(e); process.exit(1); });
