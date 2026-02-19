const mongoose = require('mongoose');

/**
 * EntityTemplate — Preconfigured entity models stored in the GLOBAL SaaS DB.
 * SuperAdmins create/edit these. Tenants can choose them when creating entities.
 * 
 * When a tenant picks a template, the template's fields, classifications,
 * standard fields etc. are copied into a new Entity in the tenant DB.
 */
const EntityTemplateSchema = new mongoose.Schema({
    // ── Identification ──────────────────────────────────
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },

    // ── Visual ──────────────────────────────────────────
    icon: { type: String, default: 'solar:box-bold-duotone' },
    color: { type: String, default: '#4361ee' },
    image: { type: String, default: '' },

    // ── Category / Tags for filtering in UI ─────────────
    category: {
        type: String,
        enum: ['general', 'crm', 'project', 'hr', 'finance', 'medical', 'education', 'logistics', 'custom', 'productivity', 'content', 'system', 'communication'],
        default: 'general'
    },
    tags: [String], // e.g. ['contacts', 'people', 'sales']

    // ── Template Data (what gets cloned) ────────────────
    // Standard fields to enable
    enabledStandardFields: {
        type: [String],
        default: ['title']
    },

    // Custom field definitions (embedded, not ObjectId refs — because templates are global)
    fields: [{
        name: { type: String, required: true },       // technical key
        label: { type: String, required: true },       // display label
        description: { type: String, default: '' },
        type: { type: String, default: 'string' },     // string, number, select, date, boolean, etc.
        subtype: { type: String },                      // email, tel, url, etc.
        category: {
            type: String,
            enum: ['popular', 'text', 'numeric', 'date', 'dates', 'choice', 'relation', 'media', 'computed', 'advanced', 'content', 'finance', 'pro', 'workflow', 'other'],
            default: 'text'
        },
        icon: { type: String, default: 'solar:widget-bold' },
        required: { type: Boolean, default: false },
        typeConfig: { type: mongoose.Schema.Types.Mixed, default: {} },
        ui: {
            placeholder: String,
            width: { type: String, enum: ['full', 'half', 'third'], default: 'full' },
            order: { type: Number, default: 0 }
        }
    }],

    // Classification templates (embedded definitions)
    classifications: [{
        name: { type: String, required: true },
        slug: { type: String },
        type: { type: String, enum: ['status', 'priority', 'tag', 'category'], default: 'status' },
        isStatus: { type: Boolean, default: false }, // if true, used as Kanban driver
        options: [{
            label: { type: String, required: true },
            value: String,
            color: { type: String, default: '#4361ee' },
            icon: String,
            order: { type: Number, default: 0 }
        }]
    }],

    // Reference title format
    referenceTitleTokens: {
        type: [{
            t: { type: String, enum: ['field', 'text'], required: true },
            id: String,
            v: String
        }],
        default: [{ t: 'field', id: 'title' }]
    },

    // ── Metadata ────────────────────────────────────────
    active: { type: Boolean, default: true },
    featured: { type: Boolean, default: false }, // show first in template picker
    order: { type: Number, default: 0 },
    usageCount: { type: Number, default: 0 }, // track how many times used

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

EntityTemplateSchema.index({ active: 1, order: 1 });
EntityTemplateSchema.index({ category: 1 });
EntityTemplateSchema.index({ slug: 1 }, { unique: true });

module.exports = mongoose.model('EntityTemplate', EntityTemplateSchema);
