/**
 * Script pour lister les champs d'une entity
 * Usage: node scripts/list-entity-fields.js <account_number> <entity_id>
 */
const mongoose = require('mongoose');
const config = require('../config/db');

async function main() {
    const accountNumber = process.argv[2] || '5001';
    const entityId = process.argv[3] || '69733f6433f2b10fa6122245';

    await mongoose.connect(config.globalDbUri);
    const tenantDb = mongoose.createConnection(`${config.uri}saas_app_rb_${accountNumber}`);
    await new Promise(r => tenantDb.once('open', r));

    const FieldTemplate = require('../models/field-template.model');
    const FT = tenantDb.model('FieldTemplate', FieldTemplate.schema);

    const fields = await FT.find({
        entityId: new mongoose.Types.ObjectId(entityId)
    }).sort({ name: 1 });

    console.log(`\nChamps de l'entity ${entityId}:\n`);
    console.log('ID                       | Name            | Type');
    console.log('-'.repeat(60));
    fields.forEach(f => {
        console.log(`${f._id} | ${f.name.padEnd(15)} | ${f.type}`);
    });
    console.log(`\nTotal: ${fields.length} champs`);

    await mongoose.disconnect();
    process.exit(0);
}

main().catch(console.error);
