const mongoose = require('mongoose');

const { tenantCollection } = require('../middleware/tenant');
const { taskTenantModels } = require('./task-tenant-models.service');
const TaskOverview = require('./task-overview.service');
const { getAccountTaskPriorities } = require('./task-priorities.service');

const PERSONAL_SPACE_SLUG = 'dexapp-personal-space';
const DEFAULT_ACCOUNT_TASK_LIST_LABEL = 'Liste des tâches';
const SHOPPING_TASK_LIST_LABEL = 'Liste de courses';
const defaultTaskListDisplayOptions = {
    showPriority: true,
    showTags: true,
    showAttachments: true,
    showReminders: true,
    showCompleted: true,
    dayMode: false,
    compactMode: false,
    accentRows: true,
};

function cleanText(value, fallback = '') {
    if (typeof value !== 'string') return fallback;
    const text = value.trim();
    if (!text || ['false', 'null', 'undefined'].includes(text.toLowerCase())) return fallback;
    return text;
}

function normalizeOptionLabel(value) {
    return cleanText(value, '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f\u0610-\u061a\u0640\u064b-\u065f\u0670\u06d6-\u06ed\u200c-\u200f\u202a-\u202e]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

function cleanTaskListLabel(value, fallback = DEFAULT_ACCOUNT_TASK_LIST_LABEL) {
    const label = cleanText(value, fallback);
    const lower = label.toLowerCase();
    if (lower === 'général' || lower === 'general' || lower === 'tâches du jour' || lower === 'taches du jour') {
        return DEFAULT_ACCOUNT_TASK_LIST_LABEL;
    }
    return label;
}

function cleanTaskListColor(value, fallback = '#6366f1') {
    const color = cleanText(value, fallback);
    return /^#[0-9a-f]{6}$/i.test(color) ? color : fallback;
}

function cleanTaskListIcon(value, fallback = 'solar:checklist-bold-duotone') {
    const icon = cleanText(value, fallback).toLowerCase();
    return /^[a-z0-9:_-]{2,96}$/.test(icon) ? icon : fallback;
}

function cleanTaskListViewMode(value, fallback = 'list') {
    return ['list', 'kanban'].includes(value) ? value : fallback;
}

function normalizeTaskTagOptions(options = []) {
    const seen = new Set();
    return (Array.isArray(options) ? options : [])
        .map((item, index) => ({
            label: cleanText(item?.label || item, ''),
            color: cleanTaskListColor(item?.color, '#6366f1'),
            order: Number.isFinite(Number(item?.order)) ? Number(item.order) : index,
        }))
        .filter(item => {
            const key = normalizeOptionLabel(item.label);
            if (!item.label || seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .sort((a, b) => a.order - b.order);
}

function normalizeTaskTags(tags = [], options = []) {
    const tagOptions = normalizeTaskTagOptions(options);
    const optionByLabel = new Map(tagOptions.map(item => [normalizeOptionLabel(item.label), item]));
    const seen = new Set();
    return (Array.isArray(tags) ? tags : [])
        .map((item, index) => {
            const label = cleanText(item?.label || item, '');
            const option = optionByLabel.get(normalizeOptionLabel(label));
            return {
                label,
                color: cleanTaskListColor(option?.color || item?.color, '#6366f1'),
                order: Number.isFinite(Number(item?.order)) ? Number(item.order) : (option?.order ?? index),
            };
        })
        .filter(item => {
            const key = normalizeOptionLabel(item.label);
            if (!item.label || seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .sort((a, b) => a.order - b.order);
}

function mergeTaskTagOptions(...groups) {
    return normalizeTaskTagOptions(groups.flatMap(group => Array.isArray(group) ? group : []));
}

async function seedAccountTaskTags(req, existingTags = []) {
    const { TaskTag, TaskList, RecordTask } = await taskTenantModels(req);
    const [lists, tasks] = await Promise.all([
        TaskList.find({}).select('tags').lean(),
        RecordTask.find({ tags: { $exists: true, $ne: [] } }).select('tags').lean(),
    ]);
    const discovered = mergeTaskTagOptions(
        existingTags,
        ...lists.map(list => list.tags || []),
        ...tasks.map(task => task.tags || []),
    );
    if (!discovered.length) return existingTags;

    const existingKeys = new Set(existingTags.map(tag => normalizeOptionLabel(tag.label)));
    const missing = discovered.filter(tag => !existingKeys.has(normalizeOptionLabel(tag.label)));
    if (!missing.length) return discovered;

    for (const tag of missing) {
        const labelKey = normalizeOptionLabel(tag.label);
        await TaskTag.updateOne(
            { labelKey },
            {
                $setOnInsert: {
                    label: tag.label,
                    labelKey,
                    color: cleanTaskListColor(tag.color, '#6366f1'),
                    order: Number.isFinite(Number(tag.order)) ? Number(tag.order) : discovered.length,
                    createdBy: req.user?._id,
                },
            },
            { upsert: true },
        );
    }
    const docs = await TaskTag.find({}).sort({ order: 1, label: 1 }).lean();
    return normalizeTaskTagOptions(docs);
}

async function getAccountTaskTags(req, options = {}) {
    const { TaskTag } = await taskTenantModels(req);
    const docs = await TaskTag.find({}).sort({ order: 1, label: 1 }).lean();
    const tags = normalizeTaskTagOptions(docs);
    if (options.seed === false) return tags;
    return seedAccountTaskTags(req, tags);
}

async function upsertAccountTaskTags(req, tags = []) {
    const { TaskTag } = await taskTenantModels(req);
    const current = await getAccountTaskTags(req);
    const currentByKey = new Map(current.map(tag => [normalizeOptionLabel(tag.label), tag]));
    const normalizedInput = normalizeTaskTagOptions(tags);
    let nextOrder = current.length;
    let changed = false;

    for (const tag of normalizedInput) {
        const labelKey = normalizeOptionLabel(tag.label);
        if (!labelKey || currentByKey.has(labelKey)) continue;
        const doc = {
            label: tag.label,
            labelKey,
            color: cleanTaskListColor(tag.color, '#6366f1'),
            order: nextOrder++,
            createdBy: req.user?._id,
        };
        await TaskTag.updateOne({ labelKey }, { $setOnInsert: doc }, { upsert: true });
        currentByKey.set(labelKey, doc);
        changed = true;
    }

    const nextTags = normalizeTaskTagOptions([...currentByKey.values()]);
    return nextTags;
}

async function mirrorAccountTagsToLists(req, tags = []) {
    const { TaskList } = await taskTenantModels(req);
    await TaskList.updateMany({}, { $set: { tags: normalizeTaskTagOptions(tags) } });
}

function normalizeTaskSubtasks(subtasks = []) {
    const seen = new Set();
    return (Array.isArray(subtasks) ? subtasks : [])
        .map((item, index) => {
            const title = cleanText(item?.title || item, '');
            const key = item?._id ? String(item._id) : `${title.toLowerCase()}-${index}`;
            return {
                ...(item?._id ? { _id: item._id } : {}),
                title,
                done: item?.done === true,
                order: Number.isFinite(Number(item?.order)) ? Number(item.order) : index,
                completedAt: item?.done === true
                    ? (item.completedAt || new Date())
                    : null,
                createdAt: item?.createdAt || new Date(),
                _key: key,
            };
        })
        .filter(item => {
            if (!item.title || seen.has(item._key)) return false;
            seen.add(item._key);
            delete item._key;
            return true;
        })
        .sort((a, b) => a.order - b.order)
        .map((item, index) => ({ ...item, order: index }));
}

function normalizeTaskListDisplayOptions(value = {}) {
    const source = value && typeof value === 'object' ? value : {};
    return Object.fromEntries(
        Object.entries(defaultTaskListDisplayOptions).map(([key, fallback]) => [
            key,
            source[key] === undefined ? fallback : source[key] !== false,
        ]),
    );
}

function recordTitle(record = {}, fallback = 'Sans titre') {
    return cleanText(record.computedTitle || record.referenceTitle || record.title, fallback);
}

function defaultRecordTaskListLabel(record = {}) {
    const title = recordTitle(record, '');
    return title || 'Tâches du record';
}

function isPersonalTaskRecord(record = {}, entity = {}) {
    return record.slug === PERSONAL_SPACE_SLUG || entity.slug === PERSONAL_SPACE_SLUG || entity.isSystem === true;
}

function taskStats(tasks = []) {
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter(task => task.status === TaskOverview.STATUS_DONE || task.done === true).length;
    const members = [...new Set(tasks
        .map(task => cleanText(task.assignedTo, ''))
        .filter(Boolean))]
        .slice(0, 4);
    return {
        totalTasks,
        doneTasks,
        openTasks: Math.max(0, totalTasks - doneTasks),
        members,
    };
}

function listContextType(list = {}, record = {}, entity = {}) {
    if (list.contextType === 'account' || list.contextType === 'record') return list.contextType;
    return isPersonalTaskRecord(record, entity) ? 'account' : 'record';
}

function serializeTaskListSummary(req, list = {}, tasks = [], record = {}, entity = {}) {
    const listId = list._id?.toString?.() || String(list._id || '');
    const recordId = record._id?.toString?.() || list.recordId?.toString?.() || '';
    const entityId = entity._id?.toString?.() || record.entityId?.toString?.() || '';
    const contextType = listContextType(list, record, entity);
    const label = cleanTaskListLabel(list.label);
    const color = cleanTaskListColor(list.color, contextType === 'account' ? '#6366f1' : (record.color || entity.color || '#6366f1'));
    const icon = cleanTaskListIcon(list.icon, contextType === 'account' ? 'solar:checklist-bold-duotone' : 'solar:list-check-bold-duotone');
    const stats = taskStats(tasks);
    const entitySlug = cleanText(entity.slug, '');
    const link = contextType === 'record' && entitySlug && recordId
        ? `/account/${req.account_number}/record/${entitySlug}/${recordId}/tasks`
        : `/account/${req.account_number}/tasks`;

    return {
        id: listId,
        _id: listId,
        listId,
        label,
        rawLabel: list.label || label,
        color,
        icon,
        viewMode: cleanTaskListViewMode(list.viewMode, 'list'),
        tags: normalizeTaskTagOptions(list.tags),
        displayOptions: normalizeTaskListDisplayOptions(list.displayOptions),
        order: Number.isFinite(Number(list.order)) ? Number(list.order) : 0,
        myListOrder: Number.isFinite(Number(list.myListOrder)) ? Number(list.myListOrder) : 0,
        isDefault: !!list.isDefault,
        showInMyLists: !!list.showInMyLists,
        contextType,
        scope: contextType === 'account' ? 'personal' : 'record',
        badge: contextType === 'record' ? cleanText(entity.name, 'Record') : 'Mes listes',
        isShared: false,
        isFavorite: false,
        recordId,
        recordTitle: recordTitle(record, contextType === 'account' ? 'Espace perso' : 'Sans titre'),
        recordSlug: cleanText(record.slug, ''),
        recordIcon: cleanTaskListIcon(record.icon || entity.icon, 'solar:folder-bold-duotone'),
        recordColor: cleanTaskListColor(record.color || entity.color, '#6366f1'),
        entityId,
        entityName: cleanText(entity.name, contextType === 'account' ? 'Espace perso' : 'Sans entité'),
        entitySlug,
        entityIcon: cleanTaskListIcon(entity.icon, 'solar:folder-bold-duotone'),
        entityColor: cleanTaskListColor(entity.color, '#6366f1'),
        link,
        ...stats,
    };
}

async function loadTenantRecordMaps(req) {
    const Entity = await tenantCollection(req, 'Entity');
    const Record = await tenantCollection(req, 'Record');
    const records = await Record.find({})
        .select('_id title computedTitle referenceTitle entityId icon color slug image')
        .lean();
    const entityIds = [...new Set(records.map(record => record.entityId?.toString()).filter(Boolean))];
    const entities = entityIds.length
        ? await Entity.find({ _id: { $in: entityIds } }).select('name slug icon color isSystem').lean()
        : [];

    const recordMap = new Map(records.map(record => [record._id.toString(), record]));
    const entityMap = new Map(entities.map(entity => [entity._id.toString(), entity]));

    return { records, entities, recordMap, entityMap };
}

async function ensurePersonalTaskRecord(req) {
    const Entity = await tenantCollection(req, 'Entity');
    const Record = await tenantCollection(req, 'Record');

    let entity = await Entity.findOne({ slug: PERSONAL_SPACE_SLUG });
    if (!entity) {
        entity = await Entity.create({
            name: 'Espace perso',
            nameSingular: 'Espace perso',
            namePlural: 'Espace perso',
            slug: PERSONAL_SPACE_SLUG,
            icon: 'solar:user-rounded-bold-duotone',
            color: '#7c3aed',
            isSystem: true,
            enabledStandardFields: ['title', 'description'],
            referenceTitleTokens: [{ t: 'field', id: 'title' }],
            createdBy: req.user?._id,
        });
    }

    let record = await Record.findOne({ entityId: entity._id, slug: PERSONAL_SPACE_SLUG });
    if (!record) {
        record = await Record.create({
            entityId: entity._id,
            title: 'Espace perso',
            computedTitle: 'Espace perso',
            slug: PERSONAL_SPACE_SLUG,
            icon: 'solar:user-rounded-bold-duotone',
            color: '#7c3aed',
            published: true,
            status: 'published',
            createdBy: req.user?._id,
        });
    }

    return { entity, record };
}

async function createAccountTaskList(req, input = {}) {
    const label = cleanTaskListLabel(input.label, '');
    if (!label) {
        const error = new Error('Nom de liste requis');
        error.status = 400;
        throw error;
    }

    const { entity, record } = await ensurePersonalTaskRecord(req);
    const { TaskList } = await taskTenantModels(req);
    const lists = await TaskList.find({ recordId: record._id }).sort({ order: 1, createdAt: 1 });
    const duplicate = lists.find(list => cleanTaskListLabel(list.label).toLowerCase() === label.toLowerCase());
    if (duplicate) {
        let changed = false;
        if (!duplicate.showInMyLists) {
            duplicate.showInMyLists = true;
            changed = true;
        }
        if (duplicate.contextType !== 'account') {
            duplicate.contextType = 'account';
            changed = true;
        }
        if (!Number(duplicate.myListOrder)) {
            const maxMyList = await TaskList.findOne({ showInMyLists: true }).sort({ myListOrder: -1 }).select('myListOrder').lean();
            duplicate.myListOrder = (Number(maxMyList?.myListOrder) || 0) + 1;
            changed = true;
        }
        if (changed) {
            await duplicate.save();
        }
        return serializeOneTaskList(req, duplicate);
    }

    const priorities = await getAccountTaskPriorities(req);
    const maxMyList = await TaskList.findOne({ showInMyLists: true }).sort({ myListOrder: -1 }).select('myListOrder').lean();
    const list = await TaskList.create({
        recordId: record._id,
        label,
        color: cleanTaskListColor(input.color, '#6366f1'),
        icon: cleanTaskListIcon(input.icon, 'solar:list-check-bold-duotone'),
        viewMode: cleanTaskListViewMode(input.viewMode, 'list'),
        tags: normalizeTaskTagOptions(input.tags),
        displayOptions: normalizeTaskListDisplayOptions(input.displayOptions),
        order: lists.length,
        myListOrder: (Number(maxMyList?.myListOrder) || 0) + 1,
        contextType: 'account',
        isDefault: false,
        showInMyLists: true,
        statuses: TaskOverview.defaultStatuses,
        priorities,
    });

    return serializeTaskListSummary(req, list.toObject ? list.toObject() : list, [], record.toObject ? record.toObject() : record, entity.toObject ? entity.toObject() : entity);
}

async function updateTaskListConfig(req, listId, input = {}) {
    const id = String(listId || '');
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    const label = cleanTaskListLabel(input.label, '');
    if (!label) {
        const error = new Error('Nom de liste requis');
        error.status = 400;
        throw error;
    }

    const { TaskList, RecordTask } = await taskTenantModels(req);
    const list = await TaskList.findById(id);
    if (!list) return null;

    list.label = label;
    list.color = cleanTaskListColor(input.color, list.color || '#6366f1');
    list.icon = cleanTaskListIcon(input.icon, list.icon || 'solar:list-check-bold-duotone');
    list.viewMode = cleanTaskListViewMode(input.viewMode, list.viewMode || 'list');
    const tagsChanged = input.tags !== undefined;
    const previousTags = normalizeTaskTagOptions(list.tags);
    if (tagsChanged) list.tags = normalizeTaskTagOptions(input.tags);
    if (input.displayOptions !== undefined) list.displayOptions = normalizeTaskListDisplayOptions(input.displayOptions);
    if (input.isDefault === true && list.contextType !== 'account') {
        await TaskList.updateMany({ recordId: list.recordId, _id: { $ne: list._id } }, { $set: { isDefault: false } });
        list.isDefault = true;
    }
    if (list.contextType === 'account') {
        list.showInMyLists = true;
    }
    await list.save();

    if (tagsChanged) await syncTaskTagsWithOptions(RecordTask, list._id, previousTags, list.tags, input.tagRenames || input.renames || []);

    return serializeOneTaskList(req, list);
}

function normalizeTagRenamePairs(renames = []) {
    return (Array.isArray(renames) ? renames : [])
        .map(item => ({
            from: cleanText(item?.from, ''),
            to: cleanText(item?.to, ''),
        }))
        .filter(item => item.from && item.to && normalizeOptionLabel(item.from) !== normalizeOptionLabel(item.to));
}

async function syncTaskTagsForQuery(RecordTask, query = {}, previousOptions = [], nextOptions = [], renames = []) {
    const nextTags = normalizeTaskTagOptions(nextOptions);
    const previousTags = normalizeTaskTagOptions(previousOptions);
    const renameByLabel = new Map(normalizeTagRenamePairs(renames).map(pair => [normalizeOptionLabel(pair.from), pair.to]));
    const nextByLabel = new Map(nextTags.map(tag => [normalizeOptionLabel(tag.label), tag]));
    const previousByLabel = new Map(previousTags.map(tag => [normalizeOptionLabel(tag.label), tag]));
    const allowed = new Set(nextByLabel.keys());
    const tasks = await RecordTask.find(query).select('_id tags');

    for (const task of tasks) {
        const current = normalizeTaskTags(task.tags, previousTags);
        const synced = [];
        const seen = new Set();
        for (const tag of current) {
            const renamed = renameByLabel.get(normalizeOptionLabel(tag.label)) || tag.label;
            const key = normalizeOptionLabel(renamed);
            const option = nextByLabel.get(key);
            if (!allowed.has(key) || !option || seen.has(key)) continue;
            seen.add(key);
            synced.push({
                label: option.label,
                color: option.color || tag.color || previousByLabel.get(normalizeOptionLabel(tag.label))?.color || '#6366f1',
                order: option.order ?? synced.length,
            });
        }
        if (JSON.stringify(task.tags || []) !== JSON.stringify(synced)) {
            task.tags = synced;
            await task.save();
        }
    }
}

async function syncTaskTagsWithOptions(RecordTask, listId, previousOptions = [], nextOptions = [], renames = []) {
    return syncTaskTagsForQuery(RecordTask, { taskListId: listId }, previousOptions, nextOptions, renames);
}

async function replaceAccountTaskTags(req, input = {}) {
    const { TaskTag, RecordTask } = await taskTenantModels(req);
    const previousTags = await getAccountTaskTags(req);
    const nextTags = normalizeTaskTagOptions(input.tags || []);
    const nextKeys = new Set(nextTags.map(tag => normalizeOptionLabel(tag.label)));

    for (const tag of nextTags) {
        const labelKey = normalizeOptionLabel(tag.label);
        await TaskTag.findOneAndUpdate(
            { labelKey },
            {
                $set: {
                    label: tag.label,
                    labelKey,
                    color: cleanTaskListColor(tag.color, '#6366f1'),
                    order: Number.isFinite(Number(tag.order)) ? Number(tag.order) : nextTags.length,
                },
                $setOnInsert: { createdBy: req.user?._id },
            },
            { upsert: true, new: true },
        );
    }

    await TaskTag.deleteMany({
        labelKey: { $nin: [...nextKeys] },
    });
    await syncTaskTagsForQuery(RecordTask, {}, previousTags, nextTags, input.renames || []);
    return nextTags;
}

async function updateTaskListTags(req, listId, input = {}) {
    const id = String(listId || '');
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    const { TaskList } = await taskTenantModels(req);
    const list = await TaskList.findById(id);
    if (!list) return null;

    return replaceAccountTaskTags(req, input);
}

async function listMyTaskLists(req) {
    const { recordMap, entityMap } = await loadTenantRecordMaps(req);
    const recordIds = [...recordMap.keys()];
    if (!recordIds.length) return [];

    const { TaskList, RecordTask } = await taskTenantModels(req);
    const lists = await TaskList.find({
        recordId: { $in: recordIds },
        showInMyLists: true,
    }).sort({ myListOrder: 1, order: 1, createdAt: 1 }).lean();
    if (!lists.length) return [];

    const listIds = lists.map(list => list._id);
    const tasks = await RecordTask.find({ taskListId: { $in: listIds } })
        .select('taskListId status done assignedTo')
        .lean();
    const tasksByListId = new Map();
    for (const task of tasks) {
        const listId = task.taskListId?.toString?.() || '';
        if (!tasksByListId.has(listId)) tasksByListId.set(listId, []);
        tasksByListId.get(listId).push(task);
    }

    return lists.map(list => {
        const record = recordMap.get(list.recordId?.toString?.() || '') || {};
        const entity = record.entityId ? (entityMap.get(record.entityId.toString()) || {}) : {};
        return serializeTaskListSummary(req, list, tasksByListId.get(list._id.toString()) || [], record, entity);
    });
}

async function serializeOneTaskList(req, list) {
    if (!list) return null;
    const Entity = await tenantCollection(req, 'Entity');
    const Record = await tenantCollection(req, 'Record');
    const { RecordTask } = await taskTenantModels(req);
    const record = await Record.findById(list.recordId).select('_id title computedTitle referenceTitle entityId icon color slug image').lean();
    if (!record) return null;
    const entity = record.entityId
        ? await Entity.findById(record.entityId).select('name slug icon color isSystem').lean()
        : {};
    const tasks = await RecordTask.find({ taskListId: list._id }).select('taskListId status done assignedTo').lean();
    return serializeTaskListSummary(req, list.toObject ? list.toObject() : list, tasks, record, entity || {});
}

async function setMyListVisibility(req, listId, enabled = true) {
    const id = String(listId || '');
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    const { TaskList } = await taskTenantModels(req);
    const Record = await tenantCollection(req, 'Record');
    const Entity = await tenantCollection(req, 'Entity');
    const list = await TaskList.findById(id);
    if (!list) return null;

    const record = await Record.findById(list.recordId).select('_id entityId slug').lean();
    if (!record) return null;
    const entity = record.entityId ? await Entity.findById(record.entityId).select('slug isSystem').lean() : {};
    const contextType = listContextType(list, record, entity || {});

    const update = {
        showInMyLists: !!enabled,
        contextType,
    };
    if (contextType === 'account' && !enabled) {
        return serializeOneTaskList(req, list);
    }
    if (enabled && !Number(list.myListOrder)) {
        const max = await TaskList.findOne({ showInMyLists: true }).sort({ myListOrder: -1 }).select('myListOrder').lean();
        update.myListOrder = (Number(max?.myListOrder) || 0) + 1;
    }

    const updated = await TaskList.findByIdAndUpdate(id, { $set: update }, { new: true });
    return serializeOneTaskList(req, updated);
}

module.exports = {
    PERSONAL_SPACE_SLUG,
    DEFAULT_ACCOUNT_TASK_LIST_LABEL,
    SHOPPING_TASK_LIST_LABEL,
    defaultTaskListDisplayOptions,
    cleanText,
    cleanTaskListLabel,
    cleanTaskListColor,
    cleanTaskListIcon,
    cleanTaskListViewMode,
    normalizeOptionLabel,
    normalizeTaskTagOptions,
    normalizeTaskTags,
    getAccountTaskTags,
    upsertAccountTaskTags,
    replaceAccountTaskTags,
    normalizeTaskSubtasks,
    normalizeTaskListDisplayOptions,
    updateTaskListTags,
    defaultRecordTaskListLabel,
    ensurePersonalTaskRecord,
    createAccountTaskList,
    updateTaskListConfig,
    listContextType,
    listMyTaskLists,
    serializeTaskListSummary,
    setMyListVisibility,
};
