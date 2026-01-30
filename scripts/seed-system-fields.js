/**
 * Seed Script: System Field Templates
 * 
 * Creates 25 system field templates that are:
 * - Non-deletable (isSystem: true)
 * - Available in every account's field library
 * - Idempotent (safe to run multiple times)
 * 
 * Usage: node scripts/seed-system-fields.js
 */

const mongoose = require('mongoose');
const config = require('../config/db');
const FieldTemplate = require('../models/field-template.model');

const systemFields = [
    // ═══════════════════════════════════════════════════════════════════
    // POPULAIRES
    // ═══════════════════════════════════════════════════════════════════
    {
        name: 'email',
        label: 'Email',
        description: 'Adresse email avec validation automatique',
        type: 'string',
        subtype: 'email',
        category: 'popular',
        ui: {
            icon: 'solar:letter-bold-duotone',
            placeholder: 'exemple@email.com',
            width: 'half'
        },
        render: { input: 'email', display: { table: 'link', card: 'text' } },
        type_config: { regex: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
        isSystem: true,
        isCustom: false
    },
    {
        name: 'phone',
        label: 'Téléphone',
        description: 'Numéro de téléphone avec format international',
        type: 'string',
        subtype: 'tel',
        category: 'popular',
        ui: {
            icon: 'solar:phone-bold-duotone',
            placeholder: '+33 6 12 34 56 78',
            width: 'half'
        },
        render: { input: 'tel', display: { table: 'link', card: 'text' } },
        type_config: { regex: '^\\+?[0-9\\s\\-\\.]{7,20}$' },
        isSystem: true,
        isCustom: false
    },
    {
        name: 'status',
        label: 'Statut',
        description: 'Statut de l\'élément (À faire, En cours, Terminé...)',
        type: 'select',
        category: 'popular',
        ui: {
            icon: 'solar:verified-check-bold-duotone',
            width: 'half'
        },
        render: { input: 'select', display: { table: 'badge', card: 'badge' } },
        type_config: {
            options: [
                { label: 'À faire', value: 'todo', color: '#6B7280' },
                { label: 'En cours', value: 'in_progress', color: '#3B82F6' },
                { label: 'Terminé', value: 'done', color: '#10B981' },
                { label: 'Bloqué', value: 'blocked', color: '#EF4444' }
            ]
        },
        isSystem: true,
        isCustom: false
    },
    {
        name: 'priority',
        label: 'Priorité',
        description: 'Niveau de priorité',
        type: 'select',
        category: 'popular',
        ui: {
            icon: 'solar:flag-bold-duotone',
            width: 'half'
        },
        render: { input: 'select', display: { table: 'badge', card: 'badge' } },
        type_config: {
            options: [
                { label: 'Basse', value: 'low', color: '#6B7280' },
                { label: 'Normale', value: 'normal', color: '#3B82F6' },
                { label: 'Haute', value: 'high', color: '#F59E0B' },
                { label: 'Urgente', value: 'urgent', color: '#EF4444' }
            ]
        },
        isSystem: true,
        isCustom: false
    },
    {
        name: 'assignee',
        label: 'Assigné à',
        description: 'Utilisateur responsable',
        type: 'relation',
        subtype: 'user',
        category: 'popular',
        ui: {
            icon: 'solar:user-bold-duotone',
            width: 'half'
        },
        render: { input: 'user', display: { table: 'avatar', card: 'avatar' } },
        type_config: { refEntity: 'User', multiple: false },
        isSystem: true,
        isCustom: false
    },

    // ═══════════════════════════════════════════════════════════════════
    // TEXTE
    // ═══════════════════════════════════════════════════════════════════
    {
        name: 'short_text',
        label: 'Texte court',
        description: 'Champ texte simple (max 255 caractères)',
        type: 'string',
        category: 'text',
        ui: {
            icon: 'solar:text-bold-duotone',
            placeholder: 'Entrez du texte...',
            width: 'full'
        },
        render: { input: 'text', display: { table: 'text', card: 'text' } },
        type_config: { maxLength: 255 },
        isSystem: true,
        isCustom: false
    },
    {
        name: 'long_text',
        label: 'Texte long',
        description: 'Zone de texte multiligne',
        type: 'text',
        category: 'text',
        ui: {
            icon: 'solar:document-text-bold-duotone',
            placeholder: 'Description détaillée...',
            width: 'full'
        },
        render: { input: 'textarea', display: { table: 'truncate', card: 'text' } },
        isSystem: true,
        isCustom: false
    },
    {
        name: 'url',
        label: 'URL',
        description: 'Lien web avec validation',
        type: 'string',
        subtype: 'url',
        category: 'text',
        ui: {
            icon: 'solar:link-bold-duotone',
            placeholder: 'https://...',
            width: 'full'
        },
        render: { input: 'url', display: { table: 'link', card: 'link' } },
        type_config: { regex: '^https?:\\/\\/.+' },
        isSystem: true,
        isCustom: false
    },
    {
        name: 'rich_text',
        label: 'Texte enrichi',
        description: 'Éditeur de texte avec mise en forme',
        type: 'text',
        subtype: 'rich',
        category: 'text',
        ui: {
            icon: 'solar:text-italic-bold-duotone',
            width: 'full'
        },
        render: { input: 'richtext', display: { table: 'html', card: 'html' } },
        isSystem: true,
        isCustom: false
    },

    // ═══════════════════════════════════════════════════════════════════
    // NUMÉRIQUE
    // ═══════════════════════════════════════════════════════════════════
    {
        name: 'number',
        label: 'Nombre',
        description: 'Valeur numérique entière ou décimale',
        type: 'number',
        category: 'numeric',
        ui: {
            icon: 'solar:hashtag-bold-duotone',
            placeholder: '0',
            width: 'half'
        },
        render: { input: 'number', display: { table: 'number', card: 'number' } },
        isSystem: true,
        isCustom: false
    },
    {
        name: 'currency',
        label: 'Montant',
        description: 'Valeur monétaire avec devise',
        type: 'number',
        subtype: 'currency',
        category: 'numeric',
        ui: {
            icon: 'solar:dollar-bold-duotone',
            placeholder: '0.00',
            width: 'half'
        },
        render: { input: 'currency', display: { table: 'currency', card: 'currency' } },
        type_config: { currency: 'EUR', decimals: 2 },
        isSystem: true,
        isCustom: false
    },
    {
        name: 'percentage',
        label: 'Pourcentage',
        description: 'Valeur en pourcentage (0-100)',
        type: 'number',
        subtype: 'percent',
        category: 'numeric',
        ui: {
            icon: 'solar:pie-chart-bold-duotone',
            placeholder: '0',
            width: 'half'
        },
        render: { input: 'percent', display: { table: 'percent', card: 'percent' } },
        type_config: { min: 0, max: 100 },
        isSystem: true,
        isCustom: false
    },
    {
        name: 'rating',
        label: 'Note',
        description: 'Notation par étoiles (1 à 5)',
        type: 'number',
        subtype: 'rating',
        category: 'numeric',
        ui: {
            icon: 'solar:star-bold-duotone',
            width: 'half'
        },
        render: { input: 'rating', display: { table: 'stars', card: 'stars' } },
        type_config: { min: 1, max: 5 },
        isSystem: true,
        isCustom: false
    },

    // ═══════════════════════════════════════════════════════════════════
    // DATE / TEMPS
    // ═══════════════════════════════════════════════════════════════════
    {
        name: 'date',
        label: 'Date',
        description: 'Sélecteur de date',
        type: 'date',
        category: 'date',
        ui: {
            icon: 'solar:calendar-bold-duotone',
            width: 'half'
        },
        render: { input: 'date', display: { table: 'date', card: 'date' } },
        isSystem: true,
        isCustom: false
    },
    {
        name: 'datetime',
        label: 'Date et Heure',
        description: 'Sélecteur de date avec heure',
        type: 'date',
        subtype: 'datetime',
        category: 'date',
        ui: {
            icon: 'solar:clock-circle-bold-duotone',
            width: 'half'
        },
        render: { input: 'datetime', display: { table: 'datetime', card: 'datetime' } },
        type_config: { includeTime: true },
        isSystem: true,
        isCustom: false
    },
    {
        name: 'time',
        label: 'Heure',
        description: 'Sélecteur d\'heure uniquement',
        type: 'string',
        subtype: 'time',
        category: 'date',
        ui: {
            icon: 'solar:clock-square-bold-duotone',
            width: 'half'
        },
        render: { input: 'time', display: { table: 'time', card: 'time' } },
        isSystem: true,
        isCustom: false
    },

    // ═══════════════════════════════════════════════════════════════════
    // CHOIX
    // ═══════════════════════════════════════════════════════════════════
    {
        name: 'single_select',
        label: 'Liste déroulante',
        description: 'Choix unique dans une liste d\'options',
        type: 'select',
        category: 'choice',
        ui: {
            icon: 'solar:list-down-bold-duotone',
            width: 'half'
        },
        render: { input: 'select', display: { table: 'badge', card: 'badge' } },
        type_config: { options: [] },
        isSystem: true,
        isCustom: false
    },
    {
        name: 'multi_select',
        label: 'Sélection multiple',
        description: 'Choix multiples dans une liste d\'options',
        type: 'select',
        subtype: 'multi',
        category: 'choice',
        ui: {
            icon: 'solar:checklist-bold-duotone',
            width: 'full'
        },
        render: { input: 'multiselect', display: { table: 'badges', card: 'badges' } },
        type_config: { options: [], multiple: true },
        isSystem: true,
        isCustom: false
    },
    {
        name: 'checkbox',
        label: 'Case à cocher',
        description: 'Valeur booléenne (Oui/Non)',
        type: 'boolean',
        category: 'choice',
        ui: {
            icon: 'solar:check-square-bold-duotone',
            width: 'half'
        },
        render: { input: 'checkbox', display: { table: 'check', card: 'check' } },
        isSystem: true,
        isCustom: false
    },

    // ═══════════════════════════════════════════════════════════════════
    // RELATION
    // ═══════════════════════════════════════════════════════════════════
    {
        name: 'relation',
        label: 'Relation',
        description: 'Lien vers un élément d\'une autre collection',
        type: 'relation',
        category: 'relation',
        ui: {
            icon: 'solar:link-round-bold-duotone',
            width: 'half'
        },
        render: { input: 'relation', display: { table: 'link', card: 'link' } },
        type_config: { refEntity: null, multiple: false },
        isSystem: true,
        isCustom: false
    },
    {
        name: 'user',
        label: 'Utilisateur',
        description: 'Sélection d\'un utilisateur du système',
        type: 'relation',
        subtype: 'user',
        category: 'relation',
        ui: {
            icon: 'solar:user-bold-duotone',
            width: 'half'
        },
        render: { input: 'user', display: { table: 'avatar', card: 'avatar' } },
        type_config: { refEntity: 'User', multiple: false },
        isSystem: true,
        isCustom: false
    },

    // ═══════════════════════════════════════════════════════════════════
    // MEDIA
    // ═══════════════════════════════════════════════════════════════════
    {
        name: 'file',
        label: 'Fichier',
        description: 'Upload de fichier (PDF, DOC, etc.)',
        type: 'file',
        category: 'media',
        ui: {
            icon: 'solar:file-bold-duotone',
            width: 'full'
        },
        render: { input: 'file', display: { table: 'file', card: 'file' } },
        type_config: { accept: '.pdf,.doc,.docx,.xls,.xlsx,.txt', multiple: false },
        isSystem: true,
        isCustom: false
    },
    {
        name: 'image',
        label: 'Image',
        description: 'Upload d\'image avec aperçu',
        type: 'image',
        category: 'media',
        ui: {
            icon: 'solar:gallery-bold-duotone',
            width: 'half'
        },
        render: { input: 'image', display: { table: 'thumbnail', card: 'thumbnail' } },
        type_config: { accept: 'image/*', multiple: false },
        isSystem: true,
        isCustom: false
    },

    // ═══════════════════════════════════════════════════════════════════
    // CALCUL
    // ═══════════════════════════════════════════════════════════════════
    {
        name: 'formula',
        label: 'Formule',
        description: 'Champ calculé automatiquement',
        type: 'computed',
        category: 'computed',
        ui: {
            icon: 'solar:calculator-bold-duotone',
            width: 'half',
            readonly: true
        },
        render: { input: 'readonly', display: { table: 'computed', card: 'computed' } },
        formula: { expression: '', sourceFields: {}, dependsOn: [] },
        isSystem: true,
        isCustom: false
    },

    // ═══════════════════════════════════════════════════════════════════
    // AVANCÉ
    // ═══════════════════════════════════════════════════════════════════
    {
        name: 'json',
        label: 'JSON',
        description: 'Données structurées au format JSON',
        type: 'object',
        category: 'advanced',
        ui: {
            icon: 'solar:code-bold-duotone',
            width: 'full'
        },
        render: { input: 'code', display: { table: 'code', card: 'code' } },
        isSystem: true,
        isCustom: false
    }
];

// ═══════════════════════════════════════════════════════════════════════════
// SEED FUNCTION (Tenant Database)
// ═══════════════════════════════════════════════════════════════════════════

async function seedSystemFields(accountNumber) {
    if (!accountNumber) {
        console.log('Usage: node scripts/seed-system-fields.js <account_number>');
        console.log('');
        console.log('Example:');
        console.log('  node scripts/seed-system-fields.js 5001');
        process.exit(1);
    }

    let tenantDb;
    try {
        console.log('🔌 Connecting to MongoDB...');

        // Connect to tenant database
        const tenantDbUri = `${config.uri}saas_app_rb_${accountNumber}`;
        tenantDb = mongoose.createConnection(tenantDbUri);

        // Wait for connection
        await new Promise((resolve, reject) => {
            tenantDb.once('open', resolve);
            tenantDb.once('error', reject);
        });

        console.log(`✅ Connected to tenant database: saas_app_rb_${accountNumber}`);

        // Register FieldTemplate model on tenant connection
        const TenantFieldTemplate = tenantDb.model('FieldTemplate', FieldTemplate.schema);

        console.log('\n📦 Seeding system fields...\n');

        let created = 0;
        let updated = 0;

        for (const field of systemFields) {
            const existing = await TenantFieldTemplate.findOne({ name: field.name, isSystem: true });

            if (existing) {
                // Update existing system field
                await TenantFieldTemplate.updateOne({ _id: existing._id }, { $set: field });
                console.log(`  🔄 Updated: ${field.label} (${field.name})`);
                updated++;
            } else {
                // Create new system field
                await TenantFieldTemplate.create(field);
                console.log(`  ✨ Created: ${field.label} (${field.name})`);
                created++;
            }
        }

        console.log('\n═══════════════════════════════════════════════════');
        console.log(`✅ Seed complete for account ${accountNumber}!`);
        console.log(`   📊 Created: ${created} | Updated: ${updated}`);
        console.log(`   📦 Total system fields: ${systemFields.length}`);
        console.log('═══════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    } finally {
        if (tenantDb) {
            await tenantDb.close();
        }
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run if called directly
if (require.main === module) {
    const accountNumber = process.argv[2];
    seedSystemFields(accountNumber);
}

module.exports = { seedSystemFields, systemFields };
