/**
 * Update billing line schemas to use the new flexible totals format
 * Adds totals.rows array to all Devis/Facture schemas
 */
const mongoose = require('mongoose')

const DATABASES = [
    'saas_app_rb_7846',
    'saas_app_rb_5001',
    'saas_app_rb_5756'
]

const BILLING_NAMES = [
    'Devis',
    'Lignes Actes (Base)',
    'Lignes de Facture',
    'Facture Standard'
]

async function run() {
    for (const dbName of DATABASES) {
        console.log(`\n═══ ${dbName} ═══`)
        const conn = mongoose.createConnection(`mongodb://127.0.0.1:27017/${dbName}`)
        await new Promise(r => conn.once('open', r))

        const LineSchema = conn.model('LineSchema_update', new mongoose.Schema({}, { strict: false }), 'lineschemas')

        const schemas = await LineSchema.find({
            name: { $in: BILLING_NAMES }
        }).lean()

        for (const schema of schemas) {
            const totalsRows = [
                { label: 'Total HT', key: 'lineTotal', type: 'sum' },
                { label: 'TVA', key: 'lineVat', type: 'sum' },
                { label: 'Total TTC', key: 'lineTtc', type: 'sum', isFinal: true }
            ]

            await LineSchema.updateOne(
                { _id: schema._id },
                {
                    $set: {
                        'totals.rows': totalsRows,
                        // Keep legacy keys for backward compat
                        'totals.subtotalKey': 'lineTotal',
                        'totals.vatKey': 'lineVat'
                    }
                }
            )
            console.log(`  ✓ Updated ${schema.name} → totals.rows (${totalsRows.length} rows)`)
        }

        if (schemas.length === 0) {
            console.log('  No billing schemas found')
        }

        await conn.close()
    }
    console.log('\nDone!')
    process.exit(0)
}

run().catch(e => { console.error(e); process.exit(1) })
