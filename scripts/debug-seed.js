const mongoose = require('mongoose');
const fs = require('fs');

async function test() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));

    let output = '';
    const log = (msg) => { output += msg + '\n'; };

    // Get entity IDs
    const entities = await conn.db.collection('entities').find({}).toArray();
    const traitEntity = entities.find(e => e.slug === 'traitements');
    const pathoEntity = entities.find(e => e.slug === 'pathologies');
    const patientEntity = entities.find(e => e.slug === 'patients');

    if (!traitEntity) { log('ERROR: traitements entity not found!'); }
    if (!pathoEntity) { log('ERROR: pathologies entity not found!'); }

    // Get relation keys
    const traitRelKey = traitEntity?.relations?.[0]?.key;
    const pathoRelKey = pathoEntity?.relations?.[0]?.key;
    log('Traitement relation key: ' + traitRelKey);
    log('Pathologie relation key: ' + pathoRelKey);

    // Get a patient
    const patient = await conn.db.collection('records').findOne({ entityId: patientEntity._id });
    log('Patient: ' + patient?.title + ' (' + patient?._id + ')');

    // Try inserting a test record
    try {
        const result = await conn.db.collection('records').insertOne({
            entityId: traitEntity._id,
            title: 'TEST Amoxicilline',
            computedTitle: 'TEST Amoxicilline',
            customFields: [],
            relations: [{ relationKey: traitRelKey, value: patient._id }],
            meta: { createdByPreset: 'cabinet-medical', isDemo: true },
            createdAt: new Date(),
            updatedAt: new Date()
        });
        log('SUCCESS: Inserted test record: ' + result.insertedId);

        // Clean it up
        await conn.db.collection('records').deleteOne({ _id: result.insertedId });
        log('Cleaned up test record');
    } catch (err) {
        log('ERROR inserting: ' + err.message);
        log(err.stack);
    }

    // Now try running the actual seed with error catching to see what fails
    log('\n=== Checking seed script for issues ===');
    try {
        const seedModule = require('./seed-cabinet-medical');
        log('Seed module exports: ' + Object.keys(seedModule));
    } catch (err) {
        log('ERROR loading seed: ' + err.message);
    }

    fs.writeFileSync('scripts/debug-output2.txt', output);
    console.log('Output written to scripts/debug-output2.txt');
    await conn.close();
}

test().catch(e => { 
    fs.writeFileSync('scripts/debug-output2.txt', 'FATAL: ' + e.message + '\n' + e.stack);
    console.error(e);
});
