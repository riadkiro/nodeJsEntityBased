const mongoose = require('mongoose');

async function test() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    const Document = mongoose.model('Document', new mongoose.Schema({
        entityId: mongoose.Schema.Types.ObjectId,
        entityIds: [mongoose.Schema.Types.ObjectId]
    }, { strict: false }));
    const Entity = mongoose.model('Entity', new mongoose.Schema({}, { strict: false }));

    const doc = await Document.findOne({ _id: new mongoose.Types.ObjectId('6a0c20f0c89d7ed96ed52e21') }).lean();
    console.log("doc.entityId:", doc.entityId);
    
    const entityIds = [...(doc.entityIds || [])].map(id => id.toString());
    if (doc.entityId && !entityIds.includes(doc.entityId.toString())) {
        entityIds.push(doc.entityId.toString());
    }

    console.log("Mapped entityIds:", entityIds);

    const entities = await Entity.find({ _id: { $in: entityIds } }).lean();
    console.log("Entities found:", entities.length);
    if (entities.length > 0) {
        console.log("Entity name:", entities[0].name);
    }
    
    await mongoose.disconnect();
}
test();
