const mongoose = require('mongoose');
async function main() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_9194');
    await new Promise(r => conn.once('open', r));

    // Get the Traitement schema with all details
    const schemas = await conn.db.collection('lineschemas').find({}).toArray();
    for (const s of schemas) {
        console.log('=== Schema:', s.name, '===');
        console.log('Columns:', JSON.stringify(s.columns, null, 2));
        if (s.totals) console.log('Totals:', JSON.stringify(s.totals));
        if (s.lineTypes) console.log('LineTypes:', JSON.stringify(s.lineTypes));
        if (s.catalogConfig) console.log('CatalogConfig:', JSON.stringify(s.catalogConfig));
        console.log('---');
    }

    // Check if there are any DocumentLines
    const lines = await conn.db.collection('documentlines').find({}).limit(5).toArray();
    console.log('\n=== Existing DocumentLines ===');
    console.log('Count:', lines.length);
    for (const l of lines) {
        console.log('  doc:', l.documentId, 'schema:', l.schemaId, 'vals:', JSON.stringify(l.values));
    }

    // Check GridSchemaTemplates
    const templates = await conn.db.collection('gridschematemplates').find({}).toArray();
    console.log('\n=== GridSchemaTemplates ===');
    for (const t of templates) {
        console.log(t.name, '- catalogEntityId:', t.catalogEntityId, '- lineTypes:', JSON.stringify(t.lineTypes));
    }

    await conn.close();
}
main().catch(e => console.error(e));
