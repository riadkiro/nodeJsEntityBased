/**
 * Link classifications to the Consultation entity
 * so they appear in the record edit sidebar
 */
const mongoose = require('mongoose');

async function main() {
    const dbName = 'saas_app_rb_5001';
    const conn = mongoose.createConnection(`mongodb://127.0.0.1:27017/${dbName}`);
    await new Promise(r => conn.once('open', r));
    console.log(`Connected to ${dbName}`);

    const db = conn.db;

    // 1. Find classifications
    const statusCls = await db.collection('classifications').findOne({ key: 'consultation_status' });
    const urgencyCls = await db.collection('classifications').findOne({ key: 'urgency_level' });
    const taskStatusCls = await db.collection('classifications').findOne({ key: 'task_status' });
    const taskPriorityCls = await db.collection('classifications').findOne({ key: 'task_priority' });

    console.log('consultation_status:', statusCls ? statusCls._id.toString() : 'NOT FOUND');
    console.log('urgency_level:', urgencyCls ? urgencyCls._id.toString() : 'NOT FOUND');
    console.log('task_status:', taskStatusCls ? taskStatusCls._id.toString() : 'NOT FOUND');
    console.log('task_priority:', taskPriorityCls ? taskPriorityCls._id.toString() : 'NOT FOUND');

    // 2. Find entities
    const consultEntity = await db.collection('entities').findOne({ slug: 'consultation' });
    const tacheEntity = await db.collection('entities').findOne({ slug: 'tache' });

    if (!consultEntity) { console.error('Consultation entity not found!'); process.exit(1); }
    console.log('\nConsultation entity:', consultEntity.name, consultEntity._id.toString());
    console.log('  current statusClassification:', consultEntity.statusClassification);
    console.log('  current classifications:', consultEntity.classifications);

    // 3. Link to Consultation entity
    const classifIds = [];
    if (statusCls) classifIds.push(statusCls._id);
    if (urgencyCls) classifIds.push(urgencyCls._id);

    const updateConsult = {
        $addToSet: { classifications: { $each: classifIds } }
    };
    // Also set statusClassification if not set
    if (statusCls && !consultEntity.statusClassification) {
        updateConsult.$set = { statusClassification: statusCls._id };
    }

    const resultConsult = await db.collection('entities').updateOne(
        { _id: consultEntity._id },
        updateConsult
    );
    console.log('\nConsultation updated:', resultConsult.modifiedCount ? 'YES' : 'already linked');

    // 4. Link to Tache entity (if exists)
    if (tacheEntity) {
        const taskClassifIds = [];
        if (taskStatusCls) taskClassifIds.push(taskStatusCls._id);
        if (taskPriorityCls) taskClassifIds.push(taskPriorityCls._id);

        const updateTask = {
            $addToSet: { classifications: { $each: taskClassifIds } }
        };
        if (taskStatusCls && !tacheEntity.statusClassification) {
            updateTask.$set = { statusClassification: taskStatusCls._id };
        }

        const resultTask = await db.collection('entities').updateOne(
            { _id: tacheEntity._id },
            updateTask
        );
        console.log('Tâche updated:', resultTask.modifiedCount ? 'YES' : 'already linked');
    }

    // 5. Verify
    const verify = await db.collection('entities').findOne({ _id: consultEntity._id });
    console.log('\nVerification - Consultation entity:');
    console.log('  statusClassification:', verify.statusClassification?.toString());
    console.log('  classifications:', verify.classifications?.map(c => c.toString()));

    await conn.close();
    console.log('\nDone!');
}

main().catch(e => { console.error(e); process.exit(1); });
