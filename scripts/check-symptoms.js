const mongoose = require('mongoose');
const fs = require('fs');

async function check() {
    try {
        await mongoose.connect('mongodb://localhost:27017/saas_app_rb_9194?directConnection=true');
        const db = mongoose.connection.db;
        const e = await db.collection('entities').findOne({ name: { $regex: /consultation/i } });
        
        fs.writeFileSync('scripts/symptoms_output.json', JSON.stringify(e, null, 2));
    } catch (err) {
        fs.writeFileSync('scripts/symptoms_error.txt', err.stack);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}
check();
