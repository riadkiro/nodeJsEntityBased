/**
 * Workflow Service
 * Processes workflow jobs - executes steps sequentially
 */

const IntegrationProvider = require('../models/IntegrationProvider.model');
const IntegrationAction = require('../models/IntegrationAction.model');
const HttpRunner = require('./HttpRunner');
const InternalActionRunner = require('./InternalActionRunner');
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
 * @param {object} options.tenantReq - Req-like object for tenantCollection (tenantDbConnection)
 * @returns {Promise<object>} - Processing result
 */
async function processJob({ job, workflow, ConnectionModel, LogModel, JobModel, tenantReq }) {
    const startTime = Date.now();
    const stepResults = [];
    let lastError = null;
    let finalStatus = 'completed';

    // Build context with trigger data + context bindings
    const context = {
        trigger: job.triggerData,
        actor: job.triggerData?.actor || {},
        inputs: job.triggerData?.inputs || {},
        contexts: {},   // Populated from contextBindings
        steps: {}       // Will hold outputs from previous steps
    };

    // ── Resolve context bindings ──
    for (const binding of workflow.contextBindings || []) {
        if (binding.type === 'entity') {
            if (binding.source === 'currentRecord' && job.triggerData?.record) {
                // The trigger record is the context source
                context.contexts[binding.key] = job.triggerData.record;
            }
            // Future: source=byId → fetch by ID, source=query → run query
        } else if (binding.type === 'manual') {
            // Manual inputs are passed at execution time
            context.contexts[binding.key] = job.triggerData?.inputs?.[binding.key] || {};
        }
    }

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

            // Resolve input mapping with context (trigger data + previous step outputs)
            const input = resolveTemplate(step.inputMapping || {}, context);

            let result;

            // ═══ ROUTING: Internal vs External ═══
            if (provider.baseUrl === 'internal://') {
                // ── Internal Action (Mongoose / DB) ──
                result = await InternalActionRunner.execute({ action, input, tenantReq });
            } else {
                // ── External Action (HTTP) ──
                const connection = await ConnectionModel.findOne({
                    workspaceId: job.workspaceId,
                    providerKey: step.providerKey
                });

                if (!connection || connection.status !== 'connected') {
                    throw new Error(`Not connected to "${step.providerKey}"`);
                }

                const secrets = SecretVault.decrypt(connection.secrets);
                result = await HttpRunner.executeWithRefresh(
                    { provider, action, input, secrets },
                    { provider, connection, ConnectionModel }
                );
            }

            const stepLatency = Date.now() - stepStartTime;

            // Map internal error codes to valid errorType enum
            const rawErrorCode = result.error?.code || result.errorType || null;
            const errorTypeMap = {
                'MISSING_INPUT': 'validation', 'RECORD_NOT_FOUND': 'validation',
                'ENTITY_NOT_FOUND': 'validation', 'CLASSIFICATION_NOT_FOUND': 'validation',
                'OPTION_NOT_FOUND': 'validation', 'INTERNAL_ERROR': 'internal',
                'UNKNOWN_ACTION': 'internal'
            };
            const errorType = errorTypeMap[rawErrorCode] || rawErrorCode;

            // Log execution
            await LogModel.create({
                workspaceId: job.workspaceId,
                providerKey: step.providerKey,
                actionKey: action.actionKey,
                status: result.success ? 'success' : 'error',
                httpStatus: result.httpStatus || null,
                errorType,
                latencyMs: stepLatency,
                requestMeta: { input },
                responseMeta: { output: result.data },
                errorMessage: result.errorMessage,
                workflowId: workflow._id,
                workflowJobId: job._id,
                stepId: step.id
            });

            if (!result.success) {
                throw new Error(result.errorMessage || 'Step failed');
            }

            // Store step output for next steps (enables {{steps.step_1.recordId}})
            // Auto-parse JSON string in 'content' field (e.g. OpenAI response_format: json_schema)
            // so that {{steps.step_1.content.nom}} works instead of getting the raw JSON string
            const stepData = { ...result.data };
            if (typeof stepData.content === 'string') {
                try {
                    const parsed = JSON.parse(stepData.content);
                    if (typeof parsed === 'object' && parsed !== null) {
                        stepData.content = parsed;
                    }
                } catch { /* not JSON, keep as string */ }
            }
            context.steps[step.id] = stepData;

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
