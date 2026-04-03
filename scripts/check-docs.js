const mongoose = require('mongoose');
const fs = require('fs');

async function check() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_7846');
    await new Promise(r => conn.once('open', r));
    
    const entities = await conn.db.collection('entities').find({}).project({ name: 1, slug: 1, icon: 1, color: 1 }).toArray();
    const result = entities.map(e => ({ name: e.name, slug: e.slug, icon: e.icon, color: e.color || null }));
    
    fs.writeFileSync('scripts/docs-output.json', JSON.stringify(result, null, 2), 'utf8');
    console.log('Done -', result.length, 'entities');
    await conn.close();
}
check().catch(console.error);
