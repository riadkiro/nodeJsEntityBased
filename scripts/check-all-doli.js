const mongoose = require('mongoose');
const fs = require('fs');

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_9194');
    
    const items = await mongoose.connection.db.collection('records').find({
        title: { $regex: 'Doliprane', $options: 'i' }
    }).toArray();
    
    fs.writeFileSync('doli_records.json', JSON.stringify(items, null, 2));
    process.exit(0);
}
main();
