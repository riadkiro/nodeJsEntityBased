const mongoose = require('mongoose');

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    const Record = mongoose.model('Record', new mongoose.Schema({}, { strict: false }));
    const Entity = mongoose.model('Entity', new mongoose.Schema({}, { strict: false }));

    const recs = await Record.find({ title: /TechCorp/i }).lean();
    console.log('=== ALL RECORDS WITH TechCorp IN TITLE ===');
    for (const r of recs) {
        const ent = await Entity.findById(r.entityId).lean();
        console.log(`ID: ${r._id}, Title: ${r.title}, entityId: ${r.entityId}, Entity Name: ${ent ? ent.name : 'null'} (${ent ? ent.slug : 'null'})`);
    }

    await mongoose.connection.close();
}

run().catch(console.error);
