const mongoose = require('mongoose');

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    console.log('Connected to saas_app_rb_5096');

    const Document = mongoose.connection.db.collection('documents');
    const SmartDocTemplate = mongoose.connection.db.collection('smartdoctemplates');
    const Entity = mongoose.connection.db.collection('entities');

    const template = await Document.findOne({ _id: new mongoose.Types.ObjectId('6a0cc32c8582f628068fa250') });
    console.log('=== Document Template ===');
    console.log('Name:', template.name);
    console.log('EntityId:', template.entityId);
    console.log('EntityIds:', template.entityIds);

    const smartDoc = await SmartDocTemplate.findOne({ documentId: template._id });
    if (smartDoc) {
        console.log('=== SmartDoc Template ===');
        console.log('Name:', smartDoc.name);
        console.log('EntityId:', smartDoc.entityId);
    }

    const entities = await Entity.find({}).toArray();
    console.log('=== All Entities ===');
    for (const ent of entities) {
        console.log(`- ${ent.name} (${ent.slug}): ${ent._id}`);
        if (ent.relations) {
            console.log('  Relations:');
            for (const rel of ent.relations) {
                console.log(`    * ${rel.key}: ${rel.label} (${rel.cardinality}) -> ${rel.targetEntity}`);
            }
        }
    }

    await mongoose.disconnect();
}

run().catch(console.error);
