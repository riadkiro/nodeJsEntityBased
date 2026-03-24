const mongoose = require('mongoose');
const path = require('path');
const dbConfig = require(path.join(__dirname, '../config/db'));

async function fixAllEntitiesWidgets() {
    const accountId = '9194';
    const dbUrl = `${dbConfig.uri}saas_app_rb_${accountId}`;
    const conn = await mongoose.createConnection(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
    
    await new Promise((resolve) => conn.once('open', resolve));

    const entities = await conn.db.collection('entities').find({}).toArray();
    console.log(`Checking ${entities.length} entities...`);

    for (const ent of entities) {
        let changed = false;
        if (ent.sidebarWidgets && ent.sidebarWidgets.length > 0) {
            ent.sidebarWidgets.forEach((w, index) => {
                if (!w._id) {
                    w._id = new mongoose.Types.ObjectId();
                    console.log(`[${ent.slug}] Added ID ${w._id} to widget "${w.label}"`);
                    changed = true;
                }
            });
        }
        
        if (changed) {
            await conn.db.collection('entities').updateOne(
                { _id: ent._id },
                { $set: { sidebarWidgets: ent.sidebarWidgets } }
            );
            console.log(`[${ent.slug}] Saved changes`);
        }
    }
    
    await conn.close();
}

fixAllEntitiesWidgets().catch(console.error);
