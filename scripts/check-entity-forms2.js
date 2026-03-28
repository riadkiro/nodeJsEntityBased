const mongoose = require('mongoose');
const fs = require('fs');

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    const db = mongoose.connection.db;
    
    const Consultation = await db.collection('entities').findOne({slug: 'consultations'});
    const forms = await db.collection('entityforms').find({ entityId: Consultation._id }).toArray();
    fs.writeFileSync('tmp-entity-forms2.json', JSON.stringify(forms, null, 2), 'utf8');
    
    console.log('Done.');
    process.exit(0);
}

run().catch(console.error);
