const mongoose = require('mongoose');

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    const db = mongoose.connection.useDb('saas_app_rb_5096'); 
    const Record = db.model('Record', require('../models/record.model.js').schema);
    const Entity = db.model('Entity', require('../models/entity.model.js').schema);
    const FieldTemplate = db.model('FieldTemplate', require('../models/field-template.model.js').schema);

    const record = await Record.findById("6a0b4221f1c5ddd28f737c99").lean();
    console.log("=== RECORD ===");
    console.log(JSON.stringify(record, null, 2));

    if (record) {
        const entity = await Entity.findById(record.entityId).populate('customFields').lean();
        console.log("=== ENTITY ===");
        console.log("Name:", entity.name, "Slug:", entity.slug);
        console.log("Relations def:", JSON.stringify(entity.relations, null, 2));
        console.log("Custom Fields def:", JSON.stringify(entity.customFields, null, 2));
    }

    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
