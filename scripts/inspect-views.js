const mongoose = require('mongoose');

async function main() {
  const dbName = 'saas_app_rb_5096';
  const uri = `mongodb://127.0.0.1:27017/${dbName}`;
  const conn = mongoose.createConnection(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  await new Promise(r => conn.once('open', r));
  console.log('Connected to', dbName);

  const docs = await conn.db.collection('views').find({}).toArray();
  console.log(`\n=== COLLECTION: views (Count: ${docs.length}) ===`);
  docs.forEach(doc => {
    console.log(JSON.stringify({
      _id: doc._id,
      name: doc.name,
      slug: doc.slug,
      entity: doc.entity,
      viewType: doc.viewType,
      spaces: doc.spaces,
      folders: doc.folders,
      order: doc.order
    }, null, 2));
  });

  await conn.close();
}

main().catch(console.error);
