/**
 * Delete orphaned field templates from both accounts
 * These are fields not referenced by any entity
 */

const mongoose = require('mongoose');
const fs = require('fs');

async function cleanup(accountNumber) {
    const conn = mongoose.createConnection(`mongodb://127.0.0.1:27017/saas_app_rb_${accountNumber}`);
    await new Promise(r => conn.once('open', r));
    const db = conn.db;
    const log = [`=== Account ${accountNumber} ===`];

    const allFields = await db.collection('fieldtemplates').find({}).toArray();
    log.push(`Total fields before: ${allFields.length}`);

    // Get all referenced field IDs
    const entities = await db.collection('entities').find({}).toArray();
    const referencedIds = new Set();
    for (const e of entities) {
        for (const cfId of (e.customFields || [])) {
            referencedIds.add(cfId.toString());
        }
    }
    // Also check records
    const records = await db.collection('records').find({ 'customFields.field_id': { $exists: true } }).limit(1000).toArray();
    for (const r of records) {
        for (const cf of (r.customFields || [])) {
            if (cf.field_id) referencedIds.add(cf.field_id.toString());
        }
    }
    // Also check lineschemas
    const schemas = await db.collection('lineschemas').find({}).toArray();
    for (const s of schemas) {
        for (const col of (s.columns || [])) {
            const ad = col.config?.applyDefaults || {};
            for (const [, v] of Object.entries(ad)) {
                if (typeof v === 'string' && v.startsWith('cf.')) {
                    referencedIds.add(v.replace('cf.', ''));
                }
            }
        }
    }

    // Find orphans
    const orphanIds = [];
    for (const f of allFields) {
        if (!referencedIds.has(f._id.toString())) {
            log.push(`  DELETE: ${f._id} name="${f.name}" label="${f.label}"`);
            orphanIds.push(f._id);
        }
    }

    if (orphanIds.length > 0) {
        const result = await db.collection('fieldtemplates').deleteMany({ _id: { $in: orphanIds } });
        log.push(`Deleted ${result.deletedCount} orphans`);
    } else {
        log.push('No orphans found');
    }

    const remaining = await db.collection('fieldtemplates').countDocuments();
    log.push(`Total fields after: ${remaining}`);

    await conn.close();
    return log;
}

async function main() {
    const allLogs = [];
    for (const acct of ['9194', '7846']) {
        const logs = await cleanup(acct);
        allLogs.push(...logs);
    }
    fs.writeFileSync('scripts/cleanup-results.json', JSON.stringify(allLogs, null, 2));
    console.log('Done! Check scripts/cleanup-results.json');
    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
