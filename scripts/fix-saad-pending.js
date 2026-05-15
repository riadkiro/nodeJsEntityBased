/**
 * One-time fix: Convert existing pendingInvites to grants for contact@belgawebsite.be
 * in account 9194 (Actirama/Cyberbox).
 */
const mongoose = require('mongoose');

async function fix() {
    const conn = await mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_9194', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    
    const RecordAccessSchema = require('../models/record-access.model').schema;
    const RecordAccess = conn.model('RecordAccess', RecordAccessSchema);
    
    // Find Saad's user ID
    const centralConn = mongoose.createConnection('mongodb://127.0.0.1:27017/saasDemo', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    await new Promise(r => centralConn.once('open', r));
    const user = await centralConn.db.collection('users').findOne({ email: 'contact@belgawebsite.be' });
    console.log('User found:', user ? user._id : 'NOT FOUND');
    
    if (!user) {
        console.error('User not found!');
        process.exit(1);
    }
    
    const userId = user._id.toString();
    const userEmail = 'contact@belgawebsite.be';
    
    // Find all pending invites for this email
    const pendingDocs = await RecordAccess.find({
        'pendingInvites.email': userEmail,
    });
    
    console.log(`Found ${pendingDocs.length} RecordAccess docs with pending invite for ${userEmail}`);
    
    for (const doc of pendingDocs) {
        const pending = doc.pendingInvites.find(p => p.email === userEmail);
        if (!pending) continue;
        
        console.log(`- Record: ${doc.recordId}`);
        console.log(`  Pending permissions:`, JSON.stringify(pending.permissions));
        
        // Check if grant already exists
        const alreadyGranted = doc.grants.some(
            g => g.granteeType === 'user' && g.granteeId === userId
        );
        
        if (!alreadyGranted) {
            doc.grants.push({
                granteeType: 'user',
                granteeId: userId,
                permissions: pending.permissions || { read: true },
                grantedBy: pending.invitedBy,
                grantedAt: new Date(),
            });
            console.log(`  ✅ Grant added`);
        } else {
            console.log(`  ⚠️  Grant already exists`);
        }
        
        // Remove from pendingInvites
        doc.pendingInvites = doc.pendingInvites.filter(p => p.email !== userEmail);
        await doc.save();
        console.log(`  ✅ Pending invite removed`);
    }
    
    console.log('\nDone!');
    await conn.close();
    await centralConn.close();
    process.exit(0);
}

fix().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
