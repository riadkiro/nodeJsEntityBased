const mongoose = require('mongoose');
const fs = require('fs');

async function analyze() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_7846');
    await new Promise(r => conn.once('open', r));
    const db = conn.db;

    const fields = await db.collection('fieldtemplates').find({}).toArray();
    const log = [];
    
    log.push(`Total field templates: ${fields.length}`);
    
    // Group by name to find duplicates
    const byName = {};
    for (const f of fields) {
        const key = (f.name || f.label || 'UNNAMED').toLowerCase();
        if (!byName[key]) byName[key] = [];
        byName[key].push({
            _id: f._id.toString(),
            name: f.name,
            label: f.label,
            type: f.type || f.fieldType,
            preset: f.meta?.createdByPreset || 'none',
            isCustom: f.isCustom,
            isSystem: f.isSystem
        });
    }
    
    // Find duplicates
    const duplicates = {};
    for (const [key, items] of Object.entries(byName)) {
        if (items.length > 1) {
            duplicates[key] = items;
        }
    }
    
    log.push(`\nDuplicate groups: ${Object.keys(duplicates).length}`);
    for (const [key, items] of Object.entries(duplicates)) {
        log.push(`\n--- "${key}" (${items.length} copies) ---`);
        items.forEach(i => log.push(`  ${i._id} | name="${i.name}" label="${i.label}" type=${i.type} preset=${i.preset}`));
    }

    // Check which fields are referenced by entities
    const entities = await db.collection('entities').find({}).toArray();
    const referencedIds = new Set();
    for (const e of entities) {
        for (const cfId of (e.customFields || [])) {
            referencedIds.add(cfId.toString());
        }
    }
    
    // Check which fields are referenced by records
    const records = await db.collection('records').find({ 'customFields.field_id': { $exists: true } }).limit(100).toArray();
    for (const r of records) {
        for (const cf of (r.customFields || [])) {
            if (cf.field_id) referencedIds.add(cf.field_id.toString());
        }
    }
    
    log.push(`\nReferenced field IDs: ${referencedIds.size}`);
    
    // For each duplicate group, identify which are referenced and which are orphans
    log.push(`\n=== CLEANUP PLAN ===`);
    const toDelete = [];
    for (const [key, items] of Object.entries(duplicates)) {
        const referenced = items.filter(i => referencedIds.has(i._id));
        const orphans = items.filter(i => !referencedIds.has(i._id));
        
        log.push(`\n"${key}": ${referenced.length} referenced, ${orphans.length} orphans`);
        referenced.forEach(i => log.push(`  KEEP: ${i._id} (referenced)`));
        orphans.forEach(i => {
            log.push(`  DELETE: ${i._id} (orphan)`);
            toDelete.push(i._id);
        });
        
        // If all are referenced or all are orphans, keep the first one
        if (orphans.length === 0 && referenced.length > 1) {
            log.push(`  → All referenced! Keep first, delete rest`);
            for (let j = 1; j < referenced.length; j++) {
                toDelete.push(referenced[j]._id);
                log.push(`    DELETE: ${referenced[j]._id} (extra reference)`);
            }
        }
        if (referenced.length === 0 && orphans.length > 1) {
            log.push(`  → All orphans! Keep first, delete rest`);
            // Keep first orphan, remove from toDelete
            const keepId = orphans[0]._id;
            const idx = toDelete.indexOf(keepId);
            if (idx >= 0) toDelete.splice(idx, 1);
            log.push(`    KEEP: ${keepId}`);
        }
    }
    
    log.push(`\nTotal to delete: ${toDelete.length}`);
    log.push(`IDs: ${JSON.stringify(toDelete)}`);

    fs.writeFileSync('scripts/duplicates-analysis.json', JSON.stringify(log, null, 2));
    console.log('Done! Check scripts/duplicates-analysis.json');
    await conn.close();
    process.exit(0);
}

analyze().catch(e => { console.error(e); process.exit(1); });
