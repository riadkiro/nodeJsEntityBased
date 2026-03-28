const mongoose = require('mongoose');
const fs = require('fs');
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_9194');
    const sch = await mongoose.connection.db.collection('lineschemas').findOne({
        _id: new mongoose.Types.ObjectId('69c232cd0fa7abd357abd677')
    });
    const item = await mongoose.connection.db.collection('catalogitems').findOne({
        title: /Doliprane 1000/
    });
    const data = { schema: sch, doliprane: item };
    fs.writeFileSync('schema_dump.json', JSON.stringify(data, null, 2));
    process.exit(0);
}
main();
