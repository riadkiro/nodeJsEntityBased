/**
 * Seed DataGrid schemas (with form/table/tracking modes) and templates
 * Usage: node scripts/seed-datagrid-schemas.js <port>
 * Example: node scripts/seed-datagrid-schemas.js 5001
 */
const mongoose = require('mongoose');

// Register models
require('../models/line-schema.model');
require('../models/grid-schema-template.model');
require('../models/entity.model');

async function seed(port = 5001) {
    const dbName = `saas_app_rb_${port}`;
    const conn = mongoose.createConnection(`mongodb://127.0.0.1:27017/${dbName}`);
    await new Promise(r => conn.once('open', r));
    console.log(`[Seed] Connected to ${dbName}`);

    const LineSchema = conn.model('LineSchema', require('../models/line-schema.model').schema || mongoose.model('LineSchema').schema);
    const GridSchemaTemplate = conn.model('GridSchemaTemplate', require('../models/grid-schema-template.model').schema || mongoose.model('GridSchemaTemplate').schema);
    const Entity = conn.model('Entity', require('../models/entity.model').schema || mongoose.model('Entity').schema);

    // ═══════════════════════════════════════════════════════════
    // 1. Suivi Biologique (Medical Tracking - FORM + TIMESERIES)
    // ═══════════════════════════════════════════════════════════
    let suiviBioSchema = await LineSchema.findOneAndUpdate(
        { slug: 'suivi_biologique_v1' },
        {
            $set: {
                name: 'Suivi Biologique',
                slug: 'suivi_biologique_v1',
                description: 'Suivi de métriques biologiques (analyses sanguines, constantes, etc.)',
                inputMode: 'form',
                dataMode: 'timeseries',
                timeseriesConfig: {
                    dateColumn: 'date',
                    autoDate: true,
                    sortDirection: 'desc',
                    displayAs: 'cards'
                },
                analyticsConfig: {
                    enabled: true,
                    defaultView: 'data',
                    views: [
                        {
                            id: 'stats',
                            type: 'stat',
                            label: 'Résumé',
                            icon: 'solar:chart-square-bold-duotone',
                            config: {
                                cards: [
                                    { column: 'tsh', aggregation: 'last', label: 'Dernier TSH', unit: 'mUI/L' },
                                    { column: 'poids', aggregation: 'delta', label: 'Variation poids', unit: 'kg' },
                                    { column: 'bpm', aggregation: 'avg', label: 'FC moyenne', unit: 'bpm' },
                                    { column: 'tension_sys', aggregation: 'last', label: 'Dernière tension', unit: 'mmHg' }
                                ]
                            }
                        },
                        {
                            id: 'timeline',
                            type: 'timeline',
                            label: 'Historique',
                            icon: 'solar:clock-circle-bold-duotone',
                            config: { dateColumn: 'date' }
                        }
                    ]
                },
                lineTypes: ['default'],
                defaultLineType: 'default',
                columns: [
                    { key: 'date', label: 'Date', type: 'date', width: 'M', required: true, visible: true, order: 0, config: {} },
                    {
                        key: 'tsh', label: 'TSH', type: 'number', width: 'S', visible: true, order: 1,
                        config: { unit: 'mUI/L', normalRange: { min: 0.4, max: 4.0 }, decimals: 2 }
                    },
                    {
                        key: 't4l', label: 'T4L', type: 'number', width: 'S', visible: true, order: 2,
                        config: { unit: 'pmol/L', normalRange: { min: 12, max: 22 }, decimals: 1 }
                    },
                    {
                        key: 'poids', label: 'Poids', type: 'number', width: 'S', visible: true, order: 3,
                        config: { unit: 'kg', decimals: 1 }
                    },
                    {
                        key: 'tension_sys', label: 'Tension Sys.', type: 'number', width: 'S', visible: true, order: 4,
                        config: { unit: 'mmHg', normalRange: { min: 90, max: 140 } }
                    },
                    {
                        key: 'tension_dia', label: 'Tension Dia.', type: 'number', width: 'S', visible: true, order: 5,
                        config: { unit: 'mmHg', normalRange: { min: 60, max: 90 } }
                    },
                    {
                        key: 'bpm', label: 'FC', type: 'number', width: 'S', visible: true, order: 6,
                        config: { unit: 'bpm', normalRange: { min: 60, max: 100 } }
                    },
                    { key: 'notes', label: 'Notes', type: 'textarea', width: 'L', visible: true, order: 7, config: {} }
                ],
                totals: {}
            }
        },
        { upsert: true, new: true }
    );
    console.log(`[Seed] ✅ LineSchema: Suivi Biologique (${suiviBioSchema._id})`);

    // ═══════════════════════════════════════════════════════════
    // 2. Bilan Sanguin (Lab results - TABLE mode)
    // ═══════════════════════════════════════════════════════════
    let bilanSchema = await LineSchema.findOneAndUpdate(
        { slug: 'bilan_sanguin_v1' },
        {
            $set: {
                name: 'Bilan Sanguin',
                slug: 'bilan_sanguin_v1',
                description: 'Résultats d\'analyses de laboratoire',
                inputMode: 'table',
                dataMode: 'items',
                lineTypes: ['default'],
                defaultLineType: 'default',
                columns: [
                    { key: 'parametre', label: 'Paramètre', type: 'text', width: 'M', required: true, visible: true, order: 0, config: {} },
                    { key: 'resultat', label: 'Résultat', type: 'number', width: 'S', visible: true, order: 1, config: { decimals: 2 } },
                    { key: 'unite', label: 'Unité', type: 'text', width: 'S', visible: true, order: 2, config: {} },
                    { key: 'norme', label: 'Norme', type: 'text', width: 'M', visible: true, order: 3, config: {} },
                    {
                        key: 'interpretation', label: 'Interprétation', type: 'select', width: 'M', visible: true, order: 4,
                        config: {
                            source: 'manual',
                            options: [
                                { value: 'normal', label: '✅ Normal' },
                                { value: 'haut', label: '⬆️ Élevé' },
                                { value: 'bas', label: '⬇️ Bas' },
                                { value: 'critique', label: '🔴 Critique' }
                            ]
                        }
                    }
                ],
                totals: {}
            }
        },
        { upsert: true, new: true }
    );
    console.log(`[Seed] ✅ LineSchema: Bilan Sanguin (${bilanSchema._id})`);

    // ═══════════════════════════════════════════════════════════
    // 3. Suivi Pédiatrique (Pediatric - FORM + TIMESERIES)
    // ═══════════════════════════════════════════════════════════
    let seguiPedSchema = await LineSchema.findOneAndUpdate(
        { slug: 'suivi_pediatrique_v1' },
        {
            $set: {
                name: 'Suivi Pédiatrique',
                slug: 'suivi_pediatrique_v1',
                description: 'Suivi de croissance et développement de l\'enfant',
                inputMode: 'form',
                dataMode: 'timeseries',
                timeseriesConfig: {
                    dateColumn: 'date',
                    autoDate: true,
                    sortDirection: 'desc',
                    displayAs: 'cards'
                },
                analyticsConfig: {
                    enabled: true,
                    defaultView: 'data',
                    views: [
                        {
                            id: 'stats',
                            type: 'stat',
                            label: 'Résumé',
                            icon: 'solar:chart-square-bold-duotone',
                            config: {
                                cards: [
                                    { column: 'poids', aggregation: 'last', label: 'Dernier poids', unit: 'kg' },
                                    { column: 'taille', aggregation: 'last', label: 'Dernière taille', unit: 'cm' },
                                    { column: 'pc', aggregation: 'last', label: 'Dernier PC', unit: 'cm' },
                                    { column: 'poids', aggregation: 'delta', label: 'Δ Poids', unit: 'kg' }
                                ]
                            }
                        },
                        {
                            id: 'timeline',
                            type: 'timeline',
                            label: 'Historique',
                            icon: 'solar:clock-circle-bold-duotone',
                            config: { dateColumn: 'date' }
                        }
                    ]
                },
                lineTypes: ['default'],
                defaultLineType: 'default',
                columns: [
                    { key: 'date', label: 'Date', type: 'date', width: 'M', required: true, visible: true, order: 0, config: {} },
                    {
                        key: 'poids', label: 'Poids', type: 'number', width: 'S', visible: true, order: 1,
                        config: { unit: 'kg', decimals: 1 }
                    },
                    {
                        key: 'taille', label: 'Taille', type: 'number', width: 'S', visible: true, order: 2,
                        config: { unit: 'cm', decimals: 0 }
                    },
                    {
                        key: 'pc', label: 'Périm. crânien', type: 'number', width: 'S', visible: true, order: 3,
                        config: { unit: 'cm', decimals: 1 }
                    },
                    {
                        key: 'imc', label: 'IMC', type: 'number', width: 'S', visible: true, order: 4,
                        config: { decimals: 1 }
                    },
                    { key: 'notes', label: 'Notes', type: 'textarea', width: 'L', visible: true, order: 5, config: {} }
                ],
                totals: {}
            }
        },
        { upsert: true, new: true }
    );
    console.log(`[Seed] ✅ LineSchema: Suivi Pédiatrique (${seguiPedSchema._id})`);

    // ═══════════════════════════════════════════════════════════
    // TEMPLATES
    // ═══════════════════════════════════════════════════════════

    // Template: Suivi Thyroïde
    await GridSchemaTemplate.findOneAndUpdate(
        { slug: 'suivi_thyroide' },
        {
            $set: {
                name: 'Suivi Thyroïde',
                slug: 'suivi_thyroide',
                description: 'TSH, T4L, T3L — suivi de la fonction thyroïdienne',
                icon: 'solar:test-tube-bold-duotone',
                color: '#4361ee',
                schemaId: suiviBioSchema._id,
                scope: 'global',
                tags: ['médical', 'endocrinologie', 'thyroïde'],
                presetRows: [
                    { lineType: 'default', order: 0, values: { date: '', tsh: '', t4l: '', poids: '', notes: 'Bilan initial' } }
                ],
                formLayout: { columns: 3, fieldOrder: ['date', 'tsh', 't4l', 'poids', 'bpm', 'notes'] }
            }
        },
        { upsert: true, new: true }
    );
    console.log('[Seed] ✅ Template: Suivi Thyroïde');

    // Template: Suivi Grossesse
    await GridSchemaTemplate.findOneAndUpdate(
        { slug: 'suivi_grossesse' },
        {
            $set: {
                name: 'Suivi Grossesse',
                slug: 'suivi_grossesse',
                description: 'Poids, tension, BPM bébé — suivi prénatal complet',
                icon: 'solar:heart-pulse-bold-duotone',
                color: '#e7515a',
                schemaId: suiviBioSchema._id,
                scope: 'global',
                tags: ['médical', 'gynécologie', 'grossesse'],
                presetRows: [
                    { lineType: 'default', order: 0, values: { date: '', poids: '', tension_sys: '', tension_dia: '', bpm: '', notes: 'Première consultation' } }
                ],
                formLayout: { columns: 3, fieldOrder: ['date', 'poids', 'tension_sys', 'tension_dia', 'bpm', 'notes'] }
            }
        },
        { upsert: true, new: true }
    );
    console.log('[Seed] ✅ Template: Suivi Grossesse');

    // Template: Suivi Diabète
    await GridSchemaTemplate.findOneAndUpdate(
        { slug: 'suivi_diabete' },
        {
            $set: {
                name: 'Suivi Diabète',
                slug: 'suivi_diabete',
                description: 'Glycémie, HbA1c, poids — suivi du diabète',
                icon: 'solar:test-tube-minimalistic-bold-duotone',
                color: '#00ab55',
                schemaId: suiviBioSchema._id,
                scope: 'global',
                tags: ['médical', 'endocrinologie', 'diabète'],
                presetRows: [
                    { lineType: 'default', order: 0, values: { date: '', poids: '', notes: 'Bilan initial diabète' } }
                ],
                formLayout: { columns: 3, fieldOrder: ['date', 'poids', 'tension_sys', 'tension_dia', 'notes'] }
            }
        },
        { upsert: true, new: true }
    );
    console.log('[Seed] ✅ Template: Suivi Diabète');

    // Template: Croissance 0-3 ans
    await GridSchemaTemplate.findOneAndUpdate(
        { slug: 'croissance_0_3' },
        {
            $set: {
                name: 'Croissance 0-3 ans',
                slug: 'croissance_0_3',
                description: 'Poids, taille, périmètre crânien — première enfance',
                icon: 'solar:baby-bold-duotone',
                color: '#e2a03f',
                schemaId: seguiPedSchema._id,
                scope: 'global',
                tags: ['médical', 'pédiatrie', 'croissance'],
                presetRows: [
                    { lineType: 'default', order: 0, values: { date: '', poids: '', taille: '', pc: '', notes: 'Naissance' } }
                ],
                formLayout: { columns: 3, fieldOrder: ['date', 'poids', 'taille', 'pc', 'imc', 'notes'] }
            }
        },
        { upsert: true, new: true }
    );
    console.log('[Seed] ✅ Template: Croissance 0-3 ans');

    // Template: Bilan Sanguin Complet
    await GridSchemaTemplate.findOneAndUpdate(
        { slug: 'bilan_sanguin_complet' },
        {
            $set: {
                name: 'Bilan Sanguin Complet',
                slug: 'bilan_sanguin_complet',
                description: 'NFS, VS, CRP, Créatinine, Glycémie, Bilan hépatique',
                icon: 'solar:test-tube-bold-duotone',
                color: '#805dca',
                schemaId: bilanSchema._id,
                scope: 'global',
                tags: ['médical', 'laboratoire', 'bilan'],
                presetRows: [
                    { lineType: 'default', order: 0, values: { parametre: 'Globules rouges', resultat: '', unite: 'T/L', norme: '4.0 - 5.5', interpretation: '' } },
                    { lineType: 'default', order: 1, values: { parametre: 'Hémoglobine', resultat: '', unite: 'g/dL', norme: '12 - 16', interpretation: '' } },
                    { lineType: 'default', order: 2, values: { parametre: 'Globules blancs', resultat: '', unite: 'G/L', norme: '4.0 - 10.0', interpretation: '' } },
                    { lineType: 'default', order: 3, values: { parametre: 'Plaquettes', resultat: '', unite: 'G/L', norme: '150 - 400', interpretation: '' } },
                    { lineType: 'default', order: 4, values: { parametre: 'VS', resultat: '', unite: 'mm/h', norme: '< 20', interpretation: '' } },
                    { lineType: 'default', order: 5, values: { parametre: 'CRP', resultat: '', unite: 'mg/L', norme: '< 5', interpretation: '' } },
                    { lineType: 'default', order: 6, values: { parametre: 'Glycémie', resultat: '', unite: 'g/L', norme: '0.70 - 1.10', interpretation: '' } },
                    { lineType: 'default', order: 7, values: { parametre: 'Créatinine', resultat: '', unite: 'mg/L', norme: '6 - 13', interpretation: '' } },
                    { lineType: 'default', order: 8, values: { parametre: 'ASAT', resultat: '', unite: 'UI/L', norme: '< 35', interpretation: '' } },
                    { lineType: 'default', order: 9, values: { parametre: 'ALAT', resultat: '', unite: 'UI/L', norme: '< 45', interpretation: '' } },
                    { lineType: 'default', order: 10, values: { parametre: 'TSH', resultat: '', unite: 'mUI/L', norme: '0.4 - 4.0', interpretation: '' } }
                ]
            }
        },
        { upsert: true, new: true }
    );
    console.log('[Seed] ✅ Template: Bilan Sanguin Complet');

    // ═══════════════════════════════════════════════════════════
    // Link schemas to Patient entity (if exists)
    // ═══════════════════════════════════════════════════════════
    const patientEntity = await Entity.findOne({ slug: { $in: ['patient', 'patients'] } });
    if (patientEntity) {
        const existingSchemaIds = (patientEntity.gridSchemas || []).map(gs => gs.schemaId?.toString());

        const schemasToLink = [
            { schemaId: suiviBioSchema._id, position: 'main', order: 0, label: 'Suivi Biologique' },
            { schemaId: seguiPedSchema._id, position: 'main', order: 1, label: 'Suivi Pédiatrique' },
            { schemaId: bilanSchema._id, position: 'main', order: 2, label: 'Bilan Sanguin' }
        ];

        const newLinks = schemasToLink.filter(s => !existingSchemaIds.includes(s.schemaId.toString()));
        if (newLinks.length > 0) {
            await Entity.updateOne(
                { _id: patientEntity._id },
                { $push: { gridSchemas: { $each: newLinks } } }
            );
            console.log(`[Seed] ✅ Linked ${newLinks.length} schemas to Patient entity`);
        } else {
            console.log('[Seed] ℹ️ Patient entity already has all schemas linked');
        }
    } else {
        console.log('[Seed] ⚠️ No Patient entity found — schemas created but not linked');
    }

    console.log('\n[Seed] ✅ DataGrid seed complete!');
    await conn.close();
    process.exit(0);
}

const port = process.argv[2] || 5001;
seed(port).catch(err => {
    console.error('[Seed] Error:', err);
    process.exit(1);
});
