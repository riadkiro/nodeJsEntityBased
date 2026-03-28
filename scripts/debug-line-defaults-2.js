const mongoose = require('mongoose');

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_9194');
    
    const db = mongoose.connection.db;

    // Fetch catalog item with lineDefaults
    const item = await db.collection('catalogitems').findOne({
        lineDefaults: { $exists: true, $not: { $size: 0 } }
    });

    console.log("=== CATALOG ITEM LINEDEFAULTS ===");
    if(item) {
        console.log(JSON.stringify(item.lineDefaults, null, 2));
    } else {
        console.log("No catalog item with lineDefaults found.");
    }

    // Fetch Schema
    const schema = await db.collection('entities').findOne({
        _id: new mongoose.Types.ObjectId('69c232cd0fa7abd357abd677') 
    });

    console.log("\n=== SCHEMA COLUMNS ===");
    if(schema) {
        schema.columns.forEach(c => {
            console.log(`_id: ${c._id}, key: ${c.key}, label: ${c.label}`);
        });
    }

    process.exit(0);
}

main().catch(console.error);
