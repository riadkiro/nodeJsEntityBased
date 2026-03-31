const mongoose = require('mongoose');
require('dotenv').config();

async function inspect() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5001');
        const Entity = mongoose.model('Entity', new mongoose.Schema({}, { strict: false }));
        const consultation = await Entity.findOneAndUpdate(
            { slug: 'consultations' },
            { $set: { enableAttachments: true, showAttachments: true } },
            { new: true }
        );
        if (consultation) {
            console.log('Entity: consultations updated');
            console.log('enableAttachments:', consultation.get('enableAttachments'));
        } else {
            console.log('Entity not found');
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
inspect();
