const mongoose = require('mongoose');

async function main() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));
    
    // Check UserPreferences for document-editor viewId
    const prefs = await conn.db.collection('userpreferences').find({ viewId: 'document-editor' }).toArray();
    console.log('=== UserPreferences for document-editor ===');
    console.log(JSON.stringify(prefs, null, 2));
    
    // Also check all viewIds to see what exists
    const allViewIds = await conn.db.collection('userpreferences').distinct('viewId');
    console.log('\n=== All viewIds ===');
    console.log(allViewIds);
    
    await conn.close();
}

main().catch(e => { console.error(e); process.exit(1); });
