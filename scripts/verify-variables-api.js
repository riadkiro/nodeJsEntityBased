const mongoose = require('mongoose');

// Mock loadEntityWithFields
async function loadEntityWithFields(req, entityId) {
    const Entity = mongoose.model('Entity');
    const FieldTemplate = mongoose.model('FieldTemplate');
    const entity = await Entity.findById(entityId).lean();
    if (!entity) return null;
    if (entity.fields && entity.fields.length > 0) {
        const fields = await FieldTemplate.find({ _id: { $in: entity.fields } }).lean();
        entity.customFields = fields;
    } else {
        entity.customFields = [];
    }
    return entity;
}

async function run() {
    console.log('Connecting to mongodb...');
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    console.log('Connected!');

    const Document = mongoose.model('Document', new mongoose.Schema({}, { strict: false }));
    const Entity = mongoose.model('Entity', new mongoose.Schema({}, { strict: false }));
    const Record = mongoose.model('Record', new mongoose.Schema({}, { strict: false }));
    const SmartDocTemplate = mongoose.model('SmartDocTemplate', new mongoose.Schema({}, { strict: false }));
    const FieldTemplate = mongoose.model('FieldTemplate', new mongoose.Schema({}, { strict: false }));

    // Find the latest generated draft document
    const draft = await Document.findOne({ isDraft: true }).sort({ createdAt: -1 }).lean();
    if (!draft) {
        console.log('No draft document found. Please run the wizard in browser first.');
        await mongoose.connection.close();
        return;
    }

    console.log(`\n=== VERIFYING DRAFT: ${draft.name} (${draft._id}) ===`);
    console.log(`Linked Records in DB:`, draft.linkedRecords);

    // Let's simulate GET /api/smartdoc/variables/:documentId
    const doc = draft;
    const entityIds = [...(doc.entityIds || [])].map(id => id.toString());
    if (doc.entityId && !entityIds.includes(doc.entityId.toString())) {
        entityIds.push(doc.entityId.toString());
    }
    if (doc.linkedRecords && doc.linkedRecords.length > 0) {
        doc.linkedRecords.forEach(lr => {
            if (lr.entityId && !entityIds.includes(lr.entityId.toString())) {
                entityIds.push(lr.entityId.toString());
            }
        });
    }

    console.log('Resolved entityIds for variables:', entityIds);

    const entities = [];
    for (const eid of entityIds) {
        const ent = await loadEntityWithFields({}, eid);
        if (ent) entities.push(ent);
    }

    console.log(`Loaded ${entities.length} entities for variables:`);
    for (const ent of entities) {
        console.log(`- ${ent.name} (${ent.slug}) with ${ent.customFields?.length || 0} fields`);
    }

    const hasContacts = entities.some(e => e.slug === 'contacts');
    if (hasContacts) {
        console.log('\nSUCCESS! The "contacts" entity is correctly loaded in variables!');
    } else {
        console.log('\nFAILURE: The "contacts" entity was not found in variables.');
    }

    await mongoose.connection.close();
    console.log('Done!');
}

run().catch(err => {
    console.error(err);
    mongoose.connection.close();
});
