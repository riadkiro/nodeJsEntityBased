const mongoose = require('mongoose');
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_9194');
    
    // Check if the doliprane that the user SELECTS is actually the one matching `lineDefaults`
    const items = await mongoose.connection.db.collection('records').find({
        title: { $regex: 'Doliprane', $options: 'i' }
    }).toArray();
    
    items.forEach(i => {
        console.log(`Doliprane ID: ${i._id}, Entity: ${i.entityId}, lineDefaults: ${(i.lineDefaults || []).length}`);
    });
    process.exit(0);
}
main();
