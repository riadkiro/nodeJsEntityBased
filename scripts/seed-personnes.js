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

// Villes françaises avec codes postaux
const villes = [
    { ville: 'Paris', code: '75001' }, { ville: 'Marseille', code: '13001' }, { ville: 'Lyon', code: '69001' },
    { ville: 'Toulouse', code: '31000' }, { ville: 'Nice', code: '06000' }, { ville: 'Nantes', code: '44000' },
    { ville: 'Strasbourg', code: '67000' }, { ville: 'Montpellier', code: '34000' }, { ville: 'Bordeaux', code: '33000' },
    { ville: 'Lille', code: '59000' }, { ville: 'Rennes', code: '35000' }, { ville: 'Reims', code: '51100' },
    { ville: 'Saint-Étienne', code: '42000' }, { ville: 'Toulon', code: '83000' }, { ville: 'Grenoble', code: '38000' }
];

// Types de rues
const rues = ['Rue', 'Avenue', 'Boulevard', 'Place', 'Impasse', 'Allée', 'Chemin'];
const nomsRues = ['de la Paix', 'Victor Hugo', 'Jean Jaurès', 'du Général de Gaulle', 'de la Liberté', 'des Fleurs', 'du Moulin', 'de la Gare', 'du Château', 'des Écoles'];

// Genres
const genres = ['Homme', 'Femme'];

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

// Images de profil disponibles (profile-1.jpeg à profile-34.jpeg)
const PROFILE_IMAGES = Array.from({ length: 34 }, (_, i) => `/assets/images/profile-${i + 1}.jpeg`);

// Générer une image de profil aléatoire
function getRandomProfileImage() {
    return PROFILE_IMAGES[Math.floor(Math.random() * PROFILE_IMAGES.length)];
}

// IDs des champs personnalisés pour l'entity "Personne" (account 5001)
const FIELD_IDS = {
    nom: new mongoose.Types.ObjectId('697dad0651a0e3777df61fac'),
    prenom: new mongoose.Types.ObjectId('697dad0651a0e3777df61fad'),
    nom_complet: new mongoose.Types.ObjectId('697dad0651a0e3777df61fae'),
    email: new mongoose.Types.ObjectId('697dad0651a0e3777df61faf'),
    telephone: new mongoose.Types.ObjectId('697dad0651a0e3777df61fb0'),
    mobile: new mongoose.Types.ObjectId('697dad0651a0e3777df61fb1'),
    adresse: new mongoose.Types.ObjectId('697dad0651a0e3777df61fb2'),
    ville: new mongoose.Types.ObjectId('697dad0651a0e3777df61fb3'),
    code_postal: new mongoose.Types.ObjectId('697dad0651a0e3777df61fb4'),
    pays: new mongoose.Types.ObjectId('697dad0651a0e3777df61fb5'),
    genre: new mongoose.Types.ObjectId('697dad0651a0e3777df61fb6')
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
            const mobile = generatePhone();
            const image = getRandomProfileImage();

            // Location data
            const location = villes[Math.floor(Math.random() * villes.length)];
            const numRue = Math.floor(Math.random() * 150) + 1;
            const typeRue = rues[Math.floor(Math.random() * rues.length)];
            const nomRue = nomsRues[Math.floor(Math.random() * nomsRues.length)];
            const adresse = `${numRue} ${typeRue} ${nomRue}`;
            const genre = genres[Math.floor(Math.random() * genres.length)];

            const record = {
                entityId: new mongoose.Types.ObjectId(targetEntityId),
                title: fullName,
                image: image,
                status: 'active',
                order: i,
                customFields: [
                    { field_id: FIELD_IDS.nom, value: nom },
                    { field_id: FIELD_IDS.prenom, value: prenom },
                    { field_id: FIELD_IDS.nom_complet, value: fullName },
                    { field_id: FIELD_IDS.email, value: email },
                    { field_id: FIELD_IDS.telephone, value: phone },
                    { field_id: FIELD_IDS.mobile, value: mobile },
                    { field_id: FIELD_IDS.adresse, value: adresse },
                    { field_id: FIELD_IDS.ville, value: location.ville },
                    { field_id: FIELD_IDS.code_postal, value: location.code },
                    { field_id: FIELD_IDS.pays, value: 'France' },
                    { field_id: FIELD_IDS.genre, value: genre }
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
