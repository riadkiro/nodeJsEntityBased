const mongoose = require('mongoose');

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_9194');
    
    // Simulate the API line-schemas/by-context
    const entityId = new mongoose.Types.ObjectId('69c232cd0fa7abd357abd651'); // Consultation
    const lineSchemas = await mongoose.connection.db.collection('lineschemas').find({
        'appliesTo.entityIds': entityId.toString()
    }).toArray();

    console.log("Found line schemas:", lineSchemas.map(s => s._id.toString()));
    process.exit(0);
}
main();
