/**
 * Quick check: Does the file actually exist at the expected private_uploads path?
 */
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5096', { useNewUrlParser: true });
    const records = await mongoose.connection.db.collection('records').find(
        { 'attachments.0': { $exists: true } }
    ).limit(3).toArray();
    
    for (const record of records) {
        console.log(`\nRecord: ${record.title || record._id}`);
        for (const att of (record.attachments || []).slice(0, 3)) {
            const privatePath = path.join(__dirname, '..', 'private_uploads', 'attachments', '5096', att.filename);
            const publicPath = path.join(__dirname, '..', 'public', 'uploads', 'attachments', '5096', att.filename);
            const privateExists = fs.existsSync(privatePath);
            const publicExists = fs.existsSync(publicPath);
            console.log(`  ${att.originalName} → DB filename: "${att.filename}"`);
            console.log(`    private: ${privateExists ? '✅ EXISTS' : '❌ NOT FOUND'} → ${privatePath}`);
            console.log(`    public:  ${publicExists ? '⚠️  STILL HERE' : '✅ GONE'} → ${publicPath}`);
        }
    }
    await mongoose.connection.close();
}

main().catch(console.error);
