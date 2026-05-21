const mongoose = require('mongoose');
const dbConfig = require('../config/db');

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    console.log('Connected to saas_app_rb_5096.');
    
    const db = mongoose.connection.db;
    const files = await db.collection('drivefiles').find({ folder: 'Factures/Ventes' }).toArray();
    console.log('Files in Factures/Ventes:', files.length);
    if (files.length > 0) {
        files.forEach(f => {
            console.log(`- ${f.filename} | ${f.originalName} | ${f.mimeType}`);
        });
    }

    const allDriveFiles = await db.collection('drivefiles').find({}).toArray();
    console.log('All drivefiles:', allDriveFiles.length);

    await mongoose.disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
