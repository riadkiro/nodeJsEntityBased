const mongoose = require('mongoose');
const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
conn.once('open', async () => {
    // Show task_priority classification
    const cls = await conn.db.collection('classifications').findOne({ key: 'task_priority' });
    if (cls) {
        console.log('task_priority Classification:', cls._id.toString());
        (cls.options || []).forEach(o => console.log('  -', o._id.toString(), o.label, o.color));
    }

    // Check what optionId format records use
    const entity = await conn.db.collection('entities').findOne({ slug: 'tache' });
    const recs = await conn.db.collection('records').find({ entityId: entity._id }).limit(2).toArray();
    recs.forEach(r => {
        console.log('\n' + r.title);
        (r.classificationValues || []).forEach(cv => {
            console.log('  cls:', typeof cv.classificationId, cv.classificationId?.toString());
            console.log('  opt:', typeof cv.optionId, cv.optionId?.toString());
        });
    });

    conn.close();
});
