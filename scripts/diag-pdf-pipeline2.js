/**
 * Diagnostic: Check for accumulated drafts and recently generated PDFs
 */
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function run() {
    const conn = await mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001').asPromise();
    
    // 1. Count ALL draft documents
    const docCol = conn.db.collection('documents');
    const allDrafts = await docCol.find({ isDraft: true }).sort({ createdAt: -1 }).toArray();
    console.log(`\n=== ${allDrafts.length} DRAFT DOCUMENTS FOUND ===`);
    for (const d of allDrafts) {
        console.log(`  ${d._id} | "${d.name}" | created: ${d.createdAt} | recordId: ${d.draftRecordId || 'N/A'}`);
    }

    // 2. Check recently created PDF files on disk
    const attachDir = path.join(__dirname, '../private_uploads/attachments/5096');
    console.log(`\n=== PDF FILES ON DISK (${attachDir}) ===`);
    if (fs.existsSync(attachDir)) {
        const files = fs.readdirSync(attachDir)
            .filter(f => f.endsWith('.pdf'))
            .map(f => ({ name: f, stat: fs.statSync(path.join(attachDir, f)) }))
            .sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs)
            .slice(0, 15);
        
        for (const f of files) {
            console.log(`  ${f.name} | ${f.stat.size} bytes | ${f.stat.mtime.toISOString()}`);
        }
        
        if (files.length === 0) {
            console.log('  ⚠ NO PDF FILES FOUND in this directory');
        }
    } else {
        console.log('  ⚠ DIRECTORY DOES NOT EXIST');
    }

    // 3. Check ALL records for recent attachments (last 24 hours)
    const recordCol = conn.db.collection('records');
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Find records with any recent attachments
    const recentRecords = await recordCol.find({
        'attachments.uploadedAt': { $gte: cutoff }
    }).toArray();

    console.log(`\n=== RECORDS WITH RECENT ATTACHMENTS (last 24h) ===`);
    for (const rec of recentRecords) {
        const recentAtts = (rec.attachments || []).filter(a => a.uploadedAt && new Date(a.uploadedAt) >= cutoff);
        console.log(`\nRecord: ${rec._id} | "${rec.computedTitle || rec.title}"`);
        for (const a of recentAtts) {
            console.log(`  ${a.filename} | ${a.size} bytes | generated: ${a.isGenerated} | mime: ${a.mimeType} | date: ${a.uploadedAt}`);
            // Check file existence
            const fp = path.join(attachDir, a.filename);
            console.log(`  File exists: ${fs.existsSync(fp)}`);
        }
    }

    // 4. Also check the Documents Hub data (documents collection with specific flags)
    const docHubDocs = await docCol.find({ 
        isTemplate: false, 
        isDraft: { $ne: true } 
    }).sort({ createdAt: -1 }).limit(5).toArray();

    console.log(`\n=== NON-DRAFT, NON-TEMPLATE DOCUMENTS ===`);
    for (const d of docHubDocs) {
        console.log(`  ${d._id} | "${d.name}" | status: ${d.status} | created: ${d.createdAt}`);
    }

    await conn.close();
    console.log('\nDone.');
}

run().catch(e => { console.error(e); process.exit(1); });
