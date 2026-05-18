/**
 * Verify CRM setup - check entities, views, and generated docs
 */
const mongoose = require('mongoose');

async function main() {
    const conn = await mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5096').asPromise();
    
    // Check entities
    const entities = await conn.db.collection('entities').find({}).project({ name: 1, slug: 1 }).toArray();
    console.log('\n📋 Entities:');
    entities.forEach(e => console.log(`  - ${e.name} (${e.slug})`));
    
    // Check SmartDocTemplates
    const sdts = await conn.db.collection('smartdoctemplates').find({}).project({ name: 1, entityId: 1 }).toArray();
    console.log('\n📄 SmartDoc Templates:');
    for (const s of sdts) {
        const entity = entities.find(e => e._id.toString() === s.entityId?.toString());
        console.log(`  - ${s.name} → ${entity ? entity.name : 'unknown entity'}`);
    }
    
    // Check doc-listing views
    const views = await conn.db.collection('views').find({ viewType: 'doc-listing' }).project({ name: 1, entity: 1, settings: 1 }).toArray();
    console.log('\n🗂️ Doc-Listing Views:');
    for (const v of views) {
        const entity = entities.find(e => e._id.toString() === v.entity?.toString());
        console.log(`  - ${v.name} → entity: ${entity ? entity.name : 'unknown'}, templateId: ${v.settings?.smartDocTemplateId}`);
    }
    
    // Check generated docs on records
    const records = await conn.db.collection('records').find({ 'attachments.isGenerated': true }).project({ title: 1, 'attachments.$': 1 }).toArray();
    const allRecordsWithAtts = await conn.db.collection('records').find({ attachments: { $exists: true, $ne: [] } }).project({ title: 1, attachments: 1 }).toArray();
    console.log('\n📎 Records with generated attachments:');
    for (const r of allRecordsWithAtts) {
        const genAtts = (r.attachments || []).filter(a => a.isGenerated);
        if (genAtts.length > 0) {
            console.log(`  - ${r.title} (${genAtts.length} generated files):`);
            genAtts.forEach(a => console.log(`      • ${a.originalName} [${a.generatedFromName}]`));
        }
    }
    
    // Check spaces/navigation
    const spaces = await conn.db.collection('spaces').find({}).project({ name: 1, slug: 1 }).toArray();
    console.log('\n🧭 Spaces:');
    spaces.forEach(s => console.log(`  - ${s.name} (${s.slug})`));
    
    // Check all views in pipeline commercial
    const pipelineSpace = spaces.find(s => s.slug === 'pipeline-commercial');
    if (pipelineSpace) {
        const pViews = await conn.db.collection('views').find({ spaces: pipelineSpace._id }).project({ name: 1, viewType: 1, order: 1 }).sort({ order: 1 }).toArray();
        console.log('\n📊 Views in Pipeline Commercial:');
        pViews.forEach(v => console.log(`  - ${v.name} (${v.viewType}) order=${v.order}`));
    }
    
    await conn.close();
}

main().catch(console.error);
