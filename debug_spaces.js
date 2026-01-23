const mongoose = require('mongoose');
const dbConfig = require('./config/db');
const SpaceSchema = require('./models/space.model').schema;

async function check() {
    const tenantId = '5001';
    const dbUrl = `${dbConfig.uri}saas_app_rb_${tenantId}`;
    console.log("Connecting to:", dbUrl);

    try {
        const connection = await mongoose.createConnection(dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const SpaceModel = connection.model('Space', SpaceSchema);
        const spaces = await SpaceModel.find({});
        console.log("Spaces in DB:", spaces.length);
        spaces.forEach(s => console.log(`- ${s.name} (${s._id})`));

        await connection.close();
    } catch (e) {
        console.error(e);
    }
    process.exit();
}

check();
