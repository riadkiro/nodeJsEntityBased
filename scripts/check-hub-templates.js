const mongoose = require('mongoose');

async function test() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5096'); // The user is on account 5096
    const Document = mongoose.model('Document', new mongoose.Schema({}, { strict: false }));
    const SmartDocTemplate = mongoose.model('SmartDocTemplate', new mongoose.Schema({}, { strict: false }));

    const docs = await Document.find({ isTemplate: true }).lean();
    console.log("Documents Hub templates (isTemplate: true):", docs.length);
    docs.forEach(d => console.log(` - ID: ${d._id} | Name: ${d.name} | entityId: ${d.entityId} | entityIds: ${d.entityIds?.length} | folderId: ${d.folderId}`));

    const smartdocs = await SmartDocTemplate.find({}).lean();
    console.log("\nSmartDoc templates:");
    smartdocs.forEach(s => console.log(` - ID: ${s._id} | Name: ${s.name} | scopeType: ${s.scopeType} | recordId: ${s.scopeRecordId} | docId: ${s.documentId}`));

    await mongoose.disconnect();
}
test();
