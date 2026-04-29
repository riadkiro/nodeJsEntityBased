const mongoose = require('mongoose');

async function fix() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));

    // Find the SmartDocTemplate "Document sans titre" - check what the entityId actually is
    const found = await conn.db.collection('smartdoctemplates').find({ name: 'Document sans titre' }).toArray();
    console.log('Found:', JSON.stringify(found, null, 2));

    if (found.length > 0) {
        // Check if the corresponding Document has entityIds linked
        const docId = found[0].documentId;
        console.log('\nDocumentId on SmartDocTemplate:', docId);
        
        // Try to find the Document
        if (docId) {
            let doc;
            try {
                doc = await conn.db.collection('documents').findOne({ _id: new mongoose.Types.ObjectId(docId) });
            } catch(e) {
                doc = await conn.db.collection('documents').findOne({ _id: docId });
            }
            if (doc) {
                console.log('Document entityIds:', doc.entityIds);
                console.log('Document entityId:', doc.entityId);
                console.log('Document isTemplate:', doc.isTemplate);
            } else {
                console.log('No matching Document found (orphan SmartDocTemplate)');
            }
        }

        // Delete the orphan SmartDocTemplate entry
        const result = await conn.db.collection('smartdoctemplates').deleteOne({ _id: found[0]._id });
        console.log('\nDeleted:', result.deletedCount, 'entry');
    }

    await conn.close();
    process.exit(0);
}
fix().catch(e => { console.error(e); process.exit(1); });
