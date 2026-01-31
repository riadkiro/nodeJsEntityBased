const mongoose = require('mongoose');

/**
 * FieldType - Types de champs de base (admin-only, global DB)
 * 
 * Ces types sont les composants techniques de base :
 * - string, number, date, select, relation, etc.
 * 
 * La Bibliothèque de champs (FieldTemplate) utilise ces types
 * pour créer des presets prêts à l'emploi (Email, Téléphone, etc.)
 */
const FieldTypeSchema = new mongoose.Schema({
    // 🧾 Identification
    name: {
        type: String,
        required: true,
        unique: true
    }, // clé technique: 'string', 'number', 'date'

    label: {
        type: String,
        required: true
    }, // affichage: 'Texte court', 'Nombre', 'Date'

    description: { type: String },

    // 🎨 UI
    icon: { type: String, default: 'solar:widget-bold-duotone' },
    color: { type: String },

    // 📂 Catégorie
    category: {
        type: String,
        enum: ['text', 'numeric', 'date', 'choice', 'relation', 'media', 'advanced'],
        default: 'text'
    },

    // ⚙️ Configuration technique
    inputComponent: { type: String }, // Composant d'input (si custom)
    displayComponent: { type: String }, // Composant d'affichage

    // Valeurs par défaut pour ce type
    defaultConfig: {
        type: Object,
        default: {}
    },

    // Règles de validation disponibles pour ce type
    availableValidations: [{
        name: String,     // 'minLength', 'maxLength', 'regex', etc.
        label: String,
        valueType: String      // 'number', 'string', 'boolean'
    }],

    // 🔧 Sous-types disponibles
    subtypes: [{
        name: String,     // 'email', 'tel', 'url', 'currency', 'percent'
        label: String,
        icon: String,
        validation: Object // regex, format, etc.
    }],

    // 🎛️ Options UI par défaut
    defaultUIOptions: {
        width: { type: String, enum: ['full', 'half', 'third'], default: 'full' },
        placeholder: { type: String }
    },

    // 📊 Filterable options
    filterOperators: {
        type: [String],
        default: ['equals']
    },

    // 🔄 État
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }

}, { timestamps: true });

// Index pour recherche rapide
FieldTypeSchema.index({ name: 1 });
FieldTypeSchema.index({ category: 1 });

module.exports = mongoose.model('FieldType', FieldTypeSchema);
