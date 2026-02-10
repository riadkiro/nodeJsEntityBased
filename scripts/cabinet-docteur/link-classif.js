const mongoose = require('mongoose');

(async () => {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));

    // Add progression-consultation to the consultation entity's classifications array
    const result = await conn.db.collection('entities').updateOne(
        { slug: 'consultation' },
        { $addToSet: { classifications: new mongoose.Types.ObjectId('6989923bcf4f1191d69f8b29') } }
    );
    console.log('Updated:', result.modifiedCount);

    const entity = await conn.db.collection('entities').findOne({ slug: 'consultation' });
    console.log('Classifications now:', JSON.stringify(entity.classifications));

    await conn.close();
    console.log('Done!');
})();
