const mongoose = require('mongoose');
const dbConfig = require('./config/db');
const SpaceSchema = require('./models/space.model').schema;

async function check() {
    // Check Tenant DB
    const tenantId = '5001';
    const dbUrl = `${dbConfig.uri}saas_app_rb_${tenantId}`;
    console.log("Checking Tenant DB:", dbUrl);
    try {
        const connection = await mongoose.createConnection(dbUrl);
        const SpaceModel = connection.model('Space', SpaceSchema);
        const spaces = await SpaceModel.find({});
        console.log("Spaces in Tenant DB:", spaces.length);
        await connection.close();
    } catch (e) { console.error(e); }

    // Check Global DB
    console.log("Checking Global DB:", dbConfig.globalDbUri);
    try {
        const connection = await mongoose.createConnection(dbConfig.globalDbUri);
        const SpaceModel = connection.model('Space', SpaceSchema);
        const spaces = await SpaceModel.find({});
        console.log("Spaces in Global DB:", spaces.length);
        await connection.close();
    } catch (e) { console.error(e); }

    process.exit();
}

check();
