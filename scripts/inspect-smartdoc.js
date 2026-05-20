const mongoose = require('mongoose');

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5096?directConnection=true');
    console.log('Connected to saas_app_rb_5096');

    // 1. Get SmartDocTemplate
    const docId = '6a0cc32c8582f628068fa250';
    const SmartDocTemplate = mongoose.connection.collection('smartdoctemplates');
    const template = await SmartDocTemplate.findOne({ documentId: docId });
    console.log('SmartDocTemplate found:', JSON.stringify(template, null, 2));

    await mongoose.disconnect();
}

main().catch(console.error);
