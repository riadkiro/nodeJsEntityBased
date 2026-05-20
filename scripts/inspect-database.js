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

        const SmartDocTemplate = await tenantCollection(req, 'SmartDocTemplate');
        const Document = await tenantCollection(req, 'Document');
        const Record = await tenantCollection(req, 'Record');
        const Entity = await tenantCollection(req, 'Entity');

        // Let's search for templates
        const templates = await SmartDocTemplate.find({}).lean();
        console.log('\n--- SmartDocTemplates ---');
        templates.forEach(t => {
            console.log(`ID: ${t._id}, Name: ${t.name}, EntityId: ${t.entityId}, DocumentId: ${t.documentId}`);
        });

        // Let's search for Documents
        const docs = await Document.find({}).lean();
        console.log('\n--- Documents ---');
        docs.forEach(d => {
            console.log(`ID: ${d._id}, Name: ${d.name}`);
        });

        // If we have a specific ID, let's query it
        const targetId = '6a0cc32c8582f628068fa250';
        const docT = await SmartDocTemplate.findById(targetId).lean();
        if (docT) {
            console.log('\n--- Target SmartDocTemplate Found ---');
            console.log(JSON.stringify(docT, null, 2));
            const doc = await Document.findById(docT.documentId).lean();
            if (doc) {
                console.log('\n--- Linked Document Found ---');
                console.log(`ID: ${doc._id}, Name: ${doc.name}, Pages count: ${doc.pages?.length}, ContentBlocks: ${doc.contentBlocks?.length}`);
                if (doc.pages) {
                    console.log('Pages content:');
                    doc.pages.forEach((p, i) => console.log(`Page ${i + 1}:`, p.content));
                }
            }
        } else {
            const docD = await Document.findById(targetId).lean();
            if (docD) {
                console.log('\n--- Target Document Found ---');
                console.log(`ID: ${docD._id}, Name: ${docD.name}, Pages count: ${docD.pages?.length}`);
                if (docD.pages) {
                    docD.pages.forEach((p, i) => console.log(`Page ${i + 1}:`, p.content));
                }
            } else {
                console.log(`\nID ${targetId} not found in SmartDocTemplate or Document`);
            }
        }

        await tenantConnection.close();
    } catch (e) {
        console.error(e);
    }
}

run();
