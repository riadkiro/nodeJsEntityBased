const mongoose = require('mongoose');
const { tenantCollection } = require('./middleware/tenant');

// Mock request object for tenant middleware
const req = { account_number: '5001' };

async function checkData() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/cyberbox');
        console.log("Connected to MongoDB");

        // Wait a bit for connection to stabilize
        await new Promise(resolve => setTimeout(resolve, 1000));

        const Space = await tenantCollection(req, "Space");
        const spaces = await Space.find({});
        console.log(`Spaces found: ${spaces.length}`);

        if (spaces.length > 0) {
            spaces.forEach(s => console.log(` - Space: ${s.name}`));
        } else {
            console.log("No spaces found. This explains why the sidebar is empty.");
        }

    } catch (error) {
        console.error("Error checking DB:", error);
    } finally {
        await mongoose.disconnect();
    }
}

checkData();
