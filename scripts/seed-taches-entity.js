/**
 * Seed Script - Create "Tâches" Entity + Classifications + Demo Records
 * 
 * Creates the full tasks system:
 * 1. Entity "Tâches" with fields (description, dueDate, progress)
 * 2. Classifications: Progression (Kanban), Priorité, Tags
 * 3. Demo task records with realistic data
 * 
 * Usage: node scripts/seed-taches-entity.js <account_number>
 */

const mongoose = require('mongoose');
const config = require('../config/db');

// ============ IDS ============
const ENTITY_ID = new mongoose.Types.ObjectId('697e0000000000000000e001');

const CLASSIFICATION_IDS = {
    progression: new mongoose.Types.ObjectId('697e0010000000000000010a'),
    priority: new mongoose.Types.ObjectId('697e0010000000000000010b'),
    tags: new mongoose.Types.ObjectId('697e0010000000000000010c')
};

const FIELD_IDS = {
    dueDate: new mongoose.Types.ObjectId('697e0020000000000000020a'),
    progress: new mongoose.Types.ObjectId('697e0020000000000000020b'),
    assignedTo: new mongoose.Types.ObjectId('697e0020000000000000020c')
};

// ============ CLASSIFICATION OPTIONS ============
const PROGRESSION_OPTIONS = [
    { _id: new mongoose.Types.ObjectId('697e0001000000000000001a'), label: 'À faire', color: '#9ca3af', icon: 'tabler:circle' },
    { _id: new mongoose.Types.ObjectId('697e0001000000000000001b'), label: 'En cours', color: '#3b82f6', icon: 'tabler:progress' },
    { _id: new mongoose.Types.ObjectId('697e0001000000000000001c'), label: 'En revue', color: '#f59e0b', icon: 'tabler:eye' },
    { _id: new mongoose.Types.ObjectId('697e0001000000000000001d'), label: 'Terminé', color: '#22c55e', icon: 'tabler:check' },
    { _id: new mongoose.Types.ObjectId('697e0001000000000000001e'), label: 'Bloqué', color: '#ef4444', icon: 'tabler:alert-circle' }
];

const PRIORITY_OPTIONS = [
    { _id: new mongoose.Types.ObjectId('697e0002000000000000002a'), label: 'Basse', color: '#6b7280', icon: 'tabler:arrow-down' },
    { _id: new mongoose.Types.ObjectId('697e0002000000000000002b'), label: 'Moyenne', color: '#f59e0b', icon: 'tabler:minus' },
    { _id: new mongoose.Types.ObjectId('697e0002000000000000002c'), label: 'Haute', color: '#ef4444', icon: 'tabler:arrow-up' },
    { _id: new mongoose.Types.ObjectId('697e0002000000000000002d'), label: 'Urgent', color: '#dc2626', icon: 'tabler:alert-triangle' }
];

const TAG_OPTIONS = [
    { _id: new mongoose.Types.ObjectId('697e0003000000000000003a'), label: 'Backend', color: '#8b5cf6', icon: 'tabler:server' },
    { _id: new mongoose.Types.ObjectId('697e0003000000000000003b'), label: 'Frontend', color: '#06b6d4', icon: 'tabler:layout' },
    { _id: new mongoose.Types.ObjectId('697e0003000000000000003c'), label: 'Design', color: '#ec4899', icon: 'tabler:palette' },
    { _id: new mongoose.Types.ObjectId('697e0003000000000000003d'), label: 'DevOps', color: '#f97316', icon: 'tabler:cloud' },
    { _id: new mongoose.Types.ObjectId('697e0003000000000000003e'), label: 'Docs', color: '#14b8a6', icon: 'tabler:file-text' },
    { _id: new mongoose.Types.ObjectId('697e0003000000000000003f'), label: 'Meeting', color: '#6366f1', icon: 'tabler:users' },
    { _id: new mongoose.Types.ObjectId('697e00030000000000000040'), label: 'Bug', color: '#ef4444', icon: 'tabler:bug' }
];

// ============ TASK DATA ============
const taskTitles = [
    'Révision du contrat client Dupont', 'Mise à jour documentation API', 'Préparer la présentation Q1',
    'Audit sécurité serveurs', 'Refonte page d\'accueil', 'Intégration paiement Stripe',
    'Formation équipe marketing', 'Migration base de données', 'Optimisation requêtes SQL',
    'Correction bug panier', 'Tests unitaires module auth', 'Déploiement staging',
    'Revue de code sprint 12', 'Planification roadmap Q2', 'Mise en place CI/CD',
    'Design maquettes mobile', 'Synchronisation calendrier', 'Rédaction CGV',
    'Analyse concurrentielle', 'Configuration monitoring', 'Backup automatisé',
    'Notification push mobile', 'Tableau de bord analytics', 'Import données legacy',
    'Export PDF factures', 'Gestion des rôles', 'Recherche full-text',
    'Cache Redis', 'Newsletter mensuelle', 'SEO pages produits',
    'Support client ticket #1234', 'Meeting hebdo équipe', 'Onboarding nouveau dev',
    'Validation maquettes', 'Release notes v2.3'
];

const descriptions = [
    'Tâche prioritaire à traiter rapidement.',
    'À discuter lors du prochain meeting.',
    'En attente de validation du client.',
    'Nécessite une review technique.',
    'Dépend de la tâche précédente.',
    '', 'Documentation à mettre à jour après.',
    'Estimation: 2-3 jours.', 'Point bloquant identifié.', ''
];

function randomDate() {
    const now = new Date();
    const offset = Math.floor(Math.random() * 40) - 10;
    const date = new Date(now);
    date.setDate(date.getDate() + offset);
    date.setHours(Math.floor(Math.random() * 12) + 8);
    date.setMinutes([0, 15, 30, 45][Math.floor(Math.random() * 4)]);
    return date;
}

function randomProgress(statusLabel) {
    switch (statusLabel) {
        case 'À faire': return 0;
        case 'En cours': return Math.floor(Math.random() * 50) + 20;
        case 'En revue': return Math.floor(Math.random() * 20) + 70;
        case 'Terminé': return 100;
        case 'Bloqué': return Math.floor(Math.random() * 60) + 10;
        default: return 0;
    }
}

function pickRandom(arr, count = 1) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.log('Usage: node scripts/seed-taches-entity.js <account_number>');
        process.exit(1);
    }

    const accountNumber = args[0];
    console.log('🌱 Seed: Tâches Entity + Classifications + Demo Records');
    console.log(`   Account: ${accountNumber}`);

    try {
        await mongoose.connect(config.globalDbUri);
        const tenantDbUri = `${config.uri}saas_app_rb_${accountNumber}`;
        const tenantDb = mongoose.createConnection(tenantDbUri);
        await new Promise(resolve => tenantDb.once('open', resolve));
        console.log('✅ Connected to tenant DB');

        const Entity = require('../models/entity.model');
        const EntityModel = tenantDb.model('Entity', Entity.schema);
        const Classification = require('../models/classification.model');
        const ClassificationModel = tenantDb.model('Classification', Classification.schema);
        const Record = require('../models/record.model');
        const RecordModel = tenantDb.model('Record', Record.schema);
        const Field = require('../models/field.model');
        const FieldModel = tenantDb.model('Field', Field.schema);

        // ====== STEP 1: Create/update Entity ======
        console.log('\n📦 Creating/updating "Tâches" entity...');
        await EntityModel.findOneAndUpdate(
            { _id: ENTITY_ID },
            {
                _id: ENTITY_ID,
                name: 'Tâches',
                slug: 'taches',
                description: 'Gestion des tâches et suivi de projet',
                icon: 'solar:checklist-minimalistic-bold-duotone',
                color: '#4361ee',
                active: true,
                enabledStandardFields: ['title', 'description', 'dueDate', 'attachments'],
                customFields: [FIELD_IDS.progress, FIELD_IDS.assignedTo],
                statusClassification: CLASSIFICATION_IDS.progression,
                classifications: [CLASSIFICATION_IDS.priority, CLASSIFICATION_IDS.tags],
                referenceTitleTokens: [{ t: 'field', id: 'title' }],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );
        console.log('   ✅ Entity "Tâches" created/updated');

        // ====== STEP 2: Create custom fields ======
        console.log('\n📋 Creating custom fields...');
        await FieldModel.findOneAndUpdate(
            { _id: FIELD_IDS.progress },
            {
                _id: FIELD_IDS.progress,
                name: 'Progression',
                key: 'progress',
                type: 'number',
                entityId: ENTITY_ID,
                config: { min: 0, max: 100, suffix: '%' },
                createdAt: new Date()
            },
            { upsert: true }
        );
        await FieldModel.findOneAndUpdate(
            { _id: FIELD_IDS.assignedTo },
            {
                _id: FIELD_IDS.assignedTo,
                name: 'Assigné à',
                key: 'assignedTo',
                type: 'text',
                entityId: ENTITY_ID,
                config: {},
                createdAt: new Date()
            },
            { upsert: true }
        );
        console.log('   ✅ Custom fields created');

        // ====== STEP 3: Create classifications ======
        console.log('\n📚 Creating classifications...');
        await ClassificationModel.findOneAndUpdate(
            { _id: CLASSIFICATION_IDS.progression },
            {
                _id: CLASSIFICATION_IDS.progression,
                name: 'Progression',
                key: 'tache_progression',
                description: 'Statut de progression de la tâche',
                type: 'simple',
                allowMultiple: false,
                options: PROGRESSION_OPTIONS,
                createdAt: new Date(), updatedAt: new Date()
            },
            { upsert: true }
        );
        await ClassificationModel.findOneAndUpdate(
            { _id: CLASSIFICATION_IDS.priority },
            {
                _id: CLASSIFICATION_IDS.priority,
                name: 'Priorité',
                key: 'tache_priority',
                description: 'Niveau de priorité',
                type: 'simple',
                allowMultiple: false,
                options: PRIORITY_OPTIONS,
                createdAt: new Date(), updatedAt: new Date()
            },
            { upsert: true }
        );
        await ClassificationModel.findOneAndUpdate(
            { _id: CLASSIFICATION_IDS.tags },
            {
                _id: CLASSIFICATION_IDS.tags,
                name: 'Tags',
                key: 'tache_tags',
                description: 'Tags de catégorisation',
                type: 'simple',
                allowMultiple: true,
                options: TAG_OPTIONS,
                createdAt: new Date(), updatedAt: new Date()
            },
            { upsert: true }
        );
        console.log('   ✅ Progression, Priorité, Tags created');

        // ====== STEP 4: Create task records ======
        console.log('\n📝 Creating task records...');
        const deleteResult = await RecordModel.deleteMany({ entityId: ENTITY_ID });
        console.log(`   🗑️ Deleted ${deleteResult.deletedCount} existing records`);

        const assignees = ['Marie Dupont', 'Jean Martin', 'Sophie Bernard', 'Pierre Leblanc', 'Camille Moreau'];
        const distribution = [
            { status: PROGRESSION_OPTIONS[0], count: 8 },
            { status: PROGRESSION_OPTIONS[1], count: 10 },
            { status: PROGRESSION_OPTIONS[2], count: 6 },
            { status: PROGRESSION_OPTIONS[3], count: 8 },
            { status: PROGRESSION_OPTIONS[4], count: 3 }
        ];

        const shuffled = [...taskTitles].sort(() => 0.5 - Math.random());
        const records = [];
        let idx = 0;

        for (const { status, count } of distribution) {
            for (let i = 0; i < count && idx < shuffled.length; i++) {
                const title = shuffled[idx++];
                const priority = pickRandom(PRIORITY_OPTIONS)[0];
                const tags = pickRandom(TAG_OPTIONS, Math.floor(Math.random() * 3) + 1);
                const progress = randomProgress(status.label);
                const assignee = assignees[Math.floor(Math.random() * assignees.length)];

                records.push({
                    entityId: ENTITY_ID,
                    title,
                    referenceTitle: title,
                    description: descriptions[Math.floor(Math.random() * descriptions.length)],
                    status: status._id.toString(),
                    dueDate: randomDate(),
                    order: idx,
                    customFields: [
                        { field_id: FIELD_IDS.progress, value: progress },
                        { field_id: FIELD_IDS.assignedTo, value: assignee }
                    ],
                    classificationValues: [
                        { classificationId: CLASSIFICATION_IDS.progression.toString(), optionId: status._id.toString() },
                        { classificationId: CLASSIFICATION_IDS.priority.toString(), optionId: priority._id.toString() },
                        ...tags.map(tag => ({
                            classificationId: CLASSIFICATION_IDS.tags.toString(),
                            optionId: tag._id.toString()
                        }))
                    ],
                    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000),
                    updatedAt: new Date()
                });
            }
        }

        const result = await RecordModel.insertMany(records);

        console.log('\n' + '='.repeat(60));
        console.log(`✅ Created ${result.length} tasks!`);
        console.log('📊 Distribution:');
        distribution.forEach(d => console.log(`   ${d.status.label}: ${d.count}`));
        console.log(`\n🎯 Entity ID: ${ENTITY_ID}`);
        console.log(`🔗 View: http://localhost:3000/account/${accountNumber}/tasks`);
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

main();
