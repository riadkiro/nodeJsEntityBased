const mongoose = require('mongoose');
const path = require('path');
const config = require(path.join(__dirname, '..', 'config', 'db'));

async function verify() {
    await mongoose.connect(config.globalDbUri);
    const cn = mongoose.createConnection(config.uri + 'saas_app_rb_5001');
    await new Promise(r => cn.once('open', r));

    const col = cn.db.collection('lineschemas');
    const all = await col.find({}).toArray();

    const fs = require('fs');
    fs.writeFileSync('C:/tmp/verify.json', JSON.stringify(all.map(s => ({
        slug: s.slug,
        appliesTo: s.appliesTo
    })), null, 2));

    console.log('Written to C:/tmp/verify.json');

    await cn.close();
    await mongoose.connection.close();
    process.exit(0);
}

verify().catch(e => { console.error(e); process.exit(1); });
