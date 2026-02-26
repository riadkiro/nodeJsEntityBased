/**
 * preset.controller.js
 * Handles the "Modèles prédéfinis d'app" page + install API
 */
const mongoose = require('mongoose');
const { installPreset, PRESETS } = require('../scripts/seed-app-presets');

module.exports = {
    /**
     * GET /account/:account_number/app-presets
     * Render the presets page
     */
    list: async (req, res) => {
        try {
            res.render('presets/app-presets', {
                account_number: req.account_number,
                layout: 'layout-app',
                presets: PRESETS
            });
        } catch (err) {
            console.error('[Presets] Error:', err);
            res.status(500).send('Erreur serveur');
        }
    },

    /**
     * POST /account/:account_number/api/app-presets/install
     * Install a preset (factory reset)
     */
    install: async (req, res) => {
        try {
            const { presetSlug } = req.body;
            if (!presetSlug) return res.status(400).json({ error: 'presetSlug is required' });

            const preset = PRESETS.find(p => p.slug === presetSlug);
            if (!preset) return res.status(404).json({ error: `Preset "${presetSlug}" not found` });

            const tenantDbName = `saas_app_rb_${req.account_number}`;
            const userId = req.user._id.toString();

            await installPreset({
                tenantDbName,
                presetSlug,
                userId,
                mode: 'factoryReset'
            });

            res.json({ success: true, message: `Preset "${preset.name}" installé avec succès` });
        } catch (err) {
            console.error('[Presets] Install error:', err);
            res.status(500).json({ error: err.message });
        }
    }
};
