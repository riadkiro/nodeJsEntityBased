const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function testPopulate() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/saas_app_rb_5096');
    const db = mongoose.connection.useDb('saas_app_rb_5096'); 
    const Entity = db.model('Entity', require('../models/entity.model.js').schema);
    db.model('FieldTemplate', require('../models/field-template.model.js').schema);
    db.model('Classification', require('../models/classification.model.js').schema);
    
    const docEntityId = new mongoose.Types.ObjectId("6a0b4221f1c5ddd28f737c83");
    
    try {
        const entities = await Entity.find({ _id: docEntityId })
            .populate('customFields')
            .populate('classifications')
            .populate('statusClassification')
            .populate({
                path: 'relations.targetEntity',
                select: 'name icon slug customFields classifications statusClassification',
                populate: [
                    { path: 'customFields', model: 'FieldTemplate' },
                    { path: 'classifications', model: 'Classification' },
                    { path: 'statusClassification', model: 'Classification' }
                ]
            })
            .lean();
        console.log('Entities count:', entities.length);
    } catch (err) {
        console.error('Populate failed:', err.message);
    }
    process.exit(0);
}
testPopulate();
