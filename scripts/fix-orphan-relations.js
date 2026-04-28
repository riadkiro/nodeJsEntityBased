const mongoose = require('mongoose');

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5756');
    
    // Find ALL consultation records with orphan relation entries (missing relationKey)
    const records = await mongoose.connection.db.collection('records').find({
        'relations': { $elemMatch: { relationKey: { $exists: false } } }
    }).toArray();
    
    console.log(`Found ${records.length} records with orphan relation entries`);
    
    for (const rec of records) {
        const before = rec.relations.length;
        const cleaned = rec.relations.filter(r => r.relationKey);
        const removed = before - cleaned.length;
        
        if (removed > 0) {
            await mongoose.connection.db.collection('records').updateOne(
                { _id: rec._id },
                { $set: { relations: cleaned } }
            );
            console.log(`  Fixed: ${rec.title} — removed ${removed} orphan entries`);
        }
    }
    
    // Also fix entries where relationKey is null/empty
    const records2 = await mongoose.connection.db.collection('records').find({
        'relations.relationKey': null
    }).toArray();
    
    console.log(`\nFound ${records2.length} records with null relationKey`);
    for (const rec of records2) {
        const cleaned = rec.relations.filter(r => r.relationKey);
        await mongoose.connection.db.collection('records').updateOne(
            { _id: rec._id },
            { $set: { relations: cleaned } }
        );
        console.log(`  Fixed: ${rec.title}`);
    }
    
    console.log('\nDone!');
    await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
