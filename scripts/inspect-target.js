const mongoose = require('mongoose');

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    const db = mongoose.connection.useDb('saas_app_rb_5096'); 
    const Record = db.model('Record', require('../models/record.model.js').schema);

    const record = await Record.findById("6a0b4221f1c5ddd28f737c96").lean();
    console.log("=== TARGET RECORD ===");
    console.log("title:", record.title);
    console.log("computedTitle:", record.computedTitle);
    console.log("full record:", JSON.stringify(record, null, 2));

    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
