const mongoose = require('mongoose');
const fs = require('fs');

mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_9194').then(async () => {
    try {
        let out = '';
        const Entity = mongoose.connection.collection('entities');
        const LineSchema = mongoose.connection.collection('lineschemas');

        // Find Consultation entity
        const consEntry = await Entity.findOne({ name: 'Consultations' }) || await Entity.findOne({ name: 'Consultation' });
        out += 'Consultation Entity: ' + (consEntry ? consEntry._id : 'Not found') + '\n';

        if (consEntry) {
            const schemas = await LineSchema.find({ entityId: consEntry._id }).toArray();
            out += '\nSchemas for Consultation:\n';
            schemas.forEach(s => {
                out += `- ID: ${s._id}, Name: ${s.name}, TargetEntity: ${s.columns.find(c => c.type === 'relation')?.config?.targetEntity}\n`;
            });
        }
        
        const specificSchema = await LineSchema.findOne({ _id: new mongoose.Types.ObjectId('69c232cd0fa7abd357abd677') });
        out += '\nSpecific Schema (from Tramadol defaults):\n';
        if (specificSchema) {
            out += `ID: ${specificSchema._id}, Name: ${specificSchema.name}, EntityId: ${specificSchema.entityId}\n`;
        } else {
            out += 'Not found as ObjectId.\n';
        }
        
        fs.writeFileSync('c:/Users/pc/Documents/nodeJsProject/tmp/schemas_out.txt', out);
        console.log('Done writing');

    } catch(e) {
        console.log(e);
    }
    process.exit();
});
