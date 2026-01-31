/**
 * Seed Field Types - Types de champs de base
 * 
 * Usage: node scripts/seed-field-types.js
 * 
 * Ces types sont globaux (pas tenant-scoped) et gérés par l'admin.
 */

const mongoose = require('mongoose');
const config = require('../config/db');
const FieldType = require('../models/field-type.model');

const fieldTypes = [
    // ========== TEXT ==========
    {
        name: 'string',
        label: 'Texte court',
        description: 'Champ texte simple (max 255 caractères)',
        icon: 'solar:text-bold-duotone',
        category: 'text',
        filterOperators: ['equals', 'contains', 'startsWith', 'endsWith'],
        subtypes: [
            { name: 'email', label: 'Email', icon: 'solar:letter-bold-duotone', validation: { regex: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$' } },
            { name: 'tel', label: 'Téléphone', icon: 'solar:phone-bold-duotone', validation: { regex: '^[+]?[(]?[0-9]{1,4}[)]?[-\\s./0-9]*$' } },
            { name: 'url', label: 'URL', icon: 'solar:link-bold-duotone', validation: { regex: '^https?://.+' } }
        ],
        order: 1
    },
    {
        name: 'text_long',
        label: 'Texte long',
        description: 'Zone de texte multiligne',
        icon: 'solar:document-text-bold-duotone',
        category: 'text',
        filterOperators: ['contains'],
        defaultUIOptions: { width: 'full' },
        order: 2
    },
    {
        name: 'rich_text',
        label: 'Texte enrichi',
        description: 'Éditeur de texte avec mise en forme',
        icon: 'solar:text-italic-bold-duotone',
        category: 'text',
        filterOperators: ['contains'],
        defaultUIOptions: { width: 'full' },
        order: 3
    },

    // ========== NUMERIC ==========
    {
        name: 'number',
        label: 'Nombre',
        description: 'Valeur numérique entière ou décimale',
        icon: 'solar:hashtag-bold-duotone',
        category: 'numeric',
        filterOperators: ['equals', 'lt', 'lte', 'gt', 'gte', 'between'],
        subtypes: [
            { name: 'currency', label: 'Montant', icon: 'solar:dollar-bold-duotone', validation: { decimals: 2, prefix: '€' } },
            { name: 'percent', label: 'Pourcentage', icon: 'solar:pie-chart-bold-duotone', validation: { min: 0, max: 100, suffix: '%' } },
            { name: 'rating', label: 'Note', icon: 'solar:star-bold-duotone', validation: { min: 0, max: 5 } }
        ],
        availableValidations: [
            { name: 'min', label: 'Minimum', valueType: 'number' },
            { name: 'max', label: 'Maximum', valueType: 'number' },
            { name: 'decimals', label: 'Décimales', valueType: 'number' }
        ],
        order: 10
    },

    // ========== DATE ==========
    {
        name: 'date',
        label: 'Date',
        description: 'Date sans heure',
        icon: 'solar:calendar-bold-duotone',
        category: 'date',
        filterOperators: ['equals', 'before', 'after', 'between'],
        order: 20
    },
    {
        name: 'datetime',
        label: 'Date et heure',
        description: 'Date avec heure',
        icon: 'solar:calendar-date-bold-duotone',
        category: 'date',
        filterOperators: ['equals', 'before', 'after', 'between'],
        order: 21
    },
    {
        name: 'time',
        label: 'Heure',
        description: 'Heure uniquement',
        icon: 'solar:clock-circle-bold-duotone',
        category: 'date',
        filterOperators: ['equals', 'before', 'after'],
        order: 22
    },

    // ========== CHOICE ==========
    {
        name: 'select',
        label: 'Choix unique',
        description: 'Liste déroulante avec une seule sélection',
        icon: 'solar:checklist-bold-duotone',
        category: 'choice',
        filterOperators: ['equals', 'in'],
        defaultConfig: { options: [] },
        order: 30
    },
    {
        name: 'multiselect',
        label: 'Choix multiple',
        description: 'Liste déroulante avec plusieurs sélections',
        icon: 'solar:list-check-bold-duotone',
        category: 'choice',
        filterOperators: ['in', 'contains'],
        defaultConfig: { options: [] },
        order: 31
    },
    {
        name: 'boolean',
        label: 'Oui/Non',
        description: 'Case à cocher ou toggle',
        icon: 'solar:toggle-on-bold-duotone',
        category: 'choice',
        filterOperators: ['equals'],
        order: 32
    },

    // ========== RELATION ==========
    {
        name: 'relation',
        label: 'Relation',
        description: 'Lien vers une autre collection',
        icon: 'solar:link-round-bold-duotone',
        category: 'relation',
        filterOperators: ['equals', 'in'],
        subtypes: [
            { name: 'user', label: 'Utilisateur', icon: 'solar:user-bold-duotone' },
            { name: 'entity', label: 'Collection', icon: 'solar:inbox-bold-duotone' }
        ],
        defaultConfig: { refEntity: null, displayField: 'title' },
        order: 40
    },

    // ========== MEDIA ==========
    {
        name: 'file',
        label: 'Fichier',
        description: 'Upload de fichier',
        icon: 'solar:file-bold-duotone',
        category: 'media',
        filterOperators: ['exists'],
        defaultConfig: { maxSize: 10485760, allowedTypes: [] },
        order: 50
    },
    {
        name: 'image',
        label: 'Image',
        description: 'Upload d\'image avec prévisualisation',
        icon: 'solar:gallery-bold-duotone',
        category: 'media',
        filterOperators: ['exists'],
        defaultConfig: { maxSize: 5242880, allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] },
        order: 51
    },

    // ========== ADVANCED ==========
    {
        name: 'json',
        label: 'JSON',
        description: 'Données structurées JSON',
        icon: 'solar:code-bold-duotone',
        category: 'advanced',
        filterOperators: [],
        order: 60
    },
    {
        name: 'formula',
        label: 'Formule',
        description: 'Champ calculé automatiquement',
        icon: 'solar:calculator-bold-duotone',
        category: 'advanced',
        filterOperators: [],
        order: 61
    }
];

async function seedFieldTypes() {
    try {
        // Connexion à la DB globale (pas tenant)
        await mongoose.connect(config.globalDbUri);
        console.log('📦 Connected to MongoDB (Global DB)');

        // Upsert chaque type
        for (const type of fieldTypes) {
            const result = await FieldType.findOneAndUpdate(
                { name: type.name },
                type,
                { upsert: true, new: true }
            );
            console.log(`✅ ${type.name} → ${result.label}`);
        }

        console.log(`\n🎉 Seeded ${fieldTypes.length} field types`);

    } catch (error) {
        console.error('❌ Error seeding field types:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

seedFieldTypes();
