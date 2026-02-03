/**
 * Admin Actions Routes
 * CRUD operations for integration actions
 * Uses MongoDB _id for mutations (not actionKey)
 */

const express = require('express');
const router = express.Router();

const IntegrationProvider = require('../models/IntegrationProvider.model');
const IntegrationAction = require('../models/IntegrationAction.model');
const IntegrationService = require('../services/IntegrationService');

/**
 * GET /integrations/admin/providers/:key/actions
 * List actions for a provider
 */
router.get('/providers/:key/actions', async (req, res) => {
    try {
        const provider = await IntegrationProvider.findOne({ key: req.params.key }).lean();
        if (!provider) {
            return res.status(404).json({ success: false, error: 'Provider not found' });
        }

        const actions = await IntegrationAction.find({ providerKey: req.params.key })
            .sort({ name: 1 })
            .lean();

        if (req.accepts('html')) {
            res.render('integrations/admin/actions-list', {
                layout: 'layout-app',
                provider,
                actions,
                account_number: req.account_number
            });
        } else {
            res.json({ success: true, actions });
        }
    } catch (error) {
        console.error('[Admin Actions] List error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /integrations/admin/providers/:key/actions/new
 * New action form
 */
router.get('/providers/:key/actions/new', async (req, res) => {
    try {
        const provider = await IntegrationProvider.findOne({ key: req.params.key }).lean();
        if (!provider) {
            return res.status(404).send('Provider not found');
        }

        res.render('integrations/admin/action-edit', {
            layout: 'layout-app',
            provider,
            action: null,
            isNew: true,
            account_number: req.account_number
        });
    } catch (error) {
        res.status(500).send('Error loading form');
    }
});

/**
 * POST /integrations/admin/providers/:key/actions
 * Create new action
 */
router.post('/providers/:key/actions', async (req, res) => {
    try {
        const provider = await IntegrationProvider.findOne({ key: req.params.key });
        if (!provider) {
            return res.status(404).json({ success: false, error: 'Provider not found' });
        }

        const {
            actionKey,
            name,
            description,
            http,
            inputSchema,
            requestTemplate,
            responseMapping,
            testPayload,
            isPublished
        } = req.body;

        // Validate actionKey
        if (!/^[a-z0-9-]+$/.test(actionKey)) {
            return res.status(400).json({
                success: false,
                error: 'Action key must contain only lowercase letters, numbers, and hyphens'
            });
        }

        // Check for duplicate
        const existing = await IntegrationAction.findOne({
            providerKey: req.params.key,
            actionKey
        });
        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'An action with this key already exists for this provider'
            });
        }

        const action = await IntegrationAction.create({
            providerKey: req.params.key,
            actionKey,
            name,
            description,
            http: http || { method: 'GET', path: '/' },
            inputSchema: inputSchema || {},
            requestTemplate: requestTemplate || {},
            responseMapping: responseMapping || {},
            testPayload: testPayload || {},
            isPublished: isPublished || false
        });

        res.status(201).json({ success: true, action });
    } catch (error) {
        console.error('[Admin Actions] Create error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /integrations/admin/actions/:id
 * Get action for editing (by MongoDB _id)
 */
router.get('/actions/:id', async (req, res) => {
    try {
        const action = await IntegrationAction.findById(req.params.id).lean();
        if (!action) {
            return res.status(404).json({ success: false, error: 'Action not found' });
        }

        const provider = await IntegrationProvider.findOne({ key: action.providerKey }).lean();

        if (req.accepts('html')) {
            res.render('integrations/admin/action-edit', {
                layout: 'layout-app',
                provider,
                action,
                isNew: false,
                account_number: req.account_number
            });
        } else {
            res.json({ success: true, action, provider });
        }
    } catch (error) {
        console.error('[Admin Actions] Get error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /integrations/admin/actions/:id
 * Update action (by MongoDB _id)
 */
router.put('/actions/:id', async (req, res) => {
    try {
        const {
            name,
            description,
            http,
            inputSchema,
            requestTemplate,
            responseMapping,
            testPayload,
            isPublished
        } = req.body;

        const action = await IntegrationAction.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description,
                http,
                inputSchema,
                requestTemplate,
                responseMapping,
                testPayload,
                isPublished
            },
            { new: true }
        );

        if (!action) {
            return res.status(404).json({ success: false, error: 'Action not found' });
        }

        res.json({ success: true, action });
    } catch (error) {
        console.error('[Admin Actions] Update error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /integrations/admin/actions/:id
 * Delete action (by MongoDB _id)
 */
router.delete('/actions/:id', async (req, res) => {
    try {
        const action = await IntegrationAction.findByIdAndDelete(req.params.id);

        if (!action) {
            return res.status(404).json({ success: false, error: 'Action not found' });
        }

        // If this was the test action for a provider, clear the reference
        await IntegrationProvider.updateMany(
            { testActionId: req.params.id },
            { $unset: { testActionId: 1 } }
        );

        res.json({ success: true, message: 'Action deleted' });
    } catch (error) {
        console.error('[Admin Actions] Delete error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /integrations/admin/actions/:id/test
 * Test action execution (by MongoDB _id)
 * Requires test credentials in body
 */
router.post('/actions/:id/test', async (req, res) => {
    try {
        const { testCredentials } = req.body;

        const result = await IntegrationService.executeActionForTest({
            ProviderModel: IntegrationProvider,
            ActionModel: IntegrationAction,
            actionId: req.params.id,
            testCredentials: testCredentials || {}
        });

        res.json(result);
    } catch (error) {
        console.error('[Admin Actions] Test error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
