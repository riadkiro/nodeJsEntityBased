/**
 * Tenant Integrations Routes
 * Connection management and action execution for workspaces
 */

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const IntegrationProvider = require('../models/IntegrationProvider.model');
const IntegrationAction = require('../models/IntegrationAction.model');
const IntegrationConnectionSchema = require('../models/IntegrationConnection.model').schema;
const IntegrationLogSchema = require('../models/IntegrationLog.model').schema;
const IntegrationService = require('../services/IntegrationService');
const PlatformIntegrations = require('../../../services/platform-integrations.service');

/**
 * Middleware to load tenant models
 * Registers schemas directly with tenant connection since models are in custom path
 */
async function loadTenantModels(req, res, next) {
    try {
        const { tenantDbConnection, tenantDbReady } = req;

        if (!tenantDbReady || !tenantDbConnection) {
            return res.status(500).json({ success: false, error: 'Tenant database not connected' });
        }

        // Register or get existing models on tenant connection
        req.ConnectionModel = tenantDbConnection.models.IntegrationConnection ||
            tenantDbConnection.model('IntegrationConnection', IntegrationConnectionSchema);
        req.LogModel = tenantDbConnection.models.IntegrationLog ||
            tenantDbConnection.model('IntegrationLog', IntegrationLogSchema);

        next();
    } catch (error) {
        console.error('[Tenant Integrations] Model loading error:', error);
        res.status(500).json({ success: false, error: 'Database connection error' });
    }
}

router.use(loadTenantModels);

/**
 * GET /integrations
 * List available integrations for tenant
 */
router.get('/', async (req, res) => {
    try {
        // Get all published providers
        const providers = await IntegrationProvider.find({ status: 'published' })
            .sort({ category: 1, name: 1 })
            .lean();

        // Get tenant's connections
        const connections = await req.ConnectionModel.find({ workspaceId: req.account_number })
            .lean();
        const platformState = await PlatformIntegrations.getAccountAccess(
            req.account_number,
            providers.map(provider => provider.key)
        );

        // Create a map of connections by providerKey
        const connectionMap = {};
        for (const conn of connections) {
            connectionMap[conn.providerKey] = conn;
        }

        // Merge provider info with connection status
        const integrations = providers.map(provider => {
            const personalConnected = connectionMap[provider.key]?.status === 'connected';
            const platformAccess = platformState.access[provider.key] || {
                enabled: false,
                configured: false,
                available: false
            };
            return {
                ...provider,
                connection: connectionMap[provider.key] || null,
                platformAccess,
                credentialSource: personalConnected
                    ? 'account'
                    : platformAccess.available
                        ? 'platform'
                        : null,
                isConnected: personalConnected || platformAccess.available
            };
        });

        if (req.accepts('html')) {
            res.render('integrations/tenant/integrations-list', {
                layout: 'layout-app',
                integrations,
                account_number: req.account_number
            });
        } else {
            res.json({ success: true, integrations });
        }
    } catch (error) {
        console.error('[Tenant Integrations] List error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /integrations/:providerKey
 * Integration detail page with actions and logs
 */
router.get('/:providerKey', async (req, res) => {
    try {
        const { providerKey } = req.params;

        const provider = await IntegrationProvider.findOne({ key: providerKey, status: 'published' }).lean();
        if (!provider) {
            return res.status(404).json({ success: false, error: 'Integration not found' });
        }

        // Get published actions
        const actions = await IntegrationAction.find({ providerKey, isPublished: true })
            .sort({ name: 1 })
            .lean();

        // Get connection status
        const connection = await req.ConnectionModel.findOne({
            workspaceId: req.account_number,
            providerKey
        }).lean();
        const platformState = await PlatformIntegrations.getAccountAccess(
            req.account_number,
            [providerKey]
        );
        const platformAccess = platformState.access[providerKey] || {
            enabled: false,
            configured: false,
            available: false
        };
        const personalConnected = connection?.status === 'connected';
        const isConnected = personalConnected || platformAccess.available;
        const credentialSource = personalConnected
            ? 'account'
            : platformAccess.available
                ? 'platform'
                : null;

        // Get recent logs
        const logs = await IntegrationService.getLogs({
            LogModel: req.LogModel,
            workspaceId: req.account_number,
            providerKey,
            limit: 20
        });

        if (req.accepts('html')) {
            res.render('integrations/tenant/integration-detail', {
                layout: 'layout-app',
                provider,
                actions,
                connection,
                logs,
                isConnected,
                credentialSource,
                platformAccess,
                quota: platformState.quota,
                account_number: req.account_number
            });
        } else {
            res.json({
                success: true,
                provider,
                actions,
                connection: connection ? {
                    ...connection,
                    secrets: undefined  // Never expose secrets
                } : null,
                isConnected,
                credentialSource,
                platformAccess,
                quota: platformState.quota,
                logs
            });
        }
    } catch (error) {
        console.error('[Tenant Integrations] Detail error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /integrations/:providerKey/connect
 * Save credentials and connect to provider
 */
router.post('/:providerKey/connect', async (req, res) => {
    try {
        const { providerKey } = req.params;
        const { token, apiKey } = req.body;

        // Validate provider exists
        const provider = await IntegrationProvider.findOne({ key: providerKey });
        if (!provider) {
            return res.status(404).json({ success: false, error: 'Provider not found' });
        }

        // Build credentials object
        const credentials = {
            token: token || apiKey  // Normalize to 'token'
        };

        if (!credentials.token) {
            return res.status(400).json({ success: false, error: 'Token or API key is required' });
        }

        const connection = await IntegrationService.connect({
            ConnectionModel: req.ConnectionModel,
            workspaceId: req.account_number,
            providerKey,
            credentials,
            userId: req.user._id
        });

        res.json({
            success: true,
            message: 'Connected successfully',
            connection: {
                status: connection.status,
                connectedAt: connection.connectedAt
            }
        });
    } catch (error) {
        console.error('[Tenant Integrations] Connect error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /integrations/:providerKey/disconnect
 * Disconnect from provider
 */
router.post('/:providerKey/disconnect', async (req, res) => {
    try {
        const { providerKey } = req.params;

        await IntegrationService.disconnect({
            ConnectionModel: req.ConnectionModel,
            workspaceId: req.account_number,
            providerKey
        });

        res.json({ success: true, message: 'Disconnected successfully' });
    } catch (error) {
        console.error('[Tenant Integrations] Disconnect error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /integrations/:providerKey/test
 * Test connection using provider's testActionId
 */
router.post('/:providerKey/test', async (req, res) => {
    try {
        const { providerKey } = req.params;

        const result = await IntegrationService.testConnection({
            ProviderModel: IntegrationProvider,
            ActionModel: IntegrationAction,
            ConnectionModel: req.ConnectionModel,
            LogModel: req.LogModel,
            workspaceId: req.account_number,
            providerKey
        });

        res.json(result);
    } catch (error) {
        console.error('[Tenant Integrations] Test error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /integrations/:providerKey/actions/:id/execute
 * Execute an action
 */
router.post('/:providerKey/actions/:id/execute', async (req, res) => {
    try {
        const { providerKey, id } = req.params;
        const { input } = req.body;

        const result = await IntegrationService.executeAction({
            ProviderModel: IntegrationProvider,
            ActionModel: IntegrationAction,
            ConnectionModel: req.ConnectionModel,
            LogModel: req.LogModel,
            workspaceId: req.account_number,
            providerKey,
            actionId: id,
            input: input || {}
        });

        res.json(result);
    } catch (error) {
        console.error('[Tenant Integrations] Execute error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /integrations/:providerKey/logs
 * Get execution logs
 */
router.get('/:providerKey/logs', async (req, res) => {
    try {
        const { providerKey } = req.params;
        const limit = parseInt(req.query.limit) || 50;

        const logs = await IntegrationService.getLogs({
            LogModel: req.LogModel,
            workspaceId: req.account_number,
            providerKey,
            limit
        });

        res.json({ success: true, logs });
    } catch (error) {
        console.error('[Tenant Integrations] Logs error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
