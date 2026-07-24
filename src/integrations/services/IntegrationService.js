/**
 * Integration Service
 * Orchestrates provider connections, action execution, and logging
 */

const SecretVault = require('./SecretVault');
const HttpRunner = require('./HttpRunner');
const PlatformIntegrations = require('../../../services/platform-integrations.service');

function quotaExceededResult(quota) {
    return {
        success: false,
        code: 'PLATFORM_QUOTA_EXHAUSTED',
        errorType: 'quota',
        error: PlatformIntegrations.QUOTA_EXHAUSTED_MESSAGE,
        errorMessage: PlatformIntegrations.QUOTA_EXHAUSTED_MESSAGE,
        credentialSource: 'platform',
        quota
    };
}

function connectionErrorResult(error) {
    return {
        success: false,
        error: error || 'Not connected to this provider',
        errorMessage: error || 'Not connected to this provider'
    };
}

/**
 * Connect a workspace to a provider
 * @param {object} options
 * @param {Model} options.ConnectionModel - Tenant's IntegrationConnection model
 * @param {string} options.workspaceId
 * @param {string} options.providerKey
 * @param {object} options.credentials - { token: "xyz" }
 * @param {string} options.userId
 * @returns {Promise<object>} - Connection document
 */
async function connect({ ConnectionModel, workspaceId, providerKey, credentials, userId }) {
    // Encrypt secrets
    const encryptedSecrets = SecretVault.encrypt(credentials);

    // Upsert connection
    const connection = await ConnectionModel.findOneAndUpdate(
        { workspaceId, providerKey },
        {
            status: 'connected',
            secrets: encryptedSecrets,
            connectedByUserId: userId,
            connectedAt: new Date(),
            lastError: null
        },
        { upsert: true, new: true }
    );

    return connection;
}

/**
 * Disconnect a workspace from a provider
 * @param {object} options
 * @param {Model} options.ConnectionModel
 * @param {string} options.workspaceId
 * @param {string} options.providerKey
 * @returns {Promise<object>} - Updated connection
 */
async function disconnect({ ConnectionModel, workspaceId, providerKey }) {
    const connection = await ConnectionModel.findOneAndUpdate(
        { workspaceId, providerKey },
        {
            status: 'disconnected',
            secrets: null,
            lastError: null
        },
        { new: true }
    );

    return connection;
}

/**
 * Test a connection using the provider's designated test action
 * @param {object} options
 * @param {Model} options.ProviderModel
 * @param {Model} options.ActionModel
 * @param {Model} options.ConnectionModel
 * @param {Model} options.LogModel
 * @param {string} options.workspaceId
 * @param {string} options.providerKey
 * @returns {Promise<object>} - Test result
 */
async function testConnection({
    ProviderModel,
    ActionModel,
    ConnectionModel,
    LogModel,
    workspaceId,
    providerKey
}) {
    // Get provider
    const provider = await ProviderModel.findOne({ key: providerKey });
    if (!provider) {
        return { success: false, error: 'Provider not found' };
    }

    // Check for test action
    if (!provider.testActionId) {
        return {
            success: false,
            error: 'No test action configured for this provider. Please configure "testActionId" on the provider.'
        };
    }

    // Get test action
    const action = await ActionModel.findById(provider.testActionId);
    if (!action) {
        return { success: false, error: 'Test action not found' };
    }

    let resolved;
    try {
        resolved = await PlatformIntegrations.resolveCredentials({
            ConnectionModel,
            workspaceId,
            providerKey,
            allowErroredConnection: true
        });
    } catch (err) {
        return { success: false, error: 'Failed to decrypt credentials' };
    }
    if (!resolved.source) {
        return connectionErrorResult(resolved.error);
    }

    let reservation = null;
    let executionInput = action.testPayload || {};
    if (resolved.source === 'platform') {
        reservation = await PlatformIntegrations.consumeBudget({
            accountNumber: workspaceId,
            credential: resolved.credential
        });
        if (!reservation.allowed) {
            const quotaResult = quotaExceededResult(reservation.quota);
            await createLog({
                LogModel,
                workspaceId,
                providerKey,
                actionKey: action.actionKey,
                result: quotaResult,
                credentialSource: resolved.source,
                estimatedCostEur: 0,
                quota: reservation.quota
            });
            return quotaResult;
        }
        executionInput = PlatformIntegrations.preparePlatformInput(
            providerKey,
            executionInput,
            resolved.credential
        );
    }

    // Execute test action with test payload
    const result = await HttpRunner.execute({
        provider,
        action,
        input: executionInput,
        secrets: resolved.secrets
    });

    if (resolved.source === 'platform' && !result.success) {
        await PlatformIntegrations.refundBudget({
            accountNumber: workspaceId,
            reservation
        });
        reservation.quota = await PlatformIntegrations.getUsage(workspaceId);
    }

    // A platform-funded test must never alter a tenant's personal connection.
    if (resolved.source === 'account' && resolved.connection) {
        await ConnectionModel.findByIdAndUpdate(resolved.connection._id, {
            status: result.success ? 'connected' : 'error',
            lastTestAt: new Date(),
            lastError: result.success ? null : result.errorMessage
        });
    }

    // Log the test
    await createLog({
        LogModel,
        workspaceId,
        providerKey,
        actionKey: action.actionKey,
        result,
        credentialSource: resolved.source,
        estimatedCostEur: result.success ? reservation?.estimatedCostEur : 0,
        quota: reservation?.quota
    });

    return {
        ...result,
        credentialSource: resolved.source,
        ...(reservation?.quota ? { quota: reservation.quota } : {})
    };
}

/**
 * Execute an action
 * @param {object} options
 * @param {Model} options.ProviderModel
 * @param {Model} options.ActionModel
 * @param {Model} options.ConnectionModel
 * @param {Model} options.LogModel
 * @param {string} options.workspaceId
 * @param {string} options.providerKey
 * @param {string} options.actionId - MongoDB _id or actionKey
 * @param {object} options.input - User input
 * @param {number} [options.timeoutMs] - Optional request timeout override
 * @param {object} [options.logContext] - Optional workflow identifiers
 * @returns {Promise<object>} - Execution result
 */
async function executeAction({
    ProviderModel,
    ActionModel,
    ConnectionModel,
    LogModel,
    workspaceId,
    providerKey,
    actionId,
    input = {},
    timeoutMs,
    logContext = {}
}) {
    // Get provider
    const provider = await ProviderModel.findOne({ key: providerKey });
    if (!provider) {
        return { success: false, error: 'Provider not found' };
    }

    // Get action - support both ObjectId and actionKey
    const mongoose = require('mongoose');
    const isObjectId = mongoose.Types.ObjectId.isValid(actionId) &&
        (typeof actionId === 'string' && actionId.length === 24);

    let action;
    if (isObjectId) {
        action = await ActionModel.findById(actionId);
    } else {
        // Treat as actionKey
        action = await ActionModel.findOne({ providerKey, actionKey: actionId });
    }

    if (!action) {
        return { success: false, error: 'Action not found' };
    }

    // Verify action belongs to provider
    if (action.providerKey !== providerKey) {
        return { success: false, error: 'Action does not belong to this provider' };
    }

    let resolved;
    try {
        resolved = await PlatformIntegrations.resolveCredentials({
            ConnectionModel,
            workspaceId,
            providerKey
        });
    } catch (err) {
        return { success: false, error: 'Failed to decrypt credentials' };
    }
    if (!resolved.source) {
        return connectionErrorResult(resolved.error);
    }

    let reservation = null;
    let executionInput = input;
    if (resolved.source === 'platform') {
        reservation = await PlatformIntegrations.consumeBudget({
            accountNumber: workspaceId,
            credential: resolved.credential
        });
        if (!reservation.allowed) {
            const quotaResult = quotaExceededResult(reservation.quota);
            await createLog({
                LogModel,
                workspaceId,
                providerKey,
                actionKey: action.actionKey,
                result: quotaResult,
                credentialSource: resolved.source,
                estimatedCostEur: 0,
                quota: reservation.quota,
                logContext
            });
            return quotaResult;
        }
        executionInput = PlatformIntegrations.preparePlatformInput(
            providerKey,
            input,
            resolved.credential
        );
    }

    // Execute
    const runnerOptions = {
        provider,
        action,
        input: executionInput,
        secrets: resolved.secrets,
        timeoutMs
    };
    const refreshContext = resolved.source === 'account' && resolved.connection
        ? { provider, connection: resolved.connection, ConnectionModel }
        : null;
    const result = await HttpRunner.executeWithRefresh(runnerOptions, refreshContext);

    if (resolved.source === 'platform' && !result.success) {
        await PlatformIntegrations.refundBudget({
            accountNumber: workspaceId,
            reservation
        });
        reservation.quota = await PlatformIntegrations.getUsage(workspaceId);
    }

    // Log execution
    await createLog({
        LogModel,
        workspaceId,
        providerKey,
        actionKey: action.actionKey,
        result,
        credentialSource: resolved.source,
        estimatedCostEur: result.success ? reservation?.estimatedCostEur : 0,
        quota: reservation?.quota,
        logContext
    });

    return {
        ...result,
        credentialSource: resolved.source,
        ...(reservation?.quota ? { quota: reservation.quota } : {})
    };
}

/**
 * Execute action for admin testing (no connection required)
 * @param {object} options
 * @param {Model} options.ProviderModel
 * @param {Model} options.ActionModel
 * @param {string} options.actionId
 * @param {object} options.testCredentials - { token: "xyz" }
 * @returns {Promise<object>} - Execution result
 */
async function executeActionForTest({
    ProviderModel,
    ActionModel,
    actionId,
    testCredentials = {}
}) {
    // Get action
    const action = await ActionModel.findById(actionId);
    if (!action) {
        return { success: false, error: 'Action not found' };
    }

    // Get provider
    const provider = await ProviderModel.findOne({ key: action.providerKey });
    if (!provider) {
        return { success: false, error: 'Provider not found' };
    }

    // Execute with test payload
    const result = await HttpRunner.execute({
        provider,
        action,
        input: action.testPayload || {},
        secrets: testCredentials
    });

    return result;
}

/**
 * Create execution log
 */
async function createLog({
    LogModel,
    workspaceId,
    providerKey,
    actionKey,
    result,
    credentialSource = 'account',
    estimatedCostEur = 0,
    quota = null,
    logContext = {}
}) {
    try {
        await LogModel.create({
            workspaceId,
            providerKey,
            actionKey,
            status: result.success ? 'success' : 'error',
            httpStatus: result.httpStatus,
            errorType: result.errorType,
            latencyMs: result.latencyMs,
            requestMeta: result.meta?.requestMeta || {},
            responseMeta: result.meta?.responseMeta || {},
            errorMessage: result.errorMessage || result.error,
            credentialSource,
            estimatedCostEur: Number(estimatedCostEur || 0),
            quota: quota || undefined,
            workflowId: logContext.workflowId,
            workflowJobId: logContext.workflowJobId,
            stepId: logContext.stepId
        });
    } catch (err) {
        console.error('[IntegrationService] Failed to create log:', err.message);
    }
}

/**
 * Get logs for a workspace/provider
 * @param {object} options
 * @param {Model} options.LogModel
 * @param {string} options.workspaceId
 * @param {string} options.providerKey
 * @param {number} options.limit
 * @returns {Promise<array>}
 */
async function getLogs({ LogModel, workspaceId, providerKey, limit = 50 }) {
    return LogModel.find({ workspaceId, providerKey })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
}

module.exports = {
    connect,
    disconnect,
    testConnection,
    executeAction,
    executeActionForTest,
    getLogs
};
