const mongoose = require('mongoose');

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    const SmartDocTemplate = mongoose.model('SmartDocTemplate', new mongoose.Schema({}, { strict: false }));
    const Entity = mongoose.model('Entity', new mongoose.Schema({}, { strict: false }));

    const all = await SmartDocTemplate.find({}).lean();
    const sdts = all.filter(sdt => sdt.documentId && sdt.documentId.toString() === '6a0cc32c8582f628068fa250');

    console.log('=== ALL SMARTDOC TEMPLATES FOR THE DOCUMENT ===');
    for (const sdt of sdts) {
        const ent = await Entity.findById(sdt.entityId).lean();
        console.log(`SDT ID: ${sdt._id}, Name: ${sdt.name}, Entity ID: ${sdt.entityId}, Entity Name: ${ent ? ent.name : 'null'} (${ent ? ent.slug : 'null'})`);
    }

    await mongoose.connection.close();
}

run().catch(console.error);
