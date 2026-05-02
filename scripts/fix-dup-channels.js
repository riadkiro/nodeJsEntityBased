const mongoose = require('mongoose');
const dbConfig = require('../config/db');

async function main() {
    const conn = mongoose.createConnection(dbConfig.uri + 'saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));
    const db = conn.db;

    // Find duplicate "# annonces" channels
    const convs = await db.collection('conversations').find({ name: '# annonces', type: 'group', recordId: null }).toArray();
    console.log(`Found ${convs.length} "# annonces" channels`);

    if (convs.length > 1) {
        // Keep the first, delete the rest
        for (let i = 1; i < convs.length; i++) {
            await db.collection('conversations').deleteOne({ _id: convs[i]._id });
            console.log(`Deleted duplicate: ${convs[i]._id}`);
        }
    }

    await conn.close();
    console.log('Done!');
}
main().catch(e => { console.error(e); process.exit(1); });
