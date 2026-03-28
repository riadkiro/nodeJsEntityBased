const mongoose = require('mongoose');
async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_9194');
    const sch = await mongoose.connection.db.collection('lineschemas').findOne({_id: new mongoose.Types.ObjectId("69c232cd0fa7abd357abd677")});
    if (!sch) {
       console.log('Not found by obj id, trying string');
       const sch2 = await mongoose.connection.db.collection('lineschemas').findOne({name: /Traitement/i});
       console.log(JSON.stringify(sch2.columns, null, 2));
    } else {
       console.log(JSON.stringify(sch.columns, null, 2));
    }
    process.exit(0);
}
run();
