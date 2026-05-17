const mongoose = require('mongoose');

async function main() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    await new Promise(r => conn.once('open', r));
    
    const recordId = '6a09be6c0052fd6c37c92ba9';
    const record = await conn.db.collection('records').findOne({ _id: new mongoose.Types.ObjectId(recordId) });
    
    console.log('=== Image field value after fix test ===');
    if (record.customFields) {
        for (const cf of record.customFields) {
            const fid = (cf.field_id?._id || cf.field_id)?.toString() || cf.field_id;
            if (fid === '6a09ce5e28942d4bd6b06754') {
                console.log('Image field value:', JSON.stringify(cf.value));
            }
        }
    }
    
    // Reset it back to empty to clean up test data
    await conn.db.collection('records').updateOne(
        { _id: new mongoose.Types.ObjectId(recordId), 'customFields.field_id': new mongoose.Types.ObjectId('6a09ce5e28942d4bd6b06754') },
        { $set: { 'customFields.$.value': '' } }
    );
    console.log('Reset Image field back to empty');
    
    await conn.close();
}

main().catch(e => { console.error(e); process.exit(1); });
