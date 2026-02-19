/**
 * Space Template Controller
 * ───────────────────────────
 * CRUD for preconfigured space templates.
 * Templates are stored in the GLOBAL SaaS DB (not tenant).
 * SuperAdmin manages them via /superadmin/space-templates.
 */
const SpaceTemplate = require('../models/space-template.model');
const EntityTemplate = require('../models/entity-template.model');

module.exports = {
    // ── SuperAdmin: List page ────────────────────────────
    listPage: async (req, res) => {
        try {
            const [templates, entityTemplates] = await Promise.all([
                SpaceTemplate.find().sort({ order: 1, createdAt: -1 }),
                EntityTemplate.find({ active: true }).sort({ name: 1 }).lean()
            ]);
            res.render('superadmin/sa-space-templates', {
                layout: 'layout-superadmin',
                user: req.user,
                templates,
                entityTemplates,
                categories: [
                    { key: 'general', label: 'Général', icon: 'solar:box-bold-duotone', color: '#4361ee' },
                    { key: 'crm', label: 'CRM', icon: 'solar:users-group-rounded-bold-duotone', color: '#00ab55' },
                    { key: 'project', label: 'Gestion de projet', icon: 'solar:checklist-bold-duotone', color: '#e7515a' },
                    { key: 'hr', label: 'RH', icon: 'solar:user-id-bold-duotone', color: '#805dca' },
                    { key: 'finance', label: 'Finance', icon: 'solar:wallet-bold-duotone', color: '#e2a03f' },
                    { key: 'medical', label: 'Médical', icon: 'solar:health-bold-duotone', color: '#2196f3' },
                    { key: 'education', label: 'Éducation', icon: 'solar:square-academic-cap-bold-duotone', color: '#3b82f6' },
                    { key: 'logistics', label: 'Logistique', icon: 'solar:box-minimalistic-bold-duotone', color: '#f97316' },
                    { key: 'productivity', label: 'Productivité', icon: 'solar:clipboard-check-bold-duotone', color: '#10b981' },
                    { key: 'content', label: 'Contenu', icon: 'solar:document-text-bold-duotone', color: '#06b6d4' },
                    { key: 'communication', label: 'Communication', icon: 'solar:chat-round-dots-bold-duotone', color: '#ec4899' },
                    { key: 'custom', label: 'Personnalisé', icon: 'solar:settings-bold-duotone', color: '#94a3b8' }
                ]
            });
        } catch (err) {
            console.error('[SpaceTemplates] listPage error:', err);
            res.status(500).render('errors/500', { message: 'Erreur serveur', layout: 'layout-superadmin' });
        }
    },

    // ── API: List all templates ──────────────────────────
    listApi: async (req, res) => {
        try {
            const filter = { active: true };
            if (req.query.category) filter.category = req.query.category;
            const templates = await SpaceTemplate.find(filter).sort({ featured: -1, order: 1, usageCount: -1 });
            res.json({ success: true, templates });
        } catch (err) {
            console.error('[SpaceTemplates] listApi error:', err);
            res.status(500).json({ error: err.message });
        }
    },

    // ── API: Get single template ─────────────────────────
    getApi: async (req, res) => {
        try {
            const template = await SpaceTemplate.findById(req.params.id);
            if (!template) return res.status(404).json({ error: 'Template not found' });
            res.json({ success: true, template });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // ── API: Create template ─────────────────────────────
    createApi: async (req, res) => {
        try {
            const { name, slug, description, icon, color, category, tags,
                entities, relations, defaultViews, active, featured, order } = req.body;

            if (!name) return res.status(400).json({ error: 'Le nom est requis' });

            const finalSlug = slug || name.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');

            const existing = await SpaceTemplate.findOne({ slug: finalSlug });
            if (existing) return res.status(400).json({ error: `Le slug "${finalSlug}" existe déjà.` });

            const template = new SpaceTemplate({
                name, slug: finalSlug, description, icon, color,
                category: category || 'general',
                tags: tags || [],
                entities: entities || [],
                relations: relations || [],
                defaultViews: defaultViews || [],
                active: active !== false,
                featured: featured || false,
                order: order || 0,
                createdBy: req.user?._id
            });

            await template.save();
            res.json({ success: true, template });
        } catch (err) {
            console.error('[SpaceTemplates] createApi error:', err);
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

            if (update.slug) {
                const existing = await SpaceTemplate.findOne({ slug: update.slug, _id: { $ne: id } });
                if (existing) return res.status(400).json({ error: `Le slug "${update.slug}" existe déjà.` });
            }

            const template = await SpaceTemplate.findByIdAndUpdate(id, update, { new: true, runValidators: true });
            if (!template) return res.status(404).json({ error: 'Template not found' });

            res.json({ success: true, template });
        } catch (err) {
            console.error('[SpaceTemplates] updateApi error:', err);
            res.status(500).json({ error: err.message });
        }
    },

    // ── API: Delete template ─────────────────────────────
    deleteApi: async (req, res) => {
        try {
            const template = await SpaceTemplate.findByIdAndDelete(req.params.id);
            if (!template) return res.status(404).json({ error: 'Template not found' });
            res.json({ success: true });
        } catch (err) {
            console.error('[SpaceTemplates] deleteApi error:', err);
            res.status(500).json({ error: err.message });
        }
    },

    // ── API: Duplicate template ──────────────────────────
    duplicateApi: async (req, res) => {
        try {
            const source = await SpaceTemplate.findById(req.params.id);
            if (!source) return res.status(404).json({ error: 'Template not found' });

            const obj = source.toObject();
            delete obj._id;
            delete obj.__v;
            obj.name = `${source.name} (copie)`;
            obj.slug = `${source.slug}-copy-${Date.now()}`;
            obj.usageCount = 0;
            obj.createdBy = req.user?._id;

            const duplicate = new SpaceTemplate(obj);
            await duplicate.save();

            res.json({ success: true, template: duplicate });
        } catch (err) {
            console.error('[SpaceTemplates] duplicateApi error:', err);
            res.status(500).json({ error: err.message });
        }
    }
};
