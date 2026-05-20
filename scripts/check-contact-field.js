const mongoose = require('mongoose');

async function main() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    await new Promise(r => conn.once('open', r));
    const db = conn.db;

    // Check the Contact field's name property (this is what's used as key)
    const fieldId = '6a0d430f50eb2c274592e436'; // Contact field
    const field = await db.collection('fieldtemplates').findOne({ _id: new mongoose.Types.ObjectId(fieldId) });
    
    console.log('Contact field:');
    console.log('  _id:', field._id);
    console.log('  name:', field.name);
    console.log('  label:', field.label);
    console.log('  type:', field.type);
    console.log('  type_config:', JSON.stringify(field.type_config));
    
    // Check all relation-type fields for entreprises
    const entity = await db.collection('entities').findOne({ slug: 'entreprises' });
    const fieldIds = (entity.customFields || []).map(id => typeof id === 'object' ? id : new mongoose.Types.ObjectId(id));
    const allFields = await db.collection('fieldtemplates').find({ _id: { $in: fieldIds } }).toArray();
    
    console.log('\nAll relation fields for entreprises:');
    allFields.filter(f => f.type === 'relation').forEach(f => {
        console.log(`  name: "${f.name}", label: "${f.label}", refEntity: ${f.type_config?.refEntity}`);
    });
    
    // Check the related record (Luc Bernard / Marie Dubois) to see their custom fields
    const recordId = new mongoose.Types.ObjectId('6a0b4221f1c5ddd28f737c99');
    const record = await db.collection('records').findOne({ _id: recordId });
    
    console.log('\nRecord relations:');
    (record.relations || []).forEach(r => {
        console.log(`  relationKey: ${r.relationKey}, value: ${JSON.stringify(r.value)}`);
    });
    
    // For each relation value, check the related record's custom fields
    for (const rel of (record.relations || [])) {
        const relField = allFields.find(f => f._id.toString() === rel.relationKey);
        if (!relField || relField.type !== 'relation') continue;
        
        const relatedId = Array.isArray(rel.value) ? rel.value[0] : rel.value;
        if (!relatedId) continue;
        
        const relatedRecord = await db.collection('records').findOne({ _id: new mongoose.Types.ObjectId(relatedId) });
        if (!relatedRecord) continue;
        
        console.log(`\nRelated record for "${relField.label}": ${relatedRecord.title}`);
        console.log('  customFields:');
        
        // Get the target entity's fields
        const targetEntity = await db.collection('entities').findOne({ _id: new mongoose.Types.ObjectId(relField.type_config?.refEntity) });
        const targetFieldIds = (targetEntity?.customFields || []).map(id => typeof id === 'object' ? id : new mongoose.Types.ObjectId(id));
        const targetFields = await db.collection('fieldtemplates').find({ _id: { $in: targetFieldIds } }).toArray();
        
        (relatedRecord.customFields || []).forEach(cf => {
            const fid = (cf.field_id?._id || cf.field_id || '').toString();
            const fDef = targetFields.find(f => f._id.toString() === fid);
            console.log(`    ${fDef?.name || fid}: "${cf.value}"`);
        });
    }
    
    await conn.close();
}

main().catch(e => { console.error(e); process.exit(1); });
