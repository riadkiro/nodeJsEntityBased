const mongoose = require('mongoose');
const fs = require('fs');

async function check() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_9194');
    await new Promise(r => conn.once('open', r));
    const Entity = conn.model('Entity', new mongoose.Schema({}, { strict: false }), 'entities');
    const consultations = await Entity.findOne({ slug: 'consultations' }).lean();
    fs.writeFileSync('c:/Users/pc/Documents/nodeJsProject/tmp/consultation_rels.json', JSON.stringify(consultations.relations, null, 2));
    await conn.close();
    process.exit(0);
}
check();
