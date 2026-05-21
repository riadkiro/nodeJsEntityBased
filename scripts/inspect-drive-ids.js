const mongoose = require('mongoose');

async function check() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    await new Promise(r => conn.once('open', r));
    
    const Record = conn.model('Record', new mongoose.Schema({}, { strict: false }));
    const Entity = conn.model('Entity', new mongoose.Schema({}, { strict: false }));
    
    const entities = await Entity.find({}).lean();
    console.log('Entities:');
    entities.forEach(e => {
        console.log(`- name: ${e.name}, _id: ${e._id}`);
    });
    
    const records = await Record.find({}).lean();
    console.log('\nRecords:');
    records.forEach(r => {
        console.log(`- computedTitle: ${r.computedTitle || r.title}, _id: ${r._id}, entityId: ${r.entityId}`);
    });
    
    await conn.close();
}
check().catch(e => console.error(e));
