const mongoose = require('mongoose');

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    const db = mongoose.connection.db;
    
    const Consultation = await db.collection('entities').findOne({slug: 'consultations'});
    const view = await db.collection('views').findOne({ entity: Consultation._id, type: 'form' });
    console.log(JSON.stringify(view?.blocks || [], null, 2));
    
    console.log('Done.');
    process.exit(0);
}

run().catch(console.error);
