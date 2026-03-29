/**
 * seed-app-presets.js
 * =============================================
 * Preset registry + Factory Reset orchestrator
 * Stores preset list in GLOBAL DB (saasDemo)
 * On install: wipes tagged tenant data, re-seeds
 * =============================================
 */
const mongoose = require('mongoose');

// ============================================
// Preset definitions
// ============================================
const PRESETS = [
    {
        slug: 'cabinet-medical',
        name: 'Cabinet Medical',
        description: 'Configuration complete pour un cabinet medical : patients, consultations, prescriptions, facturation, planning, stock et documents.',
        icon: 'solar:stethoscope-bold-duotone',
        color: '#00ab55',
        category: 'Sante',
        features: [
            '13 entites metier (Patient, Consultation, Prescription...)',
            '10+ modeles de documents (Ordonnance, Certificat...)',
            'Donnees de demonstration realistes',
            'Navigation structuree par activite',
            'Classifications metier (Statuts, Types...)',
            'Lignes de prescription & facturation'
        ],
        seedModule: './seed-cabinet-medical',
        isComplete: true
    },
    {
        slug: 'cabinet-dentiste',
        name: 'Cabinet Dentiste',
        description: 'Configuration dentaire avec nomenclature des actes, catalogue tarife et TD unique Traitements lie aux consultations.',
        icon: 'solar:tooth-bold-duotone',
        color: '#0ea5e9',
        category: 'Sante',
        features: [
            'Import actes depuis Nomenclature (code, categorie, tarif, description)',
            'Collection Actes utilisable en catalogue',
            'TD unique Traitements centre sur Consultation',
            'Sidebar dynamique configuree pour le schema principal',
            'Donnees de demonstration installables immediatement'
        ],
        seedModule: './seed-cabinet-dentiste',
        isComplete: true
    },
    {
        slug: 'notaire',
        name: 'Etude Notariale',
        description: 'Configuration de base pour une etude notariale : clients, dossiers, actes, rendez-vous et facturation.',
        icon: 'solar:diploma-verified-bold-duotone',
        color: '#805dca',
        category: 'Juridique',
        features: [
            '7 entites metier (Client, Dossier, Acte...)',
            'Navigation par activite',
            'Donnees de demonstration legeres',
            'Classifications de base'
        ],
        seedModule: './seed-notaire',
        isComplete: false
    }
];

// ============================================
// Global DB: seed preset list
// ============================================
async function seedAppPresets() {
    const globalConn = mongoose.createConnection('mongodb://127.0.0.1:27017/saasDemo');
    await new Promise(r => globalConn.once('open', r));
    console.log('[AppPresets] Connected to global DB');

    const PresetSchema = new mongoose.Schema({
        slug: { type: String, required: true, unique: true },
        name: String,
        description: String,
        icon: String,
        color: String,
        category: String,
        features: [String],
        seedModule: String,
        isComplete: Boolean
    }, { timestamps: true });

    const Preset = globalConn.model('AppPreset', PresetSchema);

    for (const p of PRESETS) {
        await Preset.findOneAndUpdate(
            { slug: p.slug },
            p,
            { upsert: true, new: true }
        );
        console.log(`  ✅ Preset registered: ${p.name}`);
    }

    await globalConn.close();
    console.log('[AppPresets] Presets seeded in global DB');
}

// Collections to PRESERVE during factory reset (user data, auth, profiles)
const PRESERVED_COLLECTIONS = [
    'users',
    'accounts',
    'sessions',
    'userpreferences',
    'user-preferences',
    'accountpreferences',
    'account-preferences',
    'apppresets',
    'system.indexes',
    'system.views'
];

/**
 * Factory Reset: wipe ALL tenant collections except user/profile data
 * This is a true reset — drops every collection that isn't in the preserved list
 */
async function factoryReset(tenantConn) {
    console.log(`\n🧹 ═══ FACTORY RESET — Wiping all tenant data ═══`);

    try {
        // Get all collection names in the tenant DB
        const collections = await tenantConn.db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        console.log(`   Found ${collectionNames.length} collections in tenant DB`);

        let droppedCount = 0;
        for (const collName of collectionNames) {
            // Skip preserved collections
            const normalized = collName.toLowerCase().replace(/[-_]/g, '');
            const isPreserved = PRESERVED_COLLECTIONS.some(p => {
                const pNormalized = p.toLowerCase().replace(/[-_]/g, '');
                return normalized === pNormalized || normalized.startsWith('system.');
            });

            if (isPreserved) {
                console.log(`   🔒 PRESERVED: ${collName}`);
                continue;
            }

            try {
                const coll = tenantConn.db.collection(collName);
                const count = await coll.countDocuments();
                await coll.drop();
                droppedCount++;
                console.log(`   🗑️  DROPPED: ${collName} (${count} docs)`);
            } catch (e) {
                console.log(`   ⚠️  Could not drop ${collName}: ${e.message}`);
            }
        }

        console.log(`\n✅ Factory reset complete: ${droppedCount} collections dropped`);
        console.log(`   Preserved: ${collectionNames.length - droppedCount} collections\n`);
    } catch (err) {
        console.error('❌ Factory reset error:', err);
        throw err;
    }
}

/**
 * Install a preset (factory reset mode)
 * @param {Object} options
 * @param {string} options.tenantDbName - e.g. 'saas_app_rb_9194'
 * @param {string} options.presetSlug - e.g. 'cabinet-medical'
 * @param {string} options.userId - ObjectId string of the user
 * @param {string} [options.mode='factoryReset'] - install mode
 */
async function installPreset({ tenantDbName, presetSlug, userId, mode = 'factoryReset' }) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 Installing preset: ${presetSlug} on ${tenantDbName}`);
    console.log(`   Mode: ${mode}`);
    console.log(`${'='.repeat(60)}\n`);

    // Find preset definition
    const preset = PRESETS.find(p => p.slug === presetSlug);
    if (!preset) throw new Error(`Unknown preset: ${presetSlug}`);

    // Connect to tenant DB
    const tenantConn = mongoose.createConnection(`mongodb://127.0.0.1:27017/${tenantDbName}`);
    await new Promise(r => tenantConn.once('open', r));
    console.log(`Connected to tenant DB: ${tenantDbName}`);

    try {
        // Step 1: Full factory reset — wipe all data except users/profiles
        if (mode === 'factoryReset') {
            await factoryReset(tenantConn);
        }

        // Step 2: Run the seed module (clear require cache to pick up latest code)
        const seedModulePath = require.resolve(preset.seedModule);
        delete require.cache[seedModulePath];
        const seedFn = require(preset.seedModule);
        await seedFn.install(tenantConn, userId, presetSlug);

        console.log(`\n${'='.repeat(60)}`);
        console.log(`🎉 Preset "${preset.name}" installed successfully!`);
        console.log(`${'='.repeat(60)}\n`);
    } finally {
        await tenantConn.close();
    }
}

// ============================================
// Standalone execution
// ============================================
if (require.main === module) {
    (async () => {
        await seedAppPresets();

        // Optional: install cabinet-medical on account 9194
        const args = process.argv.slice(2);
        if (args.includes('--install')) {
            const presetSlug = args[args.indexOf('--install') + 1] || 'cabinet-medical';
            const tenantDbName = args.includes('--db') ? args[args.indexOf('--db') + 1] : 'saas_app_rb_9194';

            // Get userId
            const globalConn = mongoose.createConnection('mongodb://127.0.0.1:27017/saasDemo');
            await new Promise(r => globalConn.once('open', r));
            const User = globalConn.model('User_seed', new mongoose.Schema({}, { strict: false }), 'users');
            const user = await User.findOne({ email: 'boukirou6@hotmail.com' });
            await globalConn.close();

            if (!user) { console.error('User not found!'); process.exit(1); }

            await installPreset({ tenantDbName, presetSlug, userId: user._id.toString() });
        }

        process.exit(0);
    })().catch(err => { console.error('Error:', err); process.exit(1); });
}

module.exports = { seedAppPresets, installPreset, PRESETS };
