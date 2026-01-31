/**
 * Seed Field Templates (Bibliothèque de champs)
 * 
 * Ce script peuple la collection FieldTemplate avec des champs métier prêts à l'emploi.
 * Contrairement aux FieldType (types techniques), ce sont des presets business
 * que les utilisateurs peuvent directement ajouter à leurs collections.
 * 
 * Usage: node scripts/seed-field-templates.js [account_number]
 * Exemple: node scripts/seed-field-templates.js 5001
 */

const mongoose = require('mongoose');

// Récupérer l'account_number depuis les arguments
const accountNumber = process.argv[2] || '5001';
const tenantDbUri = `mongodb://127.0.0.1:27017/saas_app_rb_${accountNumber}`;

// Schéma simplifié pour le seed
const fieldTemplateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, required: true },
    subType: String,
    icon: String,
    width: { type: String, default: 'full' },
    category: { type: String, default: 'custom' },
    placeholder: String,
    description: String,
    required: { type: Boolean, default: false },
    unique: { type: Boolean, default: false },
    isSystem: { type: Boolean, default: true },
    multiple: Boolean,
    options: [{
        label: String,
        value: String,
        color: String
    }],
    config: mongoose.Schema.Types.Mixed
}, { timestamps: true });

// ═══════════════════════════════════════════════════════════════════════════════
// CHAMPS MÉTIER PAR CATÉGORIE
// ═══════════════════════════════════════════════════════════════════════════════

const fieldTemplates = [
    // ═══════════════════════════════════════════════════════════════════════════
    // 📧 IDENTITÉ & CONTACT (popular)
    // ═══════════════════════════════════════════════════════════════════════════
    {
        name: 'nom',
        label: 'Nom',
        type: 'string',
        icon: 'solar:user-bold-duotone',
        width: 'half',
        category: 'popular',
        placeholder: 'Dupont',
        description: 'Nom de famille'
    },
    {
        name: 'prenom',
        label: 'Prénom',
        type: 'string',
        icon: 'solar:user-bold-duotone',
        width: 'half',
        category: 'popular',
        placeholder: 'Jean',
        description: 'Prénom'
    },
    {
        name: 'nom_complet',
        label: 'Nom complet',
        type: 'string',
        icon: 'solar:user-id-bold-duotone',
        width: 'full',
        category: 'popular',
        placeholder: 'Jean Dupont',
        description: 'Nom et prénom'
    },
    {
        name: 'email',
        label: 'Email',
        type: 'string',
        subType: 'email',
        icon: 'solar:letter-bold-duotone',
        width: 'half',
        category: 'popular',
        placeholder: 'jean.dupont@exemple.com',
        description: 'Adresse email'
    },
    {
        name: 'telephone',
        label: 'Téléphone',
        type: 'string',
        subType: 'tel',
        icon: 'solar:phone-bold-duotone',
        width: 'half',
        category: 'popular',
        placeholder: '+33 6 12 34 56 78',
        description: 'Numéro de téléphone'
    },
    {
        name: 'mobile',
        label: 'Mobile',
        type: 'string',
        subType: 'tel',
        icon: 'solar:smartphone-bold-duotone',
        width: 'half',
        category: 'popular',
        placeholder: '+33 6 98 76 54 32',
        description: 'Numéro de portable'
    },
    {
        name: 'adresse',
        label: 'Adresse',
        type: 'text',
        icon: 'solar:map-point-bold-duotone',
        width: 'full',
        category: 'popular',
        placeholder: '123 Rue de la Paix',
        description: 'Adresse postale complète'
    },
    {
        name: 'ville',
        label: 'Ville',
        type: 'string',
        icon: 'solar:city-bold-duotone',
        width: 'half',
        category: 'popular',
        placeholder: 'Paris'
    },
    {
        name: 'code_postal',
        label: 'Code postal',
        type: 'string',
        icon: 'solar:mailbox-bold-duotone',
        width: 'half',
        category: 'popular',
        placeholder: '75001'
    },
    {
        name: 'pays',
        label: 'Pays',
        type: 'string',
        icon: 'solar:global-bold-duotone',
        width: 'half',
        category: 'popular',
        placeholder: 'France'
    },
    {
        name: 'genre',
        label: 'Genre',
        type: 'select',
        icon: 'solar:users-group-rounded-bold-duotone',
        width: 'half',
        category: 'popular',
        options: [
            { label: 'Homme', value: 'homme', color: '#3b82f6' },
            { label: 'Femme', value: 'femme', color: '#ec4899' },
            { label: 'Autre', value: 'autre', color: '#8b5cf6' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 🏢 ENTREPRISE & PROFESSIONNEL (pro)
    // ═══════════════════════════════════════════════════════════════════════════
    {
        name: 'entreprise',
        label: 'Entreprise',
        type: 'string',
        icon: 'solar:buildings-bold-duotone',
        width: 'half',
        category: 'pro',
        placeholder: 'Acme Inc.',
        description: 'Nom de l\'entreprise'
    },
    {
        name: 'raison_sociale',
        label: 'Raison sociale',
        type: 'string',
        icon: 'solar:buildings-2-bold-duotone',
        width: 'full',
        category: 'pro',
        placeholder: 'SARL Acme Inc.'
    },
    {
        name: 'poste',
        label: 'Poste / Fonction',
        type: 'string',
        icon: 'solar:case-bold-duotone',
        width: 'half',
        category: 'pro',
        placeholder: 'Directeur Commercial'
    },
    {
        name: 'departement',
        label: 'Département / Service',
        type: 'string',
        icon: 'solar:widget-5-bold-duotone',
        width: 'half',
        category: 'pro',
        placeholder: 'Marketing'
    },
    {
        name: 'site_web',
        label: 'Site web',
        type: 'string',
        subType: 'url',
        icon: 'solar:global-bold-duotone',
        width: 'half',
        category: 'pro',
        placeholder: 'https://www.exemple.com'
    },
    {
        name: 'linkedin',
        label: 'LinkedIn',
        type: 'string',
        subType: 'url',
        icon: 'mdi:linkedin',
        width: 'half',
        category: 'pro',
        placeholder: 'https://linkedin.com/in/...'
    },
    {
        name: 'twitter',
        label: 'Twitter / X',
        type: 'string',
        subType: 'url',
        icon: 'mdi:twitter',
        width: 'half',
        category: 'pro',
        placeholder: '@username'
    },
    {
        name: 'siret',
        label: 'SIRET',
        type: 'string',
        icon: 'solar:document-bold-duotone',
        width: 'half',
        category: 'pro',
        placeholder: '123 456 789 00012'
    },
    {
        name: 'siren',
        label: 'SIREN',
        type: 'string',
        icon: 'solar:document-bold-duotone',
        width: 'half',
        category: 'pro',
        placeholder: '123 456 789'
    },
    {
        name: 'tva_intra',
        label: 'N° TVA Intracommunautaire',
        type: 'string',
        icon: 'solar:document-bold-duotone',
        width: 'half',
        category: 'pro',
        placeholder: 'FR12345678901'
    },
    {
        name: 'capital',
        label: 'Capital social',
        type: 'number',
        subType: 'currency',
        icon: 'solar:wallet-bold-duotone',
        width: 'half',
        category: 'pro',
        placeholder: '10 000 €'
    },
    {
        name: 'effectif',
        label: 'Effectif',
        type: 'number',
        icon: 'solar:users-group-rounded-bold-duotone',
        width: 'half',
        category: 'pro',
        placeholder: '50'
    },
    {
        name: 'secteur_activite',
        label: 'Secteur d\'activité',
        type: 'string',
        icon: 'solar:chart-2-bold-duotone',
        width: 'half',
        category: 'pro',
        placeholder: 'Services B2B'
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 📅 DATES & ÉVÉNEMENTS (dates)
    // ═══════════════════════════════════════════════════════════════════════════
    {
        name: 'date_naissance',
        label: 'Date de naissance',
        type: 'date',
        icon: 'solar:cake-bold-duotone',
        width: 'half',
        category: 'dates'
    },
    {
        name: 'date_creation',
        label: 'Date de création',
        type: 'date',
        icon: 'solar:calendar-add-bold-duotone',
        width: 'half',
        category: 'dates'
    },
    {
        name: 'date_debut',
        label: 'Date de début',
        type: 'date',
        icon: 'solar:calendar-bold-duotone',
        width: 'half',
        category: 'dates'
    },
    {
        name: 'date_fin',
        label: 'Date de fin',
        type: 'date',
        icon: 'solar:calendar-bold-duotone',
        width: 'half',
        category: 'dates'
    },
    {
        name: 'date_signature',
        label: 'Date de signature',
        type: 'date',
        icon: 'solar:pen-new-square-bold-duotone',
        width: 'half',
        category: 'dates'
    },
    {
        name: 'echeance',
        label: 'Échéance',
        type: 'date',
        icon: 'solar:alarm-bold-duotone',
        width: 'half',
        category: 'dates'
    },
    {
        name: 'date_livraison',
        label: 'Date de livraison',
        type: 'date',
        icon: 'solar:delivery-bold-duotone',
        width: 'half',
        category: 'dates'
    },
    {
        name: 'date_paiement',
        label: 'Date de paiement',
        type: 'date',
        icon: 'solar:wallet-bold-duotone',
        width: 'half',
        category: 'dates'
    },
    {
        name: 'rappel',
        label: 'Rappel',
        type: 'date',
        subType: 'datetime',
        icon: 'solar:bell-bold-duotone',
        width: 'half',
        category: 'dates',
        description: 'Date et heure de rappel'
    },
    {
        name: 'dernier_contact',
        label: 'Dernier contact',
        type: 'date',
        subType: 'datetime',
        icon: 'solar:chat-round-dots-bold-duotone',
        width: 'half',
        category: 'dates'
    },
    {
        name: 'prochain_rdv',
        label: 'Prochain RDV',
        type: 'date',
        subType: 'datetime',
        icon: 'solar:calendar-mark-bold-duotone',
        width: 'half',
        category: 'dates'
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 💰 FINANCE & COMMERCE (finance)
    // ═══════════════════════════════════════════════════════════════════════════
    {
        name: 'montant',
        label: 'Montant',
        type: 'number',
        subType: 'currency',
        icon: 'solar:dollar-bold-duotone',
        width: 'half',
        category: 'finance',
        placeholder: '1 500,00 €'
    },
    {
        name: 'prix_unitaire',
        label: 'Prix unitaire HT',
        type: 'number',
        subType: 'currency',
        icon: 'solar:tag-price-bold-duotone',
        width: 'half',
        category: 'finance'
    },
    {
        name: 'prix_ttc',
        label: 'Prix TTC',
        type: 'number',
        subType: 'currency',
        icon: 'solar:tag-price-bold-duotone',
        width: 'half',
        category: 'finance'
    },
    {
        name: 'quantite',
        label: 'Quantité',
        type: 'number',
        icon: 'solar:box-bold-duotone',
        width: 'half',
        category: 'finance',
        placeholder: '10'
    },
    {
        name: 'remise_pourcent',
        label: 'Remise (%)',
        type: 'number',
        subType: 'percent',
        icon: 'solar:tag-bold-duotone',
        width: 'half',
        category: 'finance'
    },
    {
        name: 'remise_montant',
        label: 'Remise (€)',
        type: 'number',
        subType: 'currency',
        icon: 'solar:tag-bold-duotone',
        width: 'half',
        category: 'finance'
    },
    {
        name: 'tva',
        label: 'TVA (%)',
        type: 'number',
        subType: 'percent',
        icon: 'solar:calculator-bold-duotone',
        width: 'half',
        category: 'finance',
        config: { defaultValue: 20 }
    },
    {
        name: 'total_ht',
        label: 'Total HT',
        type: 'number',
        subType: 'currency',
        icon: 'solar:calculator-bold-duotone',
        width: 'half',
        category: 'finance'
    },
    {
        name: 'total_ttc',
        label: 'Total TTC',
        type: 'number',
        subType: 'currency',
        icon: 'solar:calculator-bold-duotone',
        width: 'half',
        category: 'finance'
    },
    {
        name: 'solde',
        label: 'Solde',
        type: 'number',
        subType: 'currency',
        icon: 'solar:wallet-2-bold-duotone',
        width: 'half',
        category: 'finance'
    },
    {
        name: 'budget',
        label: 'Budget',
        type: 'number',
        subType: 'currency',
        icon: 'solar:chart-bold-duotone',
        width: 'half',
        category: 'finance'
    },
    {
        name: 'marge',
        label: 'Marge (%)',
        type: 'number',
        subType: 'percent',
        icon: 'solar:chart-2-bold-duotone',
        width: 'half',
        category: 'finance'
    },
    {
        name: 'commission',
        label: 'Commission (%)',
        type: 'number',
        subType: 'percent',
        icon: 'solar:hand-money-bold-duotone',
        width: 'half',
        category: 'finance'
    },
    {
        name: 'mode_paiement',
        label: 'Mode de paiement',
        type: 'select',
        icon: 'solar:card-bold-duotone',
        width: 'half',
        category: 'finance',
        options: [
            { label: 'Carte bancaire', value: 'cb', color: '#3b82f6' },
            { label: 'Virement', value: 'virement', color: '#22c55e' },
            { label: 'Chèque', value: 'cheque', color: '#f59e0b' },
            { label: 'Espèces', value: 'especes', color: '#8b5cf6' },
            { label: 'Prélèvement', value: 'prelevement', color: '#06b6d4' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ⚙️ GESTION & WORKFLOW (workflow)
    // ═══════════════════════════════════════════════════════════════════════════
    {
        name: 'statut',
        label: 'Statut',
        type: 'select',
        icon: 'solar:verified-check-bold-duotone',
        width: 'half',
        category: 'workflow',
        options: [
            { label: 'Brouillon', value: 'draft', color: '#94a3b8' },
            { label: 'En cours', value: 'in_progress', color: '#3b82f6' },
            { label: 'En attente', value: 'pending', color: '#f59e0b' },
            { label: 'Terminé', value: 'done', color: '#22c55e' },
            { label: 'Annulé', value: 'cancelled', color: '#ef4444' }
        ]
    },
    {
        name: 'statut_commercial',
        label: 'Statut commercial',
        type: 'select',
        icon: 'solar:chart-bold-duotone',
        width: 'half',
        category: 'workflow',
        options: [
            { label: 'Prospect', value: 'prospect', color: '#94a3b8' },
            { label: 'Lead', value: 'lead', color: '#3b82f6' },
            { label: 'Opportunité', value: 'opportunity', color: '#f59e0b' },
            { label: 'Négociation', value: 'negotiation', color: '#8b5cf6' },
            { label: 'Gagné', value: 'won', color: '#22c55e' },
            { label: 'Perdu', value: 'lost', color: '#ef4444' }
        ]
    },
    {
        name: 'priorite',
        label: 'Priorité',
        type: 'select',
        icon: 'solar:flag-bold-duotone',
        width: 'half',
        category: 'workflow',
        options: [
            { label: 'Basse', value: 'low', color: '#94a3b8' },
            { label: 'Normale', value: 'normal', color: '#3b82f6' },
            { label: 'Haute', value: 'high', color: '#f59e0b' },
            { label: 'Urgente', value: 'urgent', color: '#ef4444' }
        ]
    },
    {
        name: 'type_contact',
        label: 'Type de contact',
        type: 'select',
        icon: 'solar:user-check-bold-duotone',
        width: 'half',
        category: 'workflow',
        options: [
            { label: 'Client', value: 'client', color: '#22c55e' },
            { label: 'Prospect', value: 'prospect', color: '#3b82f6' },
            { label: 'Fournisseur', value: 'fournisseur', color: '#f59e0b' },
            { label: 'Partenaire', value: 'partenaire', color: '#8b5cf6' },
            { label: 'Autre', value: 'autre', color: '#94a3b8' }
        ]
    },
    {
        name: 'source',
        label: 'Source',
        type: 'select',
        icon: 'solar:magnet-bold-duotone',
        width: 'half',
        category: 'workflow',
        options: [
            { label: 'Site web', value: 'website', color: '#3b82f6' },
            { label: 'Recommandation', value: 'referral', color: '#22c55e' },
            { label: 'LinkedIn', value: 'linkedin', color: '#0077b5' },
            { label: 'Salon/Événement', value: 'event', color: '#f59e0b' },
            { label: 'Publicité', value: 'ads', color: '#ef4444' },
            { label: 'Appel entrant', value: 'inbound', color: '#8b5cf6' },
            { label: 'Autre', value: 'other', color: '#94a3b8' }
        ]
    },
    {
        name: 'assignee',
        label: 'Assigné à',
        type: 'relation',
        subType: 'user',
        icon: 'solar:user-check-bold-duotone',
        width: 'half',
        category: 'workflow'
    },
    {
        name: 'responsable',
        label: 'Responsable',
        type: 'relation',
        subType: 'user',
        icon: 'solar:user-bold-duotone',
        width: 'half',
        category: 'workflow'
    },
    {
        name: 'tags',
        label: 'Tags',
        type: 'select',
        subType: 'multi',
        icon: 'solar:tag-bold-duotone',
        width: 'full',
        category: 'workflow',
        multiple: true
    },
    {
        name: 'progression',
        label: 'Progression (%)',
        type: 'number',
        subType: 'percent',
        icon: 'solar:chart-square-bold-duotone',
        width: 'half',
        category: 'workflow'
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 📝 CONTENU & DESCRIPTION (content)
    // ═══════════════════════════════════════════════════════════════════════════
    {
        name: 'titre',
        label: 'Titre',
        type: 'string',
        icon: 'solar:text-bold-duotone',
        width: 'full',
        category: 'content',
        placeholder: 'Titre du document'
    },
    {
        name: 'description',
        label: 'Description',
        type: 'text',
        icon: 'solar:document-text-bold-duotone',
        width: 'full',
        category: 'content',
        placeholder: 'Description détaillée...'
    },
    {
        name: 'notes',
        label: 'Notes',
        type: 'text',
        icon: 'solar:notes-bold-duotone',
        width: 'full',
        category: 'content',
        placeholder: 'Notes internes...'
    },
    {
        name: 'commentaire',
        label: 'Commentaire',
        type: 'text',
        icon: 'solar:chat-round-dots-bold-duotone',
        width: 'full',
        category: 'content'
    },
    {
        name: 'objet',
        label: 'Objet',
        type: 'string',
        icon: 'solar:notes-bold-duotone',
        width: 'full',
        category: 'content',
        placeholder: 'Objet du message ou document'
    },
    {
        name: 'contenu',
        label: 'Contenu',
        type: 'text',
        subType: 'rich',
        icon: 'solar:text-italic-bold-duotone',
        width: 'full',
        category: 'content',
        description: 'Contenu avec mise en forme'
    },
    {
        name: 'conditions',
        label: 'Conditions',
        type: 'text',
        icon: 'solar:document-bold-duotone',
        width: 'full',
        category: 'content',
        placeholder: 'Conditions générales...'
    },
    {
        name: 'clause',
        label: 'Clause particulière',
        type: 'text',
        icon: 'solar:clipboard-text-bold-duotone',
        width: 'full',
        category: 'content'
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 📁 MÉDIAS & FICHIERS (media)
    // ═══════════════════════════════════════════════════════════════════════════
    {
        name: 'photo',
        label: 'Photo',
        type: 'image',
        icon: 'solar:camera-bold-duotone',
        width: 'half',
        category: 'media'
    },
    {
        name: 'avatar',
        label: 'Avatar',
        type: 'image',
        icon: 'solar:user-circle-bold-duotone',
        width: 'half',
        category: 'media'
    },
    {
        name: 'logo',
        label: 'Logo',
        type: 'image',
        icon: 'solar:gallery-bold-duotone',
        width: 'half',
        category: 'media'
    },
    {
        name: 'couverture',
        label: 'Image de couverture',
        type: 'image',
        icon: 'solar:gallery-wide-bold-duotone',
        width: 'full',
        category: 'media'
    },
    {
        name: 'document',
        label: 'Document',
        type: 'file',
        icon: 'solar:file-bold-duotone',
        width: 'full',
        category: 'media'
    },
    {
        name: 'devis',
        label: 'Devis (PDF)',
        type: 'file',
        icon: 'solar:document-bold-duotone',
        width: 'half',
        category: 'media',
        config: { accept: '.pdf' }
    },
    {
        name: 'facture',
        label: 'Facture (PDF)',
        type: 'file',
        icon: 'solar:bill-bold-duotone',
        width: 'half',
        category: 'media',
        config: { accept: '.pdf' }
    },
    {
        name: 'bon_commande',
        label: 'Bon de commande',
        type: 'file',
        icon: 'solar:clipboard-list-bold-duotone',
        width: 'half',
        category: 'media'
    },
    {
        name: 'contrat',
        label: 'Contrat',
        type: 'file',
        icon: 'solar:document-text-bold-duotone',
        width: 'half',
        category: 'media'
    },
    {
        name: 'pieces_jointes',
        label: 'Pièces jointes',
        type: 'file',
        icon: 'solar:paperclip-bold-duotone',
        width: 'full',
        category: 'media',
        multiple: true
    },
    {
        name: 'signature',
        label: 'Signature',
        type: 'image',
        subType: 'signature',
        icon: 'solar:pen-bold-duotone',
        width: 'half',
        category: 'media'
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 🔢 RÉFÉRENCES & CODES (other)
    // ═══════════════════════════════════════════════════════════════════════════
    {
        name: 'reference',
        label: 'Référence',
        type: 'string',
        icon: 'solar:hashtag-bold-duotone',
        width: 'half',
        category: 'other',
        placeholder: 'REF-2024-001'
    },
    {
        name: 'numero_facture',
        label: 'N° Facture',
        type: 'string',
        icon: 'solar:bill-bold-duotone',
        width: 'half',
        category: 'other',
        placeholder: 'FAC-2024-001'
    },
    {
        name: 'numero_devis',
        label: 'N° Devis',
        type: 'string',
        icon: 'solar:document-bold-duotone',
        width: 'half',
        category: 'other',
        placeholder: 'DEV-2024-001'
    },
    {
        name: 'numero_commande',
        label: 'N° Commande',
        type: 'string',
        icon: 'solar:cart-bold-duotone',
        width: 'half',
        category: 'other',
        placeholder: 'CMD-2024-001'
    },
    {
        name: 'code_client',
        label: 'Code client',
        type: 'string',
        icon: 'solar:user-id-bold-duotone',
        width: 'half',
        category: 'other',
        placeholder: 'CLI-001'
    },
    {
        name: 'code_produit',
        label: 'Code produit',
        type: 'string',
        icon: 'solar:box-bold-duotone',
        width: 'half',
        category: 'other',
        placeholder: 'PRD-001'
    },
    {
        name: 'code_barre',
        label: 'Code-barres / EAN',
        type: 'string',
        icon: 'solar:qr-code-bold-duotone',
        width: 'half',
        category: 'other',
        placeholder: '3760123456789'
    },
    {
        name: 'sku',
        label: 'SKU',
        type: 'string',
        icon: 'solar:barcode-bold-duotone',
        width: 'half',
        category: 'other',
        placeholder: 'SKU-001-BLK-M'
    },
    {
        name: 'actif',
        label: 'Actif',
        type: 'boolean',
        icon: 'solar:check-circle-bold-duotone',
        width: 'half',
        category: 'other',
        description: 'Élément actif ou archivé'
    },
    {
        name: 'publie',
        label: 'Publié',
        type: 'boolean',
        icon: 'solar:eye-bold-duotone',
        width: 'half',
        category: 'other'
    },
    {
        name: 'note_evaluation',
        label: 'Note / Évaluation',
        type: 'number',
        subType: 'rating',
        icon: 'solar:star-bold-duotone',
        width: 'half',
        category: 'other'
    },
    {
        name: 'ordre',
        label: 'Ordre d\'affichage',
        type: 'number',
        icon: 'solar:sort-bold-duotone',
        width: 'half',
        category: 'other'
    }
];

// ═══════════════════════════════════════════════════════════════════════════════
// EXÉCUTION DU SEED
// ═══════════════════════════════════════════════════════════════════════════════

async function seedFieldTemplates() {
    try {
        console.log(`📦 Connecting to tenant DB: ${tenantDbUri}`);
        await mongoose.connect(tenantDbUri);
        console.log(`✅ Connected to MongoDB (Tenant: ${accountNumber})`);

        // Créer ou récupérer le modèle
        const FieldTemplate = mongoose.models.FieldTemplate || mongoose.model('FieldTemplate', fieldTemplateSchema);

        // Supprimer les templates existants (optionnel - décommenter pour reset complet)
        // await FieldTemplate.deleteMany({});
        // console.log('🗑️  Existing field templates deleted');

        // Ajouter isSystem: true à tous les templates
        const templatesWithSystem = fieldTemplates.map(ft => ({
            ...ft,
            isSystem: true
        }));

        // Insérer avec upsert (met à jour si existe, crée sinon)
        let created = 0;
        let updated = 0;

        for (const template of templatesWithSystem) {
            const result = await FieldTemplate.findOneAndUpdate(
                { name: template.name },
                template,
                { upsert: true, new: true }
            );
            if (result.createdAt.getTime() === result.updatedAt.getTime()) {
                created++;
            } else {
                updated++;
            }
        }

        console.log(`\n✨ Seed completed!`);
        console.log(`   📊 Total: ${templatesWithSystem.length} field templates`);
        console.log(`   ✅ Created: ${created}`);
        console.log(`   🔄 Updated: ${updated}`);

        // Afficher le résumé par catégorie
        const categories = {};
        templatesWithSystem.forEach(ft => {
            categories[ft.category] = (categories[ft.category] || 0) + 1;
        });
        console.log(`\n📁 Par catégorie:`);
        Object.entries(categories).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
            console.log(`   - ${cat}: ${count} champs`);
        });

    } catch (error) {
        console.error('❌ Error seeding field templates:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// Exécuter le seed
seedFieldTemplates();
