const mongoose = require('mongoose');
const fs = require('fs');
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_9194');
    const items = await mongoose.connection.db.collection('records').find({
        lineDefaults: { $exists: true, $not: { $size: 0 } }
    }).toArray();
    let text = "";
    items.forEach(i => text += `RECORD: ${i.title}\n${JSON.stringify(i.lineDefaults, null, 2)}\n\n`);
    fs.writeFileSync('records_defaults.txt', text);
    console.log(`Found ${items.length} records with lineDefaults`);
    process.exit(0);
}
main();
