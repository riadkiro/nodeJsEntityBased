const express = require("express");
const router = express.Router();
const {
    attachSharedDataRoomMode,
    enforceSharedDataRoomMode,
    renderSharedWithYou,
} = require("../middleware/shared-data-room-mode");

router.use(attachSharedDataRoomMode);
router.get("/shared-with-you", renderSharedWithYou);
router.use(enforceSharedDataRoomMode);

router.use("/dashboard", require("./account.router.js"));

// Redirect /dashboard root to /home
router.get("/dashboard", (req, res) => {
    res.redirect(`/account/${req.account_number}/home`);
});

// Admin Panel
router.use("/admin", require("./admin.router.js"));

// AI Assistant
router.use("/", require("./ai-assistant.router.js"));

// Home Page
router.get("/home", (req, res) => {
    res.render("home/home", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

router.use("/entity", require("./entity.router.js"));
router.use("/entity/:entityId/forms", require("./entity-form.router.js"));
router.use("/field-template", require("./field-template.router.js"));
router.use("/field-type", require("./field-type.router.js")); // Admin: Types de champs
router.use("/record", require("./record.router.js"));
router.use("/view", require("./view.router.js"));
router.use("/classification", require("./classification.router.js"));
router.use("/mailbox", require("./mailbox.router.js"));

// LineBuilder (Schema Builder + Document Lines) — MUST be before api-account (has catch-all /:id)
router.use("/", require("./line-schema.router.js"));
router.use("/", require("./document-line.router.js"));
router.use("/", require("./grid-template.router.js"));
router.use("/", require("./grid-snapshot.router.js"));
router.use("/", require("./line-defaults.router.js"));

// Global Drive API (aggregated attachments across all records) — must be before api-account (has /:id catch-all)
router.use("/api", require("./api/api-drive.router.js"));
router.use("/api", require("./api/api-ocr.router.js"));
router.use("/api/record-ai", require("./api/api-record-ai.router.js"));

router.use("/api/team", require("./api/api-team.router.js"));
router.use("/api/team-chat", require("./api/api-team-chat.router.js"));
router.use("/api/record-access", require("./api/api-record-access.router.js"));
router.use("/api/billing", require("./api/api-billing.router.js"));
router.use("/api/newsletter", require("./api/api-newsletter.router.js"));

// Notes Hub API — must be before api-account (has /:id catch-all)
router.use("/api/notes-hub", require("./api/api-notes-hub.router.js"));
// Agenda Hub API — must be before api-account (has /:id catch-all)
router.get("/api/agenda-hub", async (req, res) => {
    try {
        const _tc = require('../middleware/tenant').tenantCollection;
        const { ensureEventsEntity } = require('../services/events-entity.service');
        const Entity = await _tc(req, "Entity");
        const Record = await _tc(req, "Record");

        const eventsEntity = await ensureEventsEntity(req);

        const allEvents = await Record.find({ entityId: eventsEntity._id })
            .populate({ path: 'customFields.field_id', select: 'label type name render ui type_config' })
            .sort({ date: 1 })
            .lean();

        const recordIds = new Set();
        allEvents.forEach(ev => {
            (ev.relations || []).forEach(rel => {
                const ids = Array.isArray(rel.value) ? rel.value : [rel.value];
                ids.forEach(id => { if (id) recordIds.add(id.toString()); });
            });
        });

        const parentRecords = recordIds.size > 0
            ? await Record.find({ _id: { $in: [...recordIds] } }).select('title entityId computedTitle').lean()
            : [];
        const parentEntityIds = [...new Set(parentRecords.map(r => r.entityId?.toString()).filter(Boolean))];
        const parentEntities = parentEntityIds.length > 0
            ? await Entity.find({ _id: { $in: parentEntityIds } }).select('name slug icon color').lean()
            : [];

        const entityLookup = {};
        parentEntities.forEach(e => { entityLookup[e._id.toString()] = e; });
        const recordLookup = {};
        parentRecords.forEach(r => { recordLookup[r._id.toString()] = r; });

        const entityMap = {};
        allEvents.forEach(ev => {
            let parentId = null;
            (ev.relations || []).forEach(rel => {
                const ids = Array.isArray(rel.value) ? rel.value : [rel.value];
                if (ids[0]) parentId = ids[0].toString();
            });
            if (!parentId) return;
            const parent = recordLookup[parentId];
            if (!parent) return;
            const eId = parent.entityId?.toString() || 'unknown';
            const entityInfo = entityLookup[eId] || {};
            if (!entityMap[eId]) {
                entityMap[eId] = {
                    entityId: eId, entityName: entityInfo.name || 'Unknown',
                    entitySlug: entityInfo.slug || '',
                    entityIcon: entityInfo.icon || 'solar:folder-bold-duotone',
                    entityColor: entityInfo.color || '#4361ee', records: {}
                };
            }
            if (!entityMap[eId].records[parentId]) {
                entityMap[eId].records[parentId] = {
                    recordId: parentId,
                    recordTitle: parent.computedTitle || parent.title || 'Sans titre',
                    eventCount: 0
                };
            }
            entityMap[eId].records[parentId].eventCount++;
        });

        const entities = Object.values(entityMap).map(e => ({
            ...e,
            records: Object.values(e.records).sort((a, b) => a.recordTitle.localeCompare(b.recordTitle)),
            totalEvents: Object.values(e.records).reduce((sum, r) => sum + r.eventCount, 0)
        }));

        res.json({ success: true, events: allEvents, entities, entityData: eventsEntity });
    } catch (error) {
        console.error('[AgendaHub] Error:', error);
        res.status(500).json({ error: error.message });
    }
});
// Tasks Hub API — must be before api-account (has /:id catch-all)
const ReminderService = require('../services/reminders/reminder.service');
const { taskTenantModels } = require('../services/task-tenant-models.service');
const TaskOverview = require('../services/task-overview.service');
const {
    getAccountTaskPriorities,
    priorityOptionFor,
} = require('../services/task-priorities.service');
const TaskListsService = require('../services/task-lists.service');
const {
    DEFAULT_ACCOUNT_TASK_LIST_LABEL,
    SHOPPING_TASK_LIST_LABEL,
} = TaskListsService;
const hubTaskText = (value, fallback = '') => {
    if (typeof value !== 'string') return fallback;
    const text = value.trim();
    if (!text || ['false', 'null', 'undefined'].includes(text.toLowerCase())) return fallback;
    return text;
};
const hubTaskListLabel = (value) => {
    const label = hubTaskText(value, DEFAULT_ACCOUNT_TASK_LIST_LABEL);
    const lower = label.toLowerCase();
    return (lower === 'général' || lower === 'general' || lower === 'tâches du jour' || lower === 'taches du jour') ? DEFAULT_ACCOUNT_TASK_LIST_LABEL : label;
};
const hubDefaultStatuses = [
    { label: 'À faire', color: '#9ca3af', order: 0 },
    { label: 'En cours', color: '#3b82f6', order: 1 },
    { label: 'En revue', color: '#f59e0b', order: 2 },
    { label: 'Terminé', color: '#22c55e', order: 3 },
    { label: 'Bloqué', color: '#ef4444', order: 4 },
];
const hubStatusColors = {
    'À faire': '#9ca3af',
    'En cours': '#3b82f6',
    'En revue': '#f59e0b',
    'Terminé': '#22c55e',
    'Bloqué': '#ef4444'
};
const hubResolveTimeZone = (value) => {
    const fallback = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const zone = hubTaskText(value, '');
    if (!zone) return fallback;
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: zone }).format(new Date());
        return zone;
    } catch (_) {
        return fallback;
    }
};
const hubFormatReminderTime = (date, timeZone) => {
    try {
        return new Intl.DateTimeFormat('fr-FR', {
            timeZone: hubResolveTimeZone(timeZone),
            hour: '2-digit',
            minute: '2-digit'
        }).format(date instanceof Date ? date : new Date(date));
    } catch (_) {
        return '';
    }
};
const hubTaskReminderMessage = (task, scheduledAt, timeZone) => {
    const time = hubFormatReminderTime(scheduledAt, timeZone);
    return time ? `Rappel a ${time}` : `Rappel pour ${hubTaskText(task?.title, 'cette tache')}`;
};
const hubReminderError = (res, error) => {
    if (!error?.status) return false;
    res.status(error.status).json({
        error: error.message,
        code: error.code || 'REMINDER_ERROR'
    });
    return true;
};
const hubTaskOptions = (options, fallback) => {
    const source = Array.isArray(options) && options.length ? options : fallback;
    return source
        .map((option, index) => ({
            label: hubTaskText(option?.label, ''),
            color: option?.color || fallback[index]?.color || '#94a3b8',
            order: Number.isFinite(Number(option?.order)) ? Number(option.order) : index
        }))
        .filter(option => option.label)
        .sort((a, b) => a.order - b.order);
};
const homeOverviewDataViewId = 'home_overview';
const homeOverviewDefaultData = () => ({
    goals: [
        { id: 'goal_saas', title: 'Lancer mon SaaS', value: 60, color: '#536cff' },
        { id: 'goal_health', title: 'Perdre 8 kg', value: 40, color: '#4b7bff' },
        { id: 'goal_savings', title: 'Économiser 500€', value: 25, color: '#71d095' },
        { id: 'goal_books', title: 'Lire 12 livres', value: 70, color: '#ff8a00' }
    ],
    financeRows: [
        { id: 'finance_total', label: 'Dépenses totales', value: '1 247,50 €', color: '#5b6df7', icon: 'solar:wallet-money-bold-duotone' },
        { id: 'finance_subs', label: 'Abonnements', value: '67,99 €', color: '#10b981', icon: 'solar:card-bold-duotone' },
        { id: 'finance_bills', label: 'Factures à venir', value: '156,00 €', color: '#f97316', icon: 'solar:bill-list-bold-duotone' },
        { id: 'finance_budget', label: 'Budget restant', value: '452,50 €', color: '#10b981', icon: 'solar:wallet-bold-duotone' }
    ],
    shoppingItems: [
        { id: 'shop_lait', label: 'Lait', done: false },
        { id: 'shop_pain', label: 'Pain', done: true },
        { id: 'shop_couches', label: 'Couches bébé', done: false },
        { id: 'shop_fruits', label: 'Fruits', done: false },
        { id: 'shop_lessive', label: 'Lessive', done: false }
    ]
});
const homeText = (value, fallback = '') => {
    const text = String(value ?? '').trim();
    return text ? text.slice(0, 140) : fallback;
};
const homeColor = (value, fallback = '#4361ee') => {
    const color = String(value || '').trim();
    return /^#[0-9a-f]{3,8}$/i.test(color) ? color : fallback;
};
const homePercent = value => Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
const normalizeHomeOverviewData = (value = {}) => {
    const defaults = homeOverviewDefaultData();
    const src = value && typeof value === 'object' ? value : {};
    const goals = Array.isArray(src.goals) && src.goals.length ? src.goals : defaults.goals;
    const financeRows = Array.isArray(src.financeRows) && src.financeRows.length ? src.financeRows : defaults.financeRows;
    const shoppingItems = Array.isArray(src.shoppingItems) && src.shoppingItems.length ? src.shoppingItems : defaults.shoppingItems;

    return {
        goals: goals.slice(0, 12).map((goal, index) => ({
            id: homeText(goal.id, 'goal_' + index),
            title: homeText(goal.title, defaults.goals[index]?.title || 'Objectif'),
            value: homePercent(goal.value),
            color: homeColor(goal.color, defaults.goals[index]?.color || '#536cff')
        })),
        financeRows: financeRows.slice(0, 8).map((row, index) => ({
            id: homeText(row.id, 'finance_' + index),
            label: homeText(row.label, defaults.financeRows[index]?.label || 'Ligne finance'),
            value: homeText(row.value, defaults.financeRows[index]?.value || '0,00 €'),
            color: homeColor(row.color, defaults.financeRows[index]?.color || '#6366f1'),
            icon: homeText(row.icon, defaults.financeRows[index]?.icon || 'solar:wallet-money-bold-duotone')
        })),
        shoppingItems: shoppingItems.slice(0, 40).map((item, index) => ({
            id: homeText(item.id, 'shop_' + index),
            label: homeText(item.label, defaults.shoppingItems[index]?.label || 'Article'),
            done: !!item.done
        }))
    };
};
async function ensurePersonalTaskRecord(req) {
    const _tc = require('../middleware/tenant').tenantCollection;
    const Entity = await _tc(req, "Entity");
    const Record = await _tc(req, "Record");
    const slug = 'dexapp-personal-space';

    let entity = await Entity.findOne({ slug });
    if (!entity) {
        entity = await Entity.create({
            name: 'Espace perso',
            nameSingular: 'Espace perso',
            namePlural: 'Espace perso',
            slug,
            icon: 'solar:user-rounded-bold-duotone',
            color: '#7c3aed',
            isSystem: true,
            enabledStandardFields: ['title', 'description'],
            referenceTitleTokens: [{ t: 'field', id: 'title' }],
            createdBy: req.user?._id
        });
    }

    let record = await Record.findOne({ entityId: entity._id, slug });
    if (!record) {
        record = await Record.create({
            entityId: entity._id,
            title: 'Espace perso',
            computedTitle: 'Espace perso',
            slug,
            icon: 'solar:user-rounded-bold-duotone',
            color: '#7c3aed',
            published: true,
            status: 'published',
            createdBy: req.user?._id
        });
    }

    return { entity, record };
}

async function ensurePersonalTaskList(req, options = {}) {
    const { TaskList: TaskListModel, RecordTask: RecordTaskModel } = await taskTenantModels(req);
    const accountPriorities = await getAccountTaskPriorities(req);
    const label = hubTaskListLabel(options.label || DEFAULT_ACCOUNT_TASK_LIST_LABEL);
    const color = options.color || '#6366f1';
    const icon = options.icon || 'solar:checklist-bold-duotone';
    const { entity, record } = await ensurePersonalTaskRecord(req);
    const lists = await TaskListModel.find({ recordId: record._id }).sort({ order: 1, createdAt: 1 });
    let list = lists.find(l => hubTaskListLabel(l.label).toLowerCase() === label.toLowerCase());
    const isDefault = label.toLowerCase() === DEFAULT_ACCOUNT_TASK_LIST_LABEL.toLowerCase();
    const baseFlags = {
        contextType: 'account',
        isDefault,
        ...(options.showInMyLists === true ? { showInMyLists: true, myListOrder: lists.length + 1 } : {})
    };
    if (!list) {
        list = await TaskListModel.create({
            recordId: record._id,
            label,
            color,
            icon,
            order: lists.length,
            statuses: hubDefaultStatuses,
            priorities: accountPriorities,
            ...baseFlags
        });
    } else if (!list.icon || !list.color || !list.contextType || list.isDefault !== isDefault || (options.showInMyLists === true && !list.showInMyLists)) {
        const update = {
            icon: list.icon || icon,
            color: list.color || color,
            contextType: 'account',
            isDefault,
            ...(options.showInMyLists === true ? { showInMyLists: true, ...(Number(list.myListOrder) ? {} : { myListOrder: lists.length + 1 }) } : {})
        };
        list = await TaskListModel.findByIdAndUpdate(
            list._id,
            { $set: update },
            { new: true }
        );
    }

    const seedTasks = Array.isArray(options.seedTasks) ? options.seedTasks : [];
    if (seedTasks.length) {
        const existingTasks = await RecordTaskModel.countDocuments({ taskListId: list._id });
        if (!existingTasks) {
            const docs = seedTasks
                .map((item, index) => {
                    const title = hubTaskText(item?.title || item?.label, '');
                    if (!title) return null;
                    const done = !!item?.done;
                    const priorityOption = priorityOptionFor('Aucune', accountPriorities);
                    return {
                        taskListId: list._id,
                        recordId: record._id,
                        title,
                        description: hubTaskText(item?.description, ''),
                        status: done ? 'Terminé' : 'À faire',
                        statusColor: done ? hubStatusColors['Terminé'] : hubStatusColors['À faire'],
                        priority: priorityOption.label,
                        priorityColor: priorityOption.color || '',
                        order: index
                    };
                })
                .filter(Boolean);
            if (docs.length) await RecordTaskModel.insertMany(docs);
        }
    }

    return { entity, record, list };
}

async function ensurePersonalTasksTarget(req) {
    return ensurePersonalTaskList(req, {
        label: DEFAULT_ACCOUNT_TASK_LIST_LABEL,
        color: '#6366f1',
        icon: 'solar:checklist-bold-duotone'
    });
}

async function resolveHubTaskTarget(req, taskListId = '') {
    const id = hubTaskText(taskListId, '');
    if (!id) return ensurePersonalTasksTarget(req);

    const _tc = require('../middleware/tenant').tenantCollection;
    const Entity = await _tc(req, "Entity");
    const Record = await _tc(req, "Record");
    const { TaskList: TaskListModel } = await taskTenantModels(req);
    const list = await TaskListModel.findById(id);
    if (!list) return null;

    const record = await Record.findById(list.recordId);
    if (!record) return null;
    const entity = record.entityId ? await Entity.findById(record.entityId) : null;
    return { entity: entity || {}, record, list };
}

async function hubTenantRecordIds(req) {
    const _tc = require('../middleware/tenant').tenantCollection;
    const Record = await _tc(req, "Record");
    return Record.find({}).distinct('_id');
}

async function hubLoadTenantTask(req, taskId) {
    if (!/^[a-f\d]{24}$/i.test(String(taskId || ''))) return null;
    const ids = await hubTenantRecordIds(req);
    if (!ids.length) return null;
    const { RecordTask: RecordTaskModel } = await taskTenantModels(req);
    return RecordTaskModel.findOne({ _id: taskId, recordId: { $in: ids } });
}

async function hubCancelTaskReminder(req, task, slotKey = 'default') {
    return ReminderService.cancelReminderForTarget({
        accountNumber: req.account_number,
        userId: req.user._id,
        targetType: 'task',
        targetId: task._id,
        slotKey,
    });
}

async function hubUpsertTaskReminder(req, task, reminderInput) {
    if (!reminderInput) return null;
    if (reminderInput.enabled === false) {
        await hubCancelTaskReminder(req, task, reminderInput.slotKey || 'default');
        return null;
    }

    return ReminderService.upsertReminder({
        accountNumber: req.account_number,
        userId: req.user._id,
        targetType: 'task',
        targetModel: 'RecordTask',
        targetId: task._id,
        slotKey: reminderInput.slotKey || 'default',
        title: reminderInput.title || task.title,
        message: reminderInput.message || hubTaskReminderMessage(task, reminderInput.scheduledAt, reminderInput.timeZone),
        scheduledAt: reminderInput.scheduledAt,
        timeZone: reminderInput.timeZone,
        channel: reminderInput.channel || 'local',
        metadata: {
            ...(reminderInput.metadata || {}),
            taskTitle: task.title,
            source: 'node',
        },
    });
}

router.post("/api/tasks-hub/personal-tasks", async (req, res) => {
    try {
        const title = hubTaskText(req.body?.title, '');
        if (!title) return res.status(400).json({ error: 'Title required' });
        const reminderInput = ReminderService.reminderPayloadFromBody(req.body);

        const status = hubStatusColors[req.body?.status] ? req.body.status : 'À faire';
        const accountPriorities = await getAccountTaskPriorities(req);
        const priorityOption = priorityOptionFor(req.body?.priority, accountPriorities);
        const target = await resolveHubTaskTarget(req, req.body?.taskListId);
        if (!target) return res.status(404).json({ error: 'Liste de tâches introuvable' });
        const { entity, record, list } = target;
        const { RecordTask: RecordTaskModel } = await taskTenantModels(req);
        const order = await RecordTaskModel.countDocuments({ taskListId: list._id });
        const task = await RecordTaskModel.create({
            taskListId: list._id,
            recordId: record._id,
            title,
            description: hubTaskText(req.body?.description, ''),
            status,
            statusColor: hubStatusColors[status] || '#9ca3af',
            priority: priorityOption.label,
            priorityColor: priorityOption.color || '',
            isDayPriority: !!req.body?.isDayPriority,
            startDate: req.body?.startDate || null,
            dueDate: req.body?.dueDate || null,
            assignedTo: hubTaskText(req.body?.assignedTo, ''),
            order
        });
        const reminder = reminderInput
            ? await hubUpsertTaskReminder(req, task, reminderInput)
            : null;

        res.json({
            success: true,
            task: {
                _id: task._id.toString(),
                title: task.title,
                description: task.description || '',
                status: task.status,
                statusColor: task.statusColor,
                priority: priorityOption.label,
                priorityColor: priorityOption.color || '',
                isDayPriority: !!task.isDayPriority,
                startDate: task.startDate || null,
                dueDate: task.dueDate || null,
                assignedTo: task.assignedTo || '',
                attachments: [],
                createdAt: task.createdAt || null,
                updatedAt: task.updatedAt || null,
                listId: list._id.toString(),
                listLabel: hubTaskListLabel(list.label),
                listColor: list.color || '#6366f1',
                listIcon: list.icon || 'solar:checklist-bold-duotone',
                recordId: record._id.toString(),
                recordTitle: record.computedTitle || record.title || 'Espace perso',
                recordIcon: record.icon || entity.icon || 'solar:user-rounded-bold-duotone',
                recordColor: record.color || entity.color || '#7c3aed',
                entityId: entity._id.toString(),
                entityName: entity.name || 'Espace perso',
                entitySlug: entity.slug || '',
                entityIcon: entity.icon || 'solar:user-rounded-bold-duotone',
                entityColor: entity.color || '#7c3aed',
                scope: 'personal',
                reminder: ReminderService.serializeReminder(reminder)
            }
        });
    } catch (error) {
        if (hubReminderError(res, error)) return;
        console.error('[TasksHub] Create personal task error:', error);
        res.status(500).json({ error: error.message });
	    }
	});

router.post("/api/tasks-hub/tasks/:taskId/reminder", async (req, res) => {
    try {
        const task = await hubLoadTenantTask(req, req.params.taskId);
        if (!task) return res.status(404).json({ error: 'Task not found' });
        const reminderInput = ReminderService.reminderPayloadFromBody(req.body);
        if (!reminderInput) {
            return res.status(400).json({ error: 'Date de rappel requise', code: 'VALIDATION_ERROR' });
        }
        const reminder = await hubUpsertTaskReminder(req, task, reminderInput);
        res.json({
            success: true,
            taskId: task._id.toString(),
            reminder: ReminderService.serializeReminder(reminder),
        });
    } catch (error) {
        if (hubReminderError(res, error)) return;
        console.error('[TasksHub] Upsert task reminder error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete("/api/tasks-hub/tasks/:taskId/reminder", async (req, res) => {
    try {
        const task = await hubLoadTenantTask(req, req.params.taskId);
        if (!task) return res.status(404).json({ error: 'Task not found' });
        await hubCancelTaskReminder(req, task);
        res.json({
            success: true,
            taskId: task._id.toString(),
            reminder: null,
        });
    } catch (error) {
        if (hubReminderError(res, error)) return;
        console.error('[TasksHub] Delete task reminder error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post("/api/tasks-hub/reorder", async (req, res) => {
    try {
        const taskIds = Array.isArray(req.body?.taskIds) ? req.body.taskIds : [];
        const normalizedTaskIds = [...new Set(taskIds
            .map(id => String(id || ''))
            .filter(id => /^[a-f\d]{24}$/i.test(id)))];
        if (!normalizedTaskIds.length) return res.status(400).json({ error: 'taskIds array required' });

        const { RecordTask: RecordTaskModel } = await taskTenantModels(req);
        const existingTasks = await RecordTaskModel.find({ _id: { $in: normalizedTaskIds } }).select('_id').lean();
        const allowedIds = new Set(existingTasks.map(task => task._id.toString()));
        const orderedAllowedTaskIds = normalizedTaskIds.filter(id => allowedIds.has(id));
        if (!orderedAllowedTaskIds.length) return res.json({ success: true });

        const allTasks = await RecordTaskModel.find().select('_id order').sort({ order: 1, createdAt: -1 }).lean();
        const orderedSet = new Set(orderedAllowedTaskIds);
        const remainingTasks = allTasks.filter(task => !orderedSet.has(task._id.toString()));

        const reorderedTaskIds = [
            ...orderedAllowedTaskIds.map((id, index) => ({ id, order: index })),
            ...remainingTasks.map((task, index) => ({
                id: task._id.toString(),
                order: orderedAllowedTaskIds.length + index,
            })),
        ];

        const currentOrderById = new Map(
            allTasks.map(task => [task._id.toString(), Number(task.order) || 0]),
        );
        const bulkOps = reorderedTaskIds
            .filter(({ id, order }) => currentOrderById.get(id) !== order)
            .map(({ id, order }) => ({
                updateOne: { filter: { _id: id }, update: { $set: { order } } }
            }));
        if (bulkOps.length > 0) await RecordTaskModel.bulkWrite(bulkOps);

        res.json({ success: true });
    } catch (error) {
        console.error('[TasksHub] Reorder tasks error:', error);
        res.status(500).json({ error: error.message });
    }
});

	router.get("/api/tasks-hub", async (req, res) => {
    try {
        const _tc = require('../middleware/tenant').tenantCollection;
        const Entity = await _tc(req, "Entity");
        const Record = await _tc(req, "Record");
        const accountPriorities = await getAccountTaskPriorities(req);
        await ensurePersonalTasksTarget(req);
        if (String(req.account_number) === '6804') {
            await ensurePersonalTaskList(req, {
                label: SHOPPING_TASK_LIST_LABEL,
                color: '#10b981',
                icon: 'solar:cart-large-bold-duotone',
                showInMyLists: true
            });
        }

        // Scope to tenant: get all record IDs belonging to this tenant first
        const tenantRecords = await Record.find({}).select('_id title computedTitle referenceTitle entityId icon color slug image').lean();
        const tenantRecordIds = tenantRecords.map(r => r._id);
        const myLists = await TaskListsService.listMyTaskLists(req);
        if (tenantRecordIds.length === 0) {
            return res.json({ success: true, entities: [], myLists, totalTasks: 0, doneTasks: 0, priorities: accountPriorities });
        }

        const { TaskList: TaskListModel, RecordTask: RecordTaskModel } = await taskTenantModels(req);
        const allLists = await TaskListModel.find({ recordId: { $in: tenantRecordIds } }).sort({ order: 1, createdAt: 1 }).lean();
        if (allLists.length === 0) {
            return res.json({ success: true, entities: [], myLists, totalTasks: 0, doneTasks: 0, priorities: accountPriorities });
        }

        const allTasks = await RecordTaskModel.find({ recordId: { $in: tenantRecordIds } }).sort({ order: 1, createdAt: -1 }).lean();
        const reminderMap = await ReminderService.scheduledReminderMap({
            accountNumber: req.account_number,
            userId: req.user._id,
            targetType: 'task',
            targetIds: allTasks.map(task => task._id),
        });
        const records = tenantRecords;
        const recordMap = {};
        records.forEach(r => { recordMap[r._id.toString()] = r; });

        const entityIds = [...new Set(records.map(r => r.entityId?.toString()).filter(Boolean))];
        const entities = await Entity.find({ _id: { $in: entityIds } }).select('name slug icon color').lean();
        const entityMap = {};
        entities.forEach(e => { entityMap[e._id.toString()] = e; });

        const tasksByListId = {};
        allTasks.forEach(task => {
            const listId = task.taskListId?.toString();
            if (!listId) return;
            if (!tasksByListId[listId]) tasksByListId[listId] = [];
            tasksByListId[listId].push(task);
        });

        const entityGroups = {};
        let totalTasks = 0, totalDone = 0;

        allLists.forEach(list => {
            const rId = list.recordId.toString();
            const record = recordMap[rId];
            if (!record) return;
            const eId = record.entityId?.toString() || 'unknown';
            const entity = entityMap[eId];

            if (!entityGroups[eId]) {
                entityGroups[eId] = {
                    entityId: eId, entityName: entity?.name || 'Sans entité',
                    entitySlug: entity?.slug || '', entityIcon: entity?.icon || 'solar:folder-bold-duotone',
                    entityColor: entity?.color || '#4361ee', totalTasks: 0, doneTasks: 0, records: {}
                };
            }
            if (!entityGroups[eId].records[rId]) {
                const recordTitle = hubTaskText(record.computedTitle || record.referenceTitle || record.title, 'Sans titre');
                entityGroups[eId].records[rId] = {
                    recordId: rId,
                    recordTitle,
                    recordSlug: record.slug || '',
                    recordIcon: record.icon || entity?.icon || 'solar:folder-bold-duotone',
                    recordColor: record.color || entity?.color || '#4361ee',
                    entityId: eId,
                    entityName: entity?.name || 'Sans entité',
                    entitySlug: entity?.slug || '',
                    entityIcon: entity?.icon || 'solar:folder-bold-duotone',
                    entityColor: entity?.color || '#4361ee',
                    totalTasks: 0,
                    doneTasks: 0,
                    listsCount: 0,
                    lists: [],
                    tasks: []
                };
            }

            const listId = list._id.toString();
            const listLabel = hubTaskListLabel(list.label);
            const listColor = list.color || '#6366f1';
            const listIcon = list.icon || 'solar:checklist-bold-duotone';
            const listStatuses = hubTaskOptions(list.statuses, hubDefaultStatuses);
            const listPriorities = accountPriorities;
            const listTasks = (tasksByListId[listId] || []).slice().sort((a, b) => {
                const ao = Number.isFinite(Number(a.order)) ? Number(a.order) : 0;
                const bo = Number.isFinite(Number(b.order)) ? Number(b.order) : 0;
                if (ao !== bo) return ao - bo;
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            });
            const normalizedTasks = listTasks.map(t => {
                const priorityOption = priorityOptionFor(t.priority, accountPriorities);
                return {
                    _id: t._id.toString(),
                    title: hubTaskText(t.title, 'Sans titre'),
                    description: t.description || '',
                    status: hubTaskText(t.status, 'À faire'),
                    statusColor: t.statusColor || '#9ca3af',
                    priority: priorityOption.label,
                    priorityColor: priorityOption.color || '',
                    isDayPriority: !!t.isDayPriority,
                    startDate: t.startDate || null,
                    dueDate: t.dueDate || null,
                    assignedTo: t.assignedTo || '',
                    createdAt: t.createdAt || null,
                    updatedAt: t.updatedAt || null,
                    completedAt: t.completedAt || null,
                    attachments: Array.isArray(t.attachments) ? t.attachments.map(att => ({
                        _id: att._id?.toString?.() || String(att._id || ''),
                        filename: att.filename || '',
                        originalName: att.originalName || att.filename || 'Fichier',
                        mimeType: att.mimeType || '',
                        size: Number(att.size || 0)
                    })) : [],
                    listId,
                    listLabel,
                    listColor,
                    listIcon,
                    recordId: rId,
                    recordTitle: entityGroups[eId].records[rId].recordTitle,
                    recordIcon: entityGroups[eId].records[rId].recordIcon,
                    recordColor: entityGroups[eId].records[rId].recordColor,
                    entityId: eId,
                    entityName: entity?.name || 'Sans entité',
                    entitySlug: entity?.slug || '',
                    entityIcon: entity?.icon || 'solar:folder-bold-duotone',
                    entityColor: entity?.color || '#4361ee',
                    reminder: ReminderService.serializeReminder(reminderMap.get(t._id?.toString?.() || ''))
                };
            });
            const done = listTasks.filter(t => t.status === 'Terminé').length;
            entityGroups[eId].records[rId].totalTasks += normalizedTasks.length;
            entityGroups[eId].records[rId].doneTasks += done;
            entityGroups[eId].records[rId].listsCount += 1;
            entityGroups[eId].records[rId].lists.push({
                listId,
                label: listLabel,
                color: listColor,
                icon: listIcon,
                contextType: list.contextType || (record.slug === 'dexapp-personal-space' ? 'account' : 'record'),
                isDefault: !!list.isDefault,
                showInMyLists: !!list.showInMyLists,
                myListOrder: Number(list.myListOrder) || 0,
                statuses: listStatuses,
                priorities: listPriorities,
                totalTasks: normalizedTasks.length,
                doneTasks: done,
                tasks: normalizedTasks
            });
            entityGroups[eId].records[rId].tasks.push(...normalizedTasks);
            entityGroups[eId].totalTasks += listTasks.length;
            entityGroups[eId].doneTasks += done;
            totalTasks += listTasks.length;
            totalDone += done;
        });

        const result = Object.values(entityGroups).map(eg => ({
            ...eg, records: Object.values(eg.records)
                .sort((a, b) => a.recordTitle.localeCompare(b.recordTitle))
                .map(record => ({
                    ...record,
                    lists: record.lists.sort((a, b) => a.label.localeCompare(b.label)),
                    tasks: record.tasks.sort((a, b) => {
                        const ad = a.dueDate ? new Date(a.dueDate) : new Date(a.createdAt || 0);
                        const bd = b.dueDate ? new Date(b.dueDate) : new Date(b.createdAt || 0);
                        return ad - bd;
                    })
                }))
        })).sort((a, b) => b.totalTasks - a.totalTasks);

        res.json({ success: true, entities: result, myLists, totalTasks, doneTasks: totalDone, priorities: accountPriorities });
    } catch (error) {
        console.error('[TasksHub] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Home Overview API — global widgets for the account home hub
router.get("/api/home-overview", async (req, res) => {
    try {
        const _tc = require('../middleware/tenant').tenantCollection;
        const { ensureEventsEntity } = require('../services/events-entity.service');
        const mongoose = require('mongoose');
        const Entity = await _tc(req, "Entity");
        const Record = await _tc(req, "Record");
        const UserPreferences = await _tc(req, "UserPreferences");
        const prefs = req.user?._id && UserPreferences
            ? await UserPreferences.findOne({ userId: req.user._id, viewId: homeOverviewDataViewId }).lean()
            : null;
        const homeData = normalizeHomeOverviewData(prefs?.preferences?.homeData);
        const shoppingTarget = await ensurePersonalTaskList(req, {
            label: SHOPPING_TASK_LIST_LABEL,
            color: '#10b981',
            icon: 'solar:cart-large-bold-duotone',
            seedTasks: homeData.shoppingItems,
            showInMyLists: String(req.account_number) === '6804'
        });

        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const taskBoard = await TaskOverview.buildTaskBoard(req, {
            preferredListId: shoppingTarget.list._id,
            listTaskLimit: 40,
            tasksByRecordLimit: 8,
            includeAllTasks: true,
            includeOpenTasksSorted: true,
            includeTasksByRecord: true
        });
        const recordTitle = record => record?.computedTitle || record?.referenceTitle || record?.title || 'Sans titre';

	        const recentRecordsRaw = await Record.find({})
            .select('title computedTitle referenceTitle entityId icon color updatedAt createdAt')
            .sort({ updatedAt: -1 })
            .limit(8)
            .lean();
        const recentEntityIds = [...new Set(recentRecordsRaw.map(record => record.entityId?.toString()).filter(Boolean))];
        const recentEntities = recentEntityIds.length
            ? await Entity.find({ _id: { $in: recentEntityIds } }).select('name slug icon color').lean()
            : [];
        const recentEntityMap = {};
        recentEntities.forEach(entity => { recentEntityMap[entity._id.toString()] = entity; });
        const recentRecords = recentRecordsRaw.map(record => {
            const entity = record.entityId ? recentEntityMap[record.entityId.toString()] : null;
            const entitySlug = entity?.slug || '';
            const recordId = record._id.toString();
            return {
                id: recordId,
                title: recordTitle(record),
                entityName: entity?.name || 'Sans entité',
                entitySlug,
                icon: record.icon || entity?.icon || 'solar:folder-bold-duotone',
                color: record.color || entity?.color || '#4361ee',
                updatedAt: record.updatedAt || record.createdAt || null,
                link: entitySlug ? `/account/${req.account_number}/record/${entitySlug}/${recordId}/overview` : `/account/${req.account_number}/home`
            };
        });

        const eventsEntity = await ensureEventsEntity(req);
        const eventFieldByName = {};
        (eventsEntity.customFields || []).forEach(field => {
            if (field?.name) eventFieldByName[field.name] = field;
        });

        const normalizeRecordId = value => {
            const raw = value?._id || value;
            const id = String(raw || '').trim();
            return id && mongoose.Types.ObjectId.isValid(id) ? id : '';
        };
        const eventParentId = event => {
            for (const rel of (event.relations || [])) {
                const values = Array.isArray(rel.value) ? rel.value : [rel.value];
                const found = values.map(normalizeRecordId).find(Boolean);
                if (found) return found;
            }
            return '';
        };
        const eventCustomValue = (event, fieldName) => {
            const field = eventFieldByName[fieldName];
            if (!field) return undefined;
            const fieldId = String(field._id || '');
            const customField = (event.customFields || []).find(item => {
                const id = item.field_id?._id || item.field_id;
                return String(id || '') === fieldId;
            });
            return customField ? customField.value : undefined;
        };
        const normalizeEventTags = value => {
            const normalize = item => {
                if (item && typeof item === 'object') {
                    return String(item.label || item.value || item.name || '').trim();
                }
                return String(item || '').trim();
            };
            if (Array.isArray(value)) return value.map(normalize).filter(Boolean);
            if (typeof value === 'string') return value.split(',').map(item => item.trim()).filter(Boolean);
            return [];
        };
        const eventBooleanValue = (value, fallback = false) => {
            if (value === undefined || value === null || value === '') return fallback;
            if (typeof value === 'boolean') return value;
            if (typeof value === 'number') return value !== 0;
            const token = String(value).trim().toLowerCase();
            if (['true', '1', 'yes', 'oui', 'on'].includes(token)) return true;
            if (['false', '0', 'no', 'non', 'off'].includes(token)) return false;
            return fallback;
        };
        const isUpcomingWidgetEvent = event => eventBooleanValue(eventCustomValue(event, 'widget_prochains_evenements'), true);
        const isImportantDateEvent = event => {
            const explicit = eventCustomValue(event, 'widget_date_importante');
            if (explicit !== undefined && explicit !== null && explicit !== '') {
                return eventBooleanValue(explicit, false);
            }
            return normalizeEventTags(eventCustomValue(event, 'tags_evenement'))
                .some(tag => tag.toLowerCase() === 'date importante');
        };
        const eventStatus = event => {
            const statusClass = eventsEntity.statusClassification || null;
            const cv = (event.classificationValues || []).find(item => {
                const id = item.classificationId?._id || item.classificationId;
                return String(id || '') === String(statusClass?._id || '');
            });
            const opt = cv ? (statusClass?.options || []).find(option => {
                const id = cv.optionId?._id || cv.optionId;
                return String(option._id || '') === String(id || '');
            }) : null;
            return {
                label: opt?.label || cv?.label || 'Planifié',
                color: opt?.color || cv?.color || '#3b82f6'
            };
        };
        const eventLabelInfo = event => {
            const tag = normalizeEventTags(eventCustomValue(event, 'tags_evenement'))[0] || '';
            if (!tag) return { label: '', color: '#64748b' };
            const tagField = eventFieldByName.tags_evenement;
            const option = (tagField?.type_config?.options || []).find(opt => {
                const raw = opt && typeof opt === 'object' ? (opt.value || opt.label) : opt;
                return String(raw || '').trim().toLowerCase() === tag.toLowerCase();
            });
            return {
                label: String((option && typeof option === 'object' ? option.label : '') || tag).trim(),
                color: String((option && typeof option === 'object' ? option.color : '') || '#64748b').trim()
            };
        };
        const relativeDateLabel = value => {
            const target = new Date(value);
            if (Number.isNaN(target.getTime())) return '';
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            target.setHours(0, 0, 0, 0);
            const diffDays = Math.round((target - today) / 86400000);
            if (diffDays === 0) return "aujourd'hui";
            if (diffDays === 1) return 'demain';
            if (diffDays > 1) return `dans ${diffDays} jours`;
            if (diffDays === -1) return 'hier';
            return `il y a ${Math.abs(diffDays)} jours`;
        };

        const eventRecordsRaw = await Record.find({ entityId: eventsEntity._id, date: { $gte: start } })
            .populate({ path: 'customFields.field_id', select: 'label type name render ui type_config' })
            .sort({ date: 1 })
            .limit(120)
            .lean();
        const eventParentIds = new Set();
        eventRecordsRaw.forEach(event => {
            const parentId = eventParentId(event);
            if (parentId) eventParentIds.add(parentId);
        });
        const eventParentRecords = eventParentIds.size
            ? await Record.find({ _id: { $in: [...eventParentIds] } })
                .select('title computedTitle referenceTitle entityId icon color')
                .lean()
            : [];
        const eventParentRecordMap = {};
        eventParentRecords.forEach(record => { eventParentRecordMap[record._id.toString()] = record; });
        const eventParentEntityIds = [...new Set(eventParentRecords.map(record => record.entityId?.toString()).filter(Boolean))];
        const eventParentEntities = eventParentEntityIds.length
            ? await Entity.find({ _id: { $in: eventParentEntityIds } }).select('name slug icon color').lean()
            : [];
        const eventParentEntityMap = {};
        eventParentEntities.forEach(entity => { eventParentEntityMap[entity._id.toString()] = entity; });
        const formatHomeEvent = (event, mode = 'upcoming') => {
            const eventDate = new Date(event.date);
            const parentId = eventParentId(event);
            const parent = parentId ? eventParentRecordMap[parentId] : null;
            const parentEntity = parent?.entityId ? eventParentEntityMap[parent.entityId.toString()] : null;
            const entitySlug = parentEntity?.slug || '';
            const eventId = event._id.toString();
            const status = eventStatus(event);
            const label = eventLabelInfo(event);
            const location = String(eventCustomValue(event, 'lieu_evenement') || '').trim();
            const title = String(event.title || event.computedTitle || '').trim() || 'Sans titre';
            const time = eventDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false });
            const relative = relativeDateLabel(eventDate);
            const recordLabel = parent ? recordTitle(parent) : 'Record inconnu';
            const recordLink = parentId && entitySlug
                ? `/account/${req.account_number}/record/${entitySlug}/${parentId}/overview`
                : `/account/${req.account_number}/agenda`;
            const url = parentId && entitySlug
                ? `/account/${req.account_number}/record/${entitySlug}/${parentId}/agenda?event=${encodeURIComponent(eventId)}`
                : `/account/${req.account_number}/agenda`;

            return {
                id: eventId,
                title,
                date: event.date,
                day: eventDate.getDate().toString().padStart(2, '0'),
                month: eventDate.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '').toUpperCase(),
                time,
                relative,
                status: status.label,
                statusColor: status.color,
                color: status.color || (mode === 'important' ? '#f59e0b' : '#14b8a6'),
                label: label.label,
                labelColor: label.color,
                location,
                recordId: parentId,
                recordTitle: recordLabel,
                recordLink,
                entityName: parentEntity?.name || 'Sans entité',
                entitySlug,
                recordIcon: parent?.icon || '',
                recordColor: parent?.color || '',
                entityIcon: parent?.icon || parentEntity?.icon || 'solar:folder-bold-duotone',
                entityColor: parent?.color || parentEntity?.color || '#4361ee',
                url,
                tooltip: [title, recordLabel, `${time} · ${status.label}${relative ? ' · ' + relative : ''}`, location, label.label].filter(Boolean).join('\n')
            };
        };
        const upcomingEvents = eventRecordsRaw
            .filter(isUpcomingWidgetEvent)
            .slice(0, 8)
            .map(event => formatHomeEvent(event, 'upcoming'));
        const importantDates = eventRecordsRaw
            .filter(isImportantDateEvent)
            .slice(0, 8)
            .map(event => formatHomeEvent(event, 'important'));

	        const weekEnd = new Date(start);
	        weekEnd.setDate(weekEnd.getDate() + 7);
	        const weekEvents = eventRecordsRaw.filter(event => {
	            const date = new Date(event.date);
	            return !Number.isNaN(date.getTime()) && date >= start && date < weekEnd;
	        }).length;

            if (req.user?._id && UserPreferences && !prefs?.preferences?.homeData) {
                UserPreferences.findOneAndUpdate(
                    { userId: req.user._id, viewId: homeOverviewDataViewId },
                    {
                        $set: {
                            userId: req.user._id,
                            viewId: homeOverviewDataViewId,
                            'preferences.homeData': homeData,
                            updatedAt: new Date()
                        }
                    },
                    { upsert: true }
                ).catch(err => console.warn('[HomeOverview] Seed home data skipped:', err.message));
            }

	        res.json({
	            success: true,
	            schedule: taskBoard.schedule,
	            dateKey: taskBoard.dateKey,
	            timeZone: taskBoard.timeZone,
	            todayTasks: taskBoard.todayTasks,
	            completedToday: taskBoard.completedToday,
		            tasks: taskBoard.openTasksSorted.slice(0, 20),
		            allTasks: taskBoard.allTasks,
		            overdueTasks: taskBoard.overdueTasks,
		            tasksByRecord: taskBoard.tasksByRecord,
                    taskLists: taskBoard.taskLists,
		            recentRecords,
		            upcomingEvents,
	            importantDates,
	            homeData,
                defaultWidgets: {
                    shoppingListId: shoppingTarget.list._id.toString()
                },
	            stats: {
                totalTasks: taskBoard.stats.totalTasks,
                doneTasks: taskBoard.stats.doneTasks,
                openTasks: taskBoard.stats.openTasks,
	                todayTasks: taskBoard.todayTasks.length,
	                overdueCount: taskBoard.stats.overdueCount,
	                weekEvents,
	                listsCount: taskBoard.stats.listsCount,
                recordsCount: await Record.countDocuments({})
            }
        });
    } catch (error) {
        console.error('[HomeOverview] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.patch("/api/home-overview/widgets", async (req, res) => {
    try {
        if (!req.user?._id) return res.status(401).json({ success: false, error: 'User not authenticated' });
        const _tc = require('../middleware/tenant').tenantCollection;
        const UserPreferences = await _tc(req, "UserPreferences");
        const current = await UserPreferences.findOne({ userId: req.user._id, viewId: homeOverviewDataViewId }).lean();
        const merged = normalizeHomeOverviewData({
            ...(current?.preferences?.homeData || {}),
            ...(req.body?.homeData || req.body || {})
        });

        await UserPreferences.findOneAndUpdate(
            { userId: req.user._id, viewId: homeOverviewDataViewId },
            {
                $set: {
                    userId: req.user._id,
                    viewId: homeOverviewDataViewId,
                    'preferences.homeData': merged,
                    updatedAt: new Date()
                }
            },
            { upsert: true, new: true }
        );

        res.json({ success: true, homeData: merged });
    } catch (error) {
        console.error('[HomeOverview] Save widget data error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.use("/api/", require("./api/api-account.router.js"));
router.use("/api/user", require("./api/api-user.router.js"));
router.use("/mailbox", require("./mailbox.router.js"));

// Record Chat API (conversations + messages per record)
require('./api/api-record-chat.router')(router);

// Record Notes API (rich-text notes per record)
require('./api/api-record-notes.router')(router);

// React Islands API (JSON endpoints)
router.use("/", require("./api.routes.js"));

// Secure Attachment Download API (Simple Tenant Verification)
router.get("/uploads/attachments/*", async (req, res) => {
    const path = require("path");
    const fs = require("fs");
    // Verify user is connected to THIS account
    if (!req.user || req.account_number !== String(req.params.accountNumber || req.account_number)) {
        return res.status(403).send("Accès refusé. Ce document appartient à un autre compte.");
    }
    
    // The * capture group is available in req.params[0]
    const relativePath = req.params[0];
    if (!relativePath || relativePath.includes('..')) {
        return res.status(400).send("Requête invalide.");
    }

    try {
        const { tenantCollection } = require('../middleware/tenant');
        const Record = await tenantCollection(req, 'Record');
        if (Record) {
            const ownerRecord = await Record.findOne({ 'attachments.filename': relativePath })
                .select('attachments.$')
                .lean();
            const attachment = ownerRecord?.attachments?.[0];
            if (attachment?.isDataRoomOnly) {
                return res.status(403).send("Ce fichier est réservé à la Data Room.");
            }
        }
    } catch (e) {
        console.warn('[AttachmentDownload] Data Room visibility check skipped:', e.message);
    }

    // Try private_uploads first (new secure storage)
    let filePath = path.join(__dirname, "../private_uploads/attachments", String(req.account_number), relativePath);
    
    // Fallback to public/uploads for backwards compatibility
    if (!fs.existsSync(filePath)) {
        filePath = path.join(__dirname, "../public/uploads/attachments", String(req.account_number), relativePath);
    }

    if (fs.existsSync(filePath)) {
        // Security: Prevent MIME sniffing attacks
        res.setHeader('X-Content-Type-Options', 'nosniff');
        
        // If ?dl=filename is present, force download with the original name
        if (req.query.dl) {
            res.setHeader('Content-Disposition', 'attachment; filename="' + req.query.dl.replace(/"/g, '\\"') + '"');
        } else {
            // For potentially dangerous content types, force download instead of inline display
            const dangerousMimes = ['text/html', 'application/xhtml+xml', 'image/svg+xml', 'application/xml', 'text/xml'];
            const ext = path.extname(relativePath).toLowerCase();
            if (dangerousMimes.some(m => ext === '.html' || ext === '.htm' || ext === '.svg' || ext === '.xml')) {
                const basename = path.basename(relativePath);
                res.setHeader('Content-Disposition', 'attachment; filename="' + basename.replace(/"/g, '\\"') + '"');
            }
        }
        res.sendFile(filePath);
    } else {
        res.status(404).send("Document introuvable.");
    }
});

// Attachment API (file uploads for records)
router.use("/api", require("./api/api-attachment.router.js"));

// Data Room API (secure record-level file rooms)
router.use("/api", require("./api/api-data-room.router.js"));

// SmartDoc API (template-based document generation for records)
router.use("/api", require("./api/api-smartdoc.router.js"));

// Document Builder
router.use("/documents", require("./document.routes.js"));

// Database Management
router.use("/db", require("./db.routes.js"));

// Page Builder
router.use("/page-builder", require("./page-builder.routes.js"));

// Cockpit View (clean URL)
// Pre-register PageConfig model (non-standard filename: PageConfig.js instead of page-config.model.js)
try { require('../models/PageConfig'); } catch (e) { }
router.get("/cockpit/:id", async (req, res) => {
    try {
        const PageConfig = await tenantCollection(req, "PageConfig");

        // Support both ObjectId and slug
        const idParam = req.params.id;
        let query;
        if (mongoose.Types.ObjectId.isValid(idParam)) {
            query = { $or: [{ _id: idParam }, { slug: idParam }] };
        } else {
            query = { slug: idParam };
        }

        const pageConfig = await PageConfig.findOne(query);

        if (!pageConfig) {
            return res.status(404).send('Cockpit not found');
        }

        res.render('page-builder/cockpit-view', {
            layout: 'layout-app',
            user: req.user,
            account_number: req.account_number,
            pageConfig
        });
    } catch (error) {
        console.error('Error loading cockpit:', error);
        res.status(500).send('Error loading cockpit');
    }
});

// DataTable HTMX
router.use("/", require("./datatable.routes.js"));

// Profile Page
router.use("/profile", require("./profile.routes.js"));

// Unified Settings Page (consolidates admin + account-settings)
router.get("/settings", async (req, res) => {
    try {
        const { buildCanObject } = require("../middleware/permissions");

        // Only owner/admin can access settings
        if (!req.can || !req.can('settings.view')) {
            return res.redirect(`/account/${req.account_number}/home`);
        }

        const Account = require("../models/account.model");
        const User = require("../models/user.model");

        const account = await Account.findOne({ account_number: req.account_number });
        if (!account) return res.status(404).send("Account not found");

        const userRole = req.workspaceRole || 'member';
        const isOwner = userRole === 'owner';
        const isAdmin = userRole === 'owner' || userRole === 'admin';

        // Get members
        const activeMembers = account.users.filter(u => u.status === 'active');
        const userIds = activeMembers.map(u => u.userId);
        const users = await User.find({ _id: { $in: userIds } })
            .select('name email avatar status membership.plan lastLogin created_on');

        const members = users.map(u => {
            const entry = activeMembers.find(m => String(m.userId) === String(u._id));
            return {
                ...u.toObject(),
                workspaceRole: entry?.role || 'member',
                joinedAt: entry?.joinedAt,
            };
        });

        // Pending invitations
        const pendingInvites = account.invitations.filter(i => i.status === 'pending');

        // Build permission object for template
        const can = buildCanObject(userRole);

        res.render("account/account-settings-unified", {
            layout: "layout-app",
            user: req.user,
            account_number: req.account_number,
            account,
            members,
            pendingInvites,
            isAdmin,
            isOwner,
            userRole,
            can,
        });
    } catch (error) {
        console.error("[Settings] Error:", error);
        res.status(500).send("Error loading settings page");
    }
});

// App Presets (factory reset / preset installer)
router.use("/", require("./preset.router.js"));

// Integration Engine
router.use("/integrations/admin", require("../src/integrations/routes/admin.providers.routes.js"));
router.use("/integrations/admin", require("../src/integrations/routes/admin.actions.routes.js"));
router.use("/integrations", require("../src/integrations/routes/oauth.routes.js"));
router.use("/integrations", require("../src/integrations/routes/tenant.integrations.routes.js"));
router.use("/workflows", require("../src/integrations/routes/workflows.routes.js"));

// Tasks Hub (aggregated tasks across all records)
router.get("/tasks/lists", (req, res) => {
    res.render("account/account-task-lists", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

router.get("/tasks", (req, res) => {
    res.render("account/account-tasks-hub", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

// Tasks Embed (chromeless render of record-tasks-module for iframe in Tasks Hub)
router.get("/tasks-embed/:recordId", async (req, res) => {
    try {
        const _tc = require('../middleware/tenant').tenantCollection;
        const EntityModel = await _tc(req, "Entity");
        const RecordModel = await _tc(req, "Record");

        const record = await RecordModel.findById(req.params.recordId).select('title _id entityId');
        if (!record) return res.status(404).send("Record not found");

        const entity = await EntityModel.findById(record.entityId).select('name slug icon color');
        if (!entity) return res.status(404).send("Entity not found");

        res.render("account/account-tasks-embed", {
            layout: "layout-embed",
            user: req.user,
            account_number: req.account_number,
            record,
            entity,
            moduleName: 'tasks',
            _isTasksTab: true
        });
    } catch (error) {
        console.error('[TasksEmbed] Error:', error);
        res.status(500).send("Error loading tasks embed");
    }
});

// Agenda Hub (aggregated events across all records)
router.get("/agenda", (req, res) => {
    res.render("account/account-agenda-hub", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

// Chat System — old chat hub removed, now served by team-chat below

// Media Page
router.get("/media", (req, res) => {
    res.render("account/account-media", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

// Global Drive Page
router.get("/drive", (req, res) => {
    res.render("account/account-drive", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

// Global Drive - catch-all for deep links (/drive/Factures, /drive/app/entityId, etc.)
router.get("/drive/*", (req, res) => {
    res.render("account/account-drive", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});



// Doctor Clinical Command Center
router.get("/doctor", (req, res) => {
    res.render("account/account-doctor-dashboard", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

// Ordonnance (Prescription with LineBuilder)
const { tenantCollection } = require('../middleware/tenant');
const mongoose = require('mongoose');
router.get("/ordonnance", async (req, res) => {
    try {
        const LineSchema = await tenantCollection(req, 'LineSchema');
        const schema = LineSchema ? await LineSchema.findOne({ slug: 'traitement' }).lean() : null;

        if (!schema) {
            return res.status(404).send('Schema traitement introuvable. Lancez: node scripts/seed-cabinet-medical.js 5001');
        }

        // Generate a temporary document ID for this new ordonnance
        const documentId = new mongoose.Types.ObjectId();

        res.render("account/ordonnance", {
            layout: "layout-app",
            user: req.user,
            account_number: req.account_number,
            schemaId: schema._id,
            documentId: documentId
        });
    } catch (error) {
        console.error('[Ordonnance] Error:', error);
        res.status(500).send('Server Error');
    }
});
const { loadCockpitConfig } = require('../utils/cockpit-loader');
router.get("/doctor/cockpit", async (req, res) => {
    const cockpitConfig = await loadCockpitConfig('consultation', req.account_number);
    res.render("account/demo/doctor-cockpit", {
        layout: "layout-app",
        cockpitId: 'consultation',
        cockpitConfig,
        demo: true,
        user: req.user,
        account_number: req.account_number
    });
});

// Demo API for Cockpit
router.use("/api/demo", require("./api/api-demo.router.js"));

// Demo API for Timeline Widgets
router.use("/api/demo", require("./api/api-timeline-demo.router.js"));

// Demo API for Calendar Widgets
router.use("/api/demo", require("./api/api-calendar-demo.router.js"));

// Timeline Widgets Demo Page
router.get("/timeline-widgets", (req, res) => {
    res.render("account/demo/timeline-widgets", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

// Calendar Widgets Demo Page
router.get("/calendar-widgets", (req, res) => {
    res.render("account/demo/calendar-widgets", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

// Team Page
router.get("/team", (req, res) => {
    const userRole = req.workspaceRole || 'member';
    const isAdmin = userRole === 'owner' || userRole === 'admin';
    res.render("account/account-team", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number,
        userRole,
        isAdmin,
    });
});

// Permissions & Roles Page
const { requirePerm: requirePermRoute } = require('../middleware/permissions');
router.get("/permissions", (req, res) => {
    // Guard: only admin/owner can access (actual API is already guarded, but page should be too)
    if (!req.can || !req.can('members.changeRole')) {
        return res.redirect(`/account/${req.account_number}/home`);
    }
    res.render("account/account-permissions", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

// Roles Configuration Page
router.get("/roles", (req, res) => {
    if (!req.can || !req.can('settings.view')) {
        return res.redirect(`/account/${req.account_number}/home`);
    }
    res.render("account/account-roles", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

// Sharing Hub Page
router.get("/sharing", (req, res) => {
    res.render("account/account-sharing", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

// Team Chat Page (unified at /chat)
router.get("/chat", (req, res) => {
    res.render("account/account-team-chat", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

// Notes Hub (aggregated notes across all records)
router.get("/notes", (req, res) => {
    res.render("account/account-notes-hub", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

// Data Table Page
router.get("/datatable", (req, res) => {
    res.render("record/record-demo-datatable", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

// Showcase — Index of all pages/views/modules
router.get("/showcase", (req, res) => {
    res.render("showcase/showcase", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

// Test HTMX DataTable with full layout
router.get("/test-datatable/:entityName", async (req, res) => {
    try {
        const tenantCollection = require('../middleware/tenant').tenantCollection;

        // Register all required models BEFORE using populate
        await tenantCollection(req, "FieldTemplate");
        await tenantCollection(req, "Classification");
        const EntityModel = await tenantCollection(req, "Entity");
        const RecordModel = await tenantCollection(req, "Record");

        const entity = await EntityModel.findOne({ slug: req.params.entityName })
            .populate('customFields')
            .populate('classifications')
            .populate('statusClassification');

        if (!entity) {
            return res.status(404).send("Entity not found");
        }

        // Fetch records for initial render
        const limit = 10;
        const records = await RecordModel.find({ entityId: entity._id })
            .sort({ createdAt: -1 })
            .limit(limit);

        // Get total count for pagination
        const totalRecords = await RecordModel.countDocuments({ entityId: entity._id });

        // Create a mock view object for compatibility
        const view = {
            _id: entity._id,
            viewType: 'table',
            entity: entity._id
        };

        res.render("record/record-view-htmx-test", {
            entity,
            records,
            view,
            totalRecords,
            limit,
            layout: "layout-app",
            account_number: req.account_number,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// Test Progressive DataTable (React Island vs HTMX mode)
// Use ?virtualize=true to force React Island mode
router.get("/test-progressive/:entityName", async (req, res) => {
    try {
        const tenantCollection = require('../middleware/tenant').tenantCollection;

        // Register all required models BEFORE using populate
        await tenantCollection(req, "FieldTemplate");
        await tenantCollection(req, "Classification");
        const EntityModel = await tenantCollection(req, "Entity");
        const RecordModel = await tenantCollection(req, "Record");

        const entity = await EntityModel.findOne({ slug: req.params.entityName })
            .populate('customFields')
            .populate('classifications')
            .populate('statusClassification');

        if (!entity) {
            return res.status(404).send("Entity not found");
        }

        // Check if virtualize mode is requested
        const virtualize = req.query.virtualize === 'true';

        // Fetch records for initial render (only if not virtualize mode)
        const limit = virtualize ? 0 : 10;
        const records = virtualize ? [] : await RecordModel.find({ entityId: entity._id })
            .sort({ createdAt: -1 })
            .limit(limit);

        // Get total count for mode decision
        const totalRecords = await RecordModel.countDocuments({ entityId: entity._id });

        // Check viewType from query params (table or kanban)
        const viewType = req.query.viewType || 'table';

        // Create a mock view object for compatibility
        const view = {
            _id: entity._id,
            viewType: viewType,
            entity: entity._id,
            virtualize: virtualize || totalRecords > 5000
        };

        res.render("record/record-view-progressive", {
            entity,
            records,
            view,
            totalRecords,
            limit,
            pagination: {
                page: 1,
                limit: limit || 25,
                total: totalRecords,
                pages: Math.ceil(totalRecords / (limit || 25))
            },
            layout: "layout-app-progressive",
            account_number: req.account_number,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
