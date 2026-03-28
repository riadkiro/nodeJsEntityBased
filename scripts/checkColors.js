const mongoose = require('mongoose');

async function test() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_9194');
    const entities = await mongoose.connection.db.collection('entities').find({}, {projection: {name:1, color:1}}).toArray();
    console.log(entities);
    mongoose.disconnect();
}
test();
