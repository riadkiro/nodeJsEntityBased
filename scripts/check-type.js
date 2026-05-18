/**
 * Check type of createdBy field in documents
 */
const mongoose = require('mongoose');

(async () => {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    await new Promise(r => conn.once('open', r));
    
    const doc = await conn.db.collection('documents').findOne({_id: new mongoose.Types.ObjectId('6a0b884e29ee91cf5b219ea4')});
    
    console.log('createdBy value:', doc.createdBy);
    console.log('createdBy type:', typeof doc.createdBy);
    console.log('Is ObjectId:', doc.createdBy instanceof mongoose.Types.ObjectId);
    console.log('Constructor name:', doc.createdBy?.constructor?.name);
    
    // Test the exact query the listing uses
    const objectIdVersion = new mongoose.Types.ObjectId('643c0b36fbde1ceb1bdc97bb');
    
    const withObjectId = await conn.db.collection('documents').countDocuments({
        isTemplate: false,
        createdBy: objectIdVersion,
        'uploadedFile.path': { $exists: false }
    });
    console.log('\nMatches with ObjectId:', withObjectId);
    
    const withString = await conn.db.collection('documents').countDocuments({
        isTemplate: false,
        createdBy: '643c0b36fbde1ceb1bdc97bb',
        'uploadedFile.path': { $exists: false }
    });
    console.log('Matches with String:', withString);

    await conn.close();
})();
