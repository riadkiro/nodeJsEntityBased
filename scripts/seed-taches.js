/**
 * Seed Script - Créer des tâches démo pour Kanban
 * 
 * Usage: node scripts/seed-taches.js <account_number> [entity_id]
 */

const mongoose = require('mongoose');
const config = require('../config/db');
const Record = require('../models/record.model');

// Titres de tâches réalistes
const taskTitles = [
    'Révision du contrat client Dupont',
    'Mise à jour documentation API',
    'Préparer la présentation Q1',
    'Audit sécurité serveurs',
    'Refonte page d\'accueil',
    'Intégration paiement Stripe',
    'Formation équipe marketing',
    'Migration base de données',
    'Optimisation requêtes SQL',
    'Correction bug panier',
    'Tests unitaires module auth',
    'Déploiement staging',
    'Revue de code sprint 12',
    'Planification roadmap Q2',
    'Mise en place CI/CD',
    'Design maquettes mobile',
    'Synchronisation calendrier',
    'Rédaction CGV',
    'Analyse concurrentielle',
    'Configuration monitoring',
    'Backup automatisé',
    'Notification push mobile',
    'Tableau de bord analytics',
    'Import données legacy',
    'Export PDF factures',
    'Gestion des rôles',
    'Recherche full-text',
    'Cache Redis',
    'Newsletter mensuelle',
    'SEO pages produits',
    'Support client ticket #1234',
    'Meeting hebdo équipe',
    'Onboarding nouveau dev',
    'Validation maquettes',
    'Release notes v2.3',
    'Préparation démo client',
    'Interview candidat senior',
    'Budget prévisionnel 2024',
    'Benchmark outils CRM',
    'Archivage documents anciens'
];

// Descriptions
const descriptions = [
    'Tâche prioritaire à traiter rapidement.',
    'À discuter lors du prochain meeting.',
    'En attente de validation du client.',
    'Nécessite une review technique.',
    'Dépend de la tâche précédente.',
    '',
    'Documentation à mettre à jour après.',
    'Estimation: 2-3 jours.',
    'Point bloquant identifié.',
    ''
];

// Statuts pour Kanban (Progression)
const PROGRESSION_OPTIONS = [
    { _id: new mongoose.Types.ObjectId('697e0001000000000000001a'), label: 'À faire', color: '#9ca3af', icon: 'tabler:circle' },
    { _id: new mongoose.Types.ObjectId('697e0001000000000000001b'), label: 'En cours', color: '#3b82f6', icon: 'tabler:progress' },
    { _id: new mongoose.Types.ObjectId('697e0001000000000000001c'), label: 'En revue', color: '#f59e0b', icon: 'tabler:eye' },
    { _id: new mongoose.Types.ObjectId('697e0001000000000000001d'), label: 'Terminé', color: '#22c55e', icon: 'tabler:check' },
    { _id: new mongoose.Types.ObjectId('697e0001000000000000001e'), label: 'Bloqué', color: '#ef4444', icon: 'tabler:alert-circle' }
];

// Priority options
const PRIORITY_OPTIONS = [
    { _id: new mongoose.Types.ObjectId('697e0002000000000000002a'), label: 'Basse', color: '#6b7280', icon: 'tabler:arrow-down' },
    { _id: new mongoose.Types.ObjectId('697e0002000000000000002b'), label: 'Moyenne', color: '#f59e0b', icon: 'tabler:minus' },
    { _id: new mongoose.Types.ObjectId('697e0002000000000000002c'), label: 'Haute', color: '#ef4444', icon: 'tabler:arrow-up' },
    { _id: new mongoose.Types.ObjectId('697e0002000000000000002d'), label: 'Urgent', color: '#dc2626', icon: 'tabler:alert-triangle' }
];

// Tags classification
const TAG_OPTIONS = [
    { _id: new mongoose.Types.ObjectId('697e0003000000000000003a'), label: 'Backend', color: '#8b5cf6', icon: 'tabler:server' },
    { _id: new mongoose.Types.ObjectId('697e0003000000000000003b'), label: 'Frontend', color: '#06b6d4', icon: 'tabler:layout' },
    { _id: new mongoose.Types.ObjectId('697e0003000000000000003c'), label: 'Design', color: '#ec4899', icon: 'tabler:palette' },
    { _id: new mongoose.Types.ObjectId('697e0003000000000000003d'), label: 'DevOps', color: '#f97316', icon: 'tabler:cloud' },
    { _id: new mongoose.Types.ObjectId('697e0003000000000000003e'), label: 'Docs', color: '#14b8a6', icon: 'tabler:file-text' },
    { _id: new mongoose.Types.ObjectId('697e0003000000000000003f'), label: 'Meeting', color: '#6366f1', icon: 'tabler:users' },
    { _id: new mongoose.Types.ObjectId('697e00030000000000000040'), label: 'Bug', color: '#ef4444', icon: 'tabler:bug' }
];

// Classification IDs
const CLASSIFICATION_IDS = {
    progression: new mongoose.Types.ObjectId('697e0010000000000000010a'),
    priority: new mongoose.Types.ObjectId('697e0010000000000000010b'),
    tags: new mongoose.Types.ObjectId('697e0010000000000000010c')
};

// Custom Field IDs
const FIELD_IDS = {
    progress: new mongoose.Types.ObjectId('697e0020000000000000020a'),
    assignedTo: new mongoose.Types.ObjectId('697e0020000000000000020b'),
    responsible: new mongoose.Types.ObjectId('697e0020000000000000020c')
};

// Random date in next 30 days or past 10 days
function randomDate() {
    const now = new Date();
    const offset = Math.floor(Math.random() * 40) - 10; // -10 to +30 days
    const date = new Date(now);
    date.setDate(date.getDate() + offset);
    // Random hour
    date.setHours(Math.floor(Math.random() * 12) + 8); // 8h-20h
    date.setMinutes([0, 15, 30, 45][Math.floor(Math.random() * 4)]);
    return date;
}

// Random progress based on status
function randomProgress(statusLabel) {
    switch (statusLabel) {
        case 'À faire': return 0;
        case 'En cours': return Math.floor(Math.random() * 50) + 20; // 20-70
        case 'En revue': return Math.floor(Math.random() * 20) + 70; // 70-90
        case 'Terminé': return 100;
        case 'Bloqué': return Math.floor(Math.random() * 60) + 10; // 10-70
        default: return 0;
    }
}

// Pick random items from array
function pickRandom(arr, count = 1) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length < 1) {
        console.log('Usage: node scripts/seed-taches.js <account_number> [entity_id]');
        console.log('');
        console.log('Example:');
        console.log('  node scripts/seed-taches.js 5001');
        console.log('  node scripts/seed-taches.js 5001 697e123456789abcdef12345');
        process.exit(1);
    }

    const accountNumber = args[0];
    const entityId = args[1] || null;

    console.log('🌱 Création de tâches démo pour Kanban...');
    console.log(`   Account: ${accountNumber}`);

    try {
        // Connect to global DB
        await mongoose.connect(config.globalDbUri);
        console.log('✅ Connected to global database');

        // Connect to tenant DB
        const tenantDbUri = `${config.uri}saas_app_rb_${accountNumber}`;
        const tenantDb = mongoose.createConnection(tenantDbUri);
        console.log(`✅ Connected to tenant database: saas_app_rb_${accountNumber}`);

        // Wait for connection
        await new Promise(resolve => tenantDb.once('open', resolve));

        const RecordModel = tenantDb.model('Record', Record.schema);
        const Classification = require('../models/classification.model');
        const ClassificationModel = tenantDb.model('Classification', Classification.schema);
        const Entity = require('../models/entity.model');
        const EntityModel = tenantDb.model('Entity', Entity.schema);

        // Find or get entity
        let targetEntityId = entityId ? new mongoose.Types.ObjectId(entityId) : null;
        if (!targetEntityId) {
            const entity = await EntityModel.findOne({
                $or: [
                    { slug: { $regex: /tache/i } },
                    { slug: { $regex: /task/i } },
                    { name: { $regex: /tâche/i } },
                    { name: { $regex: /task/i } }
                ]
            });

            if (entity) {
                targetEntityId = entity._id;
                console.log(`   Found entity: ${entity.name} (${entity._id})`);
            } else {
                console.log('❌ No entity found. Please provide entity ID as second argument.');
                process.exit(1);
            }
        }

        // Create or update classifications
        console.log('\n📚 Creating/updating classifications...');

        // Progression (Status for Kanban)
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
                createdAt: new Date(),
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );
        console.log('   ✅ Classification "Progression" créée');

        // Priority
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
                createdAt: new Date(),
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );
        console.log('   ✅ Classification "Priorité" créée');

        // Tags
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
                createdAt: new Date(),
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );
        console.log('   ✅ Classification "Tags" créée');

        // Update entity with statusClassification
        await EntityModel.findByIdAndUpdate(targetEntityId, {
            statusClassification: CLASSIFICATION_IDS.progression,
            $addToSet: {
                classifications: {
                    $each: [CLASSIFICATION_IDS.priority, CLASSIFICATION_IDS.tags]
                }
            }
        });
        console.log('   ✅ Entity updated with classifications');

        // Clear existing records for this entity (optional)
        const deleteResult = await RecordModel.deleteMany({ entityId: targetEntityId });
        console.log(`   🗑️  Deleted ${deleteResult.deletedCount} existing records`);

        // Create task records
        console.log('\n📝 Creating task records...');

        const records = [];
        const shuffledTitles = [...taskTitles].sort(() => 0.5 - Math.random());

        // Distribution: À faire (8), En cours (10), En revue (6), Terminé (8), Bloqué (3)
        const distribution = [
            { status: PROGRESSION_OPTIONS[0], count: 8 },  // À faire
            { status: PROGRESSION_OPTIONS[1], count: 10 }, // En cours
            { status: PROGRESSION_OPTIONS[2], count: 6 },  // En revue
            { status: PROGRESSION_OPTIONS[3], count: 8 },  // Terminé
            { status: PROGRESSION_OPTIONS[4], count: 3 }   // Bloqué
        ];

        let titleIndex = 0;

        for (const { status, count } of distribution) {
            for (let i = 0; i < count && titleIndex < shuffledTitles.length; i++) {
                const title = shuffledTitles[titleIndex++];
                const dueDate = randomDate();
                const progress = randomProgress(status.label);
                const priority = pickRandom(PRIORITY_OPTIONS)[0];
                const tags = pickRandom(TAG_OPTIONS, Math.floor(Math.random() * 3) + 1);
                const description = descriptions[Math.floor(Math.random() * descriptions.length)];

                // Some records have attachments
                const hasAttachment = Math.random() > 0.7;
                const attachments = hasAttachment ? [{
                    name: 'Fichier_test.pdf',
                    url: '/test/Fichier_test.pdf',
                    type: 'application/pdf',
                    size: 12345
                }] : [];

                const record = {
                    entityId: targetEntityId,
                    title: title,
                    referenceTitle: title,
                    description: description,
                    status: status._id.toString(),
                    dueDate: dueDate,
                    attachments: attachments,
                    order: titleIndex,
                    customFields: [
                        { field_id: FIELD_IDS.progress, value: progress }
                    ],
                    classificationValues: [
                        { classificationId: CLASSIFICATION_IDS.progression.toString(), optionId: status._id.toString() },
                        { classificationId: CLASSIFICATION_IDS.priority.toString(), optionId: priority._id.toString() },
                        ...tags.map(tag => ({
                            classificationId: CLASSIFICATION_IDS.tags.toString(),
                            optionId: tag._id.toString()
                        }))
                    ],
                    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
                    updatedAt: new Date()
                };

                records.push(record);
                console.log(`   ${titleIndex}. [${status.label}] ${title}`);
            }
        }

        // Insert all records
        const result = await RecordModel.insertMany(records);

        console.log('\n' + '='.repeat(60));
        console.log(`✅ Créé ${result.length} tâches avec succès !`);
        console.log('');
        console.log('📊 Distribution:');
        distribution.forEach(d => {
            console.log(`   ${d.status.label}: ${d.count} tâches`);
        });
        console.log('');
        console.log('📌 Classifications créées:');
        console.log(`   Progression: ${CLASSIFICATION_IDS.progression}`);
        console.log(`   Priorité: ${CLASSIFICATION_IDS.priority}`);
        console.log(`   Tags: ${CLASSIFICATION_IDS.tags}`);
        console.log('');
        console.log('🎯 Pour voir le Kanban:');
        console.log(`   http://localhost:3000/account/${accountNumber}/test-progressive/tache-xxx?viewType=kanban`);
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
