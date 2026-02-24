const mongoose = require('mongoose');
const path = require('path');
const config = require(path.join(__dirname, '..', 'config', 'db'));

async function setSource() {
    await mongoose.connect(config.globalDbUri);
    const cn = mongoose.createConnection(config.uri + 'saas_app_rb_5001');
    await new Promise(r => cn.once('open', r));

    const col = cn.db.collection('lineschemas');

    // Set sourceEntityId for prescription_v1 = Traitements entity
    const r1 = await col.updateOne(
        { slug: 'prescription_v1' },
        { $set: { sourceEntityId: new mongoose.Types.ObjectId('698abc0e9c0808e18cbde9aa') } }
    );
    console.log('prescription_v1 sourceEntityId set:', JSON.stringify(r1));

    // Verify
    const all = await col.find({}).toArray();
    for (const s of all) {
        console.log(s.slug, '-> sourceEntityId:', s.sourceEntityId || 'null', ', entityIds:', s.appliesTo?.entityIds);
    }

    await cn.close();
    await mongoose.connection.close();
    process.exit(0);
}

setSource().catch(e => { console.error(e); process.exit(1); });
