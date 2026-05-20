const mongoose = require('mongoose');

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    const Document = mongoose.model('Document', new mongoose.Schema({}, { strict: false }));
    const Entity = mongoose.model('Entity', new mongoose.Schema({}, { strict: false }));
    const SmartDocTemplate = mongoose.model('SmartDocTemplate', new mongoose.Schema({}, { strict: false }));
    
    const doc = await Document.findById('6a0cc32c8582f628068fa250').lean();
    const smartDocTemplate = await SmartDocTemplate.findOne({ documentId: doc._id.toString(), active: true }).lean();
    
    const allEntityIds = new Set();
    (doc.entityIds || []).forEach(id => allEntityIds.add(id.toString()));
    if (doc.entityId) allEntityIds.add(doc.entityId.toString());
    (doc.linkedRecords || []).forEach(lr => {
        if (lr.entityId) allEntityIds.add(lr.entityId.toString());
    });

    let entities = [];
    if (allEntityIds.size > 0) {
        const rawEntities = await Entity.find({ _id: { $in: [...allEntityIds] } })
            .populate({
                path: 'relations.targetEntity',
                select: 'name icon slug color'
            })
            .lean();

        const primaryEntityIdStr = smartDocTemplate.entityId ? smartDocTemplate.entityId.toString() : '';
        entities = rawEntities.sort((a, b) => {
            if (a._id.toString() === primaryEntityIdStr) return -1;
            if (b._id.toString() === primaryEntityIdStr) return 1;
            return 0;
        });
    }
    
    console.log('=== POPULATED ENTITIES ===');
    console.log('entities count:', entities.length);
    entities.forEach((e, idx) => {
        console.log(`\nEntity ${idx + 1}: ${e.name} (${e.slug})`);
        console.log('  relations count:', e.relations?.length || 0);
        (e.relations || []).forEach(r => {
            console.log(`    - key: ${r.key}, cardinality: ${r.cardinality}, target:`, r.targetEntity?.name);
        });
    });
    
    await mongoose.connection.close();
}

run().catch(console.error);
