// fetch over the wire
fetch('http://localhost:3000/account/9194/api/catalog-search?entityId=69c232cd0fa7abd357abd65e&q=Dol&searchFields=title')
  .then(r => r.json())
  .then(data => {
      console.log("Count:", data.data.length);
      data.data.forEach(item => {
          console.log(`-- Item: ${item.title}`);
          console.log(`   _id: ${item._id}`);
          console.log(`   lineDefaults count: ${item.lineDefaults?.length || 0}`);
          if (item.lineDefaults?.length > 0) {
              console.log(`   schemaId: ${item.lineDefaults[0].schemaId}`);
              console.log(`   defaults: `, item.lineDefaults[0].defaults);
          }
      });
  })
  .catch(console.error);
