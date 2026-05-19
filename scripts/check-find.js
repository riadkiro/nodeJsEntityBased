const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function checkFind() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/saas_app_rb_5096');
    const db = mongoose.connection.useDb('saas_app_rb_5096'); 
    const Entity = db.model('Entity', require('../models/entity.model.js').schema);
    
    // Simulate what happens exactly
    const docEntityId = new mongoose.Types.ObjectId("6a0b4221f1c5ddd28f737c83");
    const entityIds = [];
    
    if (docEntityId && !entityIds.includes(docEntityId.toString())) {
        entityIds.push(docEntityId); // Pushing ObjectId
    }
    console.log('entityIds:', entityIds);

    const entities = await Entity.find({ _id: { $in: entityIds } }).lean();
    console.log('Found entities:', entities.length);
    process.exit(0);
}
checkFind();
