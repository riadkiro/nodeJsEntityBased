require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/core_db'); // or saas_core, etc.
    const db = mongoose.connection.db;
    
    // just list all databases to be sure
    const adminDb = db.admin();
    const listDbs = await adminDb.listDatabases();
    console.log(listDbs.databases.map(db => db.name).filter(n => n.includes('9194') || n.includes('5001') || n.includes('saas')));
    
    console.log('Done.');
    process.exit(0);
}

run().catch(console.error);
