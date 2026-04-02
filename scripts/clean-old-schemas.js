const mongoose = require('mongoose');

async function cleanOldSchemas() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));

    // Delete the old treatment schemas that are now merged into 'traitement'
    const oldSlugs = ['prescription_v1', 'consultation_treatment_v1', 'patient_treatment_followup_v1'];
    
    for (const slug of oldSlugs) {
        const result = await conn.db.collection('lineschemas').deleteMany({ slug });
        console.log(`Deleted ${slug}: ${result.deletedCount} docs`);
    }

    // Also delete the test preset we created earlier
    await conn.db.collection('gridschematemplates').deleteMany({});
    console.log('Cleared gridschematemplates');

    // Delete orphaned draft documents
    await conn.db.collection('documents').deleteMany({ isDraft: true });
    console.log('Cleared draft documents');

    // Show remaining schemas
    const remaining = await conn.db.collection('lineschemas').find({}).toArray();
    console.log('\nRemaining line schemas:');
    remaining.forEach(s => console.log(`  ${s._id} - ${s.name} (${s.slug})`));

    await conn.close();
}

cleanOldSchemas().catch(console.error);
