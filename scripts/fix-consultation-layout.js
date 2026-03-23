const mongoose = require('mongoose');

async function main() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));
    const db = conn.db;
    
    const entity = await db.collection('entities').findOne({ slug: 'consultations' });
    if (!entity) { console.log('Entity not found'); await conn.close(); return; }
    
    // Get field IDs
    const motif = await db.collection('fieldtemplates').findOne({ name: 'motif' });
    const noteMedecin = await db.collection('fieldtemplates').findOne({ name: 'note_medecin' });
    
    // Get Symptômes relation key
    const symptomeEntity = await db.collection('entities').findOne({ slug: 'symptomes' });
    let symptomesRelKey = null;
    (entity.relations || []).forEach(r => {
        const targetId = (r.targetEntity?._id || r.targetEntity || '').toString();
        if (symptomeEntity && targetId === symptomeEntity._id.toString()) {
            symptomesRelKey = r.key;
        }
    });
    
    console.log('motif:', motif?._id?.toString());
    console.log('note_medecin:', noteMedecin?._id?.toString());
    console.log('symptomes rel key:', symptomesRelKey);
    
    // Build explicit layout: Motif (6) + Symptômes (6) on same line, Note médecin (12) below
    const layout = [];
    
    if (motif) {
        layout.push({ fieldId: motif._id.toString(), width: 6, id: 'cf_motif', tabId: 'default' });
    }
    if (symptomesRelKey) {
        layout.push({ fieldId: symptomesRelKey, width: 6, id: 'rel_symptomes', tabId: 'default' });
    }
    if (noteMedecin) {
        layout.push({ fieldId: noteMedecin._id.toString(), width: 12, id: 'cf_note_medecin', tabId: 'default' });
    }
    
    console.log('\nLayout:');
    layout.forEach(l => console.log(`  ${l.id}: width=${l.width}`));
    
    await db.collection('entities').updateOne(
        { _id: entity._id },
        { $set: { layout: layout } }
    );
    console.log('\n✅ Layout set with explicit order!');
    
    await conn.close();
}

main().catch(console.error);
