const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function resetPasswords() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saasDemo?directConnection=true');
    await new Promise(r => conn.once('open', r));
    
    const hashedPwd = await bcrypt.hash('test', 10);
    
    const emails = ['sophie.martin@actirama.com', 'marc.dubois@actirama.com', 'julie.moreau@actirama.com'];
    
    for (const email of emails) {
        const result = await conn.db.collection('users').updateOne(
            { email },
            { $set: { password: hashedPwd } }
        );
        console.log(`${email}: ${result.modifiedCount ? 'password reset to "test"' : 'not modified (already set or not found)'}`);
    }
    
    await conn.close();
}

resetPasswords().catch(e => { console.error(e); process.exit(1); });
