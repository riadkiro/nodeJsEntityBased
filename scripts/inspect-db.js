const mongoose = require('mongoose');

async function main() {
  const dbName = 'saas_app_rb_5096';
  const uri = `mongodb://127.0.0.1:27017/${dbName}`;
  const conn = mongoose.createConnection(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  await new Promise(r => conn.once('open', r));
  console.log('Connected to', dbName);

  const collections = ['environments', 'spaces', 'folders', 'entities'];
  for (const name of collections) {
    const docs = await conn.db.collection(name).find({}).toArray();
    console.log(`\n=== COLLECTION: ${name} (Count: ${docs.length}) ===`);
    docs.forEach(doc => {
      console.log(JSON.stringify({
        _id: doc._id,
        id: doc.id,
        name: doc.name,
        type: doc.type,
        environmentId: doc.environmentId,
        spaceId: doc.spaceId,
        parentId: doc.parentId,
        parentType: doc.parentType,
        order: doc.order,
        link: doc.link
      }, null, 2));
    });
  }

  await conn.close();
}

main().catch(console.error);
