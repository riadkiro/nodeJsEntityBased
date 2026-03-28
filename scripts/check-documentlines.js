const mongoose = require('mongoose');
const fs = require('fs');

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_9194');
    
    // Find all document lines for the consultation
    const lines = await mongoose.connection.db.collection('documentlines').find({
        documentId: new mongoose.Types.ObjectId('69c232ce0fa7abd357abd6f3')
    }).toArray();

    fs.writeFileSync('documentlines.json', JSON.stringify(lines, null, 2));
    process.exit(0);
}
main();
