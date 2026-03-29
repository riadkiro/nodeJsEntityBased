/**
 * Debug: Check what's stored in UserPreferences for gridColumnWidths
 */
const mongoose = require('mongoose')

async function run() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_7846')
    await new Promise(r => conn.once('open', r))

    const UP = conn.model('UP_check', new mongoose.Schema({}, { strict: false }), 'userpreferences')

    // Find all docs with gridColumnWidths
    const allDocs = await UP.find({}).lean()
    console.log(`Total UserPreferences docs: ${allDocs.length}`)

    for (const doc of allDocs) {
        const hasGrid = doc.preferences?.gridColumnWidths
        console.log(`  viewId: ${doc.viewId}, userId: ${doc.userId}, hasGridColumnWidths: ${!!hasGrid}`)
        if (hasGrid) {
            console.log('  gridColumnWidths:', JSON.stringify(hasGrid, null, 2))
        }
    }

    // Find our test doc
    const testDoc = await UP.findOne({ viewId: 'dynamic-table:test123' }).lean()
    if (testDoc) {
        console.log('\nTest doc found:', JSON.stringify(testDoc.preferences, null, 2))
    } else {
        console.log('\nTest doc NOT found')
    }

    await conn.close()
    process.exit(0)
}

run().catch(e => { console.error(e); process.exit(1) })
