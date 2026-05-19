const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function fixNames() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/saas_app_rb_5096');
        const db = mongoose.connection.useDb('saas_app_rb_5096'); 
        
        const templates = await db.collection('smartdoctemplates').find({}).toArray();
        let updatedCount = 0;

        for (const t of templates) {
            if (t.documentId) {
                const doc = await db.collection('documents').findOne({ _id: new mongoose.Types.ObjectId(t.documentId) });
                if (doc && doc.name !== t.name) {
                    await db.collection('smartdoctemplates').updateOne(
                        { _id: t._id },
                        { $set: { name: doc.name } }
                    );
                    console.log(`Updated template ${t._id} name from "${t.name}" to "${doc.name}"`);
                    updatedCount++;
                }
            }
        }
        console.log(`Fixed ${updatedCount} template names.`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
fixNames();
