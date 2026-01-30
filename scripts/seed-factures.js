/**
 * Seed Script - Créer 25 factures démo
 * 
 * Usage: node scripts/seed-factures.js <account_number>
 */

const mongoose = require('mongoose');
const path = require('path');
const config = require('../config/db');

// Users data from datatable
const users = [
    { name: 'Caroline Jensen', email: 'carolinejensen@zidant.com', phone: '+1 (821) 447-3782' },
    { name: 'Celeste Grant', email: 'celestegrant@polarax.com', phone: '+1 (838) 515-3408' },
    { name: 'Tillman Forbes', email: 'tillmanforbes@manglo.com', phone: '+1 (969) 496-2892' },
    { name: 'Daisy Whitley', email: 'daisywhitley@applideck.com', phone: '+1 (861) 564-2877' },
    { name: 'Weber Bowman', email: 'weberbowman@volax.com', phone: '+1 (962) 466-3483' },
    { name: 'Buckley Townsend', email: 'buckleytownsend@orbaxter.com', phone: '+1 (884) 595-2643' },
    { name: 'Latoya Bradshaw', email: 'latoyabradshaw@opportech.com', phone: '+1 (906) 474-3155' },
    { name: 'Kate Lindsay', email: 'katelindsay@gorganic.com', phone: '+1 (930) 546-2952' },
    { name: 'Marva Sandoval', email: 'marvasandoval@avit.com', phone: '+1 (927) 566-3600' },
    { name: 'Decker Russell', email: 'deckerrussell@quilch.com', phone: '+1 (846) 535-3283' },
    { name: 'Odom Mills', email: 'odommills@memora.com', phone: '+1 (995) 525-3402' },
    { name: 'Sellers Walters', email: 'sellerswalters@zorromop.com', phone: '+1 (830) 430-3157' },
    { name: 'Wendi Powers', email: 'wendipowers@orboid.com', phone: '+1 (863) 457-2088' },
    { name: 'Sophie Horn', email: 'sophiehorn@snorus.com', phone: '+1 (885) 418-3948' },
    { name: 'Levine Rodriquez', email: 'levinerodriquez@xth.com', phone: '+1 (999) 565-3239' },
    { name: 'Little Hatfield', email: 'littlehatfield@comtract.com', phone: '+1 (812) 488-3011' },
    { name: 'Larson Kelly', email: 'larsonkelly@zidant.com', phone: '+1 (892) 484-2162' },
    { name: 'Kendra Molina', email: 'kendramolina@sureplex.com', phone: '+1 (920) 528-3330' },
    { name: 'Ebony Livingston', email: 'ebonylivingston@danja.com', phone: '+1 (970) 591-3039' },
    { name: 'Kaufman Rush', email: 'kaufmanrush@euron.com', phone: '+1 (924) 463-2934' },
    { name: 'Frank Hays', email: 'frankhays@illumity.com', phone: '+1 (930) 577-2670' },
    { name: 'Carmella Mccarty', email: 'carmellamccarty@sybixtex.com', phone: '+1 (876) 456-3218' },
    { name: 'Massey Owen', email: 'masseyowen@zedalis.com', phone: '+1 (917) 567-3786' },
    { name: 'Lottie Lowery', email: 'lottielowery@dyno.com', phone: '+1 (912) 539-3498' },
    { name: 'Addie Luna', email: 'addieluna@multiflex.com', phone: '+1 (962) 537-2981' },
];

const statuses = ['PAID', 'APPROVED', 'FAILED', 'CANCEL', 'SUCCESS', 'PENDING', 'COMPLETE'];

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomStatus() {
    return statuses[Math.floor(Math.random() * statuses.length)];
}

function generateSlug(name) {
    return name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

async function seed() {
    const accountNumber = process.argv[2];

    if (!accountNumber) {
        console.error('❌ Usage: node scripts/seed-factures.js <account_number>');
        process.exit(1);
    }

    try {
        // Connect to main DB
        await mongoose.connect(config.url);
        console.log('✅ Connected to main MongoDB');

        // Connect to tenant DB
        const tenantDbName = `${config.databaseName}_${accountNumber}`;
        const tenantConnection = mongoose.createConnection(config.url.replace(/\/[^\/]*$/, `/${tenantDbName}`));

        console.log(`✅ Connected to tenant DB: ${tenantDbName}`);

        // Get models - use require directly
        const Record = require('../models/record.model');
        const Entity = require('../models/entity.model');

        const RecordModel = tenantConnection.model('Record', Record.schema);
        const EntityModel = tenantConnection.model('Entity', Entity.schema);

        // Find Facture entity
        const entity = await EntityModel.findOne({ slug: 'facture' });
        if (!entity) {
            console.error('❌ Entité "facture" introuvable');
            process.exit(1);
        }

        console.log(`📋 Entité trouvée: ${entity.name} (${entity._id})`);

        // Find custom field IDs (nom, email, telephone)
        const nomField = entity.customFields.find(f => f.toString() === '69727b3fccf73a414a783c23');
        const emailField = entity.customFields.find(f => f.toString() === '6878745fd372aa750c638183');
        const telField = entity.customFields.find(f => f.toString() === '6874aa37444c189ff59f2a13');

        // Delete existing demo records
        const deleted = await RecordModel.deleteMany({
            entityId: entity._id,
            title: { $regex: /^Facture/i }
        });
        console.log(`🗑️  ${deleted.deletedCount} factures demo supprimées`);

        // Create records
        console.log('📝 Création des factures...');
        const records = [];

        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const title = `Facture ${String(i + 1).padStart(4, '0')} - ${user.name}`;
            const slug = generateSlug(title);

            const customFields = [];
            if (nomField) customFields.push({ field_id: '69727b3fccf73a414a783c23', value: user.name });
            if (emailField) customFields.push({ field_id: '6878745fd372aa750c638183', value: user.email });
            if (telField) customFields.push({ field_id: '6874aa37444c189ff59f2a13', value: user.phone });

            const record = new RecordModel({
                entityId: entity._id,
                title: title,
                slug: slug,
                date: new Date(2026, 0, getRandomNumber(1, 30)), // January 2026
                published: true,
                status: getRandomStatus(),
                customFields: customFields
            });

            await record.save();
            records.push(record);
            console.log(`  ✓ ${title}`);
        }

        console.log(`\n🎉 ${records.length} factures créées avec succès!`);
        console.log(`\n📊 Voir: http://localhost:3000/account/${accountNumber}/record/facture/list-view`);

        await tenantConnection.close();
        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

seed();
