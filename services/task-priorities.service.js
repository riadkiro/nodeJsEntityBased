const { tenantCollection } = require('../middleware/tenant');
const { taskTenantModels } = require('./task-tenant-models.service');

const TASK_PRIORITIES_VIEW_ID = 'task_priorities';

const defaultTaskPriorities = [
    { label: 'Aucune', color: '#cbd5e1', order: 0 },
    { label: 'Normal', color: '#3b82f6', order: 1 },
    { label: 'Important', color: '#f59e0b', order: 2 },
    { label: 'Urgent', color: '#ef4444', order: 3 },
];

const legacyPriorityAliases = {
    basse: 'Normal',
    low: 'Normal',
    moyenne: 'Normal',
    medium: 'Normal',
    normal: 'Normal',
    haute: 'Important',
    high: 'Important',
    important: 'Important',
    urgente: 'Urgent',
    urgent: 'Urgent',
    critical: 'Urgent',
    critique: 'Urgent',
};

function cleanTaskPriorityText(value, fallback = '') {
    const text = String(value ?? '').trim();
    if (!text || ['false', 'null', 'undefined'].includes(text.toLowerCase())) return fallback;
    return text;
}

function foldTaskPriorityText(value) {
    return cleanTaskPriorityText(value, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function normalizeTaskPriorityOptions(options, fallback = defaultTaskPriorities) {
    const source = Array.isArray(options) && options.length ? options : fallback;
    const fallbackByLabel = new Map(
        (fallback || []).map(option => [foldTaskPriorityText(option?.label), option])
    );
    const seen = new Set();
    const normalized = source
        .map((item, index) => {
            const label = cleanTaskPriorityText(item?.label ?? item, '');
            const folded = foldTaskPriorityText(label);
            const fallbackOption = fallbackByLabel.get(folded) || fallback[index] || {};
            return {
                label,
                color: cleanTaskPriorityText(item?.color, fallbackOption.color || '#94a3b8'),
                order: Number.isFinite(Number(item?.order)) ? Number(item.order) : index,
            };
        })
        .filter(option => {
            const key = foldTaskPriorityText(option.label);
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .sort((a, b) => a.order - b.order)
        .map((option, index) => ({ ...option, order: index }));

    return normalized.length ? normalized : defaultTaskPriorities;
}

function priorityOptionFor(value, options = defaultTaskPriorities) {
    const priorities = normalizeTaskPriorityOptions(options);
    const raw = cleanTaskPriorityText(value, '');
    const folded = foldTaskPriorityText(raw);
    const exact = priorities.find(option => foldTaskPriorityText(option.label) === folded);
    if (exact) return exact;

    const alias = legacyPriorityAliases[folded];
    if (alias) {
        const aliased = priorities.find(option => foldTaskPriorityText(option.label) === foldTaskPriorityText(alias));
        if (aliased) return aliased;
    }

    const none = priorities.find(option => foldTaskPriorityText(option.label) === 'aucune');
    return none || priorities[0] || defaultTaskPriorities[0];
}

function priorityLabelFor(value, options = defaultTaskPriorities) {
    return priorityOptionFor(value, options).label;
}

function priorityColorFor(value, options = defaultTaskPriorities, fallback = '') {
    return priorityOptionFor(value, options).color || fallback;
}

async function getAccountTaskPriorities(req) {
    if (Array.isArray(req._accountTaskPriorities)) return req._accountTaskPriorities;

    try {
        const AccountPreferences = await tenantCollection(req, 'AccountPreferences');
        const accountId = String(req.account_number || '');
        const prefs = AccountPreferences && accountId
            ? await AccountPreferences.findOne({ accountId, viewId: TASK_PRIORITIES_VIEW_ID }).lean()
            : null;
        req._accountTaskPriorities = normalizeTaskPriorityOptions(
            prefs?.preferences?.priorities,
            defaultTaskPriorities
        );
    } catch (error) {
        console.error('[TaskPriorities] Load account priorities error:', error);
        req._accountTaskPriorities = defaultTaskPriorities;
    }

    return req._accountTaskPriorities;
}

async function syncTaskListsToAccountPriorities(req, priorities) {
    const { TaskList } = await taskTenantModels(req);
    if (!TaskList) return;
    await TaskList.updateMany({}, { $set: { priorities } });
}

async function syncTasksToAccountPriorities(req, previousOptions, nextOptions, renames = []) {
    const { RecordTask } = await taskTenantModels(req);
    if (!RecordTask) return;

    const priorities = normalizeTaskPriorityOptions(nextOptions);
    const fallback = priorityOptionFor('Aucune', priorities) || priorities[0];
    const nextLabels = new Set(priorities.map(option => option.label));
    const renamePairs = (Array.isArray(renames) ? renames : [])
        .map(item => ({
            from: cleanTaskPriorityText(item?.from, ''),
            to: cleanTaskPriorityText(item?.to, ''),
        }))
        .filter(item => item.from && item.to && item.from !== item.to);

    for (const pair of renamePairs) {
        const next = priorities.find(option => foldTaskPriorityText(option.label) === foldTaskPriorityText(pair.to));
        if (!next) continue;
        await RecordTask.updateMany(
            { priority: pair.from },
            { $set: { priority: next.label, priorityColor: next.color || '' } }
        );
    }

    for (const legacyLabel of ['Basse', 'Moyenne', 'Haute', 'Urgente', 'Low', 'Medium', 'High', 'Critical']) {
        const next = priorityOptionFor(legacyLabel, priorities);
        await RecordTask.updateMany(
            { priority: legacyLabel },
            { $set: { priority: next.label, priorityColor: next.color || '' } }
        );
    }

    for (const option of priorities) {
        await RecordTask.updateMany(
            { priority: option.label },
            { $set: { priorityColor: option.color || '' } }
        );
    }

    const renamedFrom = new Set(renamePairs.map(item => item.from));
    const removedLabels = normalizeTaskPriorityOptions(previousOptions)
        .map(item => item.label)
        .filter(label => label && !nextLabels.has(label) && !renamedFrom.has(label));

    if (removedLabels.length) {
        await RecordTask.updateMany(
            { priority: { $in: removedLabels } },
            { $set: { priority: fallback.label, priorityColor: fallback.color || '' } }
        );
    }

    await RecordTask.updateMany(
        { priority: { $nin: [...nextLabels] } },
        { $set: { priority: fallback.label, priorityColor: fallback.color || '' } }
    );
}

async function saveAccountTaskPriorities(req, priorities, { renames = [] } = {}) {
    const previous = await getAccountTaskPriorities(req);
    const cleaned = normalizeTaskPriorityOptions(priorities, previous.length ? previous : defaultTaskPriorities);
    const AccountPreferences = await tenantCollection(req, 'AccountPreferences');
    const accountId = String(req.account_number || '');

    if (!AccountPreferences || !accountId) {
        throw new Error('Preferences compte indisponibles');
    }

    await AccountPreferences.findOneAndUpdate(
        { accountId, viewId: TASK_PRIORITIES_VIEW_ID },
        {
            $set: {
                preferences: { priorities: cleaned },
                updatedAt: new Date(),
            },
            $setOnInsert: {
                accountId,
                viewId: TASK_PRIORITIES_VIEW_ID,
            },
        },
        { upsert: true, new: true }
    );

    req._accountTaskPriorities = cleaned;
    await syncTaskListsToAccountPriorities(req, cleaned);
    await syncTasksToAccountPriorities(req, previous, cleaned, renames);

    return cleaned;
}

module.exports = {
    TASK_PRIORITIES_VIEW_ID,
    defaultTaskPriorities,
    cleanTaskPriorityText,
    foldTaskPriorityText,
    normalizeTaskPriorityOptions,
    priorityOptionFor,
    priorityLabelFor,
    priorityColorFor,
    getAccountTaskPriorities,
    saveAccountTaskPriorities,
    syncTaskListsToAccountPriorities,
    syncTasksToAccountPriorities,
};
