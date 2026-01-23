const mongoose = require('mongoose');
const dbConfig = require('./config/db');
const FolderSchema = require('./models/folder.model').schema;
const SpaceSchema = require('./models/space.model').schema;

async function testCreateFolder() {
    const tenantId = '5001';
    const dbUrl = `${dbConfig.uri}saas_app_rb_${tenantId}`;
    console.log("Connecting to:", dbUrl);

    try {
        const connection = await mongoose.createConnection(dbUrl);
        const Folder = connection.model('Folder', FolderSchema);
        const Space = connection.model('Space', SpaceSchema);

        const space = await Space.findOne({ name: 'CRM' });
        if (!space) {
            console.log("Space CRM not found");
            return;
        }

        const newFolder = new Folder({
            name: 'Test Folder 1',
            slug: 'test-folder-1-' + Date.now(),
            spaces: [space._id]
        });

        await newFolder.save();
        console.log("Folder created:", newFolder.name, "ID:", newFolder._id);

        await connection.close();
    } catch (e) {
        console.error(e);
    }
    process.exit();
}

testCreateFolder();
