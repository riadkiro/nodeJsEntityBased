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

        const Entity = await tenantCollection(req, 'Entity');
        const entities = await Entity.find({}).lean();
        console.log(`Found ${entities.length} entities:`);
        for (const e of entities) {
            console.log(`\nEntity: ${e.name} (${e.slug}) | ID: ${e._id}`);
            console.log(`  relations:`);
            (e.relations || []).forEach(r => {
                console.log(`    - key: "${r.key}", label: "${r.label}", cardinality: "${r.cardinality}", targetEntity: ${r.targetEntity}`);
            });
        }

        await tenantConnection.close();
    } catch (e) {
        console.error(e);
    }
}

run();
