const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5001').then(async () => {
    const Entity = mongoose.connection.db.collection('entities');
    const note = await Entity.findOne({ $or: [{ slug: 'note' }, { slug: 'notes' }] });
    console.log('Entity:', JSON.stringify({
        _id: note?._id, name: note?.name, slug: note?.slug,
        classifications: note?.classifications,
        statusClassification: note?.statusClassification
    }, null, 2));

    const Record = mongoose.connection.db.collection('records');
    if (note) {
        const count = await Record.countDocuments({ entityId: note._id });
        console.log('Records count:', count);
        const sample = await Record.findOne({ entityId: note._id });
        console.log('Sample record keys:', Object.keys(sample || {}));
        console.log('Sample title:', sample?.title);
        console.log('Sample description:', sample?.description?.substring(0, 100));
        console.log('Sample classificationValues:', JSON.stringify(sample?.classificationValues));
        console.log('Sample customFields:', JSON.stringify(sample?.customFields));
    }

    // Also check classifications linked to note entity
    if (note?.classifications?.length) {
        const Classification = mongoose.connection.db.collection('classifications');
        const clsList = await Classification.find({ _id: { $in: note.classifications } }).toArray();
        clsList.forEach(c => {
            console.log(`Classification: ${c.name} (${c.key}) - options:`, c.options?.map(o => o.label));
        });
    }

    process.exit(0);
});
