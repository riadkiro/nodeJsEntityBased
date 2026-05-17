const mongoose = require('mongoose');

async function run() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    await new Promise(r => conn.once('open', r));

    const Record = conn.model('Record', new mongoose.Schema({}, { strict: false }), 'records');
    const Entity = conn.model('Entity', new mongoose.Schema({}, { strict: false }), 'entities');

    // Find Sophie Martin
    const sophie = await Record.findOne({ title: /Sophie Martin/i }).lean();
    if (!sophie) {
        console.log('Sophie Martin not found');
        process.exit(1);
    }

    console.log('=== Sophie Martin Record ===');
    console.log('_id:', sophie._id.toString());
    console.log('entityId:', sophie.entityId?.toString());
    console.log('relations:', JSON.stringify(sophie.relations, null, 2));
    console.log('customFields:', JSON.stringify(sophie.customFields, null, 2));

    // Find the Contact entity
    const contactEntity = await Entity.findById(sophie.entityId).lean();
    console.log('\n=== Contact Entity ===');
    console.log('name:', contactEntity?.name);
    console.log('relations:', JSON.stringify(contactEntity?.relations, null, 2));

    // Find TechCorp France
    const techcorp = await Record.findOne({ title: /TechCorp France/i }).lean();
    if (techcorp) {
        console.log('\n=== TechCorp France ===');
        console.log('_id:', techcorp._id.toString());
        console.log('entityId:', techcorp.entityId?.toString());
    }

    await conn.close();
}

run().catch(err => { console.error(err); process.exit(1); });
