const mongoose = require('mongoose');

async function main() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    await new Promise(r => conn.once('open', r));
    
    const Record = conn.model('Record', new mongoose.Schema({}, { strict: false, collection: 'records' }));
    
    // Find records with attachments missing _id
    const records = await Record.find({
        'attachments': { $elemMatch: { _id: { $exists: false } } }
    }).lean();
    
    console.log(`Found ${records.length} records with attachments missing _id`);
    
    for (const rec of records) {
        const atts = rec.attachments || [];
        let fixed = 0;
        
        for (let i = 0; i < atts.length; i++) {
            if (!atts[i]._id) {
                atts[i]._id = new mongoose.Types.ObjectId();
                fixed++;
            }
        }
        
        if (fixed > 0) {
            await Record.updateOne(
                { _id: rec._id },
                { $set: { attachments: atts } }
            );
            console.log(`  Fixed ${fixed} attachments in record "${rec.title}" (${rec._id})`);
        }
    }
    
    console.log('\nDone!');
    await conn.close();
}

main().catch(e => { console.error(e); process.exit(1); });
