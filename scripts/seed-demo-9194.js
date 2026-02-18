/**
 * Seed demo data for account 9194
 * CLEANS UP old test data first, then creates CRM and Comptabilité environments
 */
const mongoose = require('mongoose');

async function seed() {
    const tenantDbName = 'saas_app_rb_9194';
    const conn = mongoose.createConnection(`mongodb://127.0.0.1:27017/${tenantDbName}`);
    await new Promise(r => conn.once('open', r));
    console.log(`Connected to ${tenantDbName}`);

    const EnvironmentSchema = new mongoose.Schema({
        name: String, slug: String, icon: String, color: String,
        order: Number, isDefault: Boolean, createdBy: mongoose.Schema.Types.ObjectId
    }, { timestamps: true });

    const SpaceSchema = new mongoose.Schema({
        name: String, slug: String, icon: String, color: String,
        order: Number, environmentId: mongoose.Schema.Types.ObjectId,
        owner: mongoose.Schema.Types.ObjectId, members: Array, settings: Object
    }, { timestamps: true });

    const FolderSchema = new mongoose.Schema({
        name: String, slug: String, type: String, icon: String, color: String,
        order: Number, spaces: [mongoose.Schema.Types.ObjectId],
        parentFolders: [mongoose.Schema.Types.ObjectId],
        createdBy: mongoose.Schema.Types.ObjectId
    }, { timestamps: true });

    const Environment = conn.model('Environment', EnvironmentSchema);
    const Space = conn.model('Space', SpaceSchema);
    const Folder = conn.model('Folder', FolderSchema);

    // Get user
    const globalConn = mongoose.createConnection('mongodb://127.0.0.1:27017/saasDemo');
    await new Promise(r => globalConn.once('open', r));
    const User = globalConn.model('User', new mongoose.Schema({}, { strict: false }));
    const user = await User.findOne({ email: 'boukirou6@hotmail.com' });
    if (!user) { console.error('User not found!'); process.exit(1); }
    const userId = user._id;
    console.log('User:', user.email);

    // ====== CLEANUP: Remove all test environments (except "Mon espace") ======
    const existingEnvs = await Environment.find({}).lean();
    console.log('Existing environments:', existingEnvs.map(e => `${e.name} (${e._id})`));

    for (const env of existingEnvs) {
        if (env.name !== 'Mon espace') {
            console.log(`  Deleting environment: ${env.name}`);
            // Delete spaces linked to this environment
            const spaces = await Space.find({ environmentId: env._id }).lean();
            for (const space of spaces) {
                // Delete folders linked to this space
                await Folder.deleteMany({ spaces: space._id });
                console.log(`    Deleted folders for space: ${space.name}`);
            }
            await Space.deleteMany({ environmentId: env._id });
            console.log(`    Deleted ${spaces.length} spaces`);
            await Environment.deleteOne({ _id: env._id });
        }
    }

    // Also clean up orphan spaces (no environmentId)
    const orphanSpaces = await Space.find({ environmentId: { $exists: false } }).lean();
    const orphanSpaces2 = await Space.find({ environmentId: null }).lean();
    if (orphanSpaces.length > 0 || orphanSpaces2.length > 0) {
        console.log(`Cleaning ${orphanSpaces.length + orphanSpaces2.length} orphan spaces...`);
        for (const s of [...orphanSpaces, ...orphanSpaces2]) {
            await Folder.deleteMany({ spaces: s._id });
        }
        await Space.deleteMany({ $or: [{ environmentId: { $exists: false } }, { environmentId: null }] });
    }

    console.log('\n✅ Cleanup done!\n');

    // Get the default env
    const defaultEnv = await Environment.findOne({ name: 'Mon espace' });
    if (!defaultEnv) { console.error('Default environment "Mon espace" not found!'); process.exit(1); }

    let orderCounter = 1; // Start after Mon espace

    // Helper to create unique slug
    const makeSlug = async (Model, name) => {
        const base = name.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        const existing = await Model.findOne({ slug: base });
        if (!existing) return base;
        let counter = 2;
        while (await Model.findOne({ slug: `${base}-${counter}` })) counter++;
        return `${base}-${counter}`;
    };

    // ====== CREATE CRM ======
    const crmEnv = new Environment({
        name: 'CRM', slug: await makeSlug(Environment, 'CRM'),
        icon: 'solar:cup-star-bold-duotone', color: '#00ab55',
        order: orderCounter++, createdBy: userId
    });
    await crmEnv.save();
    console.log('✅ CRM environment created');

    // CRM Spaces
    const crmSpaces = [
        { name: 'Ventes', icon: 'solar:bag-heart-bold-duotone', color: '#4361ee' },
        { name: 'Marketing', icon: 'solar:magnet-bold-duotone', color: '#805dca' },
        { name: 'Support Client', icon: 'solar:chat-round-call-bold-duotone', color: '#2196f3' },
    ];

    const crmSpaceIds = [];
    for (let i = 0; i < crmSpaces.length; i++) {
        const s = crmSpaces[i];
        const space = new Space({
            name: s.name, slug: await makeSlug(Space, s.name),
            icon: s.icon, color: s.color, order: i,
            environmentId: crmEnv._id, owner: userId
        });
        await space.save();
        crmSpaceIds.push(space._id);
        console.log(`  📁 Space: ${s.name}`);
    }

    // CRM Folders
    const crmFolderDefs = [
        // Ventes (index 0)
        { name: 'Prospects', icon: 'solar:user-plus-bold-duotone', color: '#4361ee', spaceIdx: 0, order: 0 },
        { name: 'Devis', icon: 'solar:document-text-bold-duotone', color: '#4361ee', spaceIdx: 0, order: 1 },
        { name: 'Contrats', icon: 'solar:clipboard-check-bold-duotone', color: '#00ab55', spaceIdx: 0, order: 2 },
        // Marketing (index 1)
        { name: 'Campagnes', icon: 'solar:rocket-bold-duotone', color: '#805dca', spaceIdx: 1, order: 0 },
        { name: 'Newsletters', icon: 'solar:letter-bold-duotone', color: '#805dca', spaceIdx: 1, order: 1 },
        { name: 'Leads', icon: 'solar:star-bold-duotone', color: '#e2a03f', spaceIdx: 1, order: 2 },
        // Support (index 2)
        { name: 'Tickets Ouverts', icon: 'solar:ticket-bold-duotone', color: '#e7515a', spaceIdx: 2, order: 0 },
        { name: 'Base de Connaissances', icon: 'solar:book-bold-duotone', color: '#2196f3', spaceIdx: 2, order: 1 },
        { name: 'FAQ', icon: 'solar:question-circle-bold-duotone', color: '#2196f3', spaceIdx: 2, order: 2 },
    ];

    for (const f of crmFolderDefs) {
        const folder = new Folder({
            name: f.name, slug: await makeSlug(Folder, f.name),
            icon: f.icon, color: f.color, order: f.order,
            spaces: [crmSpaceIds[f.spaceIdx]], parentFolders: [],
            createdBy: userId
        });
        await folder.save();
        console.log(`    📄 ${f.name}`);
    }

    // ====== CREATE COMPTABILITÉ ======
    const comptaEnv = new Environment({
        name: 'Comptabilité', slug: await makeSlug(Environment, 'Comptabilité'),
        icon: 'solar:calculator-bold-duotone', color: '#e2a03f',
        order: orderCounter++, createdBy: userId
    });
    await comptaEnv.save();
    console.log('\n✅ Comptabilité environment created');

    // Comptabilité Spaces
    const comptaSpaces = [
        { name: 'Facturation', icon: 'solar:bill-list-bold-duotone', color: '#e2a03f' },
        { name: 'Trésorerie', icon: 'solar:wallet-bold-duotone', color: '#00ab55' },
        { name: 'Paie', icon: 'solar:users-group-rounded-bold-duotone', color: '#4361ee' },
    ];

    const comptaSpaceIds = [];
    for (let i = 0; i < comptaSpaces.length; i++) {
        const s = comptaSpaces[i];
        const space = new Space({
            name: s.name, slug: await makeSlug(Space, s.name),
            icon: s.icon, color: s.color, order: i,
            environmentId: comptaEnv._id, owner: userId
        });
        await space.save();
        comptaSpaceIds.push(space._id);
        console.log(`  📁 Space: ${s.name}`);
    }

    // Comptabilité Folders
    const comptaFolderDefs = [
        { name: 'Factures Clients', icon: 'solar:file-text-bold-duotone', color: '#e2a03f', spaceIdx: 0, order: 0 },
        { name: 'Factures Fournisseurs', icon: 'solar:file-download-bold-duotone', color: '#e2a03f', spaceIdx: 0, order: 1 },
        { name: 'Avoirs', icon: 'solar:document-medicine-bold-duotone', color: '#e7515a', spaceIdx: 0, order: 2 },
        { name: 'Comptes Bancaires', icon: 'solar:card-bold-duotone', color: '#00ab55', spaceIdx: 1, order: 0 },
        { name: 'Rapprochements', icon: 'solar:chart-square-bold-duotone', color: '#00ab55', spaceIdx: 1, order: 1 },
        { name: 'Prévisions', icon: 'solar:graph-up-bold-duotone', color: '#4361ee', spaceIdx: 1, order: 2 },
        { name: 'Bulletins de Paie', icon: 'solar:money-bag-bold-duotone', color: '#4361ee', spaceIdx: 2, order: 0 },
        { name: 'Déclarations Sociales', icon: 'solar:shield-check-bold-duotone', color: '#4361ee', spaceIdx: 2, order: 1 },
        { name: 'Congés', icon: 'solar:sun-bold-duotone', color: '#e2a03f', spaceIdx: 2, order: 2 },
    ];

    for (const f of comptaFolderDefs) {
        const folder = new Folder({
            name: f.name, slug: await makeSlug(Folder, f.name),
            icon: f.icon, color: f.color, order: f.order,
            spaces: [comptaSpaceIds[f.spaceIdx]], parentFolders: [],
            createdBy: userId
        });
        await folder.save();
        console.log(`    📄 ${f.name}`);
    }

    console.log('\n========================================');
    console.log('🎉 SEEDING COMPLETE!');
    console.log('========================================');
    console.log('Environments:');
    console.log('  🟢 Mon espace (default)');
    console.log('  🟢 CRM → Ventes (3 folders) | Marketing (3 folders) | Support Client (3 folders)');
    console.log('  🟠 Comptabilité → Facturation (3 folders) | Trésorerie (3 folders) | Paie (3 folders)');
    console.log('\nRefresh the page to see all changes.');

    await conn.close();
    await globalConn.close();
    process.exit(0);
}

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });
