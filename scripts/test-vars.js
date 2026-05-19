const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function testVars() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/saas_app_rb_5096');
        const db = mongoose.connection.useDb('saas_app_rb_5096'); 
        
        const Document = db.model('Document', require('../models/document.model.js').schema);
        const Entity = db.model('Entity', require('../models/entity.model.js').schema);
        db.model('FieldTemplate', require('../models/field-template.model.js').schema);
        db.model('Classification', require('../models/classification.model.js').schema);

        const doc = await Document.findOne({ name: 'Acme doc' }).lean();
        if (!doc) throw new Error('Doc not found');

        const entityIds = [...(doc.entityIds || [])];
        if (doc.entityId && !entityIds.some(id => id.toString() === doc.entityId.toString())) {
            entityIds.push(doc.entityId);
        }

        console.log('Final entityIds:', entityIds);

        const entities = await Entity.find({ _id: { $in: entityIds } })
            .populate('customFields')
            .populate('classifications')
            .populate('statusClassification')
            .lean();

        console.log('Populated entities count:', entities.length);
        if (entities.length > 0) {
            console.log('First entity name:', entities[0].name);
            console.log('Has customFields?', entities[0].customFields ? entities[0].customFields.length : 0);
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
testVars();
