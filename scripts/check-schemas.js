const mongoose = require('mongoose');

async function deepCheck() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));

    // Check lineschemas with no filter
    const all = await conn.db.collection('lineschemas').find({}).toArray();
    console.log('lineschemas:', all.length);
    all.forEach(s => console.log(`  ${s._id} - ${s.name} (${s.slug})`));

    // Check if schema was created in a DIFFERENT database
    const dbs = await conn.db.admin().listDatabases();
    console.log('\nAll databases:');
    for (const db of dbs.databases) {
        if (db.name.startsWith('saas_app')) {
            const c = mongoose.createConnection(`mongodb://127.0.0.1:27017/${db.name}`);
            await new Promise(r => c.once('open', r));
            const schemas = await c.db.collection('lineschemas').find({ slug: 'traitement' }).toArray();
            if (schemas.length > 0) {
                console.log(`  Found in ${db.name}: ${schemas.length} traitement schemas`);
                schemas.forEach(s => console.log(`    ${s._id} - ${s.name}`));
            }
            await c.close();
        }
    }

    // Try to find by the ID from seed output
    try {
        const byId = await conn.db.collection('lineschemas').findOne({ _id: new mongoose.Types.ObjectId('69ce1be4738ff763a648053c') });
        console.log('\nBy ID 69ce1be4738ff763a648053c:', byId ? byId.name : 'NOT FOUND');
    } catch(e) {
        console.log('ID search error:', e.message);
    }

    // Also check documents for the ordonnance template
    const ordonnance = await conn.db.collection('documents').findOne({ name: 'Ordonnance', isTemplate: true });
    if (ordonnance) {
        const page0 = ordonnance.pages?.[0];
        const match = page0?.content?.match(/schemaId.*?(\w{24})/);
        console.log('\nOrdonnance template schemaId in HTML:', match ? match[1] : 'NOT FOUND');
    } else {
        console.log('\nOrdonnance template: NOT FOUND');
    }

    await conn.close();
}

deepCheck().catch(console.error);
