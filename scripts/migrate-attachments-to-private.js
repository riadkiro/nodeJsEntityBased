/**
 * Migration Script: Move attachments from public/ to private_uploads/
 * 
 * This script:
 * 1. Scans all tenant DBs for records with attachments
 * 2. For each attachment with a filename that does NOT contain "/" (old-style flat name):
 *    a. Moves the physical file from public/uploads/attachments/<account>/<file>
 *       to private_uploads/attachments/<account>/<uuid>/<file>
 *    b. Updates the DB record's attachment.filename to "<uuid>/<file>"
 * 3. Attachments that already contain "/" are assumed to be migrated already
 * 
 * Run: node scripts/migrate-attachments-to-private.js
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const PROJECT_ROOT = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public', 'uploads', 'attachments');
const PRIVATE_DIR = path.join(PROJECT_ROOT, 'private_uploads', 'attachments');

// All known account numbers — we scan the public directory to discover them
async function discoverAccounts() {
    if (!fs.existsSync(PUBLIC_DIR)) return [];
    return fs.readdirSync(PUBLIC_DIR).filter(name => {
        const full = path.join(PUBLIC_DIR, name);
        return fs.statSync(full).isDirectory();
    });
}

async function migrateAccount(accountNumber) {
    const dbName = `saas_app_rb_${accountNumber}`;
    console.log(`\n--- Migrating account ${accountNumber} (${dbName}) ---`);
    
    const conn = mongoose.createConnection(`mongodb://127.0.0.1:27017/${dbName}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    
    await new Promise((resolve, reject) => {
        conn.once('open', resolve);
        conn.once('error', reject);
    });

    const recordsCollection = conn.db.collection('records');
    const cursor = recordsCollection.find(
        { 'attachments.0': { $exists: true } },
        { projection: { attachments: 1 } }
    );

    let totalMoved = 0;
    let totalSkipped = 0;
    let totalMissing = 0;

    while (await cursor.hasNext()) {
        const record = await cursor.next();
        if (!record.attachments || record.attachments.length === 0) continue;

        let modified = false;
        const updatedAttachments = record.attachments.map(att => {
            // Already migrated (has UUID subfolder path)
            if (att.filename && att.filename.includes('/')) {
                totalSkipped++;
                return att;
            }

            const oldFilename = att.filename;
            if (!oldFilename) {
                totalSkipped++;
                return att;
            }

            const srcPath = path.join(PUBLIC_DIR, accountNumber, oldFilename);
            
            if (!fs.existsSync(srcPath)) {
                totalMissing++;
                console.log(`  ⚠ Missing: ${oldFilename}`);
                // Still update the DB path so the download route can find it
                // (file is already gone, but we normalize the schema)
                return att;
            }

            // Create UUID subfolder
            const uuid = crypto.randomUUID
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            const destDir = path.join(PRIVATE_DIR, accountNumber, uuid);
            fs.mkdirSync(destDir, { recursive: true });

            const destPath = path.join(destDir, oldFilename);
            
            // Copy then delete (safer than rename across drives)
            fs.copyFileSync(srcPath, destPath);
            fs.unlinkSync(srcPath);

            att.filename = `${uuid}/${oldFilename}`;
            modified = true;
            totalMoved++;
            return att;
        });

        if (modified) {
            await recordsCollection.updateOne(
                { _id: record._id },
                { $set: { attachments: updatedAttachments } }
            );
        }
    }

    await conn.close();
    console.log(`  ✅ Moved: ${totalMoved} | Skipped: ${totalSkipped} | Missing: ${totalMissing}`);
}

async function main() {
    console.log('=== Attachment Migration: public → private_uploads ===');
    console.log(`Source: ${PUBLIC_DIR}`);
    console.log(`Dest:   ${PRIVATE_DIR}`);

    const accounts = await discoverAccounts();
    if (accounts.length === 0) {
        console.log('\nNo accounts found in public/uploads/attachments/. Nothing to migrate.');
        return;
    }

    console.log(`\nFound ${accounts.length} account(s): ${accounts.join(', ')}`);

    for (const account of accounts) {
        await migrateAccount(account);
    }

    console.log('\n=== Migration complete ===');
    process.exit(0);
}

main().catch(err => {
    console.error('Migration error:', err);
    process.exit(1);
});
