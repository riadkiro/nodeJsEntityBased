const mongoose = require('mongoose');
const fs = require('fs');

async function verify() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_9194');
    await new Promise(r => conn.once('open', r));

    const output = [];

    // List all entities
    const entities = await conn.db.collection('entitys').find({}).project({ name: 1, slug: 1 }).toArray();
    output.push('=== All Entities ===');
    entities.forEach(e => output.push('  ' + e._id.toString() + ' | ' + e.name + ' | ' + e.slug));

    // List all line schemas
    const schemas = await conn.db.collection('lineschemas').find({}).project({ name: 1, slug: 1, sourceEntityId: 1, columns: 1 }).toArray();
    output.push('\n=== All LineSchemas ===');
    schemas.forEach(s => {
        const srcEntity = entities.find(e => e._id.toString() === s.sourceEntityId?.toString());
        output.push('  ' + s._id.toString() + ' | ' + s.name + ' | src: ' + (srcEntity?.name || s.sourceEntityId?.toString() || 'none'));
        (s.columns || []).forEach(c => {
            output.push('    - ' + c.key + ' (' + c.type + ') ' + (c.label || ''));
            if (c.config?.options?.length > 0) {
                output.push('      options: ' + JSON.stringify(c.config.options.slice(0, 5).map(o => typeof o === 'string' ? o : (o.value || o.label))));
            }
        });
    });

    // Find treatments (looking for 'traitement' in entity names)
    const treatmentEntity = entities.find(e => e.name?.toLowerCase().includes('traitement') || e.slug?.toLowerCase().includes('traitement'));
    if (treatmentEntity) {
        output.push('\n=== Treatment Entity Found ===');
        output.push('  ' + treatmentEntity._id.toString() + ' | ' + treatmentEntity.name + ' | ' + treatmentEntity.slug);

        // Find records
        const records = await conn.db.collection('records').find({
            entityId: treatmentEntity._id
        }).project({ title: 1, lineDefaults: 1 }).limit(5).toArray();
        output.push('\n=== Treatment Records ===');
        records.forEach(r => {
            output.push('  ' + r.title + ' | lineDefaults: ' + JSON.stringify(r.lineDefaults || []));
        });
    }

    fs.writeFileSync('tmp/verify_9194.txt', output.join('\n'), 'utf8');
    console.log('Written to tmp/verify_9194.txt');
    await conn.close();
}

verify().catch(console.error);
