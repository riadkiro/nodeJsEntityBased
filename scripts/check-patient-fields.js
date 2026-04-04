const mongoose = require('mongoose');

async function main() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));

    // Get the patients entity
    const entity = await conn.db.collection('entities').findOne({ slug: 'patients' });
    if (!entity) { console.log('No patients entity found'); return; }
    console.log('Patients entity:', entity._id, entity.name);

    // Get field templates for this entity
    const fieldIds = (entity.customFields || []).map(f => f);
    console.log('customField IDs:', fieldIds);

    const fields = await conn.db.collection('fieldtemplates').find({
        _id: { $in: fieldIds }
    }).toArray();
    
    console.log(`\nPatient fields (${fields.length}):`);
    for (const f of fields) {
        console.log(`  ${f.name} (${f.label || ''}) -> type: ${f.type}`);
    }

    // Check a record to see the custom field values
    const record = await conn.db.collection('records').findOne({
        entityId: entity._id
    });
    if (record) {
        console.log(`\nSample record: ${record.title || record.computedTitle}`);
        console.log('customFields type:', Array.isArray(record.customFields) ? 'array' : typeof record.customFields);
        if (Array.isArray(record.customFields)) {
            for (const cf of record.customFields.slice(0, 10)) {
                const fd = fields.find(f => f._id.toString() === cf.field_id?.toString());
                console.log(`  ${fd?.name || cf.field_id}: "${cf.value}"`);
            }
        }
    }

    await conn.close();
}

main().catch(console.error);
