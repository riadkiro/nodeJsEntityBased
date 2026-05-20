const mongoose = require('mongoose');

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    const SmartDocTemplate = mongoose.model('SmartDocTemplate', new mongoose.Schema({}, { strict: false }));
    const Entity = mongoose.model('Entity', new mongoose.Schema({}, { strict: false }));

    const sdt = await SmartDocTemplate.findById('6a0cc7ff8582f628068fbe25').lean();
    console.log('=== SMARTDOC TEMPLATE ===');
    console.log(JSON.stringify(sdt, null, 2));

    if (sdt) {
        const ent = await Entity.findById(sdt.entityId).lean();
        console.log('\n=== PRIMARY ENTITY OF TEMPLATE ===');
        console.log('ID:', ent._id);
        console.log('Name:', ent.name);
        console.log('Slug:', ent.slug);
    }

    await mongoose.connection.close();
}

run().catch(console.error);
