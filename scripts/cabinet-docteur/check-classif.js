const mongoose = require('mongoose');

(async () => {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));

    const consultEntityId = new mongoose.Types.ObjectId('697c20e04b70c78bbe2e8702');
    const progClassifId = '6989923bcf4f1191d69f8b29';

    const records = await conn.db.collection('records').find({ entityId: consultEntityId }).toArray();

    let withProg = 0, withoutProg = 0, withoutAny = 0;
    const sansStatut = [];

    records.forEach(r => {
        const hasProg = r.classificationValues?.some(cv =>
            cv.classificationId?.toString() === progClassifId
        );
        if (hasProg) {
            withProg++;
        } else {
            withoutProg++;
            sansStatut.push({
                title: r.title,
                classifValues: r.classificationValues?.map(cv => ({
                    classifId: cv.classificationId?.toString(),
                    optionId: cv.optionId?.toString()
                }))
            });
        }
        if (!r.classificationValues || r.classificationValues.length === 0) withoutAny++;
    });

    console.log('Total records:', records.length);
    console.log('With progression-consultation:', withProg);
    console.log('Without progression-consultation:', withoutProg);
    console.log('Without any classification:', withoutAny);
    console.log('\nFirst 5 SANS STATUT:');
    sansStatut.slice(0, 5).forEach(s => console.log(JSON.stringify(s)));

    await conn.close();
})();
