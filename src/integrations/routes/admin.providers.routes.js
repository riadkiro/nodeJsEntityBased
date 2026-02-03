/**
 * Admin Providers Routes
 * CRUD operations for integration providers (global, not tenant-specific)
 */

const express = require('express');
const router = express.Router();

// Import model directly (admin uses global connection)
const IntegrationProvider = require('../models/IntegrationProvider.model');
const IntegrationAction = require('../models/IntegrationAction.model');

/**
 * GET /integrations/admin/providers
 * List all providers
 */
router.get('/providers', async (req, res) => {
    try {
        const providers = await IntegrationProvider.find()
            .sort({ category: 1, name: 1 })
            .lean();

        // Render page or return JSON based on Accept header
        if (req.accepts('html')) {
            res.render('integrations/admin/providers-list', {
                layout: 'layout-app',
                providers,
                account_number: req.account_number
            });
        } else {
            res.json({ success: true, providers });
        }
    } catch (error) {
        console.error('[Admin Providers] List error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /integrations/admin/providers/new
 * New provider form
 */
router.get('/providers/new', async (req, res) => {
    res.render('integrations/admin/provider-edit', {
        layout: 'layout-app',
        provider: null,
        isNew: true,
        account_number: req.account_number
    });
});

/**
 * GET /integrations/admin/providers/:key
 * Get single provider for editing
 */
router.get('/providers/:key', async (req, res) => {
    try {
        const provider = await IntegrationProvider.findOne({ key: req.params.key }).lean();

        if (!provider) {
            return res.status(404).json({ success: false, error: 'Provider not found' });
        }

        // Get actions for this provider
        const actions = await IntegrationAction.find({ providerKey: req.params.key })
            .sort({ name: 1 })
            .lean();

        if (req.accepts('html')) {
            res.render('integrations/admin/provider-edit', {
                layout: 'layout-app',
                provider,
                actions,
                isNew: false,
                account_number: req.account_number
            });
        } else {
            res.json({ success: true, provider, actions });
        }
    } catch (error) {
        console.error('[Admin Providers] Get error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /integrations/admin/providers
 * Create new provider
 */
router.post('/providers', async (req, res) => {
    try {
        const {
            key,
            name,
            logo,
            category,
            baseUrl,
            authType,
            authInjection,
            defaultHeaders,
            status
        } = req.body;

        // Validate key format
        if (!/^[a-z0-9-]+$/.test(key)) {
            return res.status(400).json({
                success: false,
                error: 'Key must contain only lowercase letters, numbers, and hyphens'
            });
        }

        // Check for duplicate
        const existing = await IntegrationProvider.findOne({ key });
        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'A provider with this key already exists'
            });
        }

        const provider = await IntegrationProvider.create({
            key,
            name,
            logo,
            category: category || 'other',
            baseUrl,
            authType: authType || 'none',
            authInjection: authInjection || {},
            defaultHeaders: defaultHeaders || {},
            status: status || 'draft'
        });

        res.status(201).json({ success: true, provider });
    } catch (error) {
        console.error('[Admin Providers] Create error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /integrations/admin/providers/:key
 * Update provider
 */
router.put('/providers/:key', async (req, res) => {
    try {
        const {
            name,
            logo,
            category,
            baseUrl,
            authType,
            authInjection,
            defaultHeaders,
            testActionId
        } = req.body;

        const provider = await IntegrationProvider.findOneAndUpdate(
            { key: req.params.key },
            {
                name,
                logo,
                category,
                baseUrl,
                authType,
                authInjection,
                defaultHeaders,
                testActionId
            },
            { new: true }
        );

        if (!provider) {
            return res.status(404).json({ success: false, error: 'Provider not found' });
        }

        res.json({ success: true, provider });
    } catch (error) {
        console.error('[Admin Providers] Update error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /integrations/admin/providers/:key
 * Delete provider and its actions
 */
router.delete('/providers/:key', async (req, res) => {
    try {
        const provider = await IntegrationProvider.findOneAndDelete({ key: req.params.key });

        if (!provider) {
            return res.status(404).json({ success: false, error: 'Provider not found' });
        }

        // Delete associated actions
        await IntegrationAction.deleteMany({ providerKey: req.params.key });

        res.json({ success: true, message: 'Provider and actions deleted' });
    } catch (error) {
        console.error('[Admin Providers] Delete error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /integrations/admin/providers/:key/publish
 * Publish provider
 */
router.post('/providers/:key/publish', async (req, res) => {
    try {
        const provider = await IntegrationProvider.findOneAndUpdate(
            { key: req.params.key },
            { status: 'published' },
            { new: true }
        );

        if (!provider) {
            return res.status(404).json({ success: false, error: 'Provider not found' });
        }

        res.json({ success: true, provider });
    } catch (error) {
        console.error('[Admin Providers] Publish error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /integrations/admin/providers/:key/unpublish
 * Unpublish provider
 */
router.post('/providers/:key/unpublish', async (req, res) => {
    try {
        const provider = await IntegrationProvider.findOneAndUpdate(
            { key: req.params.key },
            { status: 'draft' },
            { new: true }
        );

        if (!provider) {
            return res.status(404).json({ success: false, error: 'Provider not found' });
        }

        res.json({ success: true, provider });
    } catch (error) {
        console.error('[Admin Providers] Unpublish error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
