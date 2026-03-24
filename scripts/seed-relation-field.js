const mongoose = require('mongoose');

async function seedRelationField() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/saasDemo');
        const db = mongoose.connection.db;
        const coll = db.collection('fieldtemplates');
        
        const existing = await coll.findOne({ name: 'lien_entite' });
        if (existing) {
            console.log("Field 'lien_entite' already exists");
            process.exit(0);
        }

        const relationField = {
            name: 'lien_entite',
            label: 'Lien vers entité',
            description: 'Permat d\'associer un record d\'une autre collection',
            type: 'relation',
            category: 'relation',
            isSystem: true,
            ui: {
                icon: 'solar:share-bold-duotone',
                width: 'full'
            },
            type_config: {
                refEntity: null,
                multiple: true
            }
        };

        await coll.insertOne(relationField);
        console.log("Seeded 'Lien vers entité' field template in saasDemo");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedRelationField();
