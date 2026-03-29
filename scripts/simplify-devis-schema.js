const mongoose = require('mongoose');

async function main() {
    const dbs = ['saas_app_rb_7846', 'saas_app_rb_5001', 'saas_app_rb_5756'];
    
    // Columns to HIDE (visible: false) in billing schemas
    const hideKeys = ['description', 'unitPrice', 'vatRate', 'lineTotal', 'lineVat', 'note'];
    // Columns to SHOW (visible: true)
    const showKeys = ['prestation', 'code', 'qty', 'lineTtc'];

    for (const dbName of dbs) {
        try {
            const conn = mongoose.createConnection(`mongodb://127.0.0.1:27017/${dbName}`);
            await new Promise((resolve, reject) => {
                conn.once('open', resolve);
                conn.once('error', reject);
                setTimeout(() => reject(new Error('timeout')), 3000);
            });

            // Find all billing-type schemas (slug contains 'billing' or 'quote')
            const schemas = await conn.db.collection('lineschemas').find({
                $or: [
                    { slug: { $regex: /billing/i } },
                    { slug: { $regex: /quote/i } },
                    { name: { $regex: /devis/i } },
                    { name: { $regex: /facture/i } },
                    { name: { $regex: /actes/i } }
                ]
            }).toArray();

            console.log(`\n[${dbName}] Found ${schemas.length} billing schemas`);

            for (const schema of schemas) {
                console.log(`  Schema: ${schema.name} (${schema._id})`);
                const columns = schema.columns || [];
                let updated = false;

                for (let i = 0; i < columns.length; i++) {
                    const col = columns[i];
                    if (hideKeys.includes(col.key)) {
                        if (col.visible !== false) {
                            columns[i].visible = false;
                            console.log(`    HIDE: ${col.key} (${col.label})`);
                            updated = true;
                        }
                    } else if (showKeys.includes(col.key)) {
                        if (col.visible !== true) {
                            columns[i].visible = true;
                            console.log(`    SHOW: ${col.key} (${col.label})`);
                            updated = true;
                        }
                    }
                }

                if (updated) {
                    await conn.db.collection('lineschemas').updateOne(
                        { _id: schema._id },
                        { $set: { columns: columns } }
                    );
                    console.log(`    ✓ Updated`);
                } else {
                    console.log(`    (no changes needed)`);
                }
            }

            await conn.close();
        } catch (e) {
            console.log(`[${dbName}] Error: ${e.message}`);
        }
    }

    console.log('\nDone');
    process.exit(0);
}

main();
