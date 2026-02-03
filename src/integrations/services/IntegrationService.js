/**
 * Integration Service
 * Orchestrates provider connections, action execution, and logging
 */

const SecretVault = require('./SecretVault');
const HttpRunner = require('./HttpRunner');

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

    // Get connection and decrypt secrets
    const connection = await ConnectionModel.findOne({ workspaceId, providerKey });
    if (!connection || !connection.secrets) {
        return { success: false, error: 'Not connected. Please provide credentials first.' };
    }

    let secrets;
    try {
        secrets = SecretVault.decrypt(connection.secrets);
    } catch (err) {
        return { success: false, error: 'Failed to decrypt credentials' };
    }

    // Execute test action with test payload
    const result = await HttpRunner.execute({
        provider,
        action,
        input: action.testPayload || {},
        secrets
    });

    // Update connection status
    await ConnectionModel.findByIdAndUpdate(connection._id, {
        status: result.success ? 'connected' : 'error',
        lastTestAt: new Date(),
        lastError: result.success ? null : result.errorMessage
    });

    // Log the test
    await createLog({
        LogModel,
        workspaceId,
        providerKey,
        actionKey: action.actionKey,
        result
    });

    return result;
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
 * @param {string} options.actionId - MongoDB _id
 * @param {object} options.input - User input
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
    input = {}
}) {
    // Get provider
    const provider = await ProviderModel.findOne({ key: providerKey });
    if (!provider) {
        return { success: false, error: 'Provider not found' };
    }

    // Get action
    const action = await ActionModel.findById(actionId);
    if (!action) {
        return { success: false, error: 'Action not found' };
    }

    // Verify action belongs to provider
    if (action.providerKey !== providerKey) {
        return { success: false, error: 'Action does not belong to this provider' };
    }

    // Get connection and decrypt secrets
    const connection = await ConnectionModel.findOne({ workspaceId, providerKey });
    if (!connection || connection.status !== 'connected') {
        return { success: false, error: 'Not connected to this provider' };
    }

    let secrets = {};
    if (connection.secrets) {
        try {
            secrets = SecretVault.decrypt(connection.secrets);
        } catch (err) {
            return { success: false, error: 'Failed to decrypt credentials' };
        }
    }

    // Execute
    const result = await HttpRunner.execute({
        provider,
        action,
        input,
        secrets
    });

    // Log execution
    await createLog({
        LogModel,
        workspaceId,
        providerKey,
        actionKey: action.actionKey,
        result
    });

    return result;
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
async function createLog({ LogModel, workspaceId, providerKey, actionKey, result }) {
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
            errorMessage: result.errorMessage
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
