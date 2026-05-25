const mongoose = require('mongoose');
const { tenantCollection } = require('./middleware/tenant');

// Mock request object for tenant middleware
const req = { account_number: '5001' }; // Assuming default account number from context

async function checkData() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/dexapp', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to MongoDB");

        const Space = await tenantCollection(req, "Space");
        const Folder = await tenantCollection(req, "Folder");
        const Entity = await tenantCollection(req, "Entity");

        const spaces = await Space.find({});
        console.log(`Spaces found: ${spaces.length}`);
        spaces.forEach(s => console.log(` - Space: ${s.name} (${s._id})`));

        const folders = await Folder.find({});
        console.log(`Folders found: ${folders.length}`);

        const entities = await Entity.find({});
        console.log(`Entities found: ${entities.length}`);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

checkData();
