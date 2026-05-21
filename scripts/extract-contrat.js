const mongoose = require('mongoose');

async function main() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5096');
        console.log('Connected to MongoDB');
        
        // Find document with _id = '6a0b4221f1c5ddd28f737c9f' or ObjectId('6a0b4221f1c5ddd28f737c9f')
        const docId = '6a0b4221f1c5ddd28f737c9f';
        const doc = await mongoose.connection.db.collection('documents').findOne({
            $or: [
                { _id: docId },
                { _id: new mongoose.Types.ObjectId(docId) }
            ]
        });
        
        if (!doc) {
            console.error('Document not found!');
            process.exit(1);
        }
        
        console.log('Document found:', doc.name);
        console.log('JSON of pages:');
        console.log(JSON.stringify(doc.pages, null, 2));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

main();
