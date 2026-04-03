const mongoose = require('mongoose');
const fs = require('fs');

async function check() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_7846');
    await new Promise(r => conn.once('open', r));
    
    // Check records
    const recordIds = ['69ce60dc52c96f71dd936a5a', '69ce60dc52c96f71dd936a3b'];
    const records = await conn.db.collection('records').find({ 
        _id: { $in: recordIds.map(id => new mongoose.Types.ObjectId(id)) }
    }).project({ title: 1, entityId: 1 }).toArray();
    
    // Check template
    const tpl = await conn.db.collection('documents').findOne({ 
        _id: new mongoose.Types.ObjectId('69ce60dd52c96f71dd936ae7')
    }, { projection: { name: 1, entityId: 1, entityIds: 1 } });
    
    const result = { records: records.map(r => ({ _id: r._id.toString(), title: r.title, entityId: r.entityId?.toString() })), template: tpl ? { name: tpl.name, entityId: tpl.entityId?.toString(), entityIds: (tpl.entityIds || []).map(e => e.toString()) } : null };
    
    fs.writeFileSync('scripts/docs-output.json', JSON.stringify(result, null, 2), 'utf8');
    console.log('Done');
    await conn.close();
}
check().catch(console.error);
