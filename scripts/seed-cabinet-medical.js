/**
 * seed-cabinet-medical.js
 * Complete Cabinet Médical preset
 */
const mongoose = require('mongoose');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();

const PRESET = 'cabinet-medical';
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
        EntityForm: M('EntityForm', s({ entityId: mongoose.Schema.Types.ObjectId, name: String, layout: Object, status: String, isDefault: Boolean, order: Number, meta: Object }), 'entityforms'),
        Environment: M('Environment', s({ name: String, slug: String, icon: String, color: String, order: Number, isDefault: Boolean, meta: Object }), 'environments'),
        Space: M('Space', s({ name: String, slug: String, icon: String, color: String, order: Number, environmentId: mongoose.Schema.Types.ObjectId, owner: mongoose.Schema.Types.ObjectId, members: Array, meta: Object }), 'spaces'),
        Folder: M('Folder', s({ name: String, slug: String, type: String, icon: String, color: String, order: Number, spaces: [mongoose.Schema.Types.ObjectId], parentFolders: [mongoose.Schema.Types.ObjectId], meta: Object }), 'folders'),
        Record: M('Record', s({ entityId: mongoose.Schema.Types.ObjectId, title: String, computedTitle: String, description: String, status: String, customFields: [{ field_id: mongoose.Schema.Types.ObjectId, value: mongoose.Schema.Types.Mixed }], relations: [{ relationKey: String, value: mongoose.Schema.Types.Mixed }], classificationValues: Array, date: Date, meta: Object }), 'records'),
        Document: M('Document', s({ name: String, format: String, orientation: String, pages: Array, isTemplate: Boolean, entityId: mongoose.Schema.Types.ObjectId, entityIds: [mongoose.Schema.Types.ObjectId], createdBy: mongoose.Schema.Types.ObjectId, status: String, tags: [String], collections: Array, contentBlocks: Array, meta: Object }), 'documents'),
        SmartDocTemplate: M('SmartDocTemplate', s({ name: String, description: String, icon: String, color: String, documentId: mongoose.Schema.Types.ObjectId, entityId: mongoose.Schema.Types.ObjectId, inputFields: Array, outputFormat: String, order: Number, active: Boolean, meta: Object }), 'smartdoctemplates'),
        LineSchema: M('LineSchema', s({ name: String, slug: String, description: String, appliesTo: Object, sourceEntityId: mongoose.Schema.Types.ObjectId, lineTypes: [String], columns: Array, totals: Object, defaultLineType: String, meta: Object }), 'lineschemas'),
        View: M('View', s({ name: String, slug: String, entity: mongoose.Schema.Types.ObjectId, cockpitId: mongoose.Schema.Types.ObjectId, icon: String, color: String, order: Number, viewType: String, spaces: [mongoose.Schema.Types.ObjectId], folders: [mongoose.Schema.Types.ObjectId], filters: Array, settings: Object, createdBy: mongoose.Schema.Types.ObjectId, meta: Object }), 'views'),
        CardTemplate: M('CardTemplate', s({ name: String, entityId: mongoose.Schema.Types.ObjectId, context: String, isDefault: Boolean, presetSlug: String, layout: Object, createdBy: mongoose.Schema.Types.ObjectId, meta: Object }), 'cardtemplates'),
    };
}

// ============================================
// INSTALL FUNCTION
// ============================================
async function install(conn, userId, presetSlug) {
    const db = registerModels(conn);
    const ids = {}; // store created IDs
    const uid = userId ? new mongoose.Types.ObjectId(userId) : null;

    // =========== 0. CLEANUP ORPHANED DATA ===========
    console.log('\n🧹 Cleaning up orphaned data...');
    // Find all entity IDs that actually exist
    const existingEntities = await db.Entity.find({}).select('_id').lean();
    const existingEntityIds = new Set(existingEntities.map(e => e._id.toString()));

    // Find and delete views referencing non-existent entities
    const allViews = await db.View.find({ entity: { $exists: true, $ne: null } }).lean();
    const orphanedViewIds = allViews
        .filter(v => v.entity && !existingEntityIds.has(v.entity.toString()))
        .map(v => v._id);

    if (orphanedViewIds.length > 0) {
        await db.View.deleteMany({ _id: { $in: orphanedViewIds } });
        console.log(`   🗑️  Removed ${orphanedViewIds.length} orphaned views`);
    }

    // Clean up orphaned spaces (spaces with no remaining views or folders)
    const remainingViews = await db.View.find({}).select('spaces folders').lean();
    const usedSpaceIds = new Set();
    remainingViews.forEach(v => {
        (v.spaces || []).forEach(s => usedSpaceIds.add(s.toString()));
    });
    const remainingFolders = await db.Folder.find({}).select('spaces').lean();
    remainingFolders.forEach(f => {
        (f.spaces || []).forEach(s => usedSpaceIds.add(s.toString()));
    });
    const allSpaces = await db.Space.find({}).lean();
    const orphanedSpaces = allSpaces.filter(s => !usedSpaceIds.has(s._id.toString()));
    if (orphanedSpaces.length > 0) {
        await db.Space.deleteMany({ _id: { $in: orphanedSpaces.map(s => s._id) } });
        console.log(`   🗑️  Removed ${orphanedSpaces.length} orphaned spaces`);
    }

    // Also clean up orphaned records (records whose entity was deleted)
    const orphanedRecords = await db.Record.countDocuments({ entityId: { $nin: [...existingEntityIds].map(id => new mongoose.Types.ObjectId(id)) } });
    if (orphanedRecords > 0) {
        await db.Record.deleteMany({ entityId: { $nin: [...existingEntityIds].map(id => new mongoose.Types.ObjectId(id)) } });
        console.log(`   🗑️  Removed ${orphanedRecords} orphaned records`);
    }

    console.log('   ✅ Cleanup complete');

    // =========== 1. FIELD TEMPLATES ===========
    console.log('\n📋 Creating field templates...');
    const fieldDefs = [
        // Patient fields
        { name: 'nom', label: 'Nom', type: 'string', category: 'popular', ui: { icon: 'solar:user-bold-duotone', width: 'half' } },
        { name: 'prenom', label: 'Prénom', type: 'string', category: 'popular', ui: { icon: 'solar:user-bold-duotone', width: 'half' } },
        { name: 'date_naissance', label: 'Date de naissance', type: 'date', category: 'dates', ui: { icon: 'solar:calendar-bold-duotone', width: 'half' } },
        { name: 'sexe', label: 'Sexe', type: 'select', type_config: { options: [{ label: 'Homme', value: 'M' }, { label: 'Femme', value: 'F' }] }, ui: { icon: 'solar:user-id-bold-duotone', width: 'half' } },
        { name: 'telephone', label: 'Téléphone', type: 'string', subtype: 'tel', ui: { icon: 'solar:phone-bold-duotone', width: 'half' } },
        { name: 'email', label: 'Email', type: 'string', subtype: 'email', ui: { icon: 'solar:letter-bold-duotone', width: 'half' } },
        { name: 'adresse', label: 'Adresse', type: 'text', ui: { icon: 'solar:map-point-bold-duotone', width: 'full', rows: 1 } },
        { name: 'numero_secu', label: 'N° Sécurité Sociale', type: 'string', ui: { icon: 'solar:shield-check-bold-duotone', width: 'half' } },
        { name: 'groupe_sanguin', label: 'Groupe sanguin', type: 'select', type_config: { options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(v => ({ label: v, value: v })) }, ui: { icon: 'solar:dropper-bold-duotone', width: 'half' } },
        { name: 'allergies', label: 'Allergies', type: 'text', ui: { icon: 'solar:danger-bold-duotone', width: 'full', rows: 2 } },
        { name: 'antecedents', label: 'Antécédents médicaux', type: 'text', ui: { icon: 'solar:clipboard-text-bold-duotone', width: 'full', rows: 3 } },
        { name: 'medecin_traitant', label: 'Médecin traitant', type: 'string', ui: { icon: 'solar:stethoscope-bold-duotone', width: 'half' } },
        { name: 'mutuelle', label: 'Mutuelle', type: 'string', ui: { icon: 'solar:shield-bold-duotone', width: 'half' } },
        // Consultation fields
        { name: 'motif', label: 'Motif de consultation', type: 'text', ui: { icon: 'solar:chat-round-dots-bold-duotone', width: 'full', rows: 1 } },
        { name: 'symptomes', label: 'Symptômes', type: 'text', ui: { icon: 'solar:heart-pulse-bold-duotone', width: 'full', rows: 3 } },
        { name: 'diagnostic', label: 'Diagnostic', type: 'text', ui: { icon: 'solar:clipboard-check-bold-duotone', width: 'full', rows: 1 } },
        { name: 'examen_clinique', label: 'Examen clinique', type: 'text', ui: { icon: 'solar:magnifer-bold-duotone', width: 'full', rows: 3 } },
        { name: 'plan_traitement', label: 'Plan de traitement', type: 'text', ui: { icon: 'solar:document-text-bold-duotone', width: 'full', rows: 3 } },
        // Vitals
        { name: 'poids', label: 'Poids (kg)', type: 'number', ui: { icon: 'solar:weights-bold-duotone', width: 'half' } },
        { name: 'taille_cm', label: 'Taille (cm)', type: 'number', ui: { icon: 'solar:ruler-bold-duotone', width: 'half' } },
        { name: 'tension', label: 'Tension artérielle', type: 'string', ui: { icon: 'solar:heart-bold-duotone', width: 'half', placeholder: '12/8' } },
        { name: 'temperature', label: 'Température (°C)', type: 'number', ui: { icon: 'solar:temperature-bold-duotone', width: 'half' } },
        { name: 'frequence_cardiaque', label: 'Fréquence cardiaque', type: 'number', ui: { icon: 'solar:heart-pulse-2-bold-duotone', width: 'half' } },
        // Prescription
        { name: 'posologie', label: 'Posologie', type: 'text', ui: { icon: 'solar:pills-bold-duotone', width: 'full', rows: 1 } },
        { name: 'duree_traitement', label: 'Durée du traitement', type: 'string', ui: { icon: 'solar:clock-circle-bold-duotone', width: 'half' } },
        { name: 'notes_prescription', label: 'Notes', type: 'text', ui: { icon: 'solar:notes-bold-duotone', width: 'full', rows: 2 } },
        // Medication
        { name: 'forme', label: 'Forme', type: 'select', type_config: { options: ['Comprimé', 'Gélule', 'Sirop', 'Injectable', 'Crème', 'Suppositoire', 'Gouttes', 'Patch', 'Inhalation'].map(v => ({ label: v, value: slug(v) })) }, ui: { icon: 'solar:pills-bold-duotone', width: 'half' } },
        { name: 'dosage', label: 'Dosage', type: 'string', ui: { icon: 'solar:test-tube-bold-duotone', width: 'half', placeholder: '500mg' } },
        { name: 'prix_vente', label: 'Prix de vente', type: 'number', ui: { icon: 'solar:dollar-bold-duotone', width: 'half' } },
        { name: 'stock_min', label: 'Stock minimum', type: 'number', ui: { icon: 'solar:box-bold-duotone', width: 'half' } },
        { name: 'stock_actuel', label: 'Stock actuel', type: 'number', ui: { icon: 'solar:box-bold-duotone', width: 'half' } },
        // Invoice / Payment
        { name: 'montant_total', label: 'Montant total', type: 'number', ui: { icon: 'solar:dollar-bold-duotone', width: 'half' } },
        { name: 'montant_paye', label: 'Montant payé', type: 'number', ui: { icon: 'solar:wallet-bold-duotone', width: 'half' } },
        { name: 'date_echeance', label: "Date d'échéance", type: 'date', ui: { icon: 'solar:alarm-bold-duotone', width: 'half' } },
        { name: 'mode_paiement', label: 'Mode de paiement', type: 'select', type_config: { options: [{ label: 'Espèces', value: 'cash' }, { label: 'Carte', value: 'card' }, { label: 'Virement', value: 'transfer' }, { label: 'Assurance', value: 'insurance' }] }, ui: { icon: 'solar:card-bold-duotone', width: 'half' } },
        { name: 'reference_paiement', label: 'Référence', type: 'string', ui: { icon: 'solar:hashtag-bold-duotone', width: 'half' } },
        // Lab
        { name: 'type_analyse', label: "Type d'analyse", type: 'string', ui: { icon: 'solar:test-tube-bold-duotone', width: 'half' } },
        { name: 'resultats_labo', label: 'Résultats', type: 'text', ui: { icon: 'solar:document-text-bold-duotone', width: 'full', rows: 5 } },
        { name: 'valeurs_reference', label: 'Valeurs de référence', type: 'text', ui: { icon: 'solar:chart-bold-duotone', width: 'full', rows: 2 } },
        { name: 'interpretation', label: 'Interprétation', type: 'text', ui: { icon: 'solar:clipboard-check-bold-duotone', width: 'full', rows: 2 } },
        // Staff
        { name: 'specialite', label: 'Spécialité', type: 'string', ui: { icon: 'solar:stethoscope-bold-duotone', width: 'half' } },
        { name: 'numero_rpps', label: 'N° RPPS', type: 'string', ui: { icon: 'solar:document-bold-duotone', width: 'half' } },
        // Generic
        { name: 'notes_generales', label: 'Notes', type: 'text', ui: { icon: 'solar:notes-bold-duotone', width: 'full', rows: 3 } },
        { name: 'date_rdv', label: 'Date du rendez-vous', type: 'date', type_config: { includeTime: true }, ui: { icon: 'solar:calendar-bold-duotone', width: 'half' } },
        { name: 'duree_rdv', label: 'Durée (min)', type: 'number', ui: { icon: 'solar:clock-circle-bold-duotone', width: 'half' } },
        { name: 'objet_rdv', label: 'Objet', type: 'text', ui: { icon: 'solar:chat-round-dots-bold-duotone', width: 'full', rows: 1 } },
        // Insurance
        { name: 'numero_contrat', label: 'N° Contrat', type: 'string', ui: { icon: 'solar:document-bold-duotone', width: 'half' } },
        { name: 'compagnie', label: 'Compagnie', type: 'string', ui: { icon: 'solar:buildings-bold-duotone', width: 'half' } },
        { name: 'taux_remboursement', label: 'Taux remboursement (%)', type: 'number', ui: { icon: 'solar:tag-bold-duotone', width: 'half' } },
        // MedicalDocument
        { name: 'type_document', label: 'Type de document', type: 'string', ui: { icon: 'solar:file-text-bold-duotone', width: 'half' } },
        // TreatmentPlan
        { name: 'objectif', label: 'Objectif', type: 'text', ui: { icon: 'solar:target-bold-duotone', width: 'full', rows: 2 } },
        { name: 'protocole', label: 'Protocole', type: 'text', ui: { icon: 'solar:document-text-bold-duotone', width: 'full', rows: 3 } },
        // StockItem
        { name: 'categorie_stock', label: 'Catégorie', type: 'select', type_config: { options: [{ label: 'Médicament', value: 'medication' }, { label: 'Consommable', value: 'consumable' }, { label: 'Matériel', value: 'equipment' }] }, ui: { icon: 'solar:tag-bold-duotone', width: 'half' } },
        { name: 'fournisseur', label: 'Fournisseur', type: 'string', ui: { icon: 'solar:buildings-bold-duotone', width: 'half' } },
        { name: 'prix_achat', label: "Prix d'achat", type: 'number', ui: { icon: 'solar:tag-price-bold-duotone', width: 'half' } },
        // ── Computed / Dynamic fields ──
        {
            name: 'age_patient', label: 'Âge', type: 'number', category: 'computed', ui: { icon: 'solar:calendar-bold-duotone', width: 'half' }, color: '#3b82f6',
            formula: { fromFunction: 'age', sourceFields: { birthDate: '__date_naissance__' }, dependsOn: ['date_naissance'] },
            render: { display: { table: 'badge', card: 'badge' } }
        },
        {
            name: 'imc', label: 'IMC', type: 'number', category: 'computed', ui: { icon: 'solar:heart-pulse-bold-duotone', width: 'half' }, color: '#00ab55',
            formula: { fromFunction: 'expression', expression: '%poids% / ((%taille_cm% / 100) * (%taille_cm% / 100))', sourceFields: {}, dependsOn: ['poids', 'taille_cm'] },
            render: { display: { table: 'badge', card: 'badge' } }
        },
        {
            name: 'reste_a_payer', label: 'Reste à payer', type: 'number', category: 'computed', ui: { icon: 'solar:wallet-bold-duotone', width: 'half' }, color: '#ef4444',
            formula: { fromFunction: 'expression', expression: '%montant_total% - %montant_paye%', sourceFields: {}, dependsOn: ['montant_total', 'montant_paye'] },
            render: { display: { table: 'currency', card: 'currency' } }
        },
        {
            name: 'marge_stock', label: 'Marge', type: 'number', category: 'computed', ui: { icon: 'solar:chart-bold-duotone', width: 'half' }, color: '#22c55e',
            formula: { fromFunction: 'expression', expression: '%prix_vente% - %prix_achat%', sourceFields: {}, dependsOn: ['prix_vente', 'prix_achat'] },
            render: { display: { table: 'currency', card: 'currency' } }
        },
    ];

    ids.fields = {};
    for (const f of fieldDefs) {
        const doc = await upsertDoc(db.FieldTemplate, { name: f.name, 'meta.createdByPreset': PRESET }, {
            ...f, isCustom: true, isSystem: false, category: f.category || 'other'
        });
        ids.fields[f.name] = doc._id;
    }
    console.log(`   ✅ ${Object.keys(ids.fields).length} field templates`);

    // ── Resolve computed field formula references (replace placeholders with actual field IDs) ──
    const computedFormulaUpdates = [
        { fieldName: 'age_patient', update: { 'formula.sourceFields.birthDate': ids.fields.date_naissance.toString() } },
    ];
    for (const cfu of computedFormulaUpdates) {
        if (ids.fields[cfu.fieldName]) {
            await db.FieldTemplate.findByIdAndUpdate(ids.fields[cfu.fieldName], { $set: cfu.update });
        }
    }

    // =========== 2. CLASSIFICATIONS ===========
    console.log('\n🏷️  Creating classifications...');
    const classDefs = [
        {
            name: 'Statut RDV', key: 'rdv_status', options: [
                { label: 'Planifié', color: '#3b82f6', type: 'start', order: 0 },
                { label: 'Confirmé', color: '#8b5cf6', type: 'active', order: 1 },
                { label: 'Terminé', color: '#22c55e', type: 'completed', order: 2 },
                { label: 'Annulé', color: '#ef4444', type: 'normal', order: 3 },
                { label: 'Non présenté', color: '#f97316', type: 'normal', order: 4 }
            ]
        },
        {
            name: 'Type de consultation', key: 'consult_type', options: [
                { label: 'Générale', color: '#3b82f6', order: 0 },
                { label: 'Urgence', color: '#ef4444', order: 1 },
                { label: 'Suivi', color: '#22c55e', order: 2 },
                { label: 'Contrôle', color: '#8b5cf6', order: 3 }
            ]
        },
        {
            name: 'Statut facture', key: 'invoice_status', options: [
                { label: 'Brouillon', color: '#94a3b8', type: 'start', order: 0 },
                { label: 'Envoyée', color: '#3b82f6', type: 'active', order: 1 },
                { label: 'Payée', color: '#22c55e', type: 'completed', order: 2 },
                { label: 'En retard', color: '#ef4444', type: 'normal', order: 3 }
            ]
        },
        {
            name: 'Mode de paiement', key: 'payment_method', options: [
                { label: 'Espèces', color: '#22c55e', order: 0 },
                { label: 'Carte bancaire', color: '#3b82f6', order: 1 },
                { label: 'Virement', color: '#8b5cf6', order: 2 },
                { label: 'Assurance', color: '#f59e0b', order: 3 }
            ]
        },
        {
            name: 'Rôle personnel', key: 'staff_role', options: [
                { label: 'Médecin', color: '#3b82f6', order: 0 },
                { label: 'Infirmier(e)', color: '#22c55e', order: 1 },
                { label: 'Secrétaire', color: '#8b5cf6', order: 2 },
                { label: 'Administrateur', color: '#f59e0b', order: 3 }
            ]
        },
        {
            name: 'Tags patient', key: 'patient_tags', allowMultiple: true, options: [
                { label: 'VIP', color: '#f59e0b', icon: 'solar:star-bold', order: 0 },
                { label: 'Chronique', color: '#ef4444', order: 1 },
                { label: 'Risque allergie', color: '#f97316', order: 2 },
                { label: 'Nouveau', color: '#3b82f6', order: 3 }
            ]
        },
        {
            name: 'Type analyse labo', key: 'lab_type', options: [
                { label: 'Sang', color: '#ef4444', order: 0 },
                { label: 'Urine', color: '#f59e0b', order: 1 },
                { label: 'Imagerie', color: '#3b82f6', order: 2 },
                { label: 'Autre', color: '#94a3b8', order: 3 }
            ]
        }
    ];

    ids.classifications = {};
    for (const c of classDefs) {
        const doc = await upsertDoc(db.Classification, { key: c.key, 'meta.createdByPreset': PRESET }, {
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
            name: 'Patient', nameSingular: 'Patient', namePlural: 'Patients', slug: 'patients', icon: 'solar:user-heart-bold-duotone', color: '#3b82f6', fields: ['nom', 'prenom', 'date_naissance', 'sexe', 'telephone', 'email', 'adresse', 'numero_secu', 'groupe_sanguin', 'allergies', 'antecedents', 'medecin_traitant', 'mutuelle', 'age_patient'], statusClassification: null, classifications: ['patient_tags'],
            referenceTitleTokens: [{ t: 'field', id: () => f.prenom }, { t: 'text', v: ' ' }, { t: 'field', id: () => f.nom }]
        },
        {
            name: 'Rendez-vous', nameSingular: 'Rendez-vous', namePlural: 'Rendez-vous', slug: 'rendez-vous', icon: 'solar:calendar-mark-bold-duotone', color: '#8b5cf6', fields: ['date_rdv', 'duree_rdv', 'objet_rdv', 'notes_generales'], statusClassification: 'rdv_status', classifications: [],
            referenceTitleTokens: null
        }, // set after relations
        {
            name: 'Consultation', nameSingular: 'Consultation', namePlural: 'Consultations', slug: 'consultations', icon: 'solar:stethoscope-bold-duotone', color: '#00ab55', fields: ['motif', 'symptomes', 'examen_clinique', 'diagnostic', 'plan_traitement', 'poids', 'taille_cm', 'tension', 'temperature', 'frequence_cardiaque', 'notes_generales', 'imc'], statusClassification: null, classifications: ['consult_type'],
            referenceTitleTokens: null
        }, // set after relations
        {
            name: 'Prescription', nameSingular: 'Prescription', namePlural: 'Prescriptions', slug: 'prescriptions', icon: 'solar:document-medicine-bold-duotone', color: '#e2a03f', fields: ['posologie', 'duree_traitement', 'notes_prescription'], statusClassification: null, classifications: [],
            referenceTitleTokens: null
        }, // set after relations
        {
            name: 'Médicament', nameSingular: 'Médicament', namePlural: 'Médicaments', slug: 'medicaments', icon: 'solar:pills-3-bold-duotone', color: '#ef4444', fields: ['forme', 'dosage', 'prix_vente', 'stock_min', 'stock_actuel', 'notes_generales'], statusClassification: null, classifications: [],
            referenceTitleTokens: [{ t: 'field', id: 'title' }]
        },
        {
            name: 'Facture', nameSingular: 'Facture', namePlural: 'Factures', slug: 'factures', icon: 'solar:bill-list-bold-duotone', color: '#e2a03f', fields: ['montant_total', 'montant_paye', 'date_echeance', 'notes_generales', 'reste_a_payer'], statusClassification: 'invoice_status', classifications: [],
            referenceTitleTokens: null
        }, // set after relations
        {
            name: 'Paiement', nameSingular: 'Paiement', namePlural: 'Paiements', slug: 'paiements', icon: 'solar:wallet-bold-duotone', color: '#22c55e', fields: ['montant_total', 'mode_paiement', 'reference_paiement', 'notes_generales'], statusClassification: 'payment_method', classifications: [],
            referenceTitleTokens: null
        }, // set after relations
        {
            name: 'Assurance', nameSingular: 'Assurance', namePlural: 'Assurances', slug: 'assurances', icon: 'solar:shield-bold-duotone', color: '#3b82f6', fields: ['compagnie', 'numero_contrat', 'taux_remboursement', 'telephone', 'email', 'notes_generales'], statusClassification: null, classifications: [],
            referenceTitleTokens: [{ t: 'field', id: () => f.compagnie }, { t: 'text', v: ' - ' }, { t: 'field', id: () => f.numero_contrat }]
        },
        {
            name: 'Résultat Labo', nameSingular: 'Résultat Labo', namePlural: 'Résultats Labo', slug: 'resultats-labo', icon: 'solar:test-tube-bold-duotone', color: '#f97316', fields: ['type_analyse', 'resultats_labo', 'valeurs_reference', 'interpretation', 'notes_generales'], statusClassification: null, classifications: ['lab_type'],
            referenceTitleTokens: null
        }, // set after relations
        {
            name: 'Document Médical', nameSingular: 'Document Médical', namePlural: 'Documents Médicaux', slug: 'documents-medicaux', icon: 'solar:file-text-bold-duotone', color: '#6366f1', fields: ['type_document', 'notes_generales'], statusClassification: null, classifications: [],
            referenceTitleTokens: null
        }, // set after relations
        {
            name: 'Plan de Traitement', nameSingular: 'Plan de Traitement', namePlural: 'Plans de Traitement', slug: 'plans-traitement', icon: 'solar:clipboard-list-bold-duotone', color: '#0ea5e9', fields: ['objectif', 'protocole', 'duree_traitement', 'notes_generales'], statusClassification: null, classifications: [],
            referenceTitleTokens: null
        }, // set after relations
        {
            name: 'Personnel', nameSingular: 'Membre du Personnel', namePlural: 'Personnel', slug: 'personnel', icon: 'solar:users-group-rounded-bold-duotone', color: '#4361ee', fields: ['nom', 'prenom', 'specialite', 'numero_rpps', 'telephone', 'email'], statusClassification: null, classifications: ['staff_role'],
            referenceTitleTokens: [{ t: 'field', id: () => f.prenom }, { t: 'text', v: ' ' }, { t: 'field', id: () => f.nom }]
        },
        {
            name: 'Stock', nameSingular: 'Article Stock', namePlural: 'Stock', slug: 'stock', icon: 'solar:box-bold-duotone', color: '#94a3b8', fields: ['categorie_stock', 'fournisseur', 'prix_achat', 'prix_vente', 'stock_actuel', 'stock_min', 'notes_generales', 'marge_stock'], statusClassification: null, classifications: [],
            referenceTitleTokens: [{ t: 'field', id: 'title' }]
        },
    ];

    ids.entities = {};
    for (let i = 0; i < entityDefs.length; i++) {
        const e = entityDefs[i];
        const customFieldIds = e.fields.map(fn => f[fn]).filter(Boolean);
        const classIds = e.classifications.map(k => ids.classifications[k]).filter(Boolean);
        const statusCls = e.statusClassification ? ids.classifications[e.statusClassification] : undefined;

        // Resolve referenceTitleTokens (functions → field IDs)
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

        const doc = await upsertDoc(db.Entity, { slug: e.slug }, entityData);
        ids.entities[e.slug] = doc._id;
    }
    console.log(`   ✅ ${Object.keys(ids.entities).length} entities`);

    // =========== 4. RELATIONS ===========
    console.log('\n🔗 Adding relations...');
    const E = ids.entities;
    ids.relationKeys = {}; // store relation UUID keys for demo records
    const relationDefs = [
        { src: 'rendez-vous', target: 'patients', label: 'Patient', inverse: 'Rendez-vous', card: 'one-to-many' },
        { src: 'consultations', target: 'patients', label: 'Patient', inverse: 'Consultations', card: 'one-to-many' },
        { src: 'consultations', target: 'rendez-vous', label: 'Rendez-vous', inverse: 'Consultation', card: 'one-to-many' },
        { src: 'prescriptions', target: 'patients', label: 'Patient', inverse: 'Prescriptions', card: 'one-to-many' },
        { src: 'prescriptions', target: 'consultations', label: 'Consultation', inverse: 'Prescriptions', card: 'one-to-many' },
        { src: 'prescriptions', target: 'medicaments', label: 'Médicament', inverse: 'Prescriptions', card: 'one-to-many' },
        { src: 'factures', target: 'consultations', label: 'Consultation', inverse: 'Factures', card: 'one-to-many' },
        { src: 'factures', target: 'patients', label: 'Patient', inverse: 'Factures', card: 'one-to-many' },
        { src: 'paiements', target: 'factures', label: 'Facture', inverse: 'Paiements', card: 'one-to-many' },
        { src: 'resultats-labo', target: 'patients', label: 'Patient', inverse: 'Résultats labo', card: 'one-to-many' },
        { src: 'documents-medicaux', target: 'patients', label: 'Patient', inverse: 'Documents', card: 'one-to-many' },
        { src: 'plans-traitement', target: 'patients', label: 'Patient', inverse: 'Plans de traitement', card: 'one-to-many' },
    ];

    for (const r of relationDefs) {
        const key = uuidv4();
        ids.relationKeys[`${r.src}__${r.target}`] = key;
        await db.Entity.findByIdAndUpdate(E[r.src], {
            $push: { relations: { key, targetEntity: E[r.target], label: r.label, inverseLabel: r.inverse, cardinality: r.card, inputMode: 'modal-picker', storage: 'on-source', bidirectional: true, required: false } }
        });
    }
    console.log(`   ✅ ${relationDefs.length} relations`);

    // =========== 4b. REFERENCE TITLE TOKENS (relation-based) ===========
    console.log('\n🏷️  Setting reference title tokens (relation-based)...');
    const rk = ids.relationKeys;
    const relTokenDefs = [
        // RDV - {Patient}
        {
            slug: 'rendez-vous', tokens: [
                { t: 'text', v: 'RDV - ' },
                { t: 'field', id: `rel:${rk['rendez-vous__patients']}.title` }
            ]
        },
        // Consult. {Patient} - {Motif}
        {
            slug: 'consultations', tokens: [
                { t: 'text', v: 'Consult. ' },
                { t: 'field', id: `rel:${rk['consultations__patients']}.title` },
                { t: 'text', v: ' - ' },
                { t: 'field', id: f.motif.toString() }
            ]
        },
        // Ordonnance {Patient}
        {
            slug: 'prescriptions', tokens: [
                { t: 'text', v: 'Ordonnance ' },
                { t: 'field', id: `rel:${rk['prescriptions__patients']}.title` }
            ]
        },
        // FAC-{title} - {Patient}
        {
            slug: 'factures', tokens: [
                { t: 'field', id: 'title' },
                { t: 'text', v: ' - ' },
                { t: 'field', id: `rel:${rk['factures__patients']}.title` }
            ]
        },
        // PAY-{title} - {Facture}
        {
            slug: 'paiements', tokens: [
                { t: 'field', id: 'title' },
                { t: 'text', v: ' - ' },
                { t: 'field', id: `rel:${rk['paiements__factures']}.title` }
            ]
        },
        // Analyse {Patient} - {type_analyse}
        {
            slug: 'resultats-labo', tokens: [
                { t: 'text', v: 'Analyse ' },
                { t: 'field', id: `rel:${rk['resultats-labo__patients']}.title` },
                { t: 'text', v: ' - ' },
                { t: 'field', id: f.type_analyse.toString() }
            ]
        },
        // {type_document} - {Patient}
        {
            slug: 'documents-medicaux', tokens: [
                { t: 'field', id: f.type_document.toString() },
                { t: 'text', v: ' - ' },
                { t: 'field', id: `rel:${rk['documents-medicaux__patients']}.title` }
            ]
        },
        // Plan {Patient}
        {
            slug: 'plans-traitement', tokens: [
                { t: 'text', v: 'Plan ' },
                { t: 'field', id: `rel:${rk['plans-traitement__patients']}.title` }
            ]
        },
    ];

    for (const rt of relTokenDefs) {
        await db.Entity.findByIdAndUpdate(E[rt.slug], {
            $set: { referenceTitleTokens: rt.tokens }
        });
    }
    console.log(`   ✅ ${relTokenDefs.length} relation-based title tokens set`);

    // =========== 4b. CARD TEMPLATES (Kanban + Calendar for RDV) ===========
    const cardTemplates = [
        {
            name: 'Kanban RDV', entitySlug: 'rendez-vous', context: 'kanban', isDefault: true,
            layout: {
                accentPosition: 'none', accentSource: 'none', borderRadius: 8, shadow: 'sm',
                zones: [
                    {
                        id: 'body', direction: 'column', gap: 6, padding: '12px', elements: [
                            { type: 'title', fontSize: 'sm', fontWeight: 'semibold', maxLines: 2, visible: true },
                            { type: 'field', fieldId: '__description__', fontSize: 'xs', maxLines: 2, color: '#6b7280', visible: true },
                            { type: 'status', format: 'badge', fontSize: 'xs', visible: true },
                        ]
                    },
                    {
                        id: 'footer', direction: 'row', gap: 4, padding: '8px 12px', align: 'between', borderTop: true, elements: [
                            { type: 'date', fieldId: '__createdAt__', icon: 'solar:calendar-linear', format: 'date', fontSize: 'xs', visible: true },
                            { type: 'actions', items: ['edit', 'view'], visible: true },
                        ]
                    }
                ]
            }
        },
        {
            name: 'Calendar RDV', entitySlug: 'rendez-vous', context: 'calendar', isDefault: true,
            layout: {
                accentPosition: 'top', accentSource: 'status', borderRadius: 14, shadow: 'lg',
                zones: [
                    {
                        id: 'header', direction: 'column', gap: 4, padding: '16px 20px 8px', elements: [
                            { type: 'title', fontSize: 'base', fontWeight: 'bold', maxLines: 1, visible: true },
                        ]
                    },
                    {
                        id: 'body', direction: 'column', gap: 6, padding: '0 20px 12px', elements: [
                            { type: 'icon-value', fieldId: '__time__', icon: 'solar:clock-circle-linear', format: 'time-range', fontSize: 'xs', visible: true },
                            { type: 'icon-value', fieldId: '__date__', icon: 'solar:calendar-linear', format: 'date-long', fontSize: 'xs', visible: true },
                            { type: 'status', format: 'pill', fontSize: 'xs', visible: true },
                        ]
                    },
                    {
                        id: 'footer', direction: 'row', gap: 0, padding: '0', align: 'stretch', borderTop: true, elements: [
                            { type: 'actions', items: ['open', 'close'], visible: true },
                        ]
                    }
                ]
            }
        },
    ];
    for (const ct of cardTemplates) {
        const entityId = E[ct.entitySlug];
        if (!entityId) continue;
        await upsertDoc(db.CardTemplate, { entityId, context: ct.context, 'meta.createdByPreset': PRESET }, {
            name: ct.name, entityId, context: ct.context, isDefault: ct.isDefault,
            presetSlug: PRESET, layout: ct.layout, createdBy: uid,
        });
    }
    console.log(`   ✅ ${cardTemplates.length} card templates created`);

    // =========== 5. NAVIGATION (views directly in spaces, no redundant folders) ===========
    console.log('\n🧭 Creating navigation...');
    const env = await upsertDoc(db.Environment, { slug: 'cabinet-medical', 'meta.createdByPreset': PRESET }, {
        name: 'Cabinet Médical', slug: 'cabinet-medical', icon: 'solar:stethoscope-bold-duotone', color: '#00ab55', order: 10
    });

    const spaceViewDefs = [
        {
            name: 'Activité Clinique', icon: 'solar:heart-pulse-bold-duotone', color: '#00ab55', views: [
                { entitySlug: 'patients', name: 'Patients', icon: 'solar:user-heart-bold-duotone', color: '#3b82f6' },
                { entitySlug: 'rendez-vous', name: 'Rendez-vous', icon: 'solar:calendar-mark-bold-duotone', color: '#8b5cf6' },
                { entitySlug: 'consultations', name: 'Consultations', icon: 'solar:stethoscope-bold-duotone', color: '#00ab55' },
                { entitySlug: 'prescriptions', name: 'Ordonnances', icon: 'solar:document-medicine-bold-duotone', color: '#e2a03f' },
                { entitySlug: 'resultats-labo', name: 'Examens', icon: 'solar:test-tube-bold-duotone', color: '#f97316' },
            ]
        },
        {
            name: 'Documents', icon: 'solar:document-bold-duotone', color: '#6366f1', views: [
                { entitySlug: 'documents-medicaux', name: 'Documents patients', icon: 'solar:folder-open-bold-duotone', color: '#6366f1' },
                { entitySlug: 'plans-traitement', name: 'Plans de traitement', icon: 'solar:clipboard-list-bold-duotone', color: '#0ea5e9' },
            ]
        },
        {
            name: 'Facturation', icon: 'solar:bill-list-bold-duotone', color: '#e2a03f', views: [
                { entitySlug: 'factures', name: 'Factures', icon: 'solar:bill-list-bold-duotone', color: '#e2a03f' },
                { entitySlug: 'paiements', name: 'Paiements', icon: 'solar:wallet-bold-duotone', color: '#22c55e' },
                { entitySlug: 'assurances', name: 'Assurances', icon: 'solar:shield-bold-duotone', color: '#3b82f6' },
            ]
        },
        {
            name: 'Organisation', icon: 'solar:users-group-rounded-bold-duotone', color: '#4361ee', views: [
                { entitySlug: 'personnel', name: 'Personnel', icon: 'solar:users-group-rounded-bold-duotone', color: '#4361ee' },
            ]
        },
        {
            name: 'Stock & Pharmacie', icon: 'solar:box-bold-duotone', color: '#94a3b8', views: [
                { entitySlug: 'medicaments', name: 'Médicaments', icon: 'solar:pills-3-bold-duotone', color: '#ef4444' },
                { entitySlug: 'stock', name: 'Consommables', icon: 'solar:box-bold-duotone', color: '#94a3b8' },
            ]
        },
    ];

    let viewCount = 0;
    for (let si = 0; si < spaceViewDefs.length; si++) {
        const sd = spaceViewDefs[si];
        const space = await upsertDoc(db.Space, { slug: slug(sd.name), 'meta.createdByPreset': PRESET }, {
            name: sd.name, slug: slug(sd.name), icon: sd.icon, color: sd.color, order: si,
            environmentId: env._id, owner: new mongoose.Types.ObjectId(userId)
        });
        for (let vi = 0; vi < sd.views.length; vi++) {
            const vd = sd.views[vi];
            const entityId = E[vd.entitySlug];
            if (!entityId) continue;
            const viewSlug = `view-${vd.entitySlug}-${space._id.toString().slice(-6)}-${vi}`;
            await upsertDoc(db.View, { slug: viewSlug, 'meta.createdByPreset': PRESET }, {
                name: vd.name, slug: viewSlug, entity: entityId,
                icon: vd.icon, color: vd.color, viewType: 'list', order: vi,
                spaces: [space._id], folders: [],
                createdBy: new mongoose.Types.ObjectId(userId)
            });
            viewCount++;
        }
    }
    console.log(`   ✅ ${spaceViewDefs.length} spaces + ${viewCount} views (no redundant folders)`);

    // =========== 6. DEMO RECORDS ===========
    console.log('\n📊 Creating demo records...');
    await createDemoRecords(db, ids, userId);
    console.log('   ✅ Demo records created');

    // =========== 7. DOCUMENT TEMPLATES ===========
    console.log('\n📄 Creating document templates...');
    await createDocumentTemplates(db, ids, userId);
    console.log('   ✅ Document templates created');

    console.log('\n🎉 Cabinet Médical preset installed!');
}

// ============================================
// DEMO RECORDS
// ============================================
async function createDemoRecords(db, ids, userId) {
    const E = ids.entities;
    const f = ids.fields;
    const uid = new mongoose.Types.ObjectId(userId);
    const cls = ids.classifications;
    const rk = ids.relationKeys; // relation UUID keys

    // Helper
    const rec = async (entitySlug, title, customs = {}, extras = {}) => {
        const cf = Object.entries(customs).map(([name, value]) => ({ field_id: f[name], value }));
        return upsertDoc(db.Record, { entityId: E[entitySlug], title, 'meta.createdByPreset': PRESET }, {
            entityId: E[entitySlug], title, computedTitle: title, customFields: cf, createdBy: uid, ...extras
        });
    };

    // -- Patients (15) --
    const patients = [];
    const patientData = [
        { t: 'Ahmed Khelifi', nom: 'Khelifi', prenom: 'Ahmed', dn: '1985-03-15', sexe: 'M', tel: '0612345678', email: 'ahmed.khelifi@mail.com', secu: '185037512345678' },
        { t: 'Sophie Martin', nom: 'Martin', prenom: 'Sophie', dn: '1990-07-22', sexe: 'F', tel: '0623456789', email: 'sophie.martin@mail.com', secu: '290077512345678' },
        { t: 'Jean-Pierre Dubois', nom: 'Dubois', prenom: 'Jean-Pierre', dn: '1972-11-08', sexe: 'M', tel: '0634567890', email: 'jp.dubois@mail.com', secu: '172117512345678' },
        { t: 'Fatima Benali', nom: 'Benali', prenom: 'Fatima', dn: '1988-01-30', sexe: 'F', tel: '0645678901', email: 'fatima.benali@mail.com', secu: '288017512345678' },
        { t: 'Marie Leroy', nom: 'Leroy', prenom: 'Marie', dn: '1965-05-12', sexe: 'F', tel: '0656789012', email: 'marie.leroy@mail.com', secu: '265057512345678' },
        { t: 'Mohamed Azzouzi', nom: 'Azzouzi', prenom: 'Mohamed', dn: '1995-09-18', sexe: 'M', tel: '0667890123', email: 'mohamed.a@mail.com', secu: '195097512345678' },
        { t: 'Claire Dupont', nom: 'Dupont', prenom: 'Claire', dn: '1982-12-05', sexe: 'F', tel: '0678901234', email: 'claire.dupont@mail.com', secu: '282127512345678' },
        { t: 'Youssef El Amrani', nom: 'El Amrani', prenom: 'Youssef', dn: '1978-04-25', sexe: 'M', tel: '0689012345', email: 'youssef.ea@mail.com', secu: '178047512345678' },
        { t: 'Isabelle Roux', nom: 'Roux', prenom: 'Isabelle', dn: '1993-08-14', sexe: 'F', tel: '0690123456', email: 'isabelle.roux@mail.com', secu: '293087512345678' },
        { t: 'Pierre Moreau', nom: 'Moreau', prenom: 'Pierre', dn: '1960-02-28', sexe: 'M', tel: '0601234567', email: 'pierre.moreau@mail.com', secu: '160027512345678' },
        { t: 'Nadia Bouzid', nom: 'Bouzid', prenom: 'Nadia', dn: '1997-06-10', sexe: 'F', tel: '0612345670', email: 'nadia.bouzid@mail.com', secu: '297067512345678' },
        { t: 'François Bernard', nom: 'Bernard', prenom: 'François', dn: '1975-10-20', sexe: 'M', tel: '0623456780', email: 'f.bernard@mail.com', secu: '175107512345678' },
        { t: 'Amina Saidi', nom: 'Saidi', prenom: 'Amina', dn: '1989-03-08', sexe: 'F', tel: '0634567801', email: 'amina.saidi@mail.com', secu: '289037512345678' },
        { t: 'Luc Petit', nom: 'Petit', prenom: 'Luc', dn: '1970-07-15', sexe: 'M', tel: '0645678012', email: 'luc.petit@mail.com', secu: '170077512345678' },
        { t: 'Leila Hamdi', nom: 'Hamdi', prenom: 'Leila', dn: '2000-01-05', sexe: 'F', tel: '0656780123', email: 'leila.h@mail.com', secu: '200017512345678' },
    ];

    for (const p of patientData) {
        const doc = await rec('patients', p.t, {
            nom: p.nom, prenom: p.prenom, date_naissance: new Date(p.dn), sexe: p.sexe,
            telephone: p.tel, email: p.email, numero_secu: p.secu
        });
        patients.push(doc);
    }

    // -- Medications (20) --
    const meds = [];
    const medData = [
        { t: 'Amoxicilline 500mg', forme: 'comprime', dosage: '500mg', prix: 4.50 },
        { t: 'Doliprane 1000mg', forme: 'comprime', dosage: '1000mg', prix: 2.50 },
        { t: 'Ibuprofène 400mg', forme: 'comprime', dosage: '400mg', prix: 3.20 },
        { t: 'Ventoline', forme: 'inhalation', dosage: '100µg', prix: 5.80 },
        { t: 'Augmentin 1g', forme: 'comprime', dosage: '1g', prix: 7.20 },
        { t: 'Oméprazole 20mg', forme: 'gelule', dosage: '20mg', prix: 4.10 },
        { t: 'Metformine 850mg', forme: 'comprime', dosage: '850mg', prix: 3.90 },
        { t: 'Amlodipine 5mg', forme: 'comprime', dosage: '5mg', prix: 4.60 },
        { t: 'Levothyrox 75µg', forme: 'comprime', dosage: '75µg', prix: 3.50 },
        { t: 'Clopidogrel 75mg', forme: 'comprime', dosage: '75mg', prix: 12.30 },
        { t: 'Prednisolone 20mg', forme: 'comprime', dosage: '20mg', prix: 3.80 },
        { t: 'Codéine 30mg', forme: 'comprime', dosage: '30mg', prix: 4.20 },
        { t: 'Tramadol 50mg', forme: 'gelule', dosage: '50mg', prix: 5.10 },
        { t: 'Voltarène Gel', forme: 'creme', dosage: '1%', prix: 6.90 },
        { t: 'Aerius 5mg', forme: 'comprime', dosage: '5mg', prix: 5.40 },
        { t: 'Gaviscon', forme: 'sirop', dosage: '500mg/10ml', prix: 5.60 },
        { t: 'Spasfon', forme: 'comprime', dosage: '80mg', prix: 3.10 },
        { t: 'Smecta', forme: 'sirop', dosage: '3g', prix: 4.80 },
        { t: 'Toplexil', forme: 'sirop', dosage: '0.33mg/ml', prix: 4.50 },
        { t: 'Bisoprolol 5mg', forme: 'comprime', dosage: '5mg', prix: 4.70 },
    ];

    for (const m of medData) {
        const doc = await rec('medicaments', m.t, {
            forme: m.forme, dosage: m.dosage, prix_vente: m.prix,
            stock_actuel: Math.floor(Math.random() * 200) + 20,
            stock_min: 10
        });
        meds.push(doc);
    }

    // -- Staff (4) --
    const staffData = [
        { t: 'Dr. Riad Boukirou', nom: 'Boukirou', prenom: 'Riad', spec: 'Médecine générale', rpps: '10003456789' },
        { t: 'Dr. Sarah Cohen', nom: 'Cohen', prenom: 'Sarah', spec: 'Pneumologie', rpps: '10004567890' },
        { t: 'Julie Moreau', nom: 'Moreau', prenom: 'Julie', spec: 'Infirmière', rpps: '' },
        { t: 'Nathalie Petit', nom: 'Petit', prenom: 'Nathalie', spec: 'Secrétaire médicale', rpps: '' },
    ];
    for (const s of staffData) {
        await rec('personnel', s.t, { nom: s.nom, prenom: s.prenom, specialite: s.spec, numero_rpps: s.rpps });
    }

    // -- Appointments (12) --
    const appts = [];
    for (let i = 0; i < 12; i++) {
        const p = patients[i % patients.length];
        const d = new Date(); d.setDate(d.getDate() - 30 + i * 3);
        const statusOpts = cls['rdv_status_opts'];
        const statusIdx = i < 8 ? 2 : (i < 10 ? 0 : 1);
        const doc = await rec('rendez-vous', `RDV - ${p.title}`, {
            date_rdv: d, duree_rdv: 30, objet_rdv: ['Consultation générale', 'Suivi', 'Contrôle', 'Renouvellement ordonnance'][i % 4]
        }, {
            relations: [{ relationKey: rk['rendez-vous__patients'], value: p._id }],
            classificationValues: statusOpts ? [{ classificationId: cls.rdv_status, optionId: statusOpts[statusIdx]?._id, label: statusOpts[statusIdx]?.label, color: statusOpts[statusIdx]?.color }] : []
        });
        appts.push(doc);
    }

    // -- Consultations (12) --
    const consults = [];
    const diagData = ['SAOS sous PPC', 'Rhinopharyngite', 'Lombalgie aiguë', 'HTA essentielle', 'Diabète type 2 équilibré', 'Bronchite aiguë', 'Entorse cheville', 'Migraine', 'Gastrite', 'Infection urinaire', 'Eczéma', 'Angine streptococcique'];
    for (let i = 0; i < 12; i++) {
        const p = patients[i % patients.length];
        const consultTypeOpts = cls['consult_type_opts'];
        const typeIdx = i % 4;
        const doc = await rec('consultations', `Consult. ${p.title} - ${diagData[i]}`, {
            motif: ['Douleur thoracique', 'Toux persistante', 'Mal de dos', 'Contrôle tension', 'Suivi diabète', 'Fièvre', 'Chute', 'Céphalées', 'Brûlures estomac', 'Brûlures miction', 'Démangeaisons', 'Mal de gorge'][i],
            diagnostic: diagData[i],
            symptomes: 'Patient se plaint de symptômes depuis quelques jours.',
            examen_clinique: 'Examen clinique normal, pas de signe de gravité.',
            poids: 60 + Math.floor(Math.random() * 30),
            taille_cm: 160 + Math.floor(Math.random() * 25),
            tension: `${12 + Math.floor(Math.random() * 4)}/${7 + Math.floor(Math.random() * 3)}`,
            temperature: (36.5 + Math.random() * 1.5).toFixed(1),
        }, {
            relations: [{ relationKey: rk['consultations__patients'], value: p._id }],
            classificationValues: consultTypeOpts ? [{ classificationId: cls.consult_type, optionId: consultTypeOpts[typeIdx]?._id, label: consultTypeOpts[typeIdx]?.label, color: consultTypeOpts[typeIdx]?.color }] : []
        });
        consults.push(doc);
    }

    // -- Prescriptions (10) - linked to patients, consultations AND medications --
    for (let i = 0; i < 10; i++) {
        const p = patients[i % patients.length];
        const c = consults[i % consults.length];
        const med1 = meds[i % meds.length];
        const med2 = meds[(i + 5) % meds.length];
        await rec('prescriptions', `Ordonnance ${p.title}`, {
            posologie: `${med1.title} - 1 cp matin et soir pendant 7 jours\n${med2.title} - 1 cp le soir`,
            duree_traitement: '7 jours', notes_prescription: 'Prendre au milieu du repas.'
        }, {
            relations: [
                { relationKey: rk['prescriptions__patients'], value: p._id },
                { relationKey: rk['prescriptions__consultations'], value: c._id },
                { relationKey: rk['prescriptions__medicaments'], value: med1._id },
                { relationKey: rk['prescriptions__medicaments'], value: med2._id }
            ]
        });
    }

    // -- Invoices (10) + Payments (10) --
    const invoiceStatusOpts = cls['invoice_status_opts'];
    for (let i = 0; i < 10; i++) {
        const p = patients[i % patients.length];
        const c = consults[i % consults.length];
        const amount = 25 + Math.floor(Math.random() * 75);
        const paid = i < 7 ? amount : (i < 9 ? Math.floor(amount / 2) : 0);
        const statusIdx = paid >= amount ? 2 : (paid > 0 ? 1 : 0);
        const inv = await rec('factures', `FAC-${String(i + 1).padStart(4, '0')}`, {
            montant_total: amount, montant_paye: paid,
            date_echeance: new Date(Date.now() + (i < 7 ? -10 : 30) * 86400000)
        }, {
            relations: [{ relationKey: rk['factures__patients'], value: p._id }, { relationKey: rk['factures__consultations'], value: c._id }],
            classificationValues: invoiceStatusOpts ? [{ classificationId: cls.invoice_status, optionId: invoiceStatusOpts[statusIdx]?._id, label: invoiceStatusOpts[statusIdx]?.label, color: invoiceStatusOpts[statusIdx]?.color }] : []
        });

        if (paid > 0) {
            await rec('paiements', `PAY-${String(i + 1).padStart(4, '0')}`, {
                montant_total: paid, mode_paiement: ['cash', 'card', 'transfer', 'insurance'][i % 4],
                reference_paiement: `REF${Date.now()}`
            }, { relations: [{ relationKey: rk['paiements__factures'], value: inv._id }] });
        }
    }

    // -- LabResults (10) --
    for (let i = 0; i < 10; i++) {
        const p = patients[i % patients.length];
        const labTypeOpts = cls['lab_type_opts'];
        const typeIdx = i % 4;
        await rec('resultats-labo', `Analyse ${p.title} #${i + 1}`, {
            type_analyse: ['Hémogramme', 'Glycémie', 'Créatinine', 'Bilan lipidique', 'TSH', 'CRP', 'ECBU', 'Radio thorax', 'ECG', 'IRM lombaire'][i],
            resultats_labo: 'Résultats dans les normes.', valeurs_reference: 'Voir annexe.',
            interpretation: 'Pas d\'anomalie significative.'
        }, {
            relations: [{ relationKey: rk['resultats-labo__patients'], value: p._id }],
            classificationValues: labTypeOpts ? [{ classificationId: cls.lab_type, optionId: labTypeOpts[typeIdx]?._id, label: labTypeOpts[typeIdx]?.label, color: labTypeOpts[typeIdx]?.color }] : []
        });
    }

    // -- MedicalDocuments (10), TreatmentPlans (6), StockItems (20) --
    for (let i = 0; i < 10; i++) {
        const p = patients[i % patients.length];
        await rec('documents-medicaux', `Doc médical ${p.title} #${i + 1}`, {
            type_document: ['Certificat', 'Compte-rendu', 'Lettre', 'Attestation', 'Résultat'][i % 5]
        }, { relations: [{ relationKey: rk['documents-medicaux__patients'], value: p._id }] });
    }
    for (let i = 0; i < 6; i++) {
        const p = patients[i % patients.length];
        await rec('plans-traitement', `Plan ${p.title}`, {
            objectif: 'Amélioration de la condition clinique', protocole: 'Traitement médicamenteux + suivi', duree_traitement: '3 mois'
        }, { relations: [{ relationKey: rk['plans-traitement__patients'], value: p._id }] });
    }
    const stockItems = ['Gants latex M', 'Gants latex L', 'Compresses stériles', 'Seringues 5ml', 'Seringues 10ml', 'Aiguilles 21G', 'Sparadrap', 'Coton', 'Bandelettes urinaires', 'Masques chirurgicaux', 'Thermomètre digital', 'Tensiomètre', 'Stéthoscope', 'Otoscope', 'Abaisse-langues', 'Désinfectant', 'Alcool 70°', 'Pansements', 'Fil de suture', 'Bistouri jetable'];
    for (let i = 0; i < stockItems.length; i++) {
        await rec('stock', stockItems[i], {
            categorie_stock: i < 2 ? 'consumable' : (i > 15 ? 'equipment' : 'consumable'),
            stock_actuel: 20 + Math.floor(Math.random() * 180), stock_min: 10,
            prix_achat: (1 + Math.random() * 20).toFixed(2), fournisseur: ['MedSupply', 'PharmaCorp', 'SantéPro'][i % 3]
        });
    }
}

// ============================================
// DOCUMENT TEMPLATES
// ============================================
async function createDocumentTemplates(db, ids, userId) {
    const uid = new mongoose.Types.ObjectId(userId);
    const E = ids.entities;

    const templateDefs = [
        { name: 'Ordonnance', icon: 'solar:document-medicine-bold-duotone', color: '#e2a03f', entitySlug: 'consultations' },
        { name: 'Certificat médical', icon: 'solar:diploma-verified-bold-duotone', color: '#3b82f6', entitySlug: 'patients' },
        { name: 'Compte rendu consultation', icon: 'solar:clipboard-text-bold-duotone', color: '#00ab55', entitySlug: 'consultations' },
        { name: 'Lettre orientation spécialiste', icon: 'solar:letter-bold-duotone', color: '#8b5cf6', entitySlug: 'consultations' },
        { name: "Demande d'examen labo", icon: 'solar:test-tube-bold-duotone', color: '#f97316', entitySlug: 'patients' },
        { name: 'Arrêt de travail', icon: 'solar:calendar-bold-duotone', color: '#ef4444', entitySlug: 'patients' },
        { name: 'Attestation de présence', icon: 'solar:document-text-bold-duotone', color: '#6366f1', entitySlug: 'patients' },
        { name: 'Fiche patient résumé', icon: 'solar:user-bold-duotone', color: '#3b82f6', entitySlug: 'patients' },
        { name: 'Facture PDF', icon: 'solar:bill-list-bold-duotone', color: '#e2a03f', entitySlug: 'factures' },
        { name: 'Consentement éclairé', icon: 'solar:shield-check-bold-duotone', color: '#22c55e', entitySlug: 'patients' },
    ];

    for (let i = 0; i < templateDefs.length; i++) {
        const t = templateDefs[i];
        const entityId = E[t.entitySlug];
        const htmlContent = `<div style="font-family:Arial,sans-serif;padding:40px;"><h1 style="color:${t.color};border-bottom:2px solid ${t.color};padding-bottom:8px;">${t.name}</h1><p style="color:#666;margin-top:24px;">Ce document est un modèle. Personnalisez-le avec les variables disponibles.</p><p><strong>Date:</strong> {{date}}</p><p><strong>Patient:</strong> {{patient.nom}} {{patient.prenom}}</p></div>`;

        const doc = await upsertDoc(db.Document, { name: t.name, 'meta.createdByPreset': PRESET }, {
            name: t.name, format: 'A4', orientation: 'portrait', isTemplate: true,
            entityId, entityIds: [entityId], createdBy: uid, status: 'published', tags: ['médical', 'template'],
            pages: [{ content: htmlContent, mode: 'edition', order: 0, elements: [], background: { color: '#ffffff' } }]
        });

        // SmartDocTemplate link
        await upsertDoc(db.SmartDocTemplate, { name: t.name, entityId, 'meta.createdByPreset': PRESET }, {
            name: t.name, description: `Modèle ${t.name}`, icon: t.icon, color: t.color,
            documentId: doc._id, entityId, outputFormat: 'pdf', order: i, active: true, createdBy: uid,
            inputFields: t.entitySlug === 'patients' ? [{ key: 'date', label: 'Date', type: 'date', required: true }] : []
        });
    }
}

// ============================================
// Standalone execution
// ============================================
if (require.main === module) {
    (async () => {
        const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_9194');
        await new Promise(r => conn.once('open', r));
        const globalConn = mongoose.createConnection('mongodb://127.0.0.1:27017/saasDemo');
        await new Promise(r => globalConn.once('open', r));
        const User = globalConn.model('User_med', new mongoose.Schema({}, { strict: false }), 'users');
        const user = await User.findOne({ email: 'boukirou6@hotmail.com' });
        await globalConn.close();
        if (!user) { console.error('User not found!'); process.exit(1); }
        await install(conn, user._id.toString(), PRESET);
        await conn.close();
        process.exit(0);
    })().catch(err => { console.error(err); process.exit(1); });
}

module.exports = { install };
