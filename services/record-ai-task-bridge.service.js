const RecordAiRouter = require('../routes/api/api-record-ai.router');
const TaskImagesService = require('./task-images.service');

const MAX_HISTORY_MESSAGES = 16;

class TaskAgentError extends Error {
    constructor(message, code = 'TASK_AGENT_ERROR') {
        super(message);
        this.name = 'TaskAgentError';
        this.code = code;
    }
}

async function runTaskAgent({
    req,
    task,
    TaskComment,
    userMessage,
    recentComments = []
}) {
    if (!req?.tenantDbConnection) {
        throw new TaskAgentError("L'IA n'est pas disponible dans cet espace.", 'AI_NOT_CONFIGURED');
    }
    if (typeof RecordAiRouter.executeRecordAgentRun !== 'function') {
        throw new TaskAgentError("Le mode Agent IA n'est pas disponible.", 'RECORD_AGENT_UNAVAILABLE');
    }

    const conversationId = latestRecordAgentConversationId(recentComments);
    let runResult;
    try {
        runResult = await RecordAiRouter.executeRecordAgentRun(req, {
            recordId: task.recordId,
            goal: cleanText(userMessage).slice(0, 4000),
            conversationId,
            contextSelections: {},
            taskContext: {
                taskId: task._id,
                imageContent: TaskImagesService.visionContent(
                    req.account_number,
                    task.attachments || [],
                    { maxImages: 4, detail: 'high' }
                ),
                chatHistoryText: buildChatHistoryText(recentComments)
            }
        });
    } catch (error) {
        throw asTaskAgentError(error);
    }

    let run = runResult.run;
    let conversation = runResult.conversation;
    const subtaskActionIds = (run.proposedActions || [])
        .filter(action =>
            action.tool === 'create_subtasks'
            && ['proposed', 'failed'].includes(action.status)
            && cleanId(action.input?.taskId) === cleanId(task._id)
        )
        .map(action => action.id);

    if (subtaskActionIds.length) {
        try {
            const applyResult = await RecordAiRouter.executeRecordAgentApply(req, {
                recordId: task.recordId,
                runId: run._id,
                actionIds: subtaskActionIds,
                rejectUnselected: false
            });
            run = applyResult.run;
            conversation = applyResult.conversation || conversation;
        } catch (error) {
            throw asTaskAgentError(error);
        }
    }

    const createdSubtasks = collectCreatedSubtasks(run, subtaskActionIds);
    const pendingActions = (run.proposedActions || []).filter(action =>
        action.status === 'proposed'
    );
    const reply = buildAgentReply(run, createdSubtasks, pendingActions);
    const model = cleanText(run.engine?.response?.model || run.engine?.model || '');
    const assistantComment = await TaskComment.create({
        taskId: task._id,
        recordId: task.recordId,
        type: 'comment',
        text: reply,
        userId: 'dexio-ai',
        userName: 'Dexio IA',
        userAvatar: '',
        authorType: 'ai',
        audience: 'team',
        agent: {
            status: run.status === 'error' ? 'error' : 'completed',
            action: createdSubtasks.length ? 'create_subtasks' : 'none',
            createdSubtasks,
            model,
            errorCode: run.status === 'error' ? 'RECORD_AGENT_RUN_ERROR' : '',
            recordAgentConversationId: conversation?._id || run.conversationId || null,
            recordAgentRunId: run._id
        }
    });

    const freshTask = typeof task.constructor?.findById === 'function'
        ? await task.constructor.findById(task._id)
        : task;

    return {
        assistantComment,
        createdSubtasks,
        task: freshTask || task,
        model,
        run,
        conversation
    };
}

async function createTaskAgentErrorComment({ task, TaskComment, error }) {
    const normalized = asTaskAgentError(error);
    return TaskComment.create({
        taskId: task._id,
        recordId: task.recordId,
        type: 'comment',
        text: `${normalized.message} Tu peux continuer la conversation avec ton équipe.`,
        userId: 'dexio-ai',
        userName: 'Dexio IA',
        userAvatar: '',
        authorType: 'ai',
        audience: 'team',
        agent: {
            status: 'error',
            action: 'none',
            createdSubtasks: [],
            model: '',
            errorCode: normalized.code,
            recordAgentConversationId: null,
            recordAgentRunId: error?.agentRun?._id || null
        }
    });
}

function buildChatHistoryText(comments = []) {
    return [...comments]
        .filter(comment => comment?.type === 'comment' && cleanText(comment.text))
        .slice(-MAX_HISTORY_MESSAGES)
        .map(comment => {
            const author = comment.authorType === 'ai'
                ? 'Dexio IA'
                : cleanText(comment.userName, 'Membre');
            return `${author}: ${cleanText(comment.text).slice(0, 1200)}`;
        })
        .join('\n');
}

function latestRecordAgentConversationId(comments = []) {
    for (const comment of [...comments].reverse()) {
        const id = cleanId(comment?.agent?.recordAgentConversationId);
        if (id) return id;
    }
    return '';
}

function collectCreatedSubtasks(run, actionIds = []) {
    const selected = new Set(actionIds.map(cleanId));
    return (run.proposedActions || [])
        .filter(action =>
            action.tool === 'create_subtasks'
            && action.status === 'applied'
            && (!selected.size || selected.has(cleanId(action.id)))
        )
        .flatMap(action => Array.isArray(action.result?.createdSubtasks)
            ? action.result.createdSubtasks
            : []
        )
        .map(item => ({
            title: cleanText(item?.title).slice(0, 240),
            subtaskId: cleanId(item?.subtaskId)
        }))
        .filter(item => item.title);
}

function buildAgentReply(run, createdSubtasks = [], pendingActions = []) {
    const summary = cleanText(run.summary);
    const parts = [];
    if (summary) parts.push(summary);
    if (createdSubtasks.length) {
        parts.push(
            `${createdSubtasks.length} sous-tâche${createdSubtasks.length > 1 ? 's ont été créées' : ' a été créée'} dans la tâche.`
        );
    }
    if (pendingActions.length) {
        parts.push(
            `${pendingActions.length} autre${pendingActions.length > 1 ? 's' : ''} action${pendingActions.length > 1 ? 's sont prêtes' : ' est prête'} à valider dans l’Agent IA de la fiche.`
        );
    }
    if (!parts.length) {
        parts.push("L'Agent IA a traité la demande, mais n'a proposé aucune modification exploitable.");
    }
    return parts.join('\n\n').slice(0, 6000);
}

function asTaskAgentError(error) {
    if (error instanceof TaskAgentError) return error;
    const rawMessage = cleanText(error?.message);
    const notConnected = /not connected|non configur|pas encore connect/i.test(rawMessage);
    const normalized = new TaskAgentError(
        notConnected
            ? "L'IA n'est pas encore connectée à cet espace."
            : (rawMessage || "L'IA n'a pas pu traiter cette demande pour le moment."),
        notConnected ? 'AI_NOT_CONFIGURED' : (error?.code || 'RECORD_AGENT_ERROR')
    );
    if (error?.agentRun) normalized.agentRun = error.agentRun;
    return normalized;
}

function cleanId(value) {
    return value?._id?.toString?.() || value?.toString?.() || String(value || '');
}

function cleanText(value, fallback = '') {
    const text = String(value ?? '').trim();
    return text || fallback;
}

module.exports = {
    TaskAgentError,
    runTaskAgent,
    createTaskAgentErrorComment
};
