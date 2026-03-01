const mongoose = require('mongoose');

// ============================================
// GridSchemaTemplate Model
// Reusable preset templates for DataGrid schemas
// e.g. "Suivi Grossesse", "Facture récurrente", "Bilan sanguin complet"
// ============================================
const GridSchemaTemplateSchema = new mongoose.Schema({
    name: { type: String, required: true },              // "Suivi Grossesse"
    slug: { type: String, required: true },              // "suivi_grossesse"
    description: String,
    icon: { type: String, default: 'solar:clipboard-list-bold-duotone' },
    color: { type: String, default: '#4361ee' },

    // Reference to the GridSchema (LineSchema) this template is for
    schemaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LineSchema',
        required: true
    },

    // Preset rows to create when applying this template
    presetRows: [{
        lineType: { type: String, default: 'default' },
        values: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
            // e.g. { metric: "TSH", unit: "mUI/L", normalRange: "0.4-4.0" }
            // e.g. { item: null, qty: 1, unitPrice: 0, description: "Consultation" }
        },
        order: { type: Number, default: 0 }
    }],

    // For form mode: configure form layout
    formLayout: {
        columns: { type: Number, default: 3 },       // Number of columns in the form
        fieldOrder: [String]                           // Order of fields in form
    },

    // Scope
    scope: {
        type: String,
        enum: ['global', 'workspace', 'entity'],
        default: 'workspace'
    },

    // Tags for filtering/searching
    tags: [String],                                    // ["médical", "endocrinologie"]

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Indexes
GridSchemaTemplateSchema.index({ slug: 1 });
GridSchemaTemplateSchema.index({ schemaId: 1 });
GridSchemaTemplateSchema.index({ scope: 1 });
GridSchemaTemplateSchema.index({ tags: 1 });

module.exports = mongoose.model('GridSchemaTemplate', GridSchemaTemplateSchema);
