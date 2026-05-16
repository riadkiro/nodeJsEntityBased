const mongoose = require('mongoose');

async function checkMargins() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));
    
    // Find recent documents
    const docs = await conn.db.collection('documents').find({}).sort({ updatedAt: -1 }).limit(3).project({ name: 1, margins: 1, dimensions: 1, format: 1, orientation: 1 }).toArray();
    
    console.log('Recent documents:');
    docs.forEach(d => {
        console.log(`  ${d.name}: margins=${JSON.stringify(d.margins)}, format=${d.format}, orientation=${d.orientation}, dims=${JSON.stringify(d.dimensions)}`);
    });
    
    await conn.close();
}

checkMargins().catch(console.error);
