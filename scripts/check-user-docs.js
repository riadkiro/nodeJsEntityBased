/**
 * Check user DB and document matching
 */
const mongoose = require('mongoose');

(async () => {
    // Try global DB
    const globalConn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => globalConn.once('open', r));
    
    // List all users
    const users = await globalConn.db.collection('users').find({}).toArray();
    console.log('Users in global DB:', users.length);
    users.forEach(u => console.log(`  ${u._id} - ${u.email}`));
    
    // Check tenant DB for user
    const tenantConn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    await new Promise(r => tenantConn.once('open', r));
    
    const tenantUsers = await tenantConn.db.collection('users').find({}).toArray();
    console.log('\nUsers in tenant 5096 DB:', tenantUsers.length);
    tenantUsers.forEach(u => console.log(`  ${u._id} - ${u.email}`));
    
    // Count ALL documents in tenant DB
    const allDocs = await tenantConn.db.collection('documents').find({
        isTemplate: false,
        'uploadedFile.path': { $exists: false }
    }).toArray();
    console.log('\nAll non-template docs (no createdBy filter):', allDocs.length);
    
    // Show unique createdBy values
    const createdBySet = new Set(allDocs.map(d => d.createdBy?.toString()));
    console.log('Unique createdBy values:', [...createdBySet]);

    await globalConn.close();
    await tenantConn.close();
})();
