---
trigger: always_on
---

When you create controllers always remeber this structure for multi-tenant, this is a saas plateform
const Entity = await tenantCollection(req, "Entity");
const Record = await tenantCollection(req, "Record");

# Database Backup & Restore

## Backup Location
`C:\Users\pc\Documents\mongodb_backup_2026-02-10`

Format: JSON files per collection, organized by database folder (saas_app_rb_5001, saasDemo, etc.)

## Restore (Node.js script)
```js
// Restore a specific collection from backup
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function restore(dbName, collectionName) {
    const conn = mongoose.createConnection(`mongodb://127.0.0.1:27017/${dbName}`);
    await new Promise(r => conn.once('open', r));
    const data = JSON.parse(fs.readFileSync(
        path.join('C:/Users/pc/Documents/mongodb_backup_2026-02-10', dbName, collectionName + '.json')
    ));
    if (data.length > 0) {
        await conn.db.collection(collectionName).deleteMany({});
        await conn.db.collection(collectionName).insertMany(data);
        console.log(`Restored ${data.length} docs to ${dbName}/${collectionName}`);
    }
    await conn.close();
}
// Usage: restore('saas_app_rb_5001', 'records')
```