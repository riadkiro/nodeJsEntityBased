const mongoose = require('mongoose');

async function cleanPrefs() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_9194');
    await new Promise(r => conn.once('open', r));
    
    // Delete all fiche-related preferences (stale test data)
    const result = await conn.db.collection('userpreferences').deleteMany({
        viewId: { $regex: /^fiche-|_fiche$/ }
    });
    
    console.log('Deleted', result.deletedCount, 'stale fiche preference records');
    await conn.close();
}

cleanPrefs().catch(console.error);
