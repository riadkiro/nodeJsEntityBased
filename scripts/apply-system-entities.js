/**
 * Apply system entities to an existing account
 * Usage: node scripts/apply-system-entities.js <account_number>
 */
const mongoose = require('mongoose');
const config = require('../config/db');
const { ensureSystemEntities } = require('../utils/system-entities');

async function main() {
    const accountNumber = process.argv[2];
    if (!accountNumber) {
        console.log('Usage: node scripts/apply-system-entities.js <account_number>');
        process.exit(1);
    }

    console.log(`🌱 Applying system entities to account ${accountNumber}...`);

    await mongoose.connect(config.globalDbUri);
    const dbUrl = `${config.uri}saas_app_rb_${accountNumber}`;
    const tenantDb = mongoose.createConnection(dbUrl);
    await new Promise(r => tenantDb.once('open', r));

    await ensureSystemEntities(tenantDb);

    await tenantDb.close();
    await mongoose.disconnect();
    console.log('✅ Done!');
    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
