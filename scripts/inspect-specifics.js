const mongoose = require('mongoose');

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    const db = mongoose.connection.useDb('saas_app_rb_5096'); 
    const Record = db.model('Record', require('../models/record.model.js').schema);

    const record = await Record.findById("6a0b4221f1c5ddd28f737c99").lean();
    console.log("=== RECORD FIELDS ===");
    console.log("customFields:", JSON.stringify(record.customFields, null, 2));
    console.log("relations:", JSON.stringify(record.relations, null, 2));

    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
