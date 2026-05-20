const mongoose = require('mongoose');

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    const Document = mongoose.model('Document', new mongoose.Schema({}, { strict: false }));
    const doc = await Document.findById('6a0cc32c8582f628068fa250').lean();
    console.log('=== DOCUMENT TEMPLATE ===');
    console.log('name:', doc.name);
    console.log('entityId:', doc.entityId);
    console.log('entityIds:', doc.entityIds);
    console.log('linkedRecords:', doc.linkedRecords);
    
    const SmartDocTemplate = mongoose.model('SmartDocTemplate', new mongoose.Schema({}, { strict: false }));
    const sdt = await SmartDocTemplate.findOne({ documentId: doc._id.toString() }).lean();
    console.log('\n=== SMART DOC TEMPLATE ===');
    console.log('sdt:', sdt);
    
    await mongoose.connection.close();
}

run().catch(console.error);
