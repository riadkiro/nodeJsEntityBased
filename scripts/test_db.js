const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_9194').then(async () => {
    try {
        const records = await mongoose.connection.collection('records').find({
            lineDefaults: { $exists: true, $not: { $size: 0 } }
        }).toArray();
        const fs = require('fs');
        let out = 'Records with defaults in 9194:\n';
        records.forEach(r => {
            out += `- ${r.title}: ${JSON.stringify(r.lineDefaults)}\n`;
        });
        fs.writeFileSync('tmp/db_defaults.txt', out);
        console.log('Wrote to tmp/db_defaults.txt');
    } catch(e) {
        console.log(e);
    }
    process.exit();
});
