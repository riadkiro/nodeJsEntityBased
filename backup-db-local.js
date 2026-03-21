const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGO_URI = 'mongodb://127.0.0.1:27017';
const date = new Date().toISOString().slice(0, 10);
const BACKUP_DIR = path.join(__dirname, 'db_backup', date);

async function backup() {
    console.log(`\n📦 Starting MongoDB backup...`);
    console.log(`📂 Backup directory: ${BACKUP_DIR}\n`);

    const conn = mongoose.createConnection(MONGO_URI);
    await new Promise(r => conn.once('open', r));

    const admin = conn.db.admin();
    const { databases } = await admin.listDatabases();

    const skipDbs = ['admin', 'config', 'local'];
    let totalDocs = 0;
    let totalCollections = 0;

    for (const dbInfo of databases) {
        if (skipDbs.includes(dbInfo.name)) continue;

        const dbDir = path.join(BACKUP_DIR, dbInfo.name);
        if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

        const db = conn.client.db(dbInfo.name);
        const collections = await db.listCollections().toArray();

        console.log(`\n🗄️  Database: ${dbInfo.name} (${collections.length} collections)`);

        for (const col of collections) {
            try {
                const data = await db.collection(col.name).find({}).toArray();
                const filePath = path.join(dbDir, `${col.name}.json`);
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                console.log(`  ✓ ${col.name} (${data.length} docs)`);
                totalDocs += data.length;
                totalCollections++;
            } catch (e) {
                console.error(`  ✗ ${col.name}: ${e.message}`);
            }
        }
    }

    await conn.close();
    console.log(`\n✅ Backup complete!`);
    console.log(`   📊 ${totalCollections} collections, ${totalDocs} documents total`);
    console.log(`   📂 ${BACKUP_DIR}\n`);
}

backup().catch(e => { console.error(e); process.exit(1); });
