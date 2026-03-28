const mongoose = require('mongoose');
const fs = require('fs');
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_9194');
    const items = await mongoose.connection.db.collection('catalogitems').find({
        title: { $regex: 'Doliprane', $options: 'i' }
    }).toArray();
    let text = "";
    items.forEach(i => text += `${i.title}\n${JSON.stringify(i.lineDefaults, null, 2)}\n\n`);
    fs.writeFileSync('doliprane_debug.txt', text);
    process.exit(0);
}
main();
