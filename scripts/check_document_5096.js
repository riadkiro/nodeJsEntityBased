const mongoose = require('mongoose');
const path = require('path');

async function checkDocument() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5096', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to MongoDB for saas_app_rb_5096");

        // Require models
        require('../models/document.model');
        require('../models/entity.model');
        const Document = mongoose.model('Document');
        const Entity = mongoose.model('Entity');

        const doc = await Document.findById('6a0b4221f1c5ddd28f737c9f');
        if (doc) {
            console.log("Document Found:");
            console.log(` - ID: ${doc._id}`);
            console.log(` - Name: ${doc.name}`);
            console.log(` - EntityId: ${doc.entityId}`);
            console.log(` - EntityIds: ${JSON.stringify(doc.entityIds)}`);
            console.log(` - LinkedRecords: ${JSON.stringify(doc.linkedRecords)}`);
        } else {
            console.log("Document 6a0b4221f1c5ddd28f737c9f not found.");
        }

        const entities = await Entity.find({});
        console.log("\nAvailable Entities in DB:");
        entities.forEach(ent => {
            console.log(` - Name: ${ent.name}, ID: ${ent._id}, Slug: ${ent.slug}`);
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

checkDocument();
