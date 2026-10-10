const assert = require('node:assert/strict');
const test = require('node:test');

const aiAssistant = require('../controllers/ai-assistant.controller');
const MobileAgendaService = require('../services/mobile-agenda.service');
const WorkspaceDataSearch = require('../services/ai-workspace-data-search.service');

test('workspace data search turns next week into an exact start-date filter', () => {
    const filters = WorkspaceDataSearch.inferTaskSearchFilters(
        'Fais-moi un résumé des tâches de la semaine prochaine',
        { now: new Date('2026-10-10T12:00:00.000Z'), timeZone: 'Africa/Casablanca' },
    );

    assert.equal(filters.resource, 'tasks');
    assert.equal(filters.dateField, 'startDate');
    assert.equal(filters.from, '2026-10-12');
    assert.equal(filters.to, '2026-10-18');
    assert.equal(filters.completion, 'open');
});

test('workspace data search keeps the previous period when the user refines the date field', () => {
    const filters = WorkspaceDataSearch.inferTaskSearchFilters(
        'Il faut checker la date de début',
        {
            now: new Date('2026-10-10T12:00:00.000Z'),
            timeZone: 'Africa/Casablanca',
            history: [{ role: 'user', content: 'Liste les tâches de la semaine prochaine' }],
        },
    );

    assert.equal(filters.dateField, 'startDate');
    assert.equal(filters.from, '2026-10-12');
    assert.equal(filters.to, '2026-10-18');
});

test('workspace data search filters all task rows by start date instead of due date', () => {
    const result = WorkspaceDataSearch.filterTaskRows([
        { id: 'a', title: 'Commence lundi', status: 'À faire', startDate: '2026-10-12', dueDate: '2026-11-01', order: 2 },
        { id: 'b', title: 'Commence dimanche', status: 'En cours', startDate: '2026-10-18', order: 1 },
        { id: 'c', title: 'Échéance seulement', status: 'À faire', startDate: '2026-10-19', dueDate: '2026-10-14' },
        { id: 'd', title: 'Déjà terminée', status: 'Terminé', startDate: '2026-10-15' },
    ], {
        dateField: 'startDate',
        from: '2026-10-12',
        to: '2026-10-18',
        completion: 'open',
        timeZone: 'Africa/Casablanca',
    }, new Date('2026-10-10T12:00:00.000Z'));

    assert.equal(result.total, 2);
    assert.deepEqual(result.items.map(task => task.id), ['a', 'b']);
});

test('workspace data search results are injected as an authoritative AI source', () => {
    const prompt = WorkspaceDataSearch.dataSearchPrompt({
        tool: 'workspace-data-search',
        resource: 'tasks',
        filters: {
            dateField: 'startDate',
            from: '2026-10-12',
            to: '2026-10-18',
            completion: 'open',
        },
        total: 1,
        returned: 1,
        truncated: false,
        items: [{ title: 'Préparer le bilan', startDate: '2026-10-13', priority: 'Important', status: 'À faire', list: 'Finance' }],
    });

    assert.match(prompt, /workspace-data-search/);
    assert.match(prompt, /date de début/);
    assert.match(prompt, /2026-10-12 au 2026-10-18/);
    assert.match(prompt, /Préparer le bilan/);
    assert.match(prompt, /requête serveur fraîche/);
});

test('AI workspace prompt contains the real tasks selected for today', () => {
    const taskContext = aiAssistant.__test.summarizeTaskBoardForAssistant({
        dateKey: '2026-10-09',
        timeZone: 'Africa/Casablanca',
        stats: { openTasks: 8, todayTasks: 2, overdueCount: 1 },
        tasks: [
            {
                id: 'task-1',
                title: 'Déposer le dossier CNSS',
                status: 'À faire',
                priority: 'Important',
                listLabel: 'Administration',
                recordTitle: 'Actirama',
                dueDate: '2026-10-09',
            },
            {
                id: 'task-2',
                title: 'Préparer les factures',
                status: 'À faire',
                priority: 'Normal',
                listLabel: 'Finance',
            },
        ],
        overdueTasks: [{ id: 'task-3', title: 'Relancer le client', priority: 'Urgent' }],
        completedToday: [{ id: 'task-4' }],
    });

    const prompt = aiAssistant.__test.buildSystemPrompt(
        { accountNumber: '6804', entities: [], taskContext },
        { page: 'home-agent' },
    );

    assert.match(prompt, /Tâches à faire aujourd'hui: 2/);
    assert.match(prompt, /Déposer le dossier CNSS/);
    assert.match(prompt, /Préparer les factures/);
    assert.match(prompt, /priorité: Important/);
    assert.match(prompt, /Tâches en retard: 1/);
    assert.match(prompt, /Relancer le client/);
    assert.match(prompt, /utilise d'abord et fidèlement la section ci-dessus/);
});

test('AI workspace prompt contains upcoming agenda events', () => {
    const agendaContext = aiAssistant.__test.summarizeAgendaForAssistant([
        {
            id: 'event-1',
            title: 'Paiement TVA T3',
            startAt: '2026-10-30T12:00:00.000Z',
            allDay: true,
            isImportant: true,
            showInUpcoming: true,
            type: 'echeance',
        },
        {
            id: 'event-2',
            title: 'Reunion equipe',
            startAt: '2026-10-12T09:30:00.000Z',
            showInUpcoming: true,
        },
    ], new Date('2026-10-09T12:00:00.000Z'));

    const prompt = aiAssistant.__test.buildSystemPrompt(
        { accountNumber: '6804', entities: [], agendaContext },
        { page: 'home-agent' },
    );

    assert.match(prompt, /Agenda réel du workspace/);
    assert.match(prompt, /Paiement TVA T3/);
    assert.match(prompt, /Reunion equipe/);
    assert.match(prompt, /N'annonce jamais une recherche ultérieure/);
    assert.match(prompt, /Continuité de la conversation/);
    assert.match(prompt, /cette date/);
    assert.match(prompt, /agenda-create/);
    assert.match(prompt, /Seuls le titre et la date de début sont obligatoires/);
});

test('AI keeps the most recent useful conversation context within safe bounds', () => {
    const history = Array.from({ length: 30 }, (_, index) => ({
        role: index % 2 ? 'assistant' : 'user',
        content: `message-${index}`,
    }));
    const normalized = aiAssistant.__test.normalizeConversationHistory(history, {
        maxMessages: 6,
        maxChars: 1000,
    });

    assert.equal(normalized.length, 6);
    assert.equal(normalized[0].content, 'message-24');
    assert.equal(normalized[5].content, 'message-29');
});

test('AI can create an agenda event inferred from the preceding conversation', async () => {
    const originalCreate = MobileAgendaService.createAgendaEvent;
    let receivedInput = null;
    MobileAgendaService.createAgendaEvent = async (_req, input) => {
        receivedInput = input;
        return {
            id: 'event-1',
            title: 'Maroc - Niger',
            startAt: '2026-11-15T19:00:00.000Z',
            allDay: false,
        };
    };

    let statusCode = 200;
    let payload = null;
    const res = {
        status(code) { statusCode = code; return this; },
        json(value) { payload = value; return value; },
    };

    try {
        await aiAssistant.execute({
            body: {
                action: {
                    type: 'agenda-create',
                    data: {
                        title: 'Maroc - Niger',
                        startAt: '2026-11-15T20:00:00+01:00',
                        allDay: false,
                    },
                },
            },
        }, res);
    } finally {
        MobileAgendaService.createAgendaEvent = originalCreate;
    }

    assert.equal(statusCode, 200);
    assert.equal(receivedInput.title, 'Maroc - Niger');
    assert.equal(receivedInput.startAt, '2026-11-15T20:00:00+01:00');
    assert.match(payload.response, /Événement ajouté à l'agenda/);
});

test('AI replaces a deferred agenda promise with the actual result', () => {
    const agendaContext = aiAssistant.__test.summarizeAgendaForAssistant([
        {
            id: 'event-1',
            title: "Fête de l'unité",
            startAt: '2026-10-31T12:00:00.000Z',
            allDay: true,
            isImportant: true,
        },
        {
            id: 'event-2',
            title: 'Sortie cinéma',
            startAt: '2026-10-16T20:00:00.000Z',
            isImportant: false,
        },
    ], new Date('2026-10-09T12:00:00.000Z'));

    const response = aiAssistant.__test.ensureImmediateAgendaResponse(
        'Quels sont les prochains événements importants ?',
        'Un instant, je vais chercher les événements récents.',
        agendaContext,
    );

    assert.match(response, /Fête de l'unité/);
    assert.doesNotMatch(response, /je vais chercher/i);
    assert.doesNotMatch(response, /Sortie cinéma/);
});

test('AI never interprets an unavailable task context as an empty day', () => {
    const text = aiAssistant.__test.taskContextPrompt({ loaded: false });
    assert.match(text, /n'a pas pu être chargé/);
    assert.match(text, /Ne conclus jamais qu'il n'y a aucune tâche/);
    assert.doesNotMatch(text, /Aucune tâche ouverte pour aujourd'hui/);
});
