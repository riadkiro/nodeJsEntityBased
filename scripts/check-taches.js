const mongoose = require('mongoose');

async function check() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_9194');
    await new Promise(r => conn.once('open', r));
    
    // Check for taches entity
    const entities = await conn.db.collection('entities').find({
        $or: [
            { slug: 'taches' },
            { slug: 'tache' },
            { name: { $regex: /tâche/i } },
            { name: { $regex: /tache/i } }
        ]
    }).toArray();
    
    console.log('Found tâches entities:', entities.length);
    if (entities.length > 0) {
        entities.forEach(e => {
            console.log(`  - Name: ${e.name}, Slug: ${e.slug}, ID: ${e._id}`);
        });
    } else {
        console.log('No tâches entity found! Need to seed.');
        
        // List all entity slugs for reference
        const allEntities = await conn.db.collection('entities').find({}).project({ name: 1, slug: 1 }).toArray();
        console.log('\nAll entities in DB:');
        allEntities.forEach(e => console.log(`  - ${e.name} (slug: ${e.slug})`));
    }
    
    await conn.close();
}

check().catch(console.error);
