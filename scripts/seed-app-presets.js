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
        name: 'Cabinet Médical',
        description: 'Configuration complète pour un cabinet médical : patients, consultations, prescriptions, facturation, planning, stock et documents.',
        icon: 'solar:stethoscope-bold-duotone',
        color: '#00ab55',
        category: 'Santé',
        features: [
            '13 entités métier (Patient, Consultation, Prescription...)',
            '10+ modèles de documents (Ordonnance, Certificat...)',
            'Données de démonstration réalistes',
            'Navigation structurée par activité',
            'Classifications métier (Statuts, Types...)',
            'Lignes de prescription & facturation'
        ],
        seedModule: './seed-cabinet-medical',
        isComplete: true
    },
    {
        slug: 'notaire',
        name: 'Étude Notariale',
        description: 'Configuration de base pour une étude notariale : clients, dossiers, actes, rendez-vous et facturation.',
        icon: 'solar:diploma-verified-bold-duotone',
        color: '#805dca',
        category: 'Juridique',
        features: [
            '7 entités métier (Client, Dossier, Acte...)',
            'Navigation par activité',
            'Données de démonstration légères',
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

// ============================================
// Factory Reset: clean + re-seed
// ============================================

// Collections to clean (tenant-scoped, tagged with meta.createdByPreset)
const CLEANABLE_COLLECTIONS = [
    'records',
    'entities',
    'fieldtemplates',
    'classifications',
    'spaces',
    'folders',
    'environments',
    'documents',
    'smartdoctemplates',
    'lineschemas',
    'entityforms'
];

/**
 * Wipe all docs tagged with meta.createdByPreset == presetSlug
 */
async function cleanPresetData(tenantConn, presetSlug) {
    console.log(`\n🧹 Cleaning data for preset: ${presetSlug}`);

    for (const collName of CLEANABLE_COLLECTIONS) {
        try {
            const coll = tenantConn.db.collection(collName);
            const result = await coll.deleteMany({ 'meta.createdByPreset': presetSlug });
            if (result.deletedCount > 0) {
                console.log(`   🗑️  ${collName}: ${result.deletedCount} docs deleted`);
            }
        } catch (e) {
            // Collection may not exist yet, that's fine
        }
    }

    console.log('✅ Cleanup done\n');
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
        // Step 1: Clean existing preset data
        if (mode === 'factoryReset') {
            await cleanPresetData(tenantConn, presetSlug);
        }

        // Step 2: Run the seed module
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
