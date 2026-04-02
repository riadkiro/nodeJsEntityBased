const mongoose = require('mongoose');

async function createPresets() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));

    const schema = await conn.db.collection('lineschemas').findOne({ slug: 'traitement' });
    if (!schema) { console.log('ERROR: traitement schema not found!'); await conn.close(); return; }

    console.log('Found traitement schema:', schema._id);

    const presets = [
        {
            name: 'Protocole Angine',
            slug: 'protocole_angine',
            description: 'Traitement standard pour angine bactérienne',
            icon: 'solar:clipboard-check-bold-duotone',
            color: '#ef4444',
            schemaId: schema._id,
            presetRows: [
                { lineType: 'treatment', values: { treatment: '', treatment_label: 'Amoxicilline 500mg', moment: ['morning', 'noon', 'evening'], frequency: ['3x_day'], duration: ['7_days'], instructions: 'Prendre pendant les repas' }, order: 0 },
                { lineType: 'treatment', values: { treatment: '', treatment_label: 'Doliprane 1000mg', moment: ['morning', 'evening'], frequency: ['2x_day'], duration: ['5_days'], instructions: 'Si douleur ou fièvre > 38.5°C' }, order: 1 }
            ],
            scope: 'workspace', recordId: null, tags: ['angine', 'ORL'], createdAt: new Date()
        },
        {
            name: 'Protocole Grippe',
            slug: 'protocole_grippe',
            description: 'Traitement symptomatique de la grippe',
            icon: 'solar:clipboard-check-bold-duotone',
            color: '#3b82f6',
            schemaId: schema._id,
            presetRows: [
                { lineType: 'treatment', values: { treatment: '', treatment_label: 'Doliprane 1000mg', moment: ['morning', 'noon', 'evening'], frequency: ['3x_day'], duration: ['7_days'], instructions: 'Espacer de 6h minimum' }, order: 0 },
                { lineType: 'treatment', values: { treatment: '', treatment_label: 'Toplexil', moment: ['bedtime'], frequency: ['1x_day'], duration: ['5_days'], instructions: 'Au coucher si toux' }, order: 1 }
            ],
            scope: 'workspace', recordId: null, tags: ['grippe', 'virus'], createdAt: new Date()
        },
        {
            name: 'Protocole HTA',
            slug: 'protocole_hta',
            description: 'Traitement de fond hypertension artérielle',
            icon: 'solar:heart-pulse-bold-duotone',
            color: '#22c55e',
            schemaId: schema._id,
            presetRows: [
                { lineType: 'treatment', values: { treatment: '', treatment_label: 'Amlodipine 5mg', moment: ['morning'], frequency: ['1x_day'], duration: ['permanent'], instructions: 'Prise quotidienne le matin' }, order: 0 },
                { lineType: 'treatment', values: { treatment: '', treatment_label: 'Bisoprolol 5mg', moment: ['morning'], frequency: ['1x_day'], duration: ['permanent'], instructions: 'Ne pas arrêter brutalement' }, order: 1 }
            ],
            scope: 'workspace', recordId: null, tags: ['HTA', 'cardio'], createdAt: new Date()
        }
    ];

    await conn.db.collection('gridschematemplates').deleteMany({});
    await conn.db.collection('gridschematemplates').insertMany(presets);
    console.log('Created', presets.length, 'presets');

    // Verify API would work
    const verify = await conn.db.collection('gridschematemplates').find({ schemaId: schema._id }).toArray();
    console.log('Verify:', verify.length, 'presets found for schemaId', schema._id);
    verify.forEach(p => console.log(`  ✅ ${p.name}`));

    await conn.close();
}

createPresets().catch(console.error);
