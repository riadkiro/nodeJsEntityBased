const mongoose = require('mongoose');
const fs = require('fs');

async function main() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_7846');
    await new Promise(r => conn.once('open', r));
    
    // Find a Patient record and its entity to see its customFields structure
    const entities = await conn.db.collection('entities').find({}).toArray();
    const patientEntity = entities.find(e => e.slug === 'patients');
    
    const results = [];
    results.push('=== PATIENT ENTITY ===');
    results.push('ID: ' + patientEntity?._id);
    results.push('Slug: ' + patientEntity?.slug);
    results.push('CustomFields: ' + JSON.stringify(patientEntity?.customFields?.slice(0, 5), null, 2));
    
    // Get field templates for this entity
    const fieldTemplates = await conn.db.collection('fieldtemplates').find({ 
        entityId: patientEntity?._id 
    }).toArray();
    
    results.push('\n=== FIELD TEMPLATES ===');
    for (const ft of fieldTemplates) {
        results.push(`  ID: ${ft._id} | Label: ${ft.label} | Key: ${ft.key || ft.slug || '(no key)'} | Type: ${ft.type}`);
    }
    
    // Get a patient record to see its customFields value structure
    const record = await conn.db.collection('records').findOne({ entityId: patientEntity?._id });
    results.push('\n=== SAMPLE PATIENT RECORD ===');
    results.push('Title: ' + (record?.computedTitle || record?.title));
    results.push('CustomFields: ' + JSON.stringify(record?.customFields, null, 2));
    
    fs.writeFileSync('scripts/patient-fields-output.txt', results.join('\n'));
    console.log('Done');
    
    await conn.close();
}

main().catch(console.error);
