const mongoose = require('mongoose');
const fs = require('fs');

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_9194');
    const entity = await mongoose.connection.db.collection('entities').findOne({ name: 'Consultation' });
    const views = await mongoose.connection.db.collection('views').find({ entityId: entity._id, viewType: 'edit' }).toArray();
    let schemaIds = [];
    views.forEach(v => {
        if(v.tabLayout) {
             for (const tabData of Object.values(v.tabLayout)) {
                for (const block of (tabData.blocks || [])) {
                    if (block.type === 'dynamic-table' && block.config && block.config.schemaId) {
                        schemaIds.push(block.config.schemaId);
                    }
                }
             }
        }
    });

    let out = '';
    for(let sid of schemaIds) {
       const schemaEntity = await mongoose.connection.db.collection('entities').findOne({ _id: new mongoose.Types.ObjectId(sid) });
       if(schemaEntity) {
           out += "== SCHEMA " + schemaEntity.name + "\n";
           schemaEntity.columns.forEach(c => out += `${c.key} ${c._id} ${c.label}\n`);
       }
    }
    fs.writeFileSync('./out.txt', out);
    process.exit(0);
}
main();
