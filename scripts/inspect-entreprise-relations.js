const mongoose = require('mongoose');

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    const Entity = mongoose.model('Entity', new mongoose.Schema({}, { strict: false }));

    const ent = await Entity.findOne({ slug: 'entreprises' }).lean();
    console.log('=== ENTREPRISE ENTITY ===');
    console.log('ID:', ent._id);
    console.log('Slug:', ent.slug);
    console.log('Relations:', JSON.stringify(ent.relations, null, 2));

    await mongoose.connection.close();
}

run().catch(console.error);
