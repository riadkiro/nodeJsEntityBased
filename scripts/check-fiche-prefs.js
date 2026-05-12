const mongoose = require('mongoose');

async function checkDirect() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_9194');
    await new Promise(r => conn.once('open', r));
    
    // Check the exact record
    const pref = await conn.db.collection('userpreferences').findOne({
        viewId: 'fiche-patients'
    });
    
    console.log('Full document:', JSON.stringify(pref, null, 2));
    console.log('\nPreferences keys:', Object.keys(pref.preferences || {}));
    console.log('Has ficheLayout?', !!pref.preferences?.ficheLayout);
    
    await conn.close();
}

checkDirect().catch(console.error);
