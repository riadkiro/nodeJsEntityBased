const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = 'C:/Users/pc/Documents/mongodb_backup_2026-05-21';
const MONGO_URI = 'mongodb://127.0.0.1:27017';

async function backup() {
    const conn = await mongoose.createConnection(MONGO_URI).asPromise();
    const adminDb = conn.db.admin();
    
    // List all databases
    const { databases } = await adminDb.listDatabases();
    const dbNames = databases
        .map(d => d.name)
        .filter(n => !['admin', 'local', 'config'].includes(n));
    
    console.log(`Found ${dbNames.length} databases to backup:`, dbNames);
    
    for (const dbName of dbNames) {
        const db = conn.useDb(dbName);
        const collections = await db.db.listCollections().toArray();
        
        const dbDir = path.join(BACKUP_DIR, dbName);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }
        
        for (const col of collections) {
            const colName = col.name;
            try {
                const docs = await db.db.collection(colName).find({}).toArray();
                const filePath = path.join(dbDir, `${colName}.json`);
                fs.writeFileSync(filePath, JSON.stringify(docs, null, 2));
                console.log(`  ✅ ${dbName}/${colName} — ${docs.length} docs`);
            } catch (err) {
                console.error(`  ❌ ${dbName}/${colName} — ${err.message}`);
            }
        }
    }
    
    await conn.close();
    console.log(`\n🎉 Backup complete → ${BACKUP_DIR}`);
}

backup().catch(err => {
    console.error('Backup failed:', err);
    process.exit(1);
});
