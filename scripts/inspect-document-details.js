const mongoose = require('mongoose');
const { tenantCollection } = require('../middleware/tenant');

async function run() {
    try {
        const tenantConnection = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5096', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        await new Promise(r => tenantConnection.once('open', r));
        console.log("Connected to Tenant DB");

        const req = {
            tenantDbConnection: tenantConnection,
            tenantDbReady: true,
            account_number: '5096'
        };

        const Document = await tenantCollection(req, 'Document');
        const SmartDocTemplate = await tenantCollection(req, 'SmartDocTemplate');

        const docId = '6a0cc32c8582f628068fa250';
        const doc = await Document.findById(docId).lean();
        if (doc) {
            console.log('Document loaded:');
            console.log('  ID:', doc._id);
            console.log('  Name:', doc.name);
            console.log('  entityId:', doc.entityId);
            console.log('  entityIds:', doc.entityIds);
            
            const sdt = await SmartDocTemplate.findOne({ documentId: doc._id }).lean();
            if (sdt) {
                console.log('SmartDocTemplate referencing this document:');
                console.log('  ID:', sdt._id);
                console.log('  Name:', sdt.name);
                console.log('  entityId:', sdt.entityId);
            } else {
                console.log('No SmartDocTemplate referencing this document found');
            }
        } else {
            console.log('Document not found:', docId);
        }

        await tenantConnection.close();
    } catch (e) {
        console.error(e);
    }
}

run();
