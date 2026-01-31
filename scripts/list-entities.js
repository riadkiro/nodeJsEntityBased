// Script pour lister les entités disponibles
const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5001')
    .then(async () => {
        console.log('✓ Connecté à MongoDB');

        const Entity = mongoose.model('Entity', new mongoose.Schema({}, { strict: false }), 'entities');
        const entities = await Entity.find({}, 'name slug');

        console.log('\n📋 Entités disponibles:\n');
        entities.forEach(e => {
            console.log(`  • ${e.name} → slug: "${e.slug}"`);
        });

        console.log('\n💡 URL de test pour le datatable:');
        entities.forEach(e => {
            console.log(`  http://localhost:3000/account/5001/test-datatable/${e.slug}`);
        });

        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Erreur:', err);
        process.exit(1);
    });
