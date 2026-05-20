const mongoose = require('mongoose');

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    const Document = mongoose.model('Document', new mongoose.Schema({}, { strict: false }));
    const SmartDocTemplate = mongoose.model('SmartDocTemplate', new mongoose.Schema({}, { strict: false }));

    const doc = await Document.findById('6a0ce88ee8004599236fdfbd').lean();
    console.log('=== DRAFT DOCUMENT ===');
    console.log('ID:', doc._id);
    console.log('draftSourceTemplateId:', doc.draftSourceTemplateId);
    console.log('draftRecordId:', doc.draftRecordId);

    const sdt = await SmartDocTemplate.findById(doc.draftSourceTemplateId).lean();
    console.log('\n=== SMARTDOC TEMPLATE ===');
    console.log('ID:', sdt._id);
    console.log('Entity ID:', sdt.entityId);
    console.log('Name:', sdt.name);

    await mongoose.connection.close();
}

run().catch(console.error);
