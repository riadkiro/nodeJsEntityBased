const mongoose = require('mongoose');

async function fullDebug() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));

    // List ALL line schemas
    const schemas = await conn.db.collection('lineschemas').find({}).toArray();
    console.log('=== ALL Line Schemas ===');
    schemas.forEach(s => {
        console.log(`  ${s._id} - ${s.name} (slug: ${s.slug})`);
        // Show columns/keys
        if (s.columns) {
            const cols = s.columns.map(c => c.key || c.name).join(', ');
            console.log(`    columns: ${cols}`);
        }
    });

    // List ALL presets
    const presets = await conn.db.collection('gridschematemplates').find({}).toArray();
    console.log('\n=== ALL GridSchemaTemplates ===');
    presets.forEach(p => {
        console.log(`  ${p._id} - ${p.name} | schemaId: ${p.schemaId} | scope: ${p.scope}`);
    });

    // Check template doc Ordonnance
    const tpl = await conn.db.collection('documents').findOne({ _id: new mongoose.Types.ObjectId('69c7baba12662cd0b04a6e5b') });
    if (tpl) {
        console.log('\n=== Ordonnance Template ===');
        const pages = tpl.pages || [];
        pages.forEach((p, i) => {
            const content = p.content || '';
            // Extract full data-table JSON
            const match = content.match(/data-table='([^']*)'/);
            if (match) {
                console.log(`  Page ${i} data-table: ${match[1]}`);
            }
        });
    }

    // Check what schema matches the DT widget in the template
    const widgetSchemaId = '69c7baba12662cd0b04a6d93';
    const matchingSchema = schemas.find(s => s._id.toString() === widgetSchemaId);
    console.log(`\n=== Widget Schema (${widgetSchemaId}) ===`);
    console.log(matchingSchema ? `Found: ${matchingSchema.name} (${matchingSchema.slug})` : 'NOT FOUND');

    // Check what schema the presets use
    if (presets.length > 0) {
        const presetSchemaId = presets[0].schemaId?.toString();
        const presetSchema = schemas.find(s => s._id.toString() === presetSchemaId);
        console.log(`\n=== Preset Schema (${presetSchemaId}) ===`);
        console.log(presetSchema ? `Found: ${presetSchema.name} (${presetSchema.slug})` : 'NOT FOUND');
    }

    await conn.close();
}

fullDebug().catch(console.error);
