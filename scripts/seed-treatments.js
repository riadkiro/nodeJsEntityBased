/**
 * Seed Treatments — Entity + FieldTemplates + Records + LineSchema update
 *
 * Creates:
 *   1. Entity "Traitement" (if not exists)
 *   2. 3 FieldTemplates: unites_dosage, frequences, moments_prise
 *   3. ~20 treatment Records with customFields
 *   4. Updates prescription_v1 LineSchema with _dynamicFilterConfig
 *
 * Idempotent: uses upsert for templates and records (by title + entityId).
 *
 * Usage: node scripts/seed-treatments.js <account_number>
 * Example: node scripts/seed-treatments.js 5001
 */

const mongoose = require('mongoose');
const config = require('../config/db');

async function seed() {
    const accountNumber = process.argv[2];
    if (!accountNumber) {
        console.error('❌ Usage: node scripts/seed-treatments.js <account_number>');
        process.exit(1);
    }

    try {
        await mongoose.connect(config.globalDbUri);
        console.log('✅ Connected to main MongoDB');

        const tenantDbName = `saas_app_rb_${accountNumber}`;
        const tenantConn = mongoose.createConnection(`${config.uri}${tenantDbName}`);
        console.log(`✅ Connected to tenant DB: ${tenantDbName}`);

        // ── Register models on tenant connection ──
        const Entity = tenantConn.model('Entity', require('../models/entity.model').schema);
        const Record = tenantConn.model('Record', require('../models/record.model').schema);
        const FieldTemplate = tenantConn.model('FieldTemplate', require('../models/field-template.model').schema);
        const LineSchema = tenantConn.model('LineSchema', require('../models/line-schema.model').schema);

        // ════════════════════════════════════════════════════════════════
        // STEP 1 — Create / Find Entity "Traitement"
        // ════════════════════════════════════════════════════════════════
        let entity = await Entity.findOne({ slug: 'traitement' });
        if (!entity) {
            entity = await Entity.create({
                name: 'Traitement',
                slug: 'traitement',
                description: 'Catalogue de traitements médicaux',
                icon: 'solar:pill-bold-duotone',
                color: '#22c55e',
                enabledStandardFields: ['title', 'description'],
                customFields: []
            });
            console.log('✅ Entity "Traitement" created:', entity._id);
        } else {
            console.log('ℹ️  Entity "Traitement" exists:', entity._id);
        }

        // ════════════════════════════════════════════════════════════════
        // STEP 2 — Create 3 FieldTemplates (multi-select)
        // ════════════════════════════════════════════════════════════════
        const fieldDefs = [
            {
                name: 'unites_dosage',
                label: 'Unités de dosage',
                type: 'select',
                category: 'choice',
                isSystem: true,
                type_config: {
                    multiple: true,
                    options: [
                        { value: 'mg', label: 'mg' },
                        { value: 'ml', label: 'ml' },
                        { value: 'g', label: 'g' },
                        { value: 'cp', label: 'cp (comprimé)' },
                        { value: 'gouttes', label: 'gouttes' },
                        { value: 'UI', label: 'UI' },
                        { value: 'ug', label: 'µg' },
                        { value: 'mmol', label: 'mmol' },
                        { value: 'seance', label: 'séance' },
                        { value: 'application', label: 'application' },
                        { value: 'inhalation', label: 'inhalation' },
                        { value: 'suppositoire', label: 'suppositoire' },
                        { value: 'patch', label: 'patch' }
                    ]
                },
                ui: {
                    icon: 'solar:pill-bold-duotone',
                    width: 'full'
                }
            },
            {
                name: 'frequences',
                label: 'Fréquences',
                type: 'select',
                category: 'choice',
                isSystem: true,
                type_config: {
                    multiple: true,
                    options: [
                        { value: '1x_day', label: '1x / jour' },
                        { value: '2x_day', label: '2x / jour' },
                        { value: '3x_day', label: '3x / jour' },
                        { value: '4x_day', label: '4x / jour' },
                        { value: 'every_6h', label: 'Toutes les 6h' },
                        { value: 'every_8h', label: 'Toutes les 8h' },
                        { value: 'every_12h', label: 'Toutes les 12h' },
                        { value: 'weekly', label: '1x / semaine' },
                        { value: '2x_week', label: '2x / semaine' },
                        { value: '3x_week', label: '3x / semaine' },
                        { value: 'monthly', label: '1x / mois' },
                        { value: 'as_needed', label: 'Si besoin' }
                    ]
                },
                ui: {
                    icon: 'solar:clock-circle-bold-duotone',
                    width: 'full'
                }
            },
            {
                name: 'moments_prise',
                label: 'Moments de prise',
                type: 'select',
                category: 'choice',
                isSystem: true,
                type_config: {
                    multiple: true,
                    options: [
                        { value: 'morning', label: 'Matin' },
                        { value: 'noon', label: 'Midi' },
                        { value: 'evening', label: 'Soir' },
                        { value: 'bedtime', label: 'Au coucher' },
                        { value: 'before_meal', label: 'Avant repas' },
                        { value: 'after_meal', label: 'Après repas' },
                        { value: 'fasting', label: 'À jeun' }
                    ]
                },
                ui: {
                    icon: 'solar:sun-bold-duotone',
                    width: 'full'
                }
            }
        ];

        const fieldIds = {};
        for (const def of fieldDefs) {
            const ft = await FieldTemplate.findOneAndUpdate(
                { name: def.name },
                def,
                { upsert: true, new: true }
            );
            fieldIds[def.name] = ft._id;
            console.log(`✅ FieldTemplate "${def.name}": ${ft._id}`);
        }

        // Attach fields to entity if not already attached
        const currentFieldIds = (entity.customFields || []).map(id => id.toString());
        let needsUpdate = false;
        for (const [name, id] of Object.entries(fieldIds)) {
            if (!currentFieldIds.includes(id.toString())) {
                entity.customFields.push(id);
                needsUpdate = true;
            }
        }
        if (needsUpdate) {
            await entity.save();
            console.log('✅ Fields attached to entity "Traitement"');
        }

        // ════════════════════════════════════════════════════════════════
        // STEP 3 — Seed ~20 treatment records (upsert by title+entityId)
        // ════════════════════════════════════════════════════════════════
        const treatments = [
            { title: 'Doliprane 1000mg', units: ['mg', 'g'], freq: ['1x_day', '2x_day', '3x_day', 'as_needed'], moments: ['morning', 'noon', 'evening'] },
            { title: 'Doliprane 500mg', units: ['mg'], freq: ['1x_day', '2x_day', '3x_day', 'as_needed'], moments: ['morning', 'noon', 'evening'] },
            { title: 'Amoxicilline 1g', units: ['mg', 'g'], freq: ['2x_day', '3x_day', 'every_8h'], moments: ['morning', 'noon', 'evening', 'after_meal'] },
            { title: 'Augmentin 1g', units: ['mg'], freq: ['2x_day', '3x_day'], moments: ['morning', 'evening', 'after_meal'] },
            { title: 'Ibuprofène 400mg', units: ['mg'], freq: ['1x_day', '2x_day', '3x_day', 'as_needed'], moments: ['morning', 'noon', 'evening', 'after_meal'] },
            { title: 'Oméprazole 20mg', units: ['mg'], freq: ['1x_day'], moments: ['morning', 'fasting'] },
            { title: 'Vitamine D3', units: ['UI', 'ug', 'gouttes'], freq: ['1x_day', 'weekly', 'monthly'], moments: ['morning'] },
            { title: 'Levothyrox', units: ['ug'], freq: ['1x_day'], moments: ['morning', 'fasting'] },
            { title: 'Metformine 500mg', units: ['mg'], freq: ['1x_day', '2x_day', '3x_day'], moments: ['morning', 'noon', 'evening', 'after_meal'] },
            { title: 'Amlodipine 5mg', units: ['mg'], freq: ['1x_day'], moments: ['morning'] },
            { title: 'Atorvastatine 10mg', units: ['mg'], freq: ['1x_day'], moments: ['evening'] },
            { title: 'Pantoprazole 40mg', units: ['mg'], freq: ['1x_day'], moments: ['morning', 'fasting'] },
            { title: 'Ventoline (spray)', units: ['inhalation'], freq: ['as_needed'], moments: [] },
            { title: 'Kardégic 75mg', units: ['mg'], freq: ['1x_day'], moments: ['morning'] },
            { title: 'Dafalgan Codéine', units: ['mg', 'cp'], freq: ['1x_day', '2x_day', '3x_day', 'as_needed'], moments: ['morning', 'noon', 'evening'] },
            { title: 'Séance Kinésithérapie', units: ['seance'], freq: ['2x_week', '3x_week'], moments: ['morning', 'noon'] },
            { title: 'Séance Orthophonie', units: ['seance'], freq: ['weekly', '2x_week'], moments: [] },
            { title: 'Crème Dermocorticoïde', units: ['application'], freq: ['1x_day', '2x_day'], moments: ['morning', 'evening'] },
            { title: 'Collyre antibiotique', units: ['gouttes'], freq: ['3x_day', '4x_day'], moments: ['morning', 'noon', 'evening', 'bedtime'] },
            { title: 'Fer + Acide folique', units: ['mg', 'cp'], freq: ['1x_day'], moments: ['morning', 'fasting'] },
        ];

        let created = 0;
        let updated = 0;

        for (const t of treatments) {
            const customFieldsData = [
                { field_id: fieldIds.unites_dosage, value: t.units },
                { field_id: fieldIds.frequences, value: t.freq },
                { field_id: fieldIds.moments_prise, value: t.moments }
            ];

            const result = await Record.findOneAndUpdate(
                { entityId: entity._id, title: t.title },
                {
                    entityId: entity._id,
                    title: t.title,
                    status: 'published',
                    customFields: customFieldsData
                },
                { upsert: true, new: true }
            );

            if (result.createdAt && result.updatedAt &&
                Math.abs(result.createdAt.getTime() - result.updatedAt.getTime()) < 1000) {
                created++;
            } else {
                updated++;
            }
        }

        console.log(`✅ Treatments: ${created} created, ${updated} updated (total: ${treatments.length})`);

        // ════════════════════════════════════════════════════════════════
        // STEP 4 — Update prescription_v1 LineSchema
        // ════════════════════════════════════════════════════════════════
        const prescSchema = await LineSchema.findOne({ slug: 'prescription_v1' });
        if (prescSchema) {
            // Update treatment column with entity ID + dynamic filter config
            const treatmentCol = prescSchema.columns.find(c => c.key === 'treatment');
            if (treatmentCol) {
                treatmentCol.config.targetEntity = entity._id;
                // Map column keys → field IDs for dynamic filtering
                treatmentCol.config._dynamicFilterConfig = {
                    dosage: fieldIds.unites_dosage.toString(),
                    frequency: fieldIds.frequences.toString(),
                    moment: fieldIds.moments_prise.toString()
                };
                prescSchema.markModified('columns');
                await prescSchema.save();
                console.log('✅ prescription_v1 updated with _dynamicFilterConfig');
            } else {
                console.log('⚠️  Column "treatment" not found in prescription_v1');
            }
        } else {
            console.log('⚠️  prescription_v1 not found — run seed-line-schemas.js first');
        }

        // ── Summary ──
        console.log('\n📋 Reference IDs:');
        console.log(`   Entity "Traitement": ${entity._id}`);
        for (const [name, id] of Object.entries(fieldIds)) {
            console.log(`   FieldTemplate "${name}": ${id}`);
        }
        console.log(`\n🎉 Seed completed! See: http://localhost:3000/account/${accountNumber}/field-template/list`);

        await tenantConn.close();
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

seed();
