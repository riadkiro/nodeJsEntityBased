const mongoose = require('mongoose');

(async () => {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));

    const oldClassifId = '698af7f4f2100f0facaafa74'; // consultation_status
    const newClassifId = '6989923bcf4f1191d69f8b29'; // progression-consultation

    // Mapping old option IDs → new option IDs
    const optionMap = {
        '698af7f4f2100f0facaafa75': '6989923bcf4f1191d69f8b2a', // Programmée → Salle d'attente
        '698af7f4f2100f0facaafa76': '6989923bcf4f1191d69f8b2a', // En salle d'attente → Salle d'attente
        '698af7f4f2100f0facaafa77': '6989923bcf4f1191d69f8b2c', // En cours → En cours
        '698af7f4f2100f0facaafa78': '6989923bcf4f1191d69f8b2d', // Terminée → Terminé
        '698af7f4f2100f0facaafa79': '6989923bcf4f1191d69f8b2e'  // Annulée → Absent
    };

    const consultEntityId = new mongoose.Types.ObjectId('697c20e04b70c78bbe2e8702');

    // Find all records that have the old consultation_status classification
    const records = await conn.db.collection('records').find({
        entityId: consultEntityId,
        'classificationValues.classificationId': new mongoose.Types.ObjectId(oldClassifId)
    }).toArray();

    console.log('Records to migrate:', records.length);

    let migrated = 0;
    for (const rec of records) {
        const newClassifValues = rec.classificationValues.map(cv => {
            if (cv.classificationId.toString() === oldClassifId) {
                const newOptId = optionMap[cv.optionId.toString()];
                if (newOptId) {
                    return {
                        classificationId: new mongoose.Types.ObjectId(newClassifId),
                        optionId: new mongoose.Types.ObjectId(newOptId),
                        _id: cv._id
                    };
                }
            }
            return cv;
        });

        await conn.db.collection('records').updateOne(
            { _id: rec._id },
            { $set: { classificationValues: newClassifValues } }
        );
        migrated++;
    }

    console.log('Migrated:', migrated, 'records');

    // Delete the old consultation_status classification
    const delResult = await conn.db.collection('classifications').deleteOne({
        _id: new mongoose.Types.ObjectId(oldClassifId)
    });
    console.log('Deleted consultation_status classification:', delResult.deletedCount);

    await conn.close();
    console.log('Done!');
})();
