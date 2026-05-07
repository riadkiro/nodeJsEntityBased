const mongoose = require('mongoose');

async function check() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));

    // Check entities collection for 'events'
    const entity = await conn.db.collection('entities').findOne({ slug: 'events' });
    if (entity) {
        console.log('=== EVENTS ENTITY FOUND ===');
        console.log('_id:', entity._id);
        console.log('name:', entity.name);
        console.log('slug:', entity.slug);
        console.log('isSystem:', entity.isSystem);
        console.log('icon:', entity.icon);
        console.log('color:', entity.color);
        console.log('customFields count:', (entity.customFields || []).length);
        console.log('customFields:', JSON.stringify(entity.customFields));
        console.log('statusClassification:', entity.statusClassification);
        console.log('classifications:', JSON.stringify(entity.classifications));
        console.log('relations:', JSON.stringify(entity.relations, null, 2));

        // Get the field templates
        if (entity.customFields && entity.customFields.length > 0) {
            const fields = await conn.db.collection('fieldtemplates').find({
                _id: { $in: entity.customFields }
            }).toArray();
            console.log('\n=== FIELD TEMPLATES ===');
            fields.forEach(f => {
                console.log(`  ${f.name} (${f.type}) - ${f.label} [${f._id}]`);
            });
        }

        // Get status classification
        if (entity.statusClassification) {
            const cls = await conn.db.collection('classifications').findOne({ _id: entity.statusClassification });
            if (cls) {
                console.log('\n=== STATUS CLASSIFICATION ===');
                console.log('name:', cls.name);
                console.log('options:', JSON.stringify(cls.options, null, 2));
            }
        }

        // Get classifications
        if (entity.classifications && entity.classifications.length > 0) {
            const clss = await conn.db.collection('classifications').find({
                _id: { $in: entity.classifications }
            }).toArray();
            console.log('\n=== CLASSIFICATIONS ===');
            clss.forEach(c => {
                console.log(`  ${c.name} [${c._id}]`);
                console.log('  options:', JSON.stringify(c.options, null, 2));
            });
        }

        // Count events records
        const eventCount = await conn.db.collection('records').countDocuments({ entityId: entity._id });
        console.log('\n=== EVENT RECORDS COUNT ===', eventCount);

        // Show some sample events
        if (eventCount > 0) {
            const samples = await conn.db.collection('records').find({ entityId: entity._id }).limit(3).toArray();
            console.log('\n=== SAMPLE EVENTS ===');
            samples.forEach(s => {
                console.log(`  ${s.title} | date: ${s.date} | relations: ${JSON.stringify(s.relations)}`);
            });
        }
    } else {
        console.log('No events entity found');
    }

    await conn.close();
    process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
