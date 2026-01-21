const mongoose = require('mongoose');
const FieldTemplate = require('../models/field-template.model');

// Switch to 'saas_' prefix as per middleware convention
const dbName = 'saas_app_rb_5001';
const uri = `mongodb://127.0.0.1:27017/${dbName}`;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log(`Connected to ${dbName}`);
        const templates = await FieldTemplate.find({});
        console.log(`Found ${templates.length} templates.`);

        templates.forEach(t => {
            console.log(`- ${t.name} (Type: ${t.type}, Subtype: ${t.subtype}): htmlTemplate length = ${t.htmlTemplate ? t.htmlTemplate.length : 0}`);
            if (!t.htmlTemplate || t.htmlTemplate.length === 0) {
                console.log(`  [MISSING HTML TEMPLATE]`);
            }
        });
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection failed:', err);
        process.exit(1);
    });
