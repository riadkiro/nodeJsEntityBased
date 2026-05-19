/**
 * Cleanup: Delete all orphan draft documents that were never finalized
 */
const mongoose = require('mongoose');

async function run() {
    const conn = await mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001').asPromise();
    const docCol = conn.db.collection('documents');
    
    const drafts = await docCol.find({ isDraft: true }).toArray();
    console.log(`Found ${drafts.length} orphan drafts to clean up`);
    
    for (const d of drafts) {
        console.log(`  Deleting: ${d._id} | "${d.name}" | created: ${d.createdAt}`);
        await docCol.deleteOne({ _id: d._id });
    }
    
    console.log(`Cleaned up ${drafts.length} orphan drafts`);
    await conn.close();
}

run().catch(e => { console.error(e); process.exit(1); });
