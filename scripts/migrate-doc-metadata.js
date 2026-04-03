/**
 * Migration: Convert legacy isDraft/draftRecordId fields to new generatedFrom/linkedRecords format
 * 
 * Logic for linkedRecords:
 * - Always include the source record (from draftRecordId)
 * - Only include the FIRST parent relation (e.g. Patient from Consultation)
 * - Do NOT include child/sibling relations (exams, symptoms, etc.)
 * 
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
            { linkedRecords: { $size: 0 } },
            { 'generatedFrom.templateName': { $exists: false } }
        ]
    }).toArray();

    console.log(`Found ${draftDocs.length} docs to migrate`);

    // Build SmartDoc template map
    let smartDocMap = {};
    try {
        const smartDocs = await conn.db.collection('smartdoctemplates').find({}).project({ name: 1, documentId: 1, entityId: 1 }).toArray();
        smartDocs.forEach(s => { smartDocMap[s._id.toString()] = s; });
    } catch (e) { /* collection may not exist */ }

    let migrated = 0;
    for (const doc of draftDocs) {
        const linkedRecords = [];
        const tplId = doc.draftSourceTemplateId?.toString();

        // Get the template to find its entity bindings
        const tpl = tplId ? await docsColl.findOne(
            { _id: doc.draftSourceTemplateId },
            { projection: { name: 1, entityId: 1, entityIds: 1, collections: 1 } }
        ) : null;
        const smartDoc = tplId ? smartDocMap[tplId] : null;

        // Build generatedFrom
        const generatedFrom = {
            templateId: smartDoc?.documentId || (tpl ? tpl._id : doc.draftSourceTemplateId),
            smartDocId: smartDoc ? smartDoc._id : null,
            templateName: smartDoc?.name || tpl?.name || 'Document',
            generatedAt: doc.createdAt || new Date()
        };

        // Get the source record
        const recId = doc.draftRecordId?.toString();
        const sourceRecord = recId ? await recordsColl.findOne(
            { _id: doc.draftRecordId },
            { projection: { title: 1, entityId: 1, relations: 1 } }
        ) : null;

        if (sourceRecord) {
            const sourceEntity = sourceRecord.entityId
                ? await entitiesColl.findOne({ _id: sourceRecord.entityId }, { projection: { name: 1, icon: 1, slug: 1, relations: 1 } })
                : null;

            // Add source record
            linkedRecords.push({
                recordId: sourceRecord._id,
                recordTitle: sourceRecord.title || '',
                entityId: sourceRecord.entityId || null,
                entityName: sourceEntity?.name || '',
                entityIcon: sourceEntity?.icon || '',
                entitySlug: sourceEntity?.slug || '',
                alias: sourceEntity?.slug || ''
            });

            // Add ONLY the first parent relation from the source record
            if (sourceEntity?.relations && sourceRecord.relations) {
                const firstRelDef = sourceEntity.relations[0]; // First relation = typically parent
                if (firstRelDef) {
                    const recRel = sourceRecord.relations.find(r => r.relationKey === firstRelDef.key);
                    const parentId = recRel?.value
                        ? (Array.isArray(recRel.value) ? recRel.value[0] : recRel.value)
                        : null;

                    if (parentId) {
                        const parentRecord = await recordsColl.findOne(
                            { _id: new mongoose.Types.ObjectId(parentId.toString()) },
                            { projection: { title: 1, entityId: 1 } }
                        );
                        if (parentRecord) {
                            const parentEntity = parentRecord.entityId
                                ? await entitiesColl.findOne({ _id: parentRecord.entityId }, { projection: { name: 1, icon: 1, slug: 1 } })
                                : null;
                            if (parentEntity) {
                                linkedRecords.push({
                                    recordId: parentRecord._id,
                                    recordTitle: parentRecord.title || '',
                                    entityId: parentEntity._id,
                                    entityName: parentEntity.name || '',
                                    entityIcon: parentEntity.icon || '',
                                    entitySlug: parentEntity.slug || '',
                                    alias: firstRelDef.key || parentEntity.slug || ''
                                });
                            }
                        }
                    }
                }
            }
        }

        await docsColl.updateOne({ _id: doc._id }, { $set: { generatedFrom, linkedRecords } });
        migrated++;
        console.log(`  ✓ ${doc.name} → ${linkedRecords.map(r => `${r.entityName}: ${r.recordTitle}`).join(' | ')}`);
    }

    console.log(`\nMigrated ${migrated}/${draftDocs.length} documents`);
    await conn.close();
}

migrate().catch(err => {
    console.error('Migration error:', err);
    process.exit(1);
});
