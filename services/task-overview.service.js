const ReminderService = require('./reminders/reminder.service');
const { tenantCollection } = require('../middleware/tenant');
const { taskTenantModels } = require('./task-tenant-models.service');
const {
    defaultTaskPriorities,
    getAccountTaskPriorities,
    normalizeTaskPriorityOptions,
    priorityOptionFor,
    priorityColorFor,
    priorityLabelFor,
} = require('./task-priorities.service');

const STATUS_TODO = 'À faire';
const STATUS_DONE = 'Terminé';

const defaultStatuses = [
    { label: STATUS_TODO, color: '#9ca3af', order: 0 },
    { label: 'En cours', color: '#3b82f6', order: 1 },
    { label: 'En revue', color: '#f59e0b', order: 2 },
    { label: STATUS_DONE, color: '#22c55e', order: 3 },
    { label: 'Bloqué', color: '#ef4444', order: 4 },
];

const defaultPriorities = defaultTaskPriorities;

function cleanText(value, fallback = '') {
    const text = String(value ?? '').trim();
    if (!text || ['false', 'null', 'undefined'].includes(text.toLowerCase())) return fallback;
    return text;
}

function normalizeOptions(options, fallback) {
    const source = Array.isArray(options) && options.length ? options : fallback;
    return source
        .map((item, index) => ({
            label: cleanText(item?.label, ''),
            color: typeof item?.color === 'string' ? item.color : '',
            order: Number.isFinite(Number(item?.order)) ? Number(item.order) : index,
        }))
        .filter(item => item.label)
        .sort((a, b) => a.order - b.order);
}

function optionColor(options, label, fallback = '#9ca3af') {
    const found = (options || []).find(item => item.label === label);
    return found?.color || fallback;
}

function normalizeStatus(value) {
    const text = cleanText(value, STATUS_TODO).toLowerCase();
    if (text.includes('termin') || text === 'done' || text === 'completed') return STATUS_DONE;
    return STATUS_TODO;
}

function normalizePriority(value, options = defaultPriorities) {
    return priorityLabelFor(value, options);
}

function normalizeTaskTags(tags = [], options = []) {
    const optionByLabel = new Map((Array.isArray(options) ? options : [])
        .map((item, index) => [cleanText(item?.label || item, '').toLowerCase(), {
            label: cleanText(item?.label || item, ''),
            color: item?.color || '#6366f1',
            order: Number.isFinite(Number(item?.order)) ? Number(item.order) : index,
        }]));
    const seen = new Set();
    return (Array.isArray(tags) ? tags : [])
        .map((item, index) => {
            const label = cleanText(item?.label || item, '');
            const option = optionByLabel.get(label.toLowerCase());
            return {
                label,
                color: item?.color || option?.color || '#6366f1',
                order: Number.isFinite(Number(item?.order)) ? Number(item.order) : (option?.order ?? index),
            };
        })
        .filter(item => {
            const key = item.label.toLowerCase();
            if (!item.label || seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .sort((a, b) => a.order - b.order);
}

function normalizeTaskSubtasks(subtasks = []) {
    return (Array.isArray(subtasks) ? subtasks : [])
        .map((item, index) => ({
            _id: item?._id?.toString?.() || String(item?._id || ''),
            title: cleanText(item?.title || item, ''),
            done: item?.done === true,
            order: Number.isFinite(Number(item?.order)) ? Number(item.order) : index,
            completedAt: item?.completedAt || null,
            createdAt: item?.createdAt || null,
        }))
        .filter(item => item.title)
        .sort((a, b) => a.order - b.order)
        .map((item, index) => ({ ...item, order: index }));
}

function cleanListLabel(label, fallback = 'Liste des tâches') {
    const text = cleanText(label, fallback);
    const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    if (normalized === 'general' || /^taches?\s+du\s+jour$/.test(normalized)) return 'Liste des tâches';
    return text;
}

function isTodayList(list) {
    const normalized = cleanText(list?.label, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
    return normalized === 'general' || /^taches?\s+du\s+jour$/.test(normalized);
}

function parseColorInt(color, fallback = 0xFF6F55DC) {
    const hex = cleanText(color, '').replace('#', '');
    if (!/^[0-9a-f]{6}$/i.test(hex)) return fallback;
    return Number.parseInt(`FF${hex}`, 16);
}

function resolveTimeZone(value) {
    const fallback = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const zone = cleanText(value, '');
    if (!zone) return fallback;
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: zone }).format(new Date());
        return zone;
    } catch (_) {
        return fallback;
    }
}

function createDateTools(query = {}) {
    const timeZone = resolveTimeZone(query.tz || 'Africa/Casablanca');
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    const formatInTimeZone = value => {
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        const parts = Object.fromEntries(formatter.formatToParts(date).map(part => [part.type, part.value]));
        return `${parts.year}-${parts.month}-${parts.day}`;
    };
    const valueHasExplicitTime = value => {
        if (!value) return false;
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) return false;
        return date.getUTCHours() !== 0
            || date.getUTCMinutes() !== 0
            || date.getUTCSeconds() !== 0
            || date.getUTCMilliseconds() !== 0;
    };
    const dateOnlyKey = value => {
        if (!value) return '';
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
    };
    const formatKey = value => valueHasExplicitTime(value) ? formatInTimeZone(value) : dateOnlyKey(value);
    const addDays = days => {
        const date = new Date();
        date.setUTCDate(date.getUTCDate() + days);
        return formatInTimeZone(date);
    };
    const requestedDate = cleanText(query.date, '');
    const day = cleanText(query.day, 'today').toLowerCase();
    const explicitDate = /^\d{4}-\d{2}-\d{2}$/.test(requestedDate);
    const dateKey = explicitDate
        ? requestedDate
        : day === 'tomorrow'
            ? addDays(1)
            : formatInTimeZone(new Date());

    return {
        timeZone,
        dateKey,
        day,
        explicitDate,
        todayKey: formatInTimeZone(new Date()),
        formatKey,
    };
}

function taskScheduleDateKey(task, tools) {
    const value = task?.startDate || task?.dueDate || null;
    return value ? tools.formatKey(value) : '';
}

function taskOverdueDateKey(task, tools) {
    const value = task?.dueDate || task?.startDate || null;
    return value ? tools.formatKey(value) : '';
}

function taskMatchesDate(task, tools) {
    const key = taskScheduleDateKey(task, tools);
    if (key) return key === tools.dateKey;
    return tools.dateKey === tools.todayKey ? !!(task?.isDayPriority || task?.listIsToday) : false;
}

function taskTimestamp(value) {
    const time = new Date(value || 0).getTime();
    return Number.isNaN(time) ? 0 : time;
}

function isDone(task) {
    return task?.status === STATUS_DONE || task?.done === true;
}

function serializeTaskRow(req, task, list, record, entity, reminder = null, options = {}) {
    const statuses = normalizeOptions(list?.statuses, defaultStatuses);
    const priorities = normalizeTaskPriorityOptions(options.priorities || list?.priorities, defaultPriorities);
    const status = cleanText(task.status, STATUS_TODO);
    const priorityOption = priorityOptionFor(task.priority, priorities);
    const priority = priorityOption.label;
    const recordTitle = record?.computedTitle || record?.referenceTitle || record?.title || 'Sans titre';
    const listId = list?._id?.toString?.() || task.taskListId?.toString?.() || '';
    const recordId = record?._id?.toString?.() || task.recordId?.toString?.() || '';
    const entitySlug = entity?.slug || '';
    const taskId = task._id?.toString?.() || String(task._id || '');
    const recordColor = record?.color || entity?.color || '#4361ee';

    return {
        id: taskId,
        _id: taskId,
        title: cleanText(task.title, 'Sans titre'),
        description: task.description || '',
        status,
        statusColor: task.statusColor || optionColor(statuses, status, '#9ca3af'),
        priority,
        priorityColor: priorityColorFor(priority, priorities, task.priorityColor || ''),
        tags: normalizeTaskTags(task.tags, list?.tags),
        tagOptions: normalizeTaskTags(list?.tags, list?.tags),
        subtasks: normalizeTaskSubtasks(task.subtasks),
        done: status === STATUS_DONE,
        isDayPriority: !!task.isDayPriority,
        dueDate: task.dueDate || null,
        startDate: task.startDate || null,
        createdAt: task.createdAt || null,
        updatedAt: task.updatedAt || null,
        completedAt: task.completedAt || null,
        assignedTo: task.assignedTo || '',
        order: Number.isFinite(Number(task.order)) ? Number(task.order) : 0,
        attachments: Array.isArray(task.attachments) ? task.attachments.map(att => ({
            _id: att._id?.toString?.() || String(att._id || ''),
            filename: att.filename || '',
            originalName: att.originalName || att.filename || 'Fichier',
            mimeType: att.mimeType || '',
            size: Number(att.size || 0),
        })) : [],
        hasAttachment: Array.isArray(task.attachments) && task.attachments.length > 0,
        listId,
        taskListId: listId,
        listLabel: cleanListLabel(list?.label),
        listColor: list?.color || '#6366f1',
        listIcon: list?.icon || 'solar:checklist-bold-duotone',
        listIsToday: isTodayList(list),
        recordId,
        recordTitle,
        recordIcon: record?.icon || entity?.icon || 'solar:folder-bold-duotone',
        recordColor,
        recordColorInt: parseColorInt(recordColor),
        entityName: entity?.name || 'Sans entité',
        entitySlug,
        entityIcon: entity?.icon || 'solar:folder-bold-duotone',
        entityColor: entity?.color || '#4361ee',
        reminder: ReminderService.serializeReminder(reminder),
        link: recordId && entitySlug
            ? `/account/${req.account_number}/record/${entitySlug}/${recordId}/tasks?openTask=${taskId}`
            : `/account/${req.account_number}/tasks`,
    };
}

function compareBoardTasks(tools) {
    const overdueRank = task => {
        const key = taskOverdueDateKey(task, tools);
        return !isDone(task) && key && key < tools.dateKey ? 0 : 1;
    };
    return (a, b) => {
        const aoRank = overdueRank(a);
        const boRank = overdueRank(b);
        if (aoRank !== boRank) return aoRank - boRank;
        const ao = Number.isFinite(Number(a.order)) ? Number(a.order) : 0;
        const bo = Number.isFinite(Number(b.order)) ? Number(b.order) : 0;
        if (ao !== bo) return ao - bo;
        const ad = taskTimestamp(a.startDate || a.dueDate || 8640000000000000);
        const bd = taskTimestamp(b.startDate || b.dueDate || 8640000000000000);
        if (ad !== bd) return ad - bd;
        return taskTimestamp(a.createdAt) - taskTimestamp(b.createdAt);
    };
}

function compareCompletedTasks(a, b) {
    const at = taskTimestamp(a.completedAt || a.updatedAt);
    const bt = taskTimestamp(b.completedAt || b.updatedAt);
    if (at !== bt) return bt - at;
    const ao = Number.isFinite(Number(a.order)) ? Number(a.order) : 0;
    const bo = Number.isFinite(Number(b.order)) ? Number(b.order) : 0;
    if (ao !== bo) return ao - bo;
    return taskTimestamp(b.createdAt) - taskTimestamp(a.createdAt);
}

function compareListTasks(a, b) {
    const aDone = isDone(a) ? 1 : 0;
    const bDone = isDone(b) ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone;
    const ao = Number.isFinite(Number(a.order)) ? Number(a.order) : 0;
    const bo = Number.isFinite(Number(b.order)) ? Number(b.order) : 0;
    if (ao !== bo) return ao - bo;
    return taskTimestamp(b.createdAt) - taskTimestamp(a.createdAt);
}

async function buildTaskBoard(req, options = {}) {
    const Entity = await tenantCollection(req, 'Entity');
    const Record = await tenantCollection(req, 'Record');
    const tools = createDateTools(req.query || {});
    const includeAllTasks = options.includeAllTasks === true;
    const includeOpenTasksSorted = options.includeOpenTasksSorted === true;
    const includeTasksByRecord = options.includeTasksByRecord === true;
    const recordIds = await Record.find({}).distinct('_id');
    const accountPriorities = await getAccountTaskPriorities(req);
    const empty = {
        success: true,
        schedule: tools.day,
        dateKey: tools.dateKey,
        timeZone: tools.timeZone,
        todayTasks: [],
        tasks: [],
        overdueTasks: [],
        completedToday: [],
        taskLists: [],
        priorities: accountPriorities,
        stats: { totalTasks: 0, doneTasks: 0, openTasks: 0, todayTasks: 0, overdueCount: 0, listsCount: 0 },
    };
    if (includeTasksByRecord) empty.tasksByRecord = [];
    if (includeAllTasks) empty.allTasks = [];
    if (includeOpenTasksSorted) empty.openTasksSorted = [];
    if (!recordIds.length) return empty;

    const { TaskList, RecordTask } = await taskTenantModels(req);
    const [allLists, allTasks] = await Promise.all([
        TaskList.find({ recordId: { $in: recordIds } }).sort({ order: 1, createdAt: 1 }).lean(),
        RecordTask.find({ recordId: { $in: recordIds } }).sort({ order: 1, createdAt: -1 }).lean(),
    ]);

    const recordIdSet = new Set();
    allLists.forEach(list => { if (list?.recordId) recordIdSet.add(list.recordId.toString()); });
    allTasks.forEach(task => { if (task?.recordId) recordIdSet.add(task.recordId.toString()); });

    const records = recordIdSet.size
        ? await Record.find({ _id: { $in: [...recordIdSet] } })
            .select('title computedTitle referenceTitle entityId icon color updatedAt createdAt')
            .lean()
        : [];
    const recordMap = new Map(records.map(record => [record._id.toString(), record]));
    const entityIds = [...new Set(records.map(record => record.entityId?.toString()).filter(Boolean))];
    const entities = entityIds.length
        ? await Entity.find({ _id: { $in: entityIds } }).select('name slug icon color').lean()
        : [];
    const entityMap = new Map(entities.map(entity => [entity._id.toString(), entity]));
    const listMap = new Map(allLists.map(list => [list._id.toString(), list]));
    const reminderMap = await ReminderService.scheduledReminderMap({
        accountNumber: req.account_number,
        userId: req.user?._id,
        targetType: 'task',
        targetIds: allTasks.map(task => task._id),
    });

    const rows = allTasks
        .filter(task => recordMap.has(task.recordId?.toString?.() || ''))
        .map(task => {
            const record = recordMap.get(task.recordId?.toString?.() || '');
            const entity = record?.entityId ? entityMap.get(record.entityId.toString()) : null;
            return serializeTaskRow(
                req,
                task,
                listMap.get(task.taskListId?.toString?.() || ''),
                record,
                entity,
                reminderMap.get(task._id?.toString?.() || ''),
                { priorities: accountPriorities }
            );
        });

    const boardSorter = compareBoardTasks(tools);
    const isBeforeTarget = task => {
        const key = taskOverdueDateKey(task, tools);
        return !!key && key < tools.dateKey;
    };
    const isOverdue = task => !isDone(task) && isBeforeTarget(task);
    const selected = rows
        .filter(task => tools.day === 'overdue' ? isOverdue(task) : taskMatchesDate(task, tools))
        .sort(boardSorter);
    const completedToday = rows
        .filter(task => isDone(task) && taskMatchesDate(task, tools))
        .sort(compareCompletedTasks);
    const overdueTasks = rows.filter(isOverdue).sort(boardSorter);
    const openTasksSorted = rows.filter(task => !isDone(task)).sort(boardSorter);

    const tasksByList = {};
    rows.forEach(task => {
        if (!task.listId) return;
        if (!tasksByList[task.listId]) tasksByList[task.listId] = [];
        tasksByList[task.listId].push(task);
    });

    const preferredListId = options.preferredListId ? String(options.preferredListId) : '';
    const listTaskLimit = Number.isFinite(Number(options.listTaskLimit)) ? Number(options.listTaskLimit) : 0;
    const taskLists = allLists
        .filter(list => recordMap.has(list.recordId?.toString?.() || ''))
        .map(list => {
            const record = recordMap.get(list.recordId?.toString?.() || '');
            const entity = record?.entityId ? entityMap.get(record.entityId.toString()) : null;
            const tasks = (tasksByList[list._id.toString()] || []).slice().sort(compareListTasks);
            const recordId = record?._id?.toString?.() || '';
            const entitySlug = entity?.slug || '';
            return {
                id: list._id.toString(),
                _id: list._id.toString(),
                label: cleanListLabel(list.label),
                rawLabel: list.label || '',
                color: list.color || '#6366f1',
                icon: list.icon || 'solar:checklist-bold-duotone',
                statuses: normalizeOptions(list.statuses, defaultStatuses),
                priorities: accountPriorities,
                recordId,
                recordTitle: record?.computedTitle || record?.referenceTitle || record?.title || 'Sans titre',
                recordIcon: record?.icon || entity?.icon || 'solar:folder-bold-duotone',
                recordColor: record?.color || entity?.color || '#4361ee',
                entityName: entity?.name || 'Sans entité',
                entitySlug,
                entityIcon: entity?.icon || 'solar:folder-bold-duotone',
                entityColor: entity?.color || '#4361ee',
                link: recordId && entitySlug ? `/account/${req.account_number}/record/${entitySlug}/${recordId}/tasks` : `/account/${req.account_number}/tasks`,
                count: tasks.length,
                doneCount: tasks.filter(isDone).length,
                tasks: listTaskLimit > 0 ? tasks.slice(0, listTaskLimit) : tasks,
            };
        })
        .sort((a, b) => {
            if (preferredListId) {
                const ap = a.id === preferredListId ? 0 : 1;
                const bp = b.id === preferredListId ? 0 : 1;
                if (ap !== bp) return ap - bp;
            }
            return a.label.localeCompare(b.label);
        });

    let tasksByRecord = [];
    if (includeTasksByRecord) {
        const tasksByRecordMap = {};
        rows.forEach(task => {
            if (!task.recordId) return;
            if (!tasksByRecordMap[task.recordId]) {
                tasksByRecordMap[task.recordId] = {
                    id: task.recordId,
                    title: task.recordTitle,
                    entityName: task.entityName,
                    icon: task.recordIcon || task.entityIcon,
                    color: task.recordColor || task.entityColor,
                    link: task.entitySlug ? `/account/${req.account_number}/record/${task.entitySlug}/${task.recordId}/tasks` : `/account/${req.account_number}/tasks`,
                    totalTasks: 0,
                    doneTasks: 0,
                    openTasks: 0,
                };
            }
            tasksByRecordMap[task.recordId].totalTasks += 1;
            if (isDone(task)) tasksByRecordMap[task.recordId].doneTasks += 1;
            else tasksByRecordMap[task.recordId].openTasks += 1;
        });
        tasksByRecord = Object.values(tasksByRecordMap)
            .filter(group => group.openTasks > 0)
            .sort((a, b) => b.openTasks - a.openTasks || a.title.localeCompare(b.title))
            .slice(0, options.tasksByRecordLimit || 8);
    }

    const doneTasks = rows.filter(isDone).length;
    const overdueCount = overdueTasks.length;

    const response = {
        success: true,
        schedule: tools.day,
        dateKey: tools.dateKey,
        timeZone: tools.timeZone,
        todayTasks: selected,
        tasks: selected.filter(task => !isDone(task)),
        overdueTasks,
        completedToday,
        taskLists,
        priorities: accountPriorities,
        stats: {
            totalTasks: rows.length,
            doneTasks,
            openTasks: rows.length - doneTasks,
            todayTasks: selected.length,
            overdueCount,
            listsCount: allLists.length,
        },
    };
    if (includeTasksByRecord) response.tasksByRecord = tasksByRecord;
    if (includeAllTasks) response.allTasks = rows.slice().sort(boardSorter);
    if (includeOpenTasksSorted) response.openTasksSorted = openTasksSorted;
    return response;
}

module.exports = {
    STATUS_TODO,
    STATUS_DONE,
    defaultStatuses,
    defaultPriorities,
    cleanText,
    normalizeOptions,
    optionColor,
    normalizeStatus,
    normalizePriority,
    cleanListLabel,
    isTodayList,
    resolveTimeZone,
    createDateTools,
    taskScheduleDateKey,
    compareCompletedTasks,
    serializeTaskRow,
    buildTaskBoard,
};
