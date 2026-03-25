const mongoose = require('mongoose');
async function check() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));
    
    // Check if entity uses Mongoose model to pull gridSchemas
    const Entity = conn.model('Entity', new mongoose.Schema({}, { strict: false }), 'entities');
    const entity = await Entity.findOne({ name: { $regex: /patient/i } });
    
    console.log('gridSchemas via model:', JSON.stringify(entity.gridSchemas));
    
    // Check LineSchema collection  
    const lineSchemas = await conn.db.collection('lineschemas').find({}).toArray();
    console.log('LineSchema count:', lineSchemas.length);
    lineSchemas.forEach(ls => {
        console.log(`  id=${ls._id}, name=${ls.name}, entityId=${ls.entityId}`);
    });
    
    await conn.close();
    process.exit(0);
}
check();
