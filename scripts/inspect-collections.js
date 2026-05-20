const mongoose = require('mongoose');

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in saas_app_rb_5096:');
    collections.forEach(c => console.log('-', c.name));
    
    // Check smartdoctemplates
    const sdtCollection = mongoose.connection.db.collection('smartdoctemplates');
    const docs = await sdtCollection.find({}).toArray();
    console.log('\nSmartDocTemplates:');
    console.log(docs);
    
    await mongoose.connection.close();
}

run().catch(console.error);
