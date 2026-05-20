const mongoose = require('mongoose');
const path = require('path');

require(path.join(__dirname, '../models/entity.model.js'));
require(path.join(__dirname, '../models/smart-doc-template.model.js'));
require(path.join(__dirname, '../models/document.model.js'));

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    const Document = mongoose.model('Document');
    const Entity = mongoose.model('Entity');
    const SmartDocTemplate = mongoose.model('SmartDocTemplate');
    
    const doc = await Document.findById('6a0cc32c8582f628068fa250').lean();
    const smartDocTemplate = await SmartDocTemplate.findOne({ documentId: doc._id.toString(), active: true }).lean();
    
    const allEntityIds = new Set();
    (doc.entityIds || []).forEach(id => allEntityIds.add(id.toString()));
    if (doc.entityId) allEntityIds.add(doc.entityId.toString());
    (doc.linkedRecords || []).forEach(lr => {
        if (lr.entityId) allEntityIds.add(lr.entityId.toString());
    });

    let entities = [];
    if (allEntityIds.size > 0) {
        const rawEntities = await Entity.find({ _id: { $in: [...allEntityIds] } })
            .populate({
                path: 'relations.targetEntity',
                select: 'name icon slug color'
            })
            .lean();

        const primaryEntityIdStr = smartDocTemplate.entityId ? smartDocTemplate.entityId.toString() : '';
        entities = rawEntities.sort((a, b) => {
            if (a._id.toString() === primaryEntityIdStr) return -1;
            if (b._id.toString() === primaryEntityIdStr) return 1;
            return 0;
        });
    }
    
    console.log('=== POPULATED ENTITIES ===');
    console.log('entities.length:', entities.length);
    console.log('entities JSON:\n', JSON.stringify(entities.map(e => ({ _id: e._id, name: e.name, slug: e.slug })), null, 2));
    
    await mongoose.connection.close();
}

run().catch(console.error);
