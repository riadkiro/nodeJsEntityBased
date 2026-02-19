const mongoose = require('mongoose');

/**
 * SpaceTemplate — Preconfigured workspace (space) templates stored in the GLOBAL SaaS DB.
 * SuperAdmins create/edit these. Tenants can choose them when creating new spaces.
 * 
 * A space template defines:
 * - The space identity (name, icon, color, description)
 * - Which entity templates to include (by slug reference)
 * - Relations between entities
 * - Default views and configurations
 */
const SpaceTemplateSchema = new mongoose.Schema({
    // ── Identification ──────────────────────────────────
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },

    // ── Visual ──────────────────────────────────────────
    icon: { type: String, default: 'solar:widget-bold-duotone' },
    color: { type: String, default: '#4361ee' },
    image: { type: String, default: '' },

    // ── Category / Tags for filtering in UI ─────────────
    category: {
        type: String,
        enum: ['general', 'crm', 'project', 'hr', 'finance', 'medical', 'education', 'logistics', 'custom', 'productivity', 'content', 'communication'],
        default: 'general'
    },
    tags: [String],

    // ── Entity Templates included in this space ─────────
    entities: [{
        templateSlug: { type: String, required: true }, // reference to EntityTemplate.slug
        name: { type: String },       // override name for this space context
        icon: { type: String },       // override icon
        color: { type: String },      // override color
        isMain: { type: Boolean, default: false },  // main entity shown first
        order: { type: Number, default: 0 }
    }],

    // ── Relations between entities ──────────────────────
    relations: [{
        from: { type: String, required: true },     // entity templateSlug
        to: { type: String, required: true },       // entity templateSlug
        type: {
            type: String,
            enum: ['one-to-many', 'many-to-one', 'many-to-many', 'one-to-one'],
            default: 'one-to-many'
        },
        fieldName: { type: String },   // field name on the "from" entity
        label: { type: String }        // human-readable label
    }],

    // ── Default views ──────────────────────────────────
    defaultViews: [{
        entitySlug: { type: String },
        viewType: {
            type: String,
            enum: ['table', 'kanban', 'calendar', 'gallery', 'list'],
            default: 'table'
        }
    }],

    // ── Metadata ────────────────────────────────────────
    active: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    usageCount: { type: Number, default: 0 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

SpaceTemplateSchema.index({ active: 1, order: 1 });
SpaceTemplateSchema.index({ category: 1 });
SpaceTemplateSchema.index({ slug: 1 }, { unique: true });

module.exports = mongoose.model('SpaceTemplate', SpaceTemplateSchema);
