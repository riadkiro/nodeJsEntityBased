const mongoose = require('mongoose');
const fs = require('fs');
async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_9194');
    let cols = [];
    const sch = await mongoose.connection.db.collection('lineschemas').findOne({_id: new mongoose.Types.ObjectId("69c232cd0fa7abd357abd677")});
    if (!sch) {
       const sch2 = await mongoose.connection.db.collection('lineschemas').findOne({name: /Traitement/i});
       cols = sch2.columns;
    } else {
       cols = sch.columns;
    }
    fs.writeFileSync('tmp-traitement-cols.json', JSON.stringify(cols, null, 2), 'utf8');
    process.exit(0);
}
run();
