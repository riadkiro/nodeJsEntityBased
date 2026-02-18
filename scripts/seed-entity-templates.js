/**
 * Seed Entity Templates
 * Creates realistic, production-ready entity templates in the global SaaS DB.
 * Run: node scripts/seed-entity-templates.js
 */
const mongoose = require('mongoose');
const dbConfig = require('../config/db');

async function seed() {
    console.log('[Seed] Connecting to global DB...');
    const conn = await mongoose.createConnection(dbConfig.globalDbUri);
    await new Promise(r => conn.once('open', r));

    // Register model on this connection
    const EntityTemplateSchema = require('../models/entity-template.model.js').schema;
    const EntityTemplate = conn.model('EntityTemplate', EntityTemplateSchema);

    // Clear existing templates
    await EntityTemplate.deleteMany({});
    console.log('[Seed] Cleared existing templates');

    const templates = [
        // ═══════════════ CRM ═══════════════
        {
            name: 'Contacts',
            slug: 'contacts',
            description: 'Gérez vos contacts, prospects et clients avec un suivi complet des interactions et des informations de contact.',
            icon: 'solar:users-group-rounded-bold-duotone',
            color: '#4361ee',
            category: 'crm',
            tags: ['contacts', 'clients', 'prospects', 'crm'],
            active: true,
            featured: true,
            order: 1,
            enabledStandardFields: ['title', 'description', 'icon', 'image', 'attachments'],
            fields: [
                { name: 'email', label: 'Email', type: 'string', subtype: 'email', category: 'text', icon: 'solar:letter-bold-duotone', required: true, ui: { placeholder: 'email@exemple.com', width: 'half', order: 1 } },
                { name: 'phone', label: 'Téléphone', type: 'string', subtype: 'tel', category: 'text', icon: 'solar:phone-bold-duotone', ui: { placeholder: '+33 6 12 34 56 78', width: 'half', order: 2 } },
                { name: 'company', label: 'Société', type: 'string', category: 'text', icon: 'solar:buildings-bold-duotone', ui: { placeholder: 'Nom de la société', width: 'half', order: 3 } },
                { name: 'position', label: 'Poste', type: 'string', category: 'text', icon: 'solar:case-bold-duotone', ui: { placeholder: 'Directeur, Manager...', width: 'half', order: 4 } },
                { name: 'address', label: 'Adresse', type: 'text', category: 'text', icon: 'solar:map-point-bold-duotone', ui: { placeholder: 'Adresse complète', width: 'full', order: 5 } },
                { name: 'website', label: 'Site web', type: 'string', subtype: 'url', category: 'text', icon: 'solar:global-bold-duotone', ui: { placeholder: 'https://', width: 'half', order: 6 } },
                { name: 'source', label: 'Source', type: 'select', category: 'choice', icon: 'solar:target-bold-duotone', typeConfig: { options: ['Site web', 'Réseaux sociaux', 'Référence', 'Salon', 'Appel entrant', 'Email', 'Autre'] }, ui: { width: 'half', order: 7 } },
                { name: 'revenue', label: 'Chiffre d\'affaires', type: 'number', category: 'numeric', icon: 'solar:wallet-bold-duotone', typeConfig: { suffix: '€', decimals: 2 }, ui: { placeholder: '0.00', width: 'half', order: 8 } },
                { name: 'notes', label: 'Notes', type: 'text', category: 'text', icon: 'solar:notes-bold-duotone', ui: { placeholder: 'Notes internes...', width: 'full', order: 9 } }
            ],
            classifications: [
                {
                    name: 'Statut Contact',
                    slug: 'statut-contact',
                    type: 'status',
                    isStatus: true,
                    options: [
                        { label: 'Nouveau', value: 'nouveau', color: '#4361ee', order: 0 },
                        { label: 'Contacté', value: 'contacte', color: '#f59e0b', order: 1 },
                        { label: 'Qualifié', value: 'qualifie', color: '#805dca', order: 2 },
                        { label: 'Négociation', value: 'negociation', color: '#e2a03f', order: 3 },
                        { label: 'Gagné', value: 'gagne', color: '#00ab55', order: 4 },
                        { label: 'Perdu', value: 'perdu', color: '#e7515a', order: 5 }
                    ]
                },
                {
                    name: 'Type de contact',
                    slug: 'type-contact',
                    type: 'category',
                    options: [
                        { label: 'Prospect', value: 'prospect', color: '#4361ee', order: 0 },
                        { label: 'Client', value: 'client', color: '#00ab55', order: 1 },
                        { label: 'Partenaire', value: 'partenaire', color: '#805dca', order: 2 },
                        { label: 'Fournisseur', value: 'fournisseur', color: '#e2a03f', order: 3 }
                    ]
                },
                {
                    name: 'Priorité',
                    slug: 'priorite-contact',
                    type: 'priority',
                    options: [
                        { label: 'Basse', value: 'basse', color: '#94a3b8', order: 0 },
                        { label: 'Moyenne', value: 'moyenne', color: '#f59e0b', order: 1 },
                        { label: 'Haute', value: 'haute', color: '#e2a03f', order: 2 },
                        { label: 'Urgente', value: 'urgente', color: '#e7515a', order: 3 }
                    ]
                }
            ],
            referenceTitleTokens: [{ t: 'field', id: 'title' }]
        },

        {
            name: 'Opportunités',
            slug: 'opportunities',
            description: 'Suivez vos opportunités commerciales, du premier contact à la conclusion. Pipeline de vente avec montants et probabilités.',
            icon: 'solar:star-shine-bold-duotone',
            color: '#f59e0b',
            category: 'crm',
            tags: ['ventes', 'opportunites', 'pipeline', 'deals'],
            active: true,
            featured: true,
            order: 2,
            enabledStandardFields: ['title', 'description', 'date', 'attachments'],
            fields: [
                { name: 'amount', label: 'Montant', type: 'number', category: 'numeric', icon: 'solar:wallet-bold-duotone', required: true, typeConfig: { suffix: '€', decimals: 2 }, ui: { placeholder: '0.00', width: 'half', order: 1 } },
                { name: 'probability', label: 'Probabilité (%)', type: 'number', category: 'numeric', icon: 'solar:chart-bold-duotone', typeConfig: { suffix: '%', min: 0, max: 100 }, ui: { placeholder: '0', width: 'half', order: 2 } },
                { name: 'expected_close', label: 'Date de clôture prévue', type: 'date', category: 'date', icon: 'solar:calendar-bold-duotone', ui: { width: 'half', order: 3 } },
                { name: 'contact_name', label: 'Nom du contact', type: 'string', category: 'text', icon: 'solar:user-bold-duotone', ui: { placeholder: 'Nom du contact principal', width: 'half', order: 4 } },
                { name: 'company', label: 'Société', type: 'string', category: 'text', icon: 'solar:buildings-bold-duotone', ui: { placeholder: 'Entreprise', width: 'half', order: 5 } },
                { name: 'source', label: 'Source', type: 'select', category: 'choice', icon: 'solar:target-bold-duotone', typeConfig: { options: ['Appel entrant', 'Site web', 'Recommandation', 'Salon', 'LinkedIn', 'Partenaire', 'Autre'] }, ui: { width: 'half', order: 6 } },
                { name: 'notes', label: 'Notes', type: 'text', category: 'text', icon: 'solar:notes-bold-duotone', ui: { placeholder: 'Notes sur l\'opportunité...', width: 'full', order: 7 } }
            ],
            classifications: [
                {
                    name: 'Pipeline',
                    slug: 'pipeline-stage',
                    type: 'status',
                    isStatus: true,
                    options: [
                        { label: 'Prospection', value: 'prospection', color: '#94a3b8', order: 0 },
                        { label: 'Qualification', value: 'qualification', color: '#4361ee', order: 1 },
                        { label: 'Proposition', value: 'proposition', color: '#805dca', order: 2 },
                        { label: 'Négociation', value: 'negociation', color: '#f59e0b', order: 3 },
                        { label: 'Gagné', value: 'gagne', color: '#00ab55', order: 4 },
                        { label: 'Perdu', value: 'perdu', color: '#e7515a', order: 5 }
                    ]
                }
            ],
            referenceTitleTokens: [{ t: 'field', id: 'title' }]
        },

        // ═══════════════ PROJECT ═══════════════
        {
            name: 'Projets',
            slug: 'projets',
            description: 'Gérez vos projets avec un suivi des tâches, des échéances et un tableau Kanban pour visualiser l\'avancement.',
            icon: 'solar:folder-check-bold-duotone',
            color: '#00ab55',
            category: 'project',
            tags: ['projets', 'gestion', 'kanban', 'taches'],
            active: true,
            featured: true,
            order: 3,
            enabledStandardFields: ['title', 'description', 'date', 'icon', 'image', 'attachments'],
            fields: [
                { name: 'start_date', label: 'Date de début', type: 'date', category: 'date', icon: 'solar:calendar-bold-duotone', ui: { width: 'half', order: 1 } },
                { name: 'end_date', label: 'Date de fin', type: 'date', category: 'date', icon: 'solar:calendar-mark-bold-duotone', ui: { width: 'half', order: 2 } },
                { name: 'budget', label: 'Budget', type: 'number', category: 'numeric', icon: 'solar:wallet-bold-duotone', typeConfig: { suffix: '€', decimals: 2 }, ui: { placeholder: '0.00', width: 'half', order: 3 } },
                { name: 'progress', label: 'Progression (%)', type: 'number', category: 'numeric', icon: 'solar:chart-bold-duotone', typeConfig: { suffix: '%', min: 0, max: 100 }, ui: { placeholder: '0', width: 'half', order: 4 } },
                { name: 'manager', label: 'Chef de projet', type: 'string', category: 'text', icon: 'solar:user-circle-bold-duotone', ui: { placeholder: 'Responsable du projet', width: 'half', order: 5 } },
                { name: 'client', label: 'Client', type: 'string', category: 'text', icon: 'solar:buildings-bold-duotone', ui: { placeholder: 'Client final', width: 'half', order: 6 } },
                { name: 'notes', label: 'Notes', type: 'text', category: 'text', icon: 'solar:notes-bold-duotone', ui: { placeholder: 'Notes internes sur le projet...', width: 'full', order: 7 } }
            ],
            classifications: [
                {
                    name: 'Statut Projet',
                    slug: 'statut-projet',
                    type: 'status',
                    isStatus: true,
                    options: [
                        { label: 'Planifié', value: 'planifie', color: '#94a3b8', order: 0 },
                        { label: 'En cours', value: 'en-cours', color: '#4361ee', order: 1 },
                        { label: 'En revue', value: 'en-revue', color: '#805dca', order: 2 },
                        { label: 'En pause', value: 'en-pause', color: '#f59e0b', order: 3 },
                        { label: 'Terminé', value: 'termine', color: '#00ab55', order: 4 },
                        { label: 'Annulé', value: 'annule', color: '#e7515a', order: 5 }
                    ]
                },
                {
                    name: 'Priorité Projet',
                    slug: 'priorite-projet',
                    type: 'priority',
                    options: [
                        { label: 'Basse', value: 'basse', color: '#94a3b8', order: 0 },
                        { label: 'Normale', value: 'normale', color: '#4361ee', order: 1 },
                        { label: 'Haute', value: 'haute', color: '#e2a03f', order: 2 },
                        { label: 'Critique', value: 'critique', color: '#e7515a', order: 3 }
                    ]
                },
                {
                    name: 'Type Projet',
                    slug: 'type-projet',
                    type: 'category',
                    options: [
                        { label: 'Interne', value: 'interne', color: '#4361ee', order: 0 },
                        { label: 'Client', value: 'client', color: '#00ab55', order: 1 },
                        { label: 'R&D', value: 'rd', color: '#805dca', order: 2 },
                        { label: 'Maintenance', value: 'maintenance', color: '#e2a03f', order: 3 }
                    ]
                }
            ],
            referenceTitleTokens: [{ t: 'field', id: 'title' }]
        },

        {
            name: 'Tâches',
            slug: 'taches',
            description: 'Suivez toutes les tâches de votre équipe avec un système de priorités, dates limites et statuts en mode Kanban.',
            icon: 'solar:checklist-bold-duotone',
            color: '#805dca',
            category: 'project',
            tags: ['taches', 'todo', 'kanban', 'suivi'],
            active: true,
            featured: false,
            order: 4,
            enabledStandardFields: ['title', 'description', 'date', 'attachments'],
            fields: [
                { name: 'assigned_to', label: 'Assigné à', type: 'string', category: 'text', icon: 'solar:user-bold-duotone', ui: { placeholder: 'Nom du responsable', width: 'half', order: 1 } },
                { name: 'due_date', label: 'Date limite', type: 'date', category: 'date', icon: 'solar:calendar-mark-bold-duotone', required: true, ui: { width: 'half', order: 2 } },
                { name: 'estimated_hours', label: 'Heures estimées', type: 'number', category: 'numeric', icon: 'solar:clock-circle-bold-duotone', typeConfig: { suffix: 'h', decimals: 1 }, ui: { placeholder: '0', width: 'half', order: 3 } },
                { name: 'actual_hours', label: 'Heures réelles', type: 'number', category: 'numeric', icon: 'solar:stopwatch-bold-duotone', typeConfig: { suffix: 'h', decimals: 1 }, ui: { placeholder: '0', width: 'half', order: 4 } },
                { name: 'notes', label: 'Notes', type: 'text', category: 'text', icon: 'solar:notes-bold-duotone', ui: { placeholder: 'Détails de la tâche...', width: 'full', order: 5 } }
            ],
            classifications: [
                {
                    name: 'Statut Tâche',
                    slug: 'statut-tache',
                    type: 'status',
                    isStatus: true,
                    options: [
                        { label: 'À faire', value: 'a-faire', color: '#94a3b8', order: 0 },
                        { label: 'En cours', value: 'en-cours', color: '#4361ee', order: 1 },
                        { label: 'En revue', value: 'en-revue', color: '#805dca', order: 2 },
                        { label: 'Terminé', value: 'termine', color: '#00ab55', order: 3 },
                        { label: 'Bloqué', value: 'bloque', color: '#e7515a', order: 4 }
                    ]
                },
                {
                    name: 'Priorité',
                    slug: 'priorite-tache',
                    type: 'priority',
                    options: [
                        { label: 'Basse', value: 'basse', color: '#94a3b8', order: 0 },
                        { label: 'Moyenne', value: 'moyenne', color: '#f59e0b', order: 1 },
                        { label: 'Haute', value: 'haute', color: '#e2a03f', order: 2 },
                        { label: 'Urgente', value: 'urgente', color: '#e7515a', order: 3 }
                    ]
                }
            ],
            referenceTitleTokens: [{ t: 'field', id: 'title' }]
        },

        // ═══════════════ HR ═══════════════
        {
            name: 'Employés',
            slug: 'employes',
            description: 'Répertoire complet des employés avec informations personnelles, contrats, et suivi administratif.',
            icon: 'solar:user-id-bold-duotone',
            color: '#0891b2',
            category: 'hr',
            tags: ['rh', 'employes', 'personnel', 'equipe'],
            active: true,
            featured: false,
            order: 5,
            enabledStandardFields: ['title', 'description', 'image', 'attachments'],
            fields: [
                { name: 'email', label: 'Email professionnel', type: 'string', subtype: 'email', category: 'text', icon: 'solar:letter-bold-duotone', required: true, ui: { placeholder: 'email@company.com', width: 'half', order: 1 } },
                { name: 'phone', label: 'Téléphone', type: 'string', subtype: 'tel', category: 'text', icon: 'solar:phone-bold-duotone', ui: { placeholder: '+33 6 ...', width: 'half', order: 2 } },
                { name: 'department', label: 'Département', type: 'select', category: 'choice', icon: 'solar:buildings-3-bold-duotone', typeConfig: { options: ['Direction', 'Commercial', 'Marketing', 'IT', 'RH', 'Finance', 'Production', 'Logistique', 'R&D'] }, ui: { width: 'half', order: 3 } },
                { name: 'position', label: 'Poste', type: 'string', category: 'text', icon: 'solar:case-bold-duotone', ui: { placeholder: 'Intitulé du poste', width: 'half', order: 4 } },
                { name: 'hire_date', label: 'Date d\'embauche', type: 'date', category: 'date', icon: 'solar:calendar-bold-duotone', ui: { width: 'half', order: 5 } },
                { name: 'contract_type', label: 'Type de contrat', type: 'select', category: 'choice', icon: 'solar:document-bold-duotone', typeConfig: { options: ['CDI', 'CDD', 'Intérim', 'Stage', 'Freelance', 'Alternance'] }, ui: { width: 'half', order: 6 } },
                { name: 'salary', label: 'Salaire brut annuel', type: 'number', category: 'numeric', icon: 'solar:wallet-bold-duotone', typeConfig: { suffix: '€', decimals: 2 }, ui: { placeholder: '0.00', width: 'half', order: 7 } },
                { name: 'manager', label: 'Manager', type: 'string', category: 'text', icon: 'solar:user-circle-bold-duotone', ui: { placeholder: 'Responsable hiérarchique', width: 'half', order: 8 } }
            ],
            classifications: [
                {
                    name: 'Statut Employé',
                    slug: 'statut-employe',
                    type: 'status',
                    isStatus: true,
                    options: [
                        { label: 'Actif', value: 'actif', color: '#00ab55', order: 0 },
                        { label: 'En congé', value: 'en-conge', color: '#f59e0b', order: 1 },
                        { label: 'En formation', value: 'en-formation', color: '#4361ee', order: 2 },
                        { label: 'Suspendu', value: 'suspendu', color: '#e7515a', order: 3 },
                        { label: 'Parti', value: 'parti', color: '#94a3b8', order: 4 }
                    ]
                }
            ],
            referenceTitleTokens: [{ t: 'field', id: 'title' }]
        },

        // ═══════════════ FINANCE ═══════════════
        {
            name: 'Factures',
            slug: 'factures',
            description: 'Suivi complet de la facturation avec montants, dates d\'échéance, statuts de paiement et gestion des relances.',
            icon: 'solar:bill-list-bold-duotone',
            color: '#e2a03f',
            category: 'finance',
            tags: ['factures', 'facturation', 'paiement', 'comptabilite'],
            active: true,
            featured: true,
            order: 6,
            enabledStandardFields: ['title', 'description', 'date', 'attachments'],
            fields: [
                { name: 'invoice_number', label: 'N° Facture', type: 'string', category: 'text', icon: 'solar:hashtag-bold-duotone', required: true, ui: { placeholder: 'FAC-2026-001', width: 'half', order: 1 } },
                { name: 'client', label: 'Client', type: 'string', category: 'text', icon: 'solar:buildings-bold-duotone', required: true, ui: { placeholder: 'Nom du client', width: 'half', order: 2 } },
                { name: 'amount_ht', label: 'Montant HT', type: 'number', category: 'numeric', icon: 'solar:wallet-bold-duotone', required: true, typeConfig: { suffix: '€', decimals: 2 }, ui: { placeholder: '0.00', width: 'third', order: 3 } },
                { name: 'tva', label: 'TVA (%)', type: 'number', category: 'numeric', icon: 'solar:tag-price-bold-duotone', typeConfig: { suffix: '%' }, ui: { placeholder: '20', width: 'third', order: 4 } },
                { name: 'amount_ttc', label: 'Montant TTC', type: 'number', category: 'numeric', icon: 'solar:wallet-money-bold-duotone', typeConfig: { suffix: '€', decimals: 2 }, ui: { placeholder: '0.00', width: 'third', order: 5 } },
                { name: 'issue_date', label: 'Date d\'émission', type: 'date', category: 'date', icon: 'solar:calendar-bold-duotone', ui: { width: 'half', order: 6 } },
                { name: 'due_date', label: 'Date d\'échéance', type: 'date', category: 'date', icon: 'solar:calendar-mark-bold-duotone', required: true, ui: { width: 'half', order: 7 } },
                { name: 'payment_method', label: 'Mode de paiement', type: 'select', category: 'choice', icon: 'solar:card-bold-duotone', typeConfig: { options: ['Virement', 'Chèque', 'Carte bancaire', 'Prélèvement', 'Espèces', 'PayPal'] }, ui: { width: 'half', order: 8 } },
                { name: 'notes', label: 'Notes', type: 'text', category: 'text', icon: 'solar:notes-bold-duotone', ui: { placeholder: 'Commentaires sur la facture...', width: 'full', order: 9 } }
            ],
            classifications: [
                {
                    name: 'Statut Paiement',
                    slug: 'statut-paiement',
                    type: 'status',
                    isStatus: true,
                    options: [
                        { label: 'Brouillon', value: 'brouillon', color: '#94a3b8', order: 0 },
                        { label: 'Envoyée', value: 'envoyee', color: '#4361ee', order: 1 },
                        { label: 'En attente', value: 'en-attente', color: '#f59e0b', order: 2 },
                        { label: 'Payée', value: 'payee', color: '#00ab55', order: 3 },
                        { label: 'En retard', value: 'en-retard', color: '#e7515a', order: 4 },
                        { label: 'Annulée', value: 'annulee', color: '#64748b', order: 5 }
                    ]
                }
            ],
            referenceTitleTokens: [{ t: 'text', v: 'FAC-' }, { t: 'field', id: 'title' }]
        },

        // ═══════════════ MEDICAL ═══════════════
        {
            name: 'Patients',
            slug: 'patients',
            description: 'Dossiers patients complets avec informations personnelles, antécédents médicaux et suivi des consultations.',
            icon: 'solar:heart-pulse-bold-duotone',
            color: '#e7515a',
            category: 'medical',
            tags: ['patients', 'medical', 'sante', 'cabinet'],
            active: true,
            featured: false,
            order: 7,
            enabledStandardFields: ['title', 'description', 'date', 'image', 'attachments'],
            fields: [
                { name: 'date_naissance', label: 'Date de naissance', type: 'date', category: 'date', icon: 'solar:calendar-bold-duotone', required: true, ui: { width: 'half', order: 1 } },
                { name: 'sexe', label: 'Sexe', type: 'select', category: 'choice', icon: 'solar:user-bold-duotone', typeConfig: { options: ['Masculin', 'Féminin', 'Autre'] }, ui: { width: 'half', order: 2 } },
                { name: 'phone', label: 'Téléphone', type: 'string', subtype: 'tel', category: 'text', icon: 'solar:phone-bold-duotone', required: true, ui: { placeholder: '+33 6 ...', width: 'half', order: 3 } },
                { name: 'email', label: 'Email', type: 'string', subtype: 'email', category: 'text', icon: 'solar:letter-bold-duotone', ui: { placeholder: 'email@exemple.com', width: 'half', order: 4 } },
                { name: 'num_secu', label: 'N° Sécurité sociale', type: 'string', category: 'text', icon: 'solar:shield-bold-duotone', ui: { placeholder: '1 XX XX XX XXX XXX XX', width: 'half', order: 5 } },
                { name: 'mutuelle', label: 'Mutuelle', type: 'string', category: 'text', icon: 'solar:heart-bold-duotone', ui: { placeholder: 'Nom de la mutuelle', width: 'half', order: 6 } },
                { name: 'blood_type', label: 'Groupe sanguin', type: 'select', category: 'choice', icon: 'solar:test-tube-bold-duotone', typeConfig: { options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] }, ui: { width: 'half', order: 7 } },
                { name: 'allergies', label: 'Allergies', type: 'text', category: 'text', icon: 'solar:danger-bold-duotone', ui: { placeholder: 'Allergies connues...', width: 'half', order: 8 } },
                { name: 'antecedents', label: 'Antécédents médicaux', type: 'text', category: 'text', icon: 'solar:notes-bold-duotone', ui: { placeholder: 'Antécédents...', width: 'full', order: 9 } },
                { name: 'address', label: 'Adresse', type: 'text', category: 'text', icon: 'solar:map-point-bold-duotone', ui: { placeholder: 'Adresse du patient', width: 'full', order: 10 } }
            ],
            classifications: [
                {
                    name: 'Statut Patient',
                    slug: 'statut-patient',
                    type: 'status',
                    isStatus: true,
                    options: [
                        { label: 'Actif', value: 'actif', color: '#00ab55', order: 0 },
                        { label: 'En traitement', value: 'en-traitement', color: '#4361ee', order: 1 },
                        { label: 'Suivi', value: 'suivi', color: '#f59e0b', order: 2 },
                        { label: 'Archivé', value: 'archive', color: '#94a3b8', order: 3 }
                    ]
                }
            ],
            referenceTitleTokens: [{ t: 'field', id: 'title' }]
        },

        // ═══════════════ GENERAL ═══════════════
        {
            name: 'Produits',
            slug: 'produits',
            description: 'Catalogue de produits avec prix, stocks, catégories et fiches produit complètes.',
            icon: 'solar:box-bold-duotone',
            color: '#0891b2',
            category: 'general',
            tags: ['produits', 'catalogue', 'inventaire', 'stock'],
            active: true,
            featured: false,
            order: 8,
            enabledStandardFields: ['title', 'description', 'image', 'slug', 'attachments'],
            fields: [
                { name: 'sku', label: 'Référence (SKU)', type: 'string', category: 'text', icon: 'solar:barcode-bold-duotone', required: true, ui: { placeholder: 'SKU-001', width: 'half', order: 1 } },
                { name: 'price', label: 'Prix HT', type: 'number', category: 'numeric', icon: 'solar:tag-price-bold-duotone', required: true, typeConfig: { suffix: '€', decimals: 2 }, ui: { placeholder: '0.00', width: 'half', order: 2 } },
                { name: 'price_ttc', label: 'Prix TTC', type: 'number', category: 'numeric', icon: 'solar:wallet-money-bold-duotone', typeConfig: { suffix: '€', decimals: 2 }, ui: { placeholder: '0.00', width: 'half', order: 3 } },
                { name: 'stock', label: 'Stock', type: 'number', category: 'numeric', icon: 'solar:box-bold-duotone', typeConfig: { decimals: 0 }, ui: { placeholder: '0', width: 'half', order: 4 } },
                { name: 'weight', label: 'Poids (kg)', type: 'number', category: 'numeric', icon: 'solar:health-bold-duotone', typeConfig: { suffix: 'kg', decimals: 2 }, ui: { placeholder: '0.00', width: 'half', order: 5 } },
                { name: 'supplier', label: 'Fournisseur', type: 'string', category: 'text', icon: 'solar:buildings-bold-duotone', ui: { placeholder: 'Nom du fournisseur', width: 'half', order: 6 } }
            ],
            classifications: [
                {
                    name: 'Disponibilité',
                    slug: 'disponibilite-produit',
                    type: 'status',
                    isStatus: true,
                    options: [
                        { label: 'Disponible', value: 'disponible', color: '#00ab55', order: 0 },
                        { label: 'Stock faible', value: 'stock-faible', color: '#f59e0b', order: 1 },
                        { label: 'Rupture', value: 'rupture', color: '#e7515a', order: 2 },
                        { label: 'Discontinué', value: 'discontinue', color: '#94a3b8', order: 3 }
                    ]
                },
                {
                    name: 'Catégorie Produit',
                    slug: 'categorie-produit',
                    type: 'category',
                    options: [
                        { label: 'Électronique', value: 'electronique', color: '#4361ee', order: 0 },
                        { label: 'Mobilier', value: 'mobilier', color: '#00ab55', order: 1 },
                        { label: 'Fournitures', value: 'fournitures', color: '#e2a03f', order: 2 },
                        { label: 'Services', value: 'services', color: '#805dca', order: 3 }
                    ]
                }
            ],
            referenceTitleTokens: [{ t: 'field', id: 'title' }]
        }
    ];

    const created = await EntityTemplate.insertMany(templates);
    console.log(`[Seed] ✅ Created ${created.length} entity templates:`);
    created.forEach(t => {
        console.log(`  - ${t.name} (${t.category}) — ${t.fields.length} fields, ${t.classifications.length} classifications`);
    });

    await conn.close();
    console.log('[Seed] Done!');
    process.exit(0);
}

seed().catch(err => {
    console.error('[Seed] Error:', err);
    process.exit(1);
});
