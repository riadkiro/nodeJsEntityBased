const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/saas_app_rb_5096');
        const db = mongoose.connection.useDb('saas_app_rb_5096'); 
        
        const templates = await db.collection('smartdoctemplates').find({ scopeRecordId: '6a0b4221f1c5ddd28f737c98' }).toArray();
        console.log('Templates for record 98:', templates.map(t => ({ id: t._id, name: t.name, docId: t.documentId })));
        
        const docIds = templates.map(t => new mongoose.Types.ObjectId(t.documentId));
        const docs = await db.collection('documents').find({ _id: { $in: docIds } }).toArray();
        console.log('Docs found:', docs.map(d => ({ id: d._id, name: d.name, isTemplate: d.isTemplate, createdBy: d.createdBy })));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
