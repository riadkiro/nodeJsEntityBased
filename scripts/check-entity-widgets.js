const mongoose = require('mongoose');
const fs = require('fs');

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    const db = mongoose.connection.db;
    
    const Consultation = await db.collection('entities').findOne({slug: 'consultations'});
    fs.writeFileSync('tmp-widgets.json', JSON.stringify({
        widgets: Consultation?.widgets,
        dashboard: Consultation?.dashboardLayout,
        pageLayout: Consultation?.pageLayout
    }, null, 2), 'utf8');
    
    console.log('Done.');
    process.exit(0);
}

run().catch(console.error);
