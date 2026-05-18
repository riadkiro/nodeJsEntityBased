const mongoose = require('mongoose');

async function main() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    await new Promise(r => conn.once('open', r));
    
    // Find the record for TechCorp France (entreprises)
    const Record = conn.model('Record', new mongoose.Schema({}, { strict: false, collection: 'records' }));
    
    // Look for records with generated attachments
    const records = await Record.find({
        'attachments.isGenerated': true
    }).select('title attachments').lean();
    
    for (const rec of records) {
        console.log(`\n=== Record: ${rec.title} (${rec._id}) ===`);
        const genAtts = (rec.attachments || []).filter(a => a.isGenerated);
        console.log(`Generated attachments: ${genAtts.length}`);
        genAtts.forEach(a => {
            console.log(`  _id: ${a._id} (type: ${typeof a._id})`);
            console.log(`    name: ${a.originalName || a.generatedFromName}`);
            console.log(`    isValid ObjectId: ${mongoose.Types.ObjectId.isValid(String(a._id))}`);
        });
        
        // Also check total attachments
        const allAtts = rec.attachments || [];
        console.log(`Total attachments: ${allAtts.length}`);
        allAtts.forEach(a => {
            console.log(`  _id: ${a._id}, name: ${a.originalName || 'N/A'}, isGenerated: ${a.isGenerated || false}`);
        });
    }
    
    await conn.close();
}

main().catch(e => { console.error(e); process.exit(1); });
