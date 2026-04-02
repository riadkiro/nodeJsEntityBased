/**
 * Check a specific record that IS showing a patient in the form
 */
const mongoose = require('mongoose');
const fs = require('fs');

async function check() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_7846');
    await new Promise(r => conn.once('open', r));
    const db = conn.db;
    const out = [];

    // Check the specific record from the URL
    const recordId = '69ce60dc52c96f71dd936a5a';
    const rec = await db.collection('records').findOne({ _id: new mongoose.Types.ObjectId(recordId) });
    if (!rec) {
        out.push('Record not found: ' + recordId);
    } else {
        out.push('=== Record: ' + (rec.title || rec.computedTitle || rec._id));
        out.push('relations: ' + JSON.stringify(rec.relations, null, 2));
        out.push('_denorm: ' + JSON.stringify(rec._denorm, null, 2));
    }
    
    // Also check a record that DOES have patient linked (from 9194)
    const conn2 = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_9194');
    await new Promise(r => conn2.once('open', r));
    const db2 = conn2.db;
    
    const consultEntity2 = await db2.collection('entities').findOne({ slug: 'consultations' });
    if (consultEntity2) {
        const recs2 = await db2.collection('records').find({ entityId: consultEntity2._id }).limit(1).toArray();
        if (recs2[0]) {
            out.push('\n=== 9194 Record: ' + (recs2[0].title || recs2[0].computedTitle));
            out.push('relations: ' + JSON.stringify((recs2[0].relations || []).slice(0, 2), null, 2));
            out.push('_denorm.relations: ' + JSON.stringify((recs2[0]._denorm?.relations || []).slice(0, 2), null, 2));
        }
    }

    fs.writeFileSync('scripts/check-output.txt', out.join('\n'));
    console.log('Done');
    await conn.close();
    await conn2.close();
}

check().catch(console.error);
