const TaskOverview = require('./task-overview.service');

const DEFAULT_TIME_ZONE = 'Africa/Casablanca';
const MAX_TASK_RESULTS = 100;

function normalizeText(value = '') {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[’']/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function dateKeyInTimeZone(value = new Date(), timeZone = DEFAULT_TIME_ZONE) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(date).map(part => [part.type, part.value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
}

function shiftDateKey(dateKey, days) {
    const [year, month, day] = String(dateKey).split('-').map(Number);
    if (!year || !month || !day) return '';
    return new Date(Date.UTC(year, month - 1, day + Number(days || 0)))
        .toISOString()
        .slice(0, 10);
}

function weekRange(todayKey, weekOffset = 0) {
    const date = new Date(`${todayKey}T00:00:00.000Z`);
    const daysSinceMonday = (date.getUTCDay() + 6) % 7;
    const from = shiftDateKey(todayKey, -daysSinceMonday + (weekOffset * 7));
    return { from, to: shiftDateKey(from, 6) };
}

function monthRange(todayKey, monthOffset = 0) {
    const [year, month] = todayKey.split('-').map(Number);
    const first = new Date(Date.UTC(year, month - 1 + monthOffset, 1));
    const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0));
    return {
        from: first.toISOString().slice(0, 10),
        to: last.toISOString().slice(0, 10),
    };
}

function explicitIsoRange(text = '') {
    const dates = String(text).match(/\b\d{4}-\d{2}-\d{2}\b/g) || [];
    if (!dates.length) return null;
    return { from: dates[0], to: dates[1] || dates[0] };
}

function relativeDateRange(text, now = new Date(), timeZone = DEFAULT_TIME_ZONE) {
    const normalized = normalizeText(text);
    const todayKey = dateKeyInTimeZone(now, timeZone);
    const explicit = explicitIsoRange(text);
    if (explicit) return explicit;
    if (/\bsemaine prochaine\b/.test(normalized)) return weekRange(todayKey, 1);
    if (/\bsemaine (?:derniere|precedente)\b/.test(normalized)) return weekRange(todayKey, -1);
    if (/\b(?:cette semaine|semaine en cours)\b/.test(normalized)) return weekRange(todayKey, 0);
    if (/\bmois prochain\b/.test(normalized)) return monthRange(todayKey, 1);
    if (/\bmois (?:dernier|precedent)\b/.test(normalized)) return monthRange(todayKey, -1);
    if (/\b(?:ce mois|mois en cours)\b/.test(normalized)) return monthRange(todayKey, 0);
    if (/\bapres demain\b/.test(normalized)) {
        const key = shiftDateKey(todayKey, 2);
        return { from: key, to: key };
    }
    if (/\bdemain\b/.test(normalized)) {
        const key = shiftDateKey(todayKey, 1);
        return { from: key, to: key };
    }
    if (/\baujourd hui\b/.test(normalized)) return { from: todayKey, to: todayKey };
    const nextDays = normalized.match(/\b(?:prochains?|dans les?)\s+(\d{1,3})\s+jours?\b/);
    if (nextDays) return { from: todayKey, to: shiftDateKey(todayKey, Number(nextDays[1])) };
    return null;
}

function taskSearchIntent(currentMessage = '', history = []) {
    const current = normalizeText(currentMessage);
    const previousUserText = (Array.isArray(history) ? history : [])
        .filter(message => message?.role === 'user')
        .slice(-4)
        .map(message => normalizeText(message.content))
        .join(' ');
    const mentionsTasks = /\b(tache|taches|todo|a faire)\b/.test(current);
    const refinesTaskSearch = /\b(date de debut|debut|echeance|filtre|filtrer|periode|semaine|mois)\b/.test(current)
        && /\b(tache|taches|todo|a faire)\b/.test(previousUserText);
    if (!mentionsTasks && !refinesTaskSearch) return false;

    const mutationOnly = /\b(cree|creer|ajoute|ajouter|modifie|modifier|supprime|supprimer|reporte|reporter)\b/.test(current);
    const lookup = /\b(resume|resumer|liste|lister|montre|montrer|affiche|afficher|cherche|chercher|retrouve|retrouver|quell|combien|prevu|planifie|filtre|semaine|mois|aujourd hui|demain|date|retard)\b/.test(current);
    return !mutationOnly || lookup;
}

function inferTaskSearchFilters(currentMessage = '', options = {}) {
    const history = Array.isArray(options.history) ? options.history : [];
    if (!taskSearchIntent(currentMessage, history)) return null;

    const timeZone = options.timeZone || DEFAULT_TIME_ZONE;
    const now = options.now || new Date();
    const priorUserMessages = history
        .filter(message => message?.role === 'user')
        .slice(-4)
        .map(message => String(message.content || ''));
    const combined = [...priorUserMessages, currentMessage].join('\n');
    const current = normalizeText(currentMessage);
    const all = normalizeText(combined);
    const range = relativeDateRange(currentMessage, now, timeZone)
        || relativeDateRange(combined, now, timeZone);

    let dateField = 'startDate';
    if (/\b(echeance|date limite|date de fin|due date)\b/.test(current)) dateField = 'dueDate';
    else if (/\b(date de debut|commence|commencer|planifie|planifiee)\b/.test(current)) dateField = 'startDate';
    else if (/\b(echeance|date limite|date de fin|due date)\b/.test(all)) dateField = 'dueDate';

    let completion = 'open';
    if (/\b(terminees?|completees?|faites?)\b/.test(current)) completion = 'completed';
    else if (/\b(toutes les taches|taches toutes)\b/.test(current)) completion = 'all';

    const priorities = [];
    if (/\burgent(?:e|es|s)?\b/.test(current)) priorities.push('Urgent');
    if (/\bimportant(?:e|es|s)?\b/.test(current)) priorities.push('Important');
    if (/\bnormales?\b/.test(current)) priorities.push('Normal');

    const listMatch = String(currentMessage).match(/\b(?:dans la liste|liste)\s+["“]?([^,"”?.]+?)(?=\s+(?:de la|du|pour|entre|avec|qui)\b|$)/i);
    const assignedMatch = String(currentMessage).match(/\b(?:assignee?s? a|pour)\s+["“]?([^,"”?.]+?)(?=\s+(?:de la|du|entre|avec|qui)\b|$)/i);

    return {
        resource: 'tasks',
        dateField,
        from: range?.from || null,
        to: range?.to || null,
        completion,
        priorities,
        list: listMatch?.[1]?.trim() || '',
        assignedTo: assignedMatch?.[1]?.trim() || '',
        query: '',
        timeZone,
        limit: MAX_TASK_RESULTS,
    };
}

function isTaskCompleted(task = {}) {
    const status = normalizeText(task.status);
    return task.done === true || status.includes('termine') || status === 'done' || status === 'completed';
}

function includesNormalized(value, expected) {
    if (!expected) return true;
    return normalizeText(value).includes(normalizeText(expected));
}

function filterTaskRows(rows = [], filters = {}, now = new Date()) {
    const timeZone = filters.timeZone || DEFAULT_TIME_ZONE;
    const dateTools = TaskOverview.createDateTools({ tz: timeZone }, now);
    const dateField = ['startDate', 'dueDate', 'scheduled'].includes(filters.dateField)
        ? filters.dateField : 'startDate';
    const from = filters.from || '';
    const to = filters.to || from;
    const priorities = (Array.isArray(filters.priorities) ? filters.priorities : [])
        .map(normalizeText)
        .filter(Boolean);
    const completion = ['open', 'completed', 'all'].includes(filters.completion)
        ? filters.completion : 'open';

    const taskDate = task => {
        const value = dateField === 'dueDate'
            ? task.dueDate
            : dateField === 'scheduled'
                ? (task.startDate || task.dueDate)
                : task.startDate;
        return value ? dateTools.formatKey(value) : '';
    };

    const matches = (Array.isArray(rows) ? rows : []).filter(task => {
        const completed = isTaskCompleted(task);
        if (completion === 'open' && completed) return false;
        if (completion === 'completed' && !completed) return false;
        const key = taskDate(task);
        if (from && (!key || key < from)) return false;
        if (to && (!key || key > to)) return false;
        if (priorities.length && !priorities.includes(normalizeText(task.priority))) return false;
        if (!includesNormalized(task.listLabel || task.list, filters.list)) return false;
        if (!includesNormalized(task.assignedTo, filters.assignedTo)) return false;
        if (filters.query) {
            const haystack = [
                task.title,
                task.description,
                task.listLabel || task.list,
                task.recordTitle || task.record,
                task.entityName || task.entity,
                task.assignedTo,
                ...(Array.isArray(task.tags) ? task.tags.map(tag => tag?.label || tag) : []),
            ].map(normalizeText).join(' ');
            if (!haystack.includes(normalizeText(filters.query))) return false;
        }
        return true;
    }).sort((a, b) => {
        const dateCompare = (taskDate(a) || '9999-12-31').localeCompare(taskDate(b) || '9999-12-31');
        if (dateCompare) return dateCompare;
        return Number(a.order || 0) - Number(b.order || 0);
    });

    const limit = Math.min(MAX_TASK_RESULTS, Math.max(1, Number(filters.limit) || MAX_TASK_RESULTS));
    return {
        matches,
        items: matches.slice(0, limit),
        total: matches.length,
        truncated: matches.length > limit,
        dateField,
    };
}

function summarizeTaskResult(task = {}) {
    return {
        id: String(task.id || task._id || ''),
        title: String(task.title || 'Sans titre'),
        status: String(task.status || 'À faire'),
        priority: String(task.priority || 'Normal'),
        startDate: task.startDate || null,
        dueDate: task.dueDate || null,
        list: task.listLabel || task.list || 'Liste des tâches',
        record: task.recordTitle || task.record || '',
        entity: task.entityName || task.entity || '',
        assignedTo: task.assignedTo || '',
        tags: (Array.isArray(task.tags) ? task.tags : []).map(tag => tag?.label || String(tag)).filter(Boolean),
        link: task.link || '',
    };
}

async function searchTasks(req, filters, options = {}) {
    const taskOverview = options.taskOverview || TaskOverview;
    const board = await taskOverview.buildTaskBoard(req, { includeAllTasks: true });
    const filtered = filterTaskRows(board.allTasks || [], filters, options.now || new Date());
    return {
        tool: 'workspace-data-search',
        resource: 'tasks',
        filters: {
            dateField: filtered.dateField,
            from: filters.from || null,
            to: filters.to || null,
            completion: filters.completion || 'open',
            priorities: filters.priorities || [],
            list: filters.list || '',
            assignedTo: filters.assignedTo || '',
            query: filters.query || '',
            timeZone: filters.timeZone || DEFAULT_TIME_ZONE,
        },
        total: filtered.total,
        returned: filtered.items.length,
        truncated: filtered.truncated,
        items: filtered.items.map(summarizeTaskResult),
        executedAt: new Date().toISOString(),
    };
}

async function runWorkspaceDataSearch(req, currentMessage, options = {}) {
    const filters = inferTaskSearchFilters(currentMessage, options);
    if (!filters) return null;
    return searchTasks(req, filters, options);
}

function dataSearchPrompt(result = null) {
    if (!result || result.tool !== 'workspace-data-search') return '';
    const filters = result.filters || {};
    const dateLabel = filters.from
        ? `${filters.from}${filters.to && filters.to !== filters.from ? ` au ${filters.to}` : ''}`
        : 'toutes dates';
    const fieldLabel = filters.dateField === 'dueDate'
        ? "date d'échéance"
        : filters.dateField === 'scheduled' ? 'date planifiée' : 'date de début';
    const rows = (result.items || []).map((task, index) => {
        const details = [
            task.startDate ? `début: ${new Date(task.startDate).toISOString().slice(0, 10)}` : '',
            task.dueDate ? `échéance: ${new Date(task.dueDate).toISOString().slice(0, 10)}` : '',
            task.priority ? `priorité: ${task.priority}` : '',
            task.status ? `statut: ${task.status}` : '',
            task.list ? `liste: ${task.list}` : '',
            task.record ? `fiche: ${task.record}` : '',
            task.assignedTo ? `assignée à: ${task.assignedTo}` : '',
        ].filter(Boolean).join('; ');
        return `${index + 1}. **${task.title}**${details ? ` — ${details}` : ''}`;
    });

    return `## Résultat de l'outil interne workspace-data-search
Ressource: tâches
Filtre de date réellement appliqué: ${fieldLabel}, du ${dateLabel}
Statut: ${filters.completion || 'open'}
Résultats exacts: ${result.total}${result.truncated ? ` (les ${result.returned} premiers sont fournis)` : ''}

${rows.length ? rows.join('\n') : 'Aucune tâche ne correspond exactement à ces filtres.'}

RÈGLE OUTIL: ce résultat provient d'une requête serveur fraîche sur toutes les tâches du workspace. Il est prioritaire sur le résumé « aujourd’hui / en retard ». Réponds directement avec ces données et les filtres appliqués. N'affirme jamais que les dates sont indisponibles lorsque cet outil a été exécuté.`;
}

module.exports = {
    DEFAULT_TIME_ZONE,
    MAX_TASK_RESULTS,
    normalizeText,
    dateKeyInTimeZone,
    shiftDateKey,
    weekRange,
    relativeDateRange,
    inferTaskSearchFilters,
    filterTaskRows,
    searchTasks,
    runWorkspaceDataSearch,
    dataSearchPrompt,
};
