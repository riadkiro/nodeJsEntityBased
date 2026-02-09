const mongoose = require('mongoose');

// ============================================
// Column Schema (embedded in LineSchema)
// ============================================
const ColumnSchema = new mongoose.Schema({
    key: { type: String, required: true },          // "item", "qty", "unitPrice"
    label: { type: String, required: true },        // "Article", "Quantité"
    type: {
        type: String,
        enum: [
            'text', 'number', 'money', 'select', 'multiselect', 'relation',
            'duration', 'dosage', 'formula', 'date', 'textarea'
        ],
        required: true
    },
    required: { type: Boolean, default: false },
    visible: { type: Boolean, default: true },
    width: {
        type: String,
        enum: ['XS', 'S', 'M', 'L', 'XL'],
        default: 'M'
    },
    order: { type: Number, default: 0 },

    // Conditional visibility per lineType
    showWhen: {
        lineType: [String]                          // e.g. ["product","service"]
    },

    // Type-specific configuration
    config: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
        /*
          select/multiselect: { source: "manual", options: [{value, label, group?}] }
          relation:  { targetEntity: ObjectId, searchFields: [...], displayFields: [...],
                       applyDefaults: { unitPrice: "cf.price", vatRate: "cf.vatRate" } }
          duration:  { units: ["day","week","month"] }
          dosage:    { units: ["mg","ml","g","cp","gouttes"] }
          formula:   { expression: "qty * unitPrice * (1 - discount/100)", dependencies: ["qty","unitPrice","discount"] }
          money:     { currency: "EUR", decimals: 2 }
        */
    }
}, { _id: true });

// ============================================
// LineSchema Model
// ============================================
const LineSchemaSchema = new mongoose.Schema({
    name: { type: String, required: true },         // "Facture Standard"
    slug: { type: String, required: true },         // "invoice_v1"
    description: String,

    // Context: which entity or document type uses this schema
    appliesTo: {
        entityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entity' },
        documentType: String                        // "invoice","quote","prescription"
    },

    // Available line types for this schema
    lineTypes: {
        type: [String],
        default: ['product']
    },

    // Column definitions
    columns: [ColumnSchema],

    // Totals configuration (V1: key-based SUM)
    totals: {
        subtotalKey: String,                        // key of column to SUM for subtotal (e.g. "lineTotal")
        vatKey: String,                             // key of column to SUM for VAT (e.g. "lineVat")
        totalFormula: String                        // e.g. "subtotal + vat"
    },

    defaultLineType: String,

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Index for efficient lookups
LineSchemaSchema.index({ slug: 1 });
LineSchemaSchema.index({ 'appliesTo.entityId': 1 });
LineSchemaSchema.index({ 'appliesTo.documentType': 1 });

module.exports = mongoose.model('LineSchema', LineSchemaSchema);
