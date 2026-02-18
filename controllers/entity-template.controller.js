/**
 * Entity Template Controller
 * ───────────────────────────
 * CRUD for preconfigured entity templates.
 * Templates are stored in the GLOBAL SaaS DB (not tenant).
 * SuperAdmin manages them via /superadmin/entity-templates.
 * Tenants read them via /account/:num/api/entity-templates.
 */
const EntityTemplate = require('../models/entity-template.model');

module.exports = {
    // ── SuperAdmin: List page ────────────────────────────
    listPage: async (req, res) => {
        try {
            const templates = await EntityTemplate.find().sort({ order: 1, createdAt: -1 });
            res.render('superadmin/sa-entity-templates', {
                layout: 'layout-superadmin',
                user: req.user,
                templates,
                categories: [
                    { key: 'general', label: 'Général', icon: 'solar:box-bold-duotone', color: '#4361ee' },
                    { key: 'crm', label: 'CRM', icon: 'solar:users-group-rounded-bold-duotone', color: '#00ab55' },
                    { key: 'project', label: 'Projet', icon: 'solar:checklist-bold-duotone', color: '#e7515a' },
                    { key: 'hr', label: 'RH', icon: 'solar:user-id-bold-duotone', color: '#805dca' },
                    { key: 'finance', label: 'Finance', icon: 'solar:wallet-bold-duotone', color: '#e2a03f' },
                    { key: 'medical', label: 'Médical', icon: 'solar:health-bold-duotone', color: '#2196f3' },
                    { key: 'education', label: 'Éducation', icon: 'solar:square-academic-cap-bold-duotone', color: '#3b82f6' },
                    { key: 'logistics', label: 'Logistique', icon: 'solar:box-minimalistic-bold-duotone', color: '#f97316' },
                    { key: 'custom', label: 'Personnalisé', icon: 'solar:settings-bold-duotone', color: '#94a3b8' }
                ]
            });
        } catch (err) {
            console.error('[EntityTemplates] listPage error:', err);
            res.status(500).render('errors/500', { message: 'Erreur serveur', layout: 'layout-superadmin' });
        }
    },

    // ── API: List all templates ──────────────────────────
    listApi: async (req, res) => {
        try {
            const filter = { active: true };
            if (req.query.category) filter.category = req.query.category;
            const templates = await EntityTemplate.find(filter).sort({ featured: -1, order: 1, usageCount: -1 });
            res.json({ success: true, templates });
        } catch (err) {
            console.error('[EntityTemplates] listApi error:', err);
            res.status(500).json({ error: err.message });
        }
    },

    // ── API: Get single template ─────────────────────────
    getApi: async (req, res) => {
        try {
            const template = await EntityTemplate.findById(req.params.id);
            if (!template) return res.status(404).json({ error: 'Template not found' });
            res.json({ success: true, template });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // ── API: Create template ─────────────────────────────
    createApi: async (req, res) => {
        try {
            const { name, slug, description, icon, color, image, category, tags,
                enabledStandardFields, fields, classifications, referenceTitleTokens,
                active, featured, order } = req.body;

            if (!name) return res.status(400).json({ error: 'Le nom est requis' });

            // Auto-generate slug if not provided
            const finalSlug = slug || name.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');

            // Check slug uniqueness
            const existing = await EntityTemplate.findOne({ slug: finalSlug });
            if (existing) return res.status(400).json({ error: `Le slug "${finalSlug}" existe déjà.` });

            const template = new EntityTemplate({
                name, slug: finalSlug, description, icon, color, image,
                category: category || 'general',
                tags: tags || [],
                enabledStandardFields: enabledStandardFields || ['title'],
                fields: fields || [],
                classifications: classifications || [],
                referenceTitleTokens: referenceTitleTokens || [{ t: 'field', id: 'title' }],
                active: active !== false,
                featured: featured || false,
                order: order || 0,
                createdBy: req.user?._id
            });

            await template.save();
            res.json({ success: true, template });
        } catch (err) {
            console.error('[EntityTemplates] createApi error:', err);
            if (err.code === 11000) {
                return res.status(400).json({ error: 'Ce slug existe déjà.' });
            }
            res.status(500).json({ error: err.message });
        }
    },

    // ── API: Update template ─────────────────────────────
    updateApi: async (req, res) => {
        try {
            const { id } = req.params;
            const update = req.body;

            // Check slug uniqueness if changing
            if (update.slug) {
                const existing = await EntityTemplate.findOne({ slug: update.slug, _id: { $ne: id } });
                if (existing) return res.status(400).json({ error: `Le slug "${update.slug}" existe déjà.` });
            }

            const template = await EntityTemplate.findByIdAndUpdate(id, update, { new: true, runValidators: true });
            if (!template) return res.status(404).json({ error: 'Template not found' });

            res.json({ success: true, template });
        } catch (err) {
            console.error('[EntityTemplates] updateApi error:', err);
            res.status(500).json({ error: err.message });
        }
    },

    // ── API: Delete template ─────────────────────────────
    deleteApi: async (req, res) => {
        try {
            const template = await EntityTemplate.findByIdAndDelete(req.params.id);
            if (!template) return res.status(404).json({ error: 'Template not found' });
            res.json({ success: true });
        } catch (err) {
            console.error('[EntityTemplates] deleteApi error:', err);
            res.status(500).json({ error: err.message });
        }
    },

    // ── API: Duplicate template ──────────────────────────
    duplicateApi: async (req, res) => {
        try {
            const source = await EntityTemplate.findById(req.params.id);
            if (!source) return res.status(404).json({ error: 'Template not found' });

            const obj = source.toObject();
            delete obj._id;
            delete obj.__v;
            obj.name = `${source.name} (copie)`;
            obj.slug = `${source.slug}-copy-${Date.now()}`;
            obj.usageCount = 0;
            obj.createdBy = req.user?._id;

            const duplicate = new EntityTemplate(obj);
            await duplicate.save();

            res.json({ success: true, template: duplicate });
        } catch (err) {
            console.error('[EntityTemplates] duplicateApi error:', err);
            res.status(500).json({ error: err.message });
        }
    },

    // ── API: Increment usage count (called when tenant uses a template) ──
    incrementUsage: async (req, res) => {
        try {
            await EntityTemplate.findByIdAndUpdate(req.params.id, { $inc: { usageCount: 1 } });
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};
