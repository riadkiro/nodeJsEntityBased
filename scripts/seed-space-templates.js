/**
 * Seed Space Templates
 * ────────────────────
 * Populates the global SaaS DB with preconfigured space templates.
 * Each space template bundles entity templates + relations for a specific use-case.
 * 
 * Usage: node scripts/seed-space-templates.js
 */
const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://127.0.0.1:27017/saasDemo';

const systemSpaceTemplates = [
    {
        name: 'CRM & Ventes',
        slug: 'crm-ventes',
        description: 'Gérez votre pipeline commercial, vos contacts, prospects et opportunités de vente avec un suivi complet du cycle de vente.',
        icon: 'solar:users-group-rounded-bold-duotone',
        color: '#4361ee',
        category: 'crm',
        tags: ['crm', 'ventes', 'contacts', 'pipeline'],
        featured: true,
        entities: [
            { templateSlug: 'contacts', name: 'Contacts', isMain: true, order: 0 },
            { templateSlug: 'opportunites', name: 'Opportunités', isMain: false, order: 1 },
            { templateSlug: 'taches', name: 'Tâches', isMain: false, order: 2 },
            { templateSlug: 'notes', name: 'Notes', isMain: false, order: 3 },
            { templateSlug: 'emails', name: 'Emails', isMain: false, order: 4 },
            { templateSlug: 'documents', name: 'Documents', isMain: false, order: 5 }
        ],
        relations: [
            { from: 'contacts', to: 'opportunites', type: 'one-to-many', label: 'Opportunités du contact' },
            { from: 'contacts', to: 'taches', type: 'one-to-many', label: 'Tâches liées' },
            { from: 'contacts', to: 'notes', type: 'one-to-many', label: 'Notes du contact' },
            { from: 'contacts', to: 'emails', type: 'one-to-many', label: 'Historique email' },
            { from: 'opportunites', to: 'taches', type: 'one-to-many', label: 'Actions commerciales' },
            { from: 'opportunites', to: 'documents', type: 'one-to-many', label: 'Documents associés' }
        ],
        defaultViews: [
            { entitySlug: 'contacts', viewType: 'table' },
            { entitySlug: 'opportunites', viewType: 'kanban' },
            { entitySlug: 'taches', viewType: 'kanban' }
        ]
    },
    {
        name: 'Gestion de Projets',
        slug: 'gestion-projets',
        description: 'Planifiez, suivez et gérez vos projets avec des tâches, jalons, documents et une vue d\'ensemble complète de l\'avancement.',
        icon: 'solar:checklist-bold-duotone',
        color: '#e7515a',
        category: 'project',
        tags: ['projet', 'tâches', 'planning', 'agile'],
        featured: true,
        entities: [
            { templateSlug: 'projets', name: 'Projets', isMain: true, order: 0 },
            { templateSlug: 'taches', name: 'Tâches', isMain: false, order: 1 },
            { templateSlug: 'documents', name: 'Documents', isMain: false, order: 2 },
            { templateSlug: 'notes', name: 'Notes', isMain: false, order: 3 },
            { templateSlug: 'evenements', name: 'Jalons', isMain: false, order: 4 }
        ],
        relations: [
            { from: 'projets', to: 'taches', type: 'one-to-many', label: 'Tâches du projet' },
            { from: 'projets', to: 'documents', type: 'one-to-many', label: 'Documents du projet' },
            { from: 'projets', to: 'notes', type: 'one-to-many', label: 'Notes de projet' },
            { from: 'projets', to: 'evenements', type: 'one-to-many', label: 'Jalons du projet' },
            { from: 'taches', to: 'documents', type: 'many-to-many', label: 'Pièces jointes' }
        ],
        defaultViews: [
            { entitySlug: 'projets', viewType: 'table' },
            { entitySlug: 'taches', viewType: 'kanban' },
            { entitySlug: 'evenements', viewType: 'calendar' }
        ]
    },
    {
        name: 'Ressources Humaines',
        slug: 'ressources-humaines',
        description: 'Gérez vos employés, les congés, les évaluations et les documents RH dans un espace dédié et sécurisé.',
        icon: 'solar:user-id-bold-duotone',
        color: '#805dca',
        category: 'hr',
        tags: ['rh', 'employés', 'congés', 'recrutement'],
        featured: true,
        entities: [
            { templateSlug: 'employes', name: 'Employés', isMain: true, order: 0 },
            { templateSlug: 'documents', name: 'Documents RH', isMain: false, order: 1 },
            { templateSlug: 'evenements', name: 'Congés & Absences', isMain: false, order: 2 },
            { templateSlug: 'taches', name: 'Actions RH', isMain: false, order: 3 },
            { templateSlug: 'notes', name: 'Notes internes', isMain: false, order: 4 }
        ],
        relations: [
            { from: 'employes', to: 'documents', type: 'one-to-many', label: 'Documents de l\'employé' },
            { from: 'employes', to: 'evenements', type: 'one-to-many', label: 'Congés & absences' },
            { from: 'employes', to: 'taches', type: 'one-to-many', label: 'Actions RH' },
            { from: 'employes', to: 'notes', type: 'one-to-many', label: 'Notes internes' }
        ],
        defaultViews: [
            { entitySlug: 'employes', viewType: 'table' },
            { entitySlug: 'evenements', viewType: 'calendar' }
        ]
    },
    {
        name: 'Facturation & Finance',
        slug: 'facturation-finance',
        description: 'Suivez vos factures, devis, paiements et clients avec un tableau de bord financier complet.',
        icon: 'solar:wallet-bold-duotone',
        color: '#e2a03f',
        category: 'finance',
        tags: ['factures', 'finance', 'comptabilité', 'paiements'],
        featured: true,
        entities: [
            { templateSlug: 'factures', name: 'Factures', isMain: true, order: 0 },
            { templateSlug: 'contacts', name: 'Clients', isMain: false, order: 1 },
            { templateSlug: 'documents', name: 'Pièces comptables', isMain: false, order: 2 },
            { templateSlug: 'notes', name: 'Notes', isMain: false, order: 3 }
        ],
        relations: [
            { from: 'contacts', to: 'factures', type: 'one-to-many', label: 'Factures du client' },
            { from: 'factures', to: 'documents', type: 'one-to-many', label: 'Pièces jointes' }
        ],
        defaultViews: [
            { entitySlug: 'factures', viewType: 'table' },
            { entitySlug: 'contacts', viewType: 'table' }
        ]
    },
    {
        name: 'Gestion de Contenu',
        slug: 'gestion-contenu',
        description: 'Organisez vos contenus, médias, articles et publications avec un workflow éditorial structuré.',
        icon: 'solar:document-text-bold-duotone',
        color: '#06b6d4',
        category: 'content',
        tags: ['contenu', 'médias', 'articles', 'editorial'],
        entities: [
            { templateSlug: 'documents', name: 'Articles', isMain: true, order: 0 },
            { templateSlug: 'medias', name: 'Médias', isMain: false, order: 1 },
            { templateSlug: 'taches', name: 'Tâches éditoriales', isMain: false, order: 2 },
            { templateSlug: 'notes', name: 'Brouillons', isMain: false, order: 3 }
        ],
        relations: [
            { from: 'documents', to: 'medias', type: 'many-to-many', label: 'Médias associés' },
            { from: 'documents', to: 'taches', type: 'one-to-many', label: 'Tâches éditoriales' }
        ],
        defaultViews: [
            { entitySlug: 'documents', viewType: 'table' },
            { entitySlug: 'medias', viewType: 'gallery' }
        ]
    },
    {
        name: 'Support Client',
        slug: 'support-client',
        description: 'Gérez les tickets de support, les demandes utilisateurs et la base de connaissances pour un service client efficace.',
        icon: 'solar:chat-round-dots-bold-duotone',
        color: '#ec4899',
        category: 'communication',
        tags: ['support', 'tickets', 'service', 'helpdesk'],
        entities: [
            { templateSlug: 'taches', name: 'Tickets', isMain: true, order: 0 },
            { templateSlug: 'contacts', name: 'Clients', isMain: false, order: 1 },
            { templateSlug: 'documents', name: 'Base de connaissances', isMain: false, order: 2 },
            { templateSlug: 'emails', name: 'Correspondance', isMain: false, order: 3 },
            { templateSlug: 'notes', name: 'Notes internes', isMain: false, order: 4 }
        ],
        relations: [
            { from: 'contacts', to: 'taches', type: 'one-to-many', label: 'Tickets du client' },
            { from: 'taches', to: 'emails', type: 'one-to-many', label: 'Correspondance du ticket' },
            { from: 'taches', to: 'notes', type: 'one-to-many', label: 'Notes internes' },
            { from: 'taches', to: 'documents', type: 'many-to-many', label: 'Articles liés' }
        ],
        defaultViews: [
            { entitySlug: 'taches', viewType: 'kanban' },
            { entitySlug: 'contacts', viewType: 'table' }
        ]
    },
    {
        name: 'Recrutement',
        slug: 'recrutement',
        description: 'Gérez vos offres d\'emploi, candidatures et processus de recrutement de bout en bout.',
        icon: 'solar:user-plus-bold-duotone',
        color: '#10b981',
        category: 'hr',
        tags: ['recrutement', 'candidats', 'offres', 'entretiens'],
        entities: [
            { templateSlug: 'contacts', name: 'Candidats', isMain: true, order: 0 },
            { templateSlug: 'taches', name: 'Offres d\'emploi', isMain: false, order: 1 },
            { templateSlug: 'evenements', name: 'Entretiens', isMain: false, order: 2 },
            { templateSlug: 'documents', name: 'CV & Documents', isMain: false, order: 3 },
            { templateSlug: 'notes', name: 'Évaluations', isMain: false, order: 4 }
        ],
        relations: [
            { from: 'contacts', to: 'taches', type: 'many-to-many', label: 'Candidatures' },
            { from: 'contacts', to: 'evenements', type: 'one-to-many', label: 'Entretiens planifiés' },
            { from: 'contacts', to: 'documents', type: 'one-to-many', label: 'CV et lettres' },
            { from: 'contacts', to: 'notes', type: 'one-to-many', label: 'Évaluations' }
        ],
        defaultViews: [
            { entitySlug: 'contacts', viewType: 'kanban' },
            { entitySlug: 'taches', viewType: 'table' },
            { entitySlug: 'evenements', viewType: 'calendar' }
        ]
    },
    {
        name: 'Productivité personnelle',
        slug: 'productivite-personnelle',
        description: 'Organisez votre travail quotidien avec des tâches, notes, calendrier et rappels dans un espace personnel.',
        icon: 'solar:clipboard-check-bold-duotone',
        color: '#8b5cf6',
        category: 'productivity',
        tags: ['productivité', 'personnel', 'todo', 'organisation'],
        entities: [
            { templateSlug: 'taches', name: 'Tâches', isMain: true, order: 0 },
            { templateSlug: 'notes', name: 'Notes', isMain: false, order: 1 },
            { templateSlug: 'evenements', name: 'Calendrier', isMain: false, order: 2 },
            { templateSlug: 'documents', name: 'Documents', isMain: false, order: 3 }
        ],
        relations: [
            { from: 'taches', to: 'notes', type: 'one-to-many', label: 'Notes de la tâche' },
            { from: 'taches', to: 'evenements', type: 'one-to-many', label: 'Échéances' },
            { from: 'taches', to: 'documents', type: 'many-to-many', label: 'Fichiers joints' }
        ],
        defaultViews: [
            { entitySlug: 'taches', viewType: 'kanban' },
            { entitySlug: 'evenements', viewType: 'calendar' },
            { entitySlug: 'notes', viewType: 'list' }
        ]
    },
    {
        name: 'Cabinet Médical',
        slug: 'cabinet-medical',
        description: 'Gérez vos patients, rendez-vous, dossiers médicaux et prescriptions dans un espace conforme et sécurisé.',
        icon: 'solar:health-bold-duotone',
        color: '#2196f3',
        category: 'medical',
        tags: ['médical', 'patients', 'rendez-vous', 'santé'],
        entities: [
            { templateSlug: 'contacts', name: 'Patients', isMain: true, order: 0 },
            { templateSlug: 'evenements', name: 'Rendez-vous', isMain: false, order: 1 },
            { templateSlug: 'documents', name: 'Dossiers médicaux', isMain: false, order: 2 },
            { templateSlug: 'notes', name: 'Observations', isMain: false, order: 3 },
            { templateSlug: 'taches', name: 'Prescriptions', isMain: false, order: 4 }
        ],
        relations: [
            { from: 'contacts', to: 'evenements', type: 'one-to-many', label: 'Rendez-vous du patient' },
            { from: 'contacts', to: 'documents', type: 'one-to-many', label: 'Dossier médical' },
            { from: 'contacts', to: 'notes', type: 'one-to-many', label: 'Observations cliniques' },
            { from: 'contacts', to: 'taches', type: 'one-to-many', label: 'Prescriptions' },
            { from: 'evenements', to: 'notes', type: 'one-to-many', label: 'Notes de consultation' }
        ],
        defaultViews: [
            { entitySlug: 'contacts', viewType: 'table' },
            { entitySlug: 'evenements', viewType: 'calendar' }
        ]
    },
    {
        name: 'Gestion Immobilière',
        slug: 'gestion-immobiliere',
        description: 'Gérez vos biens immobiliers, locataires, contrats de bail et interventions de maintenance.',
        icon: 'solar:buildings-bold-duotone',
        color: '#f97316',
        category: 'logistics',
        tags: ['immobilier', 'location', 'biens', 'locataires'],
        entities: [
            { templateSlug: 'projets', name: 'Biens immobiliers', isMain: true, order: 0 },
            { templateSlug: 'contacts', name: 'Locataires', isMain: false, order: 1 },
            { templateSlug: 'documents', name: 'Contrats & Baux', isMain: false, order: 2 },
            { templateSlug: 'taches', name: 'Maintenance', isMain: false, order: 3 },
            { templateSlug: 'factures', name: 'Loyers & Charges', isMain: false, order: 4 }
        ],
        relations: [
            { from: 'projets', to: 'contacts', type: 'one-to-many', label: 'Locataires du bien' },
            { from: 'projets', to: 'documents', type: 'one-to-many', label: 'Contrats de bail' },
            { from: 'projets', to: 'taches', type: 'one-to-many', label: 'Interventions' },
            { from: 'contacts', to: 'factures', type: 'one-to-many', label: 'Loyers' }
        ],
        defaultViews: [
            { entitySlug: 'projets', viewType: 'table' },
            { entitySlug: 'contacts', viewType: 'table' },
            { entitySlug: 'taches', viewType: 'kanban' }
        ]
    }
];

async function seed() {
    console.log('🔌 Connecting to', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected\n');

    const SpaceTemplate = mongoose.connection.model('SpaceTemplate',
        new mongoose.Schema({
            name: String, slug: { type: String, unique: true }, description: String,
            icon: String, color: String, image: String,
            category: String, tags: [String],
            entities: { type: [mongoose.Schema.Types.Mixed], default: [] },
            relations: { type: [mongoose.Schema.Types.Mixed], default: [] },
            defaultViews: { type: [mongoose.Schema.Types.Mixed], default: [] },
            active: { type: Boolean, default: true },
            featured: { type: Boolean, default: false },
            order: { type: Number, default: 0 },
            usageCount: { type: Number, default: 0 },
            createdBy: mongoose.Schema.Types.ObjectId
        }, { timestamps: true })
    );

    // Upsert each template
    let created = 0, updated = 0;
    for (const tpl of systemSpaceTemplates) {
        const existing = await SpaceTemplate.findOne({ slug: tpl.slug });
        if (existing) {
            await SpaceTemplate.updateOne({ slug: tpl.slug }, { $set: tpl });
            updated++;
            console.log(`   ♻️  Updated: ${tpl.name}`);
        } else {
            await SpaceTemplate.create({ ...tpl, active: true, order: created });
            created++;
            console.log(`   ✨ Created: ${tpl.name}`);
        }
    }

    console.log(`\n📊 Summary: ${created} created, ${updated} updated (${systemSpaceTemplates.length} total)`);

    await mongoose.disconnect();
    console.log('\n✅ Done!');
}

seed().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
