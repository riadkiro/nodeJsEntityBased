const assert = require('node:assert/strict');
const test = require('node:test');

const aiAssistant = require('../controllers/ai-assistant.controller');
const MobileAgendaService = require('../services/mobile-agenda.service');

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
