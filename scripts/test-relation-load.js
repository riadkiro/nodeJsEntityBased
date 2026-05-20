const mongoose = require('mongoose');

async function main() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    await new Promise(r => conn.once('open', r));

    console.log("Connected to saas_app_rb_5096");

    const EntityModel = conn.model('Entity', new mongoose.Schema({}, { strict: false }));
    const RecordModel = conn.model('Record', new mongoose.Schema({}, { strict: false }));

    const entity = await EntityModel.findOne({ slug: 'entreprises' }).lean();
    const record = await RecordModel.findById('6a0b4221f1c5ddd28f737c99').lean();

    console.log("Record title:", record.title);

    // Mimic the fixed modulePage logic
    const recordValues = {};
    (record.customFields || []).forEach(cv => {
        const fid = (cv.field_id?._id || cv.field_id || '').toString();
        if (fid) recordValues[fid] = cv.value;
    });

    // Merge relation values
    (record.relations || []).forEach(rv => {
        if (rv.relationKey) recordValues[rv.relationKey] = rv.value;
    });

    console.log("\n--- Resolved Custom Fields ---");
    // Find relation custom field
    const customFields = entity.customFields || [];
    for (const cfId of customFields) {
        const cf = await conn.db.collection('fieldtemplates').findOne({ _id: new mongoose.Types.ObjectId(cfId) });
        if (!cf) continue;

        const val = recordValues[cf._id.toString()];
        console.log(`Field Name: ${cf.name} (${cf.type})`);
        console.log(`Raw value in recordValues:`, val);

        if (cf.type === 'relation') {
            let displayVal = '';
            let relRecords = [];
            if (val) {
                const ids = Array.isArray(val) ? val : [val];
                const validIds = ids.filter(id => id && mongoose.Types.ObjectId.isValid(id));
                if (validIds.length > 0) {
                    const relRecs = await RecordModel.find({ _id: { $in: validIds } }).select('title _id').lean();
                    relRecords = relRecs.map(r => ({ _id: r._id.toString(), title: r.title || 'Sans titre' }));
                    displayVal = relRecords.map(r => r.title).join(', ');
                }
            }
            console.log(`  Resolved Display Value: "${displayVal}"`);
            console.log(`  Resolved Records:`, relRecords);
        }
    }

    await conn.close();
}

main().catch(console.error);
