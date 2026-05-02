const mongoose = require('mongoose');
const dbConfig = require('../config/db');

async function main() {
    const conn = mongoose.createConnection(dbConfig.uri + 'saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));
    const db = conn.db;

    // Find all direct DMs (not record-scoped)
    const dms = await db.collection('conversations').find({ type: 'direct', recordId: null }).toArray();
    console.log(`Found ${dms.length} DMs total`);

    // Group by participant pair
    const groups = {};
    for (const dm of dms) {
        const ids = (dm.participants || []).map(p => p.userId).sort().join('|');
        if (!groups[ids]) groups[ids] = [];
        groups[ids].push(dm);
    }

    // Delete duplicates (keep oldest)
    for (const [key, group] of Object.entries(groups)) {
        if (group.length > 1) {
            group.sort((a, b) => a.createdAt - b.createdAt); // oldest first
            for (let i = 1; i < group.length; i++) {
                await db.collection('conversations').deleteOne({ _id: group[i]._id });
                console.log(`Deleted duplicate DM: ${group[i]._id}`);
            }
        }
    }

    await conn.close();
    console.log('Done!');
}
main().catch(e => { console.error(e); process.exit(1); });
