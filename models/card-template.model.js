const mongoose = require("mongoose");

/**
 * CardTemplate — Visual card template for entity views (Kanban, Calendar, etc.)
 * 
 * Each entity can have multiple card templates, one default per context.
 * The layout describes zones (header, body, footer) with typed elements.
 */

const CardElementSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: [
            'title',        // Record title (referenceTitle)
            'field',        // Custom field value
            'status',       // Status classification badge
            'date',         // Date display (formatted)
            'relation',     // Related record link
            'icon-value',   // Icon + value pair
            'badge',        // Colored badge
            'text',         // Static text
            'separator',    // Visual separator line
            'actions',      // Action buttons (edit, view, delete)
            'spacer',       // Flexible spacer
        ]
    },
    fieldId: String,         // FieldTemplate._id or special: '__description__', '__createdAt__', '__updatedAt__'
    label: String,           // Override label (if empty, uses field label)
    icon: String,            // Iconify icon name
    format: {
        type: String,
        default: 'text'
    },
    suffix: String,          // "min", "€", "%", etc.
    prefix: String,          // Prefix text
    maxLines: { type: Number, default: 0 },  // 0 = no clamp
    fontSize: {
        type: String,
        enum: ['xs', 'sm', 'base', 'lg'],
        default: 'sm'
    },
    fontWeight: {
        type: String,
        enum: ['normal', 'medium', 'semibold', 'bold'],
        default: 'normal'
    },
    color: String,           // CSS color or 'auto' (inherits from status/context)
    visible: { type: Boolean, default: true },
    items: [String],         // For 'actions' type: ['edit', 'view', 'delete', 'open', 'close']
}, { _id: false });

const CardZoneSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    direction: {
        type: String,
        enum: ['row', 'column'],
        default: 'column'
    },
    gap: { type: Number, default: 4 },
    padding: { type: String, default: '12px' },
    align: {
        type: String,
        enum: ['start', 'center', 'end', 'between', 'stretch'],
        default: 'start'
    },
    borderTop: { type: Boolean, default: false },
    borderBottom: { type: Boolean, default: false },
    elements: [CardElementSchema],
}, { _id: false });

const CardTemplateSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Entity",
            required: true,
        },
        context: {
            type: String,
            required: true,
            enum: ['kanban', 'calendar', 'list', 'universal', 'sidebar'],
            default: 'universal',
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
        presetSlug: String,   // For seed-generated cards (e.g. 'cabinet-medical')

        // Visual settings
        layout: {
            accentPosition: {
                type: String,
                enum: ['top', 'left', 'none'],
                default: 'none'
            },
            accentSource: {
                type: String,
                enum: ['status', 'fixed', 'none'],
                default: 'none'
            },
            accentColor: String,    // Fixed hex color
            borderRadius: { type: Number, default: 8 },
            shadow: {
                type: String,
                enum: ['none', 'sm', 'md', 'lg'],
                default: 'sm'
            },
            zones: [CardZoneSchema],
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

// Compound index: only one default per entity+context
CardTemplateSchema.index({ entityId: 1, context: 1 });

module.exports = mongoose.model("CardTemplate", CardTemplateSchema);
