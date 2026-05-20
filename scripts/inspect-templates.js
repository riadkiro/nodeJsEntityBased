const mongoose = require('mongoose');

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5096');
    const db = mongoose.connection.useDb('saas_app_rb_5096'); 
    const Document = db.model('Document', require('../models/document.model.js').schema);
    const SmartDocTemplate = db.model('SmartDocTemplate', require('../models/smart-doc-template.model.js').schema);

    const templates = await Document.find({ isTemplate: true }).lean();
    console.log("=== TEMPLATES ===");
    for (const t of templates) {
        console.log(`ID: ${t._id}, Name: ${t.name}, EntityId: ${t.entityId}, EntityIds: ${JSON.stringify(t.entityIds)}`);
    }

    const smartTemplates = await SmartDocTemplate.find({}).lean();
    console.log("=== SMART TEMPLATES ===");
    for (const st of smartTemplates) {
        console.log(`ID: ${st._id}, Name: ${st.name}, DocumentId: ${st.documentId}, EntityId: ${st.entityId}`);
    }

    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
