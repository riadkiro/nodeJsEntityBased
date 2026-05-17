const mongoose = require('mongoose');

async function main() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    await new Promise(r => conn.once('open', r));
    
    const recordId = '6a09be6c0052fd6c37c92ba9';
    const record = await conn.db.collection('records').findOne({ _id: new mongoose.Types.ObjectId(recordId) });
    
    if (!record) {
        console.error('Record not found');
        await conn.close();
        return;
    }

    console.log('Found record:', record.title || record.recordTitle);
    
    let updatedCount = 0;
    const attachments = record.attachments || [];
    
    for (const att of attachments) {
        if (!att.isGenerated && (!att.folder || att.folder.trim() === '')) {
            att.folder = 'uploads';
            updatedCount++;
        }
    }
    
    if (updatedCount > 0) {
        await conn.db.collection('records').updateOne(
            { _id: new mongoose.Types.ObjectId(recordId) },
            { $set: { attachments: attachments } }
        );
        console.log(`Successfully migrated ${updatedCount} attachments to 'uploads' folder!`);
    } else {
        console.log('No attachments needed migration.');
    }
    
    await conn.close();
}

main().catch(e => { console.error(e); process.exit(1); });
