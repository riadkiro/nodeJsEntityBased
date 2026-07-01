const GlobalTaskList = require('../models/task-list.model');
const GlobalRecordTask = require('../models/record-task.model');
const GlobalTaskComment = require('../models/task-comment.model');
const GlobalTaskTag = require('../models/task-tag.model');
const { tenantCollection } = require('../middleware/tenant');

async function taskTenantModels(req) {
    const [TaskList, RecordTask, TaskComment, TaskTag] = await Promise.all([
        tenantCollection(req, 'TaskList'),
        tenantCollection(req, 'RecordTask'),
        tenantCollection(req, 'TaskComment'),
        tenantCollection(req, 'TaskTag'),
    ]);

    return {
        TaskList: TaskList || GlobalTaskList,
        RecordTask: RecordTask || GlobalRecordTask,
        TaskComment: TaskComment || GlobalTaskComment,
        TaskTag: TaskTag || GlobalTaskTag,
        usingTenant: Boolean(TaskList && RecordTask && TaskComment && TaskTag),
    };
}

module.exports = {
    taskTenantModels,
    GlobalTaskList,
    GlobalRecordTask,
    GlobalTaskComment,
    GlobalTaskTag,
};
