const mongoose = require('mongoose');
const fs = require('fs');

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_9194');
    const db = mongoose.connection.db;
    
    const Consultation = await db.collection('entities').findOne({slug: 'consultations'});
    const view = await db.collection('views').findOne({ entity: Consultation._id, type: 'form' });
    fs.writeFileSync('tmp-form-9194.json', JSON.stringify(view, null, 2), 'utf8');
    
    const pageView = await db.collection('views').findOne({ entity: Consultation._id, type: 'page' });
    fs.writeFileSync('tmp-page-9194.json', JSON.stringify(pageView, null, 2), 'utf8');

    const board = await db.collection('boards').findOne();
    fs.writeFileSync('tmp-board.json', JSON.stringify(board, null, 2), 'utf8');
    
    console.log('Done 9194 views.');
    process.exit(0);
}

run().catch(console.error);
