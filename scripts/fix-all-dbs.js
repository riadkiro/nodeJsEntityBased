const { MongoClient } = require('mongodb');

async function fixDatabases() {
    const client = new MongoClient('mongodb://localhost:27017');
    try {
        await client.connect();
        const dbs = ['saasDemo', 'saas_app_rb_9194', 'saas_app_rb_5001'];
        for (const dbName of dbs) {
            const db = client.db(dbName);
            const coll = db.collection('fieldtemplates');
            
            // 1. Delete Symptômes field if it exists in system list
            // Or rename it to Relation
            await coll.updateOne(
                { label: /Symptômes/i },
                { 
                    $set: { 
                        label: 'Relation',
                        name: 'relation',
                        category: 'relation',
                        type: 'relation'
                    }
                }
            );
            
            // 2. Ensure a generic Relation template exists
            const existing = await coll.findOne({ name: 'relation' });
            if (!existing) {
                await coll.insertOne({
                    name: 'relation',
                    label: 'Relation',
                    description: 'Lier cette fiche à une autre collection',
                    type: 'relation',
                    category: 'relation',
                    isSystem: true,
                    ui: { icon: 'solar:link-bold-duotone', width: 'full' },
                    type_config: { refEntity: null, multiple: true }
                });
            }
            console.log(`Updated ${dbName}`);
        }
    } finally {
        await client.close();
    }
}
fixDatabases().catch(console.error);
