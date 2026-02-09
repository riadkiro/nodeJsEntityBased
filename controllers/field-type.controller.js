const FieldType = require('../models/field-type.model');

module.exports = {
    /**
     * Liste des types de champs (page admin)
     */
    list: async (req, res) => {
        try {
            const fieldTypes = await FieldType.find({ isActive: true }).sort({ order: 1 });

            // Grouper par catégorie
            const categoryLabels = {
                text: 'Texte',
                numeric: 'Numérique',
                date: 'Date / Temps',
                choice: 'Choix',
                relation: 'Relation',
                media: 'Média',
                advanced: 'Avancé'
            };

            const grouped = {};
            for (const type of fieldTypes) {
                const cat = type.category || 'other';
                if (!grouped[cat]) {
                    grouped[cat] = {
                        key: cat,
                        label: categoryLabels[cat] || cat,
                        types: []
                    };
                }
                grouped[cat].types.push(type);
            }

            const categories = Object.values(grouped);

            res.render('field-type/field-type-list', {
                title: 'Types de champs',
                fieldTypes,
                categories,
                account_number: req.account_number,
                layout: 'layout-app'
            });
        } catch (error) {
            console.error('❌ Error fetching field types:', error);
            res.status(500).render('error', { message: error.message });
        }
    },

    /**
     * API: Liste des types de champs
     */
    list_Api: async (req, res) => {
        try {
            const fieldTypes = await FieldType.find({ isActive: true }).sort({ order: 1 });
            res.json(fieldTypes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * API: Détails d'un type
     */
    getById_Api: async (req, res) => {
        try {
            const fieldType = await FieldType.findById(req.params.id);
            if (!fieldType) {
                return res.status(404).json({ error: 'Type not found' });
            }
            res.json(fieldType);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * Formulaire d'ajout
     */
    add: async (req, res) => {
        res.render('field-type/field-type-add', {
            title: 'Nouveau type de champ',
            account_number: req.account_number,
            layout: 'layout-app'
        });
    },

    /**
     * Création d'un type
     */
    create: async (req, res) => {
        try {
            // Parse filterOperators from comma-separated string
            if (typeof req.body.filterOperators === 'string') {
                req.body.filterOperators = req.body.filterOperators.split(',').map(s => s.trim()).filter(Boolean);
            }
            const fieldType = new FieldType(req.body);
            await fieldType.save();

            res.redirect(`/account/${req.account_number}/field-type/list`);
        } catch (error) {
            console.error('❌ Error creating field type:', error);
            res.status(500).render('error', { message: error.message });
        }
    },

    /**
     * API: Création d'un type
     */
    create_Api: async (req, res) => {
        try {
            const fieldType = new FieldType(req.body);
            await fieldType.save();
            res.json({ success: true, fieldType });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * Formulaire de modification
     */
    edit: async (req, res) => {
        try {
            const fieldType = await FieldType.findById(req.params.id);
            if (!fieldType) {
                return res.status(404).render('error', { message: 'Type not found' });
            }
            res.render('field-type/field-type-edit', {
                title: 'Modifier le type',
                fieldType,
                account_number: req.account_number,
                layout: 'layout-app'
            });
        } catch (error) {
            res.status(500).render('error', { message: error.message });
        }
    },

    /**
     * Mise à jour d'un type
     */
    update: async (req, res) => {
        try {
            if (typeof req.body.filterOperators === 'string') {
                req.body.filterOperators = req.body.filterOperators.split(',').map(s => s.trim()).filter(Boolean);
            }
            await FieldType.findByIdAndUpdate(req.params.id, req.body);
            res.redirect(`/account/${req.account_number}/field-type/list`);
        } catch (error) {
            console.error('❌ Error updating field type:', error);
            res.status(500).render('error', { message: error.message });
        }
    },

    /**
     * API: Mise à jour d'un type
     */
    update_Api: async (req, res) => {
        try {
            const fieldType = await FieldType.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );
            res.json({ success: true, fieldType });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * Suppression d'un type
     */
    delete: async (req, res) => {
        try {
            await FieldType.findByIdAndDelete(req.params.id);
            res.redirect(`/account/${req.account_number}/field-type/list`);
        } catch (error) {
            console.error('❌ Error deleting field type:', error);
            res.status(500).render('error', { message: error.message });
        }
    },

    /**
     * API: Suppression d'un type
     */
    delete_Api: async (req, res) => {
        try {
            await FieldType.findByIdAndDelete(req.params.id);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};
