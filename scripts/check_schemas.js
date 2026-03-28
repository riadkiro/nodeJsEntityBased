const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_9194').then(async () => {
    try {
        const Entity = mongoose.connection.collection('entities');
        const LineSchema = mongoose.connection.collection('lineschemas');

        // Find Consultation entity
        const consEntry = await Entity.findOne({ name: 'Consultations' }) || await Entity.findOne({ name: 'Consultation' });
        console.log('Consultation Entity:', consEntry ? consEntry._id : 'Not found');

        if (consEntry) {
            const schemas = await LineSchema.find({ entityId: consEntry._id }).toArray();
            console.log('\nSchemas for Consultation:');
            schemas.forEach(s => {
                console.log(`- ID: ${s._id}, Name: ${s.name}, TargetEntity: ${s.columns.find(c => c.type === 'relation')?.config?.targetEntity}`);
            });
        }
        
        // Let's also find the schema '69c232cd0fa7abd357abd677'
        const specificSchema = await LineSchema.findOne({ _id: new mongoose.Types.ObjectId('69c232cd0fa7abd357abd677') });
        console.log('\nSpecific Schema (from Tramadol defaults):');
        if (specificSchema) {
            console.log(`ID: ${specificSchema._id}, Name: ${specificSchema.name}, EntityId: ${specificSchema.entityId}`);
        } else {
            console.log('Not found in DB as ObjectId. Let me try as string representation...? No, it is usually ObjectId.');
        }

    } catch(e) {
        console.log(e);
    }
    process.exit();
});
