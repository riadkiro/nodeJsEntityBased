/**
 * Seed Script - Cabinet Médical Complet
 * 
 * Crée une simulation complète d'un cabinet médical en activité :
 * - Entities: Patient, Dossier Médical, Consultation
 * - Classifications: Statut consultation, Type patient, Urgence
 * - Custom Fields pour chaque entité
 * - Relations entre entités
 * - Records de démonstration
 * - Space "Cabinet Docteur" avec folders
 * - Team : 2 secrétaires
 * 
 * Usage: node scripts/cabinet-docteur/seed-cabinet.js <account_number>
 * Example: node scripts/cabinet-docteur/seed-cabinet.js 5756
 */

const mongoose = require('mongoose');
const config = require('../../config/db');

// ============================================================================
// DONNÉES DE DÉMONSTRATION
// ============================================================================

// Prénoms/Noms patients
const prenoms = ['Mohamed', 'Fatima', 'Ahmed', 'Aicha', 'Youssef', 'Khadija', 'Omar', 'Samira', 'Hassan', 'Nadia',
    'Rachid', 'Leila', 'Karim', 'Zineb', 'Mustapha', 'Hanan', 'Khalid', 'Souad', 'Jamal', 'Latifa'];
const noms = ['El Amrani', 'Benkirane', 'Saidi', 'Tazi', 'Alaoui', 'Berrada', 'Fassi', 'Kadiri', 'Chaoui', 'Benjelloun',
    'El Mansouri', 'Bouchta', 'Zerouali', 'Lahlou', 'Bennani', 'Chraibi', 'Sekkat', 'Zniber', 'Tahiri', 'Rhazi'];

// Pathologies/Motifs
const motifs = ['Consultation de routine', 'Douleurs thoraciques', 'Suivi diabète', 'Contrôle tension',
    'Vaccination', 'Renouvellement ordonnance', 'Maux de tête', 'Fatigue chronique', 'Bilan sanguin',
    'Problèmes digestifs', 'Douleurs articulaires', 'Allergie saisonnière', 'Suivi grossesse', 'Check-up annuel'];

const allergies = ['Pénicilline', 'Aspirine', 'Iode', 'Latex', 'Fruits de mer', null, null, null];
const antecedents = ['Diabète type 2', 'Hypertension', 'Asthme', 'Cholestérol', null, null, null];

// Groupes sanguins
const groupesSanguins = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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
        taille: randomInt(155, 190) + ' cm',
        pouls: randomInt(60, 100) + ' bpm',
        spo2: randomInt(95, 100) + '%'
    };
}

// ============================================================================
// MAIN SCRIPT
// ============================================================================

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.log('Usage: node scripts/cabinet-docteur/seed-cabinet.js <account_number>');
        process.exit(1);
    }

    const accountNumber = args[0];
    console.log('\n🏥 SEED CABINET MÉDICAL');
    console.log('='.repeat(60));
    console.log(`   Account: ${accountNumber}`);

    try {
        // Connect to databases
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
        const User = require('../../models/user.model');

        const EntityModel = tenantDb.model('Entity', Entity.schema);
        const FieldModel = tenantDb.model('FieldTemplate', FieldTemplate.schema);
        const ClassificationModel = tenantDb.model('Classification', Classification.schema);
        const RecordModel = tenantDb.model('Record', Record.schema);
        const SpaceModel = tenantDb.model('Space', Space.schema);
        const FolderModel = tenantDb.model('Folder', Folder.schema);

        // Get account owner from global DB
        const Account = require('../../models/account.model');
        const account = await Account.findOne({ account_number: accountNumber });
        if (!account) {
            console.log('❌ Account not found');
            process.exit(1);
        }
        const ownerId = new mongoose.Types.ObjectId(account.users[0] || '000000000000000000000000');

        // ====================================================================
        // 1. CREATE CLASSIFICATIONS
        // ====================================================================
        console.log('\n📊 Creating Classifications...');

        const statusConsultation = await ClassificationModel.create({
            name: 'Statut Consultation',
            key: 'consultation_status',
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
        console.log('   ✅ Statut Consultation');

        const typePatient = await ClassificationModel.create({
            name: 'Type Patient',
            key: 'patient_type',
            description: 'Type de patient',
            isShared: true,
            type: 'simple',
            options: [
                { label: 'Nouveau', color: '#3b82f6', icon: 'solar:user-plus-bold', order: 0 },
                { label: 'Régulier', color: '#10b981', icon: 'solar:user-check-bold', order: 1 },
                { label: 'VIP', color: '#f59e0b', icon: 'solar:star-bold', order: 2 }
            ]
        });
        console.log('   ✅ Type Patient');

        const urgence = await ClassificationModel.create({
            name: 'Niveau Urgence',
            key: 'urgency_level',
            description: 'Niveau d\'urgence',
            isShared: true,
            type: 'simple',
            options: [
                { label: 'Normal', color: '#10b981', icon: 'solar:check-circle-bold', order: 0 },
                { label: 'Prioritaire', color: '#f59e0b', icon: 'solar:alarm-bold', order: 1 },
                { label: 'Urgent', color: '#ef4444', icon: 'solar:danger-bold', order: 2 }
            ]
        });
        console.log('   ✅ Niveau Urgence');

        // ====================================================================
        // 2. CREATE FIELD TEMPLATES
        // ====================================================================
        console.log('\n📝 Creating Field Templates...');

        // Patient fields
        const patientFields = await FieldModel.create([
            { name: 'nom', label: 'Nom', type: 'string', required: true, category: 'text' },
            { name: 'prenom', label: 'Prénom', type: 'string', required: true, category: 'text' },
            { name: 'date_naissance', label: 'Date de naissance', type: 'date', category: 'date' },
            { name: 'telephone', label: 'Téléphone', type: 'string', subtype: 'tel', category: 'text' },
            { name: 'email', label: 'Email', type: 'string', subtype: 'email', category: 'text' },
            { name: 'adresse', label: 'Adresse', type: 'longtext', category: 'text' },
            { name: 'groupe_sanguin', label: 'Groupe Sanguin', type: 'select', type_config: { options: groupesSanguins }, category: 'choice' },
            { name: 'allergies', label: 'Allergies', type: 'multiselect', type_config: { options: allergies.filter(a => a) }, category: 'choice' },
            { name: 'antecedents', label: 'Antécédents', type: 'longtext', category: 'text' },
            { name: 'notes_medicales', label: 'Notes Médicales', type: 'longtext', category: 'text' }
        ]);
        console.log(`   ✅ ${patientFields.length} Patient fields`);

        // Consultation fields
        const consultationFields = await FieldModel.create([
            { name: 'motif', label: 'Motif', type: 'string', required: true, category: 'text' },
            { name: 'date_heure', label: 'Date & Heure', type: 'datetime', required: true, category: 'date' },
            { name: 'tension', label: 'Tension', type: 'string', category: 'text', ui: { placeholder: '12/8' } },
            { name: 'temperature', label: 'Température', type: 'string', category: 'text', ui: { placeholder: '37.2°C' } },
            { name: 'poids', label: 'Poids', type: 'string', category: 'text', ui: { placeholder: '70 kg' } },
            { name: 'diagnostic', label: 'Diagnostic', type: 'longtext', category: 'text' },
            { name: 'prescription', label: 'Prescription', type: 'longtext', category: 'text' },
            { name: 'suivi', label: 'Suivi recommandé', type: 'longtext', category: 'text' }
        ]);
        console.log(`   ✅ ${consultationFields.length} Consultation fields`);

        // Dossier fields
        const dossierFields = await FieldModel.create([
            { name: 'numero_dossier', label: 'N° Dossier', type: 'string', required: true, unique: true, category: 'text' },
            { name: 'date_creation', label: 'Date Création', type: 'date', category: 'date' },
            { name: 'medecin_traitant', label: 'Médecin Traitant', type: 'string', category: 'text' },
            { name: 'assurance', label: 'Assurance', type: 'string', category: 'text' },
            { name: 'numero_assure', label: 'N° Assuré', type: 'string', category: 'text' }
        ]);
        console.log(`   ✅ ${dossierFields.length} Dossier fields`);

        // ====================================================================
        // 3. CREATE SPACE & FOLDERS
        // ====================================================================
        console.log('\n📁 Creating Space & Folders...');

        const space = await SpaceModel.create({
            name: 'Cabinet Docteur',
            slug: 'cabinet-docteur',
            description: 'Espace de travail du cabinet médical',
            icon: 'solar:stethoscope-bold',
            color: '#4361ee',
            owner: ownerId
        });
        console.log(`   ✅ Space: ${space.name}`);

        const folders = await FolderModel.create([
            { name: 'Patients Actifs', slug: 'patients-actifs', icon: 'solar:users-group-rounded-bold', color: '#10b981', spaceId: space._id, order: 0 },
            { name: 'Consultations Jour', slug: 'consultations-jour', icon: 'solar:calendar-bold', color: '#f59e0b', spaceId: space._id, order: 1 },
            { name: 'Archives', slug: 'archives', icon: 'solar:archive-bold', color: '#6b7280', spaceId: space._id, order: 2 }
        ]);
        console.log(`   ✅ ${folders.length} Folders created`);

        // ====================================================================
        // 4. CREATE ENTITIES
        // ====================================================================
        console.log('\n🗂️ Creating Entities...');

        const patientEntity = await EntityModel.create({
            name: 'Patient',
            slug: 'patient',
            description: 'Patients du cabinet médical',
            icon: 'solar:user-bold',
            color: '#4361ee',
            customFields: patientFields.map(f => f._id),
            statusClassification: typePatient._id,
            classifications: [urgence._id],
            spaces: [space._id],
            folders: [folders[0]._id]
        });
        console.log(`   ✅ Entity: Patient`);

        const consultationEntity = await EntityModel.create({
            name: 'Consultation',
            slug: 'consultation',
            description: 'Consultations médicales',
            icon: 'solar:stethoscope-bold',
            color: '#f59e0b',
            customFields: consultationFields.map(f => f._id),
            statusClassification: statusConsultation._id,
            classifications: [urgence._id],
            spaces: [space._id],
            folders: [folders[1]._id]
        });
        console.log(`   ✅ Entity: Consultation`);

        const dossierEntity = await EntityModel.create({
            name: 'Dossier Médical',
            slug: 'dossier-medical',
            description: 'Dossiers médicaux des patients',
            icon: 'solar:folder-with-files-bold',
            color: '#10b981',
            customFields: dossierFields.map(f => f._id),
            spaces: [space._id],
            folders: [folders[2]._id]
        });
        console.log(`   ✅ Entity: Dossier Médical`);

        // ====================================================================
        // 5. CREATE PATIENT RECORDS
        // ====================================================================
        console.log('\n👥 Creating Patient Records...');

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

            const birthDate = generateBirthDate();
            const patientType = randomItem(typePatient.options);
            const urgenceLevel = randomItem(urgence.options);

            const record = await RecordModel.create({
                entityId: patientEntity._id,
                title: fullName,
                image: `/assets/images/profile-${randomInt(1, 34)}.jpeg`,
                status: 'active',
                order: i,
                classifications: [
                    { classificationId: typePatient._id, optionId: patientType._id },
                    { classificationId: urgence._id, optionId: urgenceLevel._id }
                ],
                customFields: [
                    { field_id: patientFields[0]._id, value: nom },
                    { field_id: patientFields[1]._id, value: prenom },
                    { field_id: patientFields[2]._id, value: birthDate },
                    { field_id: patientFields[3]._id, value: generatePhone() },
                    { field_id: patientFields[4]._id, value: `${prenom.toLowerCase()}.${nom.toLowerCase().replace(' ', '')}@email.com` },
                    { field_id: patientFields[5]._id, value: `${randomInt(1, 150)} Rue ${randomItem(['Hassan II', 'Mohammed V', 'de la Paix', 'des Fleurs'])}` },
                    { field_id: patientFields[6]._id, value: randomItem(groupesSanguins) },
                    { field_id: patientFields[7]._id, value: [randomItem(allergies)].filter(a => a) },
                    { field_id: patientFields[8]._id, value: randomItem(antecedents) || '' },
                    { field_id: patientFields[9]._id, value: '' }
                ]
            });
            patientRecords.push(record);
            console.log(`   ${i + 1}. ${fullName} (${patientType.label})`);
        }
        console.log(`   ✅ ${patientRecords.length} patients created`);

        // ====================================================================
        // 6. CREATE CONSULTATION RECORDS
        // ====================================================================
        console.log('\n📋 Creating Consultation Records...');

        const consultationRecords = [];
        const today = new Date();

        for (let i = 0; i < 15; i++) {
            const patient = patientRecords[i % patientRecords.length];
            const motif = randomItem(motifs);
            const status = statusConsultation.options[randomInt(0, 3)];
            const urgenceLevel = urgence.options[i < 2 ? 2 : randomInt(0, 1)];
            const vitals = generateVitals();

            // Schedule: some today, some past
            const consultDate = new Date(today);
            if (i > 8) {
                consultDate.setDate(consultDate.getDate() - randomInt(1, 30));
            }
            consultDate.setHours(8 + Math.floor(i / 2), (i % 2) * 30, 0, 0);

            const record = await RecordModel.create({
                entityId: consultationEntity._id,
                title: `${patient.title} - ${motif}`,
                status: 'active',
                order: i,
                classifications: [
                    { classificationId: statusConsultation._id, optionId: status._id },
                    { classificationId: urgence._id, optionId: urgenceLevel._id }
                ],
                customFields: [
                    { field_id: consultationFields[0]._id, value: motif },
                    { field_id: consultationFields[1]._id, value: consultDate },
                    { field_id: consultationFields[2]._id, value: vitals.tension },
                    { field_id: consultationFields[3]._id, value: vitals.temperature },
                    { field_id: consultationFields[4]._id, value: vitals.poids },
                    { field_id: consultationFields[5]._id, value: status.label === 'Terminée' ? 'Examen normal' : '' },
                    { field_id: consultationFields[6]._id, value: status.label === 'Terminée' ? 'Paracétamol 1g x3/j' : '' },
                    { field_id: consultationFields[7]._id, value: status.label === 'Terminée' ? 'Contrôle dans 15 jours' : '' }
                ],
                relations: [{ entityId: patientEntity._id, recordId: patient._id }]
            });
            consultationRecords.push(record);
            console.log(`   ${i + 1}. ${patient.title} - ${motif} [${status.label}]`);
        }
        console.log(`   ✅ ${consultationRecords.length} consultations created`);

        // ====================================================================
        // 7. CREATE TEAM (Secrétaires)
        // ====================================================================
        console.log('\n👥 Team Info (Secrétaires)...');
        console.log('   ℹ️ Pour ajouter des secrétaires à l\'équipe :');
        console.log('   1. Créer des comptes utilisateurs');
        console.log('   2. Les ajouter au compte via Account.users');
        console.log('   3. Ou utiliser le système d\'invitations');

        // ====================================================================
        // SUMMARY
        // ====================================================================
        console.log('\n' + '='.repeat(60));
        console.log('🎉 SEED CABINET MÉDICAL TERMINÉ !');
        console.log('='.repeat(60));
        console.log(`   📊 Classifications: 3`);
        console.log(`   📝 Field Templates: ${patientFields.length + consultationFields.length + dossierFields.length}`);
        console.log(`   📁 Space: 1 + ${folders.length} Folders`);
        console.log(`   🗂️ Entities: 3 (Patient, Consultation, Dossier)`);
        console.log(`   👥 Patients: ${patientRecords.length}`);
        console.log(`   📋 Consultations: ${consultationRecords.length}`);
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
