const mongoose = require('mongoose');

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_9194');
    
    // Simulate what the controller does:
    const entityOid = new mongoose.Types.ObjectId('69c232cd0fa7abd357abd65e');
    const records = await mongoose.connection.db.collection('records').find({
        entityId: entityOid,
        title: { $regex: 'Dol', $options: 'i' }
    }).toArray();

    records.forEach(r => {
        console.log("Found record in /api/catalog-search:", r.title, r.lineDefaults);
    });
    process.exit(0);
}
main();
