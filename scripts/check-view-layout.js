const mongoose = require('mongoose');

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    const db = mongoose.connection.db;
    
    // Find view for Consultation where formLayout has block type dynamic-table vs dt-widget
    const views = await db.collection('views').find({}).toArray();
    for (const v of views) {
        if (v.formLayout && Array.isArray(v.formLayout)) {
            for (const f of v.formLayout) {
                if (f.type === 'dynamic-table' || f.type === 'dt-widget' || f.type?.includes('dynamic') || f.type?.includes('widget')) {
                    console.log(`View ${v.name} (${v.entity}): Found block type: ${f.type}`);
                }
            }
        }
    }
    
    console.log('Done.');
    process.exit(0);
}

run().catch(console.error);
