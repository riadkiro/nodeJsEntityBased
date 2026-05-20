const mongoose = require('mongoose');

async function main() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    await new Promise(r => conn.once('open', r));
    const db = conn.db;

    const recordId = new mongoose.Types.ObjectId('6a0b4221f1c5ddd28f737c99');
    const record = await db.collection('records').findOne({ _id: recordId });
    
    // Simulate what the controller now does
    const cfFieldId = '6a0d430f50eb2c274592e436'; // Contact field
    
    // Step 1: Check customFields (like recordValues)
    const cfEntry = (record.customFields || []).find(cf => {
        const fid = (cf.field_id?._id || cf.field_id || '').toString();
        return fid === cfFieldId;
    });
    const valFromCF = cfEntry ? cfEntry.value : null;
    console.log('Value from customFields:', valFromCF);
    
    // Step 2: Fallback to record.relations
    let relVal = valFromCF;
    if (!relVal) {
        const relEntry = (record.relations || []).find(r => r.relationKey === cfFieldId);
        if (relEntry && relEntry.value) {
            relVal = relEntry.value;
        }
    }
    console.log('Final relVal:', relVal);
    
    // Step 3: Resolve records
    if (relVal) {
        const ids = Array.isArray(relVal) ? relVal : [relVal];
        const validIds = ids.filter(id => id && mongoose.Types.ObjectId.isValid(id.toString())).map(id => new mongoose.Types.ObjectId(id.toString()));
        if (validIds.length > 0) {
            const recs = await db.collection('records').find({ _id: { $in: validIds } }).toArray();
            console.log('Resolved records:', recs.map(r => ({ _id: r._id.toString(), title: r.title })));
        }
    }
    
    await conn.close();
}

main().catch(e => { console.error(e); process.exit(1); });
