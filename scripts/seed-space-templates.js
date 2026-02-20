/**
 * Seed SpaceTemplates & EntityTemplates
 * ─────────────────────────────────────
 * Run: node scripts/seed-space-templates.js
 * Populates the global SaaS DB with predefined workspace templates.
 */
const mongoose = require('mongoose');
const SpaceTemplate = require('../models/space-template.model');
const EntityTemplate = require('../models/entity-template.model');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/saasDemo';

// ══════════════════════════════════════════════
// ENTITY TEMPLATES
// ══════════════════════════════════════════════
const entityTemplates = [
    // ─── CRM ───
    {
        name: 'Contacts',
        slug: 'tpl-contacts',
        description: 'Gestion des contacts et prospects',
        icon: 'solar:users-group-rounded-bold-duotone',
        color: '#00ab55',
        category: 'crm',
        tags: ['contacts', 'crm', 'people'],
        enabledStandardFields: ['title'],
        fields: [
            { name: 'email', label: 'Email', type: 'string', subtype: 'email', category: 'text', icon: 'solar:letter-bold-duotone', required: true },
            { name: 'phone', label: 'Téléphone', type: 'string', subtype: 'tel', category: 'text', icon: 'solar:phone-bold-duotone' },
            { name: 'company', label: 'Entreprise', type: 'string', category: 'text', icon: 'solar:buildings-3-bold-duotone' },
            { name: 'position', label: 'Poste', type: 'string', category: 'text', icon: 'solar:case-round-bold-duotone' },
            { name: 'address', label: 'Adresse', type: 'string', category: 'text', icon: 'solar:map-point-bold-duotone' },
            { name: 'notes', label: 'Notes', type: 'text', category: 'text', icon: 'solar:notes-bold-duotone' }
        ],
        classifications: [
            {
                name: 'Statut', slug: 'status', type: 'status', isStatus: true,
                options: [
                    { label: 'Nouveau', value: 'new', color: '#3b82f6', order: 0 },
                    { label: 'Contacté', value: 'contacted', color: '#f59e0b', order: 1 },
                    { label: 'Qualifié', value: 'qualified', color: '#8b5cf6', order: 2 },
                    { label: 'Client', value: 'client', color: '#22c55e', order: 3 },
                    { label: 'Inactif', value: 'inactive', color: '#6b7280', order: 4 }
                ]
            },
            {
                name: 'Source', slug: 'source', type: 'tag',
                options: [
                    { label: 'Site web', value: 'website', color: '#3b82f6' },
                    { label: 'Recommandation', value: 'referral', color: '#22c55e' },
                    { label: 'Réseaux sociaux', value: 'social', color: '#ec4899' },
                    { label: 'Salon', value: 'event', color: '#f59e0b' }
                ]
            }
        ],
        featured: true, active: true, order: 0
    },
    {
        name: 'Opportunités',
        slug: 'tpl-opportunities',
        description: 'Suivi du pipeline commercial',
        icon: 'solar:money-bag-bold-duotone',
        color: '#e2a03f',
        category: 'crm',
        tags: ['deals', 'pipeline', 'sales'],
        enabledStandardFields: ['title'],
        fields: [
            { name: 'amount', label: 'Montant', type: 'number', category: 'numeric', icon: 'solar:dollar-bold-duotone' },
            { name: 'expected_close', label: 'Date de clôture prévue', type: 'date', category: 'date', icon: 'solar:calendar-bold-duotone' },
            { name: 'probability', label: 'Probabilité (%)', type: 'number', category: 'numeric', icon: 'solar:chart-bold-duotone' },
            { name: 'description', label: 'Description', type: 'text', category: 'text', icon: 'solar:document-text-bold-duotone' }
        ],
        classifications: [
            {
                name: 'Pipeline', slug: 'pipeline', type: 'status', isStatus: true,
                options: [
                    { label: 'Prospection', value: 'prospecting', color: '#94a3b8', order: 0 },
                    { label: 'Qualification', value: 'qualification', color: '#3b82f6', order: 1 },
                    { label: 'Proposition', value: 'proposal', color: '#f59e0b', order: 2 },
                    { label: 'Négociation', value: 'negotiation', color: '#8b5cf6', order: 3 },
                    { label: 'Gagné', value: 'won', color: '#22c55e', order: 4 },
                    { label: 'Perdu', value: 'lost', color: '#ef4444', order: 5 }
                ]
            }
        ],
        featured: true, active: true, order: 1
    },
    // ─── COMPTABILITÉ ───
    {
        name: 'Factures',
        slug: 'tpl-invoices',
        description: 'Gestion des factures et devis',
        icon: 'solar:bill-list-bold-duotone',
        color: '#e2a03f',
        category: 'finance',
        tags: ['invoices', 'billing', 'finance'],
        enabledStandardFields: ['title'],
        fields: [
            { name: 'invoice_number', label: 'N° Facture', type: 'string', category: 'text', icon: 'solar:hashtag-bold-duotone', required: true },
            { name: 'client', label: 'Client', type: 'string', category: 'text', icon: 'solar:user-bold-duotone', required: true },
            { name: 'amount_ht', label: 'Montant HT', type: 'number', category: 'numeric', icon: 'solar:dollar-bold-duotone' },
            { name: 'tax_rate', label: 'TVA (%)', type: 'number', category: 'numeric', icon: 'solar:percent-bold-duotone' },
            { name: 'amount_ttc', label: 'Montant TTC', type: 'number', category: 'numeric', icon: 'solar:wallet-bold-duotone' },
            { name: 'due_date', label: 'Date d\'échéance', type: 'date', category: 'date', icon: 'solar:calendar-bold-duotone' },
            { name: 'payment_date', label: 'Date de paiement', type: 'date', category: 'date', icon: 'solar:calendar-mark-bold-duotone' }
        ],
        classifications: [
            {
                name: 'Statut', slug: 'status', type: 'status', isStatus: true,
                options: [
                    { label: 'Brouillon', value: 'draft', color: '#94a3b8', order: 0 },
                    { label: 'Envoyée', value: 'sent', color: '#3b82f6', order: 1 },
                    { label: 'En retard', value: 'overdue', color: '#ef4444', order: 2 },
                    { label: 'Payée', value: 'paid', color: '#22c55e', order: 3 },
                    { label: 'Annulée', value: 'cancelled', color: '#6b7280', order: 4 }
                ]
            },
            {
                name: 'Type', slug: 'type', type: 'category',
                options: [
                    { label: 'Facture', value: 'invoice', color: '#3b82f6' },
                    { label: 'Devis', value: 'quote', color: '#f59e0b' },
                    { label: 'Avoir', value: 'credit_note', color: '#ef4444' },
                    { label: 'Acompte', value: 'deposit', color: '#8b5cf6' }
                ]
            }
        ],
        featured: true, active: true, order: 0
    },
    {
        name: 'Dépenses',
        slug: 'tpl-expenses',
        description: 'Suivi des dépenses et charges',
        icon: 'solar:card-recive-bold-duotone',
        color: '#ef4444',
        category: 'finance',
        tags: ['expenses', 'spending', 'finance'],
        enabledStandardFields: ['title'],
        fields: [
            { name: 'amount', label: 'Montant', type: 'number', category: 'numeric', icon: 'solar:dollar-bold-duotone', required: true },
            { name: 'date', label: 'Date', type: 'date', category: 'date', icon: 'solar:calendar-bold-duotone', required: true },
            { name: 'vendor', label: 'Fournisseur', type: 'string', category: 'text', icon: 'solar:shop-2-bold-duotone' },
            { name: 'description', label: 'Description', type: 'text', category: 'text', icon: 'solar:document-text-bold-duotone' },
            { name: 'receipt', label: 'Justificatif', type: 'file', category: 'media', icon: 'solar:gallery-bold-duotone' }
        ],
        classifications: [
            {
                name: 'Catégorie', slug: 'category', type: 'category',
                options: [
                    { label: 'Fournitures', value: 'supplies', color: '#3b82f6' },
                    { label: 'Transport', value: 'transport', color: '#f59e0b' },
                    { label: 'Repas', value: 'meals', color: '#22c55e' },
                    { label: 'Loyer', value: 'rent', color: '#8b5cf6' },
                    { label: 'Télécom', value: 'telecom', color: '#06b6d4' },
                    { label: 'Autre', value: 'other', color: '#6b7280' }
                ]
            }
        ],
        featured: false, active: true, order: 1
    },
    // ─── PROJET ───
    {
        name: 'Tâches',
        slug: 'tpl-tasks',
        description: 'Gestion des tâches et actions',
        icon: 'solar:checklist-bold-duotone',
        color: '#e7515a',
        category: 'project',
        tags: ['tasks', 'todo', 'actions'],
        enabledStandardFields: ['title'],
        fields: [
            { name: 'description', label: 'Description', type: 'text', category: 'text', icon: 'solar:document-text-bold-duotone' },
            { name: 'assignee', label: 'Assigné à', type: 'string', category: 'text', icon: 'solar:user-bold-duotone' },
            { name: 'due_date', label: 'Date d\'échéance', type: 'date', category: 'date', icon: 'solar:calendar-bold-duotone' },
            { name: 'estimated_hours', label: 'Heures estimées', type: 'number', category: 'numeric', icon: 'solar:clock-circle-bold-duotone' }
        ],
        classifications: [
            {
                name: 'Statut', slug: 'status', type: 'status', isStatus: true,
                options: [
                    { label: 'À faire', value: 'todo', color: '#94a3b8', order: 0 },
                    { label: 'En cours', value: 'in_progress', color: '#3b82f6', order: 1 },
                    { label: 'En revue', value: 'review', color: '#f59e0b', order: 2 },
                    { label: 'Terminé', value: 'done', color: '#22c55e', order: 3 },
                    { label: 'Bloqué', value: 'blocked', color: '#ef4444', order: 4 }
                ]
            },
            {
                name: 'Priorité', slug: 'priority', type: 'priority',
                options: [
                    { label: 'Critique', value: 'critical', color: '#ef4444' },
                    { label: 'Haute', value: 'high', color: '#f59e0b' },
                    { label: 'Normale', value: 'normal', color: '#3b82f6' },
                    { label: 'Basse', value: 'low', color: '#22c55e' }
                ]
            }
        ],
        featured: true, active: true, order: 0
    },
    {
        name: 'Jalons',
        slug: 'tpl-milestones',
        description: 'Jalons et objectifs de projet',
        icon: 'solar:flag-bold-duotone',
        color: '#8b5cf6',
        category: 'project',
        tags: ['milestones', 'project'],
        enabledStandardFields: ['title'],
        fields: [
            { name: 'description', label: 'Description', type: 'text', category: 'text', icon: 'solar:document-text-bold-duotone' },
            { name: 'target_date', label: 'Date cible', type: 'date', category: 'date', icon: 'solar:calendar-bold-duotone' },
            { name: 'progress', label: 'Progression (%)', type: 'number', category: 'numeric', icon: 'solar:chart-bold-duotone' }
        ],
        classifications: [
            {
                name: 'Statut', slug: 'status', type: 'status', isStatus: true,
                options: [
                    { label: 'Planifié', value: 'planned', color: '#94a3b8', order: 0 },
                    { label: 'En cours', value: 'in_progress', color: '#3b82f6', order: 1 },
                    { label: 'Atteint', value: 'reached', color: '#22c55e', order: 2 },
                    { label: 'En retard', value: 'delayed', color: '#ef4444', order: 3 }
                ]
            }
        ],
        featured: false, active: true, order: 1
    },
    // ─── RH ───
    {
        name: 'Employés',
        slug: 'tpl-employees',
        description: 'Registre du personnel',
        icon: 'solar:user-id-bold-duotone',
        color: '#805dca',
        category: 'hr',
        tags: ['employees', 'hr', 'people'],
        enabledStandardFields: ['title'],
        fields: [
            { name: 'email', label: 'Email professionnel', type: 'string', subtype: 'email', category: 'text', icon: 'solar:letter-bold-duotone', required: true },
            { name: 'phone', label: 'Téléphone', type: 'string', subtype: 'tel', category: 'text', icon: 'solar:phone-bold-duotone' },
            { name: 'department', label: 'Département', type: 'string', category: 'text', icon: 'solar:buildings-3-bold-duotone' },
            { name: 'position', label: 'Poste', type: 'string', category: 'text', icon: 'solar:case-round-bold-duotone' },
            { name: 'start_date', label: 'Date d\'embauche', type: 'date', category: 'date', icon: 'solar:calendar-bold-duotone' },
            { name: 'salary', label: 'Salaire', type: 'number', category: 'numeric', icon: 'solar:dollar-bold-duotone' }
        ],
        classifications: [
            {
                name: 'Statut', slug: 'status', type: 'status', isStatus: true,
                options: [
                    { label: 'Actif', value: 'active', color: '#22c55e', order: 0 },
                    { label: 'En congé', value: 'on_leave', color: '#f59e0b', order: 1 },
                    { label: 'Période d\'essai', value: 'trial', color: '#3b82f6', order: 2 },
                    { label: 'Fin de contrat', value: 'terminated', color: '#ef4444', order: 3 }
                ]
            },
            {
                name: 'Type de contrat', slug: 'contract_type', type: 'category',
                options: [
                    { label: 'CDI', value: 'cdi', color: '#22c55e' },
                    { label: 'CDD', value: 'cdd', color: '#3b82f6' },
                    { label: 'Stage', value: 'internship', color: '#f59e0b' },
                    { label: 'Freelance', value: 'freelance', color: '#8b5cf6' }
                ]
            }
        ],
        featured: true, active: true, order: 0
    },
    {
        name: 'Congés',
        slug: 'tpl-leave-requests',
        description: 'Demandes de congés',
        icon: 'solar:calendar-search-bold-duotone',
        color: '#06b6d4',
        category: 'hr',
        tags: ['leave', 'vacation', 'hr'],
        enabledStandardFields: ['title'],
        fields: [
            { name: 'start_date', label: 'Date de début', type: 'date', category: 'date', icon: 'solar:calendar-bold-duotone', required: true },
            { name: 'end_date', label: 'Date de fin', type: 'date', category: 'date', icon: 'solar:calendar-bold-duotone', required: true },
            { name: 'days_count', label: 'Nombre de jours', type: 'number', category: 'numeric', icon: 'solar:hashtag-bold-duotone' },
            { name: 'reason', label: 'Motif', type: 'text', category: 'text', icon: 'solar:document-text-bold-duotone' }
        ],
        classifications: [
            {
                name: 'Statut', slug: 'status', type: 'status', isStatus: true,
                options: [
                    { label: 'En attente', value: 'pending', color: '#f59e0b', order: 0 },
                    { label: 'Approuvé', value: 'approved', color: '#22c55e', order: 1 },
                    { label: 'Refusé', value: 'refused', color: '#ef4444', order: 2 }
                ]
            },
            {
                name: 'Type de congé', slug: 'leave_type', type: 'category',
                options: [
                    { label: 'Congé payé', value: 'paid', color: '#22c55e' },
                    { label: 'Maladie', value: 'sick', color: '#ef4444' },
                    { label: 'Sans solde', value: 'unpaid', color: '#6b7280' },
                    { label: 'Exceptionnel', value: 'special', color: '#8b5cf6' }
                ]
            }
        ],
        featured: false, active: true, order: 1
    },
    // ─── MÉDICAL ───
    {
        name: 'Patients',
        slug: 'tpl-patients',
        description: 'Dossiers patients',
        icon: 'solar:user-heart-bold-duotone',
        color: '#2196f3',
        category: 'medical',
        tags: ['patients', 'medical', 'health'],
        enabledStandardFields: ['title'],
        fields: [
            { name: 'birth_date', label: 'Date de naissance', type: 'date', category: 'date', icon: 'solar:calendar-bold-duotone', required: true },
            { name: 'phone', label: 'Téléphone', type: 'string', subtype: 'tel', category: 'text', icon: 'solar:phone-bold-duotone' },
            { name: 'email', label: 'Email', type: 'string', subtype: 'email', category: 'text', icon: 'solar:letter-bold-duotone' },
            { name: 'address', label: 'Adresse', type: 'string', category: 'text', icon: 'solar:map-point-bold-duotone' },
            { name: 'blood_type', label: 'Groupe sanguin', type: 'string', category: 'text', icon: 'solar:heart-pulse-bold-duotone' },
            { name: 'allergies', label: 'Allergies', type: 'text', category: 'text', icon: 'solar:danger-bold-duotone' },
            { name: 'medical_notes', label: 'Notes médicales', type: 'text', category: 'text', icon: 'solar:notes-bold-duotone' }
        ],
        classifications: [
            {
                name: 'Statut', slug: 'status', type: 'status', isStatus: true,
                options: [
                    { label: 'Actif', value: 'active', color: '#22c55e', order: 0 },
                    { label: 'En traitement', value: 'in_treatment', color: '#3b82f6', order: 1 },
                    { label: 'Archivé', value: 'archived', color: '#6b7280', order: 2 }
                ]
            }
        ],
        featured: true, active: true, order: 0
    },
    {
        name: 'Consultations',
        slug: 'tpl-consultations',
        description: 'Rendez-vous et consultations médicales',
        icon: 'solar:stethoscope-bold-duotone',
        color: '#14b8a6',
        category: 'medical',
        tags: ['appointments', 'medical'],
        enabledStandardFields: ['title'],
        fields: [
            { name: 'date', label: 'Date', type: 'date', category: 'date', icon: 'solar:calendar-bold-duotone', required: true },
            { name: 'diagnosis', label: 'Diagnostic', type: 'text', category: 'text', icon: 'solar:clipboard-text-bold-duotone' },
            { name: 'prescription', label: 'Prescription', type: 'text', category: 'text', icon: 'solar:document-medicine-bold-duotone' },
            { name: 'notes', label: 'Notes', type: 'text', category: 'text', icon: 'solar:notes-bold-duotone' }
        ],
        classifications: [
            {
                name: 'Type', slug: 'type', type: 'category',
                options: [
                    { label: 'Consultation', value: 'consultation', color: '#3b82f6' },
                    { label: 'Suivi', value: 'followup', color: '#22c55e' },
                    { label: 'Urgence', value: 'emergency', color: '#ef4444' },
                    { label: 'Contrôle', value: 'checkup', color: '#f59e0b' }
                ]
            }
        ],
        featured: false, active: true, order: 1
    },
    // ─── LOGISTIQUE ───
    {
        name: 'Produits',
        slug: 'tpl-products',
        description: 'Catalogue de produits',
        icon: 'solar:box-bold-duotone',
        color: '#f97316',
        category: 'logistics',
        tags: ['products', 'inventory'],
        enabledStandardFields: ['title'],
        fields: [
            { name: 'sku', label: 'Référence (SKU)', type: 'string', category: 'text', icon: 'solar:hashtag-bold-duotone', required: true },
            { name: 'price', label: 'Prix unitaire', type: 'number', category: 'numeric', icon: 'solar:dollar-bold-duotone' },
            { name: 'stock', label: 'Stock', type: 'number', category: 'numeric', icon: 'solar:box-minimalistic-bold-duotone' },
            { name: 'description', label: 'Description', type: 'text', category: 'text', icon: 'solar:document-text-bold-duotone' },
            { name: 'weight', label: 'Poids (kg)', type: 'number', category: 'numeric', icon: 'solar:health-bold-duotone' }
        ],
        classifications: [
            {
                name: 'Statut', slug: 'status', type: 'status', isStatus: true,
                options: [
                    { label: 'Disponible', value: 'available', color: '#22c55e', order: 0 },
                    { label: 'Stock faible', value: 'low_stock', color: '#f59e0b', order: 1 },
                    { label: 'Rupture', value: 'out_of_stock', color: '#ef4444', order: 2 },
                    { label: 'Discontinué', value: 'discontinued', color: '#6b7280', order: 3 }
                ]
            }
        ],
        featured: true, active: true, order: 0
    },
    {
        name: 'Commandes',
        slug: 'tpl-orders',
        description: 'Suivi des commandes',
        icon: 'solar:cart-large-2-bold-duotone',
        color: '#3b82f6',
        category: 'logistics',
        tags: ['orders', 'logistics'],
        enabledStandardFields: ['title'],
        fields: [
            { name: 'order_number', label: 'N° Commande', type: 'string', category: 'text', icon: 'solar:hashtag-bold-duotone', required: true },
            { name: 'client', label: 'Client', type: 'string', category: 'text', icon: 'solar:user-bold-duotone' },
            { name: 'total', label: 'Total', type: 'number', category: 'numeric', icon: 'solar:dollar-bold-duotone' },
            { name: 'order_date', label: 'Date de commande', type: 'date', category: 'date', icon: 'solar:calendar-bold-duotone' },
            { name: 'delivery_date', label: 'Date de livraison', type: 'date', category: 'date', icon: 'solar:box-bold-duotone' },
            { name: 'shipping_address', label: 'Adresse de livraison', type: 'string', category: 'text', icon: 'solar:map-point-bold-duotone' }
        ],
        classifications: [
            {
                name: 'Statut', slug: 'status', type: 'status', isStatus: true,
                options: [
                    { label: 'Reçue', value: 'received', color: '#94a3b8', order: 0 },
                    { label: 'En préparation', value: 'preparing', color: '#3b82f6', order: 1 },
                    { label: 'Expédiée', value: 'shipped', color: '#f59e0b', order: 2 },
                    { label: 'Livrée', value: 'delivered', color: '#22c55e', order: 3 },
                    { label: 'Retournée', value: 'returned', color: '#ef4444', order: 4 }
                ]
            }
        ],
        featured: false, active: true, order: 1
    }
];

// ══════════════════════════════════════════════
// SPACE TEMPLATES
// ══════════════════════════════════════════════
const spaceTemplates = [
    {
        name: 'CRM',
        slug: 'tpl-space-crm',
        description: 'Gestion de la relation client : contacts, opportunités et pipeline commercial',
        icon: 'solar:users-group-rounded-bold-duotone',
        color: '#00ab55',
        category: 'crm',
        tags: ['crm', 'sales', 'contacts'],
        entities: [
            { templateSlug: 'tpl-contacts', isMain: true, order: 0 },
            { templateSlug: 'tpl-opportunities', order: 1 }
        ],
        defaultViews: [
            { entitySlug: 'tpl-contacts', viewType: 'table' },
            { entitySlug: 'tpl-opportunities', viewType: 'kanban' }
        ],
        featured: true, active: true, order: 0
    },
    {
        name: 'Comptabilité',
        slug: 'tpl-space-accounting',
        description: 'Suivi des factures, devis et dépenses de votre entreprise',
        icon: 'solar:wallet-bold-duotone',
        color: '#e2a03f',
        category: 'finance',
        tags: ['accounting', 'finance', 'invoices'],
        entities: [
            { templateSlug: 'tpl-invoices', isMain: true, order: 0 },
            { templateSlug: 'tpl-expenses', order: 1 }
        ],
        defaultViews: [
            { entitySlug: 'tpl-invoices', viewType: 'table' },
            { entitySlug: 'tpl-expenses', viewType: 'table' }
        ],
        featured: true, active: true, order: 1
    },
    {
        name: 'Gestion de Projet',
        slug: 'tpl-space-project',
        description: 'Planification et suivi de vos projets avec tâches, jalons et tableaux kanban',
        icon: 'solar:checklist-bold-duotone',
        color: '#e7515a',
        category: 'project',
        tags: ['project', 'tasks', 'management'],
        entities: [
            { templateSlug: 'tpl-tasks', isMain: true, order: 0 },
            { templateSlug: 'tpl-milestones', order: 1 }
        ],
        defaultViews: [
            { entitySlug: 'tpl-tasks', viewType: 'kanban' },
            { entitySlug: 'tpl-milestones', viewType: 'table' }
        ],
        featured: true, active: true, order: 2
    },
    {
        name: 'Ressources Humaines',
        slug: 'tpl-space-hr',
        description: 'Gestion du personnel, des contrats et des demandes de congés',
        icon: 'solar:user-id-bold-duotone',
        color: '#805dca',
        category: 'hr',
        tags: ['hr', 'employees', 'leave'],
        entities: [
            { templateSlug: 'tpl-employees', isMain: true, order: 0 },
            { templateSlug: 'tpl-leave-requests', order: 1 }
        ],
        defaultViews: [
            { entitySlug: 'tpl-employees', viewType: 'table' },
            { entitySlug: 'tpl-leave-requests', viewType: 'kanban' }
        ],
        featured: true, active: true, order: 3
    },
    {
        name: 'Cabinet Médical',
        slug: 'tpl-space-medical',
        description: 'Suivi des patients et gestion des consultations médicales',
        icon: 'solar:health-bold-duotone',
        color: '#2196f3',
        category: 'medical',
        tags: ['medical', 'patients', 'health'],
        entities: [
            { templateSlug: 'tpl-patients', isMain: true, order: 0 },
            { templateSlug: 'tpl-consultations', order: 1 }
        ],
        defaultViews: [
            { entitySlug: 'tpl-patients', viewType: 'table' },
            { entitySlug: 'tpl-consultations', viewType: 'table' }
        ],
        featured: true, active: true, order: 4
    },
    {
        name: 'Logistique & Stock',
        slug: 'tpl-space-logistics',
        description: 'Gestion des produits, du stock et des commandes',
        icon: 'solar:box-minimalistic-bold-duotone',
        color: '#f97316',
        category: 'logistics',
        tags: ['logistics', 'inventory', 'orders'],
        entities: [
            { templateSlug: 'tpl-products', isMain: true, order: 0 },
            { templateSlug: 'tpl-orders', order: 1 }
        ],
        defaultViews: [
            { entitySlug: 'tpl-products', viewType: 'table' },
            { entitySlug: 'tpl-orders', viewType: 'kanban' }
        ],
        featured: true, active: true, order: 5
    }
];

// Merge base + extra demo records
const baseRecords = require('./data/demo-records');
const extraRecords = require('./data/demo-records-extra');
const demoRecords = {};
for (const slug of new Set([...Object.keys(baseRecords), ...Object.keys(extraRecords)])) {
    demoRecords[slug] = [...(baseRecords[slug] || []), ...(extraRecords[slug] || [])];
}

// ══════════════════════════════════════════════
// MAIN SEED FUNCTION
// ══════════════════════════════════════════════
async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✓ Connected to', MONGO_URI);

        // Seed entity templates (upsert by slug) — inject demo records
        console.log('\n── Entity Templates ──');
        for (const et of entityTemplates) {
            // Attach demo records if available
            if (demoRecords[et.slug]) {
                et.demoRecords = demoRecords[et.slug];
            }
            const existing = await EntityTemplate.findOne({ slug: et.slug });
            if (existing) {
                await EntityTemplate.findByIdAndUpdate(existing._id, et);
                console.log(`  ↻ Updated: ${et.name} (${et.slug}) — ${(et.demoRecords || []).length} demo records`);
            } else {
                await new EntityTemplate(et).save();
                console.log(`  ✓ Created: ${et.name} (${et.slug}) — ${(et.demoRecords || []).length} demo records`);
            }
        }

        // Seed space templates (upsert by slug)
        console.log('\n── Space Templates ──');
        for (const st of spaceTemplates) {
            const existing = await SpaceTemplate.findOne({ slug: st.slug });
            if (existing) {
                await SpaceTemplate.findByIdAndUpdate(existing._id, st);
                console.log(`  ↻ Updated: ${st.name} (${st.slug})`);
            } else {
                await new SpaceTemplate(st).save();
                console.log(`  ✓ Created: ${st.name} (${st.slug})`);
            }
        }

        console.log('\n✓ Seeding complete!');
        console.log(`  → ${entityTemplates.length} entity templates`);
        console.log(`  → ${spaceTemplates.length} space templates`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('✗ Seeding error:', err);
        await mongoose.disconnect();
        process.exit(1);
    }
}

seed();
