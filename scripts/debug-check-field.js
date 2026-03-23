const mongoose = require('mongoose');

async function main() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));
    const db = conn.db;
    
    // 1. Disable 'description' from Consultation's enabledStandardFields
    const entity = await db.collection('entities').findOne({ slug: 'consultations' });
    if (!entity) { console.log('Entity not found'); await conn.close(); return; }
    
    const currentStdFields = entity.enabledStandardFields || [];
    console.log('Current enabledStandardFields:', currentStdFields);
    
    const newStdFields = currentStdFields.filter(f => f !== 'description');
    console.log('New enabledStandardFields:', newStdFields);
    
    await db.collection('entities').updateOne(
        { _id: entity._id },
        { $set: { enabledStandardFields: newStdFields } }
    );
    console.log('✅ Removed "description" from Consultation standard fields');
    
    // 2. Update note_medecin to rows: 1 (single line)
    const result = await db.collection('fieldtemplates').updateOne(
        { name: 'note_medecin' },
        { $set: { 'ui.rows': 1 } }
    );
    console.log('✅ Updated note_medecin to rows: 1 (matched:', result.matchedCount, ')');
    
    await conn.close();
    console.log('\n✅ Done!');
}

main().catch(console.error);
