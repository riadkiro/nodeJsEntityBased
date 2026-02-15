const mongoose = require('mongoose');

async function main() {
    const conn = await mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001').asPromise();

    // Get entity
    const entity = await conn.db.collection('entities').findOne({ slug: 'consultation' });
    const statusClsId = entity.statusClassification;

    // Get the classification
    const cls = await conn.db.collection('classifications').findOne({ _id: statusClsId });

    console.log('=== RAW classification from DB ===');
    console.log('Classification _id:', cls._id.toString());
    console.log('Options:');
    cls.options.forEach((opt, i) => {
        console.log(`  [${i}] _id=${opt._id} id=${opt.id} label=${opt.label}`);
    });

    // Now simulate what the API returns with .lean() and .populate()
    const ClassifSchema = new mongoose.Schema({}, { strict: false, collection: 'classifications' });
    const EntitySchema = new mongoose.Schema({
        statusClassification: { type: mongoose.Schema.Types.ObjectId, ref: 'Classification' }
    }, { strict: false, collection: 'entities' });

    const Classif = conn.model('Classification', ClassifSchema);
    const Entity = conn.model('Entity', EntitySchema);

    const populated = await Entity.findOne({ slug: 'consultation' }).populate('statusClassification').lean();

    console.log('\n=== POPULATED entity.statusClassification (API-like) ===');
    console.log('statusClassification._id:', populated.statusClassification?._id);
    console.log('statusClassification.id:', populated.statusClassification?.id);
    console.log('Options:');
    populated.statusClassification?.options?.forEach((opt, i) => {
        console.log(`  [${i}] _id=${opt._id} id=${opt.id} label=${opt.label} color=${opt.color}`);
    });

    await conn.close();
}

main().catch(err => { console.error(err); process.exit(1); });
