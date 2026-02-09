const mongoose = require('mongoose');
const config = require('../config/db');

async function fix() {
    const conn = mongoose.createConnection(config.uri + 'saas_app_rb_5001');
    const LineSchema = conn.model('LineSchema', require('../models/line-schema.model').schema);

    // Update treatment column targetEntity
    const result = await LineSchema.updateOne(
        { slug: 'prescription_v1', 'columns.key': 'treatment' },
        {
            $set: {
                'columns.$.config': {
                    targetEntity: '697c21384b70c78bbe2e8732',
                    searchFields: ['title'],
                    displayFields: ['title'],
                    applyDefaults: { description: 'title' }
                }
            }
        }
    );
    console.log('Update result:', JSON.stringify(result));

    // Verify  
    const updated = await LineSchema.findOne({ slug: 'prescription_v1' }).lean();
    const col = updated.columns.find(c => c.key === 'treatment');
    console.log('Treatment config after update:', JSON.stringify(col.config));

    await conn.close();
    process.exit(0);
}

fix().catch(e => { console.error(e); process.exit(1); });
