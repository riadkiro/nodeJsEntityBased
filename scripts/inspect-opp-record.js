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

        const Record = await tenantCollection(req, 'Record');
        const Entity = await tenantCollection(req, 'Entity');

        const recordId = '6a0b4221f1c5ddd28f737c9b';
        const rec = await Record.findById(recordId).lean();
        console.log('=== RECORD ===');
        console.log(JSON.stringify(rec, null, 2));

        if (rec) {
            const entity = await Entity.findById(rec.entityId).lean();
            console.log('=== RECORD\'S ENTITY ===');
            console.log(JSON.stringify(entity, null, 2));
        }

        await tenantConnection.close();
    } catch (e) {
        console.error(e);
    }
}

run();
