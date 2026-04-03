const mongoose = require('mongoose');
const fs = require('fs');

async function check() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_7846');
    await new Promise(r => conn.once('open', r));
    
    const docs = await conn.db.collection('documents').find({
        isDraft: true,
        linkedRecords: { $exists: true }
    }).project({ name: 1, linkedRecords: 1 }).toArray();
    
    const result = docs.map(d => ({
        name: d.name,
        linkedRecords: (d.linkedRecords || []).map(lr => ({
            title: lr.recordTitle,
            entity: lr.entityName
        }))
    }));
    
    fs.writeFileSync('scripts/docs-output.json', JSON.stringify(result, null, 2), 'utf8');
    console.log('Done -', result.length, 'docs');
    await conn.close();
}
check().catch(console.error);
