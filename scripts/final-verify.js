const { MongoClient, ObjectId } = require('mongodb');

async function verify() {
    const client = new MongoClient('mongodb://localhost:27017');
    try {
        await client.connect();
        const db = client.db('saas_app_rb_9194');
        const coll = db.collection('entities');
        
        // Find consultation
        const entity = await coll.findOne({ name: 'Consultations' });
        if (!entity) {
            console.log("Consultation entity not found in 9194");
            return;
        }

        console.log("Current fieldOverrides keys:", Object.keys(entity.fieldOverrides || {}));
        
        // Check if our seeded field is available
        const centralDb = client.db('saasDemo');
        const fieldTemplates = centralDb.collection('fieldtemplates');
        const relField = await fieldTemplates.findOne({ type: 'relation' });
        console.log("Generic Relation Field Template:", relField ? relField.label : "NOT FOUND");

    } finally {
        await client.close();
    }
}
verify().catch(console.error);
