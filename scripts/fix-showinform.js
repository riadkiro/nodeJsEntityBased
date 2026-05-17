const mongoose = require('mongoose');

async function run() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    await new Promise(r => conn.once('open', r));

    const Entity = conn.model('Entity', new mongoose.Schema({}, { strict: false }), 'entities');

    // Update all relations in all entities to set showInForm: true
    const entities = await Entity.find({ 'relations.0': { $exists: true } }).lean();
    let updated = 0;

    for (const entity of entities) {
        let modified = false;
        const relations = entity.relations || [];
        for (const rel of relations) {
            if (rel.showInForm === false || rel.showInForm === undefined) {
                rel.showInForm = true;
                modified = true;
            }
        }
        if (modified) {
            await Entity.updateOne({ _id: entity._id }, { $set: { relations } });
            updated++;
            console.log(`  ✅ Updated ${entity.name} (${relations.length} relations)`);
        }
    }

    console.log(`\nDone: ${updated} entities updated.`);
    await conn.close();
}

run().catch(err => { console.error(err); process.exit(1); });
