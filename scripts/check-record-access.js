const mongoose = require('mongoose');

async function check() {
    const conn = await mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_9194', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    
    const RecordAccessSchema = require('../models/record-access.model').schema;
    const RecordAccess = conn.model('RecordAccess', RecordAccessSchema);
    
    const access = await RecordAccess.findOne({ recordId: '6a04e0f67b394b4558fdb6e3' }).lean();
    console.log('Record Access for Mohamed EL MAHI:');
    console.log('Grants:', JSON.stringify(access?.grants || [], null, 2));
    console.log('Pending Invites:', JSON.stringify(access?.pendingInvites || [], null, 2));
    
    await conn.close();
    process.exit(0);
}

check().catch(err => { console.error(err); process.exit(1); });
