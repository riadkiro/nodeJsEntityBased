const mongoose = require('mongoose');
const fs = require('fs');

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_9194');
    const db = mongoose.connection.db;
    const output = [];
    const log = (msg) => { output.push(msg); };

    // 1. Find the Actes entity
    const entity = await db.collection('entities').findOne({ slug: 'actes' });
    if (!entity) { log('ERROR: No Actes entity found!'); fs.writeFileSync('scripts/debug-result.json', JSON.stringify(output, null, 2)); process.exit(1); }
    log('ACTES_ENTITY_ID: ' + entity._id.toString());
    log('ACTES_CUSTOM_FIELDS: ' + JSON.stringify(entity.customFields));

    // 2. FieldTemplates
    const fieldIds = (entity.customFields || []).map(id => {
        try { return new mongoose.Types.ObjectId(id); } catch(e) { return null; }
    }).filter(Boolean);
    const fields = await db.collection('fieldtemplates').find({ _id: { $in: fieldIds } }).toArray();
    log('FIELD_TEMPLATES: ' + JSON.stringify(fields.map(f => ({ _id: f._id.toString(), name: f.name, label: f.label, fieldType: f.fieldType }))));

    // 3. Sample Acte records
    const records = await db.collection('records').find({ entityId: entity._id }).limit(3).toArray();
    for (const r of records) {
        const cfData = (r.customFields || []).map(cf => {
            const fieldId = cf.field_id?.toString();
            const match = fields.find(f => f._id.toString() === fieldId);
            return { field_id: fieldId, name: match?.name || 'UNKNOWN', label: match?.label || 'UNKNOWN', value: cf.value };
        });
        log('ACTE_RECORD: ' + JSON.stringify({ title: r.title, customFields: cfData, lineDefaults: r.lineDefaults }));
    }

    // 4. LineSchemas
    const lineSchemas = await db.collection('lineschemas').find({}).toArray();
    for (const ls of lineSchemas) {
        log('LINE_SCHEMA: ' + JSON.stringify({ _id: ls._id.toString(), name: ls.name, columns: (ls.columns||[]).map(c => ({ key: c.key, label: c.label, type: c.type })), catalog: ls.catalog }));
    }

    // 5. DynamicTable widget configs - check all entities with widgets
    const allEntities = await db.collection('entities').find({}).toArray();
    for (const ent of allEntities) {
        if (ent.widgets) {
            for (const w of ent.widgets) {
                if (w.type === 'dynamic-table' || w.type === 'dynamicTable') {
                    log('WIDGET_ON_ENTITY: ' + JSON.stringify({ entity: ent.slug, widget: w }));
                }
            }
        }
    }
    
    // 6. Check record widgets
    const allRecords = await db.collection('records').find({ widgets: { $exists: true, $ne: [] } }).limit(5).toArray();
    for (const r of allRecords) {
        for (const w of (r.widgets || [])) {
            if (w.type === 'dynamic-table' || w.type === 'dynamicTable') {
                log('WIDGET_ON_RECORD: ' + JSON.stringify({ recordTitle: r.title, recordId: r._id.toString(), widget: w }));
            }
        }
    }

    // 7. Check widgetconfigs collection
    const widgetConfigs = await db.collection('widgetconfigs').find({}).toArray();
    for (const wc of widgetConfigs) {
        if (wc.type === 'dynamic-table' || wc.type === 'dynamicTable') {
            log('WIDGET_CONFIG: ' + JSON.stringify(wc));
        }
    }

    fs.writeFileSync('scripts/debug-result.json', JSON.stringify(output, null, 2));
    console.log('Done! Check scripts/debug-result.json');
    await mongoose.disconnect();
    process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
