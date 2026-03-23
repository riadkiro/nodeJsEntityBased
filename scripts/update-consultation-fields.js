const mongoose = require('mongoose');

async function main() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));
    
    const db = conn.db;
    
    // 1. Find the Symptômes entity to get its ID
    const symptomeEntity = await db.collection('entities').findOne({ slug: 'symptomes' });
    if (!symptomeEntity) {
        console.error('❌ Entity "symptomes" not found');
        await conn.close();
        return;
    }
    console.log('Found Symptômes entity:', symptomeEntity._id, symptomeEntity.name);
    
    // 2. Create (or update) a custom field of type 'relation' pointing to Symptômes
    let symptomesField = await db.collection('fieldtemplates').findOne({ name: 'symptomes_rel' });
    
    if (!symptomesField) {
        const result = await db.collection('fieldtemplates').insertOne({
            name: 'symptomes_rel',
            label: 'Symptômes',
            type: 'relation',
            type_config: {
                refEntity: symptomeEntity._id.toString(),
                multiple: true
            },
            ui: {
                icon: 'solar:heart-pulse-bold-duotone',
                width: 'full'
            },
            createdAt: new Date(),
            updatedAt: new Date()
        });
        symptomesField = { _id: result.insertedId };
        console.log('✅ Created field template "symptomes_rel":', symptomesField._id);
    } else {
        await db.collection('fieldtemplates').updateOne(
            { _id: symptomesField._id },
            { $set: {
                label: 'Symptômes',
                type: 'relation',
                'type_config.refEntity': symptomeEntity._id.toString(),
                'type_config.multiple': true,
                'ui.icon': 'solar:heart-pulse-bold-duotone'
            }}
        );
        console.log('✅ Field template "symptomes_rel" already exists, updated:', symptomesField._id);
    }
    
    // 3. Add this field to the Consultation entity's customFields
    const consultEntity = await db.collection('entities').findOne({ slug: 'consultations' });
    if (!consultEntity) {
        console.error('❌ Entity "consultations" not found');
        await conn.close();
        return;
    }
    
    const currentFields = consultEntity.customFields || [];
    const alreadyHas = currentFields.some(fId => fId.toString() === symptomesField._id.toString());
    
    if (!alreadyHas) {
        currentFields.push(symptomesField._id);
        await db.collection('entities').updateOne(
            { _id: consultEntity._id },
            { $set: { customFields: currentFields } }
        );
        console.log('✅ Added symptomes_rel field to Consultation customFields');
    } else {
        console.log('✅ symptomes_rel already in Consultation customFields');
    }
    
    console.log('Final customFields count:', currentFields.length);
    
    await conn.close();
    console.log('\n✅ Done!');
}

main().catch(err => { console.error(err); process.exit(1); });
