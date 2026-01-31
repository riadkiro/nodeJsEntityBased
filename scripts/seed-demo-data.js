/**
 * Seed Script - Créer des personnes démo à partir du datatable de démonstration
 * 
 * Usage: node scripts/seed-demo-data.js <account_number> <entity_id>
 */

const mongoose = require('mongoose');
const config = require('../config/db');
const Record = require('../models/record.model');

// Données extraites du demo datatable
const demoPersons = [
    { id: 1, name: 'Caroline Jensen', email: 'carolinejensen@zidant.com', age: 39, phone: '+1 (821) 447-3782' },
    { id: 2, name: 'Celeste Grant', email: 'celestegrant@polarax.com', age: 32, phone: '+1 (838) 515-3408' },
    { id: 3, name: 'Tillman Forbes', email: 'tillmanforbes@manglo.com', age: 26, phone: '+1 (969) 496-2892' },
    { id: 4, name: 'Daisy Whitley', email: 'daisywhitley@applideck.com', age: 21, phone: '+1 (861) 564-2877' },
    { id: 5, name: 'Weber Bowman', email: 'weberbowman@volax.com', age: 26, phone: '+1 (962) 466-3483' },
    { id: 6, name: 'Buckley Townsend', email: 'buckleytownsend@orbaxter.com', age: 40, phone: '+1 (884) 595-2643' },
    { id: 7, name: 'Latoya Bradshaw', email: 'latoyabradshaw@opportech.com', age: 24, phone: '+1 (906) 474-3155' },
    { id: 8, name: 'Kate Lindsay', email: 'katelindsay@gorganic.com', age: 24, phone: '+1 (930) 546-2952' },
    { id: 9, name: 'Marva Sandoval', email: 'marvasandoval@avit.com', age: 28, phone: '+1 (927) 566-3600' },
    { id: 10, name: 'Decker Russell', email: 'deckerrussell@quilch.com', age: 27, phone: '+1 (846) 535-3283' },
    { id: 11, name: 'Odom Mills', email: 'odommills@memora.com', age: 34, phone: '+1 (995) 525-3402' },
    { id: 12, name: 'Sellers Walters', email: 'sellerswalters@zorromop.com', age: 28, phone: '+1 (830) 430-3157' },
    { id: 13, name: 'Wendi Powers', email: 'wendipowers@orboid.com', age: 31, phone: '+1 (863) 457-2088' },
    { id: 14, name: 'Sophie Horn', email: 'sophiehorn@snorus.com', age: 22, phone: '+1 (885) 418-3948' },
    { id: 15, name: 'Levine Rodriquez', email: 'levinerodriquez@xth.com', age: 27, phone: '+1 (999) 565-3239' },
    { id: 16, name: 'Little Hatfield', email: 'littlehatfield@comtract.com', age: 33, phone: '+1 (812) 488-3011' },
    { id: 17, name: 'Larson Kelly', email: 'larsonkelly@zidant.com', age: 20, phone: '+1 (892) 484-2162' },
    { id: 18, name: 'Kendra Molina', email: 'kendramolina@sureplex.com', age: 31, phone: '+1 (920) 528-3330' },
    { id: 19, name: 'Ebony Livingston', email: 'ebonylivingston@danja.com', age: 33, phone: '+1 (970) 591-3039' },
    { id: 20, name: 'Kaufman Rush', email: 'kaufmanrush@euron.com', age: 39, phone: '+1 (924) 463-2934' },
    { id: 21, name: 'Frank Hays', email: 'frankhays@illumity.com', age: 31, phone: '+1 (930) 577-2670' },
    { id: 22, name: 'Carmella Mccarty', email: 'carmellamccarty@sybixtex.com', age: 21, phone: '+1 (876) 456-3218' },
    { id: 23, name: 'Massey Owen', email: 'masseyowen@zedalis.com', age: 40, phone: '+1 (917) 567-3786' },
    { id: 24, name: 'Lottie Lowery', email: 'lottielowery@dyno.com', age: 36, phone: '+1 (912) 539-3498' },
    { id: 25, name: 'Addie Luna', email: 'addieluna@multiflex.com', age: 32, phone: '+1 (962) 537-2981' }
];

// IDs des champs personnalisés (à ajuster selon votre configuration)
// Vous devrez remplacer ces IDs par les vôtres
const FIELD_IDS = {
    nom: new mongoose.Types.ObjectId('69727b3fccf73a414a783c23'),       // Champ "nom"
    email: new mongoose.Types.ObjectId('6878745fd372aa750c638183'),     // Champ "email"
    telephone: new mongoose.Types.ObjectId('6874aa37444c189ff59f2a13'), // Champ "telephone"
    age: new mongoose.Types.ObjectId('000000000000000000000002')         // Champ "age" (à créer si nécessaire)
};

async function main() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.log('Usage: node scripts/seed-demo-data.js <account_number> <entity_id>');
        console.log('');
        console.log('Example:');
        console.log('  node scripts/seed-demo-data.js 5001 697cc1dfc202fdaf7ada715c');
        process.exit(1);
    }

    const accountNumber = args[0];
    const entityId = args[1];

    console.log('🌱 Création des personnes démo du datatable...');
    console.log(`   Account: ${accountNumber}`);
    console.log(`   Entity ID: ${entityId}`);

    try {
        // Connexion à la DB de l'account
        const tenantDbUrl = config.getDatabaseUrl(accountNumber);
        const tenantDb = await mongoose.createConnection(tenantDbUrl).asPromise();
        console.log(`✓ Connexion établie à la DB de l'account ${accountNumber}`);

        // Utiliser le modèle avec la connexion du tenant
        const TenantRecord = tenantDb.model('Record', Record.schema);

        let createdCount = 0;

        for (const person of demoPersons) {
            try {
                const recordData = {
                    title: person.name,
                    entity_id: new mongoose.Types.ObjectId(entityId),
                    account_number: accountNumber,
                    custom_fields: [
                        {
                            field_id: FIELD_IDS.nom,
                            value: person.name
                        },
                        {
                            field_id: FIELD_IDS.email,
                            value: person.email
                        },
                        {
                            field_id: FIELD_IDS.telephone,
                            value: person.phone
                        },
                        {
                            field_id: FIELD_IDS.age,
                            value: person.age
                        }
                    ]
                };

                const record = new TenantRecord(recordData);
                await record.save();
                createdCount++;
                console.log(`  ✓ ${person.name} créé`);
            } catch (err) {
                console.error(`  ✗ Erreur lors de la création de ${person.name}:`, err.message);
            }
        }

        console.log('');
        console.log(`✅ ${createdCount}/${demoPersons.length} personnes créées avec succès !`);

        // Fermer la connexion
        await tenantDb.close();
        console.log('✓ Connexion fermée');
        process.exit(0);

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

main();
