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

        const recA = await Record.findById('6a0b4221f1c5ddd28f737c9a').lean();
        const recB = await Record.findById('6a0b4221f1c5ddd28f737c9b').lean();

        console.log('\n=== RECORD A (Refonte Site Web Acme) ===');
        if (recA) {
            console.log('ID:', recA._id);
            console.log('Title:', recA.title);
            console.log('entityId:', recA.entityId);
            const entity = await Entity.findById(recA.entityId).lean();
            console.log('Entity Slug:', entity?.slug);
        } else {
            console.log('recA not found');
        }

        console.log('\n=== RECORD B (Déploiement ERP TechCorp) ===');
        if (recB) {
            console.log('ID:', recB._id);
            console.log('Title:', recB.title);
            console.log('entityId:', recB.entityId);
            const entity = await Entity.findById(recB.entityId).lean();
            console.log('Entity Slug:', entity?.slug);
        } else {
            console.log('recB not found');
        }

        await tenantConnection.close();
    } catch (e) {
        console.error(e);
    }
}

run();
