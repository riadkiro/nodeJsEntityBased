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

        const recId = '6a0b4221f1c5ddd28f737c9b'; // Déploiement ERP TechCorp
        const rec = await Record.findById(recId).lean();
        if (rec) {
            console.log('Record details:');
            console.log('  ID:', rec._id);
            console.log('  Title:', rec.title);
            console.log('  entityId:', rec.entityId);
            
            const ent = await Entity.findById(rec.entityId).lean();
            if (ent) {
                console.log('  Entity Slug:', ent.slug);
                console.log('  Entity Name:', ent.name);
            } else {
                console.log('  Entity not found for entityId:', rec.entityId);
            }
        } else {
            console.log('Record not found:', recId);
        }

        await tenantConnection.close();
    } catch (e) {
        console.error(e);
    }
}

run();
