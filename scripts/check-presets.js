const mongoose = require('mongoose');
async function run() {
    const admin = mongoose.createConnection('mongodb://127.0.0.1:27017/admin');
    await new Promise(r => admin.once('open', r));
    const adminDb = admin.db.admin();
    const dbs = await adminDb.listDatabases();
    const tenantDbs = dbs.databases.filter(d => d.name.includes('9194') || d.name.includes('saas'));
    await admin.close();

    for (const db of tenantDbs) {
        const conn = mongoose.createConnection(`mongodb://127.0.0.1:27017/${db.name}`);
        await new Promise(r => conn.once('open', r));
        const count = await conn.db.collection('gridschematemplates').countDocuments().catch(() => 0);
        if (count > 0) {
            console.log(`DB: ${db.name} => ${count} template(s)`);
            const docs = await conn.db.collection('gridschematemplates').find({}).toArray();
            docs.forEach(t => console.log(`  name="${t.name}" scope="${t.scope}" rows=${(t.presetRows||[]).length}`));
        }
        await conn.close();
    }
    process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
