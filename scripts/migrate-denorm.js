/**
 * Migrate Denormalization Fields
 * 
 * Backfills computedTitle, classificationValues.label/color, and _denorm.relations
 * for all existing records.
 * 
 * Features:
 * - Idempotent (safe to re-run)
 * - Batched (processes 100 records at a time)
 * - Incremental (only processes records without computedTitle)
 * - Multi-tenant aware
 * 
 * Usage: node scripts/migrate-denorm.js [tenantId]
 * Example: node scripts/migrate-denorm.js 5001
 */

const mongoose = require('mongoose');
const path = require('path');

// Load ALL models to avoid MissingSchemaError for any ref
const fs = require('fs');
const modelsDir = path.join(__dirname, '..', 'models');
fs.readdirSync(modelsDir)
    .filter(f => f.endsWith('.model.js'))
    .forEach(f => { try { require(path.join(modelsDir, f)); } catch (e) { /* skip */ } });

const denormService = require(path.join(__dirname, '..', 'services', 'record-denorm.service'));

const BATCH_SIZE = 100;
const MONGO_URI = 'mongodb://127.0.0.1:27017';

async function migrateDatabase(dbName) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`  Migrating database: ${dbName}`);
    console.log(`${'='.repeat(60)}`);

    const conn = await mongoose.createConnection(`${MONGO_URI}/${dbName}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    await new Promise((resolve, reject) => {
        conn.once('open', resolve);
        conn.once('error', reject);
    });

    // Register all models on this connection
    const modelNames = mongoose.modelNames();
    for (const name of modelNames) {
        if (!conn.models[name]) {
            conn.model(name, mongoose.model(name).schema);
        }
    }

    const RecordModel = conn.model('Record');
    const EntityModel = conn.model('Entity');

    // Get all entities
    const entities = await EntityModel.find({})
        .populate('classifications')
        .populate('statusClassification')
        .lean();

    console.log(`  Found ${entities.length} entities`);

    let totalProcessed = 0;
    let totalUpdated = 0;

    for (const entity of entities) {
        // Find un-migrated records for this entity
        const count = await RecordModel.countDocuments({
            entityId: entity._id,
            computedTitle: { $exists: false }
        });

        if (count === 0) {
            console.log(`  [${entity.name || entity.slug}] — All records already migrated ✓`);
            continue;
        }

        console.log(`  [${entity.name || entity.slug}] — ${count} records to migrate`);

        let processed = 0;

        while (processed < count) {
            const records = await RecordModel.find({
                entityId: entity._id,
                computedTitle: { $exists: false }
            })
                .select('_id title date description slug customFields relations classificationValues')
                .populate({ path: 'customFields.field_id', select: 'label fieldType' })
                .limit(BATCH_SIZE)
                .lean();

            if (records.length === 0) break;

            const bulkOps = [];

            for (const record of records) {
                try {
                    const denorm = await denormService.computeDenorm(
                        record, entity, RecordModel, EntityModel
                    );

                    bulkOps.push({
                        updateOne: {
                            filter: { _id: record._id },
                            update: {
                                $set: {
                                    computedTitle: denorm.computedTitle,
                                    classificationValues: denorm.classificationValues,
                                    '_denorm.relations': denorm._denorm.relations
                                }
                            }
                        }
                    });
                } catch (err) {
                    console.error(`    Error processing record ${record._id}: ${err.message}`);
                }
            }

            if (bulkOps.length > 0) {
                const result = await RecordModel.bulkWrite(bulkOps, { ordered: false });
                totalUpdated += result.modifiedCount || 0;
            }

            processed += records.length;
            totalProcessed += records.length;
            process.stdout.write(`    Processed ${processed}/${count}\r`);
        }

        console.log(`    Processed ${processed}/${count} ✓`);
    }

    console.log(`\n  Total: ${totalProcessed} processed, ${totalUpdated} updated`);
    await conn.close();
}

async function main() {
    const tenantId = process.argv[2];

    if (tenantId) {
        // Single tenant
        await migrateDatabase(`saas_app_rb_${tenantId}`);
    } else {
        // All tenant databases
        const adminConn = await mongoose.createConnection(`${MONGO_URI}/admin`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        await new Promise(resolve => adminConn.once('open', resolve));

        const adminDb = adminConn.db.admin();
        const { databases } = await adminDb.listDatabases();
        const tenantDbs = databases
            .map(db => db.name)
            .filter(name => name.startsWith('saas_app_rb_'));

        console.log(`Found ${tenantDbs.length} tenant database(s)`);

        for (const dbName of tenantDbs) {
            await migrateDatabase(dbName);
        }

        await adminConn.close();
    }

    console.log('\n✅ Migration complete!');
    process.exit(0);
}

main().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
