const test = require('node:test');
const assert = require('node:assert/strict');

const {
    buildMobileAgentReply,
    collectMobileCreatedItems,
    runMobileAiAgent,
} = require('../services/record-ai-task-bridge.service');
const RecordAgentConversation = require('../models/record-agent-conversation.model');
const RecordAiRouter = require('../routes/api/api-record-ai.router');

test('mobile AI reply exposes tasks and subtasks applied by the existing agent', () => {
    const run = {
        summary: 'Le plan a été transformé en actions.',
        status: 'applied',
        proposedActions: [
            {
                tool: 'create_task',
                status: 'applied',
                input: { title: 'Acheter les fournitures' },
                result: { taskId: 'task-1', title: 'Acheter les fournitures' },
            },
            {
                tool: 'create_subtasks',
                status: 'applied',
                result: {
                    createdSubtasks: [
                        { subtaskId: 'subtask-1', title: 'Comparer les prix' },
                    ],
                },
            },
        ],
    };

    assert.deepEqual(collectMobileCreatedItems(run), [
        { title: 'Acheter les fournitures', taskId: 'task-1' },
        { title: 'Comparer les prix', subtaskId: 'subtask-1' },
    ]);
    assert.match(buildMobileAgentReply(run), /1 tâche a été créée/);
    assert.match(buildMobileAgentReply(run), /1 sous-tâche a été créée/);
});

test('agent conversations can be scoped to reusable mobile contexts', () => {
    const schema = RecordAgentConversation.schema;
    assert.ok(schema.path('contextType'));
    assert.ok(schema.path('contextId'));
    assert.ok(schema.path('contextLabel'));
    assert.ok(schema.path('contextType').enumValues.includes('task'));
    assert.ok(schema.path('contextType').enumValues.includes('task_list'));
    assert.ok(schema.path('contextType').enumValues.includes('note'));
});

test('list context reuses the record agent and applies only created tasks', async () => {
    const originalRun = RecordAiRouter.executeRecordAgentRun;
    const originalApply = RecordAiRouter.executeRecordAgentApply;
    let receivedRunInput = null;
    let receivedApplyInput = null;

    RecordAiRouter.executeRecordAgentRun = async (req, input) => {
        receivedRunInput = input;
        return {
            run: {
                _id: 'run-1',
                summary: 'Deux actions trouvées.',
                status: 'review',
                proposedActions: [
                    {
                        id: 'create-1',
                        tool: 'create_task',
                        status: 'proposed',
                        input: { title: 'Acheter du pain' },
                    },
                    {
                        id: 'note-1',
                        tool: 'create_note',
                        status: 'proposed',
                        input: { title: 'Résumé' },
                    },
                ],
            },
            conversation: { _id: 'conversation-1' },
        };
    };
    RecordAiRouter.executeRecordAgentApply = async (req, input) => {
        receivedApplyInput = input;
        return {
            run: {
                _id: 'run-1',
                summary: 'Deux actions trouvées.',
                status: 'partial',
                proposedActions: [
                    {
                        id: 'create-1',
                        tool: 'create_task',
                        status: 'applied',
                        input: { title: 'Acheter du pain' },
                        result: { taskId: 'task-1', title: 'Acheter du pain' },
                    },
                    {
                        id: 'note-1',
                        tool: 'create_note',
                        status: 'proposed',
                        input: { title: 'Résumé' },
                    },
                ],
            },
            conversation: { _id: 'conversation-1' },
        };
    };

    try {
        const result = await runMobileAiAgent({
            req: { tenantDbConnection: {}, account_number: '6804' },
            contextType: 'task_list',
            list: {
                _id: '507f1f77bcf86cd799439011',
                recordId: '507f1f77bcf86cd799439012',
                label: 'Courses',
            },
            recordId: '507f1f77bcf86cd799439012',
            userMessage: 'Crée les tâches de la photo',
            uploadedImageCount: 1,
            imageContent: [{ type: 'input_image', image_url: 'data:image/png;base64,AA==' }],
        });

        assert.equal(receivedRunInput.conversationContext.type, 'task_list');
        assert.equal(receivedRunInput.conversationContext.label, 'Courses');
        assert.equal(receivedRunInput.listContext.uploadedImageCount, 1);
        assert.deepEqual(receivedApplyInput.actionIds, ['create-1']);
        assert.deepEqual(result.createdItems, [
            { title: 'Acheter du pain', taskId: 'task-1' },
        ]);
        assert.equal(result.pendingActionCount, 1);
    } finally {
        RecordAiRouter.executeRecordAgentRun = originalRun;
        RecordAiRouter.executeRecordAgentApply = originalApply;
    }
});
