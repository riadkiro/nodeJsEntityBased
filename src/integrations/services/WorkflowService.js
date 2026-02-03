/**
 * Workflow Service
 * Processes workflow jobs - executes steps sequentially
 */

const IntegrationProvider = require('../models/IntegrationProvider.model');
const IntegrationAction = require('../models/IntegrationAction.model');
const HttpRunner = require('./HttpRunner');
const SecretVault = require('./SecretVault');
const { resolveTemplate } = require('../utils/templateResolver');

/**
 * Process a single workflow job
 * @param {object} options
 * @param {object} options.job - WorkflowJob document
 * @param {object} options.workflow - Workflow document
 * @param {object} options.ConnectionModel - Tenant IntegrationConnection model
 * @param {object} options.LogModel - Tenant IntegrationLog model
 * @param {object} options.JobModel - Tenant WorkflowJob model
 * @returns {Promise<object>} - Processing result
 */
async function processJob({ job, workflow, ConnectionModel, LogModel, JobModel }) {
    const startTime = Date.now();
    const stepResults = [];
    let lastError = null;
    let finalStatus = 'completed';

    // Build context with trigger data
    const context = {
        trigger: job.triggerData,
        steps: {}  // Will hold outputs from previous steps
    };

    console.log(`[WorkflowService] Processing job ${job._id} for workflow "${workflow.name}"`);

    // Execute steps sequentially
    for (const step of workflow.steps) {
        const stepStartTime = Date.now();

        try {
            // Get provider and action
            const provider = await IntegrationProvider.findOne({ key: step.providerKey });
            if (!provider) {
                throw new Error(`Provider "${step.providerKey}" not found`);
            }

            const action = await IntegrationAction.findById(step.actionId);
            if (!action) {
                throw new Error(`Action "${step.actionId}" not found`);
            }

            // Get connection
            const connection = await ConnectionModel.findOne({
                workspaceId: job.workspaceId,
                providerKey: step.providerKey
            });

            if (!connection || connection.status !== 'connected') {
                throw new Error(`Not connected to "${step.providerKey}"`);
            }

            // Decrypt secrets
            const secrets = SecretVault.decrypt(connection.secrets);

            // Resolve input mapping
            const input = resolveTemplate(step.inputMapping || {}, context);

            // Execute action with refresh support
            const result = await HttpRunner.executeWithRefresh(
                { provider, action, input, secrets },
                { provider, connection, ConnectionModel }
            );

            const stepLatency = Date.now() - stepStartTime;

            // Log execution
            await LogModel.create({
                workspaceId: job.workspaceId,
                providerKey: step.providerKey,
                actionKey: action.actionKey,
                status: result.success ? 'success' : 'error',
                httpStatus: result.httpStatus,
                errorType: result.errorType,
                latencyMs: stepLatency,
                requestMeta: result.meta?.requestMeta,
                responseMeta: result.meta?.responseMeta,
                errorMessage: result.errorMessage,
                workflowId: workflow._id,
                workflowJobId: job._id,
                stepId: step.id
            });

            if (!result.success) {
                throw new Error(result.errorMessage || 'Step failed');
            }

            // Store step output for next steps
            context.steps[step.id] = result.data;

            stepResults.push({
                stepId: step.id,
                status: 'success',
                result: result.data,
                executedAt: new Date(),
                latencyMs: stepLatency
            });

        } catch (stepError) {
            const stepLatency = Date.now() - stepStartTime;

            stepResults.push({
                stepId: step.id,
                status: 'error',
                errorMessage: stepError.message,
                executedAt: new Date(),
                latencyMs: stepLatency
            });

            lastError = stepError.message;
            finalStatus = 'failed';

            console.error(`[WorkflowService] Step ${step.id} failed:`, stepError.message);

            // Stop on first error (no branches/conditions in v1)
            break;
        }
    }

    const totalLatency = Date.now() - startTime;

    // Update job
    await JobModel.updateOne(
        { _id: job._id },
        {
            status: finalStatus,
            stepResults,
            lastError,
            completedAt: new Date(),
            lockedAt: null,
            lockedBy: null
        }
    );

    console.log(`[WorkflowService] Job ${job._id} ${finalStatus} in ${totalLatency}ms`);

    return {
        success: finalStatus === 'completed',
        stepResults,
        latencyMs: totalLatency
    };
}

module.exports = {
    processJob
};
