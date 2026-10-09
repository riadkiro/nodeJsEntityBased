const assert = require('node:assert/strict');
const test = require('node:test');

const aiAssistant = require('../controllers/ai-assistant.controller');

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

test('AI never interprets an unavailable task context as an empty day', () => {
    const text = aiAssistant.__test.taskContextPrompt({ loaded: false });
    assert.match(text, /n'a pas pu être chargé/);
    assert.match(text, /Ne conclus jamais qu'il n'y a aucune tâche/);
    assert.doesNotMatch(text, /Aucune tâche ouverte pour aujourd'hui/);
});
