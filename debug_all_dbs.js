const mongoose = require('mongoose');
const dbConfig = require('./config/db');
const SpaceSchema = require('./models/space.model').schema;

async function check() {
    const dbs = ['saas_app_rb_5001', 'saas_app_5001', 'saasDemo'];
    for (const dbName of dbs) {
        const dbUrl = `${dbConfig.uri}${dbName}`;
        console.log(`Checking ${dbUrl}...`);
        try {
            const connection = await mongoose.createConnection(dbUrl);
            const SpaceModel = connection.model('Space', SpaceSchema);
            const count = await SpaceModel.countDocuments();
            console.log(` -> Found ${count} spaces`);
            await connection.close();
        } catch (e) { console.log(` -> Error: ${e.message}`); }
    }
    process.exit();
}
check();
