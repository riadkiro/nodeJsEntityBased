/**
 * Workflow Worker
 * Background worker that polls and processes workflow jobs
 * Uses atomic locking to prevent duplicate processing
 */

const mongoose = require('mongoose');
const crypto = require('crypto');
const Workflow = require('../models/Workflow.model');
const WorkflowService = require('./WorkflowService');

// Worker ID for locking
const WORKER_ID = `worker-${crypto.randomBytes(4).toString('hex')}`;

// Polling interval (5 seconds)
const POLL_INTERVAL = 5000;

// Lock timeout (5 minutes) - jobs locked longer are considered stale
const LOCK_TIMEOUT = 5 * 60 * 1000;

let isRunning = false;
let pollTimer = null;

/**
 * Start the workflow worker
 * @param {object} tenantDbConnection - Mongoose connection for tenant DB
 */
function start(tenantDbConnection) {
    if (isRunning) {
        console.log('[WorkflowWorker] Already running');
        return;
    }

    isRunning = true;
    console.log(`[WorkflowWorker] Starting worker ${WORKER_ID}`);

    // Register models on tenant connection
    const WorkflowJobSchema = require('../models/WorkflowJob.model').schema;
    const IntegrationConnectionSchema = require('../models/IntegrationConnection.model').schema;
    const IntegrationLogSchema = require('../models/IntegrationLog.model').schema;

    const JobModel = tenantDbConnection.models.WorkflowJob ||
        tenantDbConnection.model('WorkflowJob', WorkflowJobSchema);
    const ConnectionModel = tenantDbConnection.models.IntegrationConnection ||
        tenantDbConnection.model('IntegrationConnection', IntegrationConnectionSchema);
    const LogModel = tenantDbConnection.models.IntegrationLog ||
        tenantDbConnection.model('IntegrationLog', IntegrationLogSchema);

    // Start polling
    poll(JobModel, ConnectionModel, LogModel);
}

/**
 * Stop the workflow worker
 */
function stop() {
    if (!isRunning) return;

    isRunning = false;
    if (pollTimer) {
        clearTimeout(pollTimer);
        pollTimer = null;
    }
    console.log(`[WorkflowWorker] Stopped worker ${WORKER_ID}`);
}

/**
 * Poll for pending jobs
 */
async function poll(JobModel, ConnectionModel, LogModel) {
    if (!isRunning) return;

    try {
        // Atomically claim a pending job
        const now = new Date();
        const staleThreshold = new Date(now.getTime() - LOCK_TIMEOUT);

        const job = await JobModel.findOneAndUpdate(
            {
                $or: [
                    // New pending job ready to run
                    { status: 'pending', nextRunAt: { $lte: now } },
                    // Stale locked job (worker died)
                    { status: 'running', lockedAt: { $lt: staleThreshold } }
                ]
            },
            {
                $set: {
                    status: 'running',
                    lockedAt: now,
                    lockedBy: WORKER_ID,
                    startedAt: now
                },
                $inc: { attempts: 1 }
            },
            { new: true }
        );

        if (job) {
            console.log(`[WorkflowWorker] Processing job ${job._id} (attempt ${job.attempts})`);

            // Check max attempts
            if (job.attempts > job.maxAttempts) {
                await JobModel.updateOne(
                    { _id: job._id },
                    {
                        status: 'failed',
                        lastError: 'Max attempts exceeded',
                        completedAt: new Date(),
                        lockedAt: null,
                        lockedBy: null
                    }
                );
                console.log(`[WorkflowWorker] Job ${job._id} exceeded max attempts`);
            } else {
                // Get workflow
                const workflow = await Workflow.findById(job.workflowId);

                if (!workflow) {
                    await JobModel.updateOne(
                        { _id: job._id },
                        {
                            status: 'failed',
                            lastError: 'Workflow not found',
                            completedAt: new Date(),
                            lockedAt: null,
                            lockedBy: null
                        }
                    );
                } else {
                    // Process the job
                    await WorkflowService.processJob({
                        job,
                        workflow,
                        ConnectionModel,
                        LogModel,
                        JobModel
                    });
                }
            }
        }

    } catch (error) {
        console.error('[WorkflowWorker] Poll error:', error);
    }

    // Schedule next poll
    if (isRunning) {
        pollTimer = setTimeout(() => poll(JobModel, ConnectionModel, LogModel), POLL_INTERVAL);
    }
}

module.exports = {
    start,
    stop,
    WORKER_ID
};
