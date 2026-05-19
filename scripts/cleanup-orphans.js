const mongoose = require('mongoose');

async function cleanupOrphans() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    const Document = mongoose.model('Document', new mongoose.Schema({}, { strict: false }));
    const SmartDocTemplate = mongoose.model('SmartDocTemplate', new mongoose.Schema({}, { strict: false }));

    const smartDocs = await SmartDocTemplate.find({}).lean();
    let deletedCount = 0;
    
    for (const smartDoc of smartDocs) {
        if (smartDoc.documentId) {
            const doc = await Document.findOne({ _id: smartDoc.documentId });
            if (!doc) {
                console.log(`Orphaned SmartDocTemplate found: ${smartDoc.name} (${smartDoc._id}) - Document ${smartDoc.documentId} is missing.`);
                await SmartDocTemplate.deleteOne({ _id: smartDoc._id });
                deletedCount++;
            }
        }
    }
    
    console.log(`Cleanup complete. Deleted ${deletedCount} orphaned templates.`);
    await mongoose.disconnect();
}
cleanupOrphans();
