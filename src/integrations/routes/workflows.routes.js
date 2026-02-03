/**
 * Workflow Routes
 * CRUD for workflow management
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
 * New workflow form
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
            account_number: workspaceId
        });
    } catch (error) {
        console.error('[Workflows] New form error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /workflows/:id
 * Workflow detail / edit form
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
 * POST /workflows
 * Create new workflow
 */
router.post('/', async (req, res) => {
    try {
        const workspaceId = req.account_number;
        const { name, description, trigger, steps } = req.body;

        const workflow = await Workflow.create({
            workspaceId,
            name,
            description,
            enabled: false,
            trigger,
            steps: steps || []
        });

        res.json({ success: true, workflow });
    } catch (error) {
        console.error('[Workflows] Create error:', error);
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
        const { name, description, trigger, steps } = req.body;

        const workflow = await Workflow.findOneAndUpdate(
            { _id: id, workspaceId },
            { name, description, trigger, steps },
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
 * Get workflow execution history
 */
router.get('/:id/jobs', async (req, res) => {
    try {
        const { id } = req.params;
        const limit = parseInt(req.query.limit) || 50;

        const jobs = await req.JobModel.find({ workflowId: id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        res.json({ success: true, jobs });
    } catch (error) {
        console.error('[Workflows] Jobs error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
