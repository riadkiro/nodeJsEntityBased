const mongoose = require('mongoose');
const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
conn.once('open', async () => {
    const e = await conn.db.collection('entities').findOne({ name: /patient/i });
    console.log('slug:', e.slug);
    console.log('name:', e.name);
    conn.close();
});
