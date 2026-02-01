const mongoose = require('mongoose');
const config = require('../config/db');

async function fix() {
    await mongoose.connect(config.uri + 'saas_app_rb_5001');

    // Fix entity statusClassification to point to Progression (not Tags)
    const result = await mongoose.connection.collection('entities').updateOne(
        { _id: new mongoose.Types.ObjectId('6974fa513c65b095a571fb68') },
        { $set: { statusClassification: new mongoose.Types.ObjectId('697e0010000000000000010a') } }
    );

    console.log('Updated:', result.modifiedCount);

    // Verify
    const entity = await mongoose.connection.collection('entities').findOne(
        { _id: new mongoose.Types.ObjectId('6974fa513c65b095a571fb68') }
    );
    console.log('New statusClassification:', entity.statusClassification);

    // Also verify the Progression classification exists
    const cls = await mongoose.connection.collection('classifications').findOne(
        { _id: new mongoose.Types.ObjectId('697e0010000000000000010a') }
    );
    console.log('Progression classification:', cls ? cls.name : 'NOT FOUND');
    console.log('Options:', cls?.options?.map(o => ({ _id: o._id, label: o.label })));

    process.exit(0);
}

fix();
