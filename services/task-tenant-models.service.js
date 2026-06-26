const GlobalTaskList = require('../models/task-list.model');
const GlobalRecordTask = require('../models/record-task.model');
const GlobalTaskComment = require('../models/task-comment.model');
const { tenantCollection } = require('../middleware/tenant');

async function taskTenantModels(req) {
    const [TaskList, RecordTask, TaskComment] = await Promise.all([
        tenantCollection(req, 'TaskList'),
        tenantCollection(req, 'RecordTask'),
        tenantCollection(req, 'TaskComment'),
    ]);

    return {
        TaskList: TaskList || GlobalTaskList,
        RecordTask: RecordTask || GlobalRecordTask,
        TaskComment: TaskComment || GlobalTaskComment,
        usingTenant: Boolean(TaskList && RecordTask && TaskComment),
    };
}

module.exports = {
    taskTenantModels,
    GlobalTaskList,
    GlobalRecordTask,
    GlobalTaskComment,
};
