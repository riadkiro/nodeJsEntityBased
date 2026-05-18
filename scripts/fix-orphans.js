const mongoose = require('mongoose');
async function main() {
    const conn = await mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5096').asPromise();
    
    // Check for orphaned views
    const entities = await conn.db.collection('entities').find({}).project({ _id: 1, name: 1, slug: 1 }).toArray();
    const entityIds = new Set(entities.map(e => e._id.toString()));
    
    const views = await conn.db.collection('views').find({}).project({ name: 1, entity: 1, viewType: 1 }).toArray();
    console.log('\nAll views:');
    views.forEach(v => {
        const entityStr = v.entity?.toString();
        const hasEntity = entityStr ? entityIds.has(entityStr) : true;
        const entity = entities.find(e => e._id.toString() === entityStr);
        console.log(`  ${hasEntity ? '✅' : '❌'} ${v.name} (${v.viewType}) → ${entity ? entity.name : entityStr || 'no entity'}`);
    });
    
    // Check environments
    const envs = await conn.db.collection('environments').find({}).toArray();
    console.log('\nEnvironments:');
    envs.forEach(e => console.log(`  - ${e.name} (${e.slug})`));
    
    // Check for orphan "Devis" and "Contrats" views
    const orphanViews = views.filter(v => {
        const entityStr = v.entity?.toString();
        return entityStr && !entityIds.has(entityStr);
    });
    
    if (orphanViews.length > 0) {
        console.log(`\n⚠️ Found ${orphanViews.length} orphaned views — deleting them...`);
        for (const ov of orphanViews) {
            await conn.db.collection('views').deleteOne({ _id: ov._id });
            console.log(`  🗑️ Deleted: ${ov.name}`);
        }
    }
    
    // Delete Facturation environment if no views reference it
    const facEnv = envs.find(e => e.slug === 'facturation');
    if (facEnv) {
        const spaces = await conn.db.collection('spaces').find({ environmentId: facEnv._id }).toArray();
        let hasViews = false;
        for (const s of spaces) {
            const viewsInSpace = await conn.db.collection('views').find({ spaces: s._id }).countDocuments();
            if (viewsInSpace > 0) hasViews = true;
        }
        if (!hasViews) {
            for (const s of spaces) {
                await conn.db.collection('spaces').deleteOne({ _id: s._id });
                console.log(`  🗑️ Deleted space: ${s.name}`);
            }
            await conn.db.collection('environments').deleteOne({ _id: facEnv._id });
            console.log(`  🗑️ Deleted environment: Facturation`);
        }
    }
    
    await conn.close();
    console.log('\nDone!');
}
main().catch(console.error);
