/**
 * Fix records with UUID field_ids (not valid ObjectIds)
 * These cause CastError when Mongoose tries to query them
 */
const mongoose = require('mongoose');

async function main() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));
    const db = conn.db;

    // Find records with non-ObjectId field_ids in customFields
    const records = await db.collection('records').find({
        'customFields.field_id': { $exists: true }
    }).toArray();

    let fixed = 0;
    for (const rec of records) {
        if (!rec.customFields) continue;
        const badFields = rec.customFields.filter(cf => {
            const id = cf.field_id?.toString();
            // Valid ObjectId = 24 hex chars
            return id && !/^[0-9a-fA-F]{24}$/.test(id);
        });

        if (badFields.length > 0) {
            console.log(`Record ${rec._id} "${rec.title}" has ${badFields.length} bad field_id(s):`);
            badFields.forEach(cf => console.log(`  - ${cf.field_id}`));

            // Remove the bad entries
            const cleanFields = rec.customFields.filter(cf => {
                const id = cf.field_id?.toString();
                return id && /^[0-9a-fA-F]{24}$/.test(id);
            });

            await db.collection('records').updateOne(
                { _id: rec._id },
                { $set: { customFields: cleanFields } }
            );
            fixed++;
        }
    }

    console.log(`\nFixed ${fixed} records (removed non-ObjectId field_ids)`);
    await conn.close();
}

main().catch(e => { console.error(e); process.exit(1); });
