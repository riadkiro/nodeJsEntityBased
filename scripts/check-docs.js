/**
 * Check why documents created via React editor don't show in listing
 */
const mongoose = require('mongoose');

(async () => {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    await new Promise(r => conn.once('open', r));
    
    // Find the recently created documents
    const docs = await conn.db.collection('documents').find({}).sort({createdAt: -1}).limit(10).toArray();
    
    console.log('=== Last 10 documents ===');
    docs.forEach(d => {
        console.log({
            _id: d._id.toString(),
            name: d.name,
            isTemplate: d.isTemplate,
            createdBy: d.createdBy?.toString(),
            hasUploadedFile: !!d.uploadedFile?.path,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt
        });
    });

    // Check the specific doc we created in the test
    const testDoc = await conn.db.collection('documents').findOne({_id: new mongoose.Types.ObjectId('6a0b884e29ee91cf5b219ea4')});
    if (testDoc) {
        console.log('\n=== Test document details ===');
        console.log(JSON.stringify(testDoc, null, 2));
    }

    await conn.close();
})();
