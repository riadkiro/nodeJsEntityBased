const mongoose = require('mongoose');

async function checkSelectFields() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_9194');
    await new Promise(r => conn.once('open', r));
    
    // Find all select-type field templates
    const fields = await conn.db.collection('fieldtemplates').find({
        type: 'select'
    }).toArray();
    
    console.log('Select fields found:', fields.length);
    fields.forEach(f => {
        console.log('---');
        console.log('Name:', f.name, '| Label:', f.label);
        console.log('type_config:', JSON.stringify(f.type_config, null, 2));
        console.log('Options type:', typeof f.type_config?.options?.[0]);
        if (f.type_config?.options?.length > 0) {
            console.log('First option:', JSON.stringify(f.type_config.options[0]));
        }
    });
    
    await conn.close();
}

checkSelectFields().catch(console.error);
