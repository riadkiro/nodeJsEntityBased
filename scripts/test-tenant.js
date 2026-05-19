const mongoose = require('mongoose');
const { tenantCollection } = require('../middleware/tenant');
require('dotenv').config({ path: '../.env' });

async function test() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/saas_app_rb_5096');
    const req = { account_number: '5096' };
    const FieldTemplate = await tenantCollection(req, 'FieldTemplate');
    console.log('FieldTemplate:', FieldTemplate ? 'Exists' : 'Null');
    process.exit(0);
}
test();
