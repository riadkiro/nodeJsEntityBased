/**
 * Workflow Triggers
 * Emit triggers from record controllers to enqueue workflow jobs
 */

const Workflow = require('../models/Workflow.model');

/**
 * Emit record.created trigger
 * @param {object} options
 * @param {object} options.WorkflowJobModel - Tenant WorkflowJob model
 * @param {string} options.workspaceId - Workspace ID
 * @param {string} options.entityId - Entity ID
 * @param {object} options.record - Created record data
 */
async function emitRecordCreated({ WorkflowJobModel, workspaceId, entityId, record }) {
    return emitTrigger({
        WorkflowJobModel,
        workspaceId,
        entityId,
        triggerType: 'record.created',
        triggerData: {
            record,
            event: 'created',
            timestamp: new Date()
        }
    });
}

/**
 * Emit record.updated trigger
 * @param {object} options
 * @param {object} options.WorkflowJobModel - Tenant WorkflowJob model
 * @param {string} options.workspaceId - Workspace ID
 * @param {string} options.entityId - Entity ID
 * @param {object} options.record - Updated record data
 * @param {object} options.changes - Object containing changed fields
 */
async function emitRecordUpdated({ WorkflowJobModel, workspaceId, entityId, record, changes }) {
    return emitTrigger({
        WorkflowJobModel,
        workspaceId,
        entityId,
        triggerType: 'record.updated',
        triggerData: {
            record,
            changes,
            event: 'updated',
            timestamp: new Date()
        }
    });
}

/**
 * Internal: Find matching workflows and enqueue jobs
 */
async function emitTrigger({ WorkflowJobModel, workspaceId, entityId, triggerType, triggerData }) {
    try {
        // Find enabled workflows matching this trigger
        const workflows = await Workflow.find({
            workspaceId,
            'trigger.entityId': entityId,
            'trigger.type': triggerType,
            enabled: true
        }).lean();

        if (workflows.length === 0) {
            return { enqueued: 0 };
        }

        // Enqueue a job for each matching workflow
        const jobs = workflows.map(workflow => ({
            workspaceId,
            workflowId: workflow._id,
            status: 'pending',
            triggerData,
            attempts: 0,
            nextRunAt: new Date()
        }));

        await WorkflowJobModel.insertMany(jobs);

        console.log(`[WorkflowTriggers] Enqueued ${jobs.length} workflow job(s) for ${triggerType}`);

        return { enqueued: jobs.length };

    } catch (error) {
        console.error('[WorkflowTriggers] Error emitting trigger:', error);
        return { enqueued: 0, error: error.message };
    }
}

module.exports = {
    emitRecordCreated,
    emitRecordUpdated
};
