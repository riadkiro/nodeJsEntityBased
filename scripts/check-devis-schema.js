const mongoose = require('mongoose');
const fs = require('fs');

async function main() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_7846');
    await new Promise(r => conn.once('open', r));

    // Find entity "Consultation" record to get widget config
    const consultationEntity = await conn.db.collection('entities').findOne({ name: 'Consultation' });
    console.log('Consultation entity:', consultationEntity._id);

    // Get the entity form (widget config)
    const entityForms = await conn.db.collection('entityforms').find({ 
        entityId: consultationEntity._id 
    }).toArray();

    const output = { entityForms: [] };
    for (const form of entityForms) {
        const widgets = [];
        for (const tab of (form.tabs || [])) {
            for (const row of (tab.rows || [])) {
                for (const col of (row.columns || [])) {
                    for (const w of (col.widgets || [])) {
                        if (w.type === 'dynamic-table') {
                            widgets.push({
                                tabLabel: tab.label,
                                widgetType: w.type,
                                config: w.config
                            });
                        }
                    }
                }
            }
        }
        output.entityForms.push({
            id: String(form._id),
            name: form.name,
            dynamicTableWidgets: widgets
        });
    }

    // Also check line schemas that apply to Consultation
    const lineSchemas = await conn.db.collection('lineschemas').find({
        'appliesTo.entityIds': consultationEntity._id
    }).toArray();
    
    output.lineSchemas = lineSchemas.map(ls => ({
        id: String(ls._id),
        name: ls.name,
        slug: ls.slug,
        columns: (ls.columns || []).map(c => `${c.key}:${c.label}:${c.type}:visible=${c.visible}`),
        totals: ls.totals || null
    }));

    fs.writeFileSync('scripts/devis-schema-output.json', JSON.stringify(output, null, 2), 'utf8');
    console.log('Done');
    await conn.close();
    process.exit(0);
}

main();
