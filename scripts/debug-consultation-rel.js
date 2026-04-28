const mongoose = require('mongoose');

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5756');
    
    const record = await mongoose.connection.db.collection('records')
        .findOne({ _id: new mongoose.Types.ObjectId('69e9e4165ca57f4b82f92b9e') });
    
    console.log('Relations:');
    (record.relations || []).forEach(r => {
        console.log(`  Key: ${r.relationKey}`);
        console.log(`  Value: ${JSON.stringify(r.value)}`);
        console.log(`  Type: ${typeof r.value}, isArray: ${Array.isArray(r.value)}`);
        console.log('');
    });
    
    await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
