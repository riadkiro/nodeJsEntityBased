#!/usr/bin/env node
/**
 * seed-system-fields.js
 * 
 * Seeds the GLOBAL SaaS database with:
 * 1. System Field Templates (categorized, enriched)
 * 2. System Entity Templates (Documents, Tasks, Projects, etc.)
 * 3. System Classifications
 * 
 * Usage: node scripts/seed-system-fields.js
 * 
 * These are seeded in the global DB (saasDemo) so they are available
 * to all tenants when creating new entities.
 */
const mongoose = require('mongoose');
const GLOBAL_DB = 'mongodb://127.0.0.1:27017/saasDemo';

// ═══════════════════════════════════════════════════════════
// SYSTEM FIELD TEMPLATES — Organized by category
// ═══════════════════════════════════════════════════════════

const systemFields = [
    // ── 👤 POPULAR (Identity / Contact) ──
    { name: 'nom', label: 'Nom', category: 'popular', type: 'string', render: { input: 'text', display: { table: 'text' } }, required: true, ui: { width: 'half', icon: 'solar:user-bold', placeholder: 'Nom de famille' } },
    { name: 'prenom', label: 'Prénom', category: 'popular', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'half', icon: 'solar:user-bold', placeholder: 'Prénom' } },
    { name: 'nom_complet', label: 'Nom complet', category: 'popular', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'full', icon: 'solar:user-bold' } },
    { name: 'email', label: 'Email', category: 'popular', type: 'string', subtype: 'email', render: { input: 'email', display: { table: 'link' } }, ui: { width: 'half', icon: 'solar:letter-bold', placeholder: 'email@exemple.com' } },
    { name: 'telephone', label: 'Téléphone', category: 'popular', type: 'string', subtype: 'tel', render: { input: 'tel', display: { table: 'text' } }, ui: { width: 'half', icon: 'solar:phone-bold', placeholder: '+33 6 00 00 00 00' } },
    { name: 'mobile', label: 'Mobile', category: 'popular', type: 'string', subtype: 'tel', render: { input: 'tel', display: { table: 'text' } }, ui: { width: 'half', icon: 'solar:smartphone-bold' } },
    { name: 'adresse', label: 'Adresse', category: 'popular', type: 'string', render: { input: 'textarea', display: { table: 'text' } }, ui: { width: 'full', icon: 'solar:map-point-bold' } },
    { name: 'code_postal', label: 'Code postal', category: 'popular', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'third', icon: 'solar:map-bold' } },
    { name: 'ville', label: 'Ville', category: 'popular', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'third', icon: 'solar:city-bold' } },
    { name: 'pays', label: 'Pays', category: 'popular', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'third', icon: 'solar:globe-bold' } },
    { name: 'genre', label: 'Genre', category: 'popular', type: 'select', type_config: { options: ['Homme', 'Femme', 'Autre'] }, render: { input: 'select', display: { table: 'badge' } }, ui: { width: 'half' } },

    // ── 📝 CONTENT (Text blocks) ──
    { name: 'titre', label: 'Titre', category: 'content', type: 'string', render: { input: 'text', display: { table: 'text' } }, required: true, ui: { width: 'full', icon: 'solar:text-bold', placeholder: 'Titre...' } },
    { name: 'description', label: 'Description', category: 'content', type: 'string', render: { input: 'textarea', display: { table: 'text' } }, ui: { width: 'full', icon: 'solar:document-text-bold' } },
    { name: 'contenu', label: 'Contenu', category: 'content', type: 'string', render: { input: 'richtext', display: { table: 'text' } }, ui: { width: 'full' } },
    { name: 'notes', label: 'Notes', category: 'content', type: 'string', render: { input: 'textarea', display: { table: 'text' } }, ui: { width: 'full', icon: 'solar:notes-bold' } },
    { name: 'commentaire', label: 'Commentaire', category: 'content', type: 'string', render: { input: 'textarea', display: { table: 'text' } }, ui: { width: 'full' } },
    { name: 'objet', label: 'Objet', category: 'content', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'full', placeholder: 'Objet du message...' } },
    { name: 'conditions', label: 'Conditions', category: 'content', type: 'string', render: { input: 'textarea', display: { table: 'text' } }, ui: { width: 'full' } },
    { name: 'clause', label: 'Clause particulière', category: 'content', type: 'string', render: { input: 'textarea', display: { table: 'text' } }, ui: { width: 'full' } },

    // ── 📅 DATES ──
    { name: 'date_debut', label: 'Date de début', category: 'dates', type: 'date', render: { input: 'date', display: { table: 'text' } }, ui: { width: 'half', icon: 'solar:calendar-bold' } },
    { name: 'date_fin', label: 'Date de fin', category: 'dates', type: 'date', render: { input: 'date', display: { table: 'text' } }, ui: { width: 'half', icon: 'solar:calendar-bold' } },
    { name: 'date_creation', label: 'Date de création', category: 'dates', type: 'date', render: { input: 'date', display: { table: 'text' } }, ui: { width: 'half', icon: 'solar:calendar-add-bold' } },
    { name: 'date_naissance', label: 'Date de naissance', category: 'dates', type: 'date', render: { input: 'date', display: { table: 'text' } }, ui: { width: 'half', icon: 'solar:calendar-bold' } },
    { name: 'date_signature', label: 'Date de signature', category: 'dates', type: 'date', render: { input: 'date', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'date_paiement', label: 'Date de paiement', category: 'dates', type: 'date', render: { input: 'date', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'date_livraison', label: 'Date de livraison', category: 'dates', type: 'date', render: { input: 'date', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'echeance', label: 'Échéance', category: 'dates', type: 'date', render: { input: 'datetime-local', display: { table: 'text' } }, ui: { width: 'half', icon: 'solar:alarm-bold' } },
    { name: 'due_at', label: 'Échéance', category: 'dates', type: 'date', render: { input: 'datetime-local', display: { table: 'text' } }, ui: { width: 'half', icon: 'solar:alarm-bold' } },
    { name: 'rdv_at', label: 'Date & Heure RDV', category: 'dates', type: 'date', render: { input: 'datetime-local', display: { table: 'text' } }, ui: { width: 'half', icon: 'solar:clock-circle-bold' } },
    { name: 'dernier_contact', label: 'Dernier contact', category: 'dates', type: 'date', render: { input: 'date', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'prochain_rdv', label: 'Prochain RDV', category: 'dates', type: 'date', render: { input: 'datetime-local', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'rappel', label: 'Rappel', category: 'dates', type: 'date', render: { input: 'datetime-local', display: { table: 'text' } }, ui: { width: 'half', icon: 'solar:bell-bold' } },
    { name: 'date_creation_dossier', label: 'Date Création', category: 'dates', type: 'date', render: { input: 'date', display: { table: 'text' } }, ui: { width: 'half' } },

    // ── 💰 FINANCE ──
    { name: 'montant', label: 'Montant', category: 'finance', type: 'number', render: { input: 'number', display: { table: 'currency' } }, ui: { width: 'half', icon: 'solar:wallet-bold' } },
    { name: 'prix_unitaire', label: 'Prix unitaire HT', category: 'finance', type: 'number', render: { input: 'number', display: { table: 'currency' } }, ui: { width: 'half' } },
    { name: 'prix_ttc', label: 'Prix TTC', category: 'finance', type: 'number', render: { input: 'number', display: { table: 'currency' } }, ui: { width: 'half' } },
    { name: 'total_ht', label: 'Total HT', category: 'finance', type: 'number', render: { input: 'number', display: { table: 'currency' } }, ui: { width: 'half' } },
    { name: 'total_ttc', label: 'Total TTC', category: 'finance', type: 'number', render: { input: 'number', display: { table: 'currency' } }, ui: { width: 'half' } },
    { name: 'tva', label: 'TVA (%)', category: 'finance', type: 'number', render: { input: 'number', display: { table: 'text' } }, ui: { width: 'third' } },
    { name: 'quantite', label: 'Quantité', category: 'finance', type: 'number', render: { input: 'number', display: { table: 'text' } }, ui: { width: 'third' } },
    { name: 'remise_pourcent', label: 'Remise (%)', category: 'finance', type: 'number', render: { input: 'number', display: { table: 'text' } }, ui: { width: 'third' } },
    { name: 'remise_montant', label: 'Remise (€)', category: 'finance', type: 'number', render: { input: 'number', display: { table: 'currency' } }, ui: { width: 'third' } },
    { name: 'budget', label: 'Budget', category: 'finance', type: 'number', render: { input: 'number', display: { table: 'currency' } }, ui: { width: 'half', icon: 'solar:chart-bold' } },
    { name: 'solde', label: 'Solde', category: 'finance', type: 'number', render: { input: 'number', display: { table: 'currency' } }, ui: { width: 'half' } },
    { name: 'commission', label: 'Commission (%)', category: 'finance', type: 'number', render: { input: 'number', display: { table: 'text' } }, ui: { width: 'third' } },
    { name: 'marge', label: 'Marge (%)', category: 'finance', type: 'number', render: { input: 'number', display: { table: 'text' } }, ui: { width: 'third' } },
    { name: 'mode_paiement', label: 'Mode de paiement', category: 'finance', type: 'select', type_config: { options: ['Virement', 'Carte bancaire', 'Chèque', 'Espèces', 'PayPal', 'Prélèvement'] }, render: { input: 'select', display: { table: 'badge' } }, ui: { width: 'half' } },

    // ── 🏢 PROFESSIONNEL ──
    { name: 'entreprise', label: 'Entreprise', category: 'pro', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'half', icon: 'solar:buildings-bold' } },
    { name: 'raison_sociale', label: 'Raison sociale', category: 'pro', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'poste', label: 'Poste / Fonction', category: 'pro', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'half', icon: 'solar:case-bold' } },
    { name: 'departement', label: 'Département / Service', category: 'pro', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'secteur_activite', label: 'Secteur d\'activité', category: 'pro', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'site_web', label: 'Site web', category: 'pro', type: 'string', subtype: 'url', render: { input: 'url', display: { table: 'link' } }, ui: { width: 'half', icon: 'solar:global-bold' } },
    { name: 'linkedin', label: 'LinkedIn', category: 'pro', type: 'string', subtype: 'url', render: { input: 'url', display: { table: 'link' } }, ui: { width: 'half', icon: 'mdi:linkedin' } },
    { name: 'twitter', label: 'Twitter / X', category: 'pro', type: 'string', subtype: 'url', render: { input: 'url', display: { table: 'link' } }, ui: { width: 'half' } },
    { name: 'siret', label: 'SIRET', category: 'pro', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'siren', label: 'SIREN', category: 'pro', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'tva_intra', label: 'N° TVA Intracommunautaire', category: 'pro', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'capital', label: 'Capital social', category: 'pro', type: 'number', render: { input: 'number', display: { table: 'currency' } }, ui: { width: 'half' } },
    { name: 'effectif', label: 'Effectif', category: 'pro', type: 'number', render: { input: 'number', display: { table: 'text' } }, ui: { width: 'half' } },

    // ── ⚡ WORKFLOW ──
    { name: 'statut', label: 'Statut', category: 'workflow', type: 'select', render: { input: 'select', display: { table: 'badge' } }, ui: { width: 'half', icon: 'solar:flag-bold' } },
    { name: 'priorite', label: 'Priorité', category: 'workflow', type: 'select', type_config: { options: ['Basse', 'Normale', 'Haute', 'Urgente'] }, render: { input: 'select', display: { table: 'badge' } }, ui: { width: 'half' } },
    { name: 'progression', label: 'Progression (%)', category: 'workflow', type: 'number', render: { input: 'range', display: { table: 'text' } }, type_config: { min: 0, max: 100 }, ui: { width: 'half' } },
    { name: 'assignee', label: 'Assigné à', category: 'workflow', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'half', icon: 'solar:user-check-bold' } },
    { name: 'responsable', label: 'Responsable', category: 'workflow', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'half', icon: 'solar:user-bold' } },
    { name: 'source', label: 'Source', category: 'workflow', type: 'select', type_config: { options: ['Web', 'Email', 'Téléphone', 'Recommandation', 'Réseaux sociaux', 'Salon', 'Autre'] }, render: { input: 'select', display: { table: 'badge' } }, ui: { width: 'half' } },
    { name: 'tags', label: 'Tags', category: 'workflow', type: 'string', render: { input: 'tags', display: { table: 'text' } }, ui: { width: 'full', icon: 'solar:tag-bold' } },
    { name: 'type_contact', label: 'Type de contact', category: 'workflow', type: 'select', type_config: { options: ['Prospect', 'Client', 'Partenaire', 'Fournisseur'] }, render: { input: 'select', display: { table: 'badge' } }, ui: { width: 'half' } },
    { name: 'statut_commercial', label: 'Statut commercial', category: 'workflow', type: 'select', type_config: { options: ['Nouveau', 'Contacté', 'Qualifié', 'Négociation', 'Gagné', 'Perdu'] }, render: { input: 'select', display: { table: 'badge' } }, ui: { width: 'half' } },

    // ── 📎 MEDIA ──
    { name: 'avatar', label: 'Avatar', category: 'media', type: 'file', render: { input: 'file', display: { table: 'avatar' } }, ui: { width: 'half', icon: 'solar:gallery-bold' } },
    { name: 'photo', label: 'Photo', category: 'media', type: 'file', render: { input: 'file', display: { table: 'avatar' } }, ui: { width: 'half' } },
    { name: 'logo', label: 'Logo', category: 'media', type: 'file', render: { input: 'file', display: { table: 'avatar' } }, ui: { width: 'half' } },
    { name: 'couverture', label: 'Image de couverture', category: 'media', type: 'file', render: { input: 'file', display: { table: 'avatar' } }, ui: { width: 'full' } },
    { name: 'document', label: 'Document', category: 'media', type: 'file', render: { input: 'file', display: { table: 'text' } }, ui: { width: 'full', icon: 'solar:document-bold' } },
    { name: 'pieces_jointes', label: 'Pièces jointes', category: 'media', type: 'file', render: { input: 'file', display: { table: 'text' } }, ui: { width: 'full', icon: 'solar:paperclip-bold' } },
    { name: 'facture', label: 'Facture (PDF)', category: 'media', type: 'file', render: { input: 'file', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'devis', label: 'Devis (PDF)', category: 'media', type: 'file', render: { input: 'file', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'contrat', label: 'Contrat', category: 'media', type: 'file', render: { input: 'file', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'bon_commande', label: 'Bon de commande', category: 'media', type: 'file', render: { input: 'file', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'signature', label: 'Signature', category: 'media', type: 'file', render: { input: 'file', display: { table: 'avatar' } }, ui: { width: 'half' } },

    // ── 🔢 NUMERIC ──
    { name: 'duree_minutes', label: 'Durée (min)', category: 'numeric', type: 'number', render: { input: 'number', display: { table: 'text' } }, ui: { width: 'half', icon: 'solar:clock-bold' } },
    { name: 'revenue', label: 'Chiffre d\'affaires', category: 'numeric', type: 'number', render: { input: 'number', display: { table: 'currency' } }, ui: { width: 'half' } },
    { name: 'note_evaluation', label: 'Note / Évaluation', category: 'numeric', type: 'number', render: { input: 'number', display: { table: 'text' } }, type_config: { min: 0, max: 5 }, ui: { width: 'half', icon: 'solar:star-bold' } },

    // ── 🎛️ CHOICE (Selects / Dropdowns) ──
    { name: 'salle', label: 'Salle', category: 'choice', type: 'select', render: { input: 'select', display: { table: 'badge' } }, ui: { width: 'half' } },
    { name: 'type_visite', label: 'Type de visite', category: 'choice', type: 'select', type_config: { options: ['Consultation', 'Urgence', 'Suivi', 'Contrôle'] }, render: { input: 'select', display: { table: 'badge' } }, ui: { width: 'half' } },
    { name: 'groupe_sanguin', label: 'Groupe Sanguin', category: 'choice', type: 'select', type_config: { options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] }, render: { input: 'select', display: { table: 'badge' } }, ui: { width: 'half' } },
    { name: 'role_equipe', label: 'Rôle', category: 'choice', type: 'select', type_config: { options: ['Manager', 'Développeur', 'Designer', 'Commercial', 'Support', 'Admin'] }, render: { input: 'select', display: { table: 'badge' } }, ui: { width: 'half' } },
    { name: 'en_ligne', label: 'En ligne', category: 'choice', type: 'boolean', render: { input: 'toggle', display: { table: 'badge' } }, ui: { width: 'half' } },
    { name: 'frequences', label: 'Fréquences', category: 'choice', type: 'select', type_config: { options: ['Quotidien', 'Hebdomadaire', 'Mensuel', 'Trimestriel', 'Annuel'] }, render: { input: 'select', display: { table: 'badge' } }, ui: { width: 'half' } },

    // ── 🔗 RELATION ──
    { name: 'consultation_patient', label: 'Patient', category: 'relation', type: 'relation', render: { input: 'relation', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'tache_assignee', label: 'Assigné à', category: 'relation', type: 'relation', render: { input: 'relation', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'tache_patient', label: 'Patient', category: 'relation', type: 'relation', render: { input: 'relation', display: { table: 'text' } }, ui: { width: 'half' } },

    // ── 📦 OTHER (References, IDs, Codes) ──
    { name: 'reference', label: 'Référence', category: 'other', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'half', icon: 'solar:hashtag-bold' } },
    { name: 'code_client', label: 'Code client', category: 'other', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'code_produit', label: 'Code produit', category: 'other', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'code_barre', label: 'Code-barres / EAN', category: 'other', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'sku', label: 'SKU', category: 'other', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'numero_facture', label: 'N° Facture', category: 'other', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'numero_devis', label: 'N° Devis', category: 'other', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'numero_commande', label: 'N° Commande', category: 'other', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'ordre', label: 'Ordre d\'affichage', category: 'other', type: 'number', render: { input: 'number', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'actif', label: 'Actif', category: 'other', type: 'boolean', render: { input: 'toggle', display: { table: 'badge' } }, ui: { width: 'half' } },
    { name: 'publie', label: 'Publié', category: 'other', type: 'boolean', render: { input: 'toggle', display: { table: 'badge' } }, ui: { width: 'half' } },

    // ── 🧪 ADVANCED (Medical / Specialized) ──
    { name: 'medications', label: 'Médicaments', category: 'advanced', type: 'json', render: { input: 'json', display: { table: 'text' } }, ui: { width: 'full' } },
    { name: 'allergies_patient', label: 'Allergies', category: 'advanced', type: 'string', render: { input: 'tags', display: { table: 'text' } }, ui: { width: 'full' } },
    { name: 'unites_dosage', label: 'Unités de dosage', category: 'advanced', type: 'select', type_config: { options: ['mg', 'g', 'ml', 'L', 'UI', 'µg'] }, render: { input: 'select', display: { table: 'badge' } }, ui: { width: 'half' } },
    { name: 'moments_prise', label: 'Moments de prise', category: 'advanced', type: 'select', type_config: { options: ['Matin', 'Midi', 'Soir', 'Au coucher', 'Avant repas', 'Après repas'] }, render: { input: 'multiselect', display: { table: 'text' } }, ui: { width: 'half' } },

    // ── 📋 TEXT (Misc text fields from tenant) ──
    { name: 'motif', label: 'Motif', category: 'text', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'full' } },
    { name: 'diagnostic', label: 'Diagnostic', category: 'text', type: 'string', render: { input: 'textarea', display: { table: 'text' } }, ui: { width: 'full' } },
    { name: 'prescription', label: 'Prescription', category: 'text', type: 'string', render: { input: 'textarea', display: { table: 'text' } }, ui: { width: 'full' } },
    { name: 'antecedents', label: 'Antécédents', category: 'text', type: 'string', render: { input: 'textarea', display: { table: 'text' } }, ui: { width: 'full' } },
    { name: 'suivi', label: 'Suivi recommandé', category: 'text', type: 'string', render: { input: 'textarea', display: { table: 'text' } }, ui: { width: 'full' } },
    { name: 'assurance', label: 'Assurance', category: 'text', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'numero_assure', label: 'N° Assuré', category: 'text', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'numero_dossier', label: 'N° Dossier', category: 'text', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'cin', label: 'CIN', category: 'text', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'company', label: 'Société', category: 'text', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'position', label: 'Poste', category: 'text', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'specialite', label: 'Spécialité', category: 'text', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'poids', label: 'Poids', category: 'text', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'third' } },
    { name: 'temperature', label: 'Température', category: 'text', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'third' } },
    { name: 'tension', label: 'Tension', category: 'text', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'third' } },
    { name: 'couleur_avatar', label: 'Couleur avatar', category: 'text', type: 'string', render: { input: 'color', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'clinique', label: 'Clinique', category: 'text', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'medecin_traitant', label: 'Médecin Traitant', category: 'text', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'notes_medicales', label: 'Notes Médicales', category: 'text', type: 'string', render: { input: 'textarea', display: { table: 'text' } }, ui: { width: 'full' } },
    { name: 'frequence_du_traitement', label: 'Fréquence du traitement', category: 'text', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'titre_tache', label: 'Titre', category: 'text', type: 'string', render: { input: 'text', display: { table: 'text' } }, ui: { width: 'full' } },
    { name: 'description_tache', label: 'Description', category: 'text', type: 'string', render: { input: 'textarea', display: { table: 'text' } }, ui: { width: 'full' } },
    { name: 'date_consultation', label: 'Date consultation', category: 'text', type: 'string', render: { input: 'date', display: { table: 'text' } }, ui: { width: 'half' } },
    { name: 'telephone_equipe', label: 'Téléphone', category: 'text', type: 'string', subtype: 'tel', render: { input: 'tel', display: { table: 'text' } }, ui: { width: 'half' } },
];

// ═══════════════════════════════════════════════════════════
// SYSTEM ENTITY TEMPLATES
// ═══════════════════════════════════════════════════════════

const systemEntityTemplates = [
    {
        name: 'Contacts',
        slug: 'contacts',
        description: 'Gérez vos contacts, prospects et clients avec un suivi complet des interactions et des informations de contact.',
        icon: 'solar:users-group-rounded-bold-duotone',
        color: '#4361ee',
        category: 'crm',
        fields: ['nom', 'prenom', 'email', 'telephone', 'mobile', 'entreprise', 'poste', 'adresse', 'ville', 'code_postal', 'pays', 'site_web', 'linkedin', 'notes', 'source', 'dernier_contact'],
        classifications: [
            {
                name: 'Statut Contact', key: 'statut_contact', isStatus: true, options: [
                    { label: 'Nouveau', color: '#3b82f6' }, { label: 'Contacté', color: '#f59e0b' },
                    { label: 'Qualifié', color: '#8b5cf6' }, { label: 'Négociation', color: '#ec4899' },
                    { label: 'Gagné', color: '#10b981' }, { label: 'Perdu', color: '#ef4444' }
                ]
            },
            {
                name: 'Type de contact', key: 'type_contact', options: [
                    { label: 'Prospect', color: '#3b82f6' }, { label: 'Client', color: '#10b981' },
                    { label: 'Partenaire', color: '#8b5cf6' }, { label: 'Fournisseur', color: '#f59e0b' }
                ]
            },
            {
                name: 'Priorité', key: 'priorite_contact', options: [
                    { label: 'Basse', color: '#6b7280' }, { label: 'Moyenne', color: '#f59e0b' },
                    { label: 'Haute', color: '#ef4444' }, { label: 'Urgente', color: '#dc2626' }
                ]
            }
        ],
        referenceTitleTokens: [{ type: 'field', value: 'prenom' }, { type: 'separator', value: ' ' }, { type: 'field', value: 'nom' }]
    },
    {
        name: 'Tâches',
        slug: 'taches',
        description: 'Suivez toutes les tâches de votre équipe avec un système de priorités, dates limites et statuts en mode Kanban.',
        icon: 'solar:checklist-minimalistic-bold-duotone',
        color: '#10b981',
        category: 'productivity',
        fields: ['titre_tache', 'description_tache', 'assignee', 'due_at', 'progression'],
        classifications: [
            {
                name: 'Statut Tâche', key: 'task_status', isStatus: true, options: [
                    { label: 'À faire', color: '#6b7280' }, { label: 'En cours', color: '#3b82f6' },
                    { label: 'En revue', color: '#f59e0b' }, { label: 'Terminé', color: '#10b981' },
                    { label: 'Bloqué', color: '#ef4444' }
                ]
            },
            {
                name: 'Priorité Tâche', key: 'task_priority', options: [
                    { label: 'Basse', color: '#6b7280' }, { label: 'Normale', color: '#3b82f6' },
                    { label: 'Haute', color: '#f59e0b' }, { label: 'Urgente', color: '#ef4444' }
                ]
            },
            {
                name: 'Tags Tâche', key: 'task_tags', options: [
                    { label: 'Backend', color: '#3b82f6' }, { label: 'Frontend', color: '#8b5cf6' },
                    { label: 'Design', color: '#ec4899' }, { label: 'DevOps', color: '#06b6d4' },
                    { label: 'Bug', color: '#ef4444' }, { label: 'Feature', color: '#10b981' }
                ]
            }
        ],
        referenceTitleTokens: [{ type: 'field', value: 'titre_tache' }]
    },
    {
        name: 'Projets',
        slug: 'projets',
        description: 'Planifiez et gérez vos projets avec suivi du budget, des délais et de la progression.',
        icon: 'solar:folder-bold-duotone',
        color: '#8b5cf6',
        category: 'productivity',
        fields: ['titre', 'description', 'responsable', 'date_debut', 'date_fin', 'budget', 'progression', 'notes'],
        classifications: [
            {
                name: 'Statut Projet', key: 'statut_projet', isStatus: true, options: [
                    { label: 'Planifié', color: '#6b7280' }, { label: 'En cours', color: '#3b82f6' },
                    { label: 'En revue', color: '#f59e0b' }, { label: 'En pause', color: '#a855f7' },
                    { label: 'Terminé', color: '#10b981' }, { label: 'Annulé', color: '#ef4444' }
                ]
            },
            {
                name: 'Priorité Projet', key: 'priorite_projet', options: [
                    { label: 'Basse', color: '#6b7280' }, { label: 'Normale', color: '#3b82f6' },
                    { label: 'Haute', color: '#f59e0b' }, { label: 'Critique', color: '#ef4444' }
                ]
            },
            {
                name: 'Type Projet', key: 'type_projet', options: [
                    { label: 'Interne', color: '#3b82f6' }, { label: 'Client', color: '#10b981' },
                    { label: 'R&D', color: '#8b5cf6' }, { label: 'Maintenance', color: '#f59e0b' }
                ]
            }
        ],
        referenceTitleTokens: [{ type: 'field', value: 'titre' }]
    },
    {
        name: 'Documents',
        slug: 'documents',
        description: 'Centralisez et organisez tous vos documents, contrats et fichiers importants.',
        icon: 'solar:document-text-bold-duotone',
        color: '#06b6d4',
        category: 'content',
        fields: ['titre', 'description', 'document', 'pieces_jointes', 'date_creation', 'notes'],
        classifications: [
            {
                name: 'Type Document', key: 'type_document', isStatus: true, options: [
                    { label: 'Contrat', color: '#3b82f6' }, { label: 'Facture', color: '#10b981' },
                    { label: 'Devis', color: '#f59e0b' }, { label: 'Rapport', color: '#8b5cf6' },
                    { label: 'Autre', color: '#6b7280' }
                ]
            },
            {
                name: 'Statut Document', key: 'statut_document', options: [
                    { label: 'Brouillon', color: '#6b7280' }, { label: 'En attente', color: '#f59e0b' },
                    { label: 'Validé', color: '#10b981' }, { label: 'Archivé', color: '#9ca3af' }
                ]
            }
        ],
        referenceTitleTokens: [{ type: 'field', value: 'titre' }]
    },
    {
        name: 'Événements',
        slug: 'evenements',
        description: 'Planifiez et suivez vos événements, réunions et rendez-vous.',
        icon: 'solar:calendar-bold-duotone',
        color: '#f59e0b',
        category: 'productivity',
        fields: ['titre', 'description', 'date_debut', 'date_fin', 'rdv_at', 'duree_minutes', 'salle', 'responsable', 'notes'],
        classifications: [
            {
                name: 'Type Événement', key: 'type_evenement', isStatus: true, options: [
                    { label: 'Réunion', color: '#3b82f6' }, { label: 'Rendez-vous', color: '#10b981' },
                    { label: 'Formation', color: '#8b5cf6' }, { label: 'Conférence', color: '#f59e0b' },
                    { label: 'Autre', color: '#6b7280' }
                ]
            },
            {
                name: 'Statut Événement', key: 'statut_evenement', options: [
                    { label: 'Planifié', color: '#3b82f6' }, { label: 'Confirmé', color: '#10b981' },
                    { label: 'Annulé', color: '#ef4444' }, { label: 'Terminé', color: '#6b7280' }
                ]
            }
        ],
        referenceTitleTokens: [{ type: 'field', value: 'titre' }]
    },
    {
        name: 'Utilisateurs',
        slug: 'utilisateurs',
        description: 'Gérez les membres de votre équipe, leurs rôles et coordonnées.',
        icon: 'solar:users-group-two-rounded-bold-duotone',
        color: '#4361ee',
        category: 'system',
        fields: ['nom', 'prenom', 'email', 'telephone', 'poste', 'departement', 'role_equipe', 'avatar', 'date_debut', 'notes'],
        classifications: [
            {
                name: 'Rôle', key: 'role_utilisateur', isStatus: true, options: [
                    { label: 'Admin', color: '#ef4444' }, { label: 'Manager', color: '#8b5cf6' },
                    { label: 'Membre', color: '#3b82f6' }, { label: 'Invité', color: '#6b7280' }
                ]
            },
            {
                name: 'Statut', key: 'statut_utilisateur', options: [
                    { label: 'Actif', color: '#10b981' }, { label: 'Inactif', color: '#6b7280' },
                    { label: 'Suspendu', color: '#ef4444' }
                ]
            }
        ],
        referenceTitleTokens: [{ type: 'field', value: 'prenom' }, { type: 'separator', value: ' ' }, { type: 'field', value: 'nom' }]
    },
    {
        name: 'Emails',
        slug: 'emails',
        description: 'Suivez vos emails importants et les communications avec vos contacts.',
        icon: 'solar:letter-bold-duotone',
        color: '#ec4899',
        category: 'communication',
        fields: ['objet', 'contenu', 'email', 'date_creation', 'pieces_jointes', 'notes'],
        classifications: [
            {
                name: 'Statut Email', key: 'statut_email', isStatus: true, options: [
                    { label: 'Brouillon', color: '#6b7280' }, { label: 'Envoyé', color: '#3b82f6' },
                    { label: 'Reçu', color: '#10b981' }, { label: 'Lu', color: '#8b5cf6' },
                    { label: 'Archivé', color: '#9ca3af' }
                ]
            },
            {
                name: 'Catégorie', key: 'categorie_email', options: [
                    { label: 'Professionnel', color: '#3b82f6' }, { label: 'Personnel', color: '#10b981' },
                    { label: 'Important', color: '#ef4444' }, { label: 'Newsletter', color: '#f59e0b' }
                ]
            }
        ],
        referenceTitleTokens: [{ type: 'field', value: 'objet' }]
    },
    {
        name: 'Médias',
        slug: 'medias',
        description: 'Bibliothèque de médias pour gérer vos images, vidéos et fichiers.',
        icon: 'solar:gallery-bold-duotone',
        color: '#f97316',
        category: 'content',
        fields: ['titre', 'description', 'document', 'couverture', 'tags', 'date_creation'],
        classifications: [
            {
                name: 'Type Média', key: 'type_media', isStatus: true, options: [
                    { label: 'Image', color: '#3b82f6' }, { label: 'Vidéo', color: '#ef4444' },
                    { label: 'Audio', color: '#10b981' }, { label: 'PDF', color: '#f59e0b' },
                    { label: 'Autre', color: '#6b7280' }
                ]
            }
        ],
        referenceTitleTokens: [{ type: 'field', value: 'titre' }]
    },
    {
        name: 'Notes',
        slug: 'notes',
        description: 'Prenez des notes, rédigez des mémos et organisez vos idées.',
        icon: 'solar:notes-bold-duotone',
        color: '#fbbf24',
        category: 'content',
        fields: ['titre', 'contenu', 'tags', 'date_creation'],
        classifications: [
            {
                name: 'Type Note', key: 'type_note', isStatus: true, options: [
                    { label: 'Idée', color: '#f59e0b' }, { label: 'Mémo', color: '#3b82f6' },
                    { label: 'Réunion', color: '#8b5cf6' }, { label: 'Personnel', color: '#10b981' },
                    { label: 'Brouillon', color: '#6b7280' }
                ]
            }
        ],
        referenceTitleTokens: [{ type: 'field', value: 'titre' }]
    },
    {
        name: 'Factures',
        slug: 'factures',
        description: 'Suivi complet de la facturation avec montants, dates d\'échéance, statuts de paiement et gestion des relances.',
        icon: 'solar:bill-list-bold-duotone',
        color: '#10b981',
        category: 'finance',
        fields: ['numero_facture', 'titre', 'montant', 'total_ht', 'tva', 'total_ttc', 'date_creation', 'echeance', 'mode_paiement', 'date_paiement', 'notes'],
        classifications: [
            {
                name: 'Statut Paiement', key: 'statut_paiement', isStatus: true, options: [
                    { label: 'Brouillon', color: '#6b7280' }, { label: 'Envoyée', color: '#3b82f6' },
                    { label: 'Payée', color: '#10b981' }, { label: 'En retard', color: '#ef4444' },
                    { label: 'Annulée', color: '#9ca3af' }
                ]
            }
        ],
        referenceTitleTokens: [{ type: 'field', value: 'numero_facture' }]
    }
];

// ═══════════════════════════════════════════════════════════
// MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════════

async function seed() {
    console.log('🚀 Seeding system fields and entity templates...\n');

    const conn = mongoose.createConnection(GLOBAL_DB);
    await new Promise(r => conn.once('open', r));
    console.log('✅ Connected to global DB:', GLOBAL_DB);

    // ── 1. Seed System Fields ──
    console.log('\n📋 Seeding system field templates...');
    const fieldsColl = conn.db.collection('fieldtemplates');

    let created = 0, updated = 0, skipped = 0;
    for (const field of systemFields) {
        const existing = await fieldsColl.findOne({ name: field.name });
        const doc = {
            ...field,
            isSystem: true,
            isCustom: false,
            updatedAt: new Date()
        };

        if (existing) {
            await fieldsColl.updateOne({ _id: existing._id }, { $set: doc });
            updated++;
        } else {
            doc.createdAt = new Date();
            await fieldsColl.insertOne(doc);
            created++;
        }
    }
    console.log(`   ✅ Fields: ${created} created, ${updated} updated (${systemFields.length} total)`);

    // Summary by category
    const categories = {};
    systemFields.forEach(f => {
        categories[f.category] = (categories[f.category] || 0) + 1;
    });
    console.log('   📊 By category:');
    Object.entries(categories).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
        console.log(`      ${cat}: ${count} fields`);
    });

    // ── 2. Seed Entity Templates ──
    console.log('\n🏗️  Seeding entity templates...');
    const templatesColl = conn.db.collection('entitytemplates');

    let tCreated = 0, tUpdated = 0;
    for (const tpl of systemEntityTemplates) {
        const existing = await templatesColl.findOne({ slug: tpl.slug });
        const doc = {
            ...tpl,
            isSystem: true,
            updatedAt: new Date()
        };

        if (existing) {
            await templatesColl.updateOne({ _id: existing._id }, { $set: doc });
            tUpdated++;
        } else {
            doc.createdAt = new Date();
            doc.usageCount = 0;
            await templatesColl.insertOne(doc);
            tCreated++;
        }
    }
    console.log(`   ✅ Templates: ${tCreated} created, ${tUpdated} updated (${systemEntityTemplates.length} total)`);

    // List templates
    console.log('   📦 Entity templates:');
    systemEntityTemplates.forEach(t => {
        console.log(`      ${t.icon} ${t.name} (${t.slug}) — ${t.fields.length} fields, ${t.classifications.length} classifications`);
    });

    // ── Done ──
    console.log('\n✨ Seeding complete!');
    await conn.close();
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seed error:', err);
    process.exit(1);
});
