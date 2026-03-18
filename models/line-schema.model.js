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
          number:    { unit: "mUI/L", normalRange: { min: 0.4, max: 4.0 }, decimals: 2 }
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

    // ══ Input & Data Mode ══
    inputMode: {
        type: String,
        enum: ['catalog', 'form', 'table', 'document'],
        default: 'catalog'
        // catalog  = bulk select from source entity (current behavior)
        // form     = simple form per entry (pediatric tracking, pregnancy)
        // table    = inline spreadsheet editing (lab results)
        // document = embedded block in document editor (printable invoice)
    },
    dataMode: {
        type: String,
        enum: ['items', 'timeseries'],
        default: 'items'
        // items      = each line is a different item (invoice, prescription)
        // timeseries = each line is a point in time (medical tracking)
    },

    // ══ Timeseries Config (when dataMode = 'timeseries') ══
    timeseriesConfig: {
        dateColumn: String,           // Key of the date column
        autoDate: { type: Boolean, default: true },  // Auto-fill date on new entry
        sortDirection: { type: String, enum: ['asc', 'desc'], default: 'desc' },
        displayAs: { type: String, enum: ['cards', 'table', 'timeline'], default: 'cards' }
    },

    // ══ Analytics / Visualizations ══
    analyticsConfig: {
        enabled: { type: Boolean, default: false },
        views: [{
            id: String,
            type: { type: String, enum: ['timeline', 'line', 'bar', 'area', 'stat', 'heatmap', 'gauge'] },
            label: String,
            icon: String,
            config: mongoose.Schema.Types.Mixed
            // line/bar/area: { xAxis, yAxes: [{column, color, label, axis}], normalRange, showTrend }
            // stat:          { cards: [{column, aggregation, label, unit, icon}] }
            // timeline:      { dateColumn, groupBy }
            // heatmap:       { dateColumn, valueColumn, colorScale }
            // gauge:         { column, min, max, normalRange, unit }
        }],
        defaultView: String
    },

    // ══ Context ══
    // Context: which entities or document type use this schema
    appliesTo: {
        entityIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Entity' }],
        documentType: String                        // "invoice","quote","prescription"
    },

    // Source: which entity to search catalog items from (e.g. "Traitements", "Produits")
    sourceEntityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entity' },

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

    // ══ Snapshot / Enregistrement Config ══
    snapshotConfig: {
        enabled: { type: Boolean, default: false },
        targetType: {
            type: String,
            enum: ['self', 'relation'],
            default: 'self'
            // self     = snapshot is linked to the current record
            // relation = snapshot is linked to a related record (e.g. Patient)
        },
        targetRelationKey: String,   // UUID key from entity.relations[].key (when targetType = 'relation')
        targetEntityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entity' }
    },

    defaultLineType: String,

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Index for efficient lookups
LineSchemaSchema.index({ slug: 1 });
LineSchemaSchema.index({ 'appliesTo.entityIds': 1 });
LineSchemaSchema.index({ 'appliesTo.documentType': 1 });

module.exports = mongoose.model('LineSchema', LineSchemaSchema);
