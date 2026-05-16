/**
 * Debug script to identify the bug on the patients list page
 */
const mongoose = require('mongoose');

async function main() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_9194');
    await new Promise(r => conn.once('open', r));
    
    // Check if patients entity exists
    const entities = await conn.db.collection('entities').find({ slug: 'patients' }).toArray();
    console.log('\n=== Patients Entity ===');
    if (entities.length === 0) {
        console.log('ERROR: No entity with slug "patients" found!');
        const allEntities = await conn.db.collection('entities').find({}, { projection: { name: 1, slug: 1 } }).toArray();
        console.log('\nAvailable entities:');
        allEntities.forEach(e => console.log(`  - ${e.name} (slug: ${e.slug}, id: ${e._id})`));
    } else {
        const entity = entities[0];
        console.log(`Found: ${entity.name} (id: ${entity._id}, slug: ${entity.slug})`);
        console.log(`customFields count: ${(entity.customFields || []).length}`);
        console.log(`statusClassification: ${entity.statusClassification}`);
        console.log(`classifications: ${JSON.stringify(entity.classifications)}`);
        
        // Check records count
        const recordCount = await conn.db.collection('records').countDocuments({ entityId: entity._id });
        console.log(`Records count: ${recordCount}`);
        
        // Check if entity._id is valid for findById
        console.log(`entity._id type: ${typeof entity._id}, value: ${entity._id}`);
        console.log(`Is valid ObjectId: ${mongoose.Types.ObjectId.isValid(entity._id)}`);
        
        // Try to simulate the API call
        console.log('\n=== Simulating API call ===');
        console.log(`entityId param would be: ${entity._id}`);
        console.log(`viewId param would be: ${entity._id}`);
        
        // Check customFields population
        const fieldIds = (entity.customFields || []).filter(id => mongoose.Types.ObjectId.isValid(id));
        console.log(`Custom field IDs to populate: ${fieldIds.length}`);
        
        // Check FieldTemplate existence
        const fieldTemplates = await conn.db.collection('fieldtemplates').find({ _id: { $in: fieldIds } }).toArray();
        console.log(`Found field templates: ${fieldTemplates.length}`);
        
        // Check classifications
        if (entity.statusClassification) {
            const statusCls = await conn.db.collection('classifications').findOne({ _id: entity.statusClassification });
            console.log(`Status classification found: ${!!statusCls}`);
            if (statusCls) console.log(`  Name: ${statusCls.name}, options: ${(statusCls.options || []).length}`);
        }
        
        if (entity.classifications && entity.classifications.length > 0) {
            for (const clsId of entity.classifications) {
                const cls = await conn.db.collection('classifications').findOne({ _id: clsId });
                console.log(`Classification ${clsId}: found=${!!cls}${cls ? `, name=${cls.name}` : ''}`);
            }
        }
        
        // Check UserPreferences model
        const userPrefsCollections = await conn.db.listCollections({ name: 'userpreferences' }).toArray();
        console.log(`\nUserPreferences collection exists: ${userPrefsCollections.length > 0}`);
        
        // Check View model
        const viewCollections = await conn.db.listCollections({ name: 'views' }).toArray();
        console.log(`Views collection exists: ${viewCollections.length > 0}`);
        
        // Check shared-records-helper
        try {
            const helper = require('../middleware/shared-records-helper');
            console.log(`\nshared-records-helper loaded: ${typeof helper.getSharedRecordFilter}`);
        } catch (e) {
            console.log(`\nERROR loading shared-records-helper: ${e.message}`);
        }
    }
    
    await conn.close();
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
