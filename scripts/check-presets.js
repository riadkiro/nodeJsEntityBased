const mongoose = require('mongoose');

async function checkPresets() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));

    // Check GridSchemaTemplate collection
    const templates = await conn.db.collection('gridschematemplate').find({}).toArray();
    console.log(`Total GridSchemaTemplates: ${templates.length}`);

    if (templates.length === 0) {
        // Try plural
        const templates2 = await conn.db.collection('gridschematemplates').find({}).toArray();
        console.log(`Total GridSchemaTemplates (plural collection): ${templates2.length}`);
        templates2.forEach(t => {
            console.log(`  - ${t.name} | scope: ${t.scope} | schemaId: ${t.schemaId} | recordId: ${t.recordId || 'GLOBAL'}`);
        });
    } else {
        templates.forEach(t => {
            console.log(`  - ${t.name} | scope: ${t.scope} | schemaId: ${t.schemaId} | recordId: ${t.recordId || 'GLOBAL'}`);
        });
    }

    // List all collections to find the right one
    const colls = await conn.db.listCollections().toArray();
    const gridColls = colls.filter(c => c.name.toLowerCase().includes('grid') || c.name.toLowerCase().includes('template'));
    console.log('\nGrid/Template related collections:');
    gridColls.forEach(c => console.log(`  - ${c.name}`));

    await conn.close();
}

checkPresets().catch(console.error);
