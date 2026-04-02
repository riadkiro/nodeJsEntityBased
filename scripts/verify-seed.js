const mongoose = require('mongoose');

async function verify() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));

    // Check line schemas
    const schemas = await conn.db.collection('lineschemas').find({}).toArray();
    console.log('=== Line Schemas ===');
    schemas.forEach(s => console.log(`  ${s._id} - ${s.name} (${s.slug})`));

    // Check gridschematemplates (presets)
    const presets = await conn.db.collection('gridschematemplates').find({}).toArray();
    console.log('\n=== Grid Schema Templates (Presets) ===');
    console.log('Count:', presets.length);
    presets.forEach(p => console.log(`  ${p._id} - ${p.name} | schemaId: ${p.schemaId}`));

    // Check Ordonnance template
    const ordDoc = await conn.db.collection('documents').findOne({ name: 'Ordonnance', isTemplate: true });
    if (ordDoc) {
        const content = ordDoc.pages?.[0]?.content || '';
        const match = content.match(/data-table='([^']*)'/);
        if (match) {
            try {
                const config = JSON.parse(match[1]);
                console.log('\n=== Ordonnance Template ===');
                console.log('DT schemaId:', config.schemaId);
                // Check if this schema ID exists in lineschemas
                const found = schemas.find(s => s._id.toString() === config.schemaId);
                console.log('Schema exists?', found ? `YES - ${found.name}` : 'NO!');
            } catch(e) {}
        }
    }

    await conn.close();
}

verify().catch(console.error);
