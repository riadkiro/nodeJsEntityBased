/**
 * Seed Script - Create Line Schemas + Presets for Actirama tenant (9194)
 *
 * Creates:
 * 1. Line Schema: "Ordonnance Traitement" (prescription-style)
 * 2. Line Schema: "Suivi Analyses" (lab timeseries)
 * 3. Presets: "Protocole Grippe", "Traitement Hypertension", "Suivi Thyroïde", "Bilan Lipidique"
 *
 * Usage: node scripts/seed-presets-9194.js
 */

const mongoose = require('mongoose');
const config = require('../config/db');

const ACCOUNT_NUMBER = '9194';

async function seed() {
    try {
        await mongoose.connect(config.globalDbUri);
        console.log('✅ Connected to main MongoDB');

        const tenantDbName = `saas_app_rb_${ACCOUNT_NUMBER}`;
        const tenantConnection = mongoose.createConnection(`${config.uri}${tenantDbName}`);
        console.log(`✅ Connected to tenant DB: ${tenantDbName}`);

        const LineSchemaModel = tenantConnection.model('LineSchema', require('../models/line-schema.model').schema);
        const GridSchemaTemplateModel = tenantConnection.model('GridSchemaTemplate', require('../models/grid-schema-template.model').schema);
        const EntityModel = tenantConnection.model('Entity', require('../models/entity.model').schema);

        // ─── Find the target entities ─────────────────────────────
        const entities = await EntityModel.find({}).lean();
        console.log(`📊 Found ${entities.length} entities:`, entities.map(e => `${e.name} (${e._id})`).join(', '));

        // We'll create schemas that apply to all entities (generic)
        // User can later scope them to specific entities

        // ─── Delete existing demo schemas & presets ────────────────
        const deletedSchemas = await LineSchemaModel.deleteMany({
            slug: { $in: ['prescription_actirama', 'analyses_actirama'] }
        });
        console.log(`🗑️  ${deletedSchemas.deletedCount} schemas supprimés`);

        const deletedPresets = await GridSchemaTemplateModel.deleteMany({
            slug: { $in: [
                'protocole_grippe', 'traitement_hypertension',
                'suivi_thyroide', 'bilan_lipidique',
                'traitement_douleur', 'bilan_renal'
            ] }
        });
        console.log(`🗑️  ${deletedPresets.deletedCount} presets supprimés`);

        // ═══════════════════════════════════════════════════════════
        // SCHEMA 1: Ordonnance Traitement
        // ═══════════════════════════════════════════════════════════
        const prescriptionSchema = new LineSchemaModel({
            name: 'Ordonnance',
            slug: 'prescription_actirama',
            label: 'Traitement',
            description: 'Schéma pour ordonnances médicales — traitements, posologie, durée',
            inputMode: 'catalog',
            dataMode: 'items',
            appliesTo: { entityIds: [], documentType: '' },
            lineTypes: ['treatment', 'note'],
            defaultLineType: 'treatment',
            columns: [
                {
                    key: 'treatment',
                    label: 'Médicament',
                    type: 'relation',
                    required: true,
                    visible: true,
                    width: 'L',
                    order: 0,
                    showWhen: { lineType: ['treatment'] },
                    config: {
                        targetEntity: null,
                        searchFields: ['title'],
                        displayFields: ['title']
                    }
                },
                {
                    key: 'dosage',
                    label: 'Dosage',
                    type: 'dosage',
                    required: false,
                    visible: true,
                    width: 'S',
                    order: 1,
                    showWhen: { lineType: ['treatment'] },
                    config: {
                        units: ['mg', 'ml', 'g', 'cp', 'gouttes', 'UI']
                    }
                },
                {
                    key: 'frequency',
                    label: 'Fréquence',
                    type: 'select',
                    required: false,
                    visible: true,
                    width: 'M',
                    order: 2,
                    showWhen: { lineType: ['treatment'] },
                    config: {
                        source: 'manual',
                        options: [
                            { value: '1x_day', label: '1x / jour' },
                            { value: '2x_day', label: '2x / jour' },
                            { value: '3x_day', label: '3x / jour' },
                            { value: '4x_day', label: '4x / jour' },
                            { value: 'every_6h', label: 'Toutes les 6h' },
                            { value: 'every_8h', label: 'Toutes les 8h' },
                            { value: 'every_12h', label: 'Toutes les 12h' },
                            { value: 'weekly', label: '1x / semaine' },
                            { value: 'as_needed', label: 'Si besoin' }
                        ]
                    }
                },
                {
                    key: 'moment',
                    label: 'Moment',
                    type: 'multiselect',
                    required: false,
                    visible: true,
                    width: 'M',
                    order: 3,
                    showWhen: { lineType: ['treatment'] },
                    config: {
                        source: 'manual',
                        options: [
                            { value: 'morning', label: 'Matin', bg: '#dbeafe', text: '#1e40af' },
                            { value: 'noon', label: 'Midi', bg: '#fef3c7', text: '#92400e' },
                            { value: 'evening', label: 'Soir', bg: '#fce7f3', text: '#9d174d' },
                            { value: 'bedtime', label: 'Au coucher', bg: '#e0e7ff', text: '#3730a3' },
                            { value: 'before_meal', label: 'Avant repas', bg: '#dcfce7', text: '#166534' },
                            { value: 'after_meal', label: 'Après repas', bg: '#ecfdf5', text: '#065f46' },
                            { value: 'fasting', label: 'À jeun', bg: '#fae8ff', text: '#86198f' }
                        ]
                    }
                },
                {
                    key: 'duration',
                    label: 'Durée',
                    type: 'duration',
                    required: false,
                    visible: true,
                    width: 'S',
                    order: 4,
                    showWhen: { lineType: ['treatment'] },
                    config: {
                        units: ['day', 'week', 'month']
                    }
                },
                {
                    key: 'instructions',
                    label: 'Instructions',
                    type: 'textarea',
                    required: false,
                    visible: true,
                    width: 'L',
                    order: 5,
                    config: {}
                }
            ],
            totals: {}
        });

        await prescriptionSchema.save();
        console.log('✅ prescription_actirama créé:', prescriptionSchema._id);

        // ═══════════════════════════════════════════════════════════
        // SCHEMA 2: Suivi Analyses (timeseries mode)
        // ═══════════════════════════════════════════════════════════
        const analysesSchema = new LineSchemaModel({
            name: 'Analyses',
            slug: 'analyses_actirama',
            label: 'Suivi Analyses',
            description: 'Suivi des résultats d\'analyses biologiques — timeseries avec normes',
            inputMode: 'form',
            dataMode: 'timeseries',
            appliesTo: { entityIds: [], documentType: '' },
            lineTypes: ['default'],
            defaultLineType: 'default',
            timeseriesConfig: {
                dateColumn: 'date',
                sortDirection: 'desc',
                displayMode: 'cards'
            },
            analyticsConfig: {
                enabled: true,
                views: [
                    {
                        id: 'stats',
                        label: 'Résumé',
                        type: 'stat',
                        cards: [
                            { column: 'tsh', label: 'TSH', aggregation: 'last', icon: 'solar:heart-pulse-bold-duotone' },
                            { column: 'glycemie', label: 'Glycémie', aggregation: 'last', icon: 'solar:test-tube-bold-duotone' },
                            { column: 'cholesterol', label: 'Cholestérol', aggregation: 'last', icon: 'solar:health-bold-duotone' }
                        ]
                    }
                ]
            },
            columns: [
                {
                    key: 'date',
                    label: 'Date',
                    type: 'date',
                    required: true,
                    visible: true,
                    width: 'S',
                    order: 0,
                    config: {}
                },
                {
                    key: 'type_analyse',
                    label: 'Type',
                    type: 'select',
                    required: false,
                    visible: true,
                    width: 'M',
                    order: 1,
                    config: {
                        source: 'manual',
                        options: [
                            { value: 'thyroide', label: 'Thyroïde' },
                            { value: 'lipides', label: 'Bilan Lipidique' },
                            { value: 'glycemie', label: 'Glycémie' },
                            { value: 'renal', label: 'Bilan Rénal' },
                            { value: 'hepatique', label: 'Bilan Hépatique' },
                            { value: 'nfs', label: 'NFS' },
                            { value: 'autre', label: 'Autre' }
                        ]
                    }
                },
                {
                    key: 'tsh',
                    label: 'TSH',
                    type: 'number',
                    required: false,
                    visible: true,
                    width: 'XS',
                    order: 2,
                    config: {
                        unit: 'mUI/L',
                        normalRange: { min: 0.27, max: 4.2 }
                    }
                },
                {
                    key: 't3_libre',
                    label: 'T3 libre',
                    type: 'number',
                    required: false,
                    visible: true,
                    width: 'XS',
                    order: 3,
                    config: {
                        unit: 'pg/mL',
                        normalRange: { min: 2.0, max: 4.4 }
                    }
                },
                {
                    key: 't4_libre',
                    label: 'T4 libre',
                    type: 'number',
                    required: false,
                    visible: true,
                    width: 'XS',
                    order: 4,
                    config: {
                        unit: 'ng/dL',
                        normalRange: { min: 0.93, max: 1.7 }
                    }
                },
                {
                    key: 'glycemie',
                    label: 'Glycémie',
                    type: 'number',
                    required: false,
                    visible: true,
                    width: 'XS',
                    order: 5,
                    config: {
                        unit: 'g/L',
                        normalRange: { min: 0.7, max: 1.1 }
                    }
                },
                {
                    key: 'hba1c',
                    label: 'HbA1c',
                    type: 'number',
                    required: false,
                    visible: true,
                    width: 'XS',
                    order: 6,
                    config: {
                        unit: '%',
                        normalRange: { min: 4.0, max: 6.0 }
                    }
                },
                {
                    key: 'cholesterol',
                    label: 'Cholestérol total',
                    type: 'number',
                    required: false,
                    visible: true,
                    width: 'XS',
                    order: 7,
                    config: {
                        unit: 'g/L',
                        normalRange: { min: 0, max: 2.0 }
                    }
                },
                {
                    key: 'hdl',
                    label: 'HDL',
                    type: 'number',
                    required: false,
                    visible: true,
                    width: 'XS',
                    order: 8,
                    config: {
                        unit: 'g/L',
                        normalRange: { min: 0.4, max: 1.0 }
                    }
                },
                {
                    key: 'ldl',
                    label: 'LDL',
                    type: 'number',
                    required: false,
                    visible: true,
                    width: 'XS',
                    order: 9,
                    config: {
                        unit: 'g/L',
                        normalRange: { min: 0, max: 1.6 }
                    }
                },
                {
                    key: 'triglycerides',
                    label: 'Triglycérides',
                    type: 'number',
                    required: false,
                    visible: true,
                    width: 'XS',
                    order: 10,
                    config: {
                        unit: 'g/L',
                        normalRange: { min: 0, max: 1.5 }
                    }
                },
                {
                    key: 'creatinine',
                    label: 'Créatinine',
                    type: 'number',
                    required: false,
                    visible: true,
                    width: 'XS',
                    order: 11,
                    config: {
                        unit: 'mg/L',
                        normalRange: { min: 7, max: 13 }
                    }
                },
                {
                    key: 'commentaire',
                    label: 'Commentaire',
                    type: 'text',
                    required: false,
                    visible: true,
                    width: 'M',
                    order: 12,
                    config: {}
                }
            ],
            totals: {}
        });

        await analysesSchema.save();
        console.log('✅ analyses_actirama créé:', analysesSchema._id);

        // ═══════════════════════════════════════════════════════════
        // PRESETS for Ordonnance
        // ═══════════════════════════════════════════════════════════

        // 1. Protocole Grippe
        const protocoleGrippe = new GridSchemaTemplateModel({
            name: 'Protocole Grippe',
            slug: 'protocole_grippe',
            description: 'Traitement standard de la grippe — 3 médicaments',
            icon: 'solar:virus-bold-duotone',
            color: '#e74c3c',
            schemaId: prescriptionSchema._id,
            scope: 'workspace',
            tags: ['medical', 'grippe', 'protocol'],
            presetRows: [
                {
                    lineType: 'treatment',
                    values: {
                        treatment_label: 'Paracétamol 1000mg',
                        dosage: { value: 1000, unit: 'mg' },
                        frequency: '3x_day',
                        moment: ['morning', 'noon', 'evening'],
                        duration: { value: 5, unit: 'day' },
                        instructions: 'Prendre pendant les repas. Ne pas dépasser 4g/jour.'
                    },
                    order: 0
                },
                {
                    lineType: 'treatment',
                    values: {
                        treatment_label: 'Ibuprofène 400mg',
                        dosage: { value: 400, unit: 'mg' },
                        frequency: '2x_day',
                        moment: ['morning', 'evening'],
                        duration: { value: 3, unit: 'day' },
                        instructions: 'En alternative au paracétamol si fièvre persistante.'
                    },
                    order: 1
                },
                {
                    lineType: 'treatment',
                    values: {
                        treatment_label: 'Amoxicilline 1g',
                        dosage: { value: 1, unit: 'g' },
                        frequency: '2x_day',
                        moment: ['morning', 'evening'],
                        duration: { value: 7, unit: 'day' },
                        instructions: 'Si surinfection bactérienne suspectée.'
                    },
                    order: 2
                }
            ]
        });
        await protocoleGrippe.save();
        console.log('✅ Preset "Protocole Grippe" créé');

        // 2. Traitement Hypertension
        const traitementHTA = new GridSchemaTemplateModel({
            name: 'Traitement Hypertension',
            slug: 'traitement_hypertension',
            description: 'Traitement chronique HTA — triple thérapie',
            icon: 'solar:heart-bold-duotone',
            color: '#e91e63',
            schemaId: prescriptionSchema._id,
            scope: 'workspace',
            tags: ['medical', 'chronique', 'hta'],
            presetRows: [
                {
                    lineType: 'treatment',
                    values: {
                        treatment_label: 'Amlodipine 5mg (Exforge)',
                        dosage: { value: 5, unit: 'mg' },
                        frequency: '1x_day',
                        moment: ['morning'],
                        duration: { value: 3, unit: 'month' },
                        instructions: 'Traitement au long cours. Contrôle tension régulier.'
                    },
                    order: 0
                },
                {
                    lineType: 'treatment',
                    values: {
                        treatment_label: 'Rivaroxaban 20mg (Rexaban)',
                        dosage: { value: 20, unit: 'mg' },
                        frequency: '1x_day',
                        moment: ['evening'],
                        duration: { value: 3, unit: 'month' },
                        instructions: 'Prendre au cours du repas. Surveillance INR.'
                    },
                    order: 1
                },
                {
                    lineType: 'treatment',
                    values: {
                        treatment_label: 'Aténolol 100mg (Atenor)',
                        dosage: { value: 100, unit: 'mg' },
                        frequency: '1x_day',
                        moment: ['morning'],
                        duration: { value: 3, unit: 'month' },
                        instructions: 'Ne pas arrêter brutalement. Contrôle rythme cardiaque.'
                    },
                    order: 2
                }
            ]
        });
        await traitementHTA.save();
        console.log('✅ Preset "Traitement Hypertension" créé');

        // 3. Traitement Douleur
        const traitementDouleur = new GridSchemaTemplateModel({
            name: 'Traitement Douleur',
            slug: 'traitement_douleur',
            description: 'Traitement antalgique palier 1-2',
            icon: 'solar:health-bold-duotone',
            color: '#ff9800',
            schemaId: prescriptionSchema._id,
            scope: 'workspace',
            tags: ['medical', 'douleur'],
            presetRows: [
                {
                    lineType: 'treatment',
                    values: {
                        treatment_label: 'Paracétamol 1000mg',
                        dosage: { value: 1000, unit: 'mg' },
                        frequency: '3x_day',
                        moment: ['morning', 'noon', 'evening'],
                        duration: { value: 7, unit: 'day' },
                        instructions: 'Systématique. Maximum 4g/jour.'
                    },
                    order: 0
                },
                {
                    lineType: 'treatment',
                    values: {
                        treatment_label: 'Tramadol 50mg',
                        dosage: { value: 50, unit: 'mg' },
                        frequency: 'as_needed',
                        moment: [],
                        duration: { value: 5, unit: 'day' },
                        instructions: 'Si douleur non contrôlée par le paracétamol seul. Max 400mg/jour.'
                    },
                    order: 1
                }
            ]
        });
        await traitementDouleur.save();
        console.log('✅ Preset "Traitement Douleur" créé');

        // ═══════════════════════════════════════════════════════════
        // PRESETS for Analyses (timeseries)
        // ═══════════════════════════════════════════════════════════

        // 4. Suivi Thyroïde
        const suiviThyroide = new GridSchemaTemplateModel({
            name: 'Suivi Thyroïde',
            slug: 'suivi_thyroide',
            description: 'Bilan thyroïdien standard — TSH, T3, T4',
            icon: 'solar:test-tube-bold-duotone',
            color: '#9c27b0',
            schemaId: analysesSchema._id,
            scope: 'workspace',
            tags: ['labo', 'thyroide', 'endocrinologie'],
            presetRows: [
                {
                    lineType: 'default',
                    values: {
                        date: new Date().toISOString().split('T')[0],
                        type_analyse: 'thyroide',
                        tsh: '',
                        t3_libre: '',
                        t4_libre: '',
                        commentaire: 'Contrôle thyroïdien'
                    },
                    order: 0
                }
            ]
        });
        await suiviThyroide.save();
        console.log('✅ Preset "Suivi Thyroïde" créé');

        // 5. Bilan Lipidique
        const bilanLipidique = new GridSchemaTemplateModel({
            name: 'Bilan Lipidique',
            slug: 'bilan_lipidique',
            description: 'Bilan lipidique complet — Cholestérol, HDL, LDL, Triglycérides',
            icon: 'solar:heart-pulse-bold-duotone',
            color: '#2196f3',
            schemaId: analysesSchema._id,
            scope: 'workspace',
            tags: ['labo', 'lipides', 'cardio'],
            presetRows: [
                {
                    lineType: 'default',
                    values: {
                        date: new Date().toISOString().split('T')[0],
                        type_analyse: 'lipides',
                        cholesterol: '',
                        hdl: '',
                        ldl: '',
                        triglycerides: '',
                        commentaire: 'Bilan lipidique de contrôle'
                    },
                    order: 0
                }
            ]
        });
        await bilanLipidique.save();
        console.log('✅ Preset "Bilan Lipidique" créé');

        // 6. Bilan Rénal
        const bilanRenal = new GridSchemaTemplateModel({
            name: 'Bilan Rénal',
            slug: 'bilan_renal',
            description: 'Bilan rénal — Créatinine, Glycémie',
            icon: 'solar:bones-bold-duotone',
            color: '#00bcd4',
            schemaId: analysesSchema._id,
            scope: 'workspace',
            tags: ['labo', 'renal'],
            presetRows: [
                {
                    lineType: 'default',
                    values: {
                        date: new Date().toISOString().split('T')[0],
                        type_analyse: 'renal',
                        glycemie: '',
                        creatinine: '',
                        commentaire: 'Bilan rénal de contrôle'
                    },
                    order: 0
                }
            ]
        });
        await bilanRenal.save();
        console.log('✅ Preset "Bilan Rénal" créé');

        // ─── Summary ─────────────────────────────────────────────
        console.log('\n🎉 Seed terminé avec succès!');
        console.log(`\n📊 Schemas créés:`);
        console.log(`   - Ordonnance: ${prescriptionSchema._id}`);
        console.log(`   - Analyses:   ${analysesSchema._id}`);
        console.log(`\n📋 Presets créés: 6`);
        console.log(`   Ordonnance: Protocole Grippe, Traitement Hypertension, Traitement Douleur`);
        console.log(`   Analyses:   Suivi Thyroïde, Bilan Lipidique, Bilan Rénal`);
        console.log(`\n⚠️  IMPORTANT: Les schemas n'ont PAS d'entityId scopé.`);
        console.log(`   Allez dans /account/${ACCOUNT_NUMBER}/line-schemas pour les lier à vos entités.`);

        await tenantConnection.close();
        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

seed();
