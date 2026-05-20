const mongoose = require('mongoose');

async function main() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5096');
        console.log('Connected!');
        
        const docId = '6a0d4afbb7e23b5b93217d71';
        console.log('Searching for document:', docId);
        
        const doc = await mongoose.connection.db.collection('documents').findOne({ _id: new mongoose.Types.ObjectId(docId) });
        if (!doc) {
            console.log('Document not found!');
        } else {
            console.log('Document found:');
            console.log({
                _id: doc._id,
                name: doc.name,
                isDraft: doc.isDraft,
                draftRecordId: doc.draftRecordId,
                linkedRecords: doc.linkedRecords,
                status: doc.status,
                format: doc.format,
                orientation: doc.orientation
            });
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
}

main();
