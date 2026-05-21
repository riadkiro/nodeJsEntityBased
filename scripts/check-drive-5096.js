/**
 * Script to directly check drive data for account 5096
 * Run: node scripts/check-drive-5096.js
 */
const mongoose = require('mongoose');

async function check() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    await new Promise(r => conn.once('open', r));
    
    const Record = conn.model('Record', new mongoose.Schema({}, { strict: false }));
    const Entity = conn.model('Entity', new mongoose.Schema({}, { strict: false }));
    
    // Find records with attachments
    const records = await Record.find({ 'attachments.0': { $exists: true } })
        .select('title computedTitle entityId attachments driveFolders')
        .lean();
    
    console.log(`Found ${records.length} records with attachments`);
    
    for (const r of records) {
        const entity = await Entity.findById(r.entityId).select('name').lean();
        const attachments = r.attachments || [];
        
        // Group by folder
        const byFolder = {};
        const rootFiles = [];
        attachments.forEach(a => {
            if (a.folder) {
                if (!byFolder[a.folder]) byFolder[a.folder] = [];
                byFolder[a.folder].push(a.originalName);
            } else {
                rootFiles.push(a.originalName);
            }
        });
        
        console.log(`\n[${entity?.name || 'Unknown'}] ${r.computedTitle || r.title}`);
        console.log(`  Total attachments: ${attachments.length}`);
        console.log(`  Root files: ${rootFiles.length}`, rootFiles.slice(0, 3));
        console.log(`  Folders: ${Object.keys(byFolder).length}`, Object.entries(byFolder).map(([k,v]) => `${k}(${v.length})`));
        console.log(`  driveFolders: ${(r.driveFolders || []).join(', ')}`);
    }
    
    await conn.close();
    console.log('\nDone.');
}

check().catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
});
