const mongoose = require('mongoose');
const { tenantCollection } = require('../middleware/tenant');

const req = { account_number: '5096' };

async function run() {
    try {
        const tenantConnection = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5096', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        await new Promise(r => tenantConnection.once('open', r));
        console.log("Connected to Tenant DB");

        const Document = await tenantCollection(req, 'Document');

        const drafts = await Document.find({ isTemplate: false }).sort({ createdAt: -1 }).limit(5).lean();
        console.log(`Found ${drafts.length} drafts:`);
        drafts.forEach((d, idx) => {
            console.log(`\nDraft ${idx + 1}: ID: ${d._id}, Name: "${d.name}"`);
            console.log('Pages content:');
            (d.pages || []).forEach((p, pIdx) => {
                console.log(`  Page ${pIdx + 1}: ${p.content}`);
            });
        });

        await tenantConnection.close();
    } catch (e) {
        console.error(e);
    }
}

run();
