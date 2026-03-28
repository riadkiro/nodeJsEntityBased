const mongoose = require('mongoose');
const fs = require('fs');

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_9194');
    const db = mongoose.connection.db;
    
    // Find all entities to map their ids
    const entities = await db.collection('entities').find({}).toArray();
    let text = "ENTITIES:\n";
    entities.forEach(e => {
        text += `${e._id} - ${e.name} (${e.slug})\n`;
        if(e.name.toLowerCase().includes('traitement') || (e.slug && e.slug.includes('traitement'))) {
             text += JSON.stringify(e.columns, null, 2) + "\n";
        }
    });

    fs.writeFileSync('entities_dump.txt', text);
    console.log("Wrote entities_dump.txt");
    process.exit(0);
}
main();
