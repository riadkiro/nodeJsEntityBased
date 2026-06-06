const IntegrationService = require('../src/integrations/services/IntegrationService');
const IntegrationProvider = require('../src/integrations/models/IntegrationProvider.model');
const IntegrationAction = require('../src/integrations/models/IntegrationAction.model');
const IntegrationConnectionSchema = require('../src/integrations/models/IntegrationConnection.model').schema;
const IntegrationLogSchema = require('../src/integrations/models/IntegrationLog.model').schema;
const {
    ensureOpenAIResponsesAction,
    extractOpenAIResponsesText
} = require('../src/integrations/openaiActions');

const DEFAULT_MODEL = process.env.OCR_OPENAI_MODEL ||
    process.env.RECORD_AI_OCR_MODEL ||
    process.env.RECORD_AI_MODEL ||
    process.env.AI_ASSISTANT_MODEL ||
    'gpt-5.4-mini';
const DEFAULT_DETAIL = ['low', 'high', 'original', 'auto'].includes(String(process.env.OCR_OPENAI_IMAGE_DETAIL || '').toLowerCase())
    ? String(process.env.OCR_OPENAI_IMAGE_DETAIL).toLowerCase()
    : 'high';
const DEFAULT_TIMEOUT_MS = boundedInt(process.env.OCR_OPENAI_TIMEOUT_MS, 120000, 30000, 300000);
const DEFAULT_OUTPUT_TOKENS = boundedInt(process.env.OCR_OPENAI_OUTPUT_TOKENS, 1400, 300, 4000);

function createOpenAIVisionOcrPageCallback(req, options = {}) {
    return async (pageInput = {}) => {
        return callOpenAIVisionOcr(req, {
            ...pageInput,
            model: options.model || DEFAULT_MODEL,
            detail: options.detail || DEFAULT_DETAIL,
            timeoutMs: options.timeoutMs || DEFAULT_TIMEOUT_MS,
            maxOutputTokens: options.maxOutputTokens || DEFAULT_OUTPUT_TOKENS
        });
    };
}

async function callOpenAIVisionOcr(req, options = {}) {
    if (!req?.tenantDbConnection) throw new Error('Tenant DB not connected');
    if (!options.imageBuffer || !Buffer.isBuffer(options.imageBuffer)) {
        throw new Error('Image OCR OpenAI manquante');
    }

    const { ConnectionModel, LogModel } = getTenantIntegrationModels(req);
    const action = await ensureOpenAIResponsesAction(IntegrationAction, options.model || DEFAULT_MODEL);
    const mimeType = normalizeImageMime(options.mimeType);
    const imageUrl = `data:${mimeType};base64,${options.imageBuffer.toString('base64')}`;
    const prompt = buildVisionOcrPrompt(options);
    const inputImage = {
        type: 'input_image',
        image_url: imageUrl
    };
    if (['low', 'high', 'original', 'auto'].includes(options.detail)) {
        inputImage.detail = options.detail;
    }

    const payload = {
        model: options.model || DEFAULT_MODEL,
        input: [{
            role: 'user',
            content: [
                { type: 'input_text', text: prompt },
                inputImage
            ]
        }],
        instructions: [
            'Tu es un moteur OCR visuel specialise dans les captures d interface, tableaux et documents.',
            'Tu dois extraire uniquement ce qui est visible dans l image. N invente aucune valeur.',
            'Reponds uniquement avec un JSON valide, sans markdown.'
        ].join('\n'),
        max_output_tokens: boundedInt(options.maxOutputTokens, DEFAULT_OUTPUT_TOKENS, 300, 4000),
        store: false,
        metadata: {
            feature: 'ocr-openai-vision',
            account_number: String(req.account_number || ''),
            page: String(options.pageNumber || options.page?.page || '')
        }
    };

    if (!/^gpt-5(?:[.-]|$)/.test(payload.model)) payload.temperature = 0;

    const result = await IntegrationService.executeAction({
        ProviderModel: IntegrationProvider,
        ActionModel: IntegrationAction,
        ConnectionModel,
        LogModel,
        workspaceId: req.account_number,
        providerKey: 'openai',
        actionId: action._id.toString(),
        input: payload,
        timeoutMs: boundedInt(options.timeoutMs, DEFAULT_TIMEOUT_MS, 30000, 300000)
    });

    if (!result.success) {
        throw new Error(result.error || result.errorMessage || 'OCR OpenAI Vision impossible');
    }

    const rawText = extractOpenAIResponsesText(result.data) ||
        extractOpenAIResponsesText(result.raw) ||
        '';
    const parsed = parseJsonObject(rawText);
    return normalizeVisionResult(parsed, rawText, {
        model: result.data?.model || result.raw?.model || payload.model,
        usage: result.raw?.usage || result.data?.usage || null
    });
}

function getTenantIntegrationModels(req) {
    const conn = req.tenantDbConnection;
    if (!conn) throw new Error('Tenant DB not connected');

    const ConnectionModel = conn.models.IntegrationConnection ||
        conn.model('IntegrationConnection', IntegrationConnectionSchema);
    const LogModel = conn.models.IntegrationLog ||
        conn.model('IntegrationLog', IntegrationLogSchema);

    return { ConnectionModel, LogModel };
}

function buildVisionOcrPrompt(options = {}) {
    const pageNumber = Number(options.pageNumber || options.page?.page || 1);
    const localText = String(options.localText || options.page?.text || '').trim();
    const structuredText = String(options.structuredText || options.page?.structuredText || '').trim();
    const query = String(options.query || '').trim();
    const reason = String(options.reason || '').trim();

    return [
        `Page/image a relire: ${pageNumber}.`,
        reason ? `Raison du fallback: ${reason}.` : '',
        query ? `Demande utilisateur: ${query}` : '',
        '',
        'Objectif:',
        '- Extraire le texte visible de l image.',
        '- Pour les tableaux ou fiches de type libelle/valeur, associer chaque libelle avec sa valeur a droite ou sur la meme ligne.',
        '- Conserver les unites exactes: GB, Go, CPU, IP, dates, oui/non, active/desactive.',
        '- Si une valeur est incertaine, laisse-la vide ou marque une confiance faible.',
        '',
        'Retourne uniquement ce JSON valide:',
        '{',
        '  "text": "texte lisible complet",',
        '  "structuredText": "une ligne visuelle par ligne; utilise | entre libelle et valeur",',
        '  "fields": [',
        '    { "label": "Mémoire", "value": "8 GB", "confidence": 0.95 }',
        '  ],',
        '  "confidence": 0.0,',
        '  "notes": ""',
        '}',
        localText ? `\nOCR local brut a corriger/completer:\n${localText.slice(0, 5000)}` : '',
        structuredText ? `\nLignes OCR locales structurees:\n${structuredText.slice(0, 5000)}` : ''
    ].filter(Boolean).join('\n');
}

function normalizeVisionResult(parsed, rawText, meta = {}) {
    const result = parsed && typeof parsed === 'object' ? parsed : {};
    const fields = Array.isArray(result.fields)
        ? result.fields
            .map(field => ({
                label: String(field?.label || '').trim(),
                value: String(field?.value || '').trim(),
                confidence: clampNumber(field?.confidence, null, 0, 1)
            }))
            .filter(field => field.label || field.value)
            .slice(0, 80)
        : [];

    return {
        text: String(result.text || (!parsed ? rawText : '') || '').trim(),
        structuredText: String(result.structuredText || result.structured_text || '').trim(),
        fields,
        confidence: clampNumber(result.confidence, null, 0, 1),
        notes: String(result.notes || '').trim(),
        rawText: String(rawText || '').trim(),
        model: meta.model || '',
        usage: meta.usage || null
    };
}

function parseJsonObject(value) {
    const text = String(value || '').trim();
    if (!text) return null;
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidates = [
        text,
        fenced?.[1],
        text.includes('{') && text.includes('}') ? text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1) : ''
    ].filter(Boolean);

    for (const candidate of candidates) {
        try {
            return JSON.parse(candidate);
        } catch (_) {
            try {
                return JSON.parse(candidate.replace(/,\s*([}\]])/g, '$1'));
            } catch (_) {}
        }
    }
    return null;
}

function normalizeImageMime(value) {
    const mime = String(value || '').toLowerCase();
    if (['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(mime)) return mime;
    return 'image/png';
}

function boundedInt(value, fallback, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, Math.round(number)));
}

function clampNumber(value, fallback, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, number));
}

module.exports = {
    createOpenAIVisionOcrPageCallback,
    callOpenAIVisionOcr
};
