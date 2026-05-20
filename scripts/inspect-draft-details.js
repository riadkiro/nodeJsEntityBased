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

        const draft1 = await Document.findById('6a0cea188ba92ea07f88c38b').lean();
        const draft2 = await Document.findById('6a0ce9a9cda60d94af08421b').lean();

        console.log('\n=== DRAFT 1 (SUCCESSFUL) ===');
        console.log('ID:', draft1._id);
        console.log('linkedRecords:', draft1.linkedRecords);
        console.log('pages:', draft1.pages);

        console.log('\n=== DRAFT 2 (FAILED) ===');
        console.log('ID:', draft2._id);
        console.log('linkedRecords:', draft2.linkedRecords);
        console.log('pages:', draft2.pages);

        await tenantConnection.close();
    } catch (e) {
        console.error(e);
    }
}

run();
