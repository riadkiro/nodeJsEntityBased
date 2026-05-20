const mongoose = require('mongoose');

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    const SmartDocTemplate = mongoose.model('SmartDocTemplate', new mongoose.Schema({}, { strict: false }));
    const Document = mongoose.model('Document', new mongoose.Schema({}, { strict: false }));

    const sdt = await SmartDocTemplate.findOne({ documentId: '6a0cc32c8582f628068fa250' }).lean();
    console.log('=== SMARTDOC TEMPLATE FOUND BY documentId ===');
    console.log(JSON.stringify(sdt, null, 2));

    const sdtAll = await SmartDocTemplate.find({}).lean();
    console.log('\n=== ALL SMARTDOC TEMPLATES ===');
    sdtAll.forEach(t => console.log(t._id, t.name, 'docId:', t.documentId));

    const doc = await Document.findById('6a0cc32c8582f628068fa250').lean();
    console.log('\n=== DOCUMENT TEMPLATE ===');
    console.log(JSON.stringify(doc, null, 2));

    await mongoose.connection.close();
}

run().catch(console.error);
