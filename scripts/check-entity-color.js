const mongoose = require('mongoose');

async function checkColors() {
    try {
        const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5096');
        await new Promise(r => conn.once('open', r));

        const entities = await conn.db.collection('entities').find({}).toArray();
        console.log("--- ENTITIES ---");
        entities.forEach(e => {
            console.log(`Name: ${e.name}, Icon: ${e.icon}, Color: ${e.color}`);
        });

        const records = await conn.db.collection('records').find({}).toArray();
        console.log("\n--- RECORDS ---");
        records.forEach(r => {
            console.log(`Title: ${r.title}, Entity ID: ${r.entityId}`);
        });

        await conn.close();
    } catch(e) {
        console.error(e);
    }
}
checkColors();
