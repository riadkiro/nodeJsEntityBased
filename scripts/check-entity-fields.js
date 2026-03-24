const { MongoClient } = require('mongodb');

async function main() {
    const uri = 'mongodb://127.0.0.1:27017';
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('saas_app_rb_9194');
        const entityColl = db.collection('entities');
        
        let entity = await entityColl.findOne({ name: 'consultations' });
        if (!entity) {
            // Find any entity that looks like consultation
            entity = await entityColl.findOne({ name: { $regex: /consultation/i } });
        }
        
        if (!entity) {
            console.log("Entity 'consultations' not found");
            return;
        }

        console.log("Entity Name:", entity.name, "ID:", entity._id);
        
        // Find symptoms field
        const symptomsFields = entity.fields.filter(f => f.name.toLowerCase().includes('sympt'));
        console.log("Symptoms Fields Info:");
        console.log(JSON.stringify(symptomsFields, null, 2));
        
        // Find in layouts
        // Check if layout is in the entity itself or in a layout collection if exists
        console.log("Layout exists in entity?", !!entity.layout);
        if (entity.layout) {
             console.log("Layout Sections:", entity.layout.sections ? entity.layout.sections.length : 'N/A');
             // Search for symptoms in layout
             const jsonStr = JSON.stringify(entity.layout);
             if (jsonStr.includes('Sympt')) {
                 console.log("Found 'Symptômes' in layout JSON");
             }
        }

    } finally {
        await client.close();
    }
}

main().catch(console.error);
