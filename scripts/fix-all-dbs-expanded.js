const { MongoClient } = require('mongodb');

async function fixAllDbs() {
    const client = new MongoClient('mongodb://localhost:27017');
    try {
        await client.connect();
        const dbsResult = await client.db().admin().listDatabases();
        const dbNames = dbsResult.databases.map(db => db.name).filter(n => n.startsWith('saas_app_rb_') || n === 'saasDemo');
        
        for (const dbName of dbNames) {
            const db = client.db(dbName);
            const coll = db.collection('fieldtemplates');
            
            // 1. Rename any field with 'Symptômes' as label to 'Relation'
            const res = await coll.updateMany(
                { label: /Symptômes/i },
                { 
                    $set: { 
                        label: 'Relation',
                        name: 'relation',
                        category: 'relation',
                        type: 'relation',
                        isSystem: true
                    }
                }
            );
            
            // 2. Ensure at least one 'relation' template exists if not found
            const count = await coll.countDocuments({ name: 'relation' });
            if (count === 0) {
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
            console.log(`[${dbName}] Updated field templates. Modified: ${res.modifiedCount}`);
        }
    } finally {
        await client.close();
    }
}
fixAllDbs().catch(console.error);
