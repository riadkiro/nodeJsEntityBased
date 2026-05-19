const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function testApi() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/saas_app_rb_5096');
        const db = mongoose.connection.useDb('saas_app_rb_5096'); 
        
        const Document = db.model('Document', require('../models/document.model.js').schema);
        const Entity = db.model('Entity', require('../models/entity.model.js').schema);
        db.model('FieldTemplate', require('../models/field-template.model.js').schema);
        db.model('Classification', require('../models/classification.model.js').schema);

        const doc = await Document.findOne({ name: 'Acme doc' }).lean();
        if (!doc) throw new Error('Doc not found');

        const variables = {
            system: [],
            user: [],
            entities: []
        };

        const entityIds = [...(doc.entityIds || [])];
        if (doc.entityId && !entityIds.includes(doc.entityId.toString())) {
            entityIds.push(doc.entityId);
        }

        console.log('entityIds for search:', entityIds);

        if (entityIds.length > 0) {
            const entities = await Entity.find({ _id: { $in: entityIds } })
                .populate('customFields')
                .lean();

            for (const entity of entities) {
                variables.entities.push({
                    name: entity.name,
                    fieldsCount: entity.customFields ? entity.customFields.length : 0
                });
            }
        }

        console.log('Resulting variables.entities:', variables.entities);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
testApi();
