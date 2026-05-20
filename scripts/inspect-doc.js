const mongoose = require('mongoose');

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saasDemo?directConnection=true');
    console.log('Connected to global DB');

    // Let's check databases and find where 6a0cc32c8582f628068fa250 is
    const targetId = '6a0cc32c8582f628068fa250';
    
    // We can try to look inside saas_app_rb_5096 and saasDemo
    const dbs = ['saasDemo', 'saas_app_rb_5096', 'saas_app_rb_5001'];
    
    for (const dbName of dbs) {
        const conn = mongoose.createConnection(`mongodb://127.0.0.1:27017/${dbName}`);
        await new Promise(resolve => conn.once('open', resolve));
        
        // Let's get all collection names
        const collections = await conn.db.listCollections().toArray();
        for (const col of collections) {
            const name = col.name;
            try {
                // Look for targetId
                const doc = await conn.db.collection(name).findOne({ _id: new mongoose.Types.ObjectId(targetId) });
                if (doc) {
                    console.log(`FOUND in DB: ${dbName}, Collection: ${name}`);
                    console.log(JSON.stringify(doc, null, 2));
                    
                    // If it's a document/instance, let's also dump bindingsSelected and collections
                    if (doc.bindingsSelected) {
                        console.log('bindingsSelected:', doc.bindingsSelected);
                    }
                    if (doc.collections) {
                        console.log('collections:', doc.collections);
                    }
                }
            } catch (e) {
                // Ignore collection errors (e.g. if _id is not ObjectId friendly, but it is standard mongo id)
            }
        }
        await conn.close();
    }
    
    await mongoose.disconnect();
}

main().catch(console.error);
