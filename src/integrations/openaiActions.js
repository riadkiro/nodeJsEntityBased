const OPENAI_RESPONSES_ACTION_KEY = 'responses';
const OPENAI_WEB_SEARCH_SOURCES_INCLUDE = ['web_search_call.action.sources'];
const DEFAULT_RESPONSES_MODEL = 'gpt-5.5';

function buildOpenAIResponsesActionData(defaultModel = DEFAULT_RESPONSES_MODEL) {
    const model = String(defaultModel || DEFAULT_RESPONSES_MODEL).trim() || DEFAULT_RESPONSES_MODEL;

    return {
        providerKey: 'openai',
        actionKey: OPENAI_RESPONSES_ACTION_KEY,
        name: 'Responses',
        description: 'Generate text with the OpenAI Responses API, including optional hosted tools such as web search.',
        http: {
            method: 'POST',
            path: '/responses'
        },
        inputSchema: {
            type: 'object',
            properties: {
                model: { type: 'string', title: 'Model', default: model },
                input: {
                    title: 'Input',
                    oneOf: [
                        { type: 'string' },
                        { type: 'array' }
                    ]
                },
                instructions: { type: 'string', title: 'Instructions' },
                previous_response_id: { type: 'string', title: 'Previous response ID' },
                max_output_tokens: { type: 'number', title: 'Max output tokens', default: 2000 },
                temperature: { type: 'number', title: 'Temperature', minimum: 0, maximum: 2 },
                store: { type: 'boolean', title: 'Store response', default: false },
                metadata: { type: 'object', title: 'Metadata' },
                tools: { type: 'array', title: 'Tools' },
                tool_choice: {
                    title: 'Tool choice',
                    oneOf: [
                        { type: 'string' },
                        { type: 'object' }
                    ]
                },
                include: {
                    type: 'array',
                    title: 'Included response fields',
                    items: { type: 'string' }
                },
                reasoning: { type: 'object', title: 'Reasoning' },
                text: { type: 'object', title: 'Text options' },
                background: { type: 'boolean', title: 'Background mode' }
            },
            required: ['model', 'input']
        },
        requestTemplate: {
            query: {},
            headers: {},
            body: {
                model: '{{input.model}}',
                input: '{{input.input}}',
                instructions: '{{input.instructions}}',
                previous_response_id: '{{input.previous_response_id}}',
                max_output_tokens: '{{input.max_output_tokens}}',
                temperature: '{{input.temperature}}',
                store: '{{input.store}}',
                metadata: '{{input.metadata}}',
                tools: '{{input.tools}}',
                tool_choice: '{{input.tool_choice}}',
                include: '{{input.include}}',
                reasoning: '{{input.reasoning}}',
                text: '{{input.text}}',
                background: '{{input.background}}'
            }
        },
        responseMapping: {
            id: 'id',
            output_text: 'output_text',
            output: 'output',
            usage: 'usage',
            model: 'model',
            status: 'status'
        },
        testPayload: {
            model,
            input: 'Reponds simplement: bonjour',
            max_output_tokens: 50,
            store: false
        },
        isPublished: true
    };
}

function responsesActionSupportsWebSearch(action) {
    const body = action?.requestTemplate?.body || {};
    return action?.http?.method === 'POST' &&
        action?.http?.path === '/responses' &&
        Object.prototype.hasOwnProperty.call(body, 'input') &&
        Object.prototype.hasOwnProperty.call(body, 'tools') &&
        Object.prototype.hasOwnProperty.call(body, 'tool_choice') &&
        Object.prototype.hasOwnProperty.call(body, 'include');
}

async function ensureOpenAIResponsesAction(IntegrationActionModel, defaultModel = DEFAULT_RESPONSES_MODEL) {
    const existing = await IntegrationActionModel.findOne({
        providerKey: 'openai',
        actionKey: OPENAI_RESPONSES_ACTION_KEY
    });

    if (responsesActionSupportsWebSearch(existing)) {
        return existing;
    }

    return IntegrationActionModel.findOneAndUpdate(
        { providerKey: 'openai', actionKey: OPENAI_RESPONSES_ACTION_KEY },
        buildOpenAIResponsesActionData(defaultModel),
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
}

function normalizeWebSearchProbe(value) {
    return String(value || '')
        .replace(/<[^>]+>/g, ' ')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9@.+:/-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function extractPrimaryUserRequest(value) {
    const text = String(value || '').trim();
    const match = text.match(/(?:^|\n)Demande utilisateur:\s*\n?([\s\S]*?)(?:\n\n(?:Historique|Contexte|<contexte>|$)|$)/i);
    if (match?.[1]?.trim()) return match[1].trim();
    return text.slice(-5000);
}

function shouldUseOpenAIWebSearch(value) {
    const text = normalizeWebSearchProbe(extractPrimaryUserRequest(value));
    if (!text) return false;
    if (/\b(sans|pas de|aucune|ne pas|n utilise pas|no)\s+(recherche\s+)?(web|internet|en ligne|source externe|sources externes|recherche externe)\b/.test(text)) {
        return false;
    }

    const explicitWeb = /\b(web|internet|en ligne|online|live|actualise|actualiser|temps reel|recherche live|sources?|site officiel|url|liens?)\b/.test(text);
    const currentInfo = /\b(aujourd hui|maintenant|actuel|actuelle|actuels|actuelles|recent|recente|recents|dernier|derniere|derniers|latest|today|news|nouveaute|prix|tarif|disponibilite|horaire)\b/.test(text);
    const contactInfo = /\b(adresse|telephone|tel\b|email|contact|contacts|coordonnees?|contatp)\b/.test(text);
    const contactQuestion = contactInfo &&
        /\b(quel|quelle|quels|quelles|donne|donner|obtiens?|obtenir)\b/.test(text) &&
        !/\b(dossier|record|fiche|document|contexte|patient|client)\b/.test(text);
    const findVerb = /\b(trouve|trouver|cherche|chercher|recherche|identifier?|identifie|liste|lister|compare|comparer|selectionne|selectionner|localise|localiser|recommande|recommander|find|search|locate)\b/.test(text);
    const externalTarget = /\b(medecins?|docteurs?|praticiens?|specialistes?|[a-z]{4,}ologues?|cardiologues?|pneumologues?|dentistes?|dermatologues?|gynecologues?|pediatres?|orthopedistes?|ophtalmologues?|psychiatres?|psychologues?|kinesitherapeutes?|cliniques?|hopitaux?|hopital|cabinets?|pharmacies?|laboratoires?|fournisseurs?|distributeurs?|fabricants?|grossistes?|prestataires?|entreprises?|societes?|marques?|produits?|marchandises?|materiels?|equipements?|pieces?|consultants?|avocats?|notaires?|restaurants?|hotels?)\b/.test(text);
    const procurementTarget = /\b(cahier des charges|appel d offres?|pouvoir adjudicateur|bordereau|devis|marche public|marches publics|lot\b|lots\b)\b/.test(text);
    const locationSignal = /\b(pres de|proche de|autour de|near|around)\s+[a-z][a-z-]{2,}\b/.test(text);

    return explicitWeb ||
        currentInfo ||
        contactQuestion ||
        (findVerb && (externalTarget || procurementTarget || locationSignal || contactInfo)) ||
        (externalTarget && (procurementTarget || contactInfo));
}

function buildOpenAIWebSearchTool(options = {}) {
    const tool = {
        type: 'web_search',
        external_web_access: options.externalWebAccess !== false
    };

    if (['low', 'medium', 'high'].includes(options.searchContextSize)) {
        tool.search_context_size = options.searchContextSize;
    }

    if (['default', 'unlimited'].includes(options.returnTokenBudget)) {
        tool.return_token_budget = options.returnTokenBudget;
    }

    const allowedDomains = Array.isArray(options.allowedDomains)
        ? options.allowedDomains.filter(Boolean).slice(0, 100)
        : [];
    const blockedDomains = Array.isArray(options.blockedDomains)
        ? options.blockedDomains.filter(Boolean).slice(0, 100)
        : [];

    if (allowedDomains.length || blockedDomains.length) {
        tool.filters = {};
        if (allowedDomains.length) tool.filters.allowed_domains = allowedDomains;
        if (blockedDomains.length) tool.filters.blocked_domains = blockedDomains;
    }

    const location = buildApproximateUserLocation(options.userLocation);
    if (location) tool.user_location = location;

    return tool;
}

function buildApproximateUserLocation(location = {}) {
    const country = String(location.country || '').trim().toUpperCase();
    const city = String(location.city || '').trim();
    const region = String(location.region || '').trim();
    const timezone = String(location.timezone || '').trim();

    if (!country && !city && !region && !timezone) return null;

    const approximate = {};
    if (/^[A-Z]{2}$/.test(country)) approximate.country = country;
    if (city) approximate.city = city;
    if (region) approximate.region = region;
    if (timezone) approximate.timezone = timezone;

    if (!Object.keys(approximate).length) return null;
    return { type: 'approximate', ...approximate };
}

function appendWebSearchInstructions(instructions = '') {
    return [
        String(instructions || '').trim(),
        [
            'Recherche web live invisible:',
            '- Si la demande exige des informations externes, recentes, locales, des fournisseurs, des medecins, des adresses ou des contacts, utilise l outil web_search.',
            '- Appuie les resultats trouves sur des sources et donne les liens utiles quand ils influencent la reponse.',
            '- Pour un dossier medical, ne pose pas de diagnostic definitif: identifie les specialites ou praticiens pertinents et recommande une consultation professionnelle.',
            '- Pour un cahier des charges, extrais les besoins avant de chercher des fournisseurs proches ou pertinents selon l adresse et les contraintes.'
        ].join('\n')
    ].filter(Boolean).join('\n\n');
}

function extractOpenAIResponsesText(data) {
    if (typeof data?.output_text === 'string') return data.output_text;
    if (typeof data?.content === 'string') return data.content;

    const output = Array.isArray(data?.output) ? data.output : [];
    const parts = [];
    output.forEach(item => {
        const content = Array.isArray(item?.content) ? item.content : [];
        content.forEach(part => {
            if (typeof part?.text === 'string') parts.push(part.text);
            if (typeof part?.content === 'string') parts.push(part.content);
        });
    });

    return parts.join('\n').trim();
}

module.exports = {
    OPENAI_RESPONSES_ACTION_KEY,
    OPENAI_WEB_SEARCH_SOURCES_INCLUDE,
    DEFAULT_RESPONSES_MODEL,
    buildOpenAIResponsesActionData,
    ensureOpenAIResponsesAction,
    buildOpenAIWebSearchTool,
    appendWebSearchInstructions,
    extractOpenAIResponsesText,
    extractPrimaryUserRequest,
    shouldUseOpenAIWebSearch
};
