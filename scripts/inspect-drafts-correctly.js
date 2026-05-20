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
        const Entity = await tenantCollection(req, 'Entity');
        const Record = await tenantCollection(req, 'Record');

        // Find all documents
        const docs = await Document.find({}).sort({ updatedAt: -1 }).limit(10).lean();
        console.log(`Found ${docs.length} documents:`);
        docs.forEach((d, idx) => {
            console.log(`\nDoc ${idx + 1}: ID: ${d._id}, Name: "${d.name}", isTemplate: ${d.isTemplate}, isDraft: ${d.isDraft}`);
            console.log(`  linkedRecords:`, JSON.stringify(d.linkedRecords));
            console.log(`  _contextFreeBindings:`, JSON.stringify(d._contextFreeBindings));
            console.log('  Page content:');
            (d.pages || []).forEach((p, pIdx) => {
                console.log(`    Page ${pIdx + 1}: ${p.content}`);
            });
        });

        await tenantConnection.close();
    } catch (e) {
        console.error(e);
    }
}

run();
