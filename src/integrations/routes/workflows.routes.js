/**
 * Workflow Routes
 * CRUD for workflow management + visual builder APIs
 */

const express = require('express');
const router = express.Router();

const Workflow = require('../models/Workflow.model');
const IntegrationProvider = require('../models/IntegrationProvider.model');
const IntegrationAction = require('../models/IntegrationAction.model');

/**
 * Middleware to load tenant models
 */
async function loadTenantModels(req, res, next) {
    try {
        const { tenantDbConnection, tenantDbReady } = req;

        if (!tenantDbReady || !tenantDbConnection) {
            return res.status(500).json({ success: false, error: 'Tenant database not connected' });
        }

        const WorkflowJobSchema = require('../models/WorkflowJob.model').schema;
        req.JobModel = tenantDbConnection.models.WorkflowJob ||
            tenantDbConnection.model('WorkflowJob', WorkflowJobSchema);

        next();
    } catch (error) {
        console.error('[Workflows] Model loading error:', error);
        res.status(500).json({ success: false, error: 'Database connection error' });
    }
}

router.use(loadTenantModels);

// ═══════════════════════════════════════════════════════════════
// STATIC ROUTES (must be before /:id to avoid conflicts)
// ═══════════════════════════════════════════════════════════════

/**
 * GET /workflows
 * List all workflows for tenant
 */
router.get('/', async (req, res) => {
    try {
        const workspaceId = req.account_number;

        const workflows = await Workflow.find({ workspaceId })
            .sort({ createdAt: -1 })
            .lean();

        // Get recent job stats per workflow
        for (const workflow of workflows) {
            workflow.recentJobs = await req.JobModel.find({ workflowId: workflow._id })
                .sort({ createdAt: -1 })
                .limit(5)
                .select('status createdAt completedAt')
                .lean();
        }

        if (req.accepts('html')) {
            res.render('integrations/workflows/workflows-list', {
                layout: 'layout-app',
                workflows,
                account_number: workspaceId
            });
        } else {
            res.json({ success: true, workflows });
        }
    } catch (error) {
        console.error('[Workflows] List error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /workflows/new
 * New workflow form (visual builder)
 */
router.get('/new', async (req, res) => {
    try {
        const workspaceId = req.account_number;

        // Get available providers and actions
        const providers = await IntegrationProvider.find({ status: 'published' }).lean();
        const actions = await IntegrationAction.find({ isPublished: true }).lean();

        // Get entities (from tenant DB)
        const { tenantCollection } = require('../../../middleware/tenant');
        const Entity = await tenantCollection(req, 'Entity');
        const entities = await Entity.find({}).select('_id name slug').lean();

        res.render('integrations/workflows/workflow-edit', {
            layout: 'layout-app',
            workflow: null,
            providers,
            actions,
            entities,
            jobs: [],
            account_number: workspaceId
        });
    } catch (error) {
        console.error('[Workflows] New form error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /workflows
 * Create new workflow
 */
router.post('/', async (req, res) => {
    try {
        const workspaceId = req.account_number;
        const { name, description, category, trigger, steps, settings } = req.body;

        const workflow = await Workflow.create({
            workspaceId,
            name,
            description,
            category: category || 'automation',
            enabled: false,
            trigger,
            steps: steps || [],
            settings: settings || {}
        });

        res.json({ success: true, workflow });
    } catch (error) {
        console.error('[Workflows] Create error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// API ROUTES (before /:id to avoid route conflicts)
// ═══════════════════════════════════════════════════════════════

/**
 * GET /workflows/api/entity-context/:entityId
 * Returns fields, classifications, and relations for an entity
 * Used by the workflow builder to show available variables
 */
router.get('/api/entity-context/:entityId', async (req, res) => {
    try {
        const { entityId } = req.params;
        const { tenantCollection } = require('../../../middleware/tenant');

        const Entity = await tenantCollection(req, 'Entity');
        const entity = await Entity.findById(entityId)
            .populate('fields')
            .lean();

        if (!entity) {
            return res.status(404).json({ success: false, error: 'Entity not found' });
        }

        // Get classifications for this entity
        const Classification = await tenantCollection(req, 'Classification');
        const classifications = await Classification.find({ entityId })
            .select('_id name color values')
            .lean();

        // Build available variables
        const variables = {
            trigger: {
                record: {
                    _id: { type: 'ObjectId', label: 'Record ID' },
                    title: { type: 'String', label: 'Title' },
                    createdAt: { type: 'Date', label: 'Date de création' },
                    updatedAt: { type: 'Date', label: 'Date de modification' }
                }
            },
            entity: {
                _id: entity._id,
                name: entity.name,
                slug: entity.slug
            },
            fields: (entity.fields || []).map(f => ({
                _id: f._id,
                name: f.name,
                slug: f.slug || f.name,
                type: f.type,
                variable: `{{trigger.record.custom_fields.${f.slug || f.name}}}`
            })),
            classifications: classifications.map(c => ({
                _id: c._id,
                name: c.name,
                color: c.color,
                values: c.values || [],
                variable: `{{trigger.record.classifications.${c.name}}}`
            }))
        };

        res.json({ success: true, entity, variables });
    } catch (error) {
        console.error('[Workflows] Entity context error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /workflows/api/providers
 * Returns available providers + actions for the builder
 */
router.get('/api/providers', async (req, res) => {
    try {
        const providers = await IntegrationProvider.find({ status: 'published' })
            .select('key name icon category')
            .lean();
        const actions = await IntegrationAction.find({ isPublished: true })
            .select('providerKey actionId name description inputSchema')
            .lean();

        // Group actions by provider
        const providerMap = {};
        for (const p of providers) {
            providerMap[p.key] = {
                ...p,
                actions: actions.filter(a => a.providerKey === p.key)
            };
        }

        res.json({ success: true, providers: Object.values(providerMap) });
    } catch (error) {
        console.error('[Workflows] Providers error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /workflows/api/jobs/:jobId
 * Get single job execution detail with step results
 */
router.get('/api/jobs/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await req.JobModel.findById(jobId).lean();
        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' });
        }
        res.json({ success: true, job });
    } catch (error) {
        console.error('[Workflows] Job detail error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// PARAMETRIC ROUTES (/:id based)
// ═══════════════════════════════════════════════════════════════

/**
 * GET /workflows/:id
 * Workflow detail / edit form (visual builder)
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const workspaceId = req.account_number;

        const workflow = await Workflow.findOne({ _id: id, workspaceId }).lean();
        if (!workflow) {
            return res.status(404).json({ success: false, error: 'Workflow not found' });
        }

        // Get providers, actions, entities
        const providers = await IntegrationProvider.find({ status: 'published' }).lean();
        const actions = await IntegrationAction.find({ isPublished: true }).lean();

        const { tenantCollection } = require('../../../middleware/tenant');
        const Entity = await tenantCollection(req, 'Entity');
        const entities = await Entity.find({}).select('_id name slug').lean();

        // Get recent jobs
        const jobs = await req.JobModel.find({ workflowId: id })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        res.render('integrations/workflows/workflow-edit', {
            layout: 'layout-app',
            workflow,
            providers,
            actions,
            entities,
            jobs,
            account_number: workspaceId
        });
    } catch (error) {
        console.error('[Workflows] Detail error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /workflows/:id
 * Update workflow
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const workspaceId = req.account_number;
        const { name, description, category, trigger, steps, settings } = req.body;

        const workflow = await Workflow.findOneAndUpdate(
            { _id: id, workspaceId },
            { name, description, category, trigger, steps, settings },
            { new: true }
        );

        if (!workflow) {
            return res.status(404).json({ success: false, error: 'Workflow not found' });
        }

        res.json({ success: true, workflow });
    } catch (error) {
        console.error('[Workflows] Update error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /workflows/:id
 * Delete workflow
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const workspaceId = req.account_number;

        await Workflow.deleteOne({ _id: id, workspaceId });

        res.json({ success: true, message: 'Workflow deleted' });
    } catch (error) {
        console.error('[Workflows] Delete error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /workflows/:id/toggle
 * Enable/disable workflow
 */
router.post('/:id/toggle', async (req, res) => {
    try {
        const { id } = req.params;
        const workspaceId = req.account_number;

        const workflow = await Workflow.findOne({ _id: id, workspaceId });
        if (!workflow) {
            return res.status(404).json({ success: false, error: 'Workflow not found' });
        }

        workflow.enabled = !workflow.enabled;
        await workflow.save();

        res.json({ success: true, enabled: workflow.enabled });
    } catch (error) {
        console.error('[Workflows] Toggle error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /workflows/:id/jobs
 * Get workflow execution history — renders page or returns JSON
 */
router.get('/:id/jobs', async (req, res) => {
    try {
        const { id } = req.params;
        const workspaceId = req.account_number;
        const limit = parseInt(req.query.limit) || 50;

        const workflow = await Workflow.findOne({ _id: id, workspaceId }).lean();
        if (!workflow) {
            return res.status(404).json({ success: false, error: 'Workflow not found' });
        }

        const jobs = await req.JobModel.find({ workflowId: id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        // JSON API request (from fetch)
        const wantsJson = req.query.limit || req.headers.accept?.includes('application/json');
        if (wantsJson) {
            return res.json({ success: true, jobs });
        }

        // Render page
        res.render('integrations/workflows/workflow-jobs', {
            layout: 'layout-app',
            workflow,
            jobs,
            account_number: workspaceId
        });
    } catch (error) {
        console.error('[Workflows] Jobs error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /workflows/:id/execute
 * Execute a workflow — supports both sync and async modes
 * 
 * Body: { sync: true|false, idempotencyKey, context }
 * 
 * sync=true  → Awaits full execution, returns { success, jobId, result: { stepResults, latencyMs, data } }
 * sync=false → Fire-and-forget, returns { success, jobId, status: 'queued' }
 */
router.post('/:id/execute', async (req, res) => {
    try {
        const { id } = req.params;
        const workspaceId = req.account_number;
        const { idempotencyKey, context, sync } = req.body;

        const workflow = await Workflow.findOne({ _id: id, workspaceId, enabled: true });
        if (!workflow) {
            return res.status(404).json({ success: false, error: 'Workflow not found or disabled' });
        }

        // Idempotency check — prevent double execution within cooldown window
        if (idempotencyKey) {
            const existing = await req.JobModel.findOne({
                workflowId: id,
                'triggerData.idempotencyKey': idempotencyKey,
                createdAt: { $gte: new Date(Date.now() - (workflow.settings?.idempotencyWindow || 5000)) }
            }).lean();
            if (existing) {
                return res.json({ success: true, jobId: existing._id, status: existing.status, deduplicated: true });
            }
        }

        // Build execution context
        const executionContext = {
            type: workflow.trigger?.type || 'manual.button',
            tenantId: workspaceId,
            actorId: req.user?._id?.toString() || null,
            actorEmail: req.user?.email || null,
            entityId: workflow.trigger?.entityId?.toString() || context?.entityId || null,
            recordId: context?.recordId || null,
            payload: context?.payload || {},
            idempotencyKey: idempotencyKey || null,
            uiContext: context?.uiContext || {}
        };

        // Create job
        const job = await req.JobModel.create({
            workspaceId,
            workflowId: workflow._id,
            status: 'pending',
            triggerData: executionContext,
            stepResults: []
        });

        // Helper: build process context
        const getProcessModels = () => {
            const { tenantDbConnection } = req;
            const ConnectionSchema = require('../models/IntegrationConnection.model').schema;
            const LogSchema = require('../models/IntegrationLog.model').schema;

            const ConnectionModel = tenantDbConnection.models.IntegrationConnection ||
                tenantDbConnection.model('IntegrationConnection', ConnectionSchema);
            const LogModel = tenantDbConnection.models.IntegrationLog ||
                tenantDbConnection.model('IntegrationLog', LogSchema);

            // tenantReq: minimal req-like object for tenantCollection
            const tenantReq = { tenantDbConnection };

            return { ConnectionModel, LogModel, tenantReq };
        };

        // Determine mode: sync or async
        const isSync = sync === true || sync === 'true';

        if (isSync) {
            // ═══ SYNC MODE: await result and return it ═══
            const { processJob } = require('../services/WorkflowService');
            const { ConnectionModel, LogModel, tenantReq } = getProcessModels();

            const result = await processJob({
                job,
                workflow: workflow.toObject(),
                ConnectionModel,
                LogModel,
                JobModel: req.JobModel,
                tenantReq
            });

            // Extract the last step's output as the "main" response data
            const lastStepResult = result.stepResults?.[result.stepResults.length - 1];
            const responseData = lastStepResult?.result || null;

            return res.json({
                success: result.success,
                jobId: job._id,
                status: result.success ? 'completed' : 'failed',
                mode: 'sync',
                result: {
                    stepResults: result.stepResults,
                    latencyMs: result.latencyMs,
                    data: responseData
                }
            });
        } else {
            // ═══ ASYNC MODE: fire-and-forget ═══
            setImmediate(async () => {
                try {
                    const { processJob } = require('../services/WorkflowService');
                    const { ConnectionModel, LogModel, tenantReq } = getProcessModels();

                    await processJob({
                        job,
                        workflow: workflow.toObject(),
                        ConnectionModel,
                        LogModel,
                        JobModel: req.JobModel,
                        tenantReq
                    });
                } catch (err) {
                    console.error('[Workflows] Background execution error:', err);
                }
            });

            return res.json({ success: true, jobId: job._id, status: 'queued', mode: 'async' });
        }
    } catch (error) {
        console.error('[Workflows] Execute error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
