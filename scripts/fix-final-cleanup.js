/**
 * Fix all remaining issues:
 * 1. Set sidebarWidgets on Consultation entity (Actes, Examens, Traitement, Observations)
 * 2. Set titleDisplay in view settings for all non-patient entities
 * 3. Update user preferences: titleDisplay=icon for non-patient entity views
 */
const mongoose = require('mongoose');

async function main() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_7846');
    await new Promise(r => conn.once('open', r));
    console.log('✅ Connected');
    const db = conn.db;

    // ==========================================
    // 1. Set consultation sidebarWidgets
    // ==========================================
    console.log('\n📋 Task 1: Set consultation sidebarWidgets...');
    const consultEntity = await db.collection('entities').findOne({ slug: 'consultations' });
    if (consultEntity) {
        // Get schema IDs from gridSchemas
        const gridSchemas = consultEntity.gridSchemas || [];
        const treatmentSchema = gridSchemas.find(g => g.label === 'Traitements');
        const examSchema = gridSchemas.find(g => g.label === 'Examin');
        const devisSchema = gridSchemas.find(g => g.label === 'Devis');
        const factureSchema = gridSchemas.find(g => g.label === 'Facture');

        const sidebarWidgets = [
            {
                type: 'note',
                label: 'Observations',
                icon: 'solar:clipboard-text-bold-duotone',
                color: '#00ab55',
                order: 0,
                visible: true,
                config: { content: '' }
            }
        ];

        // Add Actes (Devis/prestation schema)
        if (devisSchema) {
            sidebarWidgets.push({
                type: 'dynamic-table',
                label: 'Actes',
                icon: 'solar:clipboard-list-bold-duotone',
                color: '#4361ee',
                order: 1,
                visible: true,
                config: {
                    schemaId: devisSchema.schemaId,
                    schemaIds: [devisSchema.schemaId],
                    enableAdd: true,
                    enableDocPreview: false
                }
            });
        }

        // Add Examens
        if (examSchema) {
            sidebarWidgets.push({
                type: 'dynamic-table',
                label: 'Examens',
                icon: 'solar:test-tube-bold-duotone',
                color: '#f97316',
                order: 2,
                visible: true,
                config: {
                    schemaId: examSchema.schemaId,
                    schemaIds: [examSchema.schemaId],
                    enableAdd: true,
                    enableDocPreview: false
                }
            });
        }

        // Add Traitement
        if (treatmentSchema) {
            sidebarWidgets.push({
                type: 'dynamic-table',
                label: 'Traitement',
                icon: 'solar:pills-bold-duotone',
                color: '#0891b2',
                order: 3,
                visible: true,
                config: {
                    schemaId: treatmentSchema.schemaId,
                    schemaIds: [treatmentSchema.schemaId],
                    enableAdd: true,
                    enableDocPreview: false
                }
            });
        }

        // Add Facture
        if (factureSchema) {
            sidebarWidgets.push({
                type: 'dynamic-table',
                label: 'Facture',
                icon: 'solar:document-text-bold-duotone',
                color: '#e11d48',
                order: 4,
                visible: true,
                config: {
                    schemaId: factureSchema.schemaId,
                    schemaIds: [factureSchema.schemaId],
                    enableAdd: true,
                    enableDocPreview: false
                }
            });
        }

        await db.collection('entities').updateOne(
            { _id: consultEntity._id },
            { $set: { sidebarWidgets } }
        );
        console.log(`   ✅ Set ${sidebarWidgets.length} sidebarWidgets on Consultation`);
        sidebarWidgets.forEach(w => console.log(`      - ${w.label} (${w.type}) icon: ${w.icon}`));
    }

    // ==========================================
    // 2. Set titleDisplay in view settings
    // ==========================================
    console.log('\n📋 Task 2: Set titleDisplay in view settings...');
    const patientsEntity = await db.collection('entities').findOne({ slug: 'patients' });
    const patientEntityId = patientsEntity?._id;

    // Get all views
    const allViews = await db.collection('views').find({}).toArray();
    for (const view of allViews) {
        const entityId = view.entity?.toString();
        const isPatient = entityId === patientEntityId?.toString();
        const targetDisplay = isPatient ? 'avatar' : 'icon';
        
        const currentDisplay = view.settings?.titleDisplay;
        if (currentDisplay !== targetDisplay) {
            await db.collection('views').updateOne(
                { _id: view._id },
                { $set: { 'settings.titleDisplay': targetDisplay } }
            );
            console.log(`   ✅ View "${view.name || view._id}": titleDisplay → ${targetDisplay}`);
        }
    }

    // ==========================================
    // 3. Update user preferences for non-patient views
    // ==========================================
    console.log('\n📋 Task 3: Update user preferences...');
    // Get all entity views mapped to their entity
    const viewToEntityMap = {};
    for (const v of allViews) {
        if (v.entity) {
            viewToEntityMap[v._id.toString()] = v.entity.toString();
        }
    }

    const prefs = await db.collection('userpreferences').find({
        'preferences.titleDisplay': 'avatar'
    }).toArray();

    for (const pref of prefs) {
        const viewId = pref.viewId;
        if (!viewId) continue;

        // Check if this viewId maps to a patient entity
        const entityId = viewToEntityMap[viewId];
        const isPatient = entityId === patientEntityId?.toString();

        if (!isPatient) {
            await db.collection('userpreferences').updateOne(
                { _id: pref._id },
                { $set: { 'preferences.titleDisplay': 'icon' } }
            );
            console.log(`   ✅ Pref ${viewId}: titleDisplay → icon`);
        } else {
            console.log(`   ⏭️  Pref ${viewId}: keeping avatar (patient)`);
        }
    }

    console.log('\n✅ All fixes applied!');
    await conn.close();
    process.exit(0);
}

main().catch(err => { console.error('❌', err); process.exit(1); });
