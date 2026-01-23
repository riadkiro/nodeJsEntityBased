const mongoose = require('mongoose');
const dbConfig = require('./config/db');
const SpaceSchema = require('./models/space.model').schema;
const FolderSchema = require('./models/folder.model').schema;
const EntitySchema = require('./models/entity.model').schema;

async function check() {
    const tenantId = '5001';
    const dbUrl = `${dbConfig.uri}saas_app_rb_${tenantId}`;
    console.log("Checking:", dbUrl);

    try {
        const connection = await mongoose.createConnection(dbUrl);
        const SpaceModel = connection.model('Space', SpaceSchema);
        const FolderModel = connection.model('Folder', FolderSchema);
        const EntityModel = connection.model('Entity', EntitySchema);

        const spaces = await SpaceModel.find({});
        console.log("Spaces:", spaces.length);
        spaces.forEach(s => console.log(` - Space: ${s.name} (${s._id})`));

        const folders = await FolderModel.find({});
        console.log("Folders:", folders.length);
        folders.forEach(f => {
            console.log(` - Folder: ${f.name} (Spaces: ${f.spaces}) (Parents: ${f.parentFolders})`);
        });

        const entities = await EntityModel.find({});
        console.log("Entities:", entities.length);
        entities.forEach(e => {
            console.log(` - Entity: ${e.name} (Spaces: ${e.spaces}) (Folders: ${e.folders})`);
        });

        await connection.close();
    } catch (e) {
        console.error(e);
    }
    process.exit();
}

check();
