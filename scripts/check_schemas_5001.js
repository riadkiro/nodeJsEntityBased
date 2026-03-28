const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5001').then(async () => {
    try {
        const Entity = mongoose.connection.collection('entities');
        const LineSchema = mongoose.connection.collection('lineschemas');
        const Record = mongoose.connection.collection('records'); // to find Tramadol defaults

        // Find Consultation entity
        const consEntry = await Entity.findOne({ name: 'Consultations' }) || await Entity.findOne({ name: 'Consultation' });
        console.log('Consultation Entity (5001):', consEntry ? consEntry._id : 'Not found');

        if (consEntry) {
            const schemas = await LineSchema.find({ entityId: consEntry._id }).toArray();
            console.log('\nSchemas for Consultation (5001):');
            schemas.forEach(s => {
                console.log(`- ID: ${s._id}, Name: ${s.name}`);
            });
        }
        
        // Find Tramadol
        const tramadol = await Record.findOne({ title: /Tramadol/i, entityId: { $ne: null } });
        if (tramadol) {
            console.log('\nTramadol 50mg (5001) lineDefaults:');
            console.log(JSON.stringify(tramadol.lineDefaults, null, 2));
        } else {
            console.log('\nTramadol not found in 5001 records.');
        }

    } catch(e) {
        console.log(e);
    }
    process.exit();
});
