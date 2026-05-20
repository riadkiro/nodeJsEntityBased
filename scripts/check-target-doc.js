const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5096');
        console.log('Connected to MongoDB');
        
        // Find document schema dynamic collection
        const db = mongoose.connection.db;
        const documents = await db.collection('documents').find({ _id: new mongoose.Types.ObjectId('6a0d4afbb7e23b5b93217d71') }).toArray();
        
        console.log('DOCUMENT:');
        console.log(JSON.stringify(documents, null, 4));
        
        await mongoose.connection.close();
    } catch (e) {
        console.error('Error:', e);
    }
}

run();
