/**
 * Seed Script: Events System Entity
 * 
 * Creates the 'events' entity with:
 * - System fields (heure_debut, heure_fin, duree_evenement, lieu_evenement, type_evenement, notes_evenement)
 * - Status classification (Planifié, Confirmé, En cours, Terminé, Annulé)
 * - Type classification (Consultation, Réunion, Rappel, Tâche, Personnel, Autre)
 * 
 * Idempotent: safe to run multiple times.
 * 
 * Usage: node scripts/seed-events-entity.js
 */
const mongoose = require('mongoose');

const DB_URI = 'mongodb://127.0.0.1:27017/saas_app_rb_5001';

async function seed() {
    const conn = mongoose.createConnection(DB_URI);
    await new Promise(r => conn.once('open', r));
    console.log('✅ Connected to', DB_URI);

    const db = conn.db;
    const entities = db.collection('entities');
    const fieldTemplates = db.collection('fieldtemplates');
    const classifications = db.collection('classifications');

    // ── 1. Check if events entity already exists ──
    let eventsEntity = await entities.findOne({ slug: 'events' });
    if (eventsEntity) {
        console.log('⚠️  Events entity already exists:', eventsEntity._id);
        console.log('   Updating if needed...');
    }

    // ── 2. Create / find field templates ──
    const fieldDefs = [
        {
            name: 'heure_debut',
            label: 'Heure de début',
            type: 'date',
            subType: 'datetime',
            icon: 'solar:clock-circle-bold-duotone',
            width: 'half',
            category: 'dates',
            isSystem: true,
            ui: { icon: 'solar:clock-circle-bold-duotone', rows: 1, width: 'half' }
        },
        {
            name: 'heure_fin',
            label: 'Heure de fin',
            type: 'date',
            subType: 'datetime',
            icon: 'solar:clock-square-bold-duotone',
            width: 'half',
            category: 'dates',
            isSystem: true,
            ui: { icon: 'solar:clock-square-bold-duotone', rows: 1, width: 'half' }
        },
        {
            name: 'duree_evenement',
            label: 'Durée (min)',
            type: 'number',
            icon: 'solar:stopwatch-bold-duotone',
            width: 'half',
            category: 'dates',
            isSystem: true,
            ui: { icon: 'solar:stopwatch-bold-duotone', rows: 1, width: 'half' },
            type_config: { min: 0, max: 1440, step: 5 }
        },
        {
            name: 'lieu_evenement',
            label: 'Lieu',
            type: 'string',
            icon: 'solar:map-point-bold-duotone',
            width: 'full',
            category: 'popular',
            isSystem: true,
            ui: { icon: 'solar:map-point-bold-duotone', rows: 1, width: 'full' },
            placeholder: 'Cabinet, Salle A, Domicile...'
        },
        {
            name: 'type_evenement',
            label: "Type d'événement",
            type: 'select',
            icon: 'solar:tag-bold-duotone',
            width: 'half',
            category: 'workflow',
            isSystem: true,
            ui: { icon: 'solar:tag-bold-duotone', rows: 1, width: 'half' },
            type_config: {
                options: [
                    { label: 'Consultation', value: 'consultation' },
                    { label: 'Réunion', value: 'reunion' },
                    { label: 'Rappel', value: 'rappel' },
                    { label: 'Tâche', value: 'tache' },
                    { label: 'Personnel', value: 'personnel' },
                    { label: 'Autre', value: 'autre' }
                ]
            }
        },
        {
            name: 'notes_evenement',
            label: 'Notes',
            type: 'text',
            icon: 'solar:notes-bold-duotone',
            width: 'full',
            category: 'content',
            isSystem: true,
            ui: { icon: 'solar:notes-bold-duotone', rows: 3, width: 'full' },
            placeholder: 'Notes sur cet événement...'
        }
    ];

    const fieldIds = [];
    for (const def of fieldDefs) {
        let field = await fieldTemplates.findOne({ name: def.name });
        if (!field) {
            const result = await fieldTemplates.insertOne({
                ...def,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            field = { _id: result.insertedId, ...def };
            console.log(`  ✅ Created field: ${def.name} [${field._id}]`);
        } else {
            console.log(`  ⏩ Field exists: ${def.name} [${field._id}]`);
        }
        fieldIds.push(field._id);
    }

    // ── 3. Create / find status classification ──
    let statusCls = await classifications.findOne({ key: 'event_status' });
    if (!statusCls) {
        const result = await classifications.insertOne({
            name: 'Statut événement',
            key: 'event_status',
            allowMultiple: false,
            options: [
                { _id: new mongoose.Types.ObjectId(), label: 'Planifié', color: '#3b82f6', order: 0 },
                { _id: new mongoose.Types.ObjectId(), label: 'Confirmé', color: '#10b981', order: 1 },
                { _id: new mongoose.Types.ObjectId(), label: 'En cours', color: '#f59e0b', order: 2 },
                { _id: new mongoose.Types.ObjectId(), label: 'Terminé', color: '#6b7280', order: 3 },
                { _id: new mongoose.Types.ObjectId(), label: 'Annulé', color: '#ef4444', order: 4 }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        });
        statusCls = await classifications.findOne({ _id: result.insertedId });
        console.log('  ✅ Created status classification:', statusCls._id);
    } else {
        console.log('  ⏩ Status classification exists:', statusCls._id);
    }

    // ── 4. Create / find type classification ──
    let typeCls = await classifications.findOne({ key: 'event_type' });
    if (!typeCls) {
        const result = await classifications.insertOne({
            name: "Type d'événement",
            key: 'event_type',
            allowMultiple: false,
            options: [
                { _id: new mongoose.Types.ObjectId(), label: 'Consultation', color: '#4361ee', order: 0 },
                { _id: new mongoose.Types.ObjectId(), label: 'Réunion', color: '#8b5cf6', order: 1 },
                { _id: new mongoose.Types.ObjectId(), label: 'Rappel', color: '#f59e0b', order: 2 },
                { _id: new mongoose.Types.ObjectId(), label: 'Tâche', color: '#10b981', order: 3 },
                { _id: new mongoose.Types.ObjectId(), label: 'Personnel', color: '#ec4899', order: 4 },
                { _id: new mongoose.Types.ObjectId(), label: 'Autre', color: '#6b7280', order: 5 }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        });
        typeCls = await classifications.findOne({ _id: result.insertedId });
        console.log('  ✅ Created type classification:', typeCls._id);
    } else {
        console.log('  ⏩ Type classification exists:', typeCls._id);
    }

    // ── 5. Create or update the events entity ──
    const entityData = {
        name: 'Événement',
        nameSingular: 'Événement',
        namePlural: 'Événements',
        slug: 'events',
        description: 'Événements et rendez-vous liés aux enregistrements',
        icon: 'solar:calendar-mark-bold-duotone',
        color: '#14b8a6',
        isSystem: true,
        order: 100,
        enabledStandardFields: ['title', 'date', 'description'],
        customFields: fieldIds,
        statusClassification: statusCls._id,
        classifications: [typeCls._id],
        relations: [],
        referenceTitleTokens: [{ t: 'field', id: 'title' }],
        updatedAt: new Date()
    };

    if (!eventsEntity) {
        entityData.createdAt = new Date();
        const result = await entities.insertOne(entityData);
        console.log('\n✅ Created events entity:', result.insertedId);
    } else {
        await entities.updateOne({ _id: eventsEntity._id }, { $set: entityData });
        console.log('\n✅ Updated events entity:', eventsEntity._id);
    }

    // ── 6. Summary ──
    console.log('\n═══════════════════════════════════════');
    console.log('  Events Entity Setup Complete!');
    console.log('  Fields:', fieldIds.length);
    console.log('  Status Classification:', statusCls._id);
    console.log('  Type Classification:', typeCls._id);
    console.log('═══════════════════════════════════════\n');

    await conn.close();
    process.exit(0);
}

seed().catch(e => {
    console.error('❌ Seed error:', e);
    process.exit(1);
});
