/**
 * Hotfix: Add the missing "Traitements" gridSchema entry to the consultation entity
 * on account 7846 (dentist). The schema slug='traitement' exists but was never added
 * to gridSchemas because the seed looked for 'consultation_treatment_v1' which doesn't exist.
 */
const mongoose = require('mongoose');

async function fix() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_7846');
    await new Promise(r => conn.once('open', r));
    const db = conn.db;

    // Find the treatment schema
    const treatmentSchema = await db.collection('lineschemas').findOne({ slug: 'traitement' });
    if (!treatmentSchema) {
        console.log('❌ Treatment schema not found');
        await conn.close();
        process.exit(1);
    }

    console.log(`✅ Found treatment schema: ${treatmentSchema._id} (${treatmentSchema.name})`);

    // Get current consultation entity
    const consult = await db.collection('entities').findOne({ slug: 'consultations' });
    if (!consult) {
        console.log('❌ Consultation entity not found');
        await conn.close();
        process.exit(1);
    }

    const gs = consult.gridSchemas || [];
    console.log(`Current gridSchemas (${gs.length}):`);
    gs.forEach(g => console.log(`  order=${g.order} label="${g.label}" schemaId=${g.schemaId}`));

    // Check if treatment is already present
    const alreadyPresent = gs.some(g => g.schemaId?.toString() === treatmentSchema._id.toString());
    if (alreadyPresent) {
        console.log('⏭️  Traitements already in gridSchemas');
        await conn.close();
        process.exit(0);
    }

    // Insert at position 0 (first tab) and shift existing orders
    const updatedGs = [
        { schemaId: treatmentSchema._id, position: 'main', order: 0, label: 'Traitements' },
        ...gs.map(g => ({ ...g, order: (g.order || 0) + 1 }))
    ];

    await db.collection('entities').updateOne(
        { _id: consult._id },
        { $set: { gridSchemas: updatedGs } }
    );

    console.log(`\n✅ Fixed! Updated gridSchemas (${updatedGs.length}):`);
    updatedGs.forEach(g => console.log(`  order=${g.order} label="${g.label}" schemaId=${g.schemaId}`));

    await conn.close();
    process.exit(0);
}

fix().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
