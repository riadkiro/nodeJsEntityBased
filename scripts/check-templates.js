const mongoose = require('mongoose');

async function check() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));

    // Check SmartDocTemplate collection
    const templates = await conn.db.collection('smartdoctemplates').find({}).toArray();
    console.log('\n=== SmartDocTemplates ===');
    templates.forEach(t => {
        console.log(`  ${t.name} | entityId: ${t.entityId} | active: ${t.active} | scopeType: ${t.scopeType || 'N/A'}`);
    });

    // Check Document collection for isTemplate: true
    const docs = await conn.db.collection('documents').find({ isTemplate: true }).toArray();
    console.log('\n=== Documents (isTemplate: true) ===');
    docs.forEach(d => {
        console.log(`  ${d.name} | entityId: ${d.entityId || 'NONE'} | entityIds: ${JSON.stringify(d.entityIds || [])} | _id: ${d._id}`);
    });

    // Get the entity ID for patients
    const entities = await conn.db.collection('entities').find({ slug: 'patients' }).toArray();
    console.log('\n=== Patients entity ===');
    entities.forEach(e => {
        console.log(`  ${e.name} | _id: ${e._id} | slug: ${e.slug}`);
    });

    await conn.close();
    process.exit(0);
}
check().catch(e => { console.error(e); process.exit(1); });
