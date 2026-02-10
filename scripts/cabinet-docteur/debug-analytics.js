const mongoose = require('mongoose');

async function main() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));
    const db = conn.db;

    const entity = await db.collection('entities').findOne({ slug: 'consultation' });
    const statusCls = await db.collection('classifications').findOne({ key: 'consultation_status' });
    const urgencyCls = await db.collection('classifications').findOne({ key: 'urgency_level' });
    const rdvAt = await db.collection('fieldtemplates').findOne({ name: 'rdv_at' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tom = new Date(today);
    tom.setDate(tom.getDate() + 1);

    const enSalle = statusCls.options.find(o => o.label === "En salle d'attente");
    const enCours = statusCls.options.find(o => o.label === 'En cours');
    const terminee = statusCls.options.find(o => o.label === 'Terminée');
    const urgentOpt = urgencyCls.options.find(o => o.label === 'Urgent');

    console.log('=== IDs de reference ===');
    console.log('Entity consultation:', entity._id.toString());
    console.log('rdv_at field:', rdvAt._id.toString());
    console.log('Status classification:', statusCls._id.toString());
    console.log('  En salle attente optionId:', enSalle._id.toString());
    console.log('  En cours optionId:', enCours._id.toString());
    console.log('  Terminee optionId:', terminee._id.toString());
    console.log('');

    // Find today's records (same query as API)
    const recs = await db.collection('records').find({
        entityId: entity._id,
        customFields: {
            $elemMatch: {
                field_id: rdvAt._id,
                value: { $gte: today, $lt: tom }
            }
        }
    }).toArray();

    console.log(`=== ${recs.length} CONSULTATIONS DU JOUR ===`);
    console.log('');

    const waitingRoom = [];
    recs.forEach(r => {
        const cv = r.classificationValues || [];
        const statusCV = cv.find(v => v.classificationId?.toString() === statusCls._id.toString());
        const statusOpt = statusCV ? statusCls.options.find(o => o._id.toString() === statusCV.optionId?.toString()) : null;
        const isWaiting = statusCV && (
            statusCV.optionId?.toString() === enSalle._id.toString() ||
            statusCV.optionId?.toString() === enCours._id.toString()
        );
        const isUrgent = cv.some(v =>
            v.classificationId?.toString() === urgencyCls._id.toString() &&
            v.optionId?.toString() === urgentOpt?._id.toString()
        );

        const marker = isWaiting ? '>>> SALLE ATTENTE' : '                  ';
        console.log(`${marker} | ${r.title} | statut: ${statusOpt?.label || 'AUCUN STATUT'} | urgent: ${isUrgent} | classifValues: ${cv.length}`);

        if (isWaiting) {
            waitingRoom.push({ title: r.title, status: statusOpt?.label, urgent: isUrgent });
        }
    });

    console.log('');
    console.log(`=== SALLE D'ATTENTE: ${waitingRoom.length} personnes ===`);
    waitingRoom.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.title} (${p.status})${p.urgent ? ' URGENT' : ''}`);
    });

    // Also show a sample record's classificationValues to verify structure
    const sampleWR = recs.find(r => {
        const cv = r.classificationValues || [];
        return cv.some(v =>
            v.classificationId?.toString() === statusCls._id.toString() &&
            (v.optionId?.toString() === enSalle._id.toString() || v.optionId?.toString() === enCours._id.toString())
        );
    });
    if (sampleWR) {
        console.log('');
        console.log('=== EXEMPLE record en salle attente ===');
        console.log('title:', sampleWR.title);
        console.log('classificationValues:', JSON.stringify(sampleWR.classificationValues));
    }

    await conn.close();
}

main().catch(e => { console.error(e); process.exit(1); });
