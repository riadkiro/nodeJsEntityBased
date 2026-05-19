/**
 * Critical diagnostic: Why aren't attachments being saved to records?
 * 
 * Check if the drafts have a valid recordId and if that record exists
 */
const mongoose = require('mongoose');

async function run() {
    const conn = await mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001').asPromise();
    
    const docCol = conn.db.collection('documents');
    const recordCol = conn.db.collection('records');

    // 1. Get the most recent drafts with a recordId
    const draftsWithRecord = await docCol.find({ 
        isDraft: true, 
        draftRecordId: { $ne: null, $exists: true } 
    }).sort({ createdAt: -1 }).limit(5).toArray();

    console.log(`=== DRAFTS WITH recordId ===`);
    for (const d of draftsWithRecord) {
        const recIdStr = String(d.draftRecordId);
        console.log(`\nDraft: ${d._id} | recordId: "${recIdStr}" | type: ${typeof d.draftRecordId}`);
        
        // Try to find the record
        let rec = null;
        try {
            // Try as ObjectId
            rec = await recordCol.findOne({ _id: new mongoose.Types.ObjectId(recIdStr) });
        } catch(e) {
            console.log(`  ⚠ Could not convert to ObjectId: ${e.message}`);
        }
        
        if (rec) {
            console.log(`  ✓ Record found: "${rec.computedTitle || rec.title}"`);
            console.log(`  Attachments count: ${(rec.attachments || []).length}`);
            const genAtts = (rec.attachments || []).filter(a => a.isGenerated);
            console.log(`  Generated attachments: ${genAtts.length}`);
        } else {
            console.log(`  ✗ RECORD NOT FOUND`);
        }
    }

    // 2. Get the drafts WITHOUT recordId (these are documents hub drafts)
    const draftsWithoutRecord = await docCol.find({ 
        isDraft: true,
        $or: [
            { draftRecordId: null },
            { draftRecordId: { $exists: false } }
        ]
    }).sort({ createdAt: -1 }).toArray();

    console.log(`\n=== DRAFTS WITHOUT recordId: ${draftsWithoutRecord.length} ===`);
    for (const d of draftsWithoutRecord) {
        console.log(`  ${d._id} | "${d.name}" | created: ${d.createdAt}`);
        console.log(`  draftRecordId: ${JSON.stringify(d.draftRecordId)}`);
        console.log(`  body.recordId would be: ${d.draftRecordId || 'UNDEFINED/NULL'}`);
    }

    // 3. Check what happens when finalize is called WITHOUT a recordId
    // The code does: const recordId = req.body.recordId || draftDoc.draftRecordId;
    // If both are null/undefined, Record.findById(null) might return null → 404 error
    console.log('\n=== SIMULATING finalize-draft recordId resolution ===');
    for (const d of [...draftsWithRecord, ...draftsWithoutRecord].slice(0, 5)) {
        const bodyRecordId = null; // Simulating req.body.recordId not sent
        const resolved = bodyRecordId || d.draftRecordId;
        console.log(`Draft "${d.name}": body.recordId=null, draftRecordId=${d.draftRecordId} → resolved="${resolved}" → ${resolved ? 'OK' : '⚠ WILL FAIL (404)'}`);
    }

    await conn.close();
    console.log('\nDone.');
}

run().catch(e => { console.error(e); process.exit(1); });
