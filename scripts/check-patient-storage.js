const mongoose = require('mongoose');
async function main() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_9194');
    await new Promise(r => conn.once('open', r));

    // Check if the Symptômes target entity exists
    const targetId = '69ccfabf738ff763a647e164';
    const target = await conn.db.collection('entities').findOne({ _id: new mongoose.Types.ObjectId(targetId) });
    console.log('Symptômes target entity:', target ? `${target.name} (${target.slug})` : 'NOT FOUND');
    
    // Check Patient target entity
    const patientTarget = await conn.db.collection('entities').findOne({ _id: new mongoose.Types.ObjectId('69ccfabf738ff763a647e155') });
    console.log('Patient target entity:', patientTarget ? `${patientTarget.name} (${patientTarget.slug})` : 'NOT FOUND');

    // Now simulate what the controller does
    const entity = await conn.db.collection('entities').findOne({ slug: 'consultations' });
    
    // For each relation, check what targetEntity would look like after populate
    for (const rel of (entity.relations || [])) {
        if (rel.showInForm === false) continue;
        const te = rel.targetEntity;
        const teDoc = await conn.db.collection('entities').findOne({ _id: te });
        console.log(`\nRelation "${rel.label}":`);
        console.log(`  targetEntity raw: ${te} (type: ${typeof te})`);
        console.log(`  targetEntity resolved: ${teDoc ? teDoc.name : 'NOT FOUND'}`);
        console.log(`  cardinality: ${rel.cardinality}`);
        const card = rel.cardinality || 'many-to-one';
        const isMulti = card.includes('many-to-many') || card.includes('one-to-many');
        console.log(`  isMulti: ${isMulti}`);
    }

    await conn.close();
}
main().catch(console.error);
