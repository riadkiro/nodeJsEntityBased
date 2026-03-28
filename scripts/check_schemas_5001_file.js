const mongoose = require('mongoose');
const fs = require('fs');

mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5001').then(async () => {
    try {
        let out = '';
        const Entity = mongoose.connection.collection('entities');
        const LineSchema = mongoose.connection.collection('lineschemas');
        const Record = mongoose.connection.collection('records'); 

        const consEntry = await Entity.findOne({ name: 'Consultations' }) || await Entity.findOne({ name: 'Consultation' });
        out += 'Consultation Entity (5001): ' + (consEntry ? consEntry._id : 'Not found') + '\n';

        if (consEntry) {
            const schemas = await LineSchema.find({ entityId: consEntry._id }).toArray();
            out += '\nSchemas for Consultation (5001):\n';
            schemas.forEach(s => {
                out += `- ID: ${s._id}, Name: ${s.name}\n`;
            });
        }
        
        const tramadol = await Record.findOne({ title: /Tramadol/i, entityId: { $ne: null } });
        if (tramadol) {
            out += '\nTramadol 50mg (5001) lineDefaults:\n';
            out += JSON.stringify(tramadol.lineDefaults, null, 2) + '\n';
            out += 'Tramadol title: ' + tramadol.title + '\n';
        } else {
            out += '\nTramadol not found in 5001 records.\n';
        }

        fs.writeFileSync('c:/Users/pc/Documents/nodeJsProject/tmp/schemas_out_5001.txt', out);
        console.log('Done writing');

    } catch(e) {
        console.log(e);
    }
    process.exit();
});
