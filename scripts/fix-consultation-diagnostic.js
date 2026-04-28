const mongoose = require('mongoose');

async function fix() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));

    const db = conn.db;

    // Find the diagnostic field template
    const diagField = await db.collection('fieldtemplates').findOne({ name: 'diagnostic' });
    if (!diagField) { console.log('❌ diagnostic field not found'); process.exit(1); }
    console.log('✅ Found diagnostic field:', diagField._id);

    // Find the consultation entity
    const entity = await db.collection('entities').findOne({ slug: 'consultations' });
    if (!entity) { console.log('❌ consultations entity not found'); process.exit(1); }
    console.log('✅ Found consultations entity:', entity._id);

    // Check if diagnostic is already in customFields
    const alreadyHas = (entity.customFields || []).some(id => id.toString() === diagField._id.toString());
    if (alreadyHas) {
        console.log('✅ Diagnostic field already in consultations.customFields');
    } else {
        // Add diagnostic field after motif
        const motifField = await db.collection('fieldtemplates').findOne({ name: 'motif' });
        const fields = entity.customFields || [];
        if (motifField) {
            const motifIdx = fields.findIndex(id => id.toString() === motifField._id.toString());
            if (motifIdx >= 0) {
                fields.splice(motifIdx + 1, 0, diagField._id);
            } else {
                fields.push(diagField._id);
            }
        } else {
            fields.push(diagField._id);
        }
        await db.collection('entities').updateOne({ _id: entity._id }, { $set: { customFields: fields } });
        console.log('✅ Added diagnostic to consultations.customFields');
    }

    await conn.close();
    process.exit(0);
}

fix().catch(e => { console.error(e); process.exit(1); });
