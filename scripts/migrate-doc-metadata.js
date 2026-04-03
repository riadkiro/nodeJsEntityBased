/**
 * Migration: Convert legacy isDraft/draftRecordId fields to new generatedFrom/linkedRecords format
 * Run: node scripts/migrate-doc-metadata.js
 */
const mongoose = require('mongoose');

const DB_NAME = 'saas_app_rb_7846';

async function migrate() {
    const conn = mongoose.createConnection(`mongodb://127.0.0.1:27017/${DB_NAME}`);
    await new Promise(r => conn.once('open', r));
    console.log(`Connected to ${DB_NAME}`);

    const docsColl = conn.db.collection('documents');
    const recordsColl = conn.db.collection('records');
    const entitiesColl = conn.db.collection('entities');

    // Find all docs with legacy draft fields that haven't been migrated yet
    const draftDocs = await docsColl.find({
        isDraft: true,
        draftRecordId: { $exists: true, $ne: null },
        $or: [
            { linkedRecords: { $exists: false } },
            { linkedRecords: { $size: 0 } }
        ]
    }).toArray();

    console.log(`Found ${draftDocs.length} docs to migrate`);

    // Collect all record IDs and template IDs
    const recordIds = new Set();
    const templateIds = new Set();
    draftDocs.forEach(d => {
        if (d.draftRecordId) recordIds.add(d.draftRecordId.toString());
        if (d.draftSourceTemplateId) templateIds.add(d.draftSourceTemplateId.toString());
    });

    // Batch fetch records
    const records = await recordsColl.find({
        _id: { $in: [...recordIds].map(id => new mongoose.Types.ObjectId(id)) }
    }).project({ title: 1, entityId: 1, relations: 1 }).toArray();
    const recordMap = {};
    records.forEach(r => { recordMap[r._id.toString()] = r; });

    // Batch fetch entities
    const entityIds = new Set();
    records.forEach(r => { if (r.entityId) entityIds.add(r.entityId.toString()); });
    // Also get parent record entity IDs via relations
    const parentRecordIds = new Set();
    records.forEach(r => {
        if (r.relations) {
            r.relations.forEach(rel => {
                const val = Array.isArray(rel.value) ? rel.value[0] : rel.value;
                if (val) parentRecordIds.add(val.toString());
            });
        }
    });
    const parentRecords = parentRecordIds.size > 0
        ? await recordsColl.find({ _id: { $in: [...parentRecordIds].map(id => new mongoose.Types.ObjectId(id)) } })
            .project({ title: 1, entityId: 1 }).toArray()
        : [];
    parentRecords.forEach(r => {
        recordMap[r._id.toString()] = r;
        if (r.entityId) entityIds.add(r.entityId.toString());
    });

    const entities = await entitiesColl.find({
        _id: { $in: [...entityIds].map(id => new mongoose.Types.ObjectId(id)) }
    }).project({ name: 1, icon: 1, slug: 1 }).toArray();
    const entityMap = {};
    entities.forEach(e => { entityMap[e._id.toString()] = e; });

    // Batch fetch template/smartdoc names  
    const templates = templateIds.size > 0
        ? await docsColl.find({ _id: { $in: [...templateIds].map(id => new mongoose.Types.ObjectId(id)) } })
            .project({ name: 1, entityId: 1, entityIds: 1 }).toArray()
        : [];
    const templateMap = {};
    templates.forEach(t => { templateMap[t._id.toString()] = t; });

    // Also check SmartDocTemplates
    let smartDocMap = {};
    try {
        const smartDocs = await conn.db.collection('smartdoctemplates').find({
            _id: { $in: [...templateIds].map(id => new mongoose.Types.ObjectId(id)) }
        }).project({ name: 1, documentId: 1, entityId: 1 }).toArray();
        smartDocs.forEach(s => { smartDocMap[s._id.toString()] = s; });
    } catch (e) { /* collection may not exist */ }

    // Migrate each doc
    let migrated = 0;
    for (const doc of draftDocs) {
        const update = {};
        const linkedRecords = [];

        // Build generatedFrom
        const tplId = doc.draftSourceTemplateId?.toString();
        const tpl = tplId ? (templateMap[tplId] || null) : null;
        const smartDoc = tplId ? (smartDocMap[tplId] || null) : null;

        update.generatedFrom = {
            templateId: smartDoc?.documentId || (tpl ? tpl._id : doc.draftSourceTemplateId),
            smartDocId: smartDoc ? smartDoc._id : null,
            templateName: smartDoc?.name || tpl?.name || 'Document',
            generatedAt: doc.createdAt || new Date()
        };

        // Build linkedRecords from draftRecordId
        const recId = doc.draftRecordId?.toString();
        const record = recId ? recordMap[recId] : null;
        if (record) {
            const entityId = record.entityId?.toString();
            const entity = entityId ? entityMap[entityId] : null;
            linkedRecords.push({
                recordId: record._id,
                recordTitle: record.title || '',
                entityId: record.entityId || null,
                entityName: entity?.name || '',
                entityIcon: entity?.icon || '',
                entitySlug: entity?.slug || '',
                alias: entity?.slug || ''
            });

            // Also add parent records from relations (e.g. patient from consultation)
            if (record.relations) {
                for (const rel of record.relations) {
                    const parentId = (Array.isArray(rel.value) ? rel.value[0] : rel.value)?.toString();
                    if (parentId && recordMap[parentId]) {
                        const parent = recordMap[parentId];
                        const parentEntityId = parent.entityId?.toString();
                        const parentEntity = parentEntityId ? entityMap[parentEntityId] : null;
                        if (parentEntity && !linkedRecords.find(lr => lr.recordId?.toString() === parentId)) {
                            linkedRecords.push({
                                recordId: parent._id,
                                recordTitle: parent.title || '',
                                entityId: parent.entityId || null,
                                entityName: parentEntity?.name || '',
                                entityIcon: parentEntity?.icon || '',
                                entitySlug: parentEntity?.slug || '',
                                alias: rel.relationKey || parentEntity?.slug || ''
                            });
                        }
                    }
                }
            }
        }

        update.linkedRecords = linkedRecords;

        await docsColl.updateOne({ _id: doc._id }, { $set: update });
        migrated++;
        console.log(`  ✓ ${doc.name} → ${linkedRecords.length} linked records, template: ${update.generatedFrom.templateName}`);
    }

    console.log(`\nMigrated ${migrated}/${draftDocs.length} documents`);
    await conn.close();
}

migrate().catch(err => {
    console.error('Migration error:', err);
    process.exit(1);
});
