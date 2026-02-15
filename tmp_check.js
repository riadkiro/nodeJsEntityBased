const mongoose = require('mongoose');

async function main() {
    const conn = await mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001').asPromise();

    // Check record
    const r = await conn.db.collection('records').findOne({ title: /Chaoui/i });
    console.log('Record title:', r?.title);
    console.log('classificationValues:');
    r?.classificationValues?.forEach(cv => {
        console.log('  cid:', String(cv.classificationId), 'type:', cv.classificationId?.constructor?.name);
        console.log('  oid:', String(cv.optionId), 'type:', cv.optionId?.constructor?.name);
    });

    // Count records by option for the status classification
    const statusClsId = '6989923bcf4f1191d69f8b29';
    const options = [
        { id: '6989923bcf4f1191d69f8b2a', label: "Salle d'attente" },
        { id: '6989923bcf4f1191d69f8b2b', label: 'Patient suivant' },
        { id: '6989923bcf4f1191d69f8b2c', label: 'En cours' },
        { id: '6989923bcf4f1191d69f8b2d', label: 'Terminé' },
        { id: '6989923bcf4f1191d69f8b2e', label: 'Absent' },
    ];

    const allRecords = await conn.db.collection('records').find({ entityId: new mongoose.Types.ObjectId('697c20e04b70c78bbe2e8702') }).toArray();
    console.log('\nTotal records:', allRecords.length);

    for (const opt of options) {
        const count = allRecords.filter(r => {
            return r.classificationValues?.some(cv => {
                return String(cv.classificationId) === statusClsId && String(cv.optionId) === opt.id;
            });
        }).length;
        console.log(`  ${opt.label}: ${count} records`);
    }

    const noStatus = allRecords.filter(r => {
        return !r.classificationValues?.some(cv => String(cv.classificationId) === statusClsId);
    }).length;
    console.log(`  Sans statut: ${noStatus} records`);

    await conn.close();
}

main();
