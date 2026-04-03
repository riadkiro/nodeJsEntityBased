const mongoose = require('mongoose');

async function fix() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_7846');
    await new Promise(r => conn.once('open', r));

    const docsColl = conn.db.collection('documents');
    const entitiesColl = conn.db.collection('entities');

    // Get all entities with colors
    const entities = await entitiesColl.find({}).project({ name: 1, icon: 1, slug: 1, color: 1 }).toArray();
    const entityMap = {};
    entities.forEach(e => { entityMap[e._id.toString()] = e; });

    // Find docs with linkedRecords missing color
    const docs = await docsColl.find({
        'linkedRecords.0': { $exists: true }
    }).project({ linkedRecords: 1 }).toArray();

    let updated = 0;
    for (const doc of docs) {
        let changed = false;
        const newLR = doc.linkedRecords.map(lr => {
            if (!lr.entityColor && lr.entityId) {
                const entity = entityMap[lr.entityId.toString()];
                if (entity?.color) {
                    changed = true;
                    return { ...lr, entityColor: entity.color };
                }
            }
            return lr;
        });
        if (changed) {
            await docsColl.updateOne({ _id: doc._id }, { $set: { linkedRecords: newLR } });
            updated++;
        }
    }
    console.log(`Updated ${updated} docs with entity colors`);
    await conn.close();
}
fix().catch(console.error);
