const mongoose = require('mongoose');

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    const db = mongoose.connection.db;
    
    // Check all collections for "dt-widget" string
    const collections = await db.listCollections().toArray();
    for (const coll of collections) {
        const results = await db.collection(coll.name).find({
            $or: [
                { type: 'dt-widget' },
                { 'blocks.type': 'dt-widget' },
                { 'formLayout.type': 'dt-widget' },
                { 'sections.blocks.type': 'dt-widget' },
                { 'formLayout.fields.type': 'dt-widget' },
                { 'formLayout.fields.block.type': 'dt-widget' },
                { 'formLayout.fields.type': /dynamic/i }
            ]
        }).toArray();
        if (results.length > 0) {
            console.log(`Found in collection: ${coll.name}`);
            for (const r of results) {
                console.log(`- Document ID: ${r._id}`);
                // find where it is
                console.log(JSON.stringify(r.formLayout, null, 2));
            }
        }
    }
    
    console.log('Done.');
    process.exit(0);
}

run().catch(console.error);
