/**
 * Seed Script - Add demo data to collections
 * 
 * Usage: node scripts/seed-demo-data.js <account_number> [entity_slug]
 * 
 * Examples:
 *   node scripts/seed-demo-data.js 12345              # Seed all entities
 *   node scripts/seed-demo-data.js 12345 contacts     # Seed only 'contacts' entity
 */

const mongoose = require('mongoose');
const config = require('../config/db');

// Models
const Entity = require('../models/entity.model');
const Record = require('../models/record.model');
const FieldTemplate = require('../models/field-template.model');

// Demo data templates by entity type
const demoDataTemplates = {
    // Contacts / Clients
    contacts: [
        { title: 'Jean Dupont', description: 'Client fidèle depuis 2020', status: 'active' },
        { title: 'Marie Martin', description: 'Prospect intéressé', status: 'prospect' },
        { title: 'Pierre Durand', description: 'Partenaire commercial', status: 'partner' },
        { title: 'Sophie Bernard', description: 'Client B2B', status: 'active' },
        { title: 'Lucas Petit', description: 'Nouveau contact', status: 'new' },
    ],

    // Products / Services
    products: [
        { title: 'Formation Web', description: 'Formation complète développement web', status: 'published' },
        { title: 'Consulting IT', description: 'Service de conseil informatique', status: 'published' },
        { title: 'Maintenance', description: 'Contrat de maintenance annuel', status: 'draft' },
        { title: 'Design UX', description: 'Création interfaces utilisateur', status: 'published' },
        { title: 'Audit SEO', description: 'Analyse référencement naturel', status: 'draft' },
    ],

    // Projects / Tasks
    projects: [
        { title: 'Refonte Site Web', description: 'Redesign complet du site corporate', status: 'in_progress' },
        { title: 'App Mobile v2', description: 'Nouvelle version application mobile', status: 'planning' },
        { title: 'Migration Cloud', description: 'Migration infrastructure vers AWS', status: 'completed' },
        { title: 'CRM Integration', description: 'Intégration système CRM', status: 'in_progress' },
        { title: 'Formation Équipe', description: 'Sessions de formation interne', status: 'pending' },
    ],

    // Generic fallback
    default: [
        { title: 'Élément Demo 1', description: 'Description de démonstration', status: 'active' },
        { title: 'Élément Demo 2', description: 'Autre élément de test', status: 'draft' },
        { title: 'Élément Demo 3', description: 'Troisième élément', status: 'active' },
        { title: 'Élément Demo 4', description: 'Quatrième élément', status: 'pending' },
        { title: 'Élément Demo 5', description: 'Cinquième élément', status: 'completed' },
    ]
};

// Generate random custom field values
function generateCustomFieldValue(field) {
    const type = field.type || 'string';

    switch (type) {
        case 'string':
        case 'text':
            return `Valeur demo pour ${field.label || field.name}`;

        case 'number':
            const min = field.type_config?.min || 0;
            const max = field.type_config?.max || 1000;
            return Math.floor(Math.random() * (max - min + 1)) + min;

        case 'boolean':
            return Math.random() > 0.5;

        case 'date':
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 365));
            return date;

        case 'select':
            const options = field.type_config?.options || [];
            return options.length > 0 ? options[Math.floor(Math.random() * options.length)] : null;

        case 'email':
            return `demo${Math.floor(Math.random() * 1000)}@example.com`;

        case 'phone':
            return `+33 6 ${Math.floor(10000000 + Math.random() * 90000000)}`;

        case 'url':
            return `https://example.com/demo/${Math.floor(Math.random() * 1000)}`;

        case 'money':
        case 'currency':
            return Math.floor(Math.random() * 10000) / 100;

        default:
            return `Demo ${field.name}`;
    }
}

async function seedEntity(tenantDb, entity, count = 5) {
    console.log(`\n📦 Seeding entity: ${entity.name} (${entity.slug})`);

    // Get field templates for this entity
    const fields = await FieldTemplate.find({
        _id: { $in: entity.customFields || [] }
    });

    console.log(`   Found ${fields.length} custom fields`);

    // Select appropriate demo data template
    const templateKey = Object.keys(demoDataTemplates).find(key =>
        entity.slug.toLowerCase().includes(key) ||
        entity.name.toLowerCase().includes(key)
    ) || 'default';

    const templates = demoDataTemplates[templateKey];
    console.log(`   Using template: ${templateKey}`);

    const records = [];

    for (let i = 0; i < count; i++) {
        const template = templates[i % templates.length];

        // Build custom field values
        const customFields = fields.map(field => ({
            field_id: field._id,
            value: generateCustomFieldValue(field)
        }));

        const record = {
            entityId: entity._id,
            spaces: entity.spaces || [],
            folders: entity.folders || [],
            title: template.title,
            description: template.description,
            status: template.status || 'draft',
            order: i,
            customFields: customFields,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        records.push(record);
    }

    // Insert records
    const RecordModel = tenantDb.model('Record', Record.schema);
    const result = await RecordModel.insertMany(records);

    console.log(`   ✅ Created ${result.length} records`);
    return result.length;
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length < 1) {
        console.log('Usage: node scripts/seed-demo-data.js <account_number> [entity_slug] [count]');
        console.log('');
        console.log('Examples:');
        console.log('  node scripts/seed-demo-data.js 12345');
        console.log('  node scripts/seed-demo-data.js 12345 contacts');
        console.log('  node scripts/seed-demo-data.js 12345 contacts 10');
        process.exit(1);
    }

    const accountNumber = args[0];
    const targetSlug = args[1] || null;
    const recordCount = parseInt(args[2]) || 5;

    console.log('🌱 Starting seed process...');
    console.log(`   Account: ${accountNumber}`);
    console.log(`   Target: ${targetSlug || 'all entities'}`);
    console.log(`   Records per entity: ${recordCount}`);

    try {
        // Connect to global DB
        await mongoose.connect(config.globalDbUri);
        console.log('✅ Connected to global database');

        // Connect to tenant DB
        const tenantDbUri = `${config.uri}saas_app_rb_${accountNumber}`;
        const tenantDb = mongoose.createConnection(tenantDbUri);
        console.log(`✅ Connected to tenant database: saas_app_rb_${accountNumber}`);

        // Find entities
        const EntityModel = tenantDb.model('Entity', Entity.schema);
        const FieldTemplateModel = tenantDb.model('FieldTemplate', FieldTemplate.schema);

        let query = {};
        if (targetSlug) {
            query.slug = targetSlug;
        }

        const entities = await EntityModel.find(query);

        if (entities.length === 0) {
            console.log('❌ No entities found');
            if (targetSlug) {
                console.log(`   Make sure entity with slug "${targetSlug}" exists`);
            }
            process.exit(1);
        }

        console.log(`\n📋 Found ${entities.length} entities to seed`);

        let totalRecords = 0;

        for (const entity of entities) {
            const count = await seedEntity(tenantDb, entity, recordCount);
            totalRecords += count;
        }

        console.log('\n' + '='.repeat(50));
        console.log(`✅ Seed completed! Created ${totalRecords} records total`);
        console.log('='.repeat(50));

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

main();
