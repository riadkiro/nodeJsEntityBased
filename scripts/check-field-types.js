const { MongoClient } = require('mongodb');

async function main() {
    const client = new MongoClient('mongodb://localhost:27017');
    try {
        await client.connect();
        const db = client.db('saasDemo');
        const coll = db.collection('fieldtemplates');
        const fields = await coll.find({}).toArray();
        console.log(JSON.stringify(fields.map(f => ({ name: f.name, type: f.type, category: f.category })), null, 2));
    } finally {
        await client.close();
    }
}
main().catch(console.error);
