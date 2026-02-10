/**
 * Seed Script v2 - Cabinet Médical Complet (Idempotent)
 * 
 * Plan A+ : Doctor Dashboard dynamique
 * 
 * Crée :
 * - 5 Classifications (consultation_status, patient_type, urgency_level, task_priority, task_status)
 * - 39 FieldTemplates (Patient 10, Consultation 13, Dossier 5, Tâche 5, Équipe 6)
 * - 1 Space + 5 Folders
 * - 5 Entities (Patient, Consultation, Dossier Médical, Tâche, MembreEquipe)
 * - 3 MembreEquipe records
 * - 30 Patient records
 * - 9 Consultations TODAY (recréées à chaque run)
 * - 15 Consultations passées
 * - 5 Tâches avec relations
 * - 1 PageConfig cockpit (upsert)
 * 
 * Usage: node scripts/cabinet-docteur/seed-cabinet-v2.js <account_number>
 * Example: node scripts/cabinet-docteur/seed-cabinet-v2.js 5001
 */

const mongoose = require('mongoose');
const config = require('../../config/db');

// ============================================================================
// DONNÉES DE DÉMONSTRATION
// ============================================================================

const prenoms = ['Mohamed', 'Fatima', 'Ahmed', 'Aicha', 'Youssef', 'Khadija', 'Omar', 'Samira', 'Hassan', 'Nadia',
    'Rachid', 'Leila', 'Karim', 'Zineb', 'Mustapha', 'Hanan', 'Khalid', 'Souad', 'Jamal', 'Latifa'];
const noms = ['El Amrani', 'Benkirane', 'Saidi', 'Tazi', 'Alaoui', 'Berrada', 'Fassi', 'Kadiri', 'Chaoui', 'Benjelloun',
    'El Mansouri', 'Bouchta', 'Zerouali', 'Lahlou', 'Bennani', 'Chraibi', 'Sekkat', 'Zniber', 'Tahiri', 'Rhazi'];

const motifs = ['Consultation de routine', 'Douleurs thoraciques', 'Suivi diabète', 'Contrôle tension',
    'Vaccination', 'Renouvellement ordonnance', 'Maux de tête', 'Fatigue chronique', 'Bilan sanguin',
    'Problèmes digestifs', 'Douleurs articulaires', 'Allergie saisonnière', 'Suivi grossesse', 'Check-up annuel'];

const allergies = ['Pénicilline', 'Aspirine', 'Iode', 'Latex', 'Fruits de mer'];
const antecedents = ['Diabète type 2', 'Hypertension', 'Asthme', 'Cholestérol'];
const groupesSanguins = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const medicamentsPool = [
    { nom: 'Amoxicilline 500mg', posologie: '3x/jour', duree: '7 jours', quantite: 1 },
    { nom: 'Doliprane 1000mg', posologie: 'si douleur, max 4x/jour', duree: '5 jours', quantite: 2 },
    { nom: 'Augmentin 1g', posologie: '2x/jour', duree: '10 jours', quantite: 1 },
    { nom: 'Oméprazole 20mg', posologie: '1x/jour à jeun', duree: '14 jours', quantite: 1 },
    { nom: 'Metformine 850mg', posologie: '2x/jour', duree: '30 jours', quantite: 1 },
    { nom: 'Amlodipine 5mg', posologie: '1x/jour', duree: '30 jours', quantite: 1 },
    { nom: 'Ventoline spray', posologie: 'si besoin', duree: '—', quantite: 1 },
    { nom: 'Ibuprofène 400mg', posologie: '3x/jour après repas', duree: '5 jours', quantite: 1 }
];

// ============================================================================
// UTILITAIRES
// ============================================================================

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function generatePhone() {
    const prefixes = ['06', '07', '05'];
    let num = randomItem(prefixes);
    for (let i = 0; i < 4; i++) num += ' ' + String(randomInt(10, 99));
    return num;
}

function generateBirthDate() {
    const year = randomInt(1950, 2005);
    const month = String(randomInt(1, 12)).padStart(2, '0');
    const day = String(randomInt(1, 28)).padStart(2, '0');
    return new Date(`${year}-${month}-${day}`);
}

function generateVitals() {
    return {
        tension: `${randomInt(10, 14)}/${randomInt(6, 9)}`,
        temperature: (36 + Math.random() * 2).toFixed(1) + '°C',
        poids: randomInt(50, 100) + ' kg',
    };
}

function todayAt(hours, minutes = 0) {
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    return d;
}

function daysAgo(days, hours = 10) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(hours, randomInt(0, 59), 0, 0);
    return d;
}

function randomMedications() {
    const count = randomInt(1, 3);
    const shuffled = [...medicamentsPool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

async function findOrCreate(Model, query, data) {
    let doc = await Model.findOne(query);
    if (!doc) {
        doc = await Model.create({ ...data, ...query });
        console.log(`   ✅ Created: ${query.name || query.key || query.title || query.slug || JSON.stringify(query)}`);
    } else {
        console.log(`   ⏭️  Exists: ${query.name || query.key || query.title || query.slug || JSON.stringify(query)}`);
    }
    return doc;
}

// ============================================================================
// MAIN SCRIPT
// ============================================================================

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.log('Usage: node scripts/cabinet-docteur/seed-cabinet-v2.js <account_number>');
        process.exit(1);
    }

    const accountNumber = args[0];
    console.log('\n🏥 SEED CABINET MÉDICAL v2 (Idempotent)');
    console.log('='.repeat(60));
    console.log(`   Account: ${accountNumber}`);

    try {
        // ================================================================
        // CONNECT
        // ================================================================
        await mongoose.connect(config.globalDbUri);
        console.log('✅ Connected to global database');

        const tenantDbUri = `${config.uri}saas_app_rb_${accountNumber}`;
        const tenantDb = mongoose.createConnection(tenantDbUri);
        await new Promise(resolve => tenantDb.once('open', resolve));
        console.log(`✅ Connected to tenant: saas_app_rb_${accountNumber}`);

        // Load models on tenant connection
        const Entity = require('../../models/entity.model');
        const FieldTemplate = require('../../models/field-template.model');
        const Classification = require('../../models/classification.model');
        const Record = require('../../models/record.model');
        const Space = require('../../models/space.model');
        const Folder = require('../../models/folder.model');

        const EntityModel = tenantDb.model('Entity', Entity.schema);
        const FieldModel = tenantDb.model('FieldTemplate', FieldTemplate.schema);
        const ClassificationModel = tenantDb.model('Classification', Classification.schema);
        const RecordModel = tenantDb.model('Record', Record.schema);
        const SpaceModel = tenantDb.model('Space', Space.schema);
        const FolderModel = tenantDb.model('Folder', Folder.schema);

        // View model
        const View = require('../../models/view.model');
        const ViewModel = tenantDb.model('View', View.schema);

        // PageConfig model
        let PageConfigModel;
        try {
            const PageConfig = require('../../models/page-config.model');
            PageConfigModel = tenantDb.model('PageConfig', PageConfig.schema);
        } catch (e) {
            // If model doesn't exist, create a simple one
            const PageConfigSchema = new mongoose.Schema({
                name: String,
                slug: { type: String, unique: true },
                status: String,
                type: String,
                tabs: Array,
                layout: Object,
                blocks: Object
            }, { timestamps: true, strict: false });
            PageConfigModel = tenantDb.model('PageConfig', PageConfigSchema);
        }

        // Get account owner
        const Account = require('../../models/account.model');
        const account = await Account.findOne({ account_number: accountNumber });
        if (!account) {
            console.log('❌ Account not found');
            process.exit(1);
        }
        // account.users stores emails, not ObjectIds
        const User = require('../../models/user.model');
        let ownerId;
        if (account.users && account.users.length > 0) {
            const email = account.users[0];
            const user = await User.findOne({ email });
            ownerId = user ? user._id : new mongoose.Types.ObjectId();
        } else {
            const firstUser = await User.findOne();
            ownerId = firstUser ? firstUser._id : new mongoose.Types.ObjectId();
        }
        console.log(`   Owner: ${ownerId}`);

        // ================================================================
        // 1. CLASSIFICATIONS
        // ================================================================
        console.log('\n📊 Classifications...');

        const statusConsultation = await findOrCreate(ClassificationModel, { key: 'consultation_status' }, {
            name: 'Statut Consultation',
            description: 'Statut des consultations médicales',
            isShared: true,
            type: 'simple',
            options: [
                { label: 'Programmée', color: '#3b82f6', icon: 'solar:calendar-bold', type: 'start', order: 0 },
                { label: 'En salle d\'attente', color: '#f59e0b', icon: 'solar:clock-circle-bold', type: 'active', order: 1 },
                { label: 'En cours', color: '#8b5cf6', icon: 'solar:stethoscope-bold', type: 'active', order: 2 },
                { label: 'Terminée', color: '#10b981', icon: 'solar:check-circle-bold', type: 'completed', order: 3 },
                { label: 'Annulée', color: '#ef4444', icon: 'solar:close-circle-bold', type: 'completed', order: 4 }
            ]
        });

        const typePatient = await findOrCreate(ClassificationModel, { key: 'patient_type' }, {
            name: 'Type Patient',
            description: 'Type de patient',
            isShared: true,
            type: 'simple',
            options: [
                { label: 'Nouveau', color: '#3b82f6', icon: 'solar:user-plus-bold', order: 0 },
                { label: 'Régulier', color: '#10b981', icon: 'solar:user-check-bold', order: 1 },
                { label: 'VIP', color: '#f59e0b', icon: 'solar:star-bold', order: 2 }
            ]
        });

        const urgence = await findOrCreate(ClassificationModel, { key: 'urgency_level' }, {
            name: 'Niveau Urgence',
            description: 'Niveau d\'urgence',
            isShared: true,
            type: 'simple',
            options: [
                { label: 'Normal', color: '#10b981', icon: 'solar:check-circle-bold', order: 0 },
                { label: 'Prioritaire', color: '#f59e0b', icon: 'solar:alarm-bold', order: 1 },
                { label: 'Urgent', color: '#ef4444', icon: 'solar:danger-bold', order: 2 }
            ]
        });

        const taskPriority = await findOrCreate(ClassificationModel, { key: 'task_priority' }, {
            name: 'Priorité Tâche',
            description: 'Niveau de priorité des tâches',
            isShared: true,
            type: 'simple',
            options: [
                { label: 'Normal', color: '#10b981', icon: 'solar:check-circle-bold', order: 0 },
                { label: 'Important', color: '#f59e0b', icon: 'solar:alarm-bold', order: 1 },
                { label: 'Urgent', color: '#ef4444', icon: 'solar:danger-bold', order: 2 }
            ]
        });

        const taskStatus = await findOrCreate(ClassificationModel, { key: 'task_status' }, {
            name: 'Statut Tâche',
            description: 'Statut des tâches',
            isShared: true,
            type: 'simple',
            options: [
                { label: 'À faire', color: '#3b82f6', icon: 'solar:clipboard-bold', order: 0 },
                { label: 'En cours', color: '#f59e0b', icon: 'solar:play-bold', order: 1 },
                { label: 'Terminé', color: '#10b981', icon: 'solar:check-circle-bold', order: 2 }
            ]
        });

        // Helper to get option by label  
        const getOption = (classif, label) => classif.options.find(o => o.label === label);

        // ================================================================
        // 2. FIELD TEMPLATES
        // ================================================================
        console.log('\n📝 FieldTemplates...');

        // --- Patient fields ---
        const pf = {};
        const patientFieldDefs = [
            { name: 'nom', label: 'Nom', type: 'string', required: true, category: 'text' },
            { name: 'prenom', label: 'Prénom', type: 'string', required: true, category: 'text' },
            { name: 'date_naissance', label: 'Date de naissance', type: 'date', category: 'date' },
            { name: 'telephone', label: 'Téléphone', type: 'string', subtype: 'tel', category: 'text' },
            { name: 'email', label: 'Email', type: 'string', subtype: 'email', category: 'text' },
            { name: 'adresse', label: 'Adresse', type: 'longtext', category: 'text' },
            { name: 'groupe_sanguin', label: 'Groupe Sanguin', type: 'select', type_config: { options: groupesSanguins }, category: 'choice' },
            { name: 'allergies_patient', label: 'Allergies', type: 'multiselect', type_config: { options: allergies }, category: 'choice' },
            { name: 'antecedents', label: 'Antécédents', type: 'longtext', category: 'text' },
            { name: 'notes_medicales', label: 'Notes Médicales', type: 'longtext', category: 'text' }
        ];
        for (const def of patientFieldDefs) {
            pf[def.name] = await findOrCreate(FieldModel, { name: def.name }, def);
        }
        console.log(`   📋 ${Object.keys(pf).length} Patient fields`);

        // --- Consultation fields ---
        const cf = {};
        const consultFieldDefs = [
            { name: 'motif', label: 'Motif', type: 'string', required: true, category: 'text' },
            { name: 'rdv_at', label: 'Date & Heure RDV', type: 'datetime', required: true, category: 'date' },
            { name: 'type_visite', label: 'Type de visite', type: 'select', type_config: { options: ['Consultation', 'Contrôle', 'Téléconsult.', '1ère visite', 'Externe'] }, category: 'choice' },
            { name: 'salle', label: 'Salle', type: 'select', type_config: { options: ['Salle 1', 'Salle 2', 'Salle 3', 'Salle 4', 'Salle 5'] }, category: 'choice' },
            { name: 'duree_minutes', label: 'Durée (min)', type: 'number', type_config: { min: 5, max: 120 }, category: 'numeric' },
            { name: 'clinique', label: 'Clinique', type: 'string', category: 'text' },
            { name: 'tension', label: 'Tension', type: 'string', category: 'text', ui: { placeholder: '12/8' } },
            { name: 'temperature', label: 'Température', type: 'string', category: 'text', ui: { placeholder: '37.2°C' } },
            { name: 'poids', label: 'Poids', type: 'string', category: 'text', ui: { placeholder: '70 kg' } },
            { name: 'diagnostic', label: 'Diagnostic', type: 'longtext', category: 'text' },
            { name: 'prescription', label: 'Prescription', type: 'longtext', category: 'text' },
            { name: 'medications', label: 'Médicaments', type: 'json', category: 'advanced' },
            { name: 'suivi', label: 'Suivi recommandé', type: 'longtext', category: 'text' },
            // patient relation — will set type_config.refEntity after entity creation
            { name: 'consultation_patient', label: 'Patient', type: 'relation', category: 'relation' }
        ];
        for (const def of consultFieldDefs) {
            cf[def.name] = await findOrCreate(FieldModel, { name: def.name }, def);
        }
        console.log(`   📋 ${Object.keys(cf).length} Consultation fields`);

        // --- Dossier fields ---
        const df = {};
        const dossierFieldDefs = [
            { name: 'numero_dossier', label: 'N° Dossier', type: 'string', required: true, unique: true, category: 'text' },
            { name: 'date_creation_dossier', label: 'Date Création', type: 'date', category: 'date' },
            { name: 'medecin_traitant', label: 'Médecin Traitant', type: 'string', category: 'text' },
            { name: 'assurance', label: 'Assurance', type: 'string', category: 'text' },
            { name: 'numero_assure', label: 'N° Assuré', type: 'string', category: 'text' }
        ];
        for (const def of dossierFieldDefs) {
            df[def.name] = await findOrCreate(FieldModel, { name: def.name }, def);
        }
        console.log(`   📋 ${Object.keys(df).length} Dossier fields`);

        // --- Tâche fields ---
        const tf = {};
        const tacheFieldDefs = [
            { name: 'titre_tache', label: 'Titre', type: 'string', required: true, category: 'text' },
            { name: 'description_tache', label: 'Description', type: 'longtext', category: 'text' },
            { name: 'tache_assignee', label: 'Assigné à', type: 'relation', category: 'relation' },
            { name: 'tache_patient', label: 'Patient', type: 'relation', category: 'relation' },
            { name: 'due_at', label: 'Échéance', type: 'datetime', category: 'date' }
        ];
        for (const def of tacheFieldDefs) {
            tf[def.name] = await findOrCreate(FieldModel, { name: def.name }, def);
        }
        console.log(`   📋 ${Object.keys(tf).length} Tâche fields`);

        // --- Équipe fields ---
        const ef = {};
        const equipeFieldDefs = [
            { name: 'nom_complet', label: 'Nom complet', type: 'string', required: true, category: 'text' },
            { name: 'role_equipe', label: 'Rôle', type: 'select', type_config: { options: ['Docteur', 'Secrétaire', 'Infirmier'] }, category: 'choice' },
            { name: 'specialite', label: 'Spécialité', type: 'string', category: 'text' },
            { name: 'couleur_avatar', label: 'Couleur avatar', type: 'string', category: 'text' },
            { name: 'telephone_equipe', label: 'Téléphone', type: 'string', subtype: 'tel', category: 'text' },
            { name: 'en_ligne', label: 'En ligne', type: 'boolean', category: 'choice' }
        ];
        for (const def of equipeFieldDefs) {
            ef[def.name] = await findOrCreate(FieldModel, { name: def.name }, def);
        }
        console.log(`   📋 ${Object.keys(ef).length} Équipe fields`);

        // ================================================================
        // 3. SPACE + FOLDERS
        // ================================================================
        console.log('\n📁 Space & Folders...');

        const space = await findOrCreate(SpaceModel, { slug: 'cabinet-docteur' }, {
            name: 'Cabinet Docteur',
            description: 'Espace de travail du cabinet médical',
            icon: 'solar:stethoscope-bold',
            color: '#4361ee',
            owner: ownerId
        });

        const folderDefs = [
            { slug: 'patients-actifs', name: 'Patients Actifs', icon: 'solar:users-group-rounded-bold', color: '#10b981', order: 0 },
            { slug: 'consultations-jour', name: 'Consultations du Jour', icon: 'solar:calendar-bold', color: '#f59e0b', order: 1 },
            { slug: 'archives', name: 'Archives', icon: 'solar:archive-bold', color: '#6b7280', order: 2 },
            { slug: 'equipe', name: 'Équipe', icon: 'solar:users-group-two-rounded-bold', color: '#4361ee', order: 3 },
            { slug: 'taches', name: 'Tâches', icon: 'solar:checklist-bold', color: '#ef4444', order: 4 }
        ];
        const folders = {};
        for (const fDef of folderDefs) {
            folders[fDef.slug] = await findOrCreate(FolderModel, { slug: fDef.slug }, {
                ...fDef,
                spaces: [space._id]
            });
        }

        // ================================================================
        // 4. ENTITIES
        // ================================================================
        console.log('\n🗂️ Entities...');

        const patientEntity = await findOrCreate(EntityModel, { slug: 'patient' }, {
            name: 'Patient',
            description: 'Patients du cabinet médical',
            icon: 'solar:user-bold',
            color: '#4361ee',
            customFields: Object.values(pf).map(f => f._id),
            statusClassification: typePatient._id,
            classifications: [urgence._id],
            spaces: [space._id],
            folders: [folders['patients-actifs']._id]
        });

        const consultationEntity = await findOrCreate(EntityModel, { slug: 'consultation' }, {
            name: 'Consultation',
            description: 'Consultations médicales',
            icon: 'solar:stethoscope-bold',
            color: '#f59e0b',
            customFields: Object.values(cf).map(f => f._id),
            statusClassification: statusConsultation._id,
            classifications: [urgence._id],
            spaces: [space._id],
            folders: [folders['consultations-jour']._id]
        });

        const dossierEntity = await findOrCreate(EntityModel, { slug: 'dossier-medical' }, {
            name: 'Dossier Médical',
            description: 'Dossiers médicaux des patients',
            icon: 'solar:folder-with-files-bold',
            color: '#10b981',
            customFields: Object.values(df).map(f => f._id),
            spaces: [space._id],
            folders: [folders['archives']._id]
        });

        const membreEquipeEntity = await findOrCreate(EntityModel, { slug: 'membre-equipe' }, {
            name: 'Membre Équipe',
            description: 'Membres de l\'équipe médicale',
            icon: 'solar:users-group-two-rounded-bold',
            color: '#4361ee',
            customFields: Object.values(ef).map(f => f._id),
            spaces: [space._id],
            folders: [folders['equipe']._id]
        });

        const tacheEntity = await findOrCreate(EntityModel, { slug: 'tache' }, {
            name: 'Tâche',
            description: 'Tâches et alertes du cabinet',
            icon: 'solar:checklist-bold',
            color: '#ef4444',
            customFields: Object.values(tf).map(f => f._id),
            statusClassification: taskStatus._id,
            classifications: [taskPriority._id],
            spaces: [space._id],
            folders: [folders['taches']._id]
        });

        // --- Set refEntity on relation fields ---
        console.log('\n🔗 Setting relation refEntity...');
        await FieldModel.updateOne({ _id: cf.consultation_patient._id }, { $set: { 'type_config.refEntity': patientEntity._id } });
        await FieldModel.updateOne({ _id: tf.tache_assignee._id }, { $set: { 'type_config.refEntity': membreEquipeEntity._id } });
        await FieldModel.updateOne({ _id: tf.tache_patient._id }, { $set: { 'type_config.refEntity': patientEntity._id } });
        console.log('   ✅ Relations configured');

        // ================================================================
        // 5. RECORDS — MembreEquipe (3)
        // ================================================================
        console.log('\n👥 MembreEquipe records...');

        const equipeDefs = [
            { title: 'Dr. Boukirou', role: 'Docteur', specialite: 'Médecine Générale', couleur: '#4361ee', tel: '06 12 34 56 78', enLigne: true },
            { title: 'Fatima Bennani', role: 'Secrétaire', specialite: '', couleur: '#00ab55', tel: '06 23 45 67 89', enLigne: true },
            { title: 'Sarah El Fassi', role: 'Secrétaire', specialite: '', couleur: '#2196f3', tel: '06 34 56 78 90', enLigne: true }
        ];
        const equipeRecords = {};
        for (const eDef of equipeDefs) {
            const rec = await findOrCreate(RecordModel, { entityId: membreEquipeEntity._id, title: eDef.title }, {
                status: 'active',
                order: 0,
                customFields: [
                    { field_id: ef.nom_complet._id, value: eDef.title },
                    { field_id: ef.role_equipe._id, value: eDef.role },
                    { field_id: ef.specialite._id, value: eDef.specialite },
                    { field_id: ef.couleur_avatar._id, value: eDef.couleur },
                    { field_id: ef.telephone_equipe._id, value: eDef.tel },
                    { field_id: ef.en_ligne._id, value: eDef.enLigne }
                ]
            });
            equipeRecords[eDef.title] = rec;
        }

        // ================================================================
        // 6. RECORDS — Patients (30)
        // ================================================================
        console.log('\n👥 Patient records...');

        const patientRecords = [];
        const usedNames = new Set();

        for (let i = 0; i < 30; i++) {
            let prenom, nom, fullName;
            do {
                prenom = randomItem(prenoms);
                nom = randomItem(noms);
                fullName = `${prenom} ${nom}`;
            } while (usedNames.has(fullName));
            usedNames.add(fullName);

            const patientType = randomItem(typePatient.options);
            const urgenceLevel = getOption(urgence, 'Normal');

            const rec = await findOrCreate(RecordModel, { entityId: patientEntity._id, title: fullName }, {
                image: `/assets/images/profile-${randomInt(1, 34)}.jpeg`,
                status: 'active',
                order: i,
                classificationValues: [
                    { classificationId: typePatient._id, optionId: patientType._id },
                    { classificationId: urgence._id, optionId: urgenceLevel._id }
                ],
                customFields: [
                    { field_id: pf.nom._id, value: nom },
                    { field_id: pf.prenom._id, value: prenom },
                    { field_id: pf.date_naissance._id, value: generateBirthDate() },
                    { field_id: pf.telephone._id, value: generatePhone() },
                    { field_id: pf.email._id, value: `${prenom.toLowerCase()}.${nom.toLowerCase().replace(/ /g, '')}@email.com` },
                    { field_id: pf.adresse._id, value: `${randomInt(1, 150)} Rue ${randomItem(['Hassan II', 'Mohammed V', 'de la Paix', 'des Fleurs'])}` },
                    { field_id: pf.groupe_sanguin._id, value: randomItem(groupesSanguins) },
                    { field_id: pf.allergies_patient._id, value: Math.random() > 0.5 ? [randomItem(allergies)] : [] },
                    { field_id: pf.antecedents._id, value: Math.random() > 0.4 ? randomItem(antecedents) : '' },
                    { field_id: pf.notes_medicales._id, value: '' }
                ]
            });
            patientRecords.push(rec);
            if (i < 5 || i === 29) console.log(`   ${i + 1}. ${fullName}`);
            else if (i === 5) console.log(`   ... (${30 - 6} more)`);
        }
        console.log(`   ✅ ${patientRecords.length} patients`);

        // ================================================================
        // 7. RECORDS — Consultations AUJOURD'HUI (9)
        //    ⚠️ Recréées à chaque run (delete today's + insert)
        // ================================================================
        console.log('\n📋 Consultations aujourd\'hui...');

        // Delete today's consultations
        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
        const deleted = await RecordModel.deleteMany({
            entityId: consultationEntity._id,
            'customFields': {
                $elemMatch: {
                    field_id: cf.rdv_at._id,
                    value: { $gte: todayStart, $lte: todayEnd }
                }
            }
        });
        console.log(`   🗑️ Deleted ${deleted.deletedCount} old today consultations`);

        // Today's schedule
        const todaySchedule = [
            { h: 8, m: 0, status: 'Terminée', urgency: 'Normal', type: 'Consultation', salle: 'Salle 1', duree: 25, withMeds: true },
            { h: 8, m: 30, status: 'Terminée', urgency: 'Normal', type: 'Contrôle', salle: 'Salle 1', duree: 15, withMeds: true },
            { h: 9, m: 0, status: 'Terminée', urgency: 'Normal', type: 'Consultation', salle: 'Salle 2', duree: 30, withMeds: true },
            { h: 9, m: 40, status: 'En cours', urgency: 'Normal', type: 'Consultation', salle: 'Salle 1', duree: null, withMeds: false },
            { h: 10, m: 30, status: 'En salle d\'attente', urgency: 'Urgent', type: '1ère visite', salle: 'Salle 3', duree: null, withMeds: false },
            { h: 11, m: 0, status: 'En salle d\'attente', urgency: 'Normal', type: 'Consultation', salle: 'Salle 2', duree: null, withMeds: false },
            { h: 14, m: 0, status: 'Programmée', urgency: 'Normal', type: 'Téléconsult.', salle: null, duree: null, withMeds: false },
            { h: 16, m: 0, status: 'Programmée', urgency: 'Prioritaire', type: 'Contrôle', salle: 'Salle 1', duree: null, withMeds: false },
            { h: 17, m: 0, status: 'Programmée', urgency: 'Normal', type: 'Consultation', salle: 'Salle 2', duree: null, withMeds: false }
        ];

        const todayConsultations = [];
        for (let i = 0; i < todaySchedule.length; i++) {
            const s = todaySchedule[i];
            const patient = patientRecords[i % patientRecords.length];
            const motif = randomItem(motifs);
            const vitals = generateVitals();
            const meds = s.withMeds ? randomMedications() : [];

            const statusOpt = getOption(statusConsultation, s.status);
            const urgencyOpt = getOption(urgence, s.urgency);

            const rec = await RecordModel.create({
                entityId: consultationEntity._id,
                title: `${patient.title} - ${motif}`,
                status: 'active',
                order: i,
                classificationValues: [
                    { classificationId: statusConsultation._id, optionId: statusOpt._id },
                    { classificationId: urgence._id, optionId: urgencyOpt._id }
                ],
                customFields: [
                    { field_id: cf.motif._id, value: motif },
                    { field_id: cf.rdv_at._id, value: todayAt(s.h, s.m) },
                    { field_id: cf.type_visite._id, value: s.type },
                    { field_id: cf.salle._id, value: s.salle || '' },
                    { field_id: cf.duree_minutes._id, value: s.duree || 0 },
                    { field_id: cf.clinique._id, value: '' },
                    { field_id: cf.tension._id, value: s.withMeds ? vitals.tension : '' },
                    { field_id: cf.temperature._id, value: s.withMeds ? vitals.temperature : '' },
                    { field_id: cf.poids._id, value: s.withMeds ? vitals.poids : '' },
                    { field_id: cf.diagnostic._id, value: s.withMeds ? 'Examen normal' : '' },
                    { field_id: cf.prescription._id, value: s.withMeds ? meds.map(m => `${m.nom} ${m.posologie}`).join(', ') : '' },
                    { field_id: cf.medications._id, value: meds },
                    { field_id: cf.suivi._id, value: s.withMeds ? 'Contrôle dans 15 jours' : '' },
                    { field_id: cf.consultation_patient._id, value: patient._id }
                ]
            });
            todayConsultations.push(rec);
            console.log(`   ${s.h}:${String(s.m).padStart(2, '0')} → ${patient.title} [${s.status}] ${s.urgency !== 'Normal' ? '⚡' + s.urgency : ''}`);
        }
        console.log(`   ✅ ${todayConsultations.length} consultations today`);

        // ================================================================
        // 8. RECORDS — Consultations PASSÉES (15)
        // ================================================================
        console.log('\n📋 Consultations passées...');

        let pastCount = 0;
        for (let i = 0; i < 15; i++) {
            const patient = patientRecords[(i + 9) % patientRecords.length]; // offset to avoid overlap
            const motif = randomItem(motifs);
            const dayOffset = randomInt(1, 30);
            const vitals = generateVitals();
            const meds = randomMedications();
            const pastTitle = `${patient.title} - ${motif} (J-${dayOffset})`;

            const existing = await RecordModel.findOne({ entityId: consultationEntity._id, title: pastTitle });
            if (existing) {
                console.log(`   ⏭️  ${pastTitle}`);
                continue;
            }

            await RecordModel.create({
                entityId: consultationEntity._id,
                title: pastTitle,
                status: 'active',
                order: 100 + i,
                classificationValues: [
                    { classificationId: statusConsultation._id, optionId: getOption(statusConsultation, 'Terminée')._id },
                    { classificationId: urgence._id, optionId: getOption(urgence, 'Normal')._id }
                ],
                customFields: [
                    { field_id: cf.motif._id, value: motif },
                    { field_id: cf.rdv_at._id, value: daysAgo(dayOffset, randomInt(8, 17)) },
                    { field_id: cf.type_visite._id, value: randomItem(['Consultation', 'Contrôle']) },
                    { field_id: cf.salle._id, value: `Salle ${randomInt(1, 3)}` },
                    { field_id: cf.duree_minutes._id, value: randomInt(15, 45) },
                    { field_id: cf.clinique._id, value: '' },
                    { field_id: cf.tension._id, value: vitals.tension },
                    { field_id: cf.temperature._id, value: vitals.temperature },
                    { field_id: cf.poids._id, value: vitals.poids },
                    { field_id: cf.diagnostic._id, value: 'Examen normal' },
                    { field_id: cf.prescription._id, value: meds.map(m => `${m.nom} ${m.posologie}`).join(', ') },
                    { field_id: cf.medications._id, value: meds },
                    { field_id: cf.suivi._id, value: 'Contrôle dans 15 jours' },
                    { field_id: cf.consultation_patient._id, value: patient._id }
                ]
            });
            pastCount++;
        }
        console.log(`   ✅ ${pastCount} past consultations created`);

        // ================================================================
        // 9. RECORDS — Tâches (5) avec relations
        // ================================================================
        console.log('\n📝 Tâches...');

        const tacheDefs = [
            {
                title: 'Consulter résultats labo - ' + patientRecords[0].title,
                desc: 'Résultats analyses sanguines à vérifier',
                assignee: equipeRecords['Dr. Boukirou']._id,
                patient: patientRecords[0]._id,
                priority: 'Urgent',
                status: 'À faire',
                dueAt: todayAt(12, 0)
            },
            {
                title: 'Rédiger certificat médical - ' + patientRecords[1].title,
                desc: 'Certificat médical pour arrêt de travail',
                assignee: equipeRecords['Dr. Boukirou']._id,
                patient: patientRecords[1]._id,
                priority: 'Normal',
                status: 'En cours',
                dueAt: todayAt(17, 0)
            },
            {
                title: 'Rappeler patient pour contrôle - ' + patientRecords[2].title,
                desc: 'Rappel téléphonique pour suivi post-consultation',
                assignee: equipeRecords['Fatima Bennani']._id,
                patient: patientRecords[2]._id,
                priority: 'Important',
                status: 'À faire',
                dueAt: todayAt(14, 0)
            },
            {
                title: 'Planifier suivi diabète - ' + patientRecords[3].title,
                desc: 'Programmer RDV contrôle diabète dans 3 mois',
                assignee: equipeRecords['Dr. Boukirou']._id,
                patient: patientRecords[3]._id,
                priority: 'Normal',
                status: 'À faire',
                dueAt: daysAgo(-7) // dans 7 jours
            },
            {
                title: 'Commander vaccins grippe',
                desc: 'Commander stock de vaccins grippe pour la saison',
                assignee: equipeRecords['Sarah El Fassi']._id,
                patient: null,
                priority: 'Normal',
                status: 'À faire',
                dueAt: daysAgo(-14) // dans 14 jours
            }
        ];

        for (const tDef of tacheDefs) {
            const priorityOpt = getOption(taskPriority, tDef.priority);
            const statusOpt = getOption(taskStatus, tDef.status);

            await findOrCreate(RecordModel, { entityId: tacheEntity._id, title: tDef.title }, {
                status: 'active',
                order: 0,
                classificationValues: [
                    { classificationId: taskStatus._id, optionId: statusOpt._id },
                    { classificationId: taskPriority._id, optionId: priorityOpt._id }
                ],
                customFields: [
                    { field_id: tf.titre_tache._id, value: tDef.title },
                    { field_id: tf.description_tache._id, value: tDef.desc },
                    { field_id: tf.tache_assignee._id, value: tDef.assignee },
                    { field_id: tf.tache_patient._id, value: tDef.patient },
                    { field_id: tf.due_at._id, value: tDef.dueAt }
                ]
            });
        }

        // ================================================================
        // 10. COCKPIT PageConfig (upsert)
        // ================================================================
        console.log('\n🖥️ Cockpit PageConfig...');

        const cockpitConfig = {
            name: 'Doctor Dashboard',
            slug: 'doctor-dashboard',
            status: 'published',
            type: 'cockpit',
            tabs: [{ id: 'default', label: 'Dashboard' }],
            layout: {
                default: [
                    {
                        id: 'row-1', equalHeight: true,
                        columns: [
                            { width: 4, blocks: ['kpi_today'] },
                            { width: 4, blocks: ['urgency_radar'] },
                            { width: 4, blocks: ['focus_next'] }
                        ]
                    },
                    {
                        id: 'row-2', equalHeight: true,
                        columns: [
                            { width: 6, blocks: ['waiting_room'] },
                            { width: 6, blocks: ['comms_dock'] }
                        ]
                    },
                    {
                        id: 'row-3', equalHeight: true,
                        columns: [
                            { width: 4, blocks: ['consultation_stats'] },
                            { width: 4, blocks: ['quick_insights'] },
                            { width: 4, blocks: ['tasks_alerts'] }
                        ]
                    },
                    {
                        id: 'row-4',
                        columns: [
                            { width: 5, blocks: ['top_meds'] },
                            { width: 7, blocks: ['planning_jour'] }
                        ]
                    }
                ]
            },
            blocks: {
                kpi_today: {
                    type: 'kpi-cards',
                    title: "Aujourd'hui",
                    props: {
                        dataSource: '/api/analytics/today', mapping: {
                            items: [
                                { key: 'today.total', label: 'Patients', color: 'primary' },
                                { key: 'today.seen', label: 'Vus', color: 'success' },
                                { key: 'today.remaining', label: 'Restants', color: 'warning' },
                                { key: 'today.urgent', label: 'Urgents', color: 'danger' }
                            ]
                        }
                    }
                },
                urgency_radar: {
                    type: 'urgency-radar',
                    title: 'Radar Urgences',
                    props: { dataSource: '/api/analytics/today', mapping: { items: 'urgencies' } }
                },
                focus_next: {
                    type: 'focus-card',
                    title: 'Prochain Patient',
                    props: { dataSource: '/api/records', query: { entitySlug: 'consultation', filters: { status: 'en_salle_attente' }, sort: 'rdv_at', limit: 1 } }
                },
                waiting_room: {
                    type: 'work-queue',
                    title: "Salle d'Attente",
                    props: { height: 450, dataSource: '/api/records', query: { entitySlug: 'consultation', filters: { status__in: ['en_salle_attente', 'en_cours'] }, sort: 'rdv_at' } }
                },
                comms_dock: {
                    type: 'comms-dock',
                    title: 'Coordination — Secrétariat',
                    props: { height: 450, tier: 'static' }
                },
                consultation_stats: {
                    type: 'kpi-cards',
                    title: 'Consultations',
                    props: { dataSource: '/api/analytics/today', mapping: { items: 'byStatus' } }
                },
                quick_insights: {
                    type: 'statistics',
                    title: 'Statistiques Rapides',
                    props: { tier: 'static' }
                },
                tasks_alerts: {
                    type: 'progress-list',
                    title: 'Tâches & Alertes',
                    props: { dataSource: '/api/records', query: { entitySlug: 'tache', filters: { task_status__ne: 'termine' }, sort: '-task_priority' } }
                },
                top_meds: {
                    type: 'progress-list',
                    title: 'Top Médicaments Prescrits',
                    props: { dataSource: '/api/analytics/today', mapping: { items: 'topMedications' } }
                },
                planning_jour: {
                    type: 'work-queue',
                    title: 'Planning du Jour',
                    props: { height: 350, dataSource: '/api/records', query: { entitySlug: 'consultation', filters: { rdv_at__today: true }, sort: 'rdv_at' } }
                }
            }
        };

        await PageConfigModel.findOneAndUpdate(
            { slug: 'doctor-dashboard' },
            { $set: cockpitConfig },
            { upsert: true, new: true }
        );
        console.log('   ✅ Cockpit PageConfig upserted');

        // Get PageConfig _id for cockpit view
        const pageConfig = await PageConfigModel.findOne({ slug: 'doctor-dashboard' });

        // ================================================================
        // 10.5 VIEWS — Sidebar Navigation
        // ================================================================
        console.log('\n🧭 Views (sidebar navigation)...');

        const viewDefs = [
            {
                slug: 'view-doctor-dashboard', name: 'Doctor Dashboard',
                viewType: 'cockpit', cockpitId: pageConfig._id,
                icon: 'solar:monitor-smartphone-bold-duotone', color: '#4361ee',
                spaces: [space._id], folders: [],
                order: 0
            },
            {
                slug: 'view-patients', name: 'Patients',
                viewType: 'list', entity: patientEntity._id,
                icon: 'solar:user-bold', color: '#4361ee',
                spaces: [], folders: [folders['patients-actifs']._id],
                order: 0
            },
            {
                slug: 'view-consultations', name: 'Consultations',
                viewType: 'list', entity: consultationEntity._id,
                icon: 'solar:stethoscope-bold', color: '#f59e0b',
                spaces: [], folders: [folders['consultations-jour']._id],
                order: 0
            },
            {
                slug: 'view-dossiers', name: 'Dossiers Médicaux',
                viewType: 'list', entity: dossierEntity._id,
                icon: 'solar:folder-with-files-bold', color: '#10b981',
                spaces: [], folders: [folders['archives']._id],
                order: 0
            },
            {
                slug: 'view-equipe', name: 'Membres Équipe',
                viewType: 'list', entity: membreEquipeEntity._id,
                icon: 'solar:users-group-two-rounded-bold', color: '#4361ee',
                spaces: [], folders: [folders['equipe']._id],
                order: 0
            },
            {
                slug: 'view-taches', name: 'Tâches',
                viewType: 'list', entity: tacheEntity._id,
                icon: 'solar:checklist-bold', color: '#ef4444',
                spaces: [], folders: [folders['taches']._id],
                order: 0
            }
        ];

        for (const vDef of viewDefs) {
            await findOrCreate(ViewModel, { slug: vDef.slug }, vDef);
        }
        console.log(`   ✅ ${viewDefs.length} views created`);

        // ================================================================
        // 11. INDEXES
        // ================================================================
        console.log('\n📊 Creating indexes...');
        const db = tenantDb.db;
        try {
            await db.collection('records').createIndex({ entityId: 1, 'customFields.field_id': 1, 'customFields.value': 1 });
            await db.collection('records').createIndex({ entityId: 1, 'classificationValues.classificationId': 1, 'classificationValues.optionId': 1 });
            await db.collection('records').createIndex({ entityId: 1, createdAt: -1 });
            console.log('   ✅ Indexes created');
        } catch (e) {
            console.log('   ⚠️ Index creation skipped (may already exist):', e.message);
        }

        // ================================================================
        // SUMMARY
        // ================================================================
        console.log('\n' + '='.repeat(60));
        console.log('🎉 SEED CABINET MÉDICAL v2 TERMINÉ !');
        console.log('='.repeat(60));
        console.log(`   📊 Classifications: 5`);
        console.log(`   📝 FieldTemplates: ${Object.keys(pf).length + Object.keys(cf).length + Object.keys(df).length + Object.keys(tf).length + Object.keys(ef).length}`);
        console.log(`   📁 Space: 1 + ${Object.keys(folders).length} Folders`);
        console.log(`   🗂️ Entities: 5 (Patient, Consultation, Dossier, Tâche, Équipe)`);
        console.log(`   👥 Équipe: ${Object.keys(equipeRecords).length}`);
        console.log(`   👥 Patients: ${patientRecords.length}`);
        console.log(`   📋 Consultations today: ${todayConsultations.length}`);
        console.log(`   📋 Consultations past: ${pastCount}`);
        console.log(`   📝 Tâches: ${tacheDefs.length}`);
        console.log(`   🧭 Views: ${viewDefs.length}`);
        console.log(`   🖥️ Cockpit: doctor-dashboard`);
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

main();
