const mongoose = require('mongoose');

async function main() {
    const dbName = 'saas_app_rb_5096';
    const conn = mongoose.createConnection(`mongodb://127.0.0.1:27017/${dbName}`);
    await new Promise(r => conn.once('open', r));
    console.log(`Connected to database: ${dbName}`);
    
    const templateId = '6a0cc32c8582f628068fa250';
    const recordId = '6a0b4221f1c5ddd28f737c98'; // e.g., the selected patient record
    const entityId = '6a0b4221f1c5ddd28f737c83';
    
    // 1. Get the template document
    const doc = await conn.db.collection('documents').findOne({ _id: new mongoose.Types.ObjectId(templateId) });
    if (!doc) {
        console.log('Template document not found!');
        await conn.close();
        return;
    }
    console.log('Template document found:', doc.name);
    console.log('  entityId:', doc.entityId);
    console.log('  entityIds:', doc.entityIds);
    console.log('  linkedRecords:', doc.linkedRecords);

    // 2. Identify the target entities for this template
    const targetEntityIds = [];
    if (doc.entityIds && doc.entityIds.length > 0) {
        doc.entityIds.forEach(id => targetEntityIds.push(id.toString()));
    }
    if (doc.entityId && !targetEntityIds.includes(doc.entityId.toString())) {
        targetEntityIds.push(doc.entityId.toString());
    }
    console.log('Target Entity IDs determined:', targetEntityIds);

    // 3. Find primary entity metadata
    if (targetEntityIds.length > 0) {
        const entityDoc = await conn.db.collection('entities').findOne({ _id: new mongoose.Types.ObjectId(targetEntityIds[0]) });
        if (entityDoc) {
            console.log('Primary target Entity metadata:', {
                _id: entityDoc._id,
                name: entityDoc.name,
                icon: entityDoc.icon,
                slug: entityDoc.slug
            });
        } else {
            console.log(`Primary target entity with ID ${targetEntityIds[0]} NOT found in entities collection!`);
        }
    }

    // 4. Query context records referencing the parent record ID
    const parentRecordObjectId = mongoose.Types.ObjectId.isValid(recordId) 
        ? new mongoose.Types.ObjectId(recordId) 
        : null;

    const relationValues = [recordId];
    if (parentRecordObjectId) {
        relationValues.push(parentRecordObjectId);
    }
    console.log('Searching relation values:', relationValues);

    const query = {
        entityId: { $in: targetEntityIds.map(id => new mongoose.Types.ObjectId(id)) },
        'relations.value': { $in: relationValues }
    };
    console.log('Using query:', JSON.stringify(query, null, 2));

    const records = await conn.db.collection('records').find({
        entityId: { $in: targetEntityIds.map(id => new mongoose.Types.ObjectId(id)) }
    }).toArray();
    console.log(`Total records for targetEntityIds: ${records.length}`);
    records.forEach(r => {
        console.log(`  - Record ${r.title || r.computedTitle} (${r._id}) relations:`, JSON.stringify(r.relations));
    });

    const matchedRecords = await conn.db.collection('records').find({
        entityId: { $in: targetEntityIds.map(id => new mongoose.Types.ObjectId(id)) },
        'relations.value': { $in: relationValues.map(v => typeof v === 'string' ? v : v) }
    }).toArray();
    console.log(`Matched records using relations.value query: ${matchedRecords.length}`);

    // Let's also check if they are stored as strings or objectIds or arrays
    const matchedRecordsManual = records.filter(r => {
        if (!r.relations) return false;
        return r.relations.some(rel => {
            if (Array.isArray(rel.value)) {
                return rel.value.some(v => v.toString() === recordId);
            }
            return rel.value && rel.value.toString() === recordId;
        });
    });
    console.log(`Matched records using manual javascript matching: ${matchedRecordsManual.length}`);
    matchedRecordsManual.forEach(r => {
        console.log(`  - Matched Record: ${r.title || r.computedTitle} (${r._id})`);
    });

    await conn.close();
}

main().catch(console.error);
