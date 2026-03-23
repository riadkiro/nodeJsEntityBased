const mongoose = require('mongoose');

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    const db = mongoose.connection.db;
    const entities = db.collection('entities');
    
    const consultEntity = await entities.findOne({ slug: 'consultations' });
    if (!consultEntity) {
        console.log('No consultations entity found');
        process.exit(0);
    }
    
    const symRel = (consultEntity.relations || []).find(r => 
        r.label === 'Symptômes' || r.label === 'Symptomes'
    );
    
    if (!symRel) {
        console.log('No symptoms relation found. Relations:', 
            (consultEntity.relations || []).map(r => r.label));
        process.exit(0);
    }
    
    console.log('Found symptomes relation:', symRel.key, 'inputMode:', symRel.inputMode);
    
    await entities.updateOne(
        { _id: consultEntity._id, 'relations.key': symRel.key },
        { $set: { 'relations.$.inputMode': 'autocomplete' } }
    );
    
    console.log('Updated inputMode to autocomplete');
    process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
