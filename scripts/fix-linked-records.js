/**
 * Fix: Re-add the parent record (Patient) to linkedRecords
 * The previous fix removed too much — it should keep source + parent (Patient)
 */
const mongoose = require('mongoose');

const DB_NAME = 'saas_app_rb_7846';

async function fix() {
    const conn = mongoose.createConnection(`mongodb://127.0.0.1:27017/${DB_NAME}`);
    await new Promise(r => conn.once('open', r));
    console.log(`Connected to ${DB_NAME}`);

    const docsColl = conn.db.collection('documents');
    const recordsColl = conn.db.collection('records');
    const entitiesColl = conn.db.collection('entities');

    // Find all draft docs with linkedRecords
    const docs = await docsColl.find({
        isDraft: true,
        'linkedRecords.0': { $exists: true }
    }).project({ name: 1, linkedRecords: 1, draftRecordId: 1 }).toArray();

    console.log(`Found ${docs.length} docs to fix`);

    for (const doc of docs) {
        const sourceLinked = doc.linkedRecords[0];
        if (!sourceLinked?.entityId) continue;

        // Get entity schema for the source record's entity
        const entity = await entitiesColl.findOne(
            { _id: sourceLinked.entityId },
            { projection: { name: 1, relations: 1 } }
        );
        if (!entity || !entity.relations) continue;

        // Get the actual source record to read its relation values
        const sourceRecordId = sourceLinked.recordId || doc.draftRecordId;
        if (!sourceRecordId) continue;

        const sourceRecord = await recordsColl.findOne(
            { _id: sourceRecordId },
            { projection: { relations: 1 } }
        );
        if (!sourceRecord?.relations) continue;

        // Find the FIRST parent relation (typically "Patient")
        // We use a simple heuristic: the first relation in the entity schema
        // that has a value on the record and targets a "parent-like" entity
        const newLinkedRecords = [sourceLinked]; // Keep source

        for (const entityRel of entity.relations) {
            // Find this relation's value on the record
            const recRel = sourceRecord.relations.find(r => r.relationKey === entityRel.key);
            if (!recRel?.value) continue;

            const parentId = Array.isArray(recRel.value) ? recRel.value[0] : recRel.value;
            if (!parentId) continue;

            // Look up the parent record + entity
            const parentRecord = await recordsColl.findOne(
                { _id: new mongoose.Types.ObjectId(parentId.toString()) },
                { projection: { title: 1, entityId: 1 } }
            );
            if (!parentRecord) continue;

            const parentEntity = await entitiesColl.findOne(
                { _id: parentRecord.entityId },
                { projection: { name: 1, icon: 1, slug: 1 } }
            );
            if (!parentEntity) continue;

            // Only add the FIRST parent relation (typically Patient, not exams)
            // Heuristic: skip if already added this entity type
            if (!newLinkedRecords.find(lr => lr.entitySlug === parentEntity.slug)) {
                newLinkedRecords.push({
                    recordId: parentRecord._id,
                    recordTitle: parentRecord.title || '',
                    entityId: parentEntity._id,
                    entityName: parentEntity.name || '',
                    entityIcon: parentEntity.icon || '',
                    entitySlug: parentEntity.slug || '',
                    alias: entityRel.key || parentEntity.slug || ''
                });
            }

            // Only keep the first parent relation — break after Patient
            break;
        }

        await docsColl.updateOne({ _id: doc._id }, { $set: { linkedRecords: newLinkedRecords } });
        console.log(`  ✓ ${doc.name}: ${newLinkedRecords.map(r => `${r.entityName}: ${r.recordTitle}`).join(' | ')}`);
    }

    console.log('\nDone');
    await conn.close();
}

fix().catch(console.error);
