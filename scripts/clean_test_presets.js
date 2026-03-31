const mongoose = require('mongoose');

async function cleanTestPresets() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_7846');
    await new Promise(r => conn.once('open', r));
    
    const coll = conn.db.collection('gridschematemplates');
    
    // Delete presets created during testing (after March 30 2026 20:00)
    const cutoff = new Date('2026-03-30T19:00:00Z');
    const testDocs = await coll.find({ createdAt: { $gt: cutoff } }).toArray();
    
    console.log('Test presets to delete:');
    testDocs.forEach(d => console.log(`  - ${d.name}`));
    
    if (testDocs.length > 0) {
        const result = await coll.deleteMany({ createdAt: { $gt: cutoff } });
        console.log(`Deleted ${result.deletedCount} test presets`);
    }
    
    // Verify remaining
    const remaining = await coll.find({}).toArray();
    console.log(`\nRemaining presets: ${remaining.length}`);
    remaining.forEach(d => console.log(`  - ${d.name}`));
    
    await conn.close();
}

cleanTestPresets().catch(console.error);
