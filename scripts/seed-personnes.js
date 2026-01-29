/**
 * Seed Script - Créer 50 personnes démo
 * 
 * Usage: node scripts/seed-personnes.js <account_number>
 */

const mongoose = require('mongoose');
const config = require('../config/db');
const Record = require('../models/record.model');

// Prénoms français
const prenoms = [
    'Jean', 'Marie', 'Pierre', 'Sophie', 'Lucas', 'Emma', 'Louis', 'Léa', 'Gabriel', 'Chloé',
    'Raphaël', 'Manon', 'Arthur', 'Camille', 'Hugo', 'Inès', 'Jules', 'Sarah', 'Adam', 'Jade',
    'Mathis', 'Louise', 'Nathan', 'Zoé', 'Thomas', 'Alice', 'Théo', 'Lina', 'Maxime', 'Juliette',
    'Antoine', 'Eva', 'Alexandre', 'Anna', 'Victor', 'Clara', 'Paul', 'Léna', 'Nicolas', 'Laura',
    'Clément', 'Margot', 'Romain', 'Pauline', 'Benjamin', 'Anaïs', 'Julien', 'Charlotte', 'Florian', 'Marine'
];

// Noms de famille français
const noms = [
    'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau',
    'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier',
    'Morel', 'Girard', 'André', 'Lefèvre', 'Mercier', 'Dupont', 'Lambert', 'Bonnet', 'François', 'Martinez',
    'Legrand', 'Garnier', 'Faure', 'Rousseau', 'Blanc', 'Guérin', 'Muller', 'Henry', 'Roussel', 'Nicolas',
    'Perrin', 'Morin', 'Mathieu', 'Clément', 'Gauthier', 'Dumont', 'Lopez', 'Fontaine', 'Chevalier', 'Robin'
];

// Domaines email
const domaines = ['gmail.com', 'yahoo.fr', 'outlook.com', 'orange.fr', 'free.fr', 'hotmail.com', 'laposte.net'];

// Générer un email à partir du nom/prénom
function generateEmail(prenom, nom) {
    const domaine = domaines[Math.floor(Math.random() * domaines.length)];
    const formats = [
        `${prenom.toLowerCase()}.${nom.toLowerCase()}@${domaine}`,
        `${prenom.toLowerCase()}${nom.toLowerCase()}@${domaine}`,
        `${prenom.toLowerCase().charAt(0)}.${nom.toLowerCase()}@${domaine}`,
        `${prenom.toLowerCase()}_${nom.toLowerCase()}@${domaine}`,
    ];
    return formats[Math.floor(Math.random() * formats.length)]
        .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Remove accents
}

// Générer un numéro de téléphone français
function generatePhone() {
    const prefixes = ['06', '07'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    let number = prefix;
    for (let i = 0; i < 4; i++) {
        number += ' ' + String(Math.floor(Math.random() * 100)).padStart(2, '0');
    }
    return number;
}

// IDs des champs personnalisés (fournis par l'utilisateur)
const FIELD_IDS = {
    nom: new mongoose.Types.ObjectId('69727b3fccf73a414a783c23'),
    email: new mongoose.Types.ObjectId('6878745fd372aa750c638183'),
    telephone: new mongoose.Types.ObjectId('6874aa37444c189ff59f2a13')
};

async function main() {
    const args = process.argv.slice(2);

    if (args.length < 1) {
        console.log('Usage: node scripts/seed-personnes.js <account_number> [entity_id]');
        console.log('');
        console.log('Example:');
        console.log('  node scripts/seed-personnes.js 12345');
        console.log('  node scripts/seed-personnes.js 12345 6878745fd372aa750c638183');
        process.exit(1);
    }

    const accountNumber = args[0];
    const entityId = args[1] || null;

    console.log('🌱 Création de 50 personnes démo...');
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

        // Find entity if not provided
        let targetEntityId = entityId;
        if (!targetEntityId) {
            // Try to find "personne" or similar entity
            const Entity = require('../models/entity.model');
            const EntityModel = tenantDb.model('Entity', Entity.schema);
            const entity = await EntityModel.findOne({
                $or: [
                    { slug: { $regex: /personne/i } },
                    { slug: { $regex: /contact/i } },
                    { name: { $regex: /personne/i } },
                    { name: { $regex: /contact/i } }
                ]
            });

            if (entity) {
                targetEntityId = entity._id;
                console.log(`   Found entity: ${entity.name} (${entity._id})`);
            } else {
                console.log('❌ No entity found. Please provide entity ID as second argument.');
                console.log('   Example: node scripts/seed-personnes.js 12345 <entity_id>');
                process.exit(1);
            }
        }

        const records = [];
        const usedCombinations = new Set();

        for (let i = 0; i < 50; i++) {
            let prenom, nom, fullName;

            // Ensure unique combinations
            do {
                prenom = prenoms[Math.floor(Math.random() * prenoms.length)];
                nom = noms[Math.floor(Math.random() * noms.length)];
                fullName = `${prenom} ${nom}`;
            } while (usedCombinations.has(fullName));

            usedCombinations.add(fullName);

            const email = generateEmail(prenom, nom);
            const phone = generatePhone();

            const record = {
                entityId: new mongoose.Types.ObjectId(targetEntityId),
                title: fullName,
                status: 'active',
                order: i,
                customFields: [
                    { field_id: FIELD_IDS.nom, value: fullName },
                    { field_id: FIELD_IDS.email, value: email },
                    { field_id: FIELD_IDS.telephone, value: phone }
                ],
                createdAt: new Date(),
                updatedAt: new Date()
            };

            records.push(record);
            console.log(`   ${i + 1}. ${fullName} | ${email} | ${phone}`);
        }

        // Insert all records
        const result = await RecordModel.insertMany(records);

        console.log('\n' + '='.repeat(60));
        console.log(`✅ Créé ${result.length} personnes avec succès !`);
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
