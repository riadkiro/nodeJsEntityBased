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
        DocumentLine: M('DocumentLine', s({ documentId: mongoose.Schema.Types.ObjectId, schemaId: mongoose.Schema.Types.ObjectId, lineType: String, values: Object, computed: Object, order: Number, createdBy: mongoose.Schema.Types.ObjectId, meta: Object }), 'documentlines'),
        GridSnapshot: M('GridSnapshot', s({ schemaId: mongoose.Schema.Types.ObjectId, recordId: mongoose.Schema.Types.ObjectId, targetRecordId: mongoose.Schema.Types.ObjectId, targetEntityId: mongoose.Schema.Types.ObjectId, date: Date, lines: Array, note: String, createdBy: mongoose.Schema.Types.ObjectId, meta: Object }), 'gridsnapshots'),
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
        { name: 'note_medecin', label: 'Note médecin', type: 'text', ui: { icon: 'solar:document-text-bold-duotone', width: 'full', rows: 4 } },
        { name: 'symptomes_rel', label: 'Symptômes', type: 'relation', type_config: { refEntity: '__symptomes__', multiple: true }, ui: { icon: 'solar:heart-pulse-bold-duotone', width: 'full' } },
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
        // Services / Prestations
        { name: 'code_prestation', label: 'Code prestation', type: 'string', ui: { icon: 'solar:hashtag-bold-duotone', width: 'half' } },
        { name: 'prix_ht', label: 'Prix HT', type: 'number', ui: { icon: 'solar:tag-price-bold-duotone', width: 'half' } },
        { name: 'tva_rate', label: 'TVA (%)', type: 'number', ui: { icon: 'solar:calculator-bold-duotone', width: 'half' } },
        { name: 'prix_ttc', label: 'Prix TTC', type: 'number', category: 'computed', ui: { icon: 'solar:dollar-bold-duotone', width: 'half' },
            formula: { fromFunction: 'expression', expression: '%prix_ht% * (1 + %tva_rate% / 100)', sourceFields: {}, dependsOn: ['prix_ht', 'tva_rate'] },
            render: { display: { table: 'currency', card: 'currency' } }
        },
        // Examens catalogue
        { name: 'code_examen', label: 'Code examen', type: 'string', ui: { icon: 'solar:hashtag-bold-duotone', width: 'half' } },
        { name: 'unite_mesure', label: 'Unité', type: 'string', ui: { icon: 'solar:ruler-cross-pen-bold-duotone', width: 'half' } },
        { name: 'valeur_normale', label: 'Valeur normale', type: 'string', ui: { icon: 'solar:chart-bold-duotone', width: 'half' } },
        { name: 'condition_prelevement', label: 'Condition prélèvement', type: 'string', ui: { icon: 'solar:test-tube-bold-duotone', width: 'half' } },
        { name: 'delai_resultat', label: 'Délai résultat', type: 'string', ui: { icon: 'solar:clock-circle-bold-duotone', width: 'half' } },
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
            referenceTitleTokens: [{ t: 'field', id: () => f.prenom }, { t: 'text', v: ' ' }, { t: 'field', id: () => f.nom }],
            sidebarWidgets: [
                { type: 'note', label: 'Notes patient', icon: 'solar:notes-bold-duotone', color: '#3b82f6', order: 0, visible: true, config: { content: '' } },
                {
                    type: 'tasks', label: 'Suivi', icon: 'solar:checklist-bold-duotone', color: '#22c55e', order: 1, visible: true, config: {
                        tasks: [
                            { label: 'Vérifier vaccinations', done: false },
                            { label: 'Contrôle tension', done: false },
                            { label: 'Bilan sanguin annuel', done: false }
                        ]
                    }
                }
            ]
        },
        {
            name: 'Rendez-vous', nameSingular: 'Rendez-vous', namePlural: 'Rendez-vous', slug: 'rendez-vous', icon: 'solar:calendar-mark-bold-duotone', color: '#8b5cf6', fields: ['date_rdv', 'duree_rdv', 'objet_rdv', 'notes_generales'], statusClassification: 'rdv_status', classifications: [],
            referenceTitleTokens: null
        }, // set after relations
        {
            name: 'Consultation', nameSingular: 'Consultation', namePlural: 'Consultations', slug: 'consultations', icon: 'solar:stethoscope-bold-duotone', color: '#00ab55', fields: ['motif', 'note_medecin'], statusClassification: null, classifications: ['consult_type'], stdFields: ['title', 'date'],
            referenceTitleTokens: null,
            sidebarWidgets: [
                { type: 'note', label: 'Observations', icon: 'solar:clipboard-text-bold-duotone', color: '#00ab55', order: 0, visible: true, config: { content: '' } }
            ]
        }, // set after relations
        {
            name: 'Prescription', nameSingular: 'Prescription', namePlural: 'Prescriptions', slug: 'prescriptions', icon: 'solar:document-medicine-bold-duotone', color: '#e2a03f', fields: ['posologie', 'duree_traitement', 'notes_prescription'], statusClassification: null, classifications: [],
            referenceTitleTokens: null,
            sidebarWidgets: [
                { type: 'note', label: 'Note pharmacien', icon: 'solar:notes-bold-duotone', color: '#e2a03f', order: 0, visible: true, config: { content: '' } }
            ]
        }, // set after relations
        {
            name: 'Médicament', nameSingular: 'Médicament', namePlural: 'Médicaments', slug: 'medicaments', icon: 'solar:pills-3-bold-duotone', color: '#ef4444', fields: ['forme', 'dosage', 'prix_vente', 'stock_min', 'stock_actuel', 'notes_generales'], statusClassification: null, classifications: [],
            referenceTitleTokens: [{ t: 'field', id: 'title' }]
        },
        {
            name: 'Prestation', nameSingular: 'Prestation', namePlural: 'Prestations', slug: 'prestations', icon: 'solar:clipboard-check-bold-duotone', color: '#0ea5e9',
            fields: ['code_prestation', 'prix_ht', 'tva_rate', 'prix_ttc', 'notes_generales'], statusClassification: null, classifications: [],
            referenceTitleTokens: [{ t: 'field', id: 'title' }]
        },
        {
            name: 'Examen', nameSingular: 'Examen', namePlural: 'Examens', slug: 'examens', icon: 'solar:test-tube-bold-duotone', color: '#f97316',
            fields: ['code_examen', 'unite_mesure', 'valeur_normale', 'condition_prelevement', 'delai_resultat', 'notes_generales'], statusClassification: null, classifications: [],
            referenceTitleTokens: [{ t: 'field', id: 'title' }]
        },
        {
            name: 'Facture', nameSingular: 'Facture', namePlural: 'Factures', slug: 'factures', icon: 'solar:bill-list-bold-duotone', color: '#e2a03f', fields: ['montant_total', 'montant_paye', 'date_echeance', 'notes_generales', 'reste_a_payer'], statusClassification: 'invoice_status', classifications: [],
            referenceTitleTokens: null,
            sidebarWidgets: [
                {
                    type: 'tasks', label: 'Suivi paiement', icon: 'solar:checklist-bold-duotone', color: '#e2a03f', order: 0, visible: true, config: {
                        tasks: [
                            { label: 'Facture envoyée', done: false },
                            { label: 'Relance effectuée', done: false },
                            { label: 'Paiement reçu', done: false },
                            { label: 'Comptabilisée', done: false }
                        ]
                    }
                },
                { type: 'note', label: 'Remarques', icon: 'solar:notes-bold-duotone', color: '#94a3b8', order: 1, visible: true, config: { content: '' } }
            ]
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
            referenceTitleTokens: [{ t: 'field', id: () => f.prenom }, { t: 'text', v: ' ' }, { t: 'field', id: () => f.nom }],
            sidebarWidgets: [
                {
                    type: 'links-group', label: 'Outils', icon: 'solar:link-round-bold-duotone', color: '#4361ee', order: 0, visible: true, config: {
                        links: [
                            { label: 'Annuaire RPPS', url: 'https://annuaire.sante.fr', icon: 'solar:magnifer-bold-duotone', target: '_blank' },
                            { label: 'Ameli Pro', url: 'https://espacepro.ameli.fr', icon: 'solar:shield-check-bold-duotone', target: '_blank' }
                        ]
                    }
                },
                { type: 'note', label: 'Notes RH', icon: 'solar:notes-bold-duotone', color: '#64748b', order: 1, visible: true, config: { content: '' } }
            ]
        },
        {
            name: 'Stock', nameSingular: 'Article Stock', namePlural: 'Stock', slug: 'stock', icon: 'solar:box-bold-duotone', color: '#94a3b8', fields: ['categorie_stock', 'fournisseur', 'prix_achat', 'prix_vente', 'stock_actuel', 'stock_min', 'notes_generales', 'marge_stock'], statusClassification: null, classifications: [],
            referenceTitleTokens: [{ t: 'field', id: 'title' }],
            sidebarWidgets: [
                {
                    type: 'tasks', label: 'Réappro', icon: 'solar:checklist-bold-duotone', color: '#f97316', order: 0, visible: true, config: {
                        tasks: [
                            { label: 'Vérifier stock minimum', done: false },
                            { label: 'Passer commande fournisseur', done: false },
                            { label: 'Réception marchandise', done: false }
                        ]
                    }
                }
            ]
        },
        {
            name: 'Symptôme', nameSingular: 'Symptôme', namePlural: 'Symptômes', slug: 'symptomes', icon: 'solar:heart-pulse-bold-duotone', color: '#ec4899', fields: [], statusClassification: null, classifications: [],
            referenceTitleTokens: [{ t: 'field', id: 'title' }]
        },
        {
            name: 'Pathologie', nameSingular: 'Pathologie', namePlural: 'Pathologies', slug: 'pathologies', icon: 'solar:virus-bold-duotone', color: '#dc2626', fields: [], statusClassification: null, classifications: [],
            referenceTitleTokens: [{ t: 'field', id: 'title' }]
        },
        {
            name: 'Traitement', nameSingular: 'Traitement', namePlural: 'Traitements', slug: 'traitements', icon: 'solar:pills-bold-duotone', color: '#0891b2', fields: [], statusClassification: null, classifications: [],
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
            enabledStandardFields: e.stdFields || ['title', 'description', 'date'],
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

    // ── Resolve relation field references (replace entity placeholders with actual IDs) ──
    if (ids.fields.symptomes_rel && ids.entities['symptomes']) {
        await db.FieldTemplate.findByIdAndUpdate(ids.fields.symptomes_rel, {
            $set: { 'type_config.refEntity': ids.entities['symptomes'].toString() }
        });
        console.log('   ✅ Resolved symptomes_rel refEntity →', ids.entities['symptomes']);
    }

    // =========== 4. RELATIONS ===========
    console.log('\n🔗 Adding relations...');
    const E = ids.entities;
    ids.relationKeys = {}; // store relation UUID keys for demo records
    const relationDefs = [
        { src: 'rendez-vous', target: 'patients', label: 'Patient', inverse: 'Rendez-vous', card: 'many-to-one' },
        { src: 'consultations', target: 'patients', label: 'Patient', inverse: 'Consultations', card: 'many-to-one' },
        { src: 'consultations', target: 'rendez-vous', label: 'Rendez-vous', inverse: 'Consultation', card: 'one-to-one' },
        { src: 'prescriptions', target: 'patients', label: 'Patient', inverse: 'Prescriptions', card: 'many-to-one' },
        { src: 'prescriptions', target: 'consultations', label: 'Consultation', inverse: 'Prescriptions', card: 'many-to-one' },
        { src: 'prescriptions', target: 'medicaments', label: 'Médicament', inverse: 'Prescriptions', card: 'one-to-many' },
        { src: 'factures', target: 'consultations', label: 'Consultation', inverse: 'Factures', card: 'one-to-one' },
        { src: 'factures', target: 'patients', label: 'Patient', inverse: 'Factures', card: 'many-to-one' },
        { src: 'paiements', target: 'factures', label: 'Facture', inverse: 'Paiements', card: 'many-to-one' },
        { src: 'resultats-labo', target: 'patients', label: 'Patient', inverse: 'Résultats labo', card: 'many-to-one' },
        { src: 'documents-medicaux', target: 'patients', label: 'Patient', inverse: 'Documents', card: 'many-to-one' },
        { src: 'plans-traitement', target: 'patients', label: 'Patient', inverse: 'Plans de traitement', card: 'many-to-one' },
        { src: 'consultations', target: 'symptomes', label: 'Symptômes', inverse: 'Consultations', card: 'many-to-many', mode: 'autocomplete' },
        // Examens relation removed — handled exclusively via Dynamic Tables (TD)
        { src: 'pathologies', target: 'patients', label: 'Patient', inverse: 'Pathologies', card: 'many-to-one' },
        { src: 'traitements', target: 'patients', label: 'Patient', inverse: 'Traitements', card: 'many-to-one' },
    ];

    for (const r of relationDefs) {
        const key = uuidv4();
        ids.relationKeys[`${r.src}__${r.target}`] = key;
        await db.Entity.findByIdAndUpdate(E[r.src], {
            $push: {
                relations: {
                    key,
                    targetEntity: E[r.target],
                    label: r.label,
                    inverseLabel: r.inverse,
                    cardinality: r.card,
                    inputMode: r.mode || 'modal-picker',
                    storage: 'on-source',
                    bidirectional: true,
                    required: false,
                    showInForm: (r.src === 'consultations' && r.target === 'rendez-vous') ? false : true
                }
            }
        });
    }
    console.log(`   ✅ ${relationDefs.length} relations`);

    // =========== 4c. DEFAULT LAYOUTS ===========
    console.log('\n📐 Setting default layouts...');
    if (E['consultations']) {
        const motifFieldId = f.motif;
        const diagnosticFieldId = f.diagnostic;
        const noteMedecinFieldId = f.note_medecin;
        const patientRelKey = ids.relationKeys['consultations__patients'];
        const symptomesRelKey = ids.relationKeys['consultations__symptomes'];

        const layout = {
            tabs: [{ id: 'default', title: 'Attributs', icon: 'tabler:apps' }],
            fields: [
                { fieldId: motifFieldId.toString(), width: 9, id: `auto_${motifFieldId}`, tabId: 'default' },
                { fieldId: patientRelKey, width: 3, id: `auto_rel_${patientRelKey}`, tabId: 'default' },
                { fieldId: diagnosticFieldId.toString(), width: 12, id: `auto_${diagnosticFieldId}`, tabId: 'default' },
                { fieldId: noteMedecinFieldId.toString(), width: 12, id: `auto_${noteMedecinFieldId}`, tabId: 'default' },
                { fieldId: symptomesRelKey, width: 12, id: `auto_rel_${symptomesRelKey}`, tabId: 'default' }
            ]
        };
        await db.Entity.findByIdAndUpdate(E['consultations'], { $set: { formLayout: layout, layout: layout } });
        console.log('   ✅ Consultation layout set: Motif(9), Patient(3), Diagnostic(12), Note(12), Symptômes(12)');
    }

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

    // =========== 5. NAVIGATION (each group = separate environment) ===========
    console.log('\n🧭 Creating navigation...');

    const envDefs = [
        {
            env: { name: 'Activité Clinique', slug: 'activite-clinique', icon: 'solar:heart-pulse-bold-duotone', color: '#00ab55' },
            spaces: [{
                name: 'Activité Clinique', icon: 'solar:heart-pulse-bold-duotone', color: '#00ab55', views: [
                    { entitySlug: 'patients', name: 'Patients', icon: 'solar:user-heart-bold-duotone', color: '#3b82f6' },
                    { entitySlug: 'rendez-vous', name: 'Rendez-vous', icon: 'solar:calendar-mark-bold-duotone', color: '#8b5cf6' },
                    { entitySlug: 'consultations', name: 'Consultations', icon: 'solar:stethoscope-bold-duotone', color: '#00ab55' },
                    { entitySlug: 'prescriptions', name: 'Ordonnances', icon: 'solar:document-medicine-bold-duotone', color: '#e2a03f' },
                    { entitySlug: 'resultats-labo', name: 'Examens', icon: 'solar:test-tube-bold-duotone', color: '#f97316' },
                    { entitySlug: 'examens', name: 'Catalogue examens', icon: 'solar:test-tube-minimalistic-bold-duotone', color: '#fb923c' },
                    { entitySlug: 'symptomes', name: 'Symptômes', icon: 'solar:heart-pulse-bold-duotone', color: '#ec4899' },
                    { entitySlug: 'pathologies', name: 'Pathologies', icon: 'solar:virus-bold-duotone', color: '#dc2626' },
                    { entitySlug: 'traitements', name: 'Traitements', icon: 'solar:pills-bold-duotone', color: '#0891b2' },
                ]
            }]
        },
        {
            env: { name: 'Documents', slug: 'documents', icon: 'solar:document-bold-duotone', color: '#6366f1' },
            spaces: [{
                name: 'Documents', icon: 'solar:document-bold-duotone', color: '#6366f1', views: [
                    { entitySlug: 'documents-medicaux', name: 'Documents patients', icon: 'solar:folder-open-bold-duotone', color: '#6366f1' },
                    { entitySlug: 'plans-traitement', name: 'Plans de traitement', icon: 'solar:clipboard-list-bold-duotone', color: '#0ea5e9' },
                ]
            }]
        },
        {
            env: { name: 'Facturation', slug: 'facturation', icon: 'solar:bill-list-bold-duotone', color: '#e2a03f' },
            spaces: [{
                name: 'Facturation', icon: 'solar:bill-list-bold-duotone', color: '#e2a03f', views: [
                    { entitySlug: 'prestations', name: 'Prestations', icon: 'solar:clipboard-check-bold-duotone', color: '#0ea5e9' },
                    { entitySlug: 'factures', name: 'Factures', icon: 'solar:bill-list-bold-duotone', color: '#e2a03f' },
                    { entitySlug: 'paiements', name: 'Paiements', icon: 'solar:wallet-bold-duotone', color: '#22c55e' },
                    { entitySlug: 'assurances', name: 'Assurances', icon: 'solar:shield-bold-duotone', color: '#3b82f6' },
                ]
            }]
        },
        {
            env: { name: 'Organisation', slug: 'organisation', icon: 'solar:users-group-rounded-bold-duotone', color: '#4361ee' },
            spaces: [{
                name: 'Organisation', icon: 'solar:users-group-rounded-bold-duotone', color: '#4361ee', views: [
                    { entitySlug: 'personnel', name: 'Personnel', icon: 'solar:users-group-rounded-bold-duotone', color: '#4361ee' },
                ]
            }]
        },
        {
            env: { name: 'Stock & Pharmacie', slug: 'stock-pharmacie', icon: 'solar:box-bold-duotone', color: '#94a3b8' },
            spaces: [{
                name: 'Stock & Pharmacie', icon: 'solar:box-bold-duotone', color: '#94a3b8', views: [
                    { entitySlug: 'medicaments', name: 'Médicaments', icon: 'solar:pills-3-bold-duotone', color: '#ef4444' },
                    { entitySlug: 'stock', name: 'Consommables', icon: 'solar:box-bold-duotone', color: '#94a3b8' },
                ]
            }]
        },
    ];

    let viewCount = 0;
    for (let ei = 0; ei < envDefs.length; ei++) {
        const ed = envDefs[ei];
        const env = await upsertDoc(db.Environment, { slug: ed.env.slug, 'meta.createdByPreset': PRESET }, {
            ...ed.env, order: ei, isDefault: ei === 0
        });
        for (let si = 0; si < ed.spaces.length; si++) {
            const sd = ed.spaces[si];
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
    }
    // Clean up the old single "cabinet-medical" environment if it still exists
    const oldEnv = await db.Environment.findOne({ slug: 'cabinet-medical', 'meta.createdByPreset': PRESET });
    if (oldEnv) {
        // Reassign any spaces still pointing to the old env
        await db.Space.updateMany(
            { environmentId: oldEnv._id, 'meta.createdByPreset': PRESET },
            { $unset: { environmentId: '' } }
        );
        await db.Environment.deleteOne({ _id: oldEnv._id });
        console.log('   🗑️  Removed old single "Cabinet Médical" environment');
    }
    console.log(`   ✅ ${envDefs.length} environments + ${viewCount} views`);

    // =========== 5b. LINE SCHEMAS ===========
    console.log('\n📋 Creating line schemas...');

    // Single shared Traitement schema — used by consultations, prescriptions, patients, and documents
    const traitementSchema = await upsertDoc(db.LineSchema, { slug: 'traitement', 'meta.createdByPreset': PRESET }, {
        name: 'Traitement', slug: 'traitement',
        description: 'Lignes de traitement (partagé entre ordonnances, consultations et suivi patient)',
        appliesTo: { entityIds: [E['prescriptions'], E['consultations'], E['patients']], documentType: 'treatment' },
        sourceEntityId: E['traitements'],
        lineTypes: ['treatment', 'note'], defaultLineType: 'treatment',
        columns: [
            {
                key: 'treatment', label: 'Traitement', type: 'relation', required: true, visible: true, width: 'L', order: 0,
                showWhen: { lineType: ['treatment'] },
                config: { targetEntity: E['traitements'], searchFields: ['title'], displayFields: ['title'], applyDefaults: { description: 'title' } }
            },
            {
                key: 'moment', label: 'Moment', type: 'multiselect', required: false, visible: true, width: 'M', order: 1,
                showWhen: { lineType: ['treatment'] },
                config: {
                    source: 'manual', options: [
                        { value: 'morning', label: 'Matin' }, { value: 'noon', label: 'Midi' },
                        { value: 'evening', label: 'Soir' }, { value: 'bedtime', label: 'Au coucher' },
                        { value: 'before_meal', label: 'Avant repas' }, { value: 'after_meal', label: 'Après repas' },
                        { value: 'fasting', label: 'À jeun' }
                    ]
                }
            },
            {
                key: 'frequency', label: 'Fréquence', type: 'multiselect', required: false, visible: true, width: 'M', order: 2,
                showWhen: { lineType: ['treatment'] },
                config: {
                    source: 'manual', options: [
                        { value: '1x_day', label: '1x / jour' }, { value: '2x_day', label: '2x / jour' },
                        { value: '3x_day', label: '3x / jour' }, { value: 'every_8h', label: 'Toutes les 8h' },
                        { value: 'every_12h', label: 'Toutes les 12h' }, { value: 'weekly', label: '1x / semaine' },
                        { value: 'as_needed', label: 'Si besoin' }
                    ]
                }
            },
            {
                key: 'duration', label: 'Durée', type: 'multiselect', required: false, visible: true, width: 'S', order: 3,
                showWhen: { lineType: ['treatment'] },
                config: {
                    source: 'manual', options: [
                        { value: '1_day', label: '1 jour' }, { value: '3_days', label: '3 jours' },
                        { value: '5_days', label: '5 jours' }, { value: '7_days', label: '7 jours' },
                        { value: '10_days', label: '10 jours' }, { value: '14_days', label: '14 jours' },
                        { value: '21_days', label: '21 jours' }, { value: '30_days', label: '30 jours' },
                        { value: '3_months', label: '3 mois' }, { value: '6_months', label: '6 mois' },
                        { value: 'permanent', label: 'Permanent' }
                    ]
                }
            },
            { key: 'instructions', label: 'Instructions', type: 'textarea', required: false, visible: true, width: 'L', order: 4, config: {} }
        ],
        totals: {},
        snapshotConfig: {
            enabled: true,
            targetType: 'relation',
            targetRelationKey: rk['prescriptions__patients'],
            targetEntityId: E['patients']
        }
    });
    console.log(`   ✅ LineSchema: Traitement (${traitementSchema._id})`);

    // Consultation Prestations schema (catalog + auto pricing)
    const consultationPrestationSchema = await upsertDoc(db.LineSchema, { slug: 'consultation_billing_v1', 'meta.createdByPreset': PRESET }, {
        name: 'Prestations Consultation', slug: 'consultation_billing_v1',
        description: 'Prestations médicales utilisées pendant la consultation',
        appliesTo: { entityIds: [E['consultations']], documentType: 'consultation' },
        sourceEntityId: E['prestations'],
        lineTypes: ['service', 'note'], defaultLineType: 'service',
        columns: [
            {
                key: 'prestation', label: 'Prestation', type: 'relation', required: true, visible: true, width: 'L', order: 0,
                showWhen: { lineType: ['service'] },
                config: {
                    targetEntity: E['prestations'],
                    searchFields: ['title', 'code_prestation'],
                    displayFields: ['title', 'code_prestation'],
                    applyDefaults: { description: 'title', unitPrice: 'cf.' + f.prix_ht, vatRate: 'cf.' + f.tva_rate, code: 'cf.' + f.code_prestation }
                }
            },
            { key: 'description', label: 'Description', type: 'text', required: false, visible: true, width: 'L', order: 1, showWhen: { lineType: ['service'] }, config: {} },
            { key: 'code', label: 'Code', type: 'text', required: false, visible: true, width: 'S', order: 2, showWhen: { lineType: ['service'] }, config: {} },
            { key: 'qty', label: 'Qté', type: 'number', required: true, visible: true, width: 'XS', order: 3, showWhen: { lineType: ['service'] }, config: {} },
            { key: 'unitPrice', label: 'P.U HT', type: 'number', required: true, visible: true, width: 'S', order: 4, showWhen: { lineType: ['service'] }, config: {} },
            { key: 'vatRate', label: 'TVA %', type: 'number', required: false, visible: true, width: 'XS', order: 5, showWhen: { lineType: ['service'] }, config: {} },
            { key: 'lineTotal', label: 'Total HT', type: 'formula', required: false, visible: true, width: 'S', order: 6, showWhen: { lineType: ['service'] }, config: { expression: 'qty * unitPrice', dependencies: ['qty', 'unitPrice'] } },
            { key: 'lineVat', label: 'TVA', type: 'formula', required: false, visible: true, width: 'S', order: 7, showWhen: { lineType: ['service'] }, config: { expression: 'lineTotal * vatRate / 100', dependencies: ['lineTotal', 'vatRate'] } },
            { key: 'lineTtc', label: 'Total TTC', type: 'formula', required: false, visible: true, width: 'S', order: 8, showWhen: { lineType: ['service'] }, config: { expression: 'lineTotal + lineVat', dependencies: ['lineTotal', 'lineVat'] } },
            { key: 'note', label: 'Note', type: 'textarea', required: false, visible: true, width: 'XL', order: 9, showWhen: { lineType: ['note'] }, config: {} }
        ],
        totals: { subtotalKey: 'lineTotal', vatKey: 'lineVat', totalFormula: 'subtotal + vat' },
        snapshotConfig: {
            enabled: true,
            targetType: 'relation',
            targetRelationKey: rk['consultations__patients'],
            targetEntityId: E['patients']
        }
    });
    console.log(`   ✅ LineSchema: Prestations Consultation (${consultationPrestationSchema._id})`);

    // Exam request schema (catalog of exams to do)
    const consultationExamSchema = await upsertDoc(db.LineSchema, { slug: 'consultation_exams_v1', 'meta.createdByPreset': PRESET }, {
        name: 'Examens à réaliser', slug: 'consultation_exams_v1',
        description: 'Liste des examens demandés pendant une consultation',
        appliesTo: { entityIds: [E['consultations']], documentType: 'consultation' },
        sourceEntityId: E['examens'],
        lineTypes: ['exam', 'note'], defaultLineType: 'exam',
        columns: [
            {
                key: 'exam', label: 'Examen', type: 'relation', required: true, visible: true, width: 'L', order: 0,
                showWhen: { lineType: ['exam'] },
                config: {
                    targetEntity: E['examens'],
                    searchFields: ['title', 'code_examen'],
                    displayFields: ['title', 'code_examen'],
                    applyDefaults: {
                        description: 'title',
                        examCode: 'cf.' + f.code_examen,
                        unit: 'cf.' + f.unite_mesure,
                        normalRange: 'cf.' + f.valeur_normale,
                        fasting: 'cf.' + f.condition_prelevement,
                        turnaround: 'cf.' + f.delai_resultat
                    }
                }
            },
            { key: 'description', label: 'Description', type: 'text', required: false, visible: true, width: 'L', order: 1, showWhen: { lineType: ['exam'] }, config: {} },
            { key: 'examCode', label: 'Code', type: 'text', required: false, visible: true, width: 'S', order: 2, showWhen: { lineType: ['exam'] }, config: {} },
            { key: 'urgency', label: 'Priorité', type: 'select', required: false, visible: true, width: 'XS', order: 3, showWhen: { lineType: ['exam'] }, config: { options: [{ value: 'routine', label: 'Routine' }, { value: 'urgent', label: 'Urgent' }, { value: 'stat', label: 'STAT' }] } },
            { key: 'status', label: 'Statut', type: 'select', required: false, visible: true, width: 'XS', order: 4, showWhen: { lineType: ['exam'] }, config: { options: [{ value: 'todo', label: 'À faire' }, { value: 'done', label: 'Réalisé' }] } },
            { key: 'resultValue', label: 'Résultat', type: 'text', required: false, visible: true, width: 'S', order: 5, showWhen: { lineType: ['exam'] }, config: {} },
            { key: 'unit', label: 'Unité', type: 'text', required: false, visible: true, width: 'XS', order: 6, showWhen: { lineType: ['exam'] }, config: {} },
            { key: 'normalRange', label: 'Normes', type: 'text', required: false, visible: true, width: 'S', order: 7, showWhen: { lineType: ['exam'] }, config: {} },
            { key: 'comment', label: 'Commentaire', type: 'textarea', required: false, visible: true, width: 'XL', order: 8, showWhen: { lineType: ['exam', 'note'] }, config: {} }
        ],
        totals: {},
        snapshotConfig: {
            enabled: true,
            targetType: 'relation',
            targetRelationKey: rk['consultations__patients'],
            targetEntityId: E['patients']
        }
    });
    console.log(`   ✅ LineSchema: Examens Consultation (${consultationExamSchema._id})`);

    // (Patient treatment follow-up now uses the shared 'traitement' schema above)

    const patientExamSchema = await upsertDoc(db.LineSchema, { slug: 'patient_exam_followup_v1', 'meta.createdByPreset': PRESET }, {
        name: 'Examens Patient', slug: 'patient_exam_followup_v1',
        description: 'Historique des examens du patient',
        appliesTo: { entityIds: [E['patients']], documentType: 'medical-followup' },
        sourceEntityId: E['examens'],
        lineTypes: ['exam', 'note'], defaultLineType: 'exam',
        columns: JSON.parse(JSON.stringify(consultationExamSchema.columns || [])),
        totals: {},
        snapshotConfig: { enabled: true, targetType: 'record' }
    });
    console.log(`   ✅ LineSchema: Examens Patient (${patientExamSchema._id})`);

    // Facture Standard schema
    const invoiceLineSchema = await upsertDoc(db.LineSchema, { slug: 'invoice_v1', 'meta.createdByPreset': PRESET }, {
        name: 'Facture Standard', slug: 'invoice_v1',
        description: 'Lignes de facturation pour factures et devis',
        appliesTo: { entityIds: [E['factures']], documentType: 'invoice' },
        lineTypes: ['product', 'service', 'note'], defaultLineType: 'product',
        columns: [
            { key: 'description', label: 'Description', type: 'text', required: true, visible: true, width: 'L', order: 0, config: {} },
            {
                key: 'qty', label: 'Qté', type: 'number', required: true, visible: true, width: 'XS', order: 1,
                showWhen: { lineType: ['product', 'service'] }, config: {}
            },
            {
                key: 'unitPrice', label: 'P.U. HT', type: 'money', required: true, visible: true, width: 'S', order: 2,
                showWhen: { lineType: ['product', 'service'] }, config: { currency: 'MAD', decimals: 2 }
            },
            {
                key: 'discount', label: 'Remise %', type: 'number', required: false, visible: true, width: 'XS', order: 3,
                showWhen: { lineType: ['product', 'service'] }, config: {}
            },
            {
                key: 'vatRate', label: 'TVA %', type: 'number', required: false, visible: true, width: 'XS', order: 4,
                showWhen: { lineType: ['product', 'service'] }, config: {}
            },
            {
                key: 'lineTotal', label: 'Total HT', type: 'formula', required: false, visible: true, width: 'S', order: 5,
                showWhen: { lineType: ['product', 'service'] },
                config: { expression: 'qty * unitPrice * (1 - discount / 100)', dependencies: ['qty', 'unitPrice', 'discount'] }
            },
            {
                key: 'lineVat', label: 'TVA', type: 'formula', required: false, visible: true, width: 'S', order: 6,
                showWhen: { lineType: ['product', 'service'] },
                config: { expression: 'lineTotal * vatRate / 100', dependencies: ['lineTotal', 'vatRate'] }
            },
            {
                key: 'note', label: 'Note', type: 'textarea', required: false, visible: true, width: 'XL', order: 7,
                showWhen: { lineType: ['note'] }, config: {}
            }
        ],
        totals: { subtotalKey: 'lineTotal', vatKey: 'lineVat', totalFormula: 'subtotal + vat' }
    });
    console.log(`   ✅ LineSchema: Facture Standard (${invoiceLineSchema._id})`);

    // Attach schemas to entities via gridSchemas — shared traitement schema everywhere
    await db.Entity.findByIdAndUpdate(E['consultations'], {
        $set: {
            enableDynamicTable: true,
            gridSchemas: [
                { schemaId: traitementSchema._id, position: 'main', order: 0, label: 'Traitements' },
                { schemaId: consultationPrestationSchema._id, position: 'main', order: 1, label: 'Prestations' },
                { schemaId: consultationExamSchema._id, position: 'main', order: 2, label: 'Examens' }
            ],
            sidebarWidgets: [
                { type: 'note', label: 'Observations', icon: 'solar:clipboard-text-bold-duotone', color: '#00ab55', order: 0, visible: true, config: { content: '' } }
            ]
        }
    });
    await db.Entity.findByIdAndUpdate(E['prescriptions'], {
        $set: { gridSchemas: [{ schemaId: traitementSchema._id, position: 'main', order: 0, label: 'Traitements' }] }
    });
    await db.Entity.findByIdAndUpdate(E['factures'], {
        $set: { gridSchemas: [{ schemaId: invoiceLineSchema._id, position: 'main', order: 0, label: 'Lignes de facturation' }] }
    });
    await db.Entity.findByIdAndUpdate(E['patients'], {
        $set: {
            gridSchemas: [
                { schemaId: traitementSchema._id, position: 'main', order: 0, label: 'Traitements' },
                { schemaId: patientExamSchema._id, position: 'main', order: 1, label: 'Examens patient' }
            ]
        }
    });
    console.log('   ✅ LineSchemas attached to entities (patients, consultations, prescriptions, factures)');

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
    const traitementSchema = await db.LineSchema.findOne({ slug: 'traitement', 'meta.createdByPreset': PRESET }).lean();
    const consultationPrestationSchema = await db.LineSchema.findOne({ slug: 'consultation_billing_v1', 'meta.createdByPreset': PRESET }).lean();
    const consultationExamSchema = await db.LineSchema.findOne({ slug: 'consultation_exams_v1', 'meta.createdByPreset': PRESET }).lean();
    const patientExamSchema = await db.LineSchema.findOne({ slug: 'patient_exam_followup_v1', 'meta.createdByPreset': PRESET }).lean();
    const invoiceSchema = await db.LineSchema.findOne({ slug: 'invoice_v1', 'meta.createdByPreset': PRESET }).lean();

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
        { t: 'Ahmed Khelifi', nom: 'Khelifi', prenom: 'Ahmed', dn: '1985-03-15', sexe: 'M', tel: '0612345678', email: 'ahmed.khelifi@mail.com', secu: '185037512345678', gs: 'A+', allergies: 'Pénicilline', antecedents: 'Asthme depuis l\'enfance', med: 'Dr. Boukirou', mut: 'MGEN' },
        { t: 'Sophie Martin', nom: 'Martin', prenom: 'Sophie', dn: '1990-07-22', sexe: 'F', tel: '0623456789', email: 'sophie.martin@mail.com', secu: '290077512345678', gs: 'O+', allergies: '', antecedents: 'RAS', med: 'Dr. Boukirou', mut: 'Harmonie Mutuelle' },
        { t: 'Jean-Pierre Dubois', nom: 'Dubois', prenom: 'Jean-Pierre', dn: '1972-11-08', sexe: 'M', tel: '0634567890', email: 'jp.dubois@mail.com', secu: '172117512345678', gs: 'B+', allergies: 'Aspirine, Sulfamides', antecedents: 'HTA traitée depuis 2015\nDiabète type 2 (Metformine)', med: 'Dr. Boukirou', mut: 'AXA Santé' },
        { t: 'Fatima Benali', nom: 'Benali', prenom: 'Fatima', dn: '1988-01-30', sexe: 'F', tel: '0645678901', email: 'fatima.benali@mail.com', secu: '288017512345678', gs: 'A-', allergies: 'Arachide', antecedents: 'Migraine chronique', med: 'Dr. Cohen', mut: 'MAAF Santé' },
        { t: 'Marie Leroy', nom: 'Leroy', prenom: 'Marie', dn: '1965-05-12', sexe: 'F', tel: '0656789012', email: 'marie.leroy@mail.com', secu: '265057512345678', gs: 'AB+', allergies: 'Iode, Latex', antecedents: 'Infarctus du myocarde (2019)\nHTA\nHypercholestérolémie', med: 'Dr. Boukirou', mut: 'Groupama' },
        { t: 'Mohamed Azzouzi', nom: 'Azzouzi', prenom: 'Mohamed', dn: '1995-09-18', sexe: 'M', tel: '0667890123', email: 'mohamed.a@mail.com', secu: '195097512345678', gs: 'O-', allergies: '', antecedents: 'RAS', med: 'Dr. Cohen', mut: 'MGEN' },
        { t: 'Claire Dupont', nom: 'Dupont', prenom: 'Claire', dn: '1982-12-05', sexe: 'F', tel: '0678901234', email: 'claire.dupont@mail.com', secu: '282127512345678', gs: 'A+', allergies: 'Pénicilline, Codéine', antecedents: 'Hypothyroïdie (Levothyrox)\nAnxiété généralisée', med: 'Dr. Boukirou', mut: 'Swiss Life' },
        { t: 'Youssef El Amrani', nom: 'El Amrani', prenom: 'Youssef', dn: '1978-04-25', sexe: 'M', tel: '0689012345', email: 'youssef.ea@mail.com', secu: '178047512345678', gs: 'B-', allergies: '', antecedents: 'Lombalgie chronique\nHernie discale L4-L5', med: 'Dr. Boukirou', mut: 'AXA Santé' },
        { t: 'Isabelle Roux', nom: 'Roux', prenom: 'Isabelle', dn: '1993-08-14', sexe: 'F', tel: '0690123456', email: 'isabelle.roux@mail.com', secu: '293087512345678', gs: 'O+', allergies: '', antecedents: 'RAS', med: 'Dr. Cohen', mut: 'Harmonie Mutuelle' },
        { t: 'Pierre Moreau', nom: 'Moreau', prenom: 'Pierre', dn: '1960-02-28', sexe: 'M', tel: '0601234567', email: 'pierre.moreau@mail.com', secu: '160027512345678', gs: 'AB-', allergies: 'AINS', antecedents: 'BPCO\nInsuffisance cardiaque stade II\nProthèse genou droit (2020)', med: 'Dr. Boukirou', mut: 'Groupama' },
        { t: 'Nadia Bouzid', nom: 'Bouzid', prenom: 'Nadia', dn: '1997-06-10', sexe: 'F', tel: '0612345670', email: 'nadia.bouzid@mail.com', secu: '297067512345678', gs: 'A+', allergies: 'Arachide, Pollen', antecedents: 'Eczéma atopique\nRhinite allergique saisonnière', med: 'Dr. Boukirou', mut: 'MGEN' },
        { t: 'François Bernard', nom: 'Bernard', prenom: 'François', dn: '1975-10-20', sexe: 'M', tel: '0623456780', email: 'f.bernard@mail.com', secu: '175107512345678', gs: 'O+', allergies: '', antecedents: 'Appendicectomie (2005)\nTabagisme sevré (2018)', med: 'Dr. Boukirou', mut: 'MAAF Santé' },
        { t: 'Amina Saidi', nom: 'Saidi', prenom: 'Amina', dn: '1989-03-08', sexe: 'F', tel: '0634567801', email: 'amina.saidi@mail.com', secu: '289037512345678', gs: 'B+', allergies: 'Sulfamides', antecedents: 'Anémie ferriprive', med: 'Dr. Cohen', mut: 'Swiss Life' },
        { t: 'Luc Petit', nom: 'Petit', prenom: 'Luc', dn: '1970-07-15', sexe: 'M', tel: '0645678012', email: 'luc.petit@mail.com', secu: '170077512345678', gs: 'A+', allergies: '', antecedents: 'Goutte\nHyperuricémie', med: 'Dr. Boukirou', mut: 'AXA Santé' },
        { t: 'Leila Hamdi', nom: 'Hamdi', prenom: 'Leila', dn: '2000-01-05', sexe: 'F', tel: '0656780123', email: 'leila.h@mail.com', secu: '200017512345678', gs: 'O+', allergies: '', antecedents: 'RAS', med: 'Dr. Cohen', mut: 'MGEN' },
    ];

    for (const p of patientData) {
        const customs = {
            nom: p.nom, prenom: p.prenom, date_naissance: new Date(p.dn), sexe: p.sexe,
            telephone: p.tel, email: p.email, numero_secu: p.secu,
            groupe_sanguin: p.gs, medecin_traitant: p.med, mutuelle: p.mut,
        };
        if (p.allergies) customs.allergies = p.allergies;
        if (p.antecedents && p.antecedents !== 'RAS') customs.antecedents = p.antecedents;
        const doc = await rec('patients', p.t, customs);
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

    // -- Prestations (catalog for consultation billing) --
    const prestations = [];
    const prestationData = [
        { t: 'Consultation générale', code: 'CONS-GEN', ht: 250, tva: 0 },
        { t: 'Consultation spécialisée', code: 'CONS-SPEC', ht: 350, tva: 0 },
        { t: 'Contrôle / suivi', code: 'CONS-SUIVI', ht: 180, tva: 0 },
        { t: 'ECG', code: 'ECG-12D', ht: 220, tva: 20 },
        { t: 'Échographie abdominale', code: 'ECHO-ABD', ht: 500, tva: 20 },
        { t: 'Radiographie thorax', code: 'RX-THX', ht: 420, tva: 20 },
        { t: 'Infiltration locale', code: 'INFIL', ht: 300, tva: 20 },
        { t: 'Pansement complexe', code: 'PANS-C', ht: 160, tva: 20 },
        { t: 'Suture simple', code: 'SUT-S', ht: 280, tva: 20 },
        { t: 'Nébulisation', code: 'NEBU', ht: 140, tva: 20 }
    ];
    for (const p of prestationData) {
        const doc = await rec('prestations', p.t, {
            code_prestation: p.code,
            prix_ht: p.ht,
            tva_rate: p.tva
        });
        prestations.push(doc);
    }

    // -- Examens (catalogue) --
    const examens = [];
    const examData = [
        { t: 'TSH ultrasensible', code: 'TSH', unit: 'mUI/L', normal: '0.4 - 4.0', cond: 'À jeun recommandé', delay: '24h' },
        { t: 'HbA1c', code: 'HBA1C', unit: '%', normal: '4.0 - 5.6', cond: 'Pas de jeûne requis', delay: '24h' },
        { t: 'Glycémie à jeun', code: 'GLY', unit: 'g/L', normal: '0.70 - 1.10', cond: 'Jeûne 8h', delay: '6h' },
        { t: 'CRP', code: 'CRP', unit: 'mg/L', normal: '< 5', cond: 'Pas de jeûne requis', delay: '8h' },
        { t: 'NFS', code: 'NFS', unit: 'G/L', normal: 'Selon paramètres', cond: 'Pas de jeûne requis', delay: '6h' },
        { t: 'Créatinine', code: 'CREAT', unit: 'mg/L', normal: '6 - 12', cond: 'Hydratation normale', delay: '8h' },
        { t: 'Bilan lipidique', code: 'LIPID', unit: 'g/L', normal: 'Selon paramètres', cond: 'Jeûne 12h', delay: '24h' },
        { t: 'ECBU', code: 'ECBU', unit: 'CFU/mL', normal: 'Négatif', cond: 'Urines du matin', delay: '48h' },
        { t: 'ASAT / ALAT', code: 'HEPA', unit: 'UI/L', normal: '< 40', cond: 'Pas de jeûne requis', delay: '24h' },
        { t: 'Ferritine', code: 'FER', unit: 'ng/mL', normal: '15 - 150', cond: 'Matin conseillé', delay: '24h' }
    ];
    for (const ex of examData) {
        const doc = await rec('examens', ex.t, {
            code_examen: ex.code,
            unite_mesure: ex.unit,
            valeur_normale: ex.normal,
            condition_prelevement: ex.cond,
            delai_resultat: ex.delay
        });
        examens.push(doc);
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

    // -- Symptômes (20) --
    const symptoms = [];
    const symptomNames = [
        'Fatigue', 'Toux', 'Céphalées', 'Douleur thoracique', 'Dyspnée',
        'Fièvre', 'Nausées', 'Vomissements', 'Douleur abdominale', 'Vertiges',
        'Lombalgie', 'Raideur', 'Œdème', 'Prurit', 'Rhinorrhée',
        'Pharyngite', 'Myalgies', 'Courbatures', 'Brûlures mictionnelles', 'Pollakiurie'
    ];
    for (const name of symptomNames) {
        const doc = await rec('symptomes', name, {});
        symptoms.push(doc);
    }

    // Symptom index lookup by name
    const symIdx = {};
    symptoms.forEach((s, i) => { symIdx[symptomNames[i]] = s; });

    // -- Traitements (25) - principalement médicaments + quelques soins --
    const traitements = [];
    const traitementNames = [
        'Amoxicilline 500mg', 'Doliprane 1000mg', 'Ibuprofène 400mg', 'Ventoline 100µg',
        'Augmentin 1g', 'Oméprazole 20mg', 'Metformine 850mg', 'Amlodipine 5mg',
        'Levothyrox 75µg', 'Clopidogrel 75mg', 'Prednisolone 20mg', 'Tramadol 50mg',
        'Voltarène Gel 1%', 'Aerius 5mg', 'Gaviscon', 'Spasfon 80mg',
        'Bisoprolol 5mg', 'Atorvastatine 10mg', 'Ramipril 5mg', 'Alprazolam 0.25mg',
        'Séance kinésithérapie', 'Séance ostéopathie', 'Acupuncture',
        'Rééducation respiratoire', 'Drainage lymphatique'
    ];
    for (let i = 0; i < traitementNames.length; i++) {
        const p = patients[i % patients.length];
        const title = traitementNames[i];
        const baseDefaults = {
            moment: ['morning'],
            frequency: ['2x_day'],
            duration: ['7_days'],
            instructions: 'Prendre pendant les repas'
        };
        const normalized = title.toLowerCase();
        if (normalized.includes('doliprane') || normalized.includes('ibuprof') || normalized.includes('tramadol')) {
            baseDefaults.frequency = ['3x_day'];
            baseDefaults.instructions = 'En cas de douleur, après le repas';
        } else if (normalized.includes('amoxic') || normalized.includes('augmentin')) {
            baseDefaults.frequency = ['3x_day'];
            baseDefaults.duration = ['7_days'];
            baseDefaults.instructions = 'Respecter les horaires, cure complète';
        } else if (normalized.includes('oméprazole') || normalized.includes('gaviscon')) {
            baseDefaults.moment = ['before_meal'];
            baseDefaults.frequency = ['2x_day'];
        } else if (normalized.includes('metformine') || normalized.includes('amlodipine') || normalized.includes('bisoprolol')) {
            baseDefaults.duration = ['30_days'];
            baseDefaults.frequency = ['1x_day'];
        } else if (normalized.includes('kin') || normalized.includes('rééducation') || normalized.includes('drainage') || normalized.includes('ostéo') || normalized.includes('acupuncture')) {
            baseDefaults.moment = ['as_needed'];
            baseDefaults.frequency = ['weekly'];
            baseDefaults.duration = ['30_days'];
            baseDefaults.instructions = 'Planifier les séances avec le patient';
        }

        const lineDefaults = [{
            schemaId: traitementSchema?._id,
            defaults: baseDefaults
        }].filter(d => d.schemaId);

        const doc = await rec('traitements', traitementNames[i], {}, {
            relations: [{ relationKey: rk['traitements__patients'], value: p._id }],
            lineDefaults
        });
        traitements.push(doc);
    }

    // -- Pathologies (15) - liées aux patients --
    const pathologies = [];
    const pathologieData = [
        { t: 'Hypertension artérielle', pIdx: 2 },
        { t: 'Diabète type 2', pIdx: 2 },
        { t: 'Asthme', pIdx: 0 },
        { t: 'Hypothyroïdie', pIdx: 6 },
        { t: 'Lombalgie chronique', pIdx: 7 },
        { t: 'Migraine chronique', pIdx: 3 },
        { t: 'BPCO', pIdx: 9 },
        { t: 'Insuffisance cardiaque', pIdx: 9 },
        { t: 'Eczéma atopique', pIdx: 10 },
        { t: 'Rhinite allergique', pIdx: 10 },
        { t: 'Anxiété généralisée', pIdx: 6 },
        { t: 'Goutte', pIdx: 13 },
        { t: 'Anémie ferriprive', pIdx: 12 },
        { t: 'Hernie discale L4-L5', pIdx: 7 },
        { t: 'Hypercholestérolémie', pIdx: 4 },
    ];
    for (const pd of pathologieData) {
        const p = patients[pd.pIdx];
        const doc = await rec('pathologies', pd.t, {}, {
            relations: [{ relationKey: rk['pathologies__patients'], value: p._id }]
        });
        pathologies.push(doc);
    }

    // Map each consultation to relevant symptoms
    const consultSymptoms = [
        /* 0 SAOS */['Douleur thoracique', 'Dyspnée', 'Fatigue'],
        /* 1 Rhinoph */['Toux', 'Rhinorrhée', 'Pharyngite', 'Fièvre'],
        /* 2 Lombalgie */['Lombalgie', 'Raideur'],
        /* 3 HTA */['Céphalées', 'Vertiges'],
        /* 4 Diabète */['Fatigue'],
        /* 5 Bronchite */['Fièvre', 'Toux', 'Courbatures'],
        /* 6 Entorse */['Œdème'],
        /* 7 Migraine */['Céphalées', 'Nausées'],
        /* 8 Gastrite */['Douleur abdominale', 'Nausées'],
        /* 9 Inf. urin */['Brûlures mictionnelles', 'Pollakiurie'],
        /* 10 Eczéma */['Prurit'],
        /* 11 Angine */['Pharyngite', 'Fièvre'],
    ];

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
    const consultData = [
        { diag: 'SAOS sous PPC', motif: 'Douleur thoracique', notes: 'Auscultation : souffle systolique léger. ECG : rythme sinusal. TA : 14/9. SpO2 : 97%. SAOS sous PPC diagnostiqué.' },
        { diag: 'Rhinopharyngite', motif: 'Toux persistante', notes: 'Gorge rouge. Tympans normaux. Pas d\'adénopathie. Auscultation pulmonaire claire. Rhinopharyngite d\'origine virale.' },
        { diag: 'Lombalgie aiguë', motif: 'Mal de dos', notes: 'Contracture paravertébrale lombaire. Lasègue négatif bilatéral. ROT normaux. Repos + AINS + kiné recommandés.' },
        { diag: 'HTA essentielle', motif: 'Contrôle tension', notes: 'TA bras droit : 16/10, bras gauche : 15/9. Fond d\'œil : stade I. Ajustement traitement antihypertenseur.' },
        { diag: 'Diabète type 2 équilibré', motif: 'Suivi diabète', notes: 'Examen des pieds : sensibilité conservée. HbA1c : 6.8%. Bon équilibre. Continuer Metformine.' },
        { diag: 'Bronchite aiguë', motif: 'Fièvre', notes: 'Auscultation : râles bronchiques bilatéraux. Pas de foyer de condensation. FR : 18/min. Traitement symptomatique.' },
        { diag: 'Entorse cheville', motif: 'Chute', notes: 'Œdème péri-malléolaire externe. Tiroir antérieur négatif. Protocole RICE prescrit. Contrôle à J+7.' },
        { diag: 'Migraine', motif: 'Céphalées', notes: 'Examen neurologique normal. Nuque souple. Paires crâniennes intactes. Triptan prescrit en crise.' },
        { diag: 'Gastrite', motif: 'Brûlures estomac', notes: 'Abdomen souple, sensibilité épigastrique sans défense. IPP prescrit pour 4 semaines. RDV gastro si persistance.' },
        { diag: 'Infection urinaire', motif: 'Brûlures miction', notes: 'BU : leucocytes +++, nitrites +. Antibiothérapie probabiliste prescrite. ECBU demandé.' },
        { diag: 'Eczéma', motif: 'Démangeaisons', notes: 'Plaques érythémato-squameuses aux plis. Lésions de grattage. Dermocorticoïdes + émollient prescrits.' },
        { diag: 'Angine streptococcique', motif: 'Mal de gorge', notes: 'TDR streptococcique : positif. Amoxicilline 6j prescrite. Repos recommandé.' },
    ];
    for (let i = 0; i < 12; i++) {
        const p = patients[i % patients.length];
        const consultTypeOpts = cls['consult_type_opts'];
        const typeIdx = i % 4;
        const cd = consultData[i];
        const doc = await rec('consultations', `Consult. ${p.title} - ${cd.diag}`, {
            motif: cd.motif,
            notes_generales: cd.notes,
        }, {
            relations: [
                { relationKey: rk['consultations__patients'], value: p._id },
                ...(consultSymptoms[i] || []).map(sName => ({ relationKey: rk['consultations__symptomes'], value: symIdx[sName]?._id })).filter(r => r.value),
                ...(examens.length > 0 ? [
                    { relationKey: rk['consultations__examens'], value: examens[i % examens.length]._id },
                    { relationKey: rk['consultations__examens'], value: examens[(i + 1) % examens.length]._id }
                ] : [])
            ],
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

    // ---- BULK DEMO EXPANSION (max data) ----
    const firstNames = ['Yasmine', 'Karim', 'Lea', 'Omar', 'Ines', 'Samir', 'Maya', 'Hugo', 'Nora', 'Adam', 'Lina', 'Rayan'];
    const lastNames = ['Bensaid', 'Naji', 'Leclerc', 'Rossi', 'Mansouri', 'Rahimi', 'Dupuis', 'Chevalier', 'Garnier', 'Lacroix'];
    const consultMotifs = ['Douleur thoracique', 'Suivi diabète', 'Contrôle HTA', 'Céphalées', 'Toux persistante', 'Bilan annuel', 'Lombalgie', 'Fatigue'];
    const extraPatients = [];
    for (let i = 0; i < 60; i++) {
        const fn = firstNames[i % firstNames.length];
        const ln = lastNames[(i * 3) % lastNames.length];
        const title = `${fn} ${ln} ${i + 1}`;
        const birthYear = 1955 + (i % 45);
        const p = await rec('patients', title, {
            nom: ln,
            prenom: fn,
            date_naissance: new Date(`${birthYear}-${String((i % 12) + 1).padStart(2, '0')}-15`),
            sexe: i % 2 === 0 ? 'M' : 'F',
            telephone: `06${String(10000000 + i).slice(-8)}`,
            email: `${slug(fn)}.${slug(ln)}${i + 1}@mail.com`,
            medecin_traitant: i % 2 === 0 ? 'Dr. Boukirou' : 'Dr. Cohen',
            mutuelle: ['MGEN', 'AXA Santé', 'Harmonie Mutuelle'][i % 3]
        });
        extraPatients.push(p);
    }
    patients.push(...extraPatients);

    const allConsults = [...consults];
    for (let i = 0; i < 180; i++) {
        const p = patients[i % patients.length];
        const motif = consultMotifs[i % consultMotifs.length];
        const c = await rec('consultations', `Consult. ${p.title} - ${motif} #${i + 1}`, {
            motif,
            notes_generales: `Consultation de contrôle ${i + 1}.`
        }, {
            relations: [
                { relationKey: rk['consultations__patients'], value: p._id },
                ...(examens.length > 1 ? [
                    { relationKey: rk['consultations__examens'], value: examens[i % examens.length]._id },
                    { relationKey: rk['consultations__examens'], value: examens[(i + 2) % examens.length]._id }
                ] : [])
            ]
        });
        allConsults.push(c);
    }
    consults.splice(0, consults.length, ...allConsults);

    for (let i = 0; i < 140; i++) {
        const p = patients[i % patients.length];
        const c = consults[i % consults.length];
        const amount = 120 + (i % 7) * 40;
        await rec('factures', `FAC-DEMO-${String(i + 1).padStart(5, '0')}`, {
            montant_total: amount,
            montant_paye: i % 4 === 0 ? amount : (i % 4 === 1 ? Math.floor(amount * 0.5) : 0),
            date_echeance: new Date(Date.now() + (5 + (i % 45)) * 86400000)
        }, {
            relations: [
                { relationKey: rk['factures__patients'], value: p._id },
                { relationKey: rk['factures__consultations'], value: c._id }
            ]
        });
    }

    // ---- Seed dynamic table lines + snapshots for richer demo ----
    const DocumentLine = db.DocumentLine;
    const GridSnapshot = db.GridSnapshot;
    const schemasToClear = [
        traitementSchema?._id,
        consultationPrestationSchema?._id,
        consultationExamSchema?._id,
        patientExamSchema?._id,
        invoiceSchema?._id
    ].filter(Boolean);
    if (schemasToClear.length > 0) {
        await DocumentLine.deleteMany({ schemaId: { $in: schemasToClear } });
        await GridSnapshot.deleteMany({ schemaId: { $in: schemasToClear } });
    }

    const lineDocs = [];
    for (let i = 0; i < consults.length; i++) {
        const c = consults[i];
        const pRel = (c.relations || []).find(r => r.relationKey === rk['consultations__patients']);
        const patientId = pRel?.value;
        if (!patientId) continue;

        if (traitementSchema?._id) {
            const t1 = traitements[i % traitements.length];
            const t2 = traitements[(i + 3) % traitements.length];
            const tLines = [t1, t2].map((t, idx) => ({
                documentId: c._id,
                schemaId: traitementSchema._id,
                lineType: 'treatment',
                order: idx,
                values: {
                    treatment: t._id.toString(),
                    treatment_label: t.title,
                    moment: idx === 0 ? ['morning'] : ['evening'],
                    frequency: ['2x_day'],
                    duration: ['7_days'],
                    instructions: idx === 0 ? 'Après le repas' : 'Le soir au coucher'
                },
                computed: {},
                createdBy: uid
            }));
            lineDocs.push(...tLines);

            // snapshot history (2 per consultation -> patient timeline)
            for (let s = 0; s < 2; s++) {
                await GridSnapshot.create({
                    schemaId: traitementSchema._id,
                    recordId: c._id,
                    targetRecordId: patientId,
                    targetEntityId: E['patients'],
                    date: new Date(Date.now() - (i * 2 + s) * 86400000),
                    lines: tLines.map((l, li) => ({ lineType: l.lineType, values: l.values, computed: l.computed, order: li })),
                    createdBy: uid
                });
            }
        }

        if (consultationPrestationSchema?._id) {
            const pr = prestations[i % prestations.length];
            const qty = (i % 2) + 1;
            const unitPrice = Number((pr.customFields || []).find(cf => String(cf.field_id) === String(f.prix_ht))?.value || 0);
            const vatRate = Number((pr.customFields || []).find(cf => String(cf.field_id) === String(f.tva_rate))?.value || 0);
            const lineTotal = qty * unitPrice;
            const lineVat = lineTotal * vatRate / 100;
            const svcLine = {
                documentId: c._id,
                schemaId: consultationPrestationSchema._id,
                lineType: 'service',
                order: 0,
                values: {
                    prestation: pr._id.toString(),
                    prestation_label: pr.title,
                    description: pr.title,
                    code: (pr.customFields || []).find(cf => String(cf.field_id) === String(f.code_prestation))?.value || '',
                    qty,
                    unitPrice,
                    vatRate
                },
                computed: { lineTotal, lineVat, lineTtc: lineTotal + lineVat },
                createdBy: uid
            };
            lineDocs.push(svcLine);

            for (let s = 0; s < 2; s++) {
                await GridSnapshot.create({
                    schemaId: consultationPrestationSchema._id,
                    recordId: c._id,
                    targetRecordId: patientId,
                    targetEntityId: E['patients'],
                    date: new Date(Date.now() - (i * 2 + s) * 86400000),
                    lines: [{ lineType: svcLine.lineType, values: svcLine.values, computed: svcLine.computed, order: 0 }],
                    createdBy: uid
                });
            }
        }

        if (consultationExamSchema?._id && examens.length > 0) {
            const ex = examens[i % examens.length];
            const exCode = (ex.customFields || []).find(cf => String(cf.field_id) === String(f.code_examen))?.value || '';
            const unit = (ex.customFields || []).find(cf => String(cf.field_id) === String(f.unite_mesure))?.value || '';
            const normal = (ex.customFields || []).find(cf => String(cf.field_id) === String(f.valeur_normale))?.value || '';
            const exLine = {
                documentId: c._id,
                schemaId: consultationExamSchema._id,
                lineType: 'exam',
                order: 0,
                values: {
                    exam: ex._id.toString(),
                    exam_label: ex.title,
                    description: ex.title,
                    examCode: exCode,
                    urgency: i % 6 === 0 ? 'urgent' : 'routine',
                    status: i % 5 === 0 ? 'done' : 'todo',
                    resultValue: i % 5 === 0 ? 'Valeur OK' : '',
                    unit,
                    normalRange: normal
                },
                computed: {},
                createdBy: uid
            };
            lineDocs.push(exLine);

            for (let s = 0; s < 2; s++) {
                await GridSnapshot.create({
                    schemaId: consultationExamSchema._id,
                    recordId: c._id,
                    targetRecordId: patientId,
                    targetEntityId: E['patients'],
                    date: new Date(Date.now() - (i * 2 + s) * 86400000),
                    lines: [{ lineType: exLine.lineType, values: exLine.values, computed: exLine.computed, order: 0 }],
                    createdBy: uid
                });
            }
        }
    }

    // patient tables follow-up
    for (let i = 0; i < patients.length; i++) {
        const p = patients[i];
        if (traitementSchema?._id) {
            const t = traitements[i % traitements.length];
            lineDocs.push({
                documentId: p._id,
                schemaId: traitementSchema._id,
                lineType: 'treatment',
                order: 0,
                values: {
                    treatment: t._id.toString(),
                    treatment_label: t.title,
                    moment: ['morning'],
                    frequency: ['1x_day'],
                    duration: ['30_days'],
                    instructions: 'Suivi patient'
                },
                computed: {},
                createdBy: uid
            });
        }
        if (patientExamSchema?._id && examens.length > 0) {
            const ex = examens[i % examens.length];
            lineDocs.push({
                documentId: p._id,
                schemaId: patientExamSchema._id,
                lineType: 'exam',
                order: 0,
                values: {
                    exam: ex._id.toString(),
                    exam_label: ex.title,
                    description: ex.title,
                    status: i % 3 === 0 ? 'done' : 'todo'
                },
                computed: {},
                createdBy: uid
            });
        }
    }

    // invoice lines for facture table demo
    if (invoiceSchema?._id) {
        const factures = await db.Record.find({ entityId: E['factures'] }).limit(220).lean();
        for (let i = 0; i < factures.length; i++) {
            const pr = prestations[i % prestations.length];
            const qty = (i % 3) + 1;
            const unitPrice = Number((pr.customFields || []).find(cf => String(cf.field_id) === String(f.prix_ht))?.value || 100);
            const vatRate = Number((pr.customFields || []).find(cf => String(cf.field_id) === String(f.tva_rate))?.value || 20);
            const lineTotal = qty * unitPrice;
            const lineVat = lineTotal * vatRate / 100;
            lineDocs.push({
                documentId: factures[i]._id,
                schemaId: invoiceSchema._id,
                lineType: 'service',
                order: 0,
                values: {
                    description: pr.title,
                    qty,
                    unitPrice,
                    discount: 0,
                    vatRate
                },
                computed: { lineTotal, lineVat },
                createdBy: uid
            });
        }
    }

    if (lineDocs.length > 0) {
        await DocumentLine.insertMany(lineDocs, { ordered: false });
    }
}

// ============================================
// DOCUMENT TEMPLATES
// ============================================
async function createDocumentTemplates(db, ids, userId) {
    const uid = new mongoose.Types.ObjectId(userId);
    const E = ids.entities;

    // Get the Traitement LineSchema ID for dynamic tables
    const traitementSchemaDoc = await db.LineSchema.findOne({ slug: 'traitement', 'meta.createdByPreset': PRESET });
    const traitementSchemaId = traitementSchemaDoc ? traitementSchemaDoc._id.toString() : '';
    const invoiceSchemaDoc = await db.LineSchema.findOne({ slug: 'invoice_v1', 'meta.createdByPreset': PRESET });
    const invoiceSchemaId = invoiceSchemaDoc ? invoiceSchemaDoc._id.toString() : '';

    // Build Ordonnance template with proper tokens and dynamic treatment table
    const ordonnanceHtml = `<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:100%;margin:0;padding:0;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;">
    <div>
      <p style="margin:0;font-size:14px;font-weight:700;color:#1e293b;">Dr. {{user.name}}</p>
      <p style="margin:2px 0;font-size:11px;color:#64748b;">Médecine Générale</p>
      <p style="margin:2px 0;font-size:11px;color:#64748b;">N° RPPS : XXXXXXXXXXX</p>
    </div>
    <div style="text-align:right;">
      <p style="margin:0;font-size:12px;color:#475569;">Le {{today}}</p>
    </div>
  </div>
  <div style="text-align:center;margin:32px 0 24px;">
    <h1 style="margin:0;font-size:22px;font-weight:700;color:#1e40af;letter-spacing:1px;">ORDONNANCE MÉDICALE</h1>
    <div style="width:80px;height:3px;background:linear-gradient(to right,#3b82f6,#60a5fa);margin:8px auto 0;border-radius:2px;"></div>
  </div>
  <div style="background:#f0f9ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin-bottom:24px;">
    <p style="margin:0 0 4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#3b82f6;">Patient</p>
    <p style="margin:0;font-size:15px;font-weight:600;color:#1e293b;">{{consultations.patients.prenom}} {{consultations.patients.nom}}</p>
    <div style="display:flex;gap:24px;margin-top:8px;">
      <p style="margin:0;font-size:11px;color:#64748b;">Né(e) le : {{consultations.patients.date_naissance}}</p>
      <p style="margin:0;font-size:11px;color:#64748b;">N° SS : {{consultations.patients.numero_secu}}</p>
    </div>
  </div>
  <div style="margin-bottom:20px;">
    <p style="margin:0 0 4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6b7280;">Motif de consultation</p>
    <p style="margin:0;font-size:13px;color:#374151;">{{consultations.motif}}</p>
  </div>
  <div class="dynamic-table" data-table='{"schemaId":"${traitementSchemaId}","style":"professional","title":"Prescription","showTotals":false}'>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-family:inherit;font-size:11pt;border:1px solid #d1d5db;">
      <thead style="background:#f3f4f6;"><tr><th style="padding:10px 12px;text-align:left;font-weight:600;color:#1f2937;border:1px solid #d1d5db;font-size:10pt;width:40px;text-align:center;">#</th><th style="padding:10px 12px;text-align:left;font-weight:600;color:#1f2937;border:1px solid #d1d5db;font-size:10pt;">Traitement</th><th style="padding:10px 12px;text-align:left;font-weight:600;color:#1f2937;border:1px solid #d1d5db;font-size:10pt;">Moment</th><th style="padding:10px 12px;text-align:left;font-weight:600;color:#1f2937;border:1px solid #d1d5db;font-size:10pt;">Fréquence</th><th style="padding:10px 12px;text-align:left;font-weight:600;color:#1f2937;border:1px solid #d1d5db;font-size:10pt;">Durée</th><th style="padding:10px 12px;text-align:left;font-weight:600;color:#1f2937;border:1px solid #d1d5db;font-size:10pt;">Instructions</th></tr></thead>
      <tbody><tr><td colspan="7" style="padding:20px 12px;border:1px solid #d1d5db;text-align:center;color:#9ca3af;font-style:italic;">Aucune ligne</td></tr></tbody>
    </table>
  </div>
  <div style="margin-top:48px;text-align:right;">
    <p style="margin:0;font-size:12px;color:#64748b;">Signature et cachet</p>
    <div style="border-bottom:1px solid #d1d5db;width:200px;margin:24px 0 8px auto;min-height:40px;"></div>
    <p style="margin:0;font-size:13px;font-weight:600;color:#1e293b;">Dr. {{user.name}}</p>
  </div>
</div>`;

    const certificatHtml = `<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:100%;">
  <h1 style="margin:0 0 18px;font-size:22px;color:#1e40af;">CERTIFICAT MÉDICAL</h1>
  <p style="font-size:14px;line-height:1.7;color:#334155;">
    Je soussigné(e) Dr. {{user.name}}, certifie avoir examiné ce jour le/la patient(e)
    <strong>{{consultations.patients.prenom}} {{consultations.patients.nom}}</strong>,
    né(e) le {{consultations.patients.date_naissance}}.
  </p>
  <p style="font-size:14px;line-height:1.7;color:#334155;">
    L'état de santé constaté ce jour, le {{today}}, nécessite une prise en charge médicale adaptée.
  </p>
  <p style="font-size:14px;line-height:1.7;color:#334155;">
    Motif de consultation: <strong>{{consultations.motif}}</strong>
  </p>
  <p style="margin-top:28px;font-size:13px;color:#64748b;">Certificat remis à l'intéressé(e) pour faire valoir ce que de droit.</p>
  <div style="margin-top:46px;text-align:right;">
    <p style="margin:0;font-size:13px;font-weight:600;color:#1e293b;">Dr. {{user.name}}</p>
    <p style="margin:2px 0 0;font-size:11px;color:#64748b;">Date : {{today}}</p>
  </div>
</div>`;

    const compteRenduHtml = `<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:100%;">
  <h1 style="margin:0 0 18px;font-size:22px;color:#00ab55;">COMPTE RENDU DE CONSULTATION</h1>
  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px;margin-bottom:16px;">
    <p style="margin:0 0 4px;font-size:12px;"><strong>Patient :</strong> {{consultations.patients.prenom}} {{consultations.patients.nom}}</p>
    <p style="margin:0 0 4px;font-size:12px;"><strong>Date :</strong> {{today}}</p>
    <p style="margin:0;font-size:12px;"><strong>Consultation :</strong> {{consultations.title}}</p>
  </div>
  <h3 style="margin:10px 0 6px;font-size:14px;color:#334155;">Motif</h3>
  <p style="margin:0 0 10px;font-size:13px;color:#475569;">{{consultations.motif}}</p>
  <h3 style="margin:10px 0 6px;font-size:14px;color:#334155;">Examen / Observations</h3>
  <p style="margin:0 0 10px;font-size:13px;color:#475569;">{{consultations.note_medecin}}</p>
  <h3 style="margin:10px 0 6px;font-size:14px;color:#334155;">Plan de prise en charge</h3>
  <p style="margin:0;font-size:13px;color:#475569;">{{consultations.notes_generales}}</p>
</div>`;

    const factureHtml = `<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:100%;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
    <div>
      <h1 style="margin:0;font-size:24px;color:#e2a03f;">FACTURE</h1>
      <p style="margin:4px 0 0;font-size:12px;color:#64748b;">N° {{factures.title}}</p>
      <p style="margin:2px 0 0;font-size:12px;color:#64748b;">Date : {{today}}</p>
    </div>
    <div style="text-align:right;">
      <p style="margin:0;font-size:12px;color:#334155;"><strong>Patient :</strong> {{factures.patients.prenom}} {{factures.patients.nom}}</p>
      <p style="margin:2px 0 0;font-size:12px;color:#334155;"><strong>Échéance :</strong> {{factures.date_echeance}}</p>
    </div>
  </div>
  <div class="dynamic-table" data-table='{"schemaId":"${invoiceSchemaId}","style":"professional","title":"Détail des prestations","showTotals":true}'></div>
  <div style="margin-top:20px;display:flex;justify-content:flex-end;">
    <div style="width:280px;border:1px solid #e5e7eb;border-radius:8px;padding:10px 12px;background:#f9fafb;">
      <p style="margin:0 0 6px;font-size:13px;color:#334155;"><strong>Total :</strong> {{factures.montant_total}}</p>
      <p style="margin:0 0 6px;font-size:13px;color:#334155;"><strong>Payé :</strong> {{factures.montant_paye}}</p>
      <p style="margin:0;font-size:13px;color:#ef4444;"><strong>Reste à payer :</strong> {{factures.reste_a_payer}}</p>
    </div>
  </div>
</div>`;

    // ── Real content for templates that previously used placeholder text ──
    const consentementHtml = `<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:100%;margin:0;padding:0;">
  <h1 style="margin:0 0 6px;font-size:20px;color:#22c55e;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Consentement éclairé</h1>
  <div style="width:60px;height:3px;background:#22c55e;margin-bottom:20px;border-radius:2px;"></div>
  <div style="display:flex;justify-content:space-between;margin-bottom:20px;">
    <div>
      <p style="margin:0;font-size:13px;color:#64748b;">Patient : <strong style="color:#1e293b;">{{patients.prenom}} {{patients.nom}}</strong></p>
      <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Date de naissance : <strong style="color:#1e293b;">{{patients.date_naissance}}</strong></p>
    </div>
    <div style="text-align:right;">
      <p style="margin:0;font-size:13px;color:#64748b;">Date : <strong style="color:#1e293b;">{{today}}</strong></p>
    </div>
  </div>
  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:18px;">
    <p style="margin:0;font-size:13px;color:#166534;font-weight:600;">Nature de l'acte proposé :</p>
    <p style="margin:8px 0 0;font-size:13px;color:#1e293b;line-height:1.6;">_______________________________________________</p>
  </div>
  <p style="font-size:13px;line-height:1.7;color:#334155;margin:0 0 12px;">Je soussigné(e), <strong>{{patients.prenom}} {{patients.nom}}</strong>, déclare avoir été informé(e) de manière claire et complète par le Dr. {{user.name}} sur :</p>
  <ul style="font-size:13px;line-height:1.8;color:#334155;padding-left:20px;margin:0 0 16px;">
    <li>La nature et le déroulement de l'acte envisagé</li>
    <li>Les bénéfices attendus et les alternatives thérapeutiques</li>
    <li>Les risques fréquents et graves normalement prévisibles</li>
    <li>Les conséquences prévisibles en cas de refus</li>
    <li>Les suites habituelles et les précautions à prendre</li>
  </ul>
  <p style="font-size:13px;line-height:1.7;color:#334155;margin:0 0 12px;">J'ai pu poser toutes les questions souhaitées et j'ai reçu des réponses adaptées. J'ai disposé d'un délai de réflexion suffisant.</p>
  <p style="font-size:13px;line-height:1.7;color:#334155;margin:0 0 20px;">En conséquence, je donne mon consentement libre et éclairé pour la réalisation de l'acte mentionné ci-dessus.</p>
  <div style="display:flex;justify-content:space-between;margin-top:30px;">
    <div style="width:45%;"><p style="font-size:12px;color:#64748b;margin:0 0 4px;">Fait à : ________________</p><p style="font-size:12px;color:#64748b;margin:0 0 30px;">Le : {{today}}</p><p style="font-size:12px;color:#64748b;margin:0;border-top:1px solid #cbd5e1;padding-top:6px;">Signature du patient</p></div>
    <div style="width:45%;"><p style="font-size:12px;color:#64748b;margin:0 0 34px;">&nbsp;</p><p style="font-size:12px;color:#64748b;margin:0;border-top:1px solid #cbd5e1;padding-top:6px;">Signature du praticien</p></div>
  </div>
</div>`;

    const fichePatientHtml = `<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:100%;margin:0;padding:0;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
    <div><h1 style="margin:0 0 4px;font-size:20px;color:#3b82f6;font-weight:700;">Fiche patient résumé</h1><div style="width:50px;height:3px;background:#3b82f6;border-radius:2px;"></div></div>
    <div style="text-align:right;"><p style="margin:0;font-size:12px;color:#94a3b8;">Édité le {{today}}</p></div>
  </div>
  <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin-bottom:16px;">
    <div style="display:flex;gap:40px;">
      <div><p style="margin:0 0 2px;font-size:11px;color:#3b82f6;font-weight:600;text-transform:uppercase;">Identité</p><p style="margin:0;font-size:15px;color:#1e293b;font-weight:600;">{{patients.prenom}} {{patients.nom}}</p></div>
      <div><p style="margin:0 0 2px;font-size:11px;color:#3b82f6;font-weight:600;text-transform:uppercase;">Date de naissance</p><p style="margin:0;font-size:14px;color:#1e293b;">{{patients.date_naissance}}</p></div>
      <div><p style="margin:0 0 2px;font-size:11px;color:#3b82f6;font-weight:600;text-transform:uppercase;">Téléphone</p><p style="margin:0;font-size:14px;color:#1e293b;">{{patients.telephone}}</p></div>
    </div>
  </div>
  <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:16px;">
    <tr style="background:#f8fafc;"><td style="padding:10px 14px;color:#64748b;font-weight:600;width:35%;border-bottom:1px solid #e2e8f0;">Email</td><td style="padding:10px 14px;color:#1e293b;border-bottom:1px solid #e2e8f0;">{{patients.email}}</td></tr>
    <tr><td style="padding:10px 14px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;">Adresse</td><td style="padding:10px 14px;color:#1e293b;border-bottom:1px solid #e2e8f0;">{{patients.adresse}}</td></tr>
    <tr style="background:#f8fafc;"><td style="padding:10px 14px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;">Groupe sanguin</td><td style="padding:10px 14px;color:#1e293b;border-bottom:1px solid #e2e8f0;">{{patients.groupe_sanguin}}</td></tr>
    <tr><td style="padding:10px 14px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;">Allergies</td><td style="padding:10px 14px;color:#1e293b;border-bottom:1px solid #e2e8f0;">{{patients.allergies}}</td></tr>
    <tr style="background:#f8fafc;"><td style="padding:10px 14px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;">Antécédents</td><td style="padding:10px 14px;color:#1e293b;border-bottom:1px solid #e2e8f0;">{{patients.antecedents}}</td></tr>
  </table>
  <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin-bottom:12px;">
    <p style="margin:0;font-size:12px;color:#92400e;font-weight:600;">Notes du praticien :</p>
    <p style="margin:6px 0 0;font-size:13px;color:#78350f;line-height:1.6;">{{patients.notes}}</p>
  </div>
  <p style="font-size:11px;color:#94a3b8;margin:20px 0 0;text-align:center;">Document confidentiel — Dr. {{user.name}}</p>
</div>`;

    const attestationHtml = `<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:100%;margin:0;padding:0;">
  <h1 style="margin:0 0 6px;font-size:20px;color:#6366f1;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Attestation de présence</h1>
  <div style="width:60px;height:3px;background:#6366f1;margin-bottom:24px;border-radius:2px;"></div>
  <p style="font-size:14px;line-height:1.8;color:#334155;margin:0 0 16px;">Je soussigné(e), <strong>Dr. {{user.name}}</strong>, certifie que :</p>
  <div style="background:#eef2ff;border-left:4px solid #6366f1;padding:16px 20px;border-radius:0 8px 8px 0;margin:0 0 20px;">
    <p style="margin:0;font-size:15px;color:#1e293b;font-weight:600;">{{patients.prenom}} {{patients.nom}}</p>
    <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Né(e) le : {{patients.date_naissance}}</p>
  </div>
  <p style="font-size:14px;line-height:1.8;color:#334155;margin:0 0 8px;">s'est présenté(e) à mon cabinet le <strong>{{today}}</strong> pour une consultation médicale.</p>
  <p style="font-size:14px;line-height:1.8;color:#334155;margin:0 0 8px;">La consultation a eu lieu de ____h____ à ____h____ .</p>
  <p style="font-size:14px;line-height:1.8;color:#334155;margin:0 0 24px;">Cette attestation est délivrée pour servir et valoir ce que de droit.</p>
  <div style="margin-top:40px;">
    <p style="font-size:13px;color:#64748b;margin:0;">Fait à : ________________</p>
    <p style="font-size:13px;color:#64748b;margin:4px 0 0;">Le : {{today}}</p>
    <p style="font-size:13px;color:#64748b;margin:30px 0 0;border-top:1px solid #cbd5e1;padding-top:8px;display:inline-block;">Signature et cachet du praticien</p>
  </div>
</div>`;

    const arretTravailHtml = `<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:100%;margin:0;padding:0;">
  <h1 style="margin:0 0 6px;font-size:20px;color:#ef4444;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Certificat d'arrêt de travail</h1>
  <div style="width:60px;height:3px;background:#ef4444;margin-bottom:24px;border-radius:2px;"></div>
  <div style="display:flex;justify-content:space-between;margin-bottom:20px;">
    <div><p style="margin:0;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;">Praticien</p><p style="margin:4px 0 0;font-size:14px;color:#1e293b;">Dr. {{user.name}}</p></div>
    <div style="text-align:right;"><p style="margin:0;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;">Date</p><p style="margin:4px 0 0;font-size:14px;color:#1e293b;">{{today}}</p></div>
  </div>
  <p style="font-size:14px;line-height:1.8;color:#334155;margin:0 0 8px;">Je soussigné(e), <strong>Dr. {{user.name}}</strong>, certifie avoir examiné ce jour :</p>
  <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:0 0 20px;">
    <p style="margin:0;font-size:15px;color:#1e293b;font-weight:600;">{{patients.prenom}} {{patients.nom}}</p>
    <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Né(e) le : {{patients.date_naissance}}</p>
  </div>
  <p style="font-size:14px;line-height:1.8;color:#334155;margin:0 0 6px;">et certifie que son état de santé nécessite un arrêt de travail :</p>
  <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:16px;margin:0 0 20px;">
    <div style="display:flex;gap:40px;">
      <div><p style="margin:0;font-size:12px;color:#9a3412;font-weight:600;">DU</p><p style="margin:4px 0 0;font-size:16px;color:#1e293b;font-weight:600;">____/____/________</p></div>
      <div><p style="margin:0;font-size:12px;color:#9a3412;font-weight:600;">AU</p><p style="margin:4px 0 0;font-size:16px;color:#1e293b;font-weight:600;">____/____/________</p></div>
      <div><p style="margin:0;font-size:12px;color:#9a3412;font-weight:600;">INCLUS</p><p style="margin:4px 0 0;font-size:14px;color:#1e293b;">Soit _______ jours</p></div>
    </div>
  </div>
  <div style="margin-bottom:16px;"><p style="font-size:13px;color:#334155;margin:0 0 8px;font-weight:600;">Sorties autorisées :</p><label style="font-size:13px;color:#334155;margin-right:16px;">☐ Sans restriction</label><label style="font-size:13px;color:#334155;">☐ De 10h à 12h et de 14h à 18h</label></div>
  <p style="font-size:13px;line-height:1.7;color:#64748b;margin:0 0 30px;font-style:italic;">Cet arrêt est prescrit à titre initial / de prolongation (rayer la mention inutile).</p>
  <div><p style="font-size:13px;color:#64748b;margin:0;">Fait à : ________________ , le {{today}}</p><p style="font-size:13px;color:#64748b;margin:30px 0 0;border-top:1px solid #cbd5e1;padding-top:8px;display:inline-block;">Signature et cachet du praticien</p></div>
</div>`;

    const demandeExamenHtml = `<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:100%;margin:0;padding:0;">
  <h1 style="margin:0 0 6px;font-size:20px;color:#f97316;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Demande d'examen de laboratoire</h1>
  <div style="width:60px;height:3px;background:#f97316;margin-bottom:20px;border-radius:2px;"></div>
  <div style="display:flex;justify-content:space-between;margin-bottom:16px;">
    <div><p style="margin:0;font-size:12px;color:#64748b;font-weight:600;">PRESCRIPTEUR</p><p style="margin:4px 0 0;font-size:14px;color:#1e293b;font-weight:600;">Dr. {{user.name}}</p></div>
    <div style="text-align:right;"><p style="margin:0;font-size:12px;color:#64748b;font-weight:600;">DATE</p><p style="margin:4px 0 0;font-size:14px;color:#1e293b;">{{today}}</p></div>
  </div>
  <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:14px 16px;margin-bottom:18px;">
    <p style="margin:0;font-size:11px;color:#9a3412;font-weight:600;text-transform:uppercase;">Patient</p>
    <p style="margin:4px 0 0;font-size:15px;color:#1e293b;font-weight:600;">{{patients.prenom}} {{patients.nom}}</p>
    <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Né(e) le : {{patients.date_naissance}}</p>
  </div>
  <p style="font-size:13px;color:#334155;font-weight:600;margin:0 0 10px;">Examens demandés :</p>
  <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:18px;">
    <thead><tr style="background:#f97316;color:#fff;"><th style="padding:8px 14px;text-align:left;font-weight:600;">Examen</th><th style="padding:8px 14px;text-align:left;font-weight:600;">Précisions</th></tr></thead>
    <tbody>
      <tr style="background:#fff7ed;"><td style="padding:8px 14px;border-bottom:1px solid #fed7aa;">☐ NFS (Numération Formule Sanguine)</td><td style="padding:8px 14px;border-bottom:1px solid #fed7aa;"></td></tr>
      <tr><td style="padding:8px 14px;border-bottom:1px solid #f1f5f9;">☐ Glycémie à jeun</td><td style="padding:8px 14px;border-bottom:1px solid #f1f5f9;"></td></tr>
      <tr style="background:#fff7ed;"><td style="padding:8px 14px;border-bottom:1px solid #fed7aa;">☐ HbA1c</td><td style="padding:8px 14px;border-bottom:1px solid #fed7aa;"></td></tr>
      <tr><td style="padding:8px 14px;border-bottom:1px solid #f1f5f9;">☐ Bilan lipidique complet</td><td style="padding:8px 14px;border-bottom:1px solid #f1f5f9;"></td></tr>
      <tr style="background:#fff7ed;"><td style="padding:8px 14px;border-bottom:1px solid #fed7aa;">☐ Créatinine / DFG</td><td style="padding:8px 14px;border-bottom:1px solid #fed7aa;"></td></tr>
      <tr><td style="padding:8px 14px;border-bottom:1px solid #f1f5f9;">☐ TSH</td><td style="padding:8px 14px;border-bottom:1px solid #f1f5f9;"></td></tr>
      <tr style="background:#fff7ed;"><td style="padding:8px 14px;border-bottom:1px solid #fed7aa;">☐ Bilan hépatique (ASAT, ALAT, GGT)</td><td style="padding:8px 14px;border-bottom:1px solid #fed7aa;"></td></tr>
      <tr><td style="padding:8px 14px;border-bottom:1px solid #f1f5f9;">☐ Ferritine / Fer sérique</td><td style="padding:8px 14px;border-bottom:1px solid #f1f5f9;"></td></tr>
      <tr style="background:#fff7ed;"><td style="padding:8px 14px;border-bottom:1px solid #fed7aa;">☐ CRP</td><td style="padding:8px 14px;border-bottom:1px solid #fed7aa;"></td></tr>
      <tr><td style="padding:8px 14px;border-bottom:1px solid #f1f5f9;">☐ Autre : ________________________</td><td style="padding:8px 14px;border-bottom:1px solid #f1f5f9;"></td></tr>
    </tbody>
  </table>
  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;margin-bottom:16px;">
    <p style="margin:0;font-size:12px;color:#64748b;font-weight:600;">Renseignements cliniques :</p>
    <p style="margin:6px 0 0;font-size:13px;color:#334155;line-height:1.6;">________________________________________</p>
  </div>
  <div style="margin-top:24px;"><p style="font-size:13px;color:#64748b;margin:0;">☐ Urgent &nbsp;&nbsp; ☐ À jeun obligatoire</p><p style="font-size:13px;color:#64748b;margin:20px 0 0;border-top:1px solid #cbd5e1;padding-top:8px;display:inline-block;">Signature et cachet du prescripteur</p></div>
</div>`;

    const lettreOrientationHtml = `<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:100%;margin:0;padding:0;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
    <div><p style="margin:0;font-size:14px;color:#1e293b;font-weight:600;">Dr. {{user.name}}</p><p style="margin:2px 0 0;font-size:12px;color:#64748b;">Médecine générale</p></div>
    <div style="text-align:right;"><p style="margin:0;font-size:13px;color:#64748b;">Le {{today}}</p></div>
  </div>
  <h1 style="margin:0 0 6px;font-size:20px;color:#8b5cf6;font-weight:700;">Lettre d'orientation</h1>
  <div style="width:50px;height:3px;background:#8b5cf6;margin-bottom:20px;border-radius:2px;"></div>
  <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:14px 16px;margin-bottom:18px;">
    <p style="margin:0;font-size:11px;color:#7c3aed;font-weight:600;text-transform:uppercase;">Adressé à</p>
    <p style="margin:6px 0 0;font-size:14px;color:#1e293b;">Dr. / Pr. ____________________________________</p>
    <p style="margin:2px 0 0;font-size:13px;color:#64748b;">Spécialité : ____________________________________</p>
  </div>
  <p style="font-size:14px;line-height:1.6;color:#334155;margin:0 0 6px;">Cher(e) confrère,</p>
  <p style="font-size:14px;line-height:1.7;color:#334155;margin:0 0 12px;">Je vous adresse <strong>{{consultations.consultations.patients.prenom}} {{consultations.consultations.patients.nom}}</strong>, né(e) le {{consultations.consultations.patients.date_naissance}}, pour prise en charge spécialisée.</p>
  <div style="margin-bottom:16px;"><p style="font-size:13px;color:#1e293b;font-weight:600;margin:0 0 6px;">Motif de la consultation :</p><p style="font-size:13px;line-height:1.7;color:#334155;margin:0;">{{consultations.consultations.motif}}</p></div>
  <div style="margin-bottom:16px;"><p style="font-size:13px;color:#1e293b;font-weight:600;margin:0 0 6px;">Antécédents notables :</p><p style="font-size:13px;line-height:1.7;color:#334155;margin:0;">{{consultations.consultations.patients.antecedents}}</p></div>
  <p style="font-size:14px;line-height:1.7;color:#334155;margin:0 0 6px;">Je vous remercie pour votre avis et reste à votre disposition pour tout renseignement complémentaire.</p>
  <p style="font-size:14px;line-height:1.7;color:#334155;margin:0 0 24px;">Confraternellement,</p>
  <div><p style="font-size:13px;color:#1e293b;font-weight:600;margin:0;">Dr. {{user.name}}</p><p style="font-size:12px;color:#64748b;margin:2px 0 0;">Signature et cachet</p></div>
</div>`;

    const templateDefs = [
        { name: 'Ordonnance', icon: 'solar:document-medicine-bold-duotone', color: '#e2a03f', entitySlug: 'consultations', customHtml: ordonnanceHtml },
        { name: 'Certificat médical', icon: 'solar:diploma-verified-bold-duotone', color: '#3b82f6', entitySlug: 'consultations', customHtml: certificatHtml },
        { name: 'Compte rendu consultation', icon: 'solar:clipboard-text-bold-duotone', color: '#00ab55', entitySlug: 'consultations', customHtml: compteRenduHtml },
        { name: 'Lettre orientation spécialiste', icon: 'solar:letter-bold-duotone', color: '#8b5cf6', entitySlug: 'consultations', customHtml: lettreOrientationHtml },
        { name: "Demande d'examen labo", icon: 'solar:test-tube-bold-duotone', color: '#f97316', entitySlug: 'patients', customHtml: demandeExamenHtml },
        { name: 'Arrêt de travail', icon: 'solar:calendar-bold-duotone', color: '#ef4444', entitySlug: 'patients', customHtml: arretTravailHtml },
        { name: 'Attestation de présence', icon: 'solar:document-text-bold-duotone', color: '#6366f1', entitySlug: 'patients', customHtml: attestationHtml },
        { name: 'Fiche patient résumé', icon: 'solar:user-bold-duotone', color: '#3b82f6', entitySlug: 'patients', customHtml: fichePatientHtml },
        { name: 'Facture PDF', icon: 'solar:bill-list-bold-duotone', color: '#e2a03f', entitySlug: 'factures', customHtml: factureHtml },
        { name: 'Consentement éclairé', icon: 'solar:shield-check-bold-duotone', color: '#22c55e', entitySlug: 'patients', customHtml: consentementHtml },
    ];

    for (let i = 0; i < templateDefs.length; i++) {
        const t = templateDefs[i];
        const entityId = E[t.entitySlug];
        // Use custom HTML if provided, otherwise use generic placeholder
        const htmlContent = t.customHtml || `<div style="font-family:Arial,sans-serif;padding:40px;"><h1 style="color:${t.color};border-bottom:2px solid ${t.color};padding-bottom:8px;">${t.name}</h1><p style="color:#666;margin-top:24px;">Ce document est un modèle. Personnalisez-le avec les variables disponibles.</p><p><strong>Date:</strong> {{today}}</p><p><strong>Patient:</strong> {{${t.entitySlug}.patients.prenom}} {{${t.entitySlug}.patients.nom}}</p></div>`;

        const doc = await upsertDoc(db.Document, { name: t.name, 'meta.createdByPreset': PRESET }, {
            name: t.name, format: 'A4', orientation: 'portrait', isTemplate: true,
            entityId, entityIds: [entityId], createdBy: uid, status: 'published', tags: ['médical', 'template'],
            pages: [{ content: htmlContent, mode: 'edition', order: 0, elements: [], background: { color: '#ffffff' } }]
        });

        // SmartDocTemplate link
        await upsertDoc(db.SmartDocTemplate, { name: t.name, entityId, 'meta.createdByPreset': PRESET }, {
            name: t.name, description: `Modèle ${t.name}`, icon: t.icon, color: t.color,
            documentId: doc._id, entityId, outputFormat: 'pdf', order: i, active: true, createdBy: uid,
            inputFields: []
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
