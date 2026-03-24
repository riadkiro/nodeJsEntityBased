const mongoose = require('mongoose');

async function checkConfig() {
    try {
        console.log("Connecting...");
        await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_9194');
        const db = mongoose.connection.db;
        
        console.log("DB established");
        const collections = await db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));
        
        const Entity = db.collection('entities');
        const entities = await Entity.find({}).toArray();
        console.log("Entities count:", entities.length);
        
        const consultationEntity = entities.find(e => e.name.toLowerCase().includes('consultation'));
        if (!consultationEntity) {
            console.log("Consultation entity not found in saas_app_rb_9194");
            process.exit(0);
        }

        console.log("Entity Name:", consultationEntity.name);
        const symptomField = consultationEntity.fields.find(f => f.name.toLowerCase().includes('sympt'));
        if (symptomField) {
            console.log("Symptom Field Found:", JSON.stringify(symptomField, null, 2));
        } else {
            console.log("Symptom Field NOT found in Consultation Entity");
        }
        
        process.exit(0);
    } catch (err) {
        console.error("CRASH:", err);
        process.exit(1);
    }
}

checkConfig();
