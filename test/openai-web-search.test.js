const assert = require('node:assert/strict');
const test = require('node:test');

const {
    appendOpenAIWebSearchSources,
    appendWebSearchInstructions,
    extractOpenAIWebSearchSources,
    shouldUseOpenAIWebSearch,
} = require('../src/integrations/openaiActions');

test('live web search detects sports schedules phrased naturally in French', () => {
    assert.equal(shouldUseOpenAIWebSearch('Quand est-ce que le Maroc joue ?'), true);
    assert.equal(shouldUseOpenAIWebSearch('Quel est le prochain match de l’équipe nationale ?'), true);
    assert.equal(shouldUseOpenAIWebSearch('À quelle heure commence la finale de la CAN ?'), true);
    assert.equal(shouldUseOpenAIWebSearch('Quel est le score du match ?'), true);
});

test('live web search respects opt-out and avoids unrelated internal text', () => {
    assert.equal(shouldUseOpenAIWebSearch('Ne fais pas de recherche web : quand est-ce que le Maroc joue ?'), false);
    assert.equal(shouldUseOpenAIWebSearch('Ajoute le mot match à la fiche client'), false);
});

test('live web search detects other time-sensitive domains', () => {
    assert.equal(shouldUseOpenAIWebSearch('Quelle météo est prévue demain à Casablanca ?'), true);
    assert.equal(shouldUseOpenAIWebSearch('Quel est le taux de change euro dirham ?'), true);
    assert.equal(shouldUseOpenAIWebSearch('Quand part le prochain train pour Rabat ?'), true);
});

test('web search responses expose unique clickable sources', () => {
    const payload = {
        output: [
            {
                type: 'web_search_call',
                action: {
                    sources: [
                        { title: 'Fédération Royale Marocaine', url: 'https://frmf.ma/calendrier' },
                        { title: 'Doublon', url: 'https://frmf.ma/calendrier' },
                    ],
                },
            },
            {
                type: 'message',
                content: [{
                    type: 'output_text',
                    annotations: [{
                        type: 'url_citation',
                        title: 'FIFA',
                        url: 'https://www.fifa.com/matches',
                    }],
                }],
            },
        ],
    };

    const sources = extractOpenAIWebSearchSources(payload);
    assert.equal(sources.length, 2);
    const response = appendOpenAIWebSearchSources('Le prochain match est vendredi.', sources);
    assert.match(response, /Sources consultées/);
    assert.match(response, /\[Fédération Royale Marocaine\]\(https:\/\/frmf\.ma\/calendrier\)/);
    assert.match(response, /\[FIFA\]\(https:\/\/www\.fifa\.com\/matches\)/);
    assert.match(appendWebSearchInstructions('Instruction'), /Pour le sport/);
    assert.match(appendWebSearchInstructions('Instruction'), /Ne promets jamais/);
});
