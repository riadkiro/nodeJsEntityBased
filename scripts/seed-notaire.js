/**
 * seed-notaire.js
 * Simple Étude Notariale preset
 */
const mongoose = require('mongoose');

const PRESET = 'notaire';
const meta = { createdByPreset: PRESET, isDemo: true };

function slug(name) {
    return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function upsertDoc(Model, filter, data) {
    return Model.findOneAndUpdate(filter, { ...data, meta }, { upsert: true, new: true, setDefaultsOnInsert: true });
}

function registerModels(conn) {
    const s = (def) => new mongoose.Schema(def, { timestamps: true, strict: false });
    const M = (name, schema, coll) => {
        try { return conn.model(name); } catch (e) { return conn.model(name, schema, coll); }
    };
    return {
        FieldTemplate: M('FieldTemplate', s({ name: String, label: String, type: String, subtype: String, description: String, required: Boolean, type_config: Object, ui: Object, isSystem: Boolean, isCustom: Boolean, category: String, meta: Object }), 'fieldtemplates'),
        Classification: M('Classification', s({ name: String, key: String, description: String, isShared: Boolean, type: String, allowMultiple: Boolean, options: Array, meta: Object }), 'classifications'),
        Entity: M('Entity', s({ name: String, slug: String, description: String, icon: String, color: String, order: Number, enabledStandardFields: [String], customFields: [mongoose.Schema.Types.ObjectId], statusClassification: mongoose.Schema.Types.ObjectId, classifications: [mongoose.Schema.Types.ObjectId], relations: Array, enableAttachments: Boolean, meta: Object }), 'entities'),
        Environment: M('Environment', s({ name: String, slug: String, icon: String, color: String, order: Number, meta: Object }), 'environments'),
        Space: M('Space', s({ name: String, slug: String, icon: String, color: String, order: Number, environmentId: mongoose.Schema.Types.ObjectId, owner: mongoose.Schema.Types.ObjectId, meta: Object }), 'spaces'),
        Folder: M('Folder', s({ name: String, slug: String, icon: String, color: String, order: Number, spaces: [mongoose.Schema.Types.ObjectId], parentFolders: [mongoose.Schema.Types.ObjectId], meta: Object }), 'folders'),
        Record: M('Record', s({ entityId: mongoose.Schema.Types.ObjectId, title: String, computedTitle: String, customFields: Array, relations: Array, classificationValues: Array, meta: Object }), 'records'),
    };
}

async function install(conn, userId, presetSlug) {
    const db = registerModels(conn);
    const ids = { fields: {}, classifications: {}, entities: {} };
    const uid = new mongoose.Types.ObjectId(userId);

    // 1. FIELDS
    console.log('\n📋 [Notaire] Creating fields...');
    const fieldDefs = [
        { name: 'n_nom', label: 'Nom', type: 'string', ui: { icon: 'solar:user-bold-duotone', width: 'half' } },
        { name: 'n_prenom', label: 'Prénom', type: 'string', ui: { icon: 'solar:user-bold-duotone', width: 'half' } },
        { name: 'n_telephone', label: 'Téléphone', type: 'string', subtype: 'tel', ui: { icon: 'solar:phone-bold-duotone', width: 'half' } },
        { name: 'n_email', label: 'Email', type: 'string', subtype: 'email', ui: { icon: 'solar:letter-bold-duotone', width: 'half' } },
        { name: 'n_adresse', label: 'Adresse', type: 'text', ui: { icon: 'solar:map-point-bold-duotone', width: 'full', rows: 1 } },
        { name: 'n_type_acte', label: "Type d'acte", type: 'select', type_config: { options: [{ label: 'Vente immobilière', value: 'vente' }, { label: 'Succession', value: 'succession' }, { label: 'Donation', value: 'donation' }, { label: 'Contrat de mariage', value: 'mariage' }, { label: 'Bail', value: 'bail' }, { label: 'SCI', value: 'sci' }] }, ui: { icon: 'solar:document-bold-duotone', width: 'half' } },
        { name: 'n_montant', label: 'Montant', type: 'number', ui: { icon: 'solar:dollar-bold-duotone', width: 'half' } },
        { name: 'n_notes', label: 'Notes', type: 'text', ui: { icon: 'solar:notes-bold-duotone', width: 'full', rows: 3 } },
        { name: 'n_reference', label: 'Référence dossier', type: 'string', ui: { icon: 'solar:hashtag-bold-duotone', width: 'half' } },
        { name: 'n_date_signature', label: 'Date signature', type: 'date', ui: { icon: 'solar:pen-bold-duotone', width: 'half' } },
        { name: 'n_date_rdv', label: 'Date RDV', type: 'date', type_config: { includeTime: true }, ui: { icon: 'solar:calendar-bold-duotone', width: 'half' } },
        { name: 'n_objet_rdv', label: 'Objet', type: 'text', ui: { icon: 'solar:chat-round-dots-bold-duotone', width: 'full', rows: 1 } },
        { name: 'n_montant_total', label: 'Montant total', type: 'number', ui: { icon: 'solar:dollar-bold-duotone', width: 'half' } },
        { name: 'n_date_echeance', label: 'Échéance', type: 'date', ui: { icon: 'solar:alarm-bold-duotone', width: 'half' } },
        { name: 'n_mode_paiement', label: 'Mode de paiement', type: 'select', type_config: { options: [{ label: 'Virement', value: 'transfer' }, { label: 'Chèque', value: 'cheque' }, { label: 'Espèces', value: 'cash' }] }, ui: { icon: 'solar:card-bold-duotone', width: 'half' } },
        { name: 'n_type_document', label: 'Type', type: 'string', ui: { icon: 'solar:file-text-bold-duotone', width: 'half' } },
    ];

    for (const f of fieldDefs) {
        const doc = await upsertDoc(db.FieldTemplate, { name: f.name, 'meta.createdByPreset': PRESET }, { ...f, isCustom: true, isSystem: false, category: 'other' });
        ids.fields[f.name] = doc._id;
    }
    console.log(`   ✅ ${fieldDefs.length} fields`);

    // 2. CLASSIFICATIONS
    console.log('\n🏷️  [Notaire] Creating classifications...');
    const classDefs = [
        {
            name: 'Statut dossier', key: 'n_dossier_status', options: [
                { label: 'Ouvert', color: '#3b82f6', type: 'start', order: 0 },
                { label: 'En cours', color: '#f59e0b', type: 'active', order: 1 },
                { label: 'Signé', color: '#22c55e', type: 'completed', order: 2 },
                { label: 'Archivé', color: '#94a3b8', order: 3 }
            ]
        },
        {
            name: 'Statut facture', key: 'n_invoice_status', options: [
                { label: 'Brouillon', color: '#94a3b8', type: 'start', order: 0 },
                { label: 'Envoyée', color: '#3b82f6', type: 'active', order: 1 },
                { label: 'Payée', color: '#22c55e', type: 'completed', order: 2 }
            ]
        }
    ];

    for (const c of classDefs) {
        const doc = await upsertDoc(db.Classification, { key: c.key, 'meta.createdByPreset': PRESET }, { ...c, isShared: true, type: 'simple' });
        ids.classifications[c.key] = doc._id;
        ids.classifications[`${c.key}_opts`] = doc.options;
    }

    // 3. ENTITIES
    console.log('\n🗂️  [Notaire] Creating entities...');
    const f = ids.fields;
    const entityDefs = [
        { name: 'Client', slug: 'n-clients', icon: 'solar:user-bold-duotone', color: '#3b82f6', fields: ['n_nom', 'n_prenom', 'n_telephone', 'n_email', 'n_adresse', 'n_notes'] },
        { name: 'Dossier', slug: 'n-dossiers', icon: 'solar:folder-open-bold-duotone', color: '#805dca', fields: ['n_reference', 'n_type_acte', 'n_montant', 'n_notes'], statusClassification: 'n_dossier_status' },
        { name: 'Acte', slug: 'n-actes', icon: 'solar:diploma-verified-bold-duotone', color: '#00ab55', fields: ['n_type_acte', 'n_date_signature', 'n_montant', 'n_notes'] },
        { name: 'Rendez-vous', slug: 'n-rendez-vous', icon: 'solar:calendar-mark-bold-duotone', color: '#8b5cf6', fields: ['n_date_rdv', 'n_objet_rdv', 'n_notes'] },
        { name: 'Facture', slug: 'n-factures', icon: 'solar:bill-list-bold-duotone', color: '#e2a03f', fields: ['n_montant_total', 'n_date_echeance', 'n_notes'], statusClassification: 'n_invoice_status' },
        { name: 'Paiement', slug: 'n-paiements', icon: 'solar:wallet-bold-duotone', color: '#22c55e', fields: ['n_montant_total', 'n_mode_paiement', 'n_notes'] },
        { name: 'Document', slug: 'n-documents', icon: 'solar:file-text-bold-duotone', color: '#6366f1', fields: ['n_type_document', 'n_notes'] },
    ];

    for (let i = 0; i < entityDefs.length; i++) {
        const e = entityDefs[i];
        const doc = await upsertDoc(db.Entity, { slug: e.slug, 'meta.createdByPreset': PRESET }, {
            name: e.name, slug: e.slug, icon: e.icon, color: e.color, order: i,
            enabledStandardFields: ['title', 'description', 'date'],
            customFields: e.fields.map(fn => f[fn]).filter(Boolean),
            statusClassification: e.statusClassification ? ids.classifications[e.statusClassification] : undefined,
            enableAttachments: true, relations: []
        });
        ids.entities[e.slug] = doc._id;
    }
    console.log(`   ✅ ${entityDefs.length} entities`);

    // 4. NAVIGATION (each group = separate environment)
    console.log('\n🧭 [Notaire] Creating navigation...');
    const envDefs = [
        {
            env: { name: 'Clientèle', slug: 'n-clientele', icon: 'solar:user-bold-duotone', color: '#3b82f6' },
            spaces: [{ name: 'Clientèle', icon: 'solar:user-bold-duotone', color: '#3b82f6', folders: ['Clients', 'Rendez-vous'] }]
        },
        {
            env: { name: 'Dossiers & Actes', slug: 'n-dossiers-actes', icon: 'solar:folder-open-bold-duotone', color: '#805dca' },
            spaces: [{ name: 'Dossiers & Actes', icon: 'solar:folder-open-bold-duotone', color: '#805dca', folders: ['Dossiers', 'Actes', 'Documents'] }]
        },
        {
            env: { name: 'Facturation Notaire', slug: 'n-facturation', icon: 'solar:bill-list-bold-duotone', color: '#e2a03f' },
            spaces: [{ name: 'Facturation Notaire', icon: 'solar:bill-list-bold-duotone', color: '#e2a03f', folders: ['Factures Notaire', 'Paiements Notaire'] }]
        },
    ];
    for (let ei = 0; ei < envDefs.length; ei++) {
        const ed = envDefs[ei];
        const env = await upsertDoc(db.Environment, { slug: ed.env.slug, 'meta.createdByPreset': PRESET }, {
            ...ed.env, order: ei, isDefault: ei === 0
        });
        for (let si = 0; si < ed.spaces.length; si++) {
            const sd = ed.spaces[si];
            const spaceSlug = 'n-' + slug(sd.name);
            const space = await upsertDoc(db.Space, { slug: spaceSlug, 'meta.createdByPreset': PRESET }, {
                name: sd.name, slug: spaceSlug, icon: sd.icon, color: sd.color, order: si,
                environmentId: env._id, owner: uid
            });
            for (let fi = 0; fi < sd.folders.length; fi++) {
                const folderSlug = 'n-' + slug(sd.folders[fi]);
                await upsertDoc(db.Folder, { slug: folderSlug, spaces: [space._id], 'meta.createdByPreset': PRESET }, {
                    name: sd.folders[fi], slug: folderSlug, icon: sd.icon, color: sd.color, order: fi,
                    spaces: [space._id], parentFolders: []
                });
            }
        }
    }
    // Clean up old single "etude-notariale" environment if it still exists
    const oldEnv = await db.Environment.findOne({ slug: 'etude-notariale', 'meta.createdByPreset': PRESET });
    if (oldEnv) {
        await db.Space.updateMany(
            { environmentId: oldEnv._id, 'meta.createdByPreset': PRESET },
            { $unset: { environmentId: '' } }
        );
        await db.Environment.deleteOne({ _id: oldEnv._id });
        console.log('   🗑️  Removed old single "Étude Notariale" environment');
    }
    console.log(`   ✅ ${envDefs.length} environments created`);

    // 5. DEMO RECORDS
    console.log('\n📊 [Notaire] Creating demo records...');
    const rec = async (entitySlug, title, customs = {}, extras = {}) => {
        const cf = Object.entries(customs).map(([name, value]) => ({ field_id: f[name], value }));
        return upsertDoc(db.Record, { entityId: ids.entities[entitySlug], title, 'meta.createdByPreset': PRESET }, {
            entityId: ids.entities[entitySlug], title, computedTitle: title, customFields: cf, createdBy: uid, ...extras
        });
    };

    // Clients (5)
    const clients = [];
    for (const [nom, prenom, tel] of [['Dupont', 'Jean', '0612345678'], ['Martin', 'Claire', '0623456789'], ['Bernard', 'Philippe', '0634567890'], ['Lefebvre', 'Anne', '0645678901'], ['Morel', 'Pierre', '0656789012']]) {
        const c = await rec('n-clients', `${prenom} ${nom}`, { n_nom: nom, n_prenom: prenom, n_telephone: tel, n_email: `${prenom.toLowerCase()}.${nom.toLowerCase()}@mail.com` });
        clients.push(c);
    }

    // Dossiers (5)
    const types = ['vente', 'succession', 'donation', 'mariage', 'bail'];
    for (let i = 0; i < 5; i++) {
        await rec('n-dossiers', `DOS-${String(i + 1).padStart(4, '0')}`, { n_reference: `DOS-${String(i + 1).padStart(4, '0')}`, n_type_acte: types[i], n_montant: [250000, 150000, 80000, 0, 1200][i] });
    }

    // Actes (5)
    for (let i = 0; i < 5; i++) {
        await rec('n-actes', `Acte ${types[i]}`, { n_type_acte: types[i], n_date_signature: new Date(Date.now() - i * 30 * 86400000), n_montant: [250000, 150000, 80000, 0, 1200][i] });
    }

    // RDV (4), Factures (3), Paiements (3), Documents (5)
    for (let i = 0; i < 4; i++) {
        const d = new Date(); d.setDate(d.getDate() + i * 7);
        await rec('n-rendez-vous', `RDV ${clients[i].title}`, { n_date_rdv: d, n_objet_rdv: 'Signature acte' });
    }
    for (let i = 0; i < 3; i++) {
        await rec('n-factures', `NFAC-${String(i + 1).padStart(4, '0')}`, { n_montant_total: [3500, 2800, 1500][i], n_date_echeance: new Date(Date.now() + 30 * 86400000) });
    }
    for (let i = 0; i < 3; i++) {
        await rec('n-paiements', `NPAY-${String(i + 1).padStart(4, '0')}`, { n_montant_total: [3500, 2800, 1500][i], n_mode_paiement: ['transfer', 'cheque', 'transfer'][i] });
    }
    for (let i = 0; i < 5; i++) {
        await rec('n-documents', `Document ${i + 1}`, { n_type_document: ['Acte', 'Procuration', 'Attestation', 'Devis', 'Courrier'][i] });
    }

    console.log('   ✅ Demo records created');
    console.log('\n🎉 Notaire preset installed!');
}

if (require.main === module) {
    (async () => {
        const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_9194');
        await new Promise(r => conn.once('open', r));
        const gc = mongoose.createConnection('mongodb://127.0.0.1:27017/saasDemo');
        await new Promise(r => gc.once('open', r));
        const U = gc.model('User_not', new mongoose.Schema({}, { strict: false }), 'users');
        const user = await U.findOne({ email: 'boukirou6@hotmail.com' });
        await gc.close();
        if (!user) { console.error('User not found!'); process.exit(1); }
        await install(conn, user._id.toString(), PRESET);
        await conn.close();
        process.exit(0);
    })().catch(err => { console.error(err); process.exit(1); });
}

module.exports = { install };
