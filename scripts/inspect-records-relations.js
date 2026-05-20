const mongoose = require('mongoose');
const path = require('path');

require(path.join(__dirname, '../models/entity.model.js'));
require(path.join(__dirname, '../models/record.model.js'));

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    const Entity = mongoose.model('Entity');
    const Record = mongoose.model('Record');
    
    // Find Acme Corp record ID
    const acme = await Record.findOne({ title: /Acme/i }).lean();
    if (!acme) {
        console.log('Acme Corp record not found!');
        await mongoose.connection.close();
        return;
    }
    console.log(`Found parent record: ${acme.title} (${acme._id})`);
    
    // Find all records that reference acme._id in relations.value
    const referrers = await Record.find({
        'relations.value': acme._id
    }).lean();
    
    console.log(`\nFound ${referrers.length} referrers referencing ${acme.title}:`);
    for (const r of referrers) {
        const ent = await Entity.findById(r.entityId).select('name slug').lean();
        console.log(`- Record: "${r.computedTitle || r.title}" [${ent?.name || 'Unknown'} (${ent?.slug || 'unknown'})]`);
        console.log('  Relations:', JSON.stringify(r.relations));
    }
    
    await mongoose.connection.close();
}

run().catch(console.error);
