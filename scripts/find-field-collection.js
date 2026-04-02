const mongoose = require('mongoose');
const fs = require('fs');

async function main() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_7846');
    await new Promise(r => conn.once('open', r));
    
    // List all collections
    const collections = await conn.db.listCollections().toArray();
    const results = [];
    for (const c of collections) {
        if (c.name.includes('field') || c.name.includes('Field')) {
            const count = await conn.db.collection(c.name).countDocuments();
            results.push(`Collection: ${c.name} (${count} docs)`);
        }
    }
    
    // Try the ones that look like field definitions
    const fieldCollNames = collections.map(c => c.name).filter(n => 
        n.includes('field') || n.includes('Field')
    );
    
    for (const name of fieldCollNames) {
        const sample = await conn.db.collection(name).findOne({ _id: new mongoose.Types.ObjectId('69cda85e738ff763a64801e8') });
        if (sample) {
            results.push(`\nFound in ${name}: ${JSON.stringify(sample, null, 2)}`);
        }
    }
    
    // Also try by looking up the field ID directly
    for (const c of collections) {
        const sample = await conn.db.collection(c.name).findOne({ _id: new mongoose.Types.ObjectId('69cda85e738ff763a64801e8') });
        if (sample) {
            results.push(`\nField found in collection '${c.name}': ${JSON.stringify(sample, null, 2)}`);
        }
    }
    
    fs.writeFileSync('scripts/field-collection-output.txt', results.join('\n'));
    console.log('Done');
    
    await conn.close();
}

main().catch(console.error);
