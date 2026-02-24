/**
 * Seed Script - Créer Line Schemas (invoice_v1 + prescription_v1)
 *
 * Usage: node scripts/seed-line-schemas.js <account_number>
 */

const mongoose = require('mongoose');
const config = require('../config/db');

async function seed() {
    const accountNumber = process.argv[2];

    if (!accountNumber) {
        console.error('❌ Usage: node scripts/seed-line-schemas.js <account_number>');
        process.exit(1);
    }

    try {
        await mongoose.connect(config.globalDbUri);
        console.log('✅ Connected to main MongoDB');

        const tenantDbName = `saas_app_rb_${accountNumber}`;
        const tenantConnection = mongoose.createConnection(`${config.uri}${tenantDbName}`);
        console.log(`✅ Connected to tenant DB: ${tenantDbName}`);

        const LineSchemaModel = tenantConnection.model('LineSchema', require('../models/line-schema.model').schema);

        // ─── Delete existing demo schemas ─────────────────────────────
        const deleted = await LineSchemaModel.deleteMany({
            slug: { $in: ['invoice_v1', 'prescription_v1'] }
        });
        console.log(`🗑️  ${deleted.deletedCount} schemas supprimés`);

        // ═══════════════════════════════════════════════════════════════
        // Invoice V1
        // ═══════════════════════════════════════════════════════════════
        const invoiceSchema = new LineSchemaModel({
            name: 'Facture Standard',
            slug: 'invoice_v1',
            description: 'Schéma de lignes pour factures et devis',
            appliesTo: { entityIds: [], documentType: 'invoice' },  // empty = global (all entities)
            lineTypes: ['product', 'service', 'note'],
            defaultLineType: 'product',
            columns: [
                {
                    key: 'item',
                    label: 'Article',
                    type: 'relation',
                    required: true,
                    visible: true,
                    width: 'L',
                    order: 0,
                    showWhen: { lineType: ['product', 'service'] },
                    config: {
                        targetEntity: null,  // Will need to be updated with actual entity ID
                        searchFields: ['title'],
                        displayFields: ['title'],
                        applyDefaults: {
                            unitPrice: 'cf.price',
                            vatRate: 'cf.vatRate',
                            description: 'title'
                        }
                    }
                },
                {
                    key: 'description',
                    label: 'Description',
                    type: 'text',
                    required: false,
                    visible: true,
                    width: 'L',
                    order: 1,
                    config: {}
                },
                {
                    key: 'qty',
                    label: 'Qté',
                    type: 'number',
                    required: true,
                    visible: true,
                    width: 'XS',
                    order: 2,
                    showWhen: { lineType: ['product', 'service'] },
                    config: {}
                },
                {
                    key: 'unitPrice',
                    label: 'P.U. HT',
                    type: 'money',
                    required: true,
                    visible: true,
                    width: 'S',
                    order: 3,
                    showWhen: { lineType: ['product', 'service'] },
                    config: { currency: 'MAD', decimals: 2 }
                },
                {
                    key: 'discount',
                    label: 'Remise %',
                    type: 'number',
                    required: false,
                    visible: true,
                    width: 'XS',
                    order: 4,
                    showWhen: { lineType: ['product', 'service'] },
                    config: {}
                },
                {
                    key: 'vatRate',
                    label: 'TVA %',
                    type: 'number',
                    required: false,
                    visible: true,
                    width: 'XS',
                    order: 5,
                    showWhen: { lineType: ['product', 'service'] },
                    config: {}
                },
                {
                    key: 'lineTotal',
                    label: 'Total HT',
                    type: 'formula',
                    required: false,
                    visible: true,
                    width: 'S',
                    order: 6,
                    showWhen: { lineType: ['product', 'service'] },
                    config: {
                        expression: 'qty * unitPrice * (1 - discount / 100)',
                        dependencies: ['qty', 'unitPrice', 'discount']
                    }
                },
                {
                    key: 'lineVat',
                    label: 'TVA',
                    type: 'formula',
                    required: false,
                    visible: true,
                    width: 'S',
                    order: 7,
                    showWhen: { lineType: ['product', 'service'] },
                    config: {
                        expression: 'lineTotal * vatRate / 100',
                        dependencies: ['lineTotal', 'vatRate']
                    }
                },
                {
                    key: 'note',
                    label: 'Note',
                    type: 'textarea',
                    required: false,
                    visible: true,
                    width: 'XL',
                    order: 8,
                    showWhen: { lineType: ['note'] },
                    config: {}
                }
            ],
            totals: {
                subtotalKey: 'lineTotal',
                vatKey: 'lineVat',
                totalFormula: 'subtotal + vat'
            }
        });

        await invoiceSchema.save();
        console.log('✅ invoice_v1 créé');

        // ═══════════════════════════════════════════════════════════════
        // Prescription V1
        // ═══════════════════════════════════════════════════════════════
        const prescriptionSchema = new LineSchemaModel({
            name: 'Ordonnance Traitement',
            slug: 'prescription_v1',
            description: 'Schéma de lignes pour ordonnances médicales',
            appliesTo: { entityIds: [], documentType: 'prescription' },  // Set entity IDs after creation
            lineTypes: ['treatment', 'note'],
            defaultLineType: 'treatment',
            columns: [
                {
                    key: 'treatment',
                    label: 'Traitement',
                    type: 'relation',
                    required: true,
                    visible: true,
                    width: 'L',
                    order: 0,
                    showWhen: { lineType: ['treatment'] },
                    config: {
                        targetEntity: null,  // Will need actual entity ID
                        searchFields: ['title'],
                        displayFields: ['title'],
                        applyDefaults: {
                            description: 'title'
                        }
                    }
                },
                {
                    key: 'dosage',
                    label: 'Dosage',
                    type: 'dosage',
                    required: false,
                    visible: true,
                    width: 'S',
                    order: 1,
                    showWhen: { lineType: ['treatment'] },
                    config: {
                        units: ['mg', 'ml', 'g', 'cp', 'gouttes']
                    }
                },
                {
                    key: 'frequency',
                    label: 'Fréquence',
                    type: 'select',
                    required: false,
                    visible: true,
                    width: 'M',
                    order: 2,
                    showWhen: { lineType: ['treatment'] },
                    config: {
                        source: 'manual',
                        options: [
                            { value: '1x_day', label: '1x / jour' },
                            { value: '2x_day', label: '2x / jour' },
                            { value: '3x_day', label: '3x / jour' },
                            { value: '4x_day', label: '4x / jour' },
                            { value: 'every_6h', label: 'Toutes les 6h' },
                            { value: 'every_8h', label: 'Toutes les 8h' },
                            { value: 'every_12h', label: 'Toutes les 12h' },
                            { value: 'weekly', label: '1x / semaine' },
                            { value: 'as_needed', label: 'Si besoin' }
                        ]
                    }
                },
                {
                    key: 'moment',
                    label: 'Moment',
                    type: 'multiselect',
                    required: false,
                    visible: true,
                    width: 'M',
                    order: 3,
                    showWhen: { lineType: ['treatment'] },
                    config: {
                        source: 'manual',
                        options: [
                            { value: 'morning', label: 'Matin' },
                            { value: 'noon', label: 'Midi' },
                            { value: 'evening', label: 'Soir' },
                            { value: 'bedtime', label: 'Au coucher' },
                            { value: 'before_meal', label: 'Avant repas' },
                            { value: 'after_meal', label: 'Après repas' },
                            { value: 'fasting', label: 'À jeun' }
                        ]
                    }
                },
                {
                    key: 'duration',
                    label: 'Durée',
                    type: 'duration',
                    required: false,
                    visible: true,
                    width: 'S',
                    order: 4,
                    showWhen: { lineType: ['treatment'] },
                    config: {
                        units: ['day', 'week', 'month']
                    }
                },
                {
                    key: 'instructions',
                    label: 'Instructions',
                    type: 'textarea',
                    required: false,
                    visible: true,
                    width: 'L',
                    order: 5,
                    config: {}
                }
            ],
            totals: {}
        });

        await prescriptionSchema.save();
        console.log('✅ prescription_v1 créé');

        console.log('\n🎉 Line Schemas seeded avec succès!');
        console.log(`\n📊 Voir: http://localhost:3000/account/${accountNumber}/line-schemas`);

        await tenantConnection.close();
        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

seed();
