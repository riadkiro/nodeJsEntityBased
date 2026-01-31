---
trigger: always_on
---

When you create controllers always remeber this structure for multi-tenant, this is a saas plateform
const Entity = await tenantCollection(req, "Entity");
const Record = await tenantCollection(req, "Record");