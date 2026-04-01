const mongoose = require('mongoose');
const fs = require('fs');

async function fix(accountNumber) {
    const conn = mongoose.createConnection(`mongodb://127.0.0.1:27017/saas_app_rb_${accountNumber}`);
    await new Promise(r => conn.once('open', r));

    const db = conn.db;
    const log = [`=== Account ${accountNumber} ===`];

    const actesEntity = await db.collection('entities').findOne({ slug: 'actes' });
    if (!actesEntity) {
        log.push('No Actes entity found, skipping');
        await conn.close();
        return log;
    }

    const fieldIds = (actesEntity.customFields || []).map(id => {
        try { return new mongoose.Types.ObjectId(id); } catch(e) { return null; }
    }).filter(Boolean);

    const fields = await db.collection('fieldtemplates').find({ _id: { $in: fieldIds } }).toArray();
    const fieldMap = {};
    for (const f of fields) {
        if (f.name) fieldMap[f.name] = f._id.toString();
    }
    log.push('Field map: ' + JSON.stringify(fieldMap));

    if (!fieldMap.code || !fieldMap.prix || !fieldMap.tva) {
        log.push('Missing fields, skipping');
        await conn.close();
        return log;
    }

    const allSchemas = await db.collection('lineschemas').find({}).toArray();
    let updated = 0;

    for (const schema of allSchemas) {
        const columns = schema.columns || [];
        let needsUpdate = false;

        const updatedColumns = columns.map(col => {
            if (col.type !== 'relation') return col;
            
            const targetEntity = col.config?.targetEntity;
            const isActes = targetEntity && targetEntity.toString() === actesEntity._id.toString();
            const isSource = schema.sourceEntityId && schema.sourceEntityId.toString() === actesEntity._id.toString();
            
            if (!isActes && !isSource) return col;
            if (col.key !== 'prestation' && col.key !== 'item') return col;

            log.push(`Schema "${schema.name}" (${schema._id}): OLD = ${JSON.stringify(col.config?.applyDefaults || {})}`);

            const newDefaults = {
                description: 'title',
                code: 'cf.' + fieldMap.code,
                unitPrice: 'cf.' + fieldMap.prix,
                vatRate: 'cf.' + fieldMap.tva
            };
            log.push(`  → NEW = ${JSON.stringify(newDefaults)}`);

            needsUpdate = true;
            return {
                ...col,
                config: {
                    ...(col.config || {}),
                    targetEntity: actesEntity._id,
                    applyDefaults: newDefaults
                }
            };
        });

        if (needsUpdate) {
            await db.collection('lineschemas').updateOne(
                { _id: schema._id },
                { $set: { columns: updatedColumns } }
            );
            updated++;
            log.push('  ✅ Updated!');
        }
    }

    log.push(`Updated ${updated} schemas`);
    await conn.close();
    return log;
}

async function main() {
    const allLogs = [];
    for (const acct of ['9194', '7846']) {
        const logs = await fix(acct);
        allLogs.push(...logs);
    }
    fs.writeFileSync('scripts/fix-results.json', JSON.stringify(allLogs, null, 2));
    console.log('Done! Check scripts/fix-results.json');
    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
