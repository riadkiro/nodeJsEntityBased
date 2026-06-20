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
const TaskListModel = require('../models/task-list.model');
const RecordTaskModel = require('../models/record-task.model');
const hubTaskText = (value, fallback = '') => {
    if (typeof value !== 'string') return fallback;
    const text = value.trim();
    if (!text || ['false', 'null', 'undefined'].includes(text.toLowerCase())) return fallback;
    return text;
};
const hubTaskListLabel = (value) => {
    const label = hubTaskText(value, 'Liste des tâches');
    const lower = label.toLowerCase();
    return (lower === 'général' || lower === 'tâches du jour' || lower === 'taches du jour') ? 'Liste des tâches' : label;
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
const hubPriorityColors = {
    Aucune: '',
    Basse: '#22c55e',
    Moyenne: '#f59e0b',
    Haute: '#ef4444',
    Urgente: '#dc2626'
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
    const label = hubTaskListLabel(options.label || 'Liste des tâches');
    const color = options.color || '#6366f1';
    const icon = options.icon || 'solar:checklist-bold-duotone';
    const { entity, record } = await ensurePersonalTaskRecord(req);
    const lists = await TaskListModel.find({ recordId: record._id }).sort({ order: 1, createdAt: 1 });
    let list = lists.find(l => hubTaskListLabel(l.label).toLowerCase() === label.toLowerCase());
    if (!list) {
        list = await TaskListModel.create({
            recordId: record._id,
            label,
            color,
            icon,
            order: lists.length,
            statuses: hubDefaultStatuses
        });
    } else if (!list.icon || list.color !== color) {
        list = await TaskListModel.findByIdAndUpdate(
            list._id,
            { $set: { icon: list.icon || icon, color: list.color || color } },
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
                    return {
                        taskListId: list._id,
                        recordId: record._id,
                        title,
                        description: hubTaskText(item?.description, ''),
                        status: done ? 'Terminé' : 'À faire',
                        statusColor: done ? hubStatusColors['Terminé'] : hubStatusColors['À faire'],
                        priority: 'Aucune',
                        priorityColor: '',
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
        label: 'Liste des tâches',
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
    const list = await TaskListModel.findById(id);
    if (!list) return null;

    const record = await Record.findById(list.recordId);
    if (!record) return null;
    const entity = record.entityId ? await Entity.findById(record.entityId) : null;
    return { entity: entity || {}, record, list };
}

router.post("/api/tasks-hub/personal-tasks", async (req, res) => {
    try {
        const title = hubTaskText(req.body?.title, '');
        if (!title) return res.status(400).json({ error: 'Title required' });

        const status = hubStatusColors[req.body?.status] ? req.body.status : 'À faire';
        const priority = hubPriorityColors.hasOwnProperty(req.body?.priority) ? req.body.priority : 'Aucune';
        const target = await resolveHubTaskTarget(req, req.body?.taskListId);
        if (!target) return res.status(404).json({ error: 'Liste de tâches introuvable' });
        const { entity, record, list } = target;
        const order = await RecordTaskModel.countDocuments({ taskListId: list._id });
        const task = await RecordTaskModel.create({
            taskListId: list._id,
            recordId: record._id,
            title,
            description: hubTaskText(req.body?.description, ''),
            status,
            statusColor: hubStatusColors[status] || '#9ca3af',
            priority,
            priorityColor: hubPriorityColors[priority] || '',
            startDate: req.body?.startDate || null,
            dueDate: req.body?.dueDate || null,
            assignedTo: hubTaskText(req.body?.assignedTo, ''),
            order
        });

        res.json({
            success: true,
            task: {
                _id: task._id.toString(),
                title: task.title,
                description: task.description || '',
                status: task.status,
                statusColor: task.statusColor,
                priority: task.priority || 'Aucune',
                priorityColor: task.priorityColor || '',
                isDayPriority: !!task.isDayPriority,
                startDate: task.startDate || null,
                dueDate: task.dueDate || null,
                assignedTo: task.assignedTo || '',
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
                scope: 'personal'
            }
        });
    } catch (error) {
        console.error('[TasksHub] Create personal task error:', error);
        res.status(500).json({ error: error.message });
    }
});
router.get("/api/tasks-hub", async (req, res) => {
    try {
        const _tc = require('../middleware/tenant').tenantCollection;
        const Entity = await _tc(req, "Entity");
        const Record = await _tc(req, "Record");

        // Scope to tenant: get all record IDs belonging to this tenant first
        const tenantRecords = await Record.find({}).select('_id title computedTitle referenceTitle entityId icon color slug image').lean();
        const tenantRecordIds = tenantRecords.map(r => r._id);
        if (tenantRecordIds.length === 0) {
            return res.json({ success: true, entities: [], totalTasks: 0, doneTasks: 0 });
        }

        const allLists = await TaskListModel.find({ recordId: { $in: tenantRecordIds } }).sort({ order: 1, createdAt: 1 }).lean();
        if (allLists.length === 0) {
            return res.json({ success: true, entities: [], totalTasks: 0, doneTasks: 0 });
        }

        const allTasks = await RecordTaskModel.find({ recordId: { $in: tenantRecordIds } }).sort({ order: 1, createdAt: -1 }).lean();
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
            const listStatuses = (Array.isArray(list.statuses) && list.statuses.length > 0
                ? list.statuses
                : hubDefaultStatuses)
                .slice()
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map(s => ({ label: s.label, color: s.color, order: s.order || 0 }));
            const listTasks = (tasksByListId[listId] || []).slice().sort((a, b) => {
                const ao = Number.isFinite(Number(a.order)) ? Number(a.order) : 0;
                const bo = Number.isFinite(Number(b.order)) ? Number(b.order) : 0;
                if (ao !== bo) return ao - bo;
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            });
            const normalizedTasks = listTasks.map(t => ({
                _id: t._id.toString(),
                title: hubTaskText(t.title, 'Sans titre'),
                description: t.description || '',
                status: hubTaskText(t.status, 'À faire'),
                statusColor: t.statusColor || '#9ca3af',
                priority: hubTaskText(t.priority, 'Aucune'),
                priorityColor: t.priorityColor || '',
                isDayPriority: !!t.isDayPriority,
                startDate: t.startDate || null,
                dueDate: t.dueDate || null,
                assignedTo: t.assignedTo || '',
                createdAt: t.createdAt || null,
                updatedAt: t.updatedAt || null,
                completedAt: t.completedAt || null,
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
                entityColor: entity?.color || '#4361ee'
            }));
            const done = listTasks.filter(t => t.status === 'Terminé').length;
            entityGroups[eId].records[rId].totalTasks += normalizedTasks.length;
            entityGroups[eId].records[rId].doneTasks += done;
            entityGroups[eId].records[rId].listsCount += 1;
            entityGroups[eId].records[rId].lists.push({
                listId,
                label: listLabel,
                color: listColor,
                icon: listIcon,
                statuses: listStatuses,
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

        res.json({ success: true, entities: result, totalTasks, doneTasks: totalDone });
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
            label: 'Liste de courses',
            color: '#10b981',
            icon: 'solar:cart-large-bold-duotone',
            seedTasks: homeData.shoppingItems
        });

        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        // Scope to tenant: get all record IDs belonging to this tenant first
        const tenantRecordIds = await Record.find({}).distinct('_id');

        const [allLists, allTasks] = await Promise.all([
            tenantRecordIds.length ? TaskListModel.find({ recordId: { $in: tenantRecordIds } }).lean() : Promise.resolve([]),
            tenantRecordIds.length ? RecordTaskModel.find({ recordId: { $in: tenantRecordIds } }).lean() : Promise.resolve([])
        ]);

        const recordIds = new Set();
        allLists.forEach(list => { if (list?.recordId) recordIds.add(list.recordId.toString()); });
        allTasks.forEach(task => { if (task?.recordId) recordIds.add(task.recordId.toString()); });

        const records = recordIds.size
            ? await Record.find({ _id: { $in: [...recordIds] } })
                .select('title computedTitle referenceTitle entityId icon color updatedAt createdAt')
                .lean()
            : [];
        const recordMap = {};
        records.forEach(record => { recordMap[record._id.toString()] = record; });

        const entityIds = [...new Set(records.map(record => record.entityId?.toString()).filter(Boolean))];
        const entities = entityIds.length
            ? await Entity.find({ _id: { $in: entityIds } }).select('name slug icon color').lean()
            : [];
        const entityMap = {};
        entities.forEach(entity => { entityMap[entity._id.toString()] = entity; });

        const listMap = {};
        allLists.forEach(list => { listMap[list._id.toString()] = list; });

        const isDone = task => String(task?.status || '') === 'Terminé';
        const inToday = value => {
            if (!value) return false;
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return false;
            return date >= start && date < end;
        };
        const isBeforeToday = value => {
            if (!value) return false;
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return false;
            return date < start;
        };
        const isTodayList = list => /^(g[eé]n[eé]ral|t[âa]ches?\s+du\s+jour)$/i.test(String(list?.label || '').trim());
        const cleanLabel = label => String(label || '').trim().toLowerCase() === 'général' ? 'Tâches du jour' : (String(label || '').trim() || 'Tâches du jour');
        const recordTitle = record => record?.computedTitle || record?.referenceTitle || record?.title || 'Sans titre';

        // Filter tasks to only those whose record exists in this tenant
        const taskRows = allTasks
            .filter(task => {
                const rId = task.recordId?.toString?.() || '';
                return rId && recordMap[rId];
            })
            .map(task => {
            const list = listMap[task.taskListId?.toString?.() || ''];
            const record = recordMap[task.recordId?.toString?.() || ''];
            const entity = record?.entityId ? entityMap[record.entityId.toString()] : null;
            const entitySlug = entity?.slug || '';
            const taskId = task._id.toString();
            const recordId = record?._id?.toString?.() || '';
            const listId = list?._id?.toString?.() || task.taskListId?.toString?.() || '';
            return {
                id: taskId,
                _id: taskId,
                title: String(task.title || '').trim() || 'Sans titre',
                status: task.status || 'À faire',
                statusColor: task.statusColor || '#9ca3af',
                priority: task.priority || 'Aucune',
                priorityColor: task.priorityColor || '',
                dueDate: task.dueDate || null,
                startDate: task.startDate || null,
                createdAt: task.createdAt || null,
                updatedAt: task.updatedAt || null,
                completedAt: task.completedAt || null,
                order: Number.isFinite(Number(task.order)) ? Number(task.order) : 0,
                listId,
                taskListId: listId,
                listLabel: cleanLabel(list?.label),
                listColor: list?.color || '#6366f1',
                listIcon: list?.icon || 'solar:checklist-bold-duotone',
                listIsToday: isTodayList(list),
                recordId,
                recordTitle: recordTitle(record),
                recordIcon: record?.icon || '',
                recordColor: record?.color || '',
                entityName: entity?.name || 'Sans entité',
                entitySlug,
                entityIcon: entity?.icon || 'solar:folder-bold-duotone',
                entityColor: entity?.color || '#4361ee',
                link: recordId && entitySlug ? `/account/${req.account_number}/record/${entitySlug}/${recordId}/tasks?openTask=${taskId}` : `/account/${req.account_number}/tasks`
            };
        });

	        const todayTasks = taskRows
	            .filter(task => task.status !== 'Terminé' && (inToday(task.dueDate) || inToday(task.startDate) || task.listIsToday))
	            .sort((a, b) => {
                const aOverdue = isBeforeToday(a.dueDate) ? 0 : 1;
                const bOverdue = isBeforeToday(b.dueDate) ? 0 : 1;
                if (aOverdue !== bOverdue) return aOverdue - bOverdue;
                const ad = new Date(a.dueDate || a.startDate || 8640000000000000).getTime();
                const bd = new Date(b.dueDate || b.startDate || 8640000000000000).getTime();
	                return ad - bd;
	            });
	        const completedToday = taskRows
	            .filter(task => {
	                if (task.status !== 'Terminé') return false;
	                const cAt = task.completedAt ? new Date(task.completedAt).getTime() : 0;
	                const uAt = task.updatedAt ? new Date(task.updatedAt).getTime() : 0;
	                const checkTime = cAt || uAt;
	                return checkTime >= start.getTime() && checkTime < end.getTime();
	            });
	        const openTasksSorted = taskRows
	            .filter(task => task.status !== 'Terminé')
	            .sort((a, b) => {
	                const aOverdue = isBeforeToday(a.dueDate) ? 0 : 1;
	                const bOverdue = isBeforeToday(b.dueDate) ? 0 : 1;
	                if (aOverdue !== bOverdue) return aOverdue - bOverdue;
	                const ad = new Date(a.dueDate || a.startDate || 8640000000000000).getTime();
	                const bd = new Date(b.dueDate || b.startDate || 8640000000000000).getTime();
	                return ad - bd;
	            });
	        const tasksByRecordMap = {};
	        taskRows.forEach(task => {
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
	                    openTasks: 0
	                };
	            }
	            tasksByRecordMap[task.recordId].totalTasks += 1;
	            if (isDone(task)) tasksByRecordMap[task.recordId].doneTasks += 1;
	            else tasksByRecordMap[task.recordId].openTasks += 1;
	        });
		        const tasksByRecord = Object.values(tasksByRecordMap)
		            .filter(group => group.openTasks > 0)
		            .sort((a, b) => b.openTasks - a.openTasks || a.title.localeCompare(b.title))
		            .slice(0, 8);

            const taskSort = (a, b) => {
                const aDone = isDone(a) ? 1 : 0;
                const bDone = isDone(b) ? 1 : 0;
                if (aDone !== bDone) return aDone - bDone;
                const ao = Number.isFinite(Number(a.order)) ? Number(a.order) : 0;
                const bo = Number.isFinite(Number(b.order)) ? Number(b.order) : 0;
                if (ao !== bo) return ao - bo;
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            };
            const tasksByListIdForHome = {};
            taskRows.forEach(task => {
                if (!task.listId) return;
                if (!tasksByListIdForHome[task.listId]) tasksByListIdForHome[task.listId] = [];
                tasksByListIdForHome[task.listId].push(task);
            });
            const taskLists = allLists
                .filter(list => recordMap[list.recordId?.toString?.() || ''])
                .map(list => {
                    const listId = list._id.toString();
                    const record = recordMap[list.recordId?.toString?.() || ''];
                    const entity = record?.entityId ? entityMap[record.entityId.toString()] : null;
                    const entitySlug = entity?.slug || '';
                    const recordId = record?._id?.toString?.() || '';
                    const tasks = (tasksByListIdForHome[listId] || []).slice().sort(taskSort);
                    return {
                        id: listId,
                        _id: listId,
                        label: cleanLabel(list.label),
                        rawLabel: list.label || '',
                        color: list.color || '#6366f1',
                        icon: list.icon || 'solar:checklist-bold-duotone',
                        recordId,
                        recordTitle: recordTitle(record),
                        recordIcon: record?.icon || entity?.icon || 'solar:folder-bold-duotone',
                        recordColor: record?.color || entity?.color || '#4361ee',
                        entityName: entity?.name || 'Sans entité',
                        entitySlug,
                        entityIcon: entity?.icon || 'solar:folder-bold-duotone',
                        entityColor: entity?.color || '#4361ee',
                        link: recordId && entitySlug ? `/account/${req.account_number}/record/${entitySlug}/${recordId}/tasks` : `/account/${req.account_number}/tasks`,
                        count: tasks.length,
                        doneCount: tasks.filter(isDone).length,
                        tasks: tasks.slice(0, 40)
                    };
                })
                .sort((a, b) => {
                    const aShopping = a.id === shoppingTarget.list._id.toString() ? 0 : 1;
                    const bShopping = b.id === shoppingTarget.list._id.toString() ? 0 : 1;
                    if (aShopping !== bShopping) return aShopping - bShopping;
                    return a.label.localeCompare(b.label);
                });

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

	        const totalTasks = taskRows.length;
	        const doneTasks = taskRows.filter(isDone).length;
	        const openTasks = totalTasks - doneTasks;
	        const overdueCount = taskRows.filter(task => task.status !== 'Terminé' && isBeforeToday(task.dueDate)).length;
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
	            todayTasks,
	            completedToday,
		            tasks: openTasksSorted.slice(0, 20),
		            tasksByRecord,
                    taskLists,
		            recentRecords,
		            upcomingEvents,
	            importantDates,
	            homeData,
                defaultWidgets: {
                    shoppingListId: shoppingTarget.list._id.toString()
                },
	            stats: {
                totalTasks,
                doneTasks,
                openTasks,
	                todayTasks: todayTasks.length,
	                overdueCount,
	                weekEvents,
	                listsCount: allLists.length,
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
