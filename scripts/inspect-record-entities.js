const mongoose = require('mongoose');

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    const Record = mongoose.model('Record', new mongoose.Schema({}, { strict: false }));
    const Entity = mongoose.model('Entity', new mongoose.Schema({}, { strict: false }));

    // 1. Inspect record 6a0b4221f1c5ddd28f737c9b (Déploiement ERP TechCorp)
    const rec1 = await Record.findById('6a0b4221f1c5ddd28f737c9b').lean();
    console.log('=== RECORD 6a0b4221f1c5ddd28f737c9b ===');
    console.log(JSON.stringify(rec1, null, 2));

    if (rec1) {
        const ent = await Entity.findById(rec1.entityId).lean();
        console.log('\n=== ENTITY OF RECORD 1 ===');
        console.log(JSON.stringify(ent, null, 2));
    }

    // 2. Inspect record 6a0b4221f1c5ddd28f737c95 (Sophie Martin)
    const rec2 = await Record.findById('6a0b4221f1c5ddd28f737c95').lean();
    console.log('\n=== RECORD 6a0b4221f1c5ddd28f737c95 ===');
    console.log(JSON.stringify(rec2, null, 2));

    // 3. Inspect record 6a0b4221f1c5ddd28f737c99 (TechCorp France)
    const rec3 = await Record.findById('6a0b4221f1c5ddd28f737c99').lean();
    console.log('\n=== RECORD 6a0b4221f1c5ddd28f737c99 ===');
    console.log(JSON.stringify(rec3, null, 2));

    // Let's print all entities in the database to be absolutely sure of their IDs and slugs
    const allEntities = await Entity.find({}).lean();
    console.log('\n=== ALL ENTITIES ===');
    allEntities.forEach(e => {
        console.log(`- ID: ${e._id.toString()}, Name: ${e.name}, Slug: ${e.slug}`);
    });

    await mongoose.connection.close();
}

run().catch(console.error);
