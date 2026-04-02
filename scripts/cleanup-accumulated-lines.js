/**
 * Cleanup accumulated document lines from the preset bug.
 * Removes all DocumentLine records for the ordonnance template document.
 */
const mongoose = require('mongoose');

async function cleanup() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));
    
    const db = conn.db;
    
    // Find the ordonnance template document
    const docs = await db.collection('documents').find({}).toArray();
    console.log(`Found ${docs.length} documents total`);
    
    for (const doc of docs) {
        const lineCount = await db.collection('documentlines').countDocuments({ documentId: doc._id.toString() });
        if (lineCount > 0) {
            console.log(`Document ${doc._id}: ${lineCount} lines (templateId: ${doc.templateId})`);
        }
    }
    
    // Delete all lines for template documents (they shouldn't have persistent lines from preset bug)
    const templateDocs = docs.filter(d => !d.recordId);
    for (const doc of templateDocs) {
        const result = await db.collection('documentlines').deleteMany({ documentId: doc._id.toString() });
        if (result.deletedCount > 0) {
            console.log(`Cleaned ${result.deletedCount} accumulated lines from template document ${doc._id}`);
        }
    }
    
    await conn.close();
    console.log('Done');
}

cleanup().catch(console.error);
