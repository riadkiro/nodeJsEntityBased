const mongoose = require('mongoose');
const { tenantCollection } = require('./middleware/tenant');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to global DB');
  const req = { account_number: '5096' };
  const FieldTemplate = await tenantCollection(req, "FieldTemplate");
  
  try {
    const f = new FieldTemplate({
      name: 'test_custom_field_' + Date.now(),
      label: 'Test',
      type: 'string',
      category: 'custom'
    });
    await f.save();
    console.log('Saved successfully!', f);
  } catch (err) {
    console.error('Validation error:', err.message);
  }
  process.exit(0);
}

test();
