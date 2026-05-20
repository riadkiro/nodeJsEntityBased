/**
 * seed-crm.js
 * Complete CRM Salesforce-like preset
 */
const mongoose = require('mongoose');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const uuidv4 = () => crypto.randomUUID();

const PRESET = 'crm';
const meta = { createdByPreset: PRESET, isDemo: true };

// ============================================
// Helpers
// ============================================
function slug(name) {
    return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function upsertDoc(Model, filter, data) {
    return Model.findOneAndUpdate(filter, { ...data, meta }, { upsert: true, new: true, setDefaultsOnInsert: true });
}

// ============================================
// Schema registration helper
// ============================================
function registerModels(conn) {
    const s = (def, opts) => new mongoose.Schema(def, { timestamps: true, strict: false, ...opts });
    const M = (name, schema, coll) => {
        try { return conn.model(name); } catch (e) { return conn.model(name, schema, coll); }
    };

    return {
        FieldTemplate: M('FieldTemplate', s({ name: String, label: String, type: String, subtype: String, description: String, required: Boolean, type_config: Object, ui: Object, isSystem: Boolean, isCustom: Boolean, category: String, meta: Object }), 'fieldtemplates'),
        Classification: M('Classification', s({ name: String, key: String, description: String, isShared: Boolean, type: String, allowMultiple: Boolean, entities: [mongoose.Schema.Types.ObjectId], options: [new mongoose.Schema({ label: String, color: String, icon: String, badgeStyle: String, type: String, order: Number }, { _id: true })], meta: Object }), 'classifications'),
        Entity: M('Entity', s({ name: String, slug: String, description: String, icon: String, color: String, order: Number, enabledStandardFields: [String], customFields: [mongoose.Schema.Types.ObjectId], statusClassification: mongoose.Schema.Types.ObjectId, classifications: [mongoose.Schema.Types.ObjectId], relations: Array, formLayout: Object, layout: Object, enableAttachments: Boolean, spaces: [mongoose.Schema.Types.ObjectId], folders: [mongoose.Schema.Types.ObjectId], meta: Object }), 'entities'),
        Environment: M('Environment', s({ name: String, slug: String, icon: String, color: String, order: Number, isDefault: Boolean, meta: Object }), 'environments'),
        Space: M('Space', s({ name: String, slug: String, icon: String, color: String, order: Number, environmentId: mongoose.Schema.Types.ObjectId, owner: mongoose.Schema.Types.ObjectId, members: Array, meta: Object }), 'spaces'),
        Folder: M('Folder', s({ name: String, slug: String, type: String, icon: String, color: String, order: Number, spaces: [mongoose.Schema.Types.ObjectId], parentFolders: [mongoose.Schema.Types.ObjectId], meta: Object }), 'folders'),
        Record: M('Record', s({ entityId: mongoose.Schema.Types.ObjectId, title: String, computedTitle: String, description: String, status: String, customFields: [{ field_id: mongoose.Schema.Types.ObjectId, value: mongoose.Schema.Types.Mixed }], relations: [{ relationKey: String, value: mongoose.Schema.Types.Mixed }], classificationValues: Array, date: Date, meta: Object }), 'records'),
        Document: M('Document', s({ name: String, format: String, orientation: String, pages: Array, isTemplate: Boolean, entityId: mongoose.Schema.Types.ObjectId, entityIds: [mongoose.Schema.Types.ObjectId], createdBy: mongoose.Schema.Types.ObjectId, status: String, tags: [String], collections: Array, contentBlocks: Array, meta: Object }), 'documents'),
        SmartDocTemplate: M('SmartDocTemplate', s({ name: String, description: String, icon: String, color: String, documentId: mongoose.Schema.Types.ObjectId, entityId: mongoose.Schema.Types.ObjectId, inputFields: Array, outputFormat: String, order: Number, active: Boolean, meta: Object }), 'smartdoctemplates'),
        LineSchema: M('LineSchema', s({ name: String, slug: String, description: String, appliesTo: Object, sourceEntityId: mongoose.Schema.Types.ObjectId, lineTypes: [String], columns: Array, totals: Object, defaultLineType: String, meta: Object }), 'lineschemas'),
        View: M('View', s({ name: String, slug: String, entity: mongoose.Schema.Types.ObjectId, cockpitId: mongoose.Schema.Types.ObjectId, icon: String, color: String, order: Number, viewType: String, spaces: [mongoose.Schema.Types.ObjectId], folders: [mongoose.Schema.Types.ObjectId], filters: Array, settings: Object, createdBy: mongoose.Schema.Types.ObjectId, meta: Object }), 'views'),
        CardTemplate: M('CardTemplate', s({ name: String, entityId: mongoose.Schema.Types.ObjectId, context: String, isDefault: Boolean, presetSlug: String, layout: Object, createdBy: mongoose.Schema.Types.ObjectId, meta: Object }), 'cardtemplates')
    };
}

async function install(conn, userId, presetSlug) {
    const db = registerModels(conn);
    const ids = {};
    const uid = userId ? new mongoose.Types.ObjectId(userId) : null;

    console.log('\n🧹 Cleaning up orphaned data...');
    const existingEntities = await db.Entity.find({}).select('_id').lean();
    const existingEntityIds = new Set(existingEntities.map(e => e._id.toString()));
    const allViews = await db.View.find({ entity: { $exists: true, $ne: null } }).lean();
    const orphanedViewIds = allViews.filter(v => v.entity && !existingEntityIds.has(v.entity.toString())).map(v => v._id);
    if (orphanedViewIds.length > 0) await db.View.deleteMany({ _id: { $in: orphanedViewIds } });
    
    const remainingViews = await db.View.find({}).select('spaces folders').lean();
    const usedSpaceIds = new Set();
    remainingViews.forEach(v => (v.spaces || []).forEach(s => usedSpaceIds.add(s.toString())));
    const orphanedSpaces = (await db.Space.find({}).lean()).filter(s => !usedSpaceIds.has(s._id.toString()));
    if (orphanedSpaces.length > 0) await db.Space.deleteMany({ _id: { $in: orphanedSpaces.map(s => s._id) } });

    const orphanedRecords = await db.Record.countDocuments({ entityId: { $nin: [...existingEntityIds].map(id => new mongoose.Types.ObjectId(id)) } });
    if (orphanedRecords > 0) await db.Record.deleteMany({ entityId: { $nin: [...existingEntityIds].map(id => new mongoose.Types.ObjectId(id)) } });
    console.log('   ✅ Cleanup complete');

    // =========== 1. FIELD TEMPLATES ===========
    console.log('\n📋 Creating field templates...');
    const fieldDefs = [
        // Contact
        { name: 'nom', label: 'Nom', type: 'string', ui: { icon: 'solar:user-bold-duotone', width: 'half' } },
        { name: 'prenom', label: 'Prénom', type: 'string', ui: { icon: 'solar:user-bold-duotone', width: 'half' } },
        { name: 'email', label: 'Email', type: 'string', subtype: 'email', ui: { icon: 'solar:letter-bold-duotone', width: 'half' } },
        { name: 'telephone', label: 'Téléphone', type: 'string', subtype: 'tel', ui: { icon: 'solar:phone-bold-duotone', width: 'half' } },
        { name: 'fonction', label: 'Fonction', type: 'string', ui: { icon: 'solar:user-id-bold-duotone', width: 'half' } },
        { name: 'linkedin', label: 'Profil LinkedIn', type: 'string', ui: { icon: 'solar:link-bold-duotone', width: 'half' } },
        // Entreprise
        { name: 'siret', label: 'SIRET', type: 'string', ui: { icon: 'solar:buildings-bold-duotone', width: 'half' } },
        { name: 'site_web', label: 'Site Web', type: 'string', ui: { icon: 'solar:global-bold-duotone', width: 'half' } },
        { name: 'adresse', label: 'Adresse complète', type: 'text', ui: { icon: 'solar:map-point-bold-duotone', width: 'full', rows: 2 } },
        // Opportunité
        { name: 'montant', label: 'Montant estimé', type: 'number', ui: { icon: 'solar:dollar-bold-duotone', width: 'half' } },
        { name: 'date_cloture', label: 'Date de clôture prévue', type: 'date', ui: { icon: 'solar:calendar-bold-duotone', width: 'half' } },
        { name: 'probabilite', label: 'Probabilité (%)', type: 'number', ui: { icon: 'solar:chart-bold-duotone', width: 'half' } },
        // Activité
        { name: 'date_activite', label: 'Date de l\'activité', type: 'date', type_config: { includeTime: true }, ui: { icon: 'solar:calendar-bold-duotone', width: 'half' } },
        { name: 'compte_rendu', label: 'Compte rendu', type: 'text', ui: { icon: 'solar:document-text-bold-duotone', width: 'full', rows: 4 } },
        // Produit / Service
        { name: 'reference', label: 'Référence', type: 'string', ui: { icon: 'solar:hashtag-bold-duotone', width: 'half' } },
        { name: 'prix_unitaire', label: 'Prix Unitaire HT', type: 'number', ui: { icon: 'solar:tag-price-bold-duotone', width: 'half' } },
        { name: 'tva_rate', label: 'Taux TVA (%)', type: 'number', ui: { icon: 'solar:calculator-bold-duotone', width: 'half' } },
        // Contrat
        { name: 'date_debut', label: 'Date de début', type: 'date', ui: { icon: 'solar:calendar-bold-duotone', width: 'half' } },
        { name: 'date_fin', label: 'Date de fin', type: 'date', ui: { icon: 'solar:calendar-bold-duotone', width: 'half' } },
        { name: 'mrr', label: 'MRR (Revenu Récurrent Mensuel)', type: 'number', ui: { icon: 'solar:dollar-bold-duotone', width: 'half' } },
        // Facture / Paiement
        { name: 'montant_total', label: 'Montant total TTC', type: 'number', ui: { icon: 'solar:dollar-bold-duotone', width: 'half' } },
        { name: 'montant_paye', label: 'Montant payé', type: 'number', ui: { icon: 'solar:wallet-bold-duotone', width: 'half' } },
        { name: 'date_echeance', label: 'Date d\'échéance', type: 'date', ui: { icon: 'solar:calendar-bold-duotone', width: 'half' } },
        { name: 'notes_generales', label: 'Notes internes', type: 'text', ui: { icon: 'solar:notes-bold-duotone', width: 'full', rows: 3 } },
        // Computed
        {
            name: 'reste_a_payer', label: 'Reste à payer', type: 'number', category: 'computed', ui: { icon: 'solar:wallet-bold-duotone', width: 'half' }, color: '#ef4444',
            formula: { fromFunction: 'expression', expression: '%montant_total% - %montant_paye%', sourceFields: {}, dependsOn: ['montant_total', 'montant_paye'] },
            render: { display: { table: 'currency', card: 'currency' } }
        }
    ];

    ids.fields = {};
    for (const f of fieldDefs) {
        const doc = await upsertDoc(db.FieldTemplate, { name: f.name }, {
            ...f, isCustom: true, isSystem: false, category: f.category || 'other'
        });
        ids.fields[f.name] = doc._id;
    }
    console.log(`   ✅ ${Object.keys(ids.fields).length} field templates`);

    // =========== 2. CLASSIFICATIONS ===========
    console.log('\n🏷️  Creating classifications...');
    const classDefs = [
        {
            name: 'Pipeline Commercial', key: 'crm_pipeline', options: [
                { label: 'Prospection', color: '#94a3b8', type: 'start', order: 0 },
                { label: 'Qualification', color: '#3b82f6', type: 'active', order: 1 },
                { label: 'Proposition', color: '#f59e0b', type: 'active', order: 2 },
                { label: 'Négociation', color: '#8b5cf6', type: 'active', order: 3 },
                { label: 'Gagné', color: '#22c55e', type: 'completed', order: 4 },
                { label: 'Perdu', color: '#ef4444', type: 'normal', order: 5 }
            ]
        },
        {
            name: 'Priorité', key: 'crm_priority', options: [
                { label: 'Basse', color: '#94a3b8', order: 0 },
                { label: 'Moyenne', color: '#f59e0b', order: 1 },
                { label: 'Haute', color: '#ef4444', order: 2 }
            ]
        },
        {
            name: 'Type Activité', key: 'crm_activity_type', options: [
                { label: 'Appel', color: '#3b82f6', icon: 'solar:phone-calling-bold', order: 0 },
                { label: 'Email', color: '#8b5cf6', icon: 'solar:letter-bold', order: 1 },
                { label: 'Réunion', color: '#22c55e', icon: 'solar:users-group-rounded-bold', order: 2 },
                { label: 'Démo', color: '#f59e0b', icon: 'solar:monitor-camera-bold', order: 3 },
                { label: 'Déjeuner', color: '#ec4899', icon: 'solar:cup-bold', order: 4 }
            ]
        },

        {
            name: 'Secteur d\'activité', key: 'crm_industry', options: [
                { label: 'Tech & Logiciels', color: '#3b82f6', order: 0 },
                { label: 'Finance & Assurances', color: '#8b5cf6', order: 1 },
                { label: 'Santé & Médical', color: '#22c55e', order: 2 },
                { label: 'Retail & E-commerce', color: '#f59e0b', order: 3 },
                { label: 'Industrie & Manufacturing', color: '#64748b', order: 4 },
                { label: 'Services Professionnels', color: '#0ea5e9', order: 5 }
            ]
        },
        {
            name: 'Source Lead', key: 'crm_lead_source', options: [
                { label: 'Site Web (Inbound)', color: '#3b82f6', order: 0 },
                { label: 'Prospection (Outbound)', color: '#8b5cf6', order: 1 },
                { label: 'LinkedIn', color: '#0ea5e9', order: 2 },
                { label: 'Recommandation', color: '#22c55e', order: 3 },
                { label: 'Événement / Salon', color: '#f59e0b', order: 4 }
            ]
        }
    ];

    ids.classifications = {};
    for (const c of classDefs) {
        const doc = await upsertDoc(db.Classification, { key: c.key }, {
            ...c, isShared: true, type: 'simple'
        });
        ids.classifications[c.key] = doc._id;
        ids.classifications[`${c.key}_opts`] = doc.options;
    }
    console.log(`   ✅ ${Object.keys(classDefs).length} classifications`);

    // =========== 3. ENTITIES ===========
    console.log('\n🗂️  Creating entities...');
    const f = ids.fields;
    const entityDefs = [
        {
            name: 'Contact', nameSingular: 'Contact', namePlural: 'Contacts', slug: 'contacts', icon: 'solar:user-bold-duotone', color: '#3b82f6',
            fields: ['nom', 'prenom', 'email', 'telephone', 'fonction', 'linkedin', 'notes_generales'], statusClassification: null, classifications: ['crm_lead_source'],
            referenceTitleTokens: [{ t: 'field', id: () => f.prenom }, { t: 'text', v: ' ' }, { t: 'field', id: () => f.nom }],
            sidebarWidgets: [
                { type: 'note', label: 'Note CRM', icon: 'solar:notes-bold-duotone', color: '#3b82f6', order: 0, visible: true, config: { content: '' } },
                { type: 'tasks', label: 'Suivi', icon: 'solar:checklist-bold-duotone', color: '#f59e0b', order: 1, visible: true, config: { tasks: [{ label: 'Appel de découverte', done: false }, { label: 'Envoyer plaquette commerciale', done: false }] } }
            ]
        },
        {
            name: 'Entreprise', nameSingular: 'Entreprise', namePlural: 'Entreprises', slug: 'entreprises', icon: 'solar:buildings-bold-duotone', color: '#64748b',
            fields: ['siret', 'site_web', 'adresse', 'notes_generales'], statusClassification: null, classifications: ['crm_industry'],
            referenceTitleTokens: [{ t: 'field', id: 'title' }],
            sidebarWidgets: [
                { type: 'note', label: 'Stratégie de compte', icon: 'solar:target-bold-duotone', color: '#64748b', order: 0, visible: true, config: { content: '' } }
            ]
        },
        {
            name: 'Opportunité', nameSingular: 'Opportunité', namePlural: 'Opportunités', slug: 'opportunites', icon: 'solar:chart-bold-duotone', color: '#22c55e',
            fields: ['montant', 'date_cloture', 'probabilite', 'notes_generales'], statusClassification: 'crm_pipeline', classifications: ['crm_priority'],
            referenceTitleTokens: [{ t: 'field', id: 'title' }],
            sidebarWidgets: [
                { type: 'note', label: 'Next steps', icon: 'solar:arrow-right-bold-duotone', color: '#22c55e', order: 0, visible: true, config: { content: '' } },
                { type: 'tasks', label: 'Checklist Deal', icon: 'solar:checklist-bold-duotone', color: '#8b5cf6', order: 1, visible: true, config: { tasks: [{ label: 'Identifier le décideur', done: false }, { label: 'Valider le budget', done: false }, { label: 'Démonstration produit', done: false }] } }
            ]
        },
        {
            name: 'Activité', nameSingular: 'Activité', namePlural: 'Activités', slug: 'activites', icon: 'solar:phone-calling-bold-duotone', color: '#8b5cf6',
            fields: ['date_activite', 'compte_rendu'], statusClassification: null, classifications: ['crm_activity_type'],
            referenceTitleTokens: [{ t: 'field', id: 'title' }]
        },
        {
            name: 'Produit', nameSingular: 'Produit', namePlural: 'Produits', slug: 'produits', icon: 'solar:box-bold-duotone', color: '#0ea5e9',
            fields: ['reference', 'prix_unitaire', 'tva_rate', 'notes_generales'], statusClassification: null, classifications: [],
            referenceTitleTokens: [{ t: 'field', id: 'title' }]
        },
        {
            name: 'Service', nameSingular: 'Service', namePlural: 'Services', slug: 'services', icon: 'solar:settings-bold-duotone', color: '#0ea5e9',
            fields: ['reference', 'prix_unitaire', 'tva_rate', 'notes_generales'], statusClassification: null, classifications: [],
            referenceTitleTokens: [{ t: 'field', id: 'title' }]
        }
    ];

    ids.entities = {};
    for (let i = 0; i < entityDefs.length; i++) {
        const e = entityDefs[i];
        const customFieldIds = e.fields.map(fn => f[fn]).filter(Boolean);
        const classIds = e.classifications.map(k => ids.classifications[k]).filter(Boolean);
        const statusCls = e.statusClassification ? ids.classifications[e.statusClassification] : undefined;

        let resolvedTokens = undefined;
        if (e.referenceTitleTokens) {
            resolvedTokens = e.referenceTitleTokens.map(tok => ({
                t: tok.t,
                ...(tok.t === 'field' ? { id: typeof tok.id === 'function' ? tok.id().toString() : tok.id } : {}),
                ...(tok.t === 'text' ? { v: tok.v } : {})
            }));
        }

        const entityData = {
            name: e.name, nameSingular: e.nameSingular, namePlural: e.namePlural,
            slug: e.slug, description: '', icon: e.icon, color: e.color, order: i,
            enabledStandardFields: ['title', 'description', 'date'],
            customFields: customFieldIds,
            statusClassification: statusCls,
            classifications: classIds,
            enableAttachments: true,
            relations: []
        };
        if (resolvedTokens) entityData.referenceTitleTokens = resolvedTokens;
        if (e.sidebarWidgets) entityData.sidebarWidgets = e.sidebarWidgets;

        const doc = await upsertDoc(db.Entity, { slug: e.slug }, entityData);
        ids.entities[e.slug] = doc._id;
    }
    console.log(`   ✅ ${Object.keys(ids.entities).length} entities`);

    // =========== 4. RELATIONS ===========
    console.log('\n🔗 Adding relations...');
    const E = ids.entities;
    ids.relationKeys = {};
    const relationDefs = [
        { src: 'contacts', target: 'entreprises', label: 'Entreprise', inverse: 'Contacts', card: 'many-to-one' },
        { src: 'opportunites', target: 'contacts', label: 'Contact principal', inverse: 'Opportunités', card: 'many-to-one' },
        { src: 'opportunites', target: 'entreprises', label: 'Entreprise', inverse: 'Opportunités', card: 'many-to-one' },
        { src: 'activites', target: 'contacts', label: 'Contact', inverse: 'Activités', card: 'many-to-one' },
        { src: 'activites', target: 'opportunites', label: 'Opportunité', inverse: 'Activités', card: 'many-to-one' }
    ];

    for (const r of relationDefs) {
        const key = uuidv4();
        ids.relationKeys[`${r.src}__${r.target}`] = key;
        await db.Entity.findByIdAndUpdate(E[r.src], {
            $push: {
                relations: {
                    key, targetEntity: E[r.target], label: r.label, inverseLabel: r.inverse,
                    cardinality: r.card, inputMode: 'modal-picker', storage: 'on-source', bidirectional: true, required: false, showInForm: true
                }
            }
        });
    }
    console.log(`   ✅ ${relationDefs.length} relations`);

    const rk = ids.relationKeys;

    // =========== 5. NAVIGATION ===========
    console.log('\n🧭 Creating navigation...');
    const envDefs = [
        {
            env: { name: 'Pipeline Commercial', slug: 'pipeline', icon: 'solar:chart-bold-duotone', color: '#22c55e' },
            spaces: [{
                name: 'Pipeline Commercial', icon: 'solar:chart-bold-duotone', color: '#22c55e', views: [
                    { entitySlug: 'opportunites', name: 'Opportunités', icon: 'solar:chart-bold-duotone', color: '#22c55e' },
                    { entitySlug: 'contacts', name: 'Contacts', icon: 'solar:user-bold-duotone', color: '#3b82f6' },
                    { entitySlug: 'entreprises', name: 'Entreprises', icon: 'solar:buildings-bold-duotone', color: '#64748b' }
                ]
            }]
        },
        {
            env: { name: 'Activités & Suivi', slug: 'activites', icon: 'solar:phone-calling-bold-duotone', color: '#8b5cf6' },
            spaces: [{
                name: 'Activités & Suivi', icon: 'solar:phone-calling-bold-duotone', color: '#8b5cf6', views: [
                    { entitySlug: 'activites', name: 'Activités', icon: 'solar:phone-calling-bold-duotone', color: '#8b5cf6' }
                ]
            }]
        },
        {
            env: { name: 'Catalogue', slug: 'catalogue', icon: 'solar:box-bold-duotone', color: '#0ea5e9' },
            spaces: [{
                name: 'Catalogue', icon: 'solar:box-bold-duotone', color: '#0ea5e9', views: [
                    { entitySlug: 'produits', name: 'Produits', icon: 'solar:box-bold-duotone', color: '#0ea5e9' },
                    { entitySlug: 'services', name: 'Services', icon: 'solar:settings-bold-duotone', color: '#0ea5e9' }
                ]
            }]
        }
    ];

    let viewCount = 0;
    for (let ei = 0; ei < envDefs.length; ei++) {
        const ed = envDefs[ei];
        const env = await upsertDoc(db.Environment, { slug: ed.env.slug }, { ...ed.env, order: ei, isDefault: ei === 0 });
        for (let si = 0; si < ed.spaces.length; si++) {
            const sd = ed.spaces[si];
            const space = await upsertDoc(db.Space, { slug: slug(sd.name) }, {
                name: sd.name, slug: slug(sd.name), icon: sd.icon, color: sd.color, order: si, environmentId: env._id, owner: uid
            });
            for (let vi = 0; vi < sd.views.length; vi++) {
                const vd = sd.views[vi];
                const entityId = E[vd.entitySlug];
                if (!entityId) continue;
                const viewSlug = `view-${vd.entitySlug}-${space._id.toString().slice(-6)}-${vi}`;
                await upsertDoc(db.View, { slug: viewSlug }, {
                    name: vd.name, slug: viewSlug, entity: entityId, icon: vd.icon, color: vd.color, viewType: 'list', order: vi,
                    spaces: [space._id], folders: [], createdBy: uid,
                    settings: vd.entitySlug === 'opportunites' ? { kanbanField: ids.classifications['crm_pipeline']?.toString() } : {}
                });
                viewCount++;
            }
        }
    }
    console.log(`   ✅ ${envDefs.length} environments + ${viewCount} views`);

    console.log('   (Line schemas skipped — no invoice entities)');

    // =========== 7. DEMO RECORDS (Part 1) ===========
    console.log('\n📊 Creating demo records...');
    const rec = async (entitySlug, title, customs = {}, extras = {}) => {
        const cf = Object.entries(customs).map(([name, value]) => ({ field_id: f[name], value }));
        return upsertDoc(db.Record, { entityId: E[entitySlug], title }, {
            entityId: E[entitySlug], title, computedTitle: title, customFields: cf, createdBy: uid, ...extras
        });
    };

    // Contacts
    const contactsData = [
        { nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@acme.com', telephone: '0612345678', fonction: 'Directeur Général' },
        { nom: 'Martin', prenom: 'Sophie', email: 'smartin@techcorp.fr', telephone: '0623456789', fonction: 'CTO' },
        { nom: 'Bernard', prenom: 'Luc', email: 'lbernard@innovate.io', telephone: '0634567890', fonction: 'Lead Dev' },
        { nom: 'Dubois', prenom: 'Marie', email: 'mdubois@globalcorp.net', telephone: '0645678901', fonction: 'Acheteuse IT' }
    ];
    const contacts = [];
    for (const c of contactsData) {
        contacts.push(await rec('contacts', `${c.prenom} ${c.nom}`, c));
    }

    // Entreprises
    const entreprisesData = [
        { siret: '12345678900010', site_web: 'acme.com', adresse: '1 rue de Paris\n75001 Paris' },
        { siret: '98765432100021', site_web: 'techcorp.fr', adresse: '15 avenue Jean Jaurès\n69007 Lyon' }
    ];
    const entreprises = [];
    for (let i = 0; i < entreprisesData.length; i++) {
        entreprises.push(await rec('entreprises', ['Acme Corp', 'TechCorp France'][i], entreprisesData[i]));
    }

    // =========== 8. DEMO RECORDS (Part 2) ===========
    const pipelineOpts = ids.classifications['crm_pipeline_opts'] || [];
    
    // Opportunités
    const oppsData = [
        { title: 'Refonte Site Web Acme', montant: 15000, prob: 20, stage: 0, cIdx: 0, eIdx: 0 },
        { title: 'Déploiement ERP TechCorp', montant: 45000, prob: 60, stage: 2, cIdx: 1, eIdx: 1 },
        { title: 'Licences SaaS GlobalCorp', montant: 8000, prob: 90, stage: 3, cIdx: 3, eIdx: 0 }
    ];
    const opps = [];
    for (const o of oppsData) {
        const stageOpt = pipelineOpts[o.stage];
        opps.push(await rec('opportunites', o.title, { montant: o.montant, probabilite: o.prob, date_cloture: new Date(Date.now() + 30 * 86400000) }, {
            relations: [
                { relationKey: rk['opportunites__contacts'], value: contacts[o.cIdx]._id },
                { relationKey: rk['opportunites__entreprises'], value: entreprises[o.eIdx]._id }
            ],
            classificationValues: stageOpt ? [{ classificationId: ids.classifications['crm_pipeline'], optionId: stageOpt._id, label: stageOpt.label, color: stageOpt.color }] : []
        }));
    }

    // Connect contacts and entreprises
    await db.Record.findByIdAndUpdate(contacts[0]._id, { $push: { relations: { relationKey: rk['contacts__entreprises'], value: entreprises[0]._id } } });
    await db.Record.findByIdAndUpdate(contacts[1]._id, { $push: { relations: { relationKey: rk['contacts__entreprises'], value: entreprises[1]._id } } });

    // Activités
    await rec('activites', 'Appel découverte - Jean Dupont', { date_activite: new Date(), compte_rendu: 'Bon échange, budget validé pour Q3.' }, {
        relations: [{ relationKey: rk['activites__contacts'], value: contacts[0]._id }, { relationKey: rk['activites__opportunites'], value: opps[0]._id }]
    });

    console.log('   ✅ Demo records created');

    // =========== 9. DOCUMENT TEMPLATES + SMART DOC TEMPLATES + DOC-LISTING VIEWS ===========
    // Devis/Contrats/Factures are DOCUMENT TEMPLATES linked to Entreprises/Opportunités
    // (like ordonnances for patients — NOT standalone entities)
    console.log('\n📄 Creating document templates & SmartDoc configs...');

    // -- 9a. Document Templates (isTemplate: true) --
    const devisDocTpl = await upsertDoc(db.Document, { name: 'Devis Commercial', isTemplate: true }, {
        name: 'Devis Commercial', isTemplate: true, format: 'A4', orientation: 'portrait', status: 'published',
        entityIds: [E['entreprises'], E['opportunites']].filter(Boolean),
        pages: [{
            order: 0,
            content: `<div style="font-family:Inter,sans-serif;padding:40px;">
  <div style="display:flex;justify-content:space-between;margin-bottom:40px;">
    <div><h1 style="font-size:28px;color:#1e293b;margin:0;">DEVIS</h1><p style="color:#64748b;margin:4px 0;">{{entreprises.titre}}</p></div>
    <div style="text-align:right;"><p style="margin:0;font-weight:600;">Date : {{today}}</p></div>
  </div>
  <hr style="border:1px solid #e2e8f0;margin:20px 0;">
  <table style="width:100%;border-collapse:collapse;margin-top:20px;"><thead><tr style="background:#f1f5f9;"><th style="text-align:left;padding:10px;border:1px solid #e2e8f0;">Description</th><th style="padding:10px;border:1px solid #e2e8f0;">Qté</th><th style="padding:10px;border:1px solid #e2e8f0;">P.U. HT</th><th style="padding:10px;border:1px solid #e2e8f0;">Total HT</th></tr></thead><tbody><tr><td style="padding:10px;border:1px solid #e2e8f0;">Prestation</td><td style="padding:10px;border:1px solid #e2e8f0;text-align:center;">1</td><td style="padding:10px;border:1px solid #e2e8f0;text-align:right;">0,00 €</td><td style="padding:10px;border:1px solid #e2e8f0;text-align:right;">0,00 €</td></tr></tbody></table>
</div>`
        }],
        createdBy: uid
    });

    const contratDocTpl = await upsertDoc(db.Document, { name: 'Contrat de Service', isTemplate: true }, {
        name: 'Contrat de Service', isTemplate: true, format: 'A4', orientation: 'portrait', status: 'published',
        entityIds: [E['entreprises']].filter(Boolean),
        pages: [
            {
                order: 0,
                content: `<div style="font-family:Inter,sans-serif;padding:40px;color:#1e293b;line-height:1.6;">
  <h1 style="text-align:center;color:#0f172a;font-size:24px;font-weight:700;margin-bottom:30px;text-transform:uppercase;letter-spacing:0.05em;">Contrat de Prestation de Services</h1>
  
  <h2 style="color:#0f172a;font-size:16px;font-weight:600;margin-top:20px;margin-bottom:10px;border-bottom:1px solid #e2e8f0;padding-bottom:5px;">Entre les soussignés :</h2>
  
  <p style="margin:6px 0;"><strong>Nom de l'entreprise (Le Client) :</strong>&nbsp;{{entreprises.title}} - {{entreprises.siret}}</p>
  <p style="margin:6px 0;"><strong>Adresse : </strong>{{entreprises.adresse}}</p>
  <p style="margin:6px 0;"><strong>Contact : </strong>{{entreprises.contact}} , <strong>Email</strong> : {{entreprises.contact.email}}</p>
  <p style="margin:6px 0;"><strong>Représentée par :</strong>&nbsp;{{entreprises.representant}}&nbsp; , en qualité de Gérant</p>
  
  <p style="margin:12px 0;font-style:italic;color:#64748b;">Ci-après dénommée "Le Client",</p>
  
  <p style="text-align:center;font-weight:700;margin:15px 0;">Et</p>
  
  <p style="margin:6px 0;"><strong>L'entreprise (Le Prestataire) : </strong>{{company.name}}</p>
  <p style="margin:6px 0;"><strong>SIRET : </strong>{{company.number}}</p>
  <p style="margin:6px 0;"><strong>Adresse : </strong>{{company.address}}</p>
  <p style="margin:6px 0;"><strong>Représentée par : </strong>{{company.representative}}</p>
  
  <p style="margin:12px 0;font-style:italic;color:#64748b;">Ci-après dénommé "Le Prestataire",</p>
  
  <h2 style="color:#0f172a;font-size:16px;font-weight:600;margin-top:25px;margin-bottom:10px;border-bottom:1px solid #e2e8f0;padding-bottom:5px;">Préambule</h2>
  <p style="margin:10px 0;">Le présent contrat a pour objet de définir les termes et conditions selon lesquels le Prestataire fournira des services au Client.</p>
  
  <h2 style="color:#0f172a;font-size:16px;font-weight:600;margin-top:25px;margin-bottom:10px;border-bottom:1px solid #e2e8f0;padding-bottom:5px;">Article 1 : Objet du Contrat</h2>
  <p style="margin:10px 0;">Le Prestataire s'engage à fournir les services suivants : [Description des services].</p>
  
  <h2 style="color:#0f172a;font-size:16px;font-weight:600;margin-top:25px;margin-bottom:10px;border-bottom:1px solid #e2e8f0;padding-bottom:5px;">Article 2 : Durée du Contrat</h2>
  <p style="margin:10px 0;">Le présent contrat prend effet à compter du [Date de début] pour une durée de [Durée du contrat].</p>
  
  <h2 style="color:#0f172a;font-size:16px;font-weight:600;margin-top:25px;margin-bottom:10px;border-bottom:1px solid #e2e8f0;padding-bottom:5px;">Article 3 : Conditions Financières</h2>
  <p style="margin:10px 0;">Le Client s'engage à payer au Prestataire la somme de [Montant] pour les services rendus, selon les modalités suivantes : [Modalités de paiement].</p>
</div>`
            },
            {
                order: 1,
                content: `<div style="font-family:Inter,sans-serif;padding:40px;color:#1e293b;line-height:1.6;">
  <h2 style="color:#0f172a;font-size:16px;font-weight:600;margin-top:0;margin-bottom:10px;border-bottom:1px solid #e2e8f0;padding-bottom:5px;">Article 4 : Obligations du Prestataire</h2>
  <ul style="margin:10px 0;padding-left:20px;list-style-type:disc;">
    <li style="margin:6px 0;">Fournir les services conformément aux normes professionnelles.</li>
    <li style="margin:6px 0;">Respecter les délais convenus.</li>
    <li style="margin:6px 0;">Maintenir la confidentialité des informations du Client.</li>
  </ul>
  
  <h2 style="color:#0f172a;font-size:16px;font-weight:600;margin-top:25px;margin-bottom:10px;border-bottom:1px solid #e2e8f0;padding-bottom:5px;">Article 5 : Obligations du Client</h2>
  <ul style="margin:10px 0;padding-left:20px;list-style-type:disc;">
    <li style="margin:6px 0;">Fournir toutes les informations nécessaires à la réalisation des services.</li>
    <li style="margin:6px 0;">Effectuer les paiements selon les modalités convenues.</li>
  </ul>
  
  <h2 style="color:#0f172a;font-size:16px;font-weight:600;margin-top:25px;margin-bottom:10px;border-bottom:1px solid #e2e8f0;padding-bottom:5px;">Article 6 : Résiliation</h2>
  <p style="margin:10px 0;">Le présent contrat peut être résilié par l'une ou l'autre des parties en cas de manquement grave aux obligations contractuelles, après mise en demeure restée sans effet pendant [Délai de préavis].</p>
  
  <h2 style="color:#0f172a;font-size:16px;font-weight:600;margin-top:25px;margin-bottom:10px;border-bottom:1px solid #e2e8f0;padding-bottom:5px;">Article 7 : Loi Applicable</h2>
  <p style="margin:10px 0;">Le présent contrat est soumis à la loi de [Pays/Région].</p>
  
  <h2 style="color:#0f172a;font-size:16px;font-weight:600;margin-top:25px;margin-bottom:10px;border-bottom:1px solid #e2e8f0;padding-bottom:5px;">Article 8 : Litiges</h2>
  <p style="margin:10px 0;">En cas de litige, les parties s'engagent à rechercher une solution amiable avant de recourir aux tribunaux compétents de [Lieu].</p>
  
  <h2 style="color:#0f172a;font-size:16px;font-weight:600;margin-top:35px;margin-bottom:20px;border-bottom:1px solid #e2e8f0;padding-bottom:5px;">Signatures</h2>
  <p style="margin:10px 0;">Fait à [Lieu], le [Date].</p>
  
  <div style="display:flex;justify-content:space-between;margin-top:30px;">
    <div style="width:45%;">
      <p style="margin:0;font-weight:600;">Le Prestataire :</p>
      <p style="margin:40px 0 0 0;color:#64748b;font-size:12px;">_________________________</p>
    </div>
    <div style="width:45%;">
      <p style="margin:0;font-weight:600;">Le Client :</p>
      <p style="margin:40px 0 0 0;color:#64748b;font-size:12px;">_________________________</p>
    </div>
  </div>
</div>`
            }
        ],
        createdBy: uid
    });

    const factureDocTpl = await upsertDoc(db.Document, { name: 'Facture', isTemplate: true }, {
        name: 'Facture', isTemplate: true, format: 'A4', orientation: 'portrait', status: 'published',
        entityIds: [E['entreprises']].filter(Boolean),
        pages: [{
            order: 0,
            content: `<div style="font-family:Inter,sans-serif;padding:40px;">
  <div style="display:flex;justify-content:space-between;margin-bottom:40px;">
    <div><h1 style="font-size:28px;color:#ef4444;margin:0;">FACTURE</h1><p style="color:#64748b;margin:4px 0;">{{entreprises.titre}}</p></div>
    <div style="text-align:right;"><p style="margin:0;font-weight:600;">Date : {{today}}</p></div>
  </div>
  <hr style="border:1px solid #e2e8f0;margin:20px 0;">
  <table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#fef2f2;"><th style="text-align:left;padding:10px;border:1px solid #e2e8f0;">Description</th><th style="padding:10px;border:1px solid #e2e8f0;">Total HT</th></tr></thead><tbody><tr><td style="padding:10px;border:1px solid #e2e8f0;">Prestation</td><td style="text-align:right;padding:10px;border:1px solid #e2e8f0;">0,00 €</td></tr></tbody></table>
</div>`
        }],
        createdBy: uid
    });

    // -- 9b. SmartDoc Templates (linked to Entreprises / Opportunités) --
    const smartDocDefs = [
        { name: 'Devis Commercial', entitySlug: 'entreprises', docTpl: devisDocTpl, icon: 'solar:document-text-bold-duotone', color: '#f59e0b' },
        { name: 'Contrat de Service', entitySlug: 'entreprises', docTpl: contratDocTpl, icon: 'solar:diploma-bold-duotone', color: '#ec4899' },
        { name: 'Facture', entitySlug: 'entreprises', docTpl: factureDocTpl, icon: 'solar:bill-list-bold-duotone', color: '#ef4444' }
    ];

    const smartDocIds = {};
    for (const sd of smartDocDefs) {
        if (!E[sd.entitySlug] || !sd.docTpl) continue;
        const smartDoc = await upsertDoc(db.SmartDocTemplate, { name: sd.name, entityId: E[sd.entitySlug] }, {
            name: sd.name, description: `Génération de ${sd.name.toLowerCase()}`,
            icon: sd.icon, color: sd.color,
            documentId: sd.docTpl._id, entityId: E[sd.entitySlug],
            outputFormat: 'pdf', active: true, order: 0,
            inputFields: []
        });
        smartDocIds[sd.name] = smartDoc._id;
    }
    console.log(`   ✅ ${Object.keys(smartDocIds).length} SmartDoc templates`);

    // -- 9c. Demo generated doc attachments on Entreprise records --
    // Attach generated PDFs to entreprise records (like ordonnances on patient records)
    const demoAtts = [
        { record: entreprises[0], tplName: 'Devis Commercial', files: ['Devis_Refonte_Web_Acme.pdf', 'Devis_Maintenance_Annuelle.pdf'] },
        { record: entreprises[1], tplName: 'Devis Commercial', files: ['Devis_Deploiement_ERP.pdf'] },
        { record: entreprises[0], tplName: 'Contrat de Service', files: ['Contrat_Prestation_2026_Acme.pdf'] },
        { record: entreprises[1], tplName: 'Contrat de Service', files: ['Contrat_Support_TechCorp.pdf'] },
        { record: entreprises[0], tplName: 'Facture', files: ['Facture_FAC-2026-001.pdf'] },
        { record: entreprises[1], tplName: 'Facture', files: ['Facture_FAC-2026-002.pdf', 'Facture_FAC-2026-003.pdf'] }
    ];
    for (const da of demoAtts) {
        const tplId = smartDocIds[da.tplName];
        if (!tplId || !da.record) continue;
        for (let i = 0; i < da.files.length; i++) {
            const att = {
                filename: `demo_gen_${Date.now()}_${i}.pdf`,
                originalName: da.files[i],
                mimeType: 'application/pdf',
                size: 45000 + Math.floor(Math.random() * 80000),
                category: 'pdf',
                isGenerated: true,
                generatedFrom: tplId.toString(),
                generatedFromName: da.tplName,
                uploadedAt: new Date(Date.now() - (da.files.length - i) * 5 * 86400000),
                uploadedBy: uid
            };

            // Write the valid mock PDF file on disk under the correct tenant's folder
            try {
                const tenantId = conn.name.split('_').pop();
                const outputDir = path.join(__dirname, '../private_uploads/attachments', String(tenantId));
                fs.mkdirSync(outputDir, { recursive: true });
                const mockPdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 595 842] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 100 >>
stream
BT
/F1 18 Tf
50 750 Td
(Document de demonstration CRM) Tj
/F1 12 Tf
0 -30 Td
(Ce document a ete genere automatiquement par le script de demonstration.) Tj
0 -20 Td
(Fichier PDF valide cree avec succes.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000242 00000 n 
0000000309 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
460
%%EOF`;
                fs.writeFileSync(path.join(outputDir, att.filename), mockPdf, 'utf8');
            } catch (err) {
                console.error('[seed-crm] Error writing mock PDF file:', err);
            }

            await db.Record.findByIdAndUpdate(da.record._id, { $push: { attachments: att } });
        }
    }
    console.log('   ✅ Demo generated docs attached to Entreprise records');

    // -- 9d. Doc-listing Views in Pipeline Commercial sidebar --
    const pipelineSpace = await db.Space.findOne({ slug: 'pipeline-commercial' }).lean();
    if (pipelineSpace) {
        const docListingDefs = [
            { tplName: 'Devis Commercial', name: 'Devis', icon: 'solar:document-text-bold-duotone', color: '#f59e0b' },
            { tplName: 'Contrat de Service', name: 'Contrats', icon: 'solar:diploma-bold-duotone', color: '#ec4899' },
            { tplName: 'Facture', name: 'Factures', icon: 'solar:bill-list-bold-duotone', color: '#ef4444' }
        ];
        for (let di = 0; di < docListingDefs.length; di++) {
            const dl = docListingDefs[di];
            const tplId = smartDocIds[dl.tplName];
            if (!tplId || !E['entreprises']) continue;
            const dlSlug = `doc-listing-${dl.tplName.toLowerCase().replace(/\s+/g, '-')}-${pipelineSpace._id.toString().slice(-6)}`;
            await upsertDoc(db.View, { slug: dlSlug }, {
                name: dl.name, slug: dlSlug, entity: E['entreprises'],
                icon: dl.icon, color: dl.color, viewType: 'doc-listing',
                order: 10 + di, spaces: [pipelineSpace._id], folders: [],
                settings: { smartDocTemplateId: tplId },
                createdBy: uid
            });
        }
        console.log('   ✅ Doc-listing views created in Pipeline');
    }

    console.log('\n🎉 CRM Preset installed successfully!');
}

module.exports = { PRESET, meta, install };
