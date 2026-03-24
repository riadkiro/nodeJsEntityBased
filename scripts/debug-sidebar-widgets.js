const mongoose = require('mongoose');
const fs = require('fs');

async function main() {
    const dbName = 'saas_app_rb_9194';
    const conn = mongoose.createConnection(`mongodb://127.0.0.1:27017/${dbName}`);
    await new Promise(r => conn.once('open', r));

    // Get the LineSchema for treatments
    const schema = await conn.db.collection('lineschemas').findOne({
        _id: new mongoose.Types.ObjectId('69c232cd0fa7abd357abd677')
    });
    
    const out = [];
    out.push('=== LINE SCHEMA ===');
    out.push(JSON.stringify(schema, null, 2));

    // Also check what gridSchemas the entity has
    const entity = await conn.db.collection('entities').findOne({
        _id: new mongoose.Types.ObjectId('69c232cd0fa7abd357abd651')
    });
    out.push('\n=== ENTITY GRID SCHEMAS ===');
    out.push(JSON.stringify(entity.gridSchemas, null, 2));
    out.push('\n=== ENTITY sidebarWidgets ===');
    out.push(JSON.stringify(entity.sidebarWidgets, null, 2));

    await conn.close();
    fs.writeFileSync('C:/tmp/schema-detail.txt', out.join('\n'), 'utf-8');
    console.log('Done');
}
main().catch(e => { console.error(e); process.exit(1); });
