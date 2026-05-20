const mongoose = require('mongoose');

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5096?directConnection=true');
    console.log('Connected to saas_app_rb_5096');

    const entityIds = [
        '6a0b4221f1c5ddd28f737c83',
        '6a0b4221f1c5ddd28f737c82',
        '6a0b4221f1c5ddd28f737c84'
    ];

    const Entity = mongoose.connection.collection('entities');
    const entities = await Entity.find({ _id: { $in: entityIds.map(id => new mongoose.Types.ObjectId(id)) } }).toArray();

    entities.forEach(e => {
        console.log(`\nEntity: ${e.name} (Slug: ${e.slug}, ID: ${e._id.toString()})`);
        console.log('Relations:', JSON.stringify(e.relations, null, 2));
    });

    await mongoose.disconnect();
}

main().catch(console.error);
