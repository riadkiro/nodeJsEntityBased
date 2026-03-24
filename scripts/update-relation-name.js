const mongoose = require('mongoose');

async function renameField() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/saasDemo');
        const db = mongoose.connection.db;
        const coll = db.collection('fieldtemplates');
        
        // Remove 'lien_entite' and add 'relation'
        await coll.deleteOne({ name: 'lien_entite' });
        
        const relationField = {
            name: 'relation',
            label: 'Relation',
            description: 'Associer un record d\'une autre collection',
            type: 'relation',
            category: 'relation',
            isSystem: true,
            ui: {
                icon: 'solar:link-bold-duotone',
                width: 'full'
            },
            type_config: {
                refEntity: null,
                multiple: true
            }
        };

        await coll.insertOne(relationField);
        console.log("Seeded 'Relation' field template in saasDemo");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

renameField();
