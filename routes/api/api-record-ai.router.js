const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const mongoose = require('mongoose');
const { tenantCollection } = require('../../middleware/tenant');
const { canAccessRecord, canEditRecordModule } = require('../../middleware/shared-records-helper');
const { ensureEventsEntity } = require('../../services/events-entity.service');
const OcrService = require('../../services/ocr.service');
const IntegrationService = require('../../src/integrations/services/IntegrationService');
const IntegrationProvider = require('../../src/integrations/models/IntegrationProvider.model');
const IntegrationAction = require('../../src/integrations/models/IntegrationAction.model');
const IntegrationConnectionSchema = require('../../src/integrations/models/IntegrationConnection.model').schema;
const IntegrationLogSchema = require('../../src/integrations/models/IntegrationLog.model').schema;
const GlobalTaskList = require('../../models/task-list.model');
const GlobalRecordTask = require('../../models/record-task.model');

const router = express.Router();

const RECORD_AI_MODEL = process.env.RECORD_AI_MODEL || process.env.AI_ASSISTANT_MODEL || 'gpt-5.5';
const MAX_STORED_MESSAGES = 80;
const MAX_STORED_MESSAGE_CHARS = 24000;
const MAX_CONTEXT_CHARS = Number(process.env.RECORD_AI_MAX_CONTEXT_CHARS || 32000);
const MAX_NOTES_CHARS = 9000;
const MAX_CHAT_CHARS = 9000;
const MAX_FILE_CHARS = 16000;
const MAX_UPLOAD_CHARS = 12000;
const RECORD_AI_TIMEOUT_MS = boundedInt(process.env.RECORD_AI_TIMEOUT_MS, 120000, 30000, 300000);
const RECORD_AI_OUTPUT_TOKENS = boundedInt(process.env.RECORD_AI_OUTPUT_TOKENS, 3500, 500, 12000);
const RECORD_AI_AGENT_OUTPUT_TOKENS = boundedInt(process.env.RECORD_AI_AGENT_OUTPUT_TOKENS, 6500, 1500, 12000);
const RECORD_AI_OCR_MAX_PAGES = boundedInt(process.env.RECORD_AI_OCR_MAX_PAGES || process.env.OCR_MAX_PAGES, 20, 1, 100);
const RECORD_AI_RAG_ENABLED = process.env.RECORD_AI_RAG_ENABLED !== 'false';
const RECORD_AI_RAG_MAX_PAGES = boundedInt(process.env.RECORD_AI_RAG_MAX_PAGES, 200, 1, 250);
const RECORD_AI_RAG_MAX_DOCUMENTS = boundedInt(process.env.RECORD_AI_RAG_MAX_DOCUMENTS, 5, 1, 12);
const RECORD_AI_RAG_MAX_CHUNKS = boundedInt(process.env.RECORD_AI_RAG_MAX_CHUNKS, 9, 1, 24);
const RECORD_AI_RAG_CONTEXT_CHARS = boundedInt(process.env.RECORD_AI_RAG_CONTEXT_CHARS, 18000, 4000, 60000);
const RECORD_AI_RAG_CHUNK_CHARS = boundedInt(process.env.RECORD_AI_RAG_CHUNK_CHARS, 1800, 600, 5000);
const RECORD_AI_RAG_CHUNK_OVERLAP = boundedInt(process.env.RECORD_AI_RAG_CHUNK_OVERLAP, 220, 0, 1200);
const RECORD_AI_VECTOR_ENABLED = process.env.RECORD_AI_VECTOR_ENABLED !== 'false';
const RECORD_AI_EMBEDDING_MODEL = process.env.RECORD_AI_EMBEDDING_MODEL || 'text-embedding-3-small';
const RECORD_AI_EMBEDDING_DIMENSIONS = boundedInt(process.env.RECORD_AI_EMBEDDING_DIMENSIONS, 0, 0, 3072);
const RECORD_AI_EMBEDDING_BATCH_SIZE = boundedInt(process.env.RECORD_AI_EMBEDDING_BATCH_SIZE, 64, 1, 128);
const RECORD_AI_EMBEDDING_TIMEOUT_MS = boundedInt(process.env.RECORD_AI_EMBEDDING_TIMEOUT_MS, 120000, 30000, 300000);
const RECORD_AI_ENGINE_SETTINGS_VIEW_ID = 'record-ai-engines';
const RECORD_AI_RESPONSE_ENGINE = ['openai', 'local'].includes(String(process.env.RECORD_AI_RESPONSE_ENGINE || '').toLowerCase())
    ? String(process.env.RECORD_AI_RESPONSE_ENGINE).toLowerCase()
    : 'openai';
const RECORD_AI_EMBEDDING_ENGINE = ['openai', 'local', 'lexical'].includes(String(process.env.RECORD_AI_EMBEDDING_ENGINE || '').toLowerCase())
    ? String(process.env.RECORD_AI_EMBEDDING_ENGINE).toLowerCase()
    : 'openai';
const RECORD_AI_LOCAL_BASE_URL = String(process.env.RECORD_AI_LOCAL_BASE_URL || '').replace(/\/$/, '');
const RECORD_AI_LOCAL_RESPONSE_URL = process.env.RECORD_AI_LOCAL_RESPONSE_URL ||
    (RECORD_AI_LOCAL_BASE_URL ? `${RECORD_AI_LOCAL_BASE_URL}/api/chat` : '');
const RECORD_AI_LOCAL_RESPONSE_FORMAT = ['ollama', 'openai'].includes(String(process.env.RECORD_AI_LOCAL_RESPONSE_FORMAT || '').toLowerCase())
    ? String(process.env.RECORD_AI_LOCAL_RESPONSE_FORMAT).toLowerCase()
    : 'ollama';
const RECORD_AI_LOCAL_RESPONSE_MODEL = process.env.RECORD_AI_LOCAL_RESPONSE_MODEL || 'llama3.1';
const RECORD_AI_LOCAL_RESPONSE_TIMEOUT_MS = boundedInt(process.env.RECORD_AI_LOCAL_RESPONSE_TIMEOUT_MS, 180000, 30000, 300000);
const RECORD_AI_LOCAL_EMBEDDING_URL = process.env.RECORD_AI_LOCAL_EMBEDDING_URL ||
    (RECORD_AI_LOCAL_BASE_URL ? `${RECORD_AI_LOCAL_BASE_URL}/api/embed` : '');
const RECORD_AI_LOCAL_EMBEDDING_FORMAT = ['ollama', 'openai'].includes(String(process.env.RECORD_AI_LOCAL_EMBEDDING_FORMAT || '').toLowerCase())
    ? String(process.env.RECORD_AI_LOCAL_EMBEDDING_FORMAT).toLowerCase()
    : 'ollama';
const RECORD_AI_LOCAL_EMBEDDING_MODEL = process.env.RECORD_AI_LOCAL_EMBEDDING_MODEL || 'nomic-embed-text';
const RECORD_AI_DEBUG_ENABLED = process.env.RECORD_AI_DEBUG_ENABLED !== 'false';
const RECORD_AI_DEBUG_TEXT_CHARS = boundedInt(process.env.RECORD_AI_DEBUG_TEXT_CHARS, 120000, 10000, 500000);
const OCR_CACHE_DIR = path.join(__dirname, '../../private_uploads/ocr-cache/record-ai');

const OCR_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tif', '.tiff', '.gif']);
const OCR_MIME_PREFIXES = ['image/'];
const OCR_MIME_TYPES = new Set(['application/pdf']);
const SEARCH_STOPWORDS = new Set([
    'avec', 'afin', 'ainsi', 'alors', 'apres', 'avant', 'avoir', 'cela', 'cette', 'dans',
    'des', 'donc', 'dont', 'elle', 'elles', 'entre', 'etre', 'faire', 'faut', 'leur',
    'leurs', 'mais', 'mes', 'mon', 'nous', 'par', 'pas', 'plus', 'pour', 'que', 'quel',
    'quelle', 'quelles', 'quels', 'qui', 'quoi', 'sans', 'ses', 'sur', 'tes', 'ton',
    'tous', 'tout', 'une', 'vos', 'vous', 'the', 'and', 'for', 'with', 'from', 'this',
    'that', 'document', 'documents', 'fichier', 'question', 'reponse', 'resume', 'resumer',
    'moi', 'page', 'pages', 'svp', 'stp'
]);

function cleanId(value) {
    if (!value || value === 'null' || value === 'undefined') return '';
    return String(value);
}

function isObjectId(value) {
    return mongoose.Types.ObjectId.isValid(cleanId(value));
}

function hashText(value) {
    return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function boundedInt(value, fallback, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, Math.round(number)));
}

function isRecordAiDebugAdmin(req) {
    if (req.user?.role === 'superadmin') return true;
    if (['owner', 'admin'].includes(req.workspaceRole || '')) return true;
    return typeof req.can === 'function' && req.can('ai.manage');
}

function clipDebugText(value, maxChars = RECORD_AI_DEBUG_TEXT_CHARS) {
    const text = String(value || '');
    if (text.length <= maxChars) return { text, truncated: false, originalChars: text.length };
    return {
        text: text.slice(0, Math.max(0, maxChars - 90)) + '\n\n[Debug tronqué pour limiter la taille du log]',
        truncated: true,
        originalChars: text.length
    };
}

function stripDebugFromConversation(conversation) {
    if (!conversation) return conversation;
    const plain = typeof conversation.toObject === 'function' ? conversation.toObject() : { ...conversation };
    if (Array.isArray(plain.messages)) {
        plain.messages = plain.messages.map(message => {
            const { debugPayload, ...safeMessage } = message || {};
            return safeMessage;
        });
    }
    return plain;
}

function stripHtml(value) {
    return String(value || '')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\r/g, '')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function limitText(value, maxChars) {
    const text = String(value || '').trim();
    if (text.length <= maxChars) return { text, truncated: false };
    return {
        text: text.slice(0, Math.max(0, maxChars - 80)).trim() + '\n\n[Contexte tronqué pour limiter les tokens]',
        truncated: true
    };
}

function normalizeSearchText(value) {
    return stripHtml(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function countWords(text) {
    const words = String(text || '').trim().match(/\S+/g);
    return words ? words.length : 0;
}

function tokenizeSearch(value) {
    const tokens = normalizeSearchText(value).match(/[a-z0-9]+/g) || [];
    const unique = [];
    const seen = new Set();

    tokens.forEach(token => {
        if (seen.has(token)) return;
        if (SEARCH_STOPWORDS.has(token)) return;
        if (token.length < 3 && !/\d/.test(token) && !/^[ivxlcdm]+$/.test(token)) return;
        seen.add(token);
        unique.push(token);
    });

    return unique.slice(0, 60);
}

function extractSearchPhrases(value) {
    const text = String(value || '');
    const phrases = [];
    const quoted = text.match(/["“”'‘’]([^"“”'‘’]{4,120})["“”'‘’]/g) || [];
    quoted.forEach(item => phrases.push(item.replace(/^["“”'‘’]|["“”'‘’]$/g, '')));

    const anchored = text.match(/\b(?:chapitre|section|article|lot|lots?|annexe|titre)\s+[a-zivxlcdm0-9][a-zivxlcdm0-9.\-_]*/gi) || [];
    anchored.forEach(item => {
        phrases.push(item);
        phrases.push(item.replace(/\b(?:chapitre|section|article|lot|lots?|annexe|titre)\s+/i, ''));
    });

    return [...new Set(phrases.map(normalizeSearchText).filter(item => item.length >= 3))].slice(0, 12);
}

function extractRequestedPages(value) {
    const text = String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[–—]/g, '-')
        .replace(/\bp\.\s*/g, 'page ');
    const pages = new Set();
    const pageRefRegex = /\b(?:pages?|p)\s+(?:n[°o]\s*)?([0-9]{1,4}(?:\s*(?:,|;|et|and|&|-|a|à|to)\s*[0-9]{1,4}){0,12})/gi;
    let match;

    while ((match = pageRefRegex.exec(text)) !== null) {
        const sequence = match[1] || '';
        const numberRegex = /([0-9]{1,4})(?:\s*(?:-|a|à|to)\s*([0-9]{1,4}))?/gi;
        let numberMatch;

        while ((numberMatch = numberRegex.exec(sequence)) !== null) {
            const start = Number(numberMatch[1]);
            const end = Number(numberMatch[2] || numberMatch[1]);
            if (!Number.isFinite(start) || !Number.isFinite(end)) continue;

            const low = Math.max(1, Math.min(start, end));
            const high = Math.min(1000, Math.max(start, end));
            for (let page = low; page <= high && pages.size < 30; page += 1) {
                pages.add(page);
            }
        }
    }

    return [...pages].sort((a, b) => a - b);
}

function pageLabel(chunk = {}) {
    const start = Number(chunk.pageStart || chunk.page || 1);
    const end = Number(chunk.pageEnd || start);
    return end > start ? `pages ${start}-${end}` : `page ${start}`;
}

function normalizeEngineSettings(input = {}) {
    const responseEngine = ['openai', 'local'].includes(String(input.responseEngine || '').toLowerCase())
        ? String(input.responseEngine).toLowerCase()
        : RECORD_AI_RESPONSE_ENGINE;
    const embeddingEngine = ['openai', 'local', 'lexical'].includes(String(input.embeddingEngine || '').toLowerCase())
        ? String(input.embeddingEngine).toLowerCase()
        : RECORD_AI_EMBEDDING_ENGINE;

    return {
        responseEngine,
        responseModel: String(input.responseModel || RECORD_AI_MODEL).trim().slice(0, 120) || RECORD_AI_MODEL,
        localResponseModel: String(input.localResponseModel || RECORD_AI_LOCAL_RESPONSE_MODEL).trim().slice(0, 120) || RECORD_AI_LOCAL_RESPONSE_MODEL,
        embeddingEngine,
        embeddingModel: String(input.embeddingModel || RECORD_AI_EMBEDDING_MODEL).trim().slice(0, 120) || RECORD_AI_EMBEDDING_MODEL,
        localEmbeddingModel: String(input.localEmbeddingModel || RECORD_AI_LOCAL_EMBEDDING_MODEL).trim().slice(0, 120) || RECORD_AI_LOCAL_EMBEDDING_MODEL
    };
}

function engineOptions() {
    return {
        responseEngines: [
            { key: 'openai', label: 'ChatGPT / OpenAI', available: true },
            { key: 'local', label: 'Local', available: Boolean(RECORD_AI_LOCAL_RESPONSE_URL) }
        ],
        embeddingEngines: [
            { key: 'openai', label: 'OpenAI vectoriel', available: true },
            { key: 'local', label: 'Local vectoriel', available: Boolean(RECORD_AI_LOCAL_EMBEDDING_URL) },
            { key: 'lexical', label: 'Local lexical', available: true }
        ],
        local: {
            responseConfigured: Boolean(RECORD_AI_LOCAL_RESPONSE_URL),
            embeddingConfigured: Boolean(RECORD_AI_LOCAL_EMBEDDING_URL),
            responseFormat: RECORD_AI_LOCAL_RESPONSE_FORMAT,
            embeddingFormat: RECORD_AI_LOCAL_EMBEDDING_FORMAT
        }
    };
}

function resolveResponseRuntime(settings = {}) {
    const normalized = normalizeEngineSettings(settings);
    const wantsLocal = normalized.responseEngine === 'local';
    const localAvailable = Boolean(RECORD_AI_LOCAL_RESPONSE_URL);

    if (wantsLocal && localAvailable) {
        return {
            engine: 'local',
            provider: 'local',
            model: normalized.localResponseModel,
            configured: true,
            fallback: false
        };
    }

    return {
        engine: 'openai',
        provider: 'openai',
        model: normalized.responseModel || RECORD_AI_MODEL,
        configured: true,
        fallback: wantsLocal && !localAvailable,
        warning: wantsLocal && !localAvailable ? 'Moteur réponse local non configuré, fallback OpenAI.' : ''
    };
}

function resolveEmbeddingRuntime(settings = {}) {
    const normalized = normalizeEngineSettings(settings);
    const wantsLocal = normalized.embeddingEngine === 'local';
    const lexical = normalized.embeddingEngine === 'lexical';
    const localAvailable = Boolean(RECORD_AI_LOCAL_EMBEDDING_URL);
    const enabled = RECORD_AI_VECTOR_ENABLED && !lexical && (!wantsLocal || localAvailable);

    return {
        enabled,
        engine: enabled ? normalized.embeddingEngine : 'lexical',
        requestedEngine: normalized.embeddingEngine,
        provider: wantsLocal ? 'local' : (lexical ? 'lexical' : 'openai'),
        model: wantsLocal ? normalized.localEmbeddingModel : normalized.embeddingModel,
        dimensions: wantsLocal ? 0 : RECORD_AI_EMBEDDING_DIMENSIONS,
        configured: !wantsLocal || localAvailable,
        fallback: (wantsLocal && !localAvailable) || lexical || !RECORD_AI_VECTOR_ENABLED,
        warning: wantsLocal && !localAvailable ? 'Moteur embedding local non configuré, fallback lexical.' : ''
    };
}

function resolveEngineRuntime(settings = {}) {
    const normalized = normalizeEngineSettings(settings);
    return {
        response: resolveResponseRuntime(normalized),
        embedding: resolveEmbeddingRuntime(normalized)
    };
}

function runtimeModelLabel(runtime = {}) {
    return [runtime.engine || runtime.provider || 'openai', runtime.model || '']
        .filter(Boolean)
        .join(':');
}

function embeddingConfigKey(settings = {}) {
    const runtime = resolveEmbeddingRuntime(settings);
    return [
        runtime.engine,
        runtime.model,
        runtime.dimensions > 0 ? runtime.dimensions : 'default'
    ].join(':');
}

function embeddingInputForChunk(chunk = {}) {
    return [
        chunk.sourceName || 'Document',
        pageLabel(chunk),
        String(chunk.text || '').trim()
    ].filter(Boolean).join('\n');
}

async function getRecordAiEngineSettings(req) {
    const defaults = normalizeEngineSettings({});
    try {
        const AccountPreferences = await tenantCollection(req, 'AccountPreferences');
        if (!AccountPreferences) return defaults;

        const prefs = await AccountPreferences.findOne({
            accountId: String(req.account_number || ''),
            viewId: RECORD_AI_ENGINE_SETTINGS_VIEW_ID
        }).lean();

        return normalizeEngineSettings({
            ...defaults,
            ...(prefs?.preferences || {})
        });
    } catch (error) {
        console.warn('[RecordAI] engine settings load failed:', error.message);
        return defaults;
    }
}

async function saveRecordAiEngineSettings(req, input = {}) {
    if (!isRecordAiDebugAdmin(req)) {
        const error = new Error('Réglages IA réservés aux administrateurs');
        error.statusCode = 403;
        throw error;
    }

    const current = await getRecordAiEngineSettings(req);
    const next = normalizeEngineSettings({ ...current, ...input });
    const AccountPreferences = await tenantCollection(req, 'AccountPreferences');
    if (!AccountPreferences) throw new Error('Préférences compte indisponibles');

    await AccountPreferences.findOneAndUpdate(
        {
            accountId: String(req.account_number || ''),
            viewId: RECORD_AI_ENGINE_SETTINGS_VIEW_ID
        },
        {
            $set: {
                accountId: String(req.account_number || ''),
                viewId: RECORD_AI_ENGINE_SETTINGS_VIEW_ID,
                preferences: next,
                updatedAt: new Date()
            }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return next;
}

function cosineSimilarity(a = [], b = []) {
    if (!Array.isArray(a) || !Array.isArray(b) || !a.length || a.length !== b.length) return null;
    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let index = 0; index < a.length; index += 1) {
        const av = Number(a[index]) || 0;
        const bv = Number(b[index]) || 0;
        dot += av * bv;
        normA += av * av;
        normB += bv * bv;
    }

    if (!normA || !normB) return null;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function formatValue(value) {
    if (value === null || value === undefined || value === '') return '';
    if (value instanceof Date) return value.toLocaleDateString('fr-FR');
    if (Array.isArray(value)) return value.map(formatValue).filter(Boolean).join(', ');
    if (typeof value === 'object') {
        if (value.title) return String(value.title);
        if (value.label) return String(value.label);
        if (value.name) return String(value.name);
        try {
            return JSON.stringify(value);
        } catch (_) {
            return String(value);
        }
    }
    return stripHtml(String(value));
}

function isOcrSupported(file = {}) {
    const mime = String(file.mimeType || file.mimetype || '').toLowerCase();
    const name = String(file.originalName || file.filename || '').toLowerCase();
    if (OCR_MIME_TYPES.has(mime)) return true;
    if (OCR_MIME_PREFIXES.some(prefix => mime.startsWith(prefix))) return true;
    return OCR_EXTENSIONS.has(path.extname(name));
}

function getFilePreviewType(file = {}) {
    const mime = String(file.mimeType || file.mimetype || '').toLowerCase();
    const name = String(file.name || file.originalName || file.filename || '').toLowerCase();
    const ext = path.extname(name);

    if (mime === 'application/pdf' || ext === '.pdf') return 'pdf';
    if (mime.startsWith('image/') && mime !== 'image/svg+xml') return 'image';
    if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'].includes(ext)) return 'image';
    return '';
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

function extractResponsesText(data) {
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

function normalizeSelection(input = {}) {
    const fields = Array.isArray(input.fields) ? input.fields.map(cleanId).filter(Boolean) : [];
    const notes = Array.isArray(input.notes) ? input.notes.map(cleanId).filter(isObjectId) : [];
    const chats = Array.isArray(input.chats) ? input.chats.map(cleanId).filter(isObjectId) : [];

    const files = Array.isArray(input.files)
        ? input.files
            .map(file => ({
                source: ['drive', 'record'].includes(file?.source) ? file.source : 'record',
                id: cleanId(file?.id),
                name: String(file?.name || '').slice(0, 240)
            }))
            .filter(file => isObjectId(file.id))
        : [];

    const uploads = Array.isArray(input.uploads)
        ? input.uploads
            .map(upload => ({
                id: cleanId(upload?.id) || `upload:${hashText(upload?.name || upload?.text).slice(0, 12)}`,
                name: String(upload?.name || 'Document uploadé').slice(0, 240),
                text: String(upload?.text || ''),
                charCount: Number(upload?.charCount || String(upload?.text || '').length || 0)
            }))
            .filter(upload => upload.id && (upload.text.trim() || upload.charCount > 0))
        : [];

    return {
        fields: [...new Set(fields)],
        notes: [...new Set(notes)],
        chats: [...new Set(chats)],
        files: uniqueFiles(files),
        uploads
    };
}

function debugSelection(selection = {}) {
    return {
        ...persistableSelection(selection),
        uploads: (selection.uploads || []).map(upload => {
            const clipped = clipDebugText(upload.text || '');
            return {
                id: upload.id,
                name: upload.name,
                charCount: upload.charCount || String(upload.text || '').length || 0,
                text: clipped.text,
                textTruncated: clipped.truncated,
                originalChars: clipped.originalChars
            };
        })
    };
}

function persistableSelection(selection = {}) {
    return {
        fields: selection.fields || [],
        notes: selection.notes || [],
        chats: selection.chats || [],
        files: selection.files || [],
        uploads: (selection.uploads || []).map(upload => ({
            id: upload.id,
            name: upload.name,
            charCount: upload.charCount || 0
        }))
    };
}

function selectionItemCount(selection = {}) {
    return (selection.fields?.length || 0) +
        (selection.notes?.length || 0) +
        (selection.chats?.length || 0) +
        (selection.files?.length || 0) +
        (selection.uploads?.length || 0);
}

function documentSelectionItemCount(selection = {}) {
    return (selection.files?.length || 0) + (selection.uploads?.length || 0);
}

function documentOnlySelection(selection = {}) {
    const normalized = normalizeSelection(selection || {});
    return {
        fields: [],
        notes: [],
        chats: [],
        files: normalized.files || [],
        uploads: normalized.uploads || []
    };
}

function latestConversationDocumentSelection(conversation = {}) {
    const messages = Array.isArray(conversation.messages) ? conversation.messages : [];

    for (let index = messages.length - 1; index >= 0; index -= 1) {
        const candidate = documentOnlySelection(messages[index]?.contextSelections || {});
        if (documentSelectionItemCount(candidate) > 0) return candidate;
    }

    const conversationCandidate = documentOnlySelection(conversation.contextSelections || {});
    return documentSelectionItemCount(conversationCandidate) > 0
        ? conversationCandidate
        : normalizeSelection({});
}

function emptySelectedContext() {
    return {
        text: '',
        fingerprint: '',
        stats: {
            sections: 0,
            chars: 0,
            truncated: false,
            sources: [],
            errors: [],
            estimatedTokens: 0
        },
        debug: {
            ocr: [],
            uploads: [],
            limits: null,
            rag: null
        }
    };
}

function uniqueFiles(files) {
    const seen = new Set();
    return files.filter(file => {
        const key = `${file.source}:${file.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

async function loadRecordBundle(req, recordId) {
    if (!isObjectId(recordId)) {
        const error = new Error('Identifiant de fiche invalide');
        error.statusCode = 400;
        throw error;
    }

    await tenantCollection(req, 'FieldTemplate');
    await tenantCollection(req, 'Classification');

    const Record = await tenantCollection(req, 'Record');
    const Entity = await tenantCollection(req, 'Entity');
    const record = await Record.findById(recordId).lean();
    if (!record) {
        const error = new Error('Fiche introuvable');
        error.statusCode = 404;
        throw error;
    }

    const entity = await Entity.findById(record.entityId)
        .populate('customFields')
        .populate('classifications')
        .populate('statusClassification')
        .populate('relations.targetEntity')
        .lean();

    const hasAccess = await canAccessRecord(req, record._id, record.entityId?.toString(), 'ai');
    if (!hasAccess) {
        const error = new Error("Vous n'avez pas accès à l'app IA de cette fiche");
        error.statusCode = 403;
        throw error;
    }

    return { Record, Entity, record, entity };
}

async function buildRecordFields(req, record, entity) {
    const Record = await tenantCollection(req, 'Record');
    const fields = [];
    const values = {};

    (record.customFields || []).forEach(item => {
        const key = cleanId(item.field_id?._id || item.field_id);
        if (key) values[key] = item.value;
    });

    [
        ['title', 'Titre', record.title],
        ['computedTitle', 'Titre calculé', record.computedTitle],
        ['description', 'Description', record.description],
        ['content', 'Contenu', record.content],
        ['status', 'Statut', record.status],
        ['date', 'Date', record.date],
        ['end_date', 'Date de fin', record.end_date]
    ].forEach(([id, label, value]) => {
        const formatted = formatValue(value);
        if (formatted) fields.push({ id, label, value: formatted, source: 'standard', charCount: formatted.length });
    });

    for (const template of (entity?.customFields || [])) {
        const id = cleanId(template._id);
        const value = values[id];
        let formatted = formatValue(value);

        if ((template.type === 'select' || template.type === 'multiselect') && value) {
            const options = template.type_config?.options || [];
            if (Array.isArray(options) && options.length && typeof options[0] === 'object') {
                const vals = Array.isArray(value) ? value : [value];
                formatted = vals.map(v => {
                    const found = options.find(opt => opt.value === v || opt.label === v);
                    return found ? found.label : v;
                }).filter(Boolean).join(', ');
            }
        }

        if (formatted) {
            fields.push({
                id,
                label: template.label || template.name || 'Champ',
                value: formatted,
                source: 'field',
                charCount: formatted.length
            });
        }
    }

    const classificationLabels = (record.classificationValues || [])
        .map(item => item.label)
        .filter(Boolean);
    if (classificationLabels.length) {
        const value = classificationLabels.join(', ');
        fields.push({
            id: 'classifications',
            label: 'Classifications',
            value,
            source: 'classification',
            charCount: value.length
        });
    }

    for (const relation of (entity?.relations || [])) {
        const relEntry = (record.relations || []).find(item => item.relationKey === relation.key);
        if (!relEntry?.value) continue;

        const ids = (Array.isArray(relEntry.value) ? relEntry.value : [relEntry.value])
            .filter(isObjectId);
        if (!ids.length) continue;

        const related = await Record.find({ _id: { $in: ids } }).select('title computedTitle').lean();
        const value = related.map(item => item.computedTitle || item.title || 'Sans titre').join(', ');
        if (value) {
            fields.push({
                id: `relation:${relation.key}`,
                label: relation.label || relation.targetEntity?.name || 'Relation',
                value,
                source: 'relation',
                charCount: value.length
            });
        }
    }

    return fields;
}

function fileRagStatusPayload(document, canonicalDocument = null, fallback = {}) {
    if (!document) return null;

    const canonicalId = cleanId(canonicalDocument?._id || document._id);
    const documentId = cleanId(document._id);
    const isCanonical = !fallback.sourceCache && canonicalId && documentId === canonicalId;

    return {
        indexed: true,
        canonical: isCanonical,
        status: isCanonical ? 'canonical' : 'indexed',
        label: isCanonical ? 'Canonical' : 'Indexed',
        documentId,
        canonicalDocumentId: canonicalId,
        canonicalName: canonicalDocument?.name || document.name || fallback.name || '',
        chunkCount: document.chunkCount || canonicalDocument?.chunkCount || 0,
        embeddingStatus: document.embeddingStatus || canonicalDocument?.embeddingStatus || 'none',
        embeddedChunkCount: document.embeddedChunkCount || canonicalDocument?.embeddedChunkCount || 0,
        contentHash: document.contentHash || fallback.contentHash || '',
        ragConfigHash: document.ragConfigHash || fallback.ragConfigHash || '',
        sourceCache: Boolean(fallback.sourceCache)
    };
}

async function enrichFilesWithRagStatus(req, files = []) {
    if (!files.length || !RECORD_AI_RAG_ENABLED) return files;

    let RecordAiDocument;
    try {
        ({ RecordAiDocument } = await getRagModels(req));
    } catch (_) {
        return files;
    }

    const sourceFilters = files
        .filter(file => file.source && file.id)
        .map(file => ({ source: file.source, sourceId: cleanId(file.id) }));
    const directDocs = sourceFilters.length
        ? await RecordAiDocument.find({
            $or: sourceFilters,
            status: 'ready',
            chunkCount: { $gt: 0 }
        }).sort({ indexedAt: 1, updatedAt: 1 }).lean()
        : [];
    const directBySource = new Map();
    directDocs.forEach(document => {
        const key = `${document.source}:${document.sourceId}`;
        if (!directBySource.has(key)) directBySource.set(key, document);
    });

    const configHash = ragConfigHash();
    const sizes = [...new Set(files.map(file => Number(file.size || 0)).filter(size => size > 0))];
    const contentCandidates = sizes.length
        ? await RecordAiDocument.find({
            fileSize: { $in: sizes },
            contentHash: { $exists: true, $nin: ['', null] },
            ragConfigHash: configHash,
            status: 'ready',
            chunkCount: { $gt: 0 }
        }).sort({ indexedAt: 1, updatedAt: 1 }).lean()
        : [];

    const canonicalByHash = new Map();
    const candidatesBySize = new Map();
    contentCandidates.forEach(document => {
        const hash = document.contentHash || '';
        if (!hash) return;
        const size = Number(document.fileSize || 0);
        if (!canonicalByHash.has(hash)) canonicalByHash.set(hash, document);
        if (!candidatesBySize.has(size)) candidatesBySize.set(size, []);
        candidatesBySize.get(size).push(document);
    });

    const hashByFileKey = new Map();
    const getContentHashForFile = async (file) => {
        const key = `${file.source}:${file.id}`;
        if (hashByFileKey.has(key)) return hashByFileKey.get(key);
        if (!file.filename) {
            hashByFileKey.set(key, '');
            return '';
        }
        try {
            const filePath = resolveAttachmentPath(req.account_number, file.filename);
            const contentHash = await hashFileContent(filePath);
            hashByFileKey.set(key, contentHash);
            return contentHash;
        } catch (_) {
            hashByFileKey.set(key, '');
            return '';
        }
    };

    const enriched = [];
    for (const file of files) {
        const key = `${file.source}:${file.id}`;
        const direct = directBySource.get(key);
        const directCanonical = direct?.contentHash ? canonicalByHash.get(direct.contentHash) : null;

        if (direct) {
            enriched.push({
                ...file,
                rag: fileRagStatusPayload(direct, directCanonical || direct)
            });
            continue;
        }

        const sizeCandidates = candidatesBySize.get(Number(file.size || 0)) || [];
        if (sizeCandidates.length) {
            const contentHash = await getContentHashForFile(file);
            const canonical = contentHash ? canonicalByHash.get(contentHash) : null;
            if (canonical) {
                enriched.push({
                    ...file,
                    rag: fileRagStatusPayload(canonical, canonical, {
                        contentHash,
                        ragConfigHash: configHash,
                        sourceCache: true
                    })
                });
                continue;
            }
        }

        enriched.push({ ...file, rag: null });
    }

    return enriched;
}

async function buildBootstrap(req, record, entity) {
    const RecordNote = await tenantCollection(req, 'RecordNote');
    const Conversation = await tenantCollection(req, 'Conversation');
    const DriveFile = await tenantCollection(req, 'DriveFile');
    const engineSettings = await getRecordAiEngineSettings(req);
    const engineRuntime = resolveEngineRuntime(engineSettings);
    const embeddingRuntime = engineRuntime.embedding;

    const fields = await buildRecordFields(req, record, entity);

    const notes = await RecordNote.find({ recordId: record._id, archived: { $ne: true } })
        .sort({ pinned: -1, updatedAt: -1 })
        .limit(80)
        .lean();

    const chats = await Conversation.find({ recordId: record._id, archived: { $ne: true } })
        .select('name lastMessage updatedAt participants')
        .sort({ updatedAt: -1 })
        .limit(80)
        .lean();

    const recordFiles = (record.attachments || [])
        .filter(file => !file.isDataRoomOnly && isOcrSupported(file))
        .map(file => ({
            id: file._id?.toString(),
            source: 'record',
            filename: file.filename || '',
            name: file.originalName || file.filename || 'Fichier',
            mimeType: file.mimeType || '',
            size: file.size || 0,
            folder: file.folder || '',
            url: `/account/${req.account_number}/uploads/attachments/${file.filename}`,
            uploadedAt: file.uploadedAt,
            charCount: null
        }))
        .filter(file => file.id);

    const canUseAccountDrive = !['guest', 'external'].includes(req.workspaceRole || '');
    const driveFiles = canUseAccountDrive
        ? (await DriveFile.find({}).sort({ uploadedAt: -1 }).limit(120).lean())
            .filter(isOcrSupported)
            .map(file => ({
                id: file._id?.toString(),
                source: 'drive',
                filename: file.filename || '',
                name: file.originalName || file.filename || 'Fichier Drive',
                mimeType: file.mimeType || '',
                size: file.size || 0,
                folder: file.folder || '',
                url: `/account/${req.account_number}/uploads/attachments/${file.filename}`,
                uploadedAt: file.uploadedAt,
                charCount: null
            }))
            .filter(file => file.id)
        : [];
    const files = await enrichFilesWithRagStatus(req, [...recordFiles, ...driveFiles]);

    return {
        record: {
            id: record._id,
            title: record.computedTitle || record.title || 'Sans titre',
            entityName: entity?.nameSingular || entity?.name || 'Fiche',
            entityIcon: entity?.icon || 'solar:card-bold-duotone',
            entityColor: entity?.color || '#4f46e5',
            canUseAccountDrive
        },
        fields,
        notes: notes.map(note => {
            const text = note.isProtected ? '' : stripHtml(note.content || '');
            return {
                id: note._id,
                title: note.title || 'Sans titre',
                preview: note.isProtected ? 'Note protégée' : text.slice(0, 220),
                isProtected: !!note.isProtected,
                pinned: !!note.pinned,
                updatedAt: note.updatedAt,
                charCount: text.length
            };
        }),
        chats: chats.map(chat => ({
            id: chat._id,
            name: chat.name || 'Conversation',
            preview: chat.lastMessage?.text || '',
            updatedAt: chat.updatedAt,
            participantsCount: (chat.participants || []).length,
            charCount: null
        })),
        files,
        limits: {
            maxContextChars: MAX_CONTEXT_CHARS,
            maxFileChars: MAX_FILE_CHARS,
            maxUploadChars: MAX_UPLOAD_CHARS,
            ocrMaxPages: RECORD_AI_OCR_MAX_PAGES,
            ragEnabled: RECORD_AI_RAG_ENABLED,
            ragMaxPages: RECORD_AI_RAG_MAX_PAGES,
            ragMaxChunks: RECORD_AI_RAG_MAX_CHUNKS,
            ragMaxDocuments: RECORD_AI_RAG_MAX_DOCUMENTS,
            ragContextChars: RECORD_AI_RAG_CONTEXT_CHARS,
            vectorEnabled: embeddingRuntime.enabled,
            embeddingEngine: embeddingRuntime.engine,
            embeddingModel: embeddingRuntime.model,
            embeddingDimensions: embeddingRuntime.dimensions,
            debugEnabled: RECORD_AI_DEBUG_ENABLED,
            debugAdmin: isRecordAiDebugAdmin(req)
        },
        engineSettings,
        engineOptions: engineOptions(),
        engineRuntime
    };
}

function sanitizeContextItems(items = []) {
    return (Array.isArray(items) ? items : [])
        .filter(item => item && item.label)
        .slice(0, 30)
        .map(item => ({
            key: String(item.key || `${item.type}:${item.id || item.label}`).slice(0, 260),
            type: String(item.type || 'context').slice(0, 40),
            id: cleanId(item.id).slice(0, 80),
            source: item.source ? String(item.source).slice(0, 40) : undefined,
            label: String(item.label || 'Contexte').slice(0, 240),
            icon: String(item.icon || 'solar:document-text-bold-duotone').slice(0, 120),
            color: String(item.color || '#4f46e5').slice(0, 32),
            url: item.url ? String(item.url).slice(0, 500) : '',
            mimeType: item.mimeType ? String(item.mimeType).slice(0, 120) : '',
            previewType: item.previewType ? String(item.previewType).slice(0, 40) : '',
            meta: item.meta ? String(item.meta).slice(0, 80) : ''
        }));
}

async function buildContextItems(req, record, entity, selection) {
    const items = [];

    if (selection.fields?.length) {
        const fields = await buildRecordFields(req, record, entity);
        const fieldMap = new Map(fields.map(field => [field.id, field]));
        selection.fields.forEach(id => {
            const field = fieldMap.get(id);
            if (!field) return;
            items.push({
                key: `field:${id}`,
                type: 'fields',
                id,
                label: field.label || 'Champ',
                icon: 'solar:text-field-focus-bold',
                color: '#4f46e5',
                meta: 'Fiche'
            });
        });
    }

    if (selection.notes?.length) {
        const RecordNote = await tenantCollection(req, 'RecordNote');
        const notes = await RecordNote.find({
            _id: { $in: selection.notes },
            recordId: record._id,
            archived: { $ne: true }
        }).select('title isProtected').lean();
        const noteMap = new Map(notes.map(note => [cleanId(note._id), note]));
        selection.notes.forEach(id => {
            const note = noteMap.get(cleanId(id));
            if (!note) return;
            items.push({
                key: `note:${id}`,
                type: 'notes',
                id,
                label: note.title || 'Note',
                icon: note.isProtected ? 'solar:lock-keyhole-bold-duotone' : 'solar:notes-bold-duotone',
                color: '#8b5cf6',
                meta: note.isProtected ? 'Note protégée' : 'Note'
            });
        });
    }

    if (selection.chats?.length) {
        const Conversation = await tenantCollection(req, 'Conversation');
        const chats = await Conversation.find({
            _id: { $in: selection.chats },
            recordId: record._id,
            archived: { $ne: true }
        }).select('name').lean();
        const chatMap = new Map(chats.map(chat => [cleanId(chat._id), chat]));
        selection.chats.forEach(id => {
            const chat = chatMap.get(cleanId(id));
            if (!chat) return;
            items.push({
                key: `chat:${id}`,
                type: 'chats',
                id,
                label: chat.name || 'Chat',
                icon: 'solar:chat-round-dots-bold-duotone',
                color: '#f97316',
                meta: 'Chat'
            });
        });
    }

    if (selection.files?.length) {
        const canUseAccountDrive = !['guest', 'external'].includes(req.workspaceRole || '');
        for (const selected of selection.files.slice(0, 12)) {
            let file = null;
            if (selected.source === 'drive' && canUseAccountDrive) {
                const DriveFile = await tenantCollection(req, 'DriveFile');
                const driveFile = await DriveFile.findById(selected.id).lean();
                if (driveFile) {
                    file = {
                        source: 'drive',
                        id: cleanId(driveFile._id),
                        filename: driveFile.filename,
                        name: driveFile.originalName || driveFile.filename || selected.name || 'Fichier Drive',
                        mimeType: driveFile.mimeType || '',
                        meta: driveFile.folder || 'Drive'
                    };
                }
            } else if (selected.source === 'record') {
                const attachment = (record.attachments || []).find(item => cleanId(item._id) === cleanId(selected.id));
                if (attachment && !attachment.isDataRoomOnly) {
                    file = {
                        source: 'record',
                        id: cleanId(attachment._id),
                        filename: attachment.filename,
                        name: attachment.originalName || attachment.filename || selected.name || 'Fichier',
                        mimeType: attachment.mimeType || '',
                        meta: attachment.folder || 'Document'
                    };
                }
            }

            if (!file || !file.filename) continue;
            const previewType = getFilePreviewType(file);
            items.push({
                key: `${file.source}:${file.id}`,
                type: 'files',
                id: file.id,
                source: file.source,
                label: file.name,
                icon: previewType === 'image'
                    ? 'solar:gallery-bold-duotone'
                    : (file.source === 'drive' ? 'solar:cloud-storage-bold-duotone' : 'solar:file-text-bold-duotone'),
                color: file.source === 'drive' ? '#ec4899' : '#0f766e',
                url: `/account/${req.account_number}/uploads/attachments/${file.filename}`,
                mimeType: file.mimeType,
                previewType,
                meta: file.meta
            });
        }
    }

    if (selection.uploads?.length) {
        selection.uploads.slice(0, 8).forEach(upload => {
            items.push({
                key: upload.id,
                type: 'uploads',
                id: upload.id,
                label: upload.name || 'Document OCR',
                icon: 'solar:file-check-bold-duotone',
                color: '#0f766e',
                meta: 'OCR'
            });
        });
    }

    return sanitizeContextItems(items);
}

function addSection(sections, stats, title, text, maxChars, meta = {}) {
    const clean = String(text || '').trim();
    if (!clean) return;

    const limited = limitText(clean, maxChars);
    sections.push(`## ${title}\n${limited.text}`);
    stats.sections += 1;
    stats.chars += limited.text.length;
    stats.truncated = stats.truncated || limited.truncated;
    stats.sources.push({
        title,
        chars: limited.text.length,
        truncated: limited.truncated,
        ...meta
    });
}

async function getRagModels(req) {
    const RecordAiDocument = await tenantCollection(req, 'RecordAiDocument');
    const RecordAiDocumentChunk = await tenantCollection(req, 'RecordAiDocumentChunk');
    if (!RecordAiDocument || !RecordAiDocumentChunk) {
        throw new Error('Index documentaire IA indisponible');
    }
    return { RecordAiDocument, RecordAiDocumentChunk };
}

async function ensureOpenAIEmbeddingsAction() {
    let action = await IntegrationAction.findOne({
        providerKey: 'openai',
        actionKey: 'embeddings'
    });
    if (action) return action;

    action = await IntegrationAction.findOneAndUpdate(
        { providerKey: 'openai', actionKey: 'embeddings' },
        {
            providerKey: 'openai',
            actionKey: 'embeddings',
            name: 'Embeddings',
            description: 'Create vector embeddings for semantic search',
            http: {
                method: 'POST',
                path: '/embeddings'
            },
            inputSchema: {
                type: 'object',
                properties: {
                    model: { type: 'string', default: RECORD_AI_EMBEDDING_MODEL },
                    input: {
                        oneOf: [
                            { type: 'string' },
                            { type: 'array', items: { type: 'string' } }
                        ]
                    },
                    encoding_format: { type: 'string', default: 'float' },
                    dimensions: { type: 'number' }
                },
                required: ['model', 'input']
            },
            requestTemplate: {
                query: {},
                headers: {},
                body: {
                    model: '{{input.model}}',
                    input: '{{input.input}}',
                    encoding_format: '{{input.encoding_format}}',
                    dimensions: '{{input.dimensions}}'
                }
            },
            responseMapping: {
                data: 'data',
                model: 'model',
                usage: 'usage'
            },
            testPayload: {
                model: RECORD_AI_EMBEDDING_MODEL,
                input: 'Bonjour',
                encoding_format: 'float'
            },
            isPublished: true
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return action;
}

async function callOpenAIEmbeddings(req, inputs, settings = {}) {
    const runtime = resolveEmbeddingRuntime({ ...settings, embeddingEngine: 'openai' });
    const inputList = (Array.isArray(inputs) ? inputs : [inputs])
        .map(input => String(input || '').trim())
        .filter(Boolean);
    if (!inputList.length) return [];

    const { ConnectionModel, LogModel } = getTenantIntegrationModels(req);
    const action = await ensureOpenAIEmbeddingsAction();
    const payload = {
        model: runtime.model || RECORD_AI_EMBEDDING_MODEL,
        input: inputList,
        encoding_format: 'float',
        dimensions: runtime.dimensions > 0 ? runtime.dimensions : undefined
    };

    const result = await IntegrationService.executeAction({
        ProviderModel: IntegrationProvider,
        ActionModel: IntegrationAction,
        ConnectionModel,
        LogModel,
        workspaceId: req.account_number,
        providerKey: 'openai',
        actionId: action._id.toString(),
        input: payload,
        timeoutMs: RECORD_AI_EMBEDDING_TIMEOUT_MS
    });

    if (!result.success) {
        throw new Error(result.error || result.errorMessage || 'Embedding OpenAI impossible');
    }

    const entries = Array.isArray(result.raw?.data)
        ? result.raw.data
        : (Array.isArray(result.data?.data) ? result.data.data : []);
    const vectors = entries
        .slice()
        .sort((a, b) => (a.index || 0) - (b.index || 0))
        .map(item => item.embedding)
        .filter(vector => Array.isArray(vector) && vector.length);

    if (vectors.length !== inputList.length) {
        throw new Error(`Embedding OpenAI incomplet (${vectors.length}/${inputList.length})`);
    }

    return vectors;
}

async function callLocalEmbeddings(inputs, settings = {}) {
    const runtime = resolveEmbeddingRuntime({ ...settings, embeddingEngine: 'local' });
    const inputList = (Array.isArray(inputs) ? inputs : [inputs])
        .map(input => String(input || '').trim())
        .filter(Boolean);
    if (!inputList.length) return [];
    if (!RECORD_AI_LOCAL_EMBEDDING_URL) throw new Error('Moteur embedding local non configuré');

    if (RECORD_AI_LOCAL_EMBEDDING_FORMAT === 'openai') {
        const response = await axios.post(RECORD_AI_LOCAL_EMBEDDING_URL, {
            model: runtime.model,
            input: inputList,
            encoding_format: 'float'
        }, { timeout: RECORD_AI_EMBEDDING_TIMEOUT_MS });
        const entries = Array.isArray(response.data?.data) ? response.data.data : [];
        const vectors = entries
            .slice()
            .sort((a, b) => (a.index || 0) - (b.index || 0))
            .map(item => item.embedding)
            .filter(vector => Array.isArray(vector) && vector.length);
        if (vectors.length !== inputList.length) throw new Error(`Embedding local incomplet (${vectors.length}/${inputList.length})`);
        return vectors;
    }

    let batchError = null;
    try {
        const response = await axios.post(RECORD_AI_LOCAL_EMBEDDING_URL, {
            model: runtime.model,
            input: inputList
        }, { timeout: RECORD_AI_EMBEDDING_TIMEOUT_MS });
        if (Array.isArray(response.data?.embeddings)) {
            if (response.data.embeddings.length !== inputList.length) {
                throw new Error(`Embedding local incomplet (${response.data.embeddings.length}/${inputList.length})`);
            }
            return response.data.embeddings;
        }
        if (Array.isArray(response.data?.embedding) && inputList.length === 1) return [response.data.embedding];
    } catch (error) {
        batchError = error;
    }

    const vectors = [];
    for (const input of inputList) {
        try {
            const itemResponse = await axios.post(RECORD_AI_LOCAL_EMBEDDING_URL, {
                model: runtime.model,
                prompt: input
            }, { timeout: RECORD_AI_EMBEDDING_TIMEOUT_MS });
            if (!Array.isArray(itemResponse.data?.embedding)) throw new Error('Réponse embedding locale invalide');
            vectors.push(itemResponse.data.embedding);
        } catch (error) {
            const message = error.response?.data?.error || error.message || batchError?.message || 'Embedding local impossible';
            throw new Error(message);
        }
    }
    return vectors;
}

async function callEmbeddings(req, inputs, settings = {}) {
    const runtime = resolveEmbeddingRuntime(settings);
    if (!runtime.enabled) throw new Error(runtime.warning || 'Embeddings vectoriels désactivés');
    if (runtime.engine === 'local') return callLocalEmbeddings(inputs, settings);
    return callOpenAIEmbeddings(req, inputs, settings);
}

async function ensureDocumentEmbeddings(req, document, settings = {}) {
    const runtime = resolveEmbeddingRuntime(settings);
    const embedding = {
        enabled: runtime.enabled,
        engine: runtime.engine,
        requestedEngine: runtime.requestedEngine,
        model: runtime.model,
        config: embeddingConfigKey(settings),
        dimensions: runtime.dimensions,
        status: 'disabled',
        embeddedChunkCount: 0,
        chunkCount: document?.chunkCount || 0,
        generated: 0,
        error: runtime.warning || ''
    };

    if (!runtime.enabled || !document?._id || !document.chunkCount) {
        return { document, embedding };
    }

    const { RecordAiDocument, RecordAiDocumentChunk } = await getRagModels(req);
    if (
        document.embeddingStatus === 'ready' &&
        document.embeddingConfig === embedding.config &&
        Number(document.embeddedChunkCount || 0) >= Number(document.chunkCount || 0)
    ) {
        embedding.status = 'ready';
        embedding.embeddedChunkCount = document.embeddedChunkCount || document.chunkCount || 0;
        embedding.dimensions = document.embeddingDimensions || RECORD_AI_EMBEDDING_DIMENSIONS;
        return { document, embedding };
    }

    await RecordAiDocument.findByIdAndUpdate(document._id, {
        $set: {
            embeddingStatus: 'indexing',
            embeddingModel: runtime.model,
            embeddingConfig: embedding.config,
            embeddingError: ''
        }
    });

    try {
        const chunks = await RecordAiDocumentChunk.find({ documentId: document._id })
            .select('sourceName pageStart pageEnd text embedding embeddingConfig embeddingTextHash')
            .sort({ chunkIndex: 1 })
            .lean();
        const pending = chunks.filter(chunk => {
            const textHash = hashText(embeddingInputForChunk(chunk));
            return chunk.embeddingConfig !== embedding.config ||
                chunk.embeddingTextHash !== textHash ||
                !Array.isArray(chunk.embedding) ||
                chunk.embedding.length === 0;
        });

        for (let offset = 0; offset < pending.length; offset += RECORD_AI_EMBEDDING_BATCH_SIZE) {
            const batch = pending.slice(offset, offset + RECORD_AI_EMBEDDING_BATCH_SIZE);
            const vectors = await callEmbeddings(req, batch.map(embeddingInputForChunk), settings);
            const now = new Date();
            const updates = batch.map((chunk, index) => {
                const vector = vectors[index] || [];
                return {
                    updateOne: {
                        filter: { _id: chunk._id },
                        update: {
                            $set: {
                                embedding: vector,
                                embeddingModel: runtime.model,
                                embeddingConfig: embedding.config,
                                embeddingDimensions: vector.length,
                                embeddingTextHash: hashText(embeddingInputForChunk(chunk)),
                                embeddedAt: now
                            }
                        }
                    }
                };
            });
            if (updates.length) await RecordAiDocumentChunk.bulkWrite(updates, { ordered: false });
            embedding.generated += updates.length;
            if (!embedding.dimensions && vectors[0]?.length) embedding.dimensions = vectors[0].length;
        }

        const embeddedChunkCount = await RecordAiDocumentChunk.countDocuments({
            documentId: document._id,
            embeddingConfig: embedding.config,
            embedding: { $exists: true, $ne: [] }
        });
        const status = embeddedChunkCount >= chunks.length ? 'ready' : 'partial';
        const updatedDocument = await RecordAiDocument.findByIdAndUpdate(
            document._id,
            {
                $set: {
                    embeddingStatus: status,
                    embeddingModel: runtime.model,
                    embeddingConfig: embedding.config,
                    embeddingDimensions: embedding.dimensions || 0,
                    embeddedChunkCount,
                    embeddedAt: new Date(),
                    embeddingError: ''
                }
            },
            { new: true }
        ).lean();

        embedding.status = status;
        embedding.embeddedChunkCount = embeddedChunkCount;
        embedding.chunkCount = chunks.length;
        return { document: updatedDocument || document, embedding };
    } catch (error) {
        await RecordAiDocument.findByIdAndUpdate(document._id, {
            $set: {
                embeddingStatus: 'error',
                embeddingModel: runtime.model,
                embeddingConfig: embedding.config,
                embeddingError: error.message || 'Embedding impossible',
                embeddedAt: new Date()
            }
        });
        embedding.status = 'error';
        embedding.error = error.message || 'Embedding impossible';
        return { document, embedding };
    }
}

async function resolveSelectedFileInfo(req, record, selectedFile) {
    if (selectedFile.source === 'drive') {
        if (['guest', 'external'].includes(req.workspaceRole || '')) {
            throw new Error('Accès Drive non autorisé');
        }
        const DriveFile = await tenantCollection(req, 'DriveFile');
        const driveFile = await DriveFile.findById(selectedFile.id).lean();
        if (!driveFile) throw new Error('Fichier Drive introuvable');
        return {
            source: 'drive',
            id: cleanId(driveFile._id),
            filename: driveFile.filename,
            name: driveFile.originalName || driveFile.filename,
            mimeType: driveFile.mimeType || ''
        };
    }

    const attachment = (record.attachments || []).find(file => cleanId(file._id) === selectedFile.id);
    if (!attachment) throw new Error('Pièce jointe introuvable');
    if (attachment.isDataRoomOnly) throw new Error('Fichier réservé à la Data Room');

    return {
        source: 'record',
        id: cleanId(attachment._id),
        filename: attachment.filename,
        name: attachment.originalName || attachment.filename,
        mimeType: attachment.mimeType || ''
    };
}

function buildRagFingerprint(req, file, stat) {
    return hashText([
        req.account_number,
        file.source,
        file.id,
        file.filename || file.name,
        stat?.size || 0,
        stat?.mtimeMs || 0,
        `ragMaxPages:${RECORD_AI_RAG_MAX_PAGES}`,
        `chunk:${RECORD_AI_RAG_CHUNK_CHARS}:${RECORD_AI_RAG_CHUNK_OVERLAP}`
    ].join('|'));
}

function ragConfigHash() {
    return hashText([
        `ragMaxPages:${RECORD_AI_RAG_MAX_PAGES}`,
        `chunk:${RECORD_AI_RAG_CHUNK_CHARS}:${RECORD_AI_RAG_CHUNK_OVERLAP}`
    ].join('|'));
}

function hashFileContent(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);

        stream.on('data', chunk => hash.update(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(hash.digest('hex')));
    });
}

async function findReusableRagDocument(RecordAiDocument, { contentHash, configHash, accountNumber, fileSize, excludeId = null }) {
    if (!contentHash || !configHash) return null;

    const query = {
        contentHash,
        ragConfigHash: configHash,
        status: 'ready',
        chunkCount: { $gt: 0 }
    };
    if (excludeId) query._id = { $ne: excludeId };

    const direct = await RecordAiDocument.findOne(query)
        .sort({ indexedAt: 1, updatedAt: 1 })
        .lean();

    let legacy = null;
    const numericFileSize = Number(fileSize || 0);
    if (accountNumber && numericFileSize > 0) {
        const legacyQuery = {
            status: 'ready',
            chunkCount: { $gt: 0 },
            fileSize: numericFileSize,
            filename: { $nin: ['', null] },
            $or: [
                { contentHash: '' },
                { contentHash: { $exists: false } }
            ]
        };
        if (excludeId) legacyQuery._id = { $ne: excludeId };

        const candidates = await RecordAiDocument.find(legacyQuery)
            .sort({ indexedAt: 1, updatedAt: 1 })
            .limit(25)
            .lean();

        for (const candidate of candidates) {
            try {
                const filePath = resolveAttachmentPath(accountNumber, candidate.filename);
                const candidateHash = await hashFileContent(filePath);
                if (candidateHash !== contentHash) continue;

                legacy = await RecordAiDocument.findByIdAndUpdate(
                    candidate._id,
                    {
                        $set: {
                            contentHash,
                            ragConfigHash: configHash,
                            lastUsedAt: new Date()
                        }
                    },
                    { new: true }
                ).lean() || candidate;
                break;
            } catch (_) {
                // Ignore legacy documents whose source file is no longer available.
            }
        }
    }

    if (legacy && (!direct || new Date(legacy.indexedAt || 0) < new Date(direct.indexedAt || 0))) {
        return legacy;
    }
    return direct;
}

async function markRagDocumentUsed(RecordAiDocument, documentId) {
    if (!documentId) return;
    await RecordAiDocument.updateOne(
        { _id: documentId },
        { $set: { lastUsedAt: new Date() } }
    );
}

function pagesFromText(text) {
    const lines = String(text || '').replace(/\r/g, '').split('\n');
    const pages = [];
    let current = { page: 1, lines: [] };

    lines.forEach(line => {
        const match = line.match(/^---\s*Page\s+(\d+)\s*---\s*$/i);
        if (match) {
            const content = current.lines.join('\n').trim();
            if (content) pages.push({ page: current.page, text: content, source: 'text', confidence: null });
            current = { page: Number(match[1]) || pages.length + 1, lines: [] };
            return;
        }
        current.lines.push(line);
    });

    const content = current.lines.join('\n').trim();
    if (content) pages.push({ page: current.page, text: content, source: 'text', confidence: null });
    return pages;
}

function pagesFromExtracted(extracted = {}) {
    if (Array.isArray(extracted.pages) && extracted.pages.length) {
        return extracted.pages
            .map((page, index) => ({
                page: Number(page.page || index + 1),
                text: String(page.text || '').trim(),
                source: page.source || '',
                confidence: page.confidence ?? null
            }))
            .filter(page => page.text);
    }
    return pagesFromText(extracted.text || '');
}

function splitTextIntoChunks(text, maxChars = RECORD_AI_RAG_CHUNK_CHARS, overlap = RECORD_AI_RAG_CHUNK_OVERLAP) {
    const clean = String(text || '').trim();
    if (!clean) return [];
    if (clean.length <= maxChars) return [clean];

    const chunks = [];
    let start = 0;

    while (start < clean.length) {
        let end = Math.min(clean.length, start + maxChars);

        if (end < clean.length) {
            const newline = clean.lastIndexOf('\n', end);
            const space = clean.lastIndexOf(' ', end);
            const boundary = Math.max(newline, space);
            if (boundary > start + Math.floor(maxChars * 0.55)) end = boundary;
        }

        const chunk = clean.slice(start, end).trim();
        if (chunk) chunks.push(chunk);
        if (end >= clean.length) break;

        const nextStart = Math.max(start + 1, end - overlap);
        start = nextStart;
        while (start < clean.length && /\s/.test(clean[start])) start += 1;
    }

    return chunks;
}

function buildRagChunkPayloads({ documentId, record, entity, source, sourceId, sourceName, pages, meta = {} }) {
    const chunks = [];
    const indexedAt = new Date();
    const entityId = record.entityId || entity?._id || null;

    (pages || []).forEach(page => {
        const pageNumber = Number(page.page || 1);
        splitTextIntoChunks(page.text).forEach(text => {
            chunks.push({
                documentId,
                recordId: record._id,
                entityId,
                source,
                sourceId,
                sourceName: sourceName || 'Document',
                chunkIndex: chunks.length,
                pageStart: pageNumber,
                pageEnd: pageNumber,
                text,
                searchText: normalizeSearchText(`${sourceName || ''}\npage ${pageNumber}\np. ${pageNumber}\n${text}`),
                charCount: text.length,
                wordCount: countWords(text),
                indexedAt,
                meta: {
                    ...meta,
                    pageSource: page.source || '',
                    confidence: page.confidence ?? null
                }
            });
        });
    });

    return chunks;
}

async function ensureFileRagDocument(req, record, entity, selectedFile) {
    const { RecordAiDocument, RecordAiDocumentChunk } = await getRagModels(req);
    const file = await resolveSelectedFileInfo(req, record, selectedFile);
    const filePath = resolveAttachmentPath(req.account_number, file.filename);
    const stat = await fsp.stat(filePath);
    const sourceId = cleanId(file.id);
    const fileFingerprint = buildRagFingerprint(req, file, stat);
    const contentHash = await hashFileContent(filePath);
    const configHash = ragConfigHash();
    const existing = await RecordAiDocument.findOne({
        source: file.source,
        sourceId,
        fileFingerprint,
        status: 'ready'
    }).lean();

    const reusable = await findReusableRagDocument(RecordAiDocument, {
        contentHash,
        configHash,
        accountNumber: req.account_number,
        fileSize: stat.size
    });
    if (reusable && cleanId(reusable._id) !== cleanId(existing?._id)) {
        await markRagDocumentUsed(RecordAiDocument, reusable._id);
        return {
            document: reusable,
            indexed: false,
            reused: true,
            reuseReason: 'content-hash',
            chunksCreated: reusable.chunkCount,
            contentHash,
            ragConfigHash: configHash,
            usageName: file.name || reusable.name,
            usageSource: file.source,
            usageSourceId: sourceId
        };
    }

    if (existing?.chunkCount > 0) {
        const document = await RecordAiDocument.findByIdAndUpdate(
            existing._id,
            {
                $set: {
                    contentHash,
                    ragConfigHash: configHash,
                    fileSize: stat.size || existing.fileSize || 0,
                    mtimeMs: stat.mtimeMs || existing.mtimeMs || 0,
                    lastUsedAt: new Date()
                }
            },
            { new: true }
        ).lean();
        return {
            document: document || existing,
            indexed: false,
            reused: false,
            reuseReason: 'source-cache',
            chunksCreated: existing.chunkCount,
            contentHash,
            ragConfigHash: configHash,
            usageName: file.name || existing.name,
            usageSource: file.source,
            usageSourceId: sourceId
        };
    }

    let document = await RecordAiDocument.findOneAndUpdate(
        { source: file.source, sourceId, fileFingerprint },
        {
            $set: {
                recordId: record._id,
                entityId: record.entityId || entity?._id || null,
                name: file.name || file.filename || 'Document',
                filename: file.filename || '',
                mimeType: file.mimeType || '',
                fileSize: stat.size || 0,
                mtimeMs: stat.mtimeMs || 0,
                contentHash,
                ragConfigHash: configHash,
                status: 'indexing',
                embeddingStatus: 'none',
                embeddingConfig: '',
                embeddedChunkCount: 0,
                embeddingError: '',
                error: '',
                lastUsedAt: new Date()
            }
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    try {
        const extracted = await extractFileWithCache(req, file, {
            maxPages: RECORD_AI_RAG_MAX_PAGES,
            cacheLabel: 'rag'
        });
        const pages = pagesFromExtracted(extracted);
        const chunks = buildRagChunkPayloads({
            documentId: document._id,
            record,
            entity,
            source: file.source,
            sourceId,
            sourceName: extracted.name || file.name || file.filename || 'Document',
            pages,
            meta: {
                mimeType: file.mimeType || '',
                fileFingerprint,
                contentHash,
                ragConfigHash: configHash
            }
        });

        await RecordAiDocumentChunk.deleteMany({ documentId: document._id });
        if (chunks.length) await RecordAiDocumentChunk.insertMany(chunks, { ordered: false });

        document = await RecordAiDocument.findByIdAndUpdate(
            document._id,
            {
                $set: {
                    status: 'ready',
                    pageCount: extracted.meta?.pageCount || pages.length,
                    processedPages: extracted.meta?.processedPages || pages.length,
                    truncated: Boolean(extracted.meta?.truncated),
                    charCount: extracted.meta?.charCount || chunks.reduce((sum, chunk) => sum + chunk.charCount, 0),
                    wordCount: extracted.meta?.wordCount || chunks.reduce((sum, chunk) => sum + chunk.wordCount, 0),
                    chunkCount: chunks.length,
                    contentHash,
                    ragConfigHash: configHash,
                    embeddingStatus: 'none',
                    embeddingConfig: '',
                    embeddedChunkCount: 0,
                    embeddingError: '',
                    indexedAt: new Date(),
                    lastUsedAt: new Date(),
                    error: '',
                    meta: {
                        ...(extracted.meta || {}),
                        contentHash,
                        ragConfigHash: configHash
                    }
                }
            },
            { new: true }
        ).lean();

        return {
            document,
            indexed: true,
            chunksCreated: chunks.length,
            extractedMeta: extracted.meta || {},
            reused: false,
            reuseReason: 'indexed',
            contentHash,
            ragConfigHash: configHash,
            usageName: file.name || document?.name,
            usageSource: file.source,
            usageSourceId: sourceId
        };
    } catch (error) {
        await RecordAiDocument.findByIdAndUpdate(document._id, {
            $set: {
                status: 'error',
                error: error.message || 'Indexation impossible',
                indexedAt: new Date()
            }
        });
        throw error;
    }
}

async function ensureUploadRagDocument(req, record, entity, upload) {
    const { RecordAiDocument, RecordAiDocumentChunk } = await getRagModels(req);
    const sourceId = cleanId(upload.id);
    if (!sourceId) throw new Error('Upload OCR invalide');

    const text = String(upload.text || '').trim();
    const existingLatest = await RecordAiDocument.findOne({
        source: 'upload',
        sourceId,
        status: 'ready'
    }).sort({ indexedAt: -1, updatedAt: -1 }).lean();

    if (!text) {
        if (existingLatest) {
            return {
                document: existingLatest,
                indexed: false,
                chunksCreated: existingLatest.chunkCount
            };
        }
        throw new Error(`${upload.name || 'Upload OCR'}: texte OCR absent de la sélection`);
    }

    const contentHash = hashText(text);
    const configHash = ragConfigHash();
    const fileFingerprint = hashText([
        req.account_number,
        'upload',
        sourceId,
        upload.name || '',
        upload.charCount || text.length,
        hashText(text),
        `chunk:${RECORD_AI_RAG_CHUNK_CHARS}:${RECORD_AI_RAG_CHUNK_OVERLAP}`
    ].join('|'));

    const reusable = await findReusableRagDocument(RecordAiDocument, {
        contentHash,
        configHash
    });
    if (reusable && cleanId(reusable._id) !== cleanId(existingLatest?._id)) {
        await markRagDocumentUsed(RecordAiDocument, reusable._id);
        return {
            document: reusable,
            indexed: false,
            reused: true,
            reuseReason: 'content-hash',
            chunksCreated: reusable.chunkCount,
            contentHash,
            ragConfigHash: configHash,
            usageName: upload.name || reusable.name,
            usageSource: 'upload',
            usageSourceId: sourceId
        };
    }

    if (existingLatest?.fileFingerprint === fileFingerprint && existingLatest.chunkCount > 0) {
        const document = await RecordAiDocument.findByIdAndUpdate(
            existingLatest._id,
            {
                $set: {
                    contentHash,
                    ragConfigHash: configHash,
                    lastUsedAt: new Date()
                }
            },
            { new: true }
        ).lean();
        return {
            document: document || existingLatest,
            indexed: false,
            reused: false,
            reuseReason: 'source-cache',
            chunksCreated: existingLatest.chunkCount,
            contentHash,
            ragConfigHash: configHash,
            usageName: upload.name || existingLatest.name,
            usageSource: 'upload',
            usageSourceId: sourceId
        };
    }

    let document = await RecordAiDocument.findOneAndUpdate(
        { source: 'upload', sourceId, fileFingerprint },
        {
            $set: {
                recordId: record._id,
                entityId: record.entityId || entity?._id || null,
                name: upload.name || 'Document OCR',
                filename: '',
                mimeType: '',
                fileSize: 0,
                mtimeMs: 0,
                contentHash,
                ragConfigHash: configHash,
                status: 'indexing',
                embeddingStatus: 'none',
                embeddingConfig: '',
                embeddedChunkCount: 0,
                embeddingError: '',
                error: '',
                lastUsedAt: new Date()
            }
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const pages = pagesFromText(text);
    const chunks = buildRagChunkPayloads({
        documentId: document._id,
        record,
        entity,
        source: 'upload',
        sourceId,
        sourceName: upload.name || 'Document OCR',
        pages,
        meta: { upload: true, contentHash, ragConfigHash: configHash }
    });

    await RecordAiDocumentChunk.deleteMany({ documentId: document._id });
    if (chunks.length) await RecordAiDocumentChunk.insertMany(chunks, { ordered: false });

    document = await RecordAiDocument.findByIdAndUpdate(
        document._id,
        {
            $set: {
                status: 'ready',
                pageCount: pages.length || 1,
                processedPages: pages.length || 1,
                truncated: false,
                charCount: text.length,
                wordCount: countWords(text),
                chunkCount: chunks.length,
                contentHash,
                ragConfigHash: configHash,
                embeddingStatus: 'none',
                embeddingConfig: '',
                embeddedChunkCount: 0,
                embeddingError: '',
                indexedAt: new Date(),
                lastUsedAt: new Date(),
                error: '',
                meta: { upload: true, charCount: text.length, contentHash, ragConfigHash: configHash }
            }
        },
        { new: true }
    ).lean();

    return {
        document,
        indexed: true,
        reused: false,
        reuseReason: 'indexed',
        chunksCreated: chunks.length,
        contentHash,
        ragConfigHash: configHash,
        usageName: upload.name || document?.name,
        usageSource: 'upload',
        usageSourceId: sourceId
    };
}

async function prepareRagForSelection(req, record, entity, selection, settings = {}) {
    const embeddingRuntime = resolveEmbeddingRuntime(settings);
    const result = {
        enabled: RECORD_AI_RAG_ENABLED,
        maxPages: RECORD_AI_RAG_MAX_PAGES,
        maxDocuments: RECORD_AI_RAG_MAX_DOCUMENTS,
        vectorEnabled: embeddingRuntime.enabled,
        embeddingEngine: embeddingRuntime.engine,
        embeddingRequestedEngine: embeddingRuntime.requestedEngine,
        embeddingModel: embeddingRuntime.model,
        embeddingConfig: embeddingConfigKey(settings),
        documents: [],
        errors: []
    };

    if (!RECORD_AI_RAG_ENABLED) return result;

    for (const file of (selection.files || []).slice(0, RECORD_AI_RAG_MAX_DOCUMENTS)) {
        try {
            const indexed = await ensureFileRagDocument(req, record, entity, file);
            if (indexed?.document) {
                const embedded = await ensureDocumentEmbeddings(req, indexed.document, settings);
                const document = embedded.document || indexed.document;
                const displayName = indexed.usageName || document.name;
                result.documents.push({
                    documentId: cleanId(document._id),
                    source: indexed.usageSource || document.source,
                    sourceId: indexed.usageSourceId || document.sourceId,
                    canonicalSource: document.source,
                    canonicalSourceId: document.sourceId,
                    name: displayName,
                    canonicalName: document.name,
                    pageCount: document.pageCount,
                    processedPages: document.processedPages,
                    truncated: Boolean(document.truncated),
                    charCount: document.charCount,
                    chunkCount: document.chunkCount,
                    indexed: Boolean(indexed.indexed),
                    reused: Boolean(indexed.reused),
                    reuseReason: indexed.reuseReason || (indexed.indexed ? 'indexed' : 'source-cache'),
                    contentHash: document.contentHash || indexed.contentHash || '',
                    ragConfigHash: document.ragConfigHash || indexed.ragConfigHash || '',
                    indexedAt: document.indexedAt,
                    status: document.status,
                    embedding: embedded.embedding
                });
                if (embedded.embedding?.error) result.errors.push(`${displayName}: ${embedded.embedding.error}`);
            }
        } catch (error) {
            result.errors.push(`${file.name || file.id}: ${error.message}`);
        }
    }

    for (const upload of (selection.uploads || []).slice(0, 8)) {
        try {
            const indexed = await ensureUploadRagDocument(req, record, entity, upload);
            if (indexed?.document) {
                const embedded = await ensureDocumentEmbeddings(req, indexed.document, settings);
                const document = embedded.document || indexed.document;
                const displayName = indexed.usageName || document.name;
                result.documents.push({
                    documentId: cleanId(document._id),
                    source: indexed.usageSource || document.source,
                    sourceId: indexed.usageSourceId || document.sourceId,
                    canonicalSource: document.source,
                    canonicalSourceId: document.sourceId,
                    name: displayName,
                    canonicalName: document.name,
                    pageCount: document.pageCount,
                    processedPages: document.processedPages,
                    truncated: Boolean(document.truncated),
                    charCount: document.charCount,
                    chunkCount: document.chunkCount,
                    indexed: Boolean(indexed.indexed),
                    reused: Boolean(indexed.reused),
                    reuseReason: indexed.reuseReason || (indexed.indexed ? 'indexed' : 'source-cache'),
                    contentHash: document.contentHash || indexed.contentHash || '',
                    ragConfigHash: document.ragConfigHash || indexed.ragConfigHash || '',
                    indexedAt: document.indexedAt,
                    status: document.status,
                    embedding: embedded.embedding
                });
                if (embedded.embedding?.error) result.errors.push(`${displayName}: ${embedded.embedding.error}`);
            }
        } catch (error) {
            result.errors.push(`${upload.name || upload.id}: ${error.message}`);
        }
    }

    return result;
}

function scoreRagChunks(chunks, query, requestedPages = [], queryEmbedding = null) {
    const tokens = tokenizeSearch(query);
    const phrases = extractSearchPhrases(query);
    const requestedPageSet = new Set((requestedPages || []).map(Number).filter(Number.isFinite));

    return (chunks || []).map(chunk => {
        const searchText = chunk.searchText || normalizeSearchText(`${chunk.sourceName || ''}\n${chunk.text || ''}`);
        const matchedTerms = [];
        let lexicalScore = 0;
        let pageBoost = 0;
        const pageStart = Number(chunk.pageStart || 1);
        const pageEnd = Number(chunk.pageEnd || pageStart);
        const vectorScore = queryEmbedding && Array.isArray(chunk.embedding)
            ? cosineSimilarity(queryEmbedding, chunk.embedding)
            : null;

        requestedPageSet.forEach(page => {
            if (pageStart <= page && page <= pageEnd) {
                matchedTerms.push(`page ${page}`);
                pageBoost += 1000;
            }
        });

        tokens.forEach(token => {
            if (!searchText.includes(token)) return;
            matchedTerms.push(token);
            if (/^\d+$/.test(token) || token.length <= 2) lexicalScore += 1;
            else if (token.length >= 7) lexicalScore += 5;
            else lexicalScore += 3;
        });

        phrases.forEach(phrase => {
            if (!searchText.includes(phrase)) return;
            matchedTerms.push(phrase);
            lexicalScore += phrase.length >= 8 ? 14 : 8;
        });

        if (tokens.length > 1 && tokens.every(token => searchText.includes(token))) {
            lexicalScore += Math.min(12, tokens.length * 2);
        }

        const vectorBoost = typeof vectorScore === 'number' ? Math.max(0, vectorScore) * 100 : 0;
        const score = pageBoost + lexicalScore + vectorBoost;

        return {
            chunk,
            score,
            lexicalScore,
            vectorScore,
            pageBoost,
            matchedTerms: [...new Set(matchedTerms)]
        };
    }).sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (String(a.chunk.documentId) !== String(b.chunk.documentId)) {
            return String(a.chunk.documentId).localeCompare(String(b.chunk.documentId));
        }
        return (a.chunk.chunkIndex || 0) - (b.chunk.chunkIndex || 0);
    });
}

function selectRagChunks(scoredChunks, allChunks) {
    const byKey = new Map();
    (allChunks || []).forEach(chunk => {
        byKey.set(`${cleanId(chunk.documentId)}:${chunk.chunkIndex}`, chunk);
    });

    const selected = new Map();
    const addScored = (entry, reason = 'match') => {
        if (!entry?.chunk || selected.size >= RECORD_AI_RAG_MAX_CHUNKS) return;
        const key = `${cleanId(entry.chunk.documentId)}:${entry.chunk.chunkIndex}`;
        if (selected.has(key)) return;
        selected.set(key, {
            ...entry,
            reason
        });
    };

    const positive = (scoredChunks || []).filter(entry => entry.score > 0);
    positive.forEach(entry => {
        if (selected.size >= RECORD_AI_RAG_MAX_CHUNKS) return;
        addScored(entry, 'match');

        const next = byKey.get(`${cleanId(entry.chunk.documentId)}:${Number(entry.chunk.chunkIndex || 0) + 1}`);
        if (next && selected.size < RECORD_AI_RAG_MAX_CHUNKS) {
            addScored({
                chunk: next,
                score: Math.max(0.1, entry.score * 0.35),
                lexicalScore: entry.lexicalScore,
                vectorScore: entry.vectorScore,
                pageBoost: entry.pageBoost,
                matchedTerms: entry.matchedTerms
            }, 'voisin');
        }
    });

    if (selected.size === 0) {
        (allChunks || [])
            .slice()
            .sort((a, b) => {
                if (String(a.documentId) !== String(b.documentId)) {
                    return String(a.documentId).localeCompare(String(b.documentId));
                }
                return (a.chunkIndex || 0) - (b.chunkIndex || 0);
            })
            .slice(0, RECORD_AI_RAG_MAX_CHUNKS)
            .forEach(chunk => addScored({ chunk, score: 0, lexicalScore: 0, vectorScore: null, pageBoost: 0, matchedTerms: [] }, 'fallback'));
    }

    return [...selected.values()].sort((a, b) => {
        const nameCompare = String(a.chunk.sourceName || '').localeCompare(String(b.chunk.sourceName || ''));
        if (nameCompare !== 0) return nameCompare;
        if ((a.chunk.pageStart || 0) !== (b.chunk.pageStart || 0)) return (a.chunk.pageStart || 0) - (b.chunk.pageStart || 0);
        return (a.chunk.chunkIndex || 0) - (b.chunk.chunkIndex || 0);
    });
}

async function buildRagContext(req, record, entity, selection, query, settings = {}) {
    const prepared = await prepareRagForSelection(req, record, entity, selection, settings);
    const requestedPages = extractRequestedPages(query);
    const embeddingRuntime = resolveEmbeddingRuntime(settings);
    const debug = {
        ...prepared,
        query: String(query || ''),
        queryTokens: tokenizeSearch(query),
        phrases: extractSearchPhrases(query),
        requestedPages,
        vector: {
            enabled: embeddingRuntime.enabled,
            engine: embeddingRuntime.engine,
            requestedEngine: embeddingRuntime.requestedEngine,
            model: embeddingRuntime.model,
            config: embeddingConfigKey(settings),
            queryEmbedded: false,
            error: embeddingRuntime.warning || ''
        },
        chunks: []
    };

    const documentIds = prepared.documents
        .filter(document => document.status === 'ready' && document.chunkCount > 0)
        .map(document => document.documentId)
        .filter(isObjectId);

    if (!RECORD_AI_RAG_ENABLED || !documentIds.length) {
        return { text: '', debug };
    }

    const { RecordAiDocumentChunk } = await getRagModels(req);
    const chunks = await RecordAiDocumentChunk.find({
        documentId: { $in: documentIds }
    })
        .select('documentId source sourceId sourceName chunkIndex pageStart pageEnd text searchText charCount wordCount embedding embeddingConfig meta')
        .sort({ documentId: 1, chunkIndex: 1 })
        .lean();
    const usageByDocumentId = new Map(prepared.documents.map(document => [
        cleanId(document.documentId),
        {
            name: document.name,
            source: document.source,
            sourceId: document.sourceId
        }
    ]));
    const displayChunks = chunks.map(chunk => {
        const usage = usageByDocumentId.get(cleanId(chunk.documentId));
        if (!usage) return chunk;
        return {
            ...chunk,
            source: usage.source || chunk.source,
            sourceId: usage.sourceId || chunk.sourceId,
            sourceName: usage.name || chunk.sourceName
        };
    });
    const activeEmbeddingConfig = embeddingConfigKey(settings);
    const chunksForScoring = displayChunks.map(chunk => (
        chunk.embeddingConfig === activeEmbeddingConfig
            ? chunk
            : { ...chunk, embedding: [] }
    ));

    let queryEmbedding = null;
    if (embeddingRuntime.enabled && chunksForScoring.some(chunk => Array.isArray(chunk.embedding) && chunk.embedding.length)) {
        try {
            [queryEmbedding] = await callEmbeddings(req, String(query || ''), settings);
            debug.vector.queryEmbedded = Array.isArray(queryEmbedding) && queryEmbedding.length > 0;
            debug.vector.dimensions = queryEmbedding?.length || 0;
        } catch (error) {
            debug.vector.error = error.message || 'Embedding de la question impossible';
        }
    }

    const selected = selectRagChunks(scoreRagChunks(chunksForScoring, query, requestedPages, queryEmbedding), chunksForScoring);
    const blocks = selected.map(entry => {
        const chunk = entry.chunk;
        return [
            `### ${chunk.sourceName || 'Document'} - ${pageLabel(chunk)}`,
            `Source: ${chunk.sourceName || 'Document'} (${pageLabel(chunk)})`,
            chunk.text
        ].join('\n');
    });

    debug.chunks = selected.map(entry => ({
        documentId: cleanId(entry.chunk.documentId),
        source: entry.chunk.source,
        sourceId: entry.chunk.sourceId,
        name: entry.chunk.sourceName,
        chunkIndex: entry.chunk.chunkIndex,
        pageStart: entry.chunk.pageStart,
        pageEnd: entry.chunk.pageEnd,
        score: Number(entry.score || 0),
        lexicalScore: Number(entry.lexicalScore || 0),
        vectorScore: typeof entry.vectorScore === 'number' ? entry.vectorScore : null,
        pageBoost: Number(entry.pageBoost || 0),
        reason: entry.reason,
        matchedTerms: entry.matchedTerms || [],
        charCount: entry.chunk.charCount,
        text: clipDebugText(entry.chunk.text, Math.min(RECORD_AI_DEBUG_TEXT_CHARS, 20000)).text
    }));

    return {
        text: blocks.join('\n\n'),
        debug
    };
}

async function buildSelectedContext(req, record, entity, selection, options = {}) {
    const engineSettings = normalizeEngineSettings(options.engineSettings || {});
    const embeddingRuntime = resolveEmbeddingRuntime(engineSettings);
    const stats = { sections: 0, chars: 0, truncated: false, sources: [], errors: [] };
    const sections = [];
    const debug = {
        ocr: [],
        uploads: [],
        limits: {
            maxContextChars: MAX_CONTEXT_CHARS,
            maxNotesChars: MAX_NOTES_CHARS,
            maxChatChars: MAX_CHAT_CHARS,
            maxFileChars: MAX_FILE_CHARS,
            maxUploadChars: MAX_UPLOAD_CHARS,
            ocrMaxPages: RECORD_AI_OCR_MAX_PAGES,
            ragEnabled: RECORD_AI_RAG_ENABLED,
            ragMaxPages: RECORD_AI_RAG_MAX_PAGES,
            ragMaxChunks: RECORD_AI_RAG_MAX_CHUNKS,
            ragContextChars: RECORD_AI_RAG_CONTEXT_CHARS,
            vectorEnabled: embeddingRuntime.enabled,
            embeddingEngine: embeddingRuntime.engine,
            embeddingModel: embeddingRuntime.model,
            embeddingDimensions: embeddingRuntime.dimensions
        },
        rag: null
    };

    addSection(
        sections,
        stats,
        'Fiche courante',
        [
            `Type: ${entity?.nameSingular || entity?.name || 'Fiche'}`,
            `Titre: ${record.computedTitle || record.title || 'Sans titre'}`
        ].join('\n'),
        1000,
        { type: 'record' }
    );

    if (selection.fields?.length) {
        const fields = await buildRecordFields(req, record, entity);
        const selected = fields.filter(field => selection.fields.includes(field.id));
        const text = selected.map(field => `${field.label}: ${field.value}`).join('\n');
        addSection(sections, stats, 'Champs sélectionnés', text, 9000, { type: 'fields' });
    }

    if (selection.notes?.length) {
        const RecordNote = await tenantCollection(req, 'RecordNote');
        const notes = await RecordNote.find({
            _id: { $in: selection.notes },
            recordId: record._id,
            archived: { $ne: true }
        }).lean();

        const text = notes
            .filter(note => !note.isProtected)
            .map(note => `### ${note.title || 'Note'}\n${stripHtml(note.content || '')}`)
            .join('\n\n');
        addSection(sections, stats, 'Notes sélectionnées', text, MAX_NOTES_CHARS, { type: 'notes' });
    }

    if (selection.chats?.length) {
        const Conversation = await tenantCollection(req, 'Conversation');
        const Message = await tenantCollection(req, 'Message');
        const conversations = await Conversation.find({
            _id: { $in: selection.chats },
            recordId: record._id,
            archived: { $ne: true }
        }).lean();

        const chatBlocks = [];
        for (const conv of conversations) {
            const messages = await Message.find({
                conversationId: conv._id,
                deleted: { $ne: true }
            })
                .sort({ createdAt: -1 })
                .limit(50)
                .lean();

            const lines = messages.reverse().map(message => {
                const author = message.senderName || 'Utilisateur';
                return `${author}: ${stripHtml(message.text || '')}`;
            });
            chatBlocks.push(`### ${conv.name || 'Conversation'}\n${lines.join('\n')}`);
        }

        addSection(sections, stats, 'Conversations chat sélectionnées', chatBlocks.join('\n\n'), MAX_CHAT_CHARS, { type: 'chats' });
    }

    if (RECORD_AI_RAG_ENABLED && (selection.files?.length || selection.uploads?.length)) {
        const ragContext = await buildRagContext(req, record, entity, selection, options.query || '', engineSettings);
        debug.rag = ragContext.debug;
        if (ragContext.debug?.errors?.length) {
            stats.errors.push(...ragContext.debug.errors);
        }
        addSection(
            sections,
            stats,
            'Extraits OCR pertinents sélectionnés',
            ragContext.text,
            RECORD_AI_RAG_CONTEXT_CHARS,
            { type: 'rag', chunks: ragContext.debug?.chunks?.length || 0 }
        );

        (selection.uploads || []).slice(0, 8).forEach(upload => {
            if (!upload.text) return;
            const clipped = clipDebugText(upload.text);
            debug.uploads.push({
                id: upload.id,
                name: upload.name,
                rawText: clipped.text,
                rawTextTruncated: clipped.truncated,
                rawTextChars: clipped.originalChars,
                indexedInRag: true
            });
        });
    } else if (selection.files?.length) {
        const fileBlocks = [];
        for (const file of selection.files.slice(0, 5)) {
            try {
                const extracted = await extractSelectedFile(req, record, file);
                const limited = limitText(extracted.text, MAX_FILE_CHARS);
                fileBlocks.push(`### ${extracted.name}\n${limited.text}`);
                stats.truncated = stats.truncated || limited.truncated;
                const clipped = clipDebugText(extracted.text);
                debug.ocr.push({
                    id: file.id,
                    source: file.source,
                    name: extracted.name,
                    meta: extracted.meta || {},
                    rawText: clipped.text,
                    rawTextTruncated: clipped.truncated,
                    rawTextChars: clipped.originalChars,
                    contextTextChars: limited.text.length,
                    contextTextTruncated: limited.truncated
                });
            } catch (error) {
                stats.errors.push(`${file.name || file.id}: ${error.message}`);
            }
        }
        addSection(sections, stats, 'Documents OCR sélectionnés', fileBlocks.join('\n\n'), MAX_FILE_CHARS, { type: 'files' });
    } else if (selection.uploads?.length) {
        const text = selection.uploads
            .slice(0, 4)
            .map(upload => {
                const limited = limitText(upload.text, MAX_UPLOAD_CHARS);
                stats.truncated = stats.truncated || limited.truncated;
                const clipped = clipDebugText(upload.text);
                debug.uploads.push({
                    id: upload.id,
                    name: upload.name,
                    rawText: clipped.text,
                    rawTextTruncated: clipped.truncated,
                    rawTextChars: clipped.originalChars,
                    contextTextChars: limited.text.length,
                    contextTextTruncated: limited.truncated
                });
                return `### ${upload.name}\n${limited.text}`;
            })
            .join('\n\n');
        addSection(sections, stats, 'Uploads OCR sélectionnés', text, MAX_UPLOAD_CHARS, { type: 'uploads' });
    }

    const joined = sections.join('\n\n');
    const limitedContext = limitText(joined, MAX_CONTEXT_CHARS);
    stats.chars = limitedContext.text.length;
    stats.estimatedTokens = Math.ceil(stats.chars / 4);
    stats.truncated = stats.truncated || limitedContext.truncated;

    return {
        text: limitedContext.text,
        fingerprint: hashText(JSON.stringify({
            selection: persistableSelection(selection),
            context: limitedContext.text
        })),
        stats,
        debug
    };
}

async function extractSelectedFile(req, record, selectedFile) {
    const file = await resolveSelectedFileInfo(req, record, selectedFile);
    return extractFileWithCache(req, file);
}

async function extractFileWithCache(req, file, options = {}) {
    const maxPages = boundedInt(options.maxPages || RECORD_AI_OCR_MAX_PAGES, RECORD_AI_OCR_MAX_PAGES, 1, 250);
    const cacheLabel = String(options.cacheLabel || 'context').replace(/[^a-z0-9_-]/gi, '').slice(0, 32) || 'context';
    const filePath = resolveAttachmentPath(req.account_number, file.filename);
    const stat = await fsp.stat(filePath);
    const cacheKey = hashText([
        req.account_number,
        file.source,
        file.id,
        file.filename,
        stat.size,
        stat.mtimeMs,
        cacheLabel,
        `maxPages:${maxPages}`
    ].join('|'));
    const cachePath = path.join(OCR_CACHE_DIR, String(req.account_number), `${cacheKey}.json`);

    try {
        const cached = JSON.parse(await fsp.readFile(cachePath, 'utf8'));
        if (cached?.text) return cached;
    } catch (_) {
        // Cache miss.
    }

    const result = await OcrService.extractTextFromFile(filePath, {
        originalName: file.name,
        mimeType: file.mimeType,
        mode: 'auto',
        maxPages
    });

    const payload = {
        name: file.name,
        text: result.text || '',
        pages: result.pages || [],
        meta: result.meta || {}
    };

    await fsp.mkdir(path.dirname(cachePath), { recursive: true });
    await fsp.writeFile(cachePath, JSON.stringify(payload), 'utf8');
    return payload;
}

function resolveAttachmentPath(accountNumber, filename) {
    if (!filename || filename.includes('..')) {
        throw new Error('Chemin de fichier invalide');
    }

    const privatePath = path.join(__dirname, '../../private_uploads/attachments', String(accountNumber), filename);
    if (fs.existsSync(privatePath)) return privatePath;

    const publicPath = path.join(__dirname, '../../public/uploads/attachments', String(accountNumber), filename);
    if (fs.existsSync(publicPath)) return publicPath;

    throw new Error('Fichier introuvable sur le disque');
}

function buildInstructions(record, entity) {
    return [
        `Tu es l'assistant IA de la fiche "${record.computedTitle || record.title || 'Sans titre'}" (${entity?.nameSingular || entity?.name || 'record'}).`,
        "Réponds en français, clairement et directement.",
        "Utilise le contexte fourni quand il est pertinent. Si l'information n'est pas dans le contexte, dis-le au lieu d'inventer.",
        "Les documents volumineux peuvent être fournis sous forme d'extraits OCR pertinents issus d'un index RAG: réponds à partir de ces extraits et cite les pages quand elles sont disponibles.",
        "Ne propose pas de correctifs ou d'actions à appliquer sauf si l'utilisateur le demande explicitement.",
        "Quand tu t'appuies sur un document, une note ou un chat précis, cite brièvement la source dans la réponse."
    ].join('\n');
}

function buildLocalChatMessages({ instructions, input, historyMessages = [] }) {
    const messages = [];
    if (instructions) {
        messages.push({
            role: 'system',
            content: String(instructions || '').slice(0, MAX_STORED_MESSAGE_CHARS)
        });
    }

    (historyMessages || [])
        .filter(message => ['user', 'assistant'].includes(message?.role) && message.messageType !== 'context')
        .slice(-12)
        .forEach(message => {
            const content = String(message.content || '').trim();
            if (!content) return;
            messages.push({
                role: message.role,
                content: content.slice(0, MAX_STORED_MESSAGE_CHARS)
            });
        });

    messages.push({
        role: 'user',
        content: String(input || '').slice(0, MAX_CONTEXT_CHARS + 12000)
    });

    return messages;
}

function extractLocalChatText(data = {}) {
    if (typeof data?.message?.content === 'string') return data.message.content;
    if (typeof data?.response === 'string') return data.response;
    if (typeof data?.output === 'string') return data.output;
    if (typeof data?.content === 'string') return data.content;

    const choice = Array.isArray(data?.choices) ? data.choices[0] : null;
    if (typeof choice?.message?.content === 'string') return choice.message.content;
    if (typeof choice?.text === 'string') return choice.text;

    return '';
}

async function callLocalRecordAI({ instructions, input, historyMessages = [], runtime, maxOutputTokens = RECORD_AI_OUTPUT_TOKENS }) {
    if (!RECORD_AI_LOCAL_RESPONSE_URL) throw new Error('Moteur réponse local non configuré');

    const messages = buildLocalChatMessages({ instructions, input, historyMessages });
    const timeout = RECORD_AI_LOCAL_RESPONSE_TIMEOUT_MS;
    const outputTokens = boundedInt(maxOutputTokens, RECORD_AI_OUTPUT_TOKENS, 500, 12000);
    let response;

    try {
        if (RECORD_AI_LOCAL_RESPONSE_FORMAT === 'openai') {
            response = await axios.post(RECORD_AI_LOCAL_RESPONSE_URL, {
                model: runtime.model,
                messages,
                temperature: 0.35,
                max_tokens: outputTokens,
                stream: false
            }, { timeout });
        } else {
            response = await axios.post(RECORD_AI_LOCAL_RESPONSE_URL, {
                model: runtime.model,
                messages,
                stream: false,
                options: {
                    temperature: 0.35,
                    num_predict: outputTokens
                }
            }, { timeout });
        }
    } catch (error) {
        if (error.code === 'ECONNABORTED' || /timeout/i.test(error.message || '')) {
            throw new Error('La génération locale prend trop de temps. Réessayez avec moins de contexte ou relancez la demande.');
        }
        throw new Error(error.response?.data?.error || error.message || 'Réponse IA locale impossible');
    }

    const content = extractLocalChatText(response.data).trim();
    return {
        content: content || 'Pas de réponse',
        responseId: ''
    };
}

async function callRecordAI(req, { conversationId, recordId, instructions, input, previousResponseId, engineSettings = {}, historyMessages = [], maxOutputTokens = RECORD_AI_OUTPUT_TOKENS }) {
    const responseRuntime = resolveResponseRuntime(engineSettings);
    const outputTokens = boundedInt(maxOutputTokens, RECORD_AI_OUTPUT_TOKENS, 500, 12000);

    if (responseRuntime.engine === 'local') {
        const result = await callLocalRecordAI({
            instructions,
            input,
            historyMessages,
            runtime: responseRuntime,
            maxOutputTokens: outputTokens
        });
        return { ...result, runtime: responseRuntime };
    }

    const { ConnectionModel, LogModel } = getTenantIntegrationModels(req);
    const action = await IntegrationAction.findOne({
        providerKey: 'openai',
        actionKey: 'responses'
    });

    if (!action) throw new Error('Responses action not found. Please seed the OpenAI actions.');

    const inputPayload = {
        model: responseRuntime.model || RECORD_AI_MODEL,
        input,
        max_output_tokens: outputTokens,
        store: true,
        metadata: {
            feature: 'record-ai-app',
            account_number: String(req.account_number || ''),
            record_id: String(recordId || ''),
            conversation_id: String(conversationId || '')
        }
    };

    if (instructions) inputPayload.instructions = instructions;
    if (previousResponseId) inputPayload.previous_response_id = previousResponseId;
    if (!/^gpt-5(?:[.-]|$)/.test(responseRuntime.model || RECORD_AI_MODEL)) inputPayload.temperature = 0.35;

    const result = await IntegrationService.executeAction({
        ProviderModel: IntegrationProvider,
        ActionModel: IntegrationAction,
        ConnectionModel,
        LogModel,
        workspaceId: req.account_number,
        providerKey: 'openai',
        actionId: action._id.toString(),
        input: inputPayload,
        timeoutMs: RECORD_AI_TIMEOUT_MS
    });

    if (!result.success) {
        const message = result.error || result.errorMessage || 'AI response call failed';
        throw new Error(/request timeout/i.test(message)
            ? 'La génération prend trop de temps. Réessayez avec moins de contexte ou relancez la demande.'
            : message);
    }

    const content = extractResponsesText(result.data) || extractResponsesText(result.raw) || 'Pas de réponse';
    return {
        content,
        responseId: result.data?.id || result.raw?.id || '',
        runtime: responseRuntime
    };
}

function buildAiInput(message, contextText) {
    if (!contextText?.trim()) return message;
    return [
        'Contexte sélectionné pour cette demande:',
        '<contexte>',
        contextText.trim(),
        '</contexte>',
        '',
        'Demande utilisateur:',
        message
    ].join('\n');
}

function sanitizeStoredMessages(messages = []) {
    return messages
        .filter(message => ['user', 'assistant', 'system'].includes(message?.role))
        .slice(-MAX_STORED_MESSAGES)
        .map(message => ({
            role: message.role,
            content: String(message.content || '').slice(0, MAX_STORED_MESSAGE_CHARS),
            messageType: message.messageType === 'context' ? 'context' : 'text',
            contextSelections: message.contextSelections ? persistableSelection(message.contextSelections) : undefined,
            contextItems: message.contextItems ? sanitizeContextItems(message.contextItems) : undefined,
            contextFingerprint: message.contextFingerprint ? String(message.contextFingerprint) : '',
            debugPayload: RECORD_AI_DEBUG_ENABLED && message.debugPayload ? message.debugPayload : undefined,
            contextStats: message.contextStats || undefined,
            createdAt: message.createdAt ? new Date(message.createdAt) : new Date()
        }));
}

function defaultConversationTitle(message) {
    const clean = stripHtml(message || '').replace(/\s+/g, ' ').trim();
    if (!clean) return 'Nouvelle conversation';
    return clean.length > 48 ? `${clean.slice(0, 48)}...` : clean;
}

function buildDebugPayload({
    phase,
    message,
    selection,
    selectedContext,
    input,
    previousResponseId,
    includeContext,
    contextChanged,
    contextSource,
    contextItems,
    ragPreparation,
    engineSettings,
    engineRuntime
}) {
    if (!RECORD_AI_DEBUG_ENABLED) return undefined;

    const normalizedSettings = normalizeEngineSettings(engineSettings || {});
    const runtime = engineRuntime || resolveEngineRuntime(normalizedSettings);
    const clippedContext = clipDebugText(selectedContext?.text || '');
    const clippedInput = clipDebugText(input || '');

    return {
        phase,
        createdAt: new Date(),
        model: runtimeModelLabel(runtime.response),
        responseEngine: runtime.response?.engine || 'openai',
        embeddingEngine: runtime.embedding?.engine || 'lexical',
        engines: {
            settings: normalizedSettings,
            response: runtime.response,
            embedding: runtime.embedding
        },
        timeoutMs: RECORD_AI_TIMEOUT_MS,
        previousResponseId: previousResponseId || '',
        includeContext: Boolean(includeContext),
        contextChanged: Boolean(contextChanged),
        contextSource: contextSource || 'none',
        userMessage: String(message || ''),
        contextSelections: debugSelection(selection || {}),
        contextItems: sanitizeContextItems(contextItems || []),
        contextStats: selectedContext?.stats || null,
        limits: selectedContext?.debug?.limits || {
            maxContextChars: MAX_CONTEXT_CHARS,
            maxFileChars: MAX_FILE_CHARS,
            maxUploadChars: MAX_UPLOAD_CHARS,
            ocrMaxPages: RECORD_AI_OCR_MAX_PAGES,
            ragEnabled: RECORD_AI_RAG_ENABLED,
            ragMaxPages: RECORD_AI_RAG_MAX_PAGES,
            ragMaxChunks: RECORD_AI_RAG_MAX_CHUNKS,
            vectorEnabled: runtime.embedding?.enabled || false,
            embeddingEngine: runtime.embedding?.engine || 'lexical',
            embeddingModel: runtime.embedding?.model || RECORD_AI_EMBEDDING_MODEL,
            embeddingDimensions: runtime.embedding?.dimensions || 0
        },
        contextText: clippedContext.text,
        contextTextTruncated: clippedContext.truncated,
        contextTextOriginalChars: clippedContext.originalChars,
        aiInput: clippedInput.text,
        aiInputTruncated: clippedInput.truncated,
        aiInputOriginalChars: clippedInput.originalChars,
        ocr: selectedContext?.debug?.ocr || [],
        uploads: selectedContext?.debug?.uploads || [],
        rag: selectedContext?.debug?.rag || ragPreparation || null
    };
}

router.get('/:recordId/bootstrap', async (req, res) => {
    try {
        const { record, entity } = await loadRecordBundle(req, req.params.recordId);
        const RecordAiConversation = await tenantCollection(req, 'RecordAiConversation');
        const bootstrap = await buildBootstrap(req, record, entity);
        const conversations = await RecordAiConversation.find({
            recordId: record._id,
            userId: String(req.user._id),
            archived: { $ne: true }
        })
            .select('title model lastMessage contextSelections updatedAt createdAt')
            .sort({ updatedAt: -1 })
            .lean();
        const agentConversations = await listAgentConversations(req, record, entity);

        res.json({ success: true, ...bootstrap, conversations, agentConversations });
    } catch (error) {
        console.error('[RecordAI] bootstrap error:', error);
        res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
});

router.patch('/:recordId/settings', async (req, res) => {
    try {
        await loadRecordBundle(req, req.params.recordId);
        const engineSettings = await saveRecordAiEngineSettings(req, req.body || {});
        const engineRuntime = resolveEngineRuntime(engineSettings);

        res.json({
            success: true,
            engineSettings,
            engineOptions: engineOptions(),
            engineRuntime
        });
    } catch (error) {
        console.error('[RecordAI] engine settings error:', error);
        res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
});

router.get('/:recordId/conversations', async (req, res) => {
    try {
        const { record } = await loadRecordBundle(req, req.params.recordId);
        const RecordAiConversation = await tenantCollection(req, 'RecordAiConversation');
        const conversations = await RecordAiConversation.find({
            recordId: record._id,
            userId: String(req.user._id),
            archived: { $ne: true }
        })
            .select('title model lastMessage contextSelections updatedAt createdAt')
            .sort({ updatedAt: -1 })
            .lean();

        res.json({ success: true, conversations });
    } catch (error) {
        console.error('[RecordAI] conversations list error:', error);
        res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
});

router.post('/:recordId/conversations', async (req, res) => {
    try {
        const { record } = await loadRecordBundle(req, req.params.recordId);
        const RecordAiConversation = await tenantCollection(req, 'RecordAiConversation');
        const title = String(req.body.title || '').trim() || 'Nouvelle conversation';
        const selection = normalizeSelection(req.body.contextSelections || {});
        const engineSettings = await getRecordAiEngineSettings(req);
        const responseRuntime = resolveResponseRuntime(engineSettings);

        const conversation = await RecordAiConversation.create({
            recordId: record._id,
            entityId: record.entityId,
            userId: String(req.user._id),
            title: title.slice(0, 120),
            model: runtimeModelLabel(responseRuntime),
            contextSelections: persistableSelection(selection)
        });

        res.json({ success: true, conversation: stripDebugFromConversation(conversation) });
    } catch (error) {
        console.error('[RecordAI] create conversation error:', error);
        res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
});

router.get('/:recordId/conversations/:conversationId', async (req, res) => {
    try {
        const { record } = await loadRecordBundle(req, req.params.recordId);
        const RecordAiConversation = await tenantCollection(req, 'RecordAiConversation');
        const conversation = await RecordAiConversation.findOne({
            _id: req.params.conversationId,
            recordId: record._id,
            userId: String(req.user._id),
            archived: { $ne: true }
        }).lean();

        if (!conversation) return res.status(404).json({ success: false, error: 'Conversation introuvable' });
        res.json({ success: true, conversation: stripDebugFromConversation(conversation) });
    } catch (error) {
        console.error('[RecordAI] get conversation error:', error);
        res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
});

router.patch('/:recordId/conversations/:conversationId', async (req, res) => {
    try {
        const { record } = await loadRecordBundle(req, req.params.recordId);
        const RecordAiConversation = await tenantCollection(req, 'RecordAiConversation');
        const update = {};
        if (typeof req.body.title === 'string') update.title = req.body.title.trim().slice(0, 120) || 'Conversation';
        if (req.body.contextSelections) update.contextSelections = persistableSelection(normalizeSelection(req.body.contextSelections));

        const conversation = await RecordAiConversation.findOneAndUpdate(
            {
                _id: req.params.conversationId,
                recordId: record._id,
                userId: String(req.user._id),
                archived: { $ne: true }
            },
            { $set: update },
            { new: true }
        ).lean();

        if (!conversation) return res.status(404).json({ success: false, error: 'Conversation introuvable' });
        res.json({ success: true, conversation: stripDebugFromConversation(conversation) });
    } catch (error) {
        console.error('[RecordAI] patch conversation error:', error);
        res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
});

router.post('/:recordId/conversations/:conversationId/context', async (req, res) => {
    try {
        const { record, entity } = await loadRecordBundle(req, req.params.recordId);
        const RecordAiConversation = await tenantCollection(req, 'RecordAiConversation');
        const conversation = await RecordAiConversation.findOne({
            _id: req.params.conversationId,
            recordId: record._id,
            userId: String(req.user._id),
            archived: { $ne: true }
        });

        if (!conversation) return res.status(404).json({ success: false, error: 'Conversation introuvable' });

        const selection = normalizeSelection(req.body.contextSelections || {});
        const persistedSelection = persistableSelection(selection);
        const engineSettings = await getRecordAiEngineSettings(req);
        const engineRuntime = resolveEngineRuntime(engineSettings);
        const contextItems = await buildContextItems(req, record, entity, selection);
        const ragPreparation = await prepareRagForSelection(req, record, entity, selection, engineSettings);
        const contextFingerprint = hashText(JSON.stringify({
            selection: persistedSelection,
            embeddingConfig: ragPreparation.embeddingConfig || '',
            items: contextItems.map(item => ({ key: item.key, label: item.label })),
            rag: ragPreparation.documents.map(document => ({
                id: document.documentId,
                chunks: document.chunkCount,
                indexedAt: document.indexedAt
            }))
        }));
        const lastMessage = (conversation.messages || [])[conversation.messages.length - 1];
        const shouldAppend = !(lastMessage?.messageType === 'context' && lastMessage?.contextFingerprint === contextFingerprint);

        if (shouldAppend) {
            const contextMessage = {
                role: 'system',
                messageType: 'context',
                content: 'Contexte ajouté',
                contextSelections: persistedSelection,
                contextItems,
                contextFingerprint,
                contextStats: {
                    sections: contextItems.length,
                    chars: 0,
                    estimatedTokens: 0,
                    included: false
                },
                debugPayload: buildDebugPayload({
                    phase: 'context',
                    message: 'Contexte ajouté',
                    selection,
                    contextItems,
                    ragPreparation,
                    engineSettings,
                    engineRuntime
                }),
                createdAt: new Date()
            };
            conversation.messages = sanitizeStoredMessages([
                ...(conversation.messages || []),
                contextMessage
            ]);
            conversation.lastMessage = {
                text: `Contexte ajouté (${contextItems.length} source${contextItems.length > 1 ? 's' : ''})`,
                role: 'system',
                sentAt: contextMessage.createdAt
            };
        }

        conversation.contextSelections = persistedSelection;
        await conversation.save();

        res.json({
            success: true,
            conversation: stripDebugFromConversation(conversation),
            contextItems,
            appended: shouldAppend
        });
    } catch (error) {
        console.error('[RecordAI] add context message error:', error);
        res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
});

router.get('/:recordId/conversations/:conversationId/debug', async (req, res) => {
    try {
        if (!RECORD_AI_DEBUG_ENABLED) {
            return res.status(404).json({ success: false, error: 'Debug Record AI désactivé' });
        }
        if (!isRecordAiDebugAdmin(req)) {
            return res.status(403).json({ success: false, error: 'Debug réservé aux administrateurs' });
        }

        const { record } = await loadRecordBundle(req, req.params.recordId);
        const RecordAiConversation = await tenantCollection(req, 'RecordAiConversation');
        const conversation = await RecordAiConversation.findOne({
            _id: req.params.conversationId,
            recordId: record._id,
            userId: String(req.user._id),
            archived: { $ne: true }
        }).lean();

        if (!conversation) return res.status(404).json({ success: false, error: 'Conversation introuvable' });

        const engineSettings = await getRecordAiEngineSettings(req);
        const engineRuntime = resolveEngineRuntime(engineSettings);
        const logs = (conversation.messages || [])
            .map((message, index) => ({
                index,
                role: message.role,
                messageType: message.messageType || 'text',
                content: String(message.content || '').slice(0, 500),
                createdAt: message.createdAt,
                contextStats: message.contextStats || null,
                debugPayload: message.debugPayload || null
            }))
            .filter(entry => entry.debugPayload);

        res.json({
            success: true,
            debugEnabled: true,
            conversation: {
                id: conversation._id,
                title: conversation.title,
                model: conversation.model,
                updatedAt: conversation.updatedAt,
                contextSelections: conversation.contextSelections || {}
            },
            engineSettings,
            engineOptions: engineOptions(),
            engineRuntime,
            limits: {
                maxContextChars: MAX_CONTEXT_CHARS,
                maxFileChars: MAX_FILE_CHARS,
                maxUploadChars: MAX_UPLOAD_CHARS,
                ocrMaxPages: RECORD_AI_OCR_MAX_PAGES,
                ragEnabled: RECORD_AI_RAG_ENABLED,
                ragMaxPages: RECORD_AI_RAG_MAX_PAGES,
                ragMaxChunks: RECORD_AI_RAG_MAX_CHUNKS,
                ragMaxDocuments: RECORD_AI_RAG_MAX_DOCUMENTS,
                ragContextChars: RECORD_AI_RAG_CONTEXT_CHARS,
                vectorEnabled: engineRuntime.embedding.enabled,
                embeddingEngine: engineRuntime.embedding.engine,
                embeddingModel: engineRuntime.embedding.model,
                embeddingDimensions: engineRuntime.embedding.dimensions,
                debugTextChars: RECORD_AI_DEBUG_TEXT_CHARS
            },
            logs
        });
    } catch (error) {
        console.error('[RecordAI] debug logs error:', error);
        res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
});

router.delete('/:recordId/conversations/:conversationId', async (req, res) => {
    try {
        const { record } = await loadRecordBundle(req, req.params.recordId);
        const RecordAiConversation = await tenantCollection(req, 'RecordAiConversation');
        await RecordAiConversation.deleteOne({
            _id: req.params.conversationId,
            recordId: record._id,
            userId: String(req.user._id)
        });

        res.json({ success: true });
    } catch (error) {
        console.error('[RecordAI] delete conversation error:', error);
        res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
});

router.post('/:recordId/conversations/:conversationId/messages', async (req, res) => {
    try {
        const message = String(req.body.message || '').trim();
        if (!message) return res.status(400).json({ success: false, error: 'Message requis' });

        const { record, entity } = await loadRecordBundle(req, req.params.recordId);
        const RecordAiConversation = await tenantCollection(req, 'RecordAiConversation');
        const conversation = await RecordAiConversation.findOne({
            _id: req.params.conversationId,
            recordId: record._id,
            userId: String(req.user._id),
            archived: { $ne: true }
        });

        if (!conversation) return res.status(404).json({ success: false, error: 'Conversation introuvable' });

        const requestedSelection = normalizeSelection(req.body.contextSelections || {});
        const hasSelectedContext = selectionItemCount(requestedSelection) > 0;
        const conversationDocumentSelection = hasSelectedContext
            ? normalizeSelection({})
            : latestConversationDocumentSelection(conversation);
        const reusingConversationDocuments = !hasSelectedContext && documentSelectionItemCount(conversationDocumentSelection) > 0;
        const selection = hasSelectedContext ? requestedSelection : conversationDocumentSelection;
        const hasContextForRequest = selectionItemCount(selection) > 0;
        const contextSource = hasSelectedContext
            ? 'selected'
            : (reusingConversationDocuments ? 'conversation-documents' : 'none');
        const engineSettings = await getRecordAiEngineSettings(req);
        const engineRuntime = resolveEngineRuntime(engineSettings);
        const responseRuntime = engineRuntime.response;
        const selectedContext = hasContextForRequest
            ? await buildSelectedContext(req, record, entity, selection, { query: message, engineSettings })
            : emptySelectedContext();
        const previousResponseId = responseRuntime.engine === 'openai' ? (conversation.openAI?.responseId || null) : null;
        const contextChanged = hasContextForRequest && selectedContext.fingerprint !== conversation.contextFingerprint;
        const includeContext = Boolean(hasContextForRequest && selectedContext.text);
        const input = buildAiInput(message, includeContext ? selectedContext.text : '');
        const contextItems = hasContextForRequest ? await buildContextItems(req, record, entity, selection) : [];
        const persistedSelection = hasContextForRequest ? persistableSelection(selection) : persistableSelection({});

        const aiResult = await callRecordAI(req, {
            conversationId: conversation._id,
            recordId: record._id,
            instructions: responseRuntime.engine === 'local' || !previousResponseId ? buildInstructions(record, entity) : null,
            input,
            previousResponseId,
            engineSettings,
            historyMessages: conversation.messages || []
        });
        const aiRuntime = aiResult.runtime || responseRuntime;

        const userMessage = {
            role: 'user',
            content: message,
            contextSelections: hasContextForRequest ? persistedSelection : undefined,
            contextItems: hasContextForRequest ? contextItems : undefined,
            contextFingerprint: hasContextForRequest ? selectedContext.fingerprint : '',
            contextStats: {
                sections: selectedContext.stats.sections,
                chars: selectedContext.stats.chars,
                estimatedTokens: selectedContext.stats.estimatedTokens,
                included: includeContext
            },
            debugPayload: buildDebugPayload({
                phase: 'message',
                message,
                selection,
                selectedContext,
                input,
                previousResponseId,
                includeContext,
                contextChanged,
                contextSource,
                contextItems,
                engineSettings,
                engineRuntime
            }),
            createdAt: new Date()
        };
        const assistantMessage = {
            role: 'assistant',
            content: aiResult.content,
            createdAt: new Date()
        };

        const nextMessages = sanitizeStoredMessages([
            ...(conversation.messages || []),
            userMessage,
            assistantMessage
        ]);

        conversation.messages = nextMessages;
        conversation.model = runtimeModelLabel(aiRuntime);
        conversation.contextSelections = persistedSelection;
        conversation.contextFingerprint = hasContextForRequest ? selectedContext.fingerprint : '';
        conversation.openAI = {
            responseId: aiRuntime.engine === 'openai' ? (aiResult.responseId || '') : '',
            updatedAt: aiRuntime.engine === 'openai' && aiResult.responseId ? new Date() : null
        };
        conversation.lastMessage = {
            text: aiResult.content.slice(0, 500),
            role: 'assistant',
            sentAt: assistantMessage.createdAt
        };
        if (!conversation.title || conversation.title === 'Nouvelle conversation') {
            conversation.title = defaultConversationTitle(message);
        }
        await conversation.save();

        res.json({
            success: true,
            conversation: stripDebugFromConversation(conversation),
            assistantMessage,
            contextStats: {
                ...selectedContext.stats,
                included: includeContext
            }
        });
    } catch (error) {
        console.error('[RecordAI] send message error:', error);
        res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
});

function agentSafeString(value, max = 2000) {
    return String(value === null || value === undefined ? '' : value).trim().slice(0, max);
}

function agentEscapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function agentMarkdownToHtml(markdown) {
    const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
    const html = [];
    let list = [];

    const inline = (value) => agentEscapeHtml(value)
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');

    const flushList = () => {
        if (!list.length) return;
        html.push(`<ul>${list.map(item => `<li>${inline(item)}</li>`).join('')}</ul>`);
        list = [];
    };

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) {
            flushList();
            return;
        }

        const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
        if (heading) {
            flushList();
            const level = Math.min(3, heading[1].length + 1);
            html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
            return;
        }

        const bullet = trimmed.match(/^[-*]\s+(.+)$/);
        if (bullet) {
            list.push(bullet[1]);
            return;
        }

        flushList();
        html.push(`<p>${inline(trimmed)}</p>`);
    });

    flushList();
    return html.join('\n') || '<p></p>';
}

function agentNormalizeLabel(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function agentBuildFieldCatalog(entity = {}) {
    const standardFields = [
        { id: 'title', label: 'Titre', source: 'standard', type: 'string' },
        { id: 'description', label: 'Description', source: 'standard', type: 'text' },
        { id: 'content', label: 'Contenu', source: 'standard', type: 'text' },
        { id: 'status', label: 'Statut', source: 'standard', type: 'string' },
        { id: 'date', label: 'Date', source: 'standard', type: 'date' },
        { id: 'end_date', label: 'Date de fin / échéance', source: 'standard', type: 'date' }
    ];

    const customFields = (entity.customFields || [])
        .filter(field => field && field._id)
        .slice(0, 120)
        .map(field => ({
            id: cleanId(field._id),
            label: field.label || field.name || 'Champ',
            name: field.name || '',
            source: 'field',
            type: field.type || field.inputType || field.render?.input || 'text'
        }));

    return [...standardFields, ...customFields];
}

function agentFieldLookup(fieldCatalog = []) {
    const byId = new Map();
    const byLabel = new Map();
    fieldCatalog.forEach(field => {
        byId.set(field.id, field);
        [field.label, field.name].filter(Boolean).forEach(label => {
            const normalized = agentNormalizeLabel(label);
            if (normalized && !byLabel.has(normalized)) byLabel.set(normalized, field);
        });
    });
    return { byId, byLabel };
}

function agentResolveField(raw = {}, lookup = {}) {
    const fieldId = cleanId(raw.fieldId || raw.id || raw.key);
    if (fieldId && lookup.byId?.has(fieldId)) return lookup.byId.get(fieldId);

    const label = agentNormalizeLabel(raw.label || raw.name || raw.field || raw.fieldLabel);
    if (label && lookup.byLabel?.has(label)) return lookup.byLabel.get(label);

    if (/date|echeance|deadline|limite|remise|depot/.test(label || '')) {
        const candidates = [...(lookup.byId?.values?.() || [])];
        return candidates.find(field => /date|echeance|deadline|limite|remise|depot/.test(agentNormalizeLabel(field.label || field.name)))
            || lookup.byId?.get('end_date')
            || lookup.byId?.get('date')
            || null;
    }

    return null;
}

function agentCoerceFieldValue(value, field = {}) {
    const type = String(field.type || '').toLowerCase();
    if (value === undefined) return '';
    if (value === null || value === '') return '';

    if (['date', 'datetime', 'datetime-local'].includes(type) || ['date', 'end_date'].includes(field.id)) {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? agentSafeString(value, 500) : date;
    }

    if (['number', 'decimal', 'currency', 'float'].includes(type)) {
        const normalized = String(value).replace(/\s/g, '').replace(',', '.');
        const number = Number(normalized);
        return Number.isFinite(number) ? number : value;
    }

    if (type === 'boolean') {
        if (typeof value === 'boolean') return value;
        return ['true', '1', 'oui', 'yes', 'vrai'].includes(agentNormalizeLabel(value));
    }

    if (type === 'multiselect') {
        return Array.isArray(value) ? value.map(item => agentSafeString(item, 300)).filter(Boolean) : [agentSafeString(value, 300)].filter(Boolean);
    }

    return typeof value === 'object' ? value : agentSafeString(value, 4000);
}

function agentFormatDiffValue(value) {
    if (value === null || value === undefined || value === '') return 'Vide';
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if (Array.isArray(value)) return value.map(agentFormatDiffValue).join(', ');
    if (typeof value === 'object') return formatValue(value);
    return String(value);
}

function agentGetRecordFieldValue(record = {}, field = {}) {
    if (field.source === 'standard') return record[field.id];
    const found = (record.customFields || []).find(item => cleanId(item.field_id?._id || item.field_id) === field.id);
    return found ? found.value : undefined;
}

function agentSetRecordFieldValue(record, field = {}, value) {
    if (field.source === 'standard') {
        record[field.id] = value === '' ? null : value;
        return { existed: Object.prototype.hasOwnProperty.call(record.toObject ? record.toObject() : record, field.id) };
    }

    const index = (record.customFields || []).findIndex(item => cleanId(item.field_id?._id || item.field_id) === field.id);
    if (index >= 0) {
        record.customFields[index].value = value;
        record.markModified('customFields');
        return { existed: true };
    }

    record.customFields = record.customFields || [];
    record.customFields.push({ field_id: field.id, value });
    record.markModified('customFields');
    return { existed: false };
}

function agentRestoreRecordFieldValue(record, field = {}, inverse = {}) {
    if (field.source === 'standard') {
        record[field.id] = inverse.beforeValue === undefined ? null : inverse.beforeValue;
        return;
    }

    const index = (record.customFields || []).findIndex(item => cleanId(item.field_id?._id || item.field_id) === field.id);
    if (inverse.existed === false) {
        if (index >= 0) record.customFields.splice(index, 1);
        record.markModified('customFields');
        return;
    }

    if (index >= 0) {
        record.customFields[index].value = inverse.beforeValue;
    } else {
        record.customFields = record.customFields || [];
        record.customFields.push({ field_id: field.id, value: inverse.beforeValue });
    }
    record.markModified('customFields');
}

function agentTryParseJsonCandidate(candidate) {
    const clean = String(candidate || '').trim().replace(/^\uFEFF/, '');
    if (!clean) return null;

    try {
        const parsed = JSON.parse(clean);
        if (typeof parsed === 'string') return agentTryParseJsonCandidate(parsed) || parsed;
        return parsed;
    } catch (_) {
        return null;
    }
}

function agentBalancedJsonCandidate(raw) {
    const text = String(raw || '');
    const start = text.indexOf('{');
    if (start < 0) return '';

    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let index = start; index < text.length; index += 1) {
        const char = text[index];
        if (escaped) {
            escaped = false;
            continue;
        }
        if (char === '\\') {
            escaped = true;
            continue;
        }
        if (char === '"') {
            inString = !inString;
            continue;
        }
        if (inString) continue;
        if (char === '{') depth += 1;
        if (char === '}') {
            depth -= 1;
            if (depth === 0) return text.slice(start, index + 1);
        }
    }

    return '';
}

function agentExtractJson(text) {
    const raw = String(text || '').trim();
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidates = [
        raw,
        fenced?.[1],
        agentBalancedJsonCandidate(raw),
        raw.includes('{') && raw.includes('}') ? raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1) : ''
    ].filter(Boolean);

    for (const candidate of candidates) {
        const parsed = agentTryParseJsonCandidate(candidate);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;

        const unescaped = String(candidate || '').replace(/\\"/g, '"').replace(/\\n/g, '\n');
        const reparsed = agentTryParseJsonCandidate(unescaped);
        if (reparsed && typeof reparsed === 'object' && !Array.isArray(reparsed)) return reparsed;
    }

    throw new Error('Réponse agent JSON introuvable');
}

function agentFallbackTextFromAiContent(value) {
    const raw = String(value || '').trim();
    if (!raw) return 'Réponse IA non structurée.';

    const parsed = agentTryParseJsonCandidate(raw) ||
        agentTryParseJsonCandidate(agentBalancedJsonCandidate(raw));
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const noteAction = Array.isArray(parsed.actions)
            ? parsed.actions.find(action => action?.tool === 'create_note')
            : null;
        const noteInput = noteAction?.input || noteAction || {};
        const noteContent = noteInput.contentMarkdown || noteInput.markdown || noteInput.content;
        if (noteContent) return String(noteContent).trim();
        if (parsed.summary) return String(parsed.summary).trim();
    }

    return raw;
}

function agentToolLabel(tool) {
    if (tool === 'create_note') return 'Créer une note';
    if (tool === 'update_note') return 'Modifier une note';
    if (tool === 'create_doc') return 'Créer un document';
    if (tool === 'update_doc') return 'Modifier un document';
    if (tool === 'generate_doc' || tool === 'use_template') return 'Générer un document';
    if (tool === 'update_fiche') return 'Mettre à jour la fiche';
    if (tool === 'create_task') return 'Créer une tâche';
    if (tool === 'update_task') return 'Modifier une tâche';
    if (tool === 'create_event') return 'Créer un événement';
    if (tool === 'update_event') return 'Modifier un événement';
    return tool;
}

function agentCanonicalTool(tool) {
    const value = String(tool || '').trim();
    if (value === 'use_template') return 'generate_doc';
    return value;
}

function agentToolLookup(toolCatalog = {}) {
    const notes = Array.isArray(toolCatalog.notes) ? toolCatalog.notes : [];
    const templates = Array.isArray(toolCatalog.templates) ? toolCatalog.templates : [];
    const tasks = Array.isArray(toolCatalog.tasks) ? toolCatalog.tasks : [];
    const documents = Array.isArray(toolCatalog.documents) ? toolCatalog.documents : [];
    const events = Array.isArray(toolCatalog.events) ? toolCatalog.events : [];
    const noteById = new Map(notes.map(note => [cleanId(note.id), note]));
    const noteByTitle = new Map(notes.map(note => [agentNormalizeLabel(note.title), note]));
    const templateById = new Map(templates.map(template => [cleanId(template.id), template]));
    const templateByName = new Map(templates.map(template => [agentNormalizeLabel(template.name), template]));
    const taskById = new Map(tasks.map(task => [cleanId(task.id), task]));
    const taskByTitle = new Map(tasks.map(task => [agentNormalizeLabel(task.title), task]));
    const documentById = new Map(documents.map(document => [cleanId(document.id), document]));
    const documentByName = new Map(documents.map(document => [agentNormalizeLabel(document.name), document]));
    const eventById = new Map(events.map(event => [cleanId(event.id), event]));
    const eventByTitle = new Map(events.map(event => [agentNormalizeLabel(event.title), event]));
    return {
        notes,
        templates,
        tasks,
        documents,
        events,
        noteById,
        noteByTitle,
        templateById,
        templateByName,
        taskById,
        taskByTitle,
        documentById,
        documentByName,
        eventById,
        eventByTitle
    };
}

function agentResolveNoteRef(input = {}, lookup = {}) {
    const id = cleanId(input.noteId || input.id || input.targetId);
    if (id && lookup.noteById?.has(id)) return lookup.noteById.get(id);
    const title = agentNormalizeLabel(input.noteTitle || input.title || input.targetTitle || input.name);
    if (title && lookup.noteByTitle?.has(title)) return lookup.noteByTitle.get(title);
    return id ? { id, title: input.noteTitle || input.title || 'Note' } : null;
}

function agentResolveTemplateRef(input = {}, lookup = {}) {
    const id = cleanId(input.templateId || input.smartDocId || input.id);
    if (id && lookup.templateById?.has(id)) return lookup.templateById.get(id);
    const name = agentNormalizeLabel(input.templateName || input.name || input.title);
    if (name && lookup.templateByName?.has(name)) return lookup.templateByName.get(name);
    return id ? { id, name: input.templateName || input.name || 'Template' } : null;
}

function agentGoalMentionsDocumentSource(goal) {
    const text = normalizeSearchText(goal);
    if (!text) return false;
    const templateReferenceOnly = /\b(a partir|depuis|selon)\b.*\b(template|modele|smartdoc)\b/.test(text)
        && !/\b(doc|document|pdf|fichier|piece jointe|ocr|image|photo|cahier des charges|csc|dce)\b/.test(text);
    if (templateReferenceOnly) return false;
    return [
        /\b(analyse|analyser|resume|resumer|synthese|synthetise|extrais|extraire|extrait|extraits)\b/,
        /\b(cherche|trouve|identifie|verifie|controle|compare|audit|explique)\b/,
        /\b(a partir|depuis|selon|d apres|sur la base|avec le contexte|dans le contexte)\b/,
        /\b(du doc|du document|du pdf|du fichier|des docs|des documents|piece jointe|pieces jointes|ocr|image|photo)\b/,
        /\b(cahier des charges|csc|dce|appel d offre|chapitre|page|pages|annexe|lot|lots)\b/
    ].some(pattern => pattern.test(text));
}

function agentGoalLooksTemplateGeneration(goal) {
    const text = normalizeSearchText(goal);
    if (!text || agentGoalMentionsDocumentSource(text)) return false;

    const generationVerb = /\b(genere|generer|generez|cree|creer|creez|prepare|preparer|preparez|produis|produire|sort|sors|faire|fais|edite|editer)\b/.test(text);
    const templateTarget = /\b(facture|devis|contrat|attestation|bon de commande|commande|offre|proposition|document|doc|pdf|modele|template|smartdoc)\b/.test(text);
    const typedDocumentTarget = /\b(facture|devis|contrat|attestation|bon de commande|commande|offre|proposition|modele|template|smartdoc)\b/.test(text);
    const demoFreeDocument = /\b(demo|demonstration|lorem|ipsum|exemple|placeholder|fictif|fictive)\b/.test(text) && !typedDocumentTarget;
    if (demoFreeDocument) return false;
    return generationVerb && templateTarget;
}

function agentTemplateGoalScore(goal, template = {}) {
    const goalText = normalizeSearchText(goal);
    const templateText = normalizeSearchText(`${template.name || ''} ${template.description || ''}`);
    if (!goalText || !templateText) return 0;

    let score = 0;
    const goalTokens = new Set(tokenizeSearch(goalText));
    const templateTokens = new Set(tokenizeSearch(templateText));
    goalTokens.forEach(token => {
        if (templateTokens.has(token)) score += 12;
        else if (templateText.includes(token)) score += 5;
    });

    const exactName = normalizeSearchText(template.name || '');
    if (exactName && goalText.includes(exactName)) score += 90;

    const semanticPairs = [
        [/(\bfacture\b|\binvoice\b|\bbill\b)/, /(\bfacture\b|\binvoice\b|\bbill\b)/],
        [/(\bdevis\b|\boffre\b|\bproposition\b|\bquotation\b)/, /(\bdevis\b|\boffre\b|\bproposition\b|\bquotation\b)/],
        [/(\bcontrat\b|\bconvention\b|\bagreement\b)/, /(\bcontrat\b|\bconvention\b|\bagreement\b)/],
        [/(\battestation\b|\bcertificat\b|\bcertificate\b)/, /(\battestation\b|\bcertificat\b|\bcertificate\b)/],
        [/(\bbon de commande\b|\bcommande\b|\border\b)/, /(\bbon de commande\b|\bcommande\b|\border\b)/]
    ];
    semanticPairs.forEach(([goalPattern, templatePattern]) => {
        if (goalPattern.test(goalText) && templatePattern.test(templateText)) score += 70;
    });

    return score;
}

function agentBestTemplateForGoal(goal, toolCatalog = {}) {
    if (!agentGoalLooksTemplateGeneration(goal)) return null;
    const templates = Array.isArray(toolCatalog.templates) ? toolCatalog.templates : [];
    if (!templates.length) return null;

    const ranked = templates
        .map(template => ({ template, score: agentTemplateGoalScore(goal, template) }))
        .sort((a, b) => b.score - a.score);
    const best = ranked[0];
    if (!best) return null;

    const genericTemplateMention = /\b(template|modele|smartdoc)\b/.test(normalizeSearchText(goal));
    if (best.score >= 35 || (genericTemplateMention && templates.length === 1 && best.score >= 8)) {
        return best.template;
    }
    return null;
}

function agentEnsureTemplateGenerationActions(actions = [], goal = '', parsed = {}, toolCatalog = {}) {
    if ((actions || []).some(action => action.tool === 'generate_doc')) return actions;

    const template = agentBestTemplateForGoal(goal, toolCatalog);
    if (!template?.id) return actions;

    const createDocIndex = (actions || []).findIndex(action => action.tool === 'create_doc');
    const sourceAction = createDocIndex >= 0 ? actions[createDocIndex] : null;
    const outputName = agentSafeString(
        sourceAction?.input?.name || parsed?.outputName || '',
        180
    );
    const forcedAction = {
        id: sourceAction?.id || `act_${crypto.randomBytes(6).toString('hex')}`,
        tool: 'generate_doc',
        title: sourceAction?.title || `Générer ${template.name || 'le document'}`,
        description: agentSafeString(
            sourceAction?.description || `Utiliser le template "${template.name || 'SmartDoc'}" disponible pour cette fiche.`,
            500
        ),
        status: 'proposed',
        input: {
            templateId: cleanId(template.id),
            templateName: template.name || '',
            variables: {},
            outputName,
            outputMode: 'draft'
        },
        preview: {
            title: outputName || template.name || 'Template',
            excerpt: 'Variables auto depuis la fiche et le template',
            meta: 'Template SmartDoc'
        },
        diff: null
    };

    if (createDocIndex >= 0) {
        const nextActions = [...actions];
        nextActions[createDocIndex] = forcedAction;
        return nextActions.slice(0, 10);
    }

    return [forcedAction, ...(actions || [])].slice(0, 10);
}

function agentResolveTaskRef(input = {}, lookup = {}) {
    const id = cleanId(input.taskId || input.id || input.targetId);
    if (id && lookup.taskById?.has(id)) return lookup.taskById.get(id);
    const title = agentNormalizeLabel(input.taskTitle || input.title || input.targetTitle || input.name);
    if (title && lookup.taskByTitle?.has(title)) return lookup.taskByTitle.get(title);
    return id ? { id, title: input.taskTitle || input.title || 'Tâche' } : null;
}

function agentResolveDocumentRef(input = {}, lookup = {}) {
    const id = cleanId(input.documentId || input.docId || input.id || input.targetId);
    if (id && lookup.documentById?.has(id)) return lookup.documentById.get(id);
    const name = agentNormalizeLabel(input.documentName || input.docName || input.name || input.title || input.targetTitle);
    if (name && lookup.documentByName?.has(name)) return lookup.documentByName.get(name);
    return id ? { id, name: input.documentName || input.name || 'Document' } : null;
}

function agentResolveEventRef(input = {}, lookup = {}) {
    const id = cleanId(input.eventId || input.id || input.targetId);
    if (id && lookup.eventById?.has(id)) return lookup.eventById.get(id);
    const title = agentNormalizeLabel(input.eventTitle || input.title || input.targetTitle || input.name);
    if (title && lookup.eventByTitle?.has(title)) return lookup.eventByTitle.get(title);
    return id ? { id, title: input.eventTitle || input.title || 'Événement' } : null;
}

function agentObjectInput(value = {}) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function agentResolveCatalogOption(value, options = []) {
    const raw = cleanId(value);
    if (!raw) return null;
    const normalized = agentNormalizeLabel(raw);
    return options.find(option => {
        const optionId = cleanId(option.id || option._id || option.optionId);
        const optionValue = cleanId(option.value);
        const optionLabel = cleanId(option.label || option.name);
        return optionId === raw
            || optionValue === raw
            || agentNormalizeLabel(optionLabel) === normalized
            || agentNormalizeLabel(optionValue) === normalized;
    }) || null;
}

function agentNormalizeEventType(value, toolCatalog = {}) {
    const option = agentResolveCatalogOption(value, toolCatalog.eventTypes || []);
    if (option) return option.value || option.label || 'autre';
    const normalized = agentNormalizeLabel(value);
    if (!normalized) return 'autre';
    if (/reunion|meeting/.test(normalized)) return 'reunion';
    if (/rappel|relance|reminder/.test(normalized)) return 'rappel';
    if (/tache|task|action/.test(normalized)) return 'tache';
    if (/consultation/.test(normalized)) return 'consultation';
    if (/personnel|personal/.test(normalized)) return 'personnel';
    return 'autre';
}

function agentNormalizeEventStatus(input = {}, toolCatalog = {}) {
    const option = agentResolveCatalogOption(
        input.statusOptionId || input.statusId || input.status || input.statusLabel,
        toolCatalog.eventStatuses || []
    );
    if (!option) return { statusOptionId: cleanId(input.statusOptionId || input.statusId), status: agentSafeString(input.status || input.statusLabel || '', 80) };
    return {
        statusOptionId: cleanId(option.id || option._id || option.optionId),
        status: option.label || input.status || ''
    };
}

function agentNormalizeEventDate(value) {
    if (value === undefined || value === null || value === '') return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? agentSafeString(value, 80) : date.toISOString();
}

function agentNormalizeEventInput(input = {}, toolCatalog = {}, { requireTitle = true } = {}) {
    const title = agentSafeString(input.title || input.name || input.eventTitle || '', 180);
    if (requireTitle && !title) return null;

    const durationRaw = input.duration ?? input.durationMinutes ?? input.duree ?? input.duree_evenement;
    const duration = durationRaw === undefined || durationRaw === ''
        ? ''
        : Math.min(1440, Math.max(0, parseInt(durationRaw, 10) || 0));
    const status = agentNormalizeEventStatus(input, toolCatalog);
    const fields = {};
    if (title) fields.title = title;
    if (input.date !== undefined || input.startDate !== undefined || input.start !== undefined) {
        fields.date = agentNormalizeEventDate(input.date || input.startDate || input.start);
    }
    if (input.endDate !== undefined || input.end !== undefined) {
        fields.endDate = agentNormalizeEventDate(input.endDate || input.end);
    }
    if (duration !== '') fields.duration = duration || 30;
    if (input.type !== undefined || input.eventType !== undefined) fields.type = agentNormalizeEventType(input.type || input.eventType, toolCatalog);
    if (input.lieu !== undefined || input.location !== undefined || input.address !== undefined || input.place !== undefined) {
        fields.lieu = agentSafeString(input.lieu || input.location || input.address || input.place || '', 500);
    }
    if (input.notes !== undefined || input.description !== undefined || input.content !== undefined) {
        fields.notes = agentSafeString(input.notes || input.description || input.content || '', 4000);
    }
    if (status.statusOptionId) fields.statusOptionId = status.statusOptionId;
    if (status.status) fields.status = status.status;

    return fields;
}

function agentNormalizeActions(parsed = {}, record = {}, fieldCatalog = [], toolCatalog = {}) {
    const lookup = agentFieldLookup(fieldCatalog);
    const toolLookup = agentToolLookup(toolCatalog);
    const rawActions = Array.isArray(parsed.actions) ? parsed.actions : [];
    const actions = [];

    rawActions.slice(0, 10).forEach((raw, index) => {
        const tool = agentCanonicalTool(raw.tool || raw.type || '');
        const id = `act_${crypto.randomBytes(6).toString('hex')}`;

        if (tool === 'create_note') {
            const input = raw.input || raw;
            const title = agentSafeString(input.title || raw.title || 'Note IA', 140) || 'Note IA';
            const contentMarkdown = agentSafeString(input.contentMarkdown || input.markdown || input.content || raw.content || '', 20000);
            if (!contentMarkdown) return;
            actions.push({
                id,
                tool,
                title: raw.title || agentToolLabel(tool),
                description: agentSafeString(raw.description || `Créer la note "${title}"`, 500),
                status: 'proposed',
                input: { title, contentMarkdown },
                preview: {
                    title,
                    excerpt: shortPlainText(contentMarkdown, 520)
                },
                diff: null
            });
            return;
        }

        if (tool === 'update_note') {
            const input = agentObjectInput(raw.input || raw);
            const note = agentResolveNoteRef(input, toolLookup);
            if (!note?.id) return;
            const nextTitle = input.title !== undefined ? agentSafeString(input.title, 140) : '';
            const contentMarkdown = input.contentMarkdown !== undefined || input.markdown !== undefined || input.content !== undefined
                ? agentSafeString(input.contentMarkdown || input.markdown || input.content || '', 30000)
                : '';
            const mode = ['replace', 'append'].includes(String(input.mode || '').toLowerCase())
                ? String(input.mode).toLowerCase()
                : 'replace';
            if (!nextTitle && !contentMarkdown) return;
            actions.push({
                id,
                tool,
                title: raw.title || agentToolLabel(tool),
                description: agentSafeString(raw.description || `Modifier la note "${note.title || note.id}"`, 500),
                status: 'proposed',
                input: {
                    noteId: cleanId(note.id),
                    title: nextTitle,
                    contentMarkdown,
                    mode
                },
                preview: {
                    title: nextTitle || note.title || 'Note',
                    excerpt: contentMarkdown ? shortPlainText(contentMarkdown, 520) : 'Titre uniquement',
                    target: note.title || note.id,
                    mode
                },
                diff: [
                    ...(nextTitle ? [{
                        fieldId: `note:${note.id}:title`,
                        label: `Note "${note.title || note.id}"`,
                        before: note.title || '',
                        after: nextTitle,
                        reason: agentSafeString(input.reason || raw.description || '', 400)
                    }] : []),
                    ...(contentMarkdown ? [{
                        fieldId: `note:${note.id}:content`,
                        label: 'Contenu de la note',
                        before: note.preview || '',
                        after: shortPlainText(contentMarkdown, 180),
                        reason: mode === 'append' ? 'Ajout au contenu existant' : 'Remplacement du contenu'
                    }] : [])
                ]
            });
            return;
        }

        if (tool === 'create_doc') {
            const input = agentObjectInput(raw.input || raw);
            const name = agentSafeString(input.name || input.title || raw.title || 'Document IA', 160) || 'Document IA';
            const contentMarkdown = agentSafeString(input.contentMarkdown || input.markdown || input.content || '', 40000);
            const contentHtml = agentSafeString(input.contentHtml || input.html || '', 60000);
            if (!contentMarkdown && !contentHtml) return;
            actions.push({
                id,
                tool,
                title: raw.title || agentToolLabel(tool),
                description: agentSafeString(raw.description || `Créer le document "${name}"`, 500),
                status: 'proposed',
                input: {
                    name,
                    contentMarkdown,
                    contentHtml,
                    format: ['A4', 'A5', 'A3', 'Letter', 'Legal'].includes(input.format) ? input.format : 'A4',
                    orientation: ['portrait', 'landscape'].includes(input.orientation) ? input.orientation : 'portrait'
                },
                preview: {
                    title: name,
                    excerpt: shortPlainText(contentHtml || contentMarkdown, 520),
                    meta: 'Document brouillon'
                },
                diff: null
            });
            return;
        }

        if (tool === 'update_doc') {
            const input = agentObjectInput(raw.input || raw);
            const document = agentResolveDocumentRef(input, toolLookup);
            if (!document?.id) return;
            const name = input.name !== undefined || input.title !== undefined
                ? agentSafeString(input.name || input.title || '', 160)
                : '';
            const contentMarkdown = input.contentMarkdown !== undefined || input.markdown !== undefined || input.content !== undefined
                ? agentSafeString(input.contentMarkdown || input.markdown || input.content || '', 40000)
                : '';
            const contentHtml = input.contentHtml !== undefined || input.html !== undefined
                ? agentSafeString(input.contentHtml || input.html || '', 60000)
                : '';
            const mode = ['replace', 'append'].includes(String(input.mode || '').toLowerCase())
                ? String(input.mode).toLowerCase()
                : 'replace';
            if (!name && !contentMarkdown && !contentHtml) return;
            actions.push({
                id,
                tool,
                title: raw.title || agentToolLabel(tool),
                description: agentSafeString(raw.description || `Modifier le document "${document.name || document.id}"`, 500),
                status: 'proposed',
                input: {
                    documentId: cleanId(document.id),
                    name,
                    contentMarkdown,
                    contentHtml,
                    mode
                },
                preview: {
                    title: name || document.name || 'Document',
                    excerpt: shortPlainText(contentHtml || contentMarkdown || 'Nom uniquement', 520),
                    target: document.name || document.id,
                    meta: mode === 'append' ? 'Ajout au document' : 'Remplacement du contenu'
                },
                diff: [
                    ...(name ? [{
                        fieldId: `doc:${document.id}:name`,
                        label: `Document "${document.name || document.id}"`,
                        before: document.name || '',
                        after: name,
                        reason: agentSafeString(input.reason || raw.description || '', 400)
                    }] : []),
                    ...((contentMarkdown || contentHtml) ? [{
                        fieldId: `doc:${document.id}:content`,
                        label: 'Contenu du document',
                        before: document.preview || '',
                        after: shortPlainText(contentHtml || contentMarkdown, 180),
                        reason: mode === 'append' ? 'Ajout au contenu existant' : 'Remplacement du contenu'
                    }] : [])
                ]
            });
            return;
        }

        if (tool === 'generate_doc') {
            const input = agentObjectInput(raw.input || raw);
            const template = agentResolveTemplateRef(input, toolLookup);
            if (!template?.id) return;
            const variables = agentObjectInput(input.variables || input.inputs || {});
            const outputName = agentSafeString(input.outputName || input.name || '', 180);
            actions.push({
                id,
                tool,
                title: raw.title || agentToolLabel(tool),
                description: agentSafeString(raw.description || `Créer un brouillon depuis le template "${template.name || template.id}"`, 500),
                status: 'proposed',
                input: {
                    templateId: cleanId(template.id),
                    templateName: template.name || '',
                    variables,
                    outputName,
                    outputMode: 'draft'
                },
                preview: {
                    title: outputName || template.name || 'Template',
                    excerpt: `${Object.keys(variables).length} variable${Object.keys(variables).length > 1 ? 's' : ''}`,
                    meta: 'Template SmartDoc'
                },
                diff: null
            });
            return;
        }

        if (tool === 'update_fiche') {
            const input = raw.input || raw;
            const rawFields = Array.isArray(input.fields)
                ? input.fields
                : [{ fieldId: input.fieldId || input.id, label: input.label, value: input.value, reason: input.reason }];
            const fields = [];
            const diff = [];

            rawFields.slice(0, 12).forEach(fieldPatch => {
                const field = agentResolveField(fieldPatch, lookup);
                if (!field) return;
                const value = agentCoerceFieldValue(fieldPatch.value ?? fieldPatch.newValue, field);
                if (value === undefined) return;
                const beforeValue = agentGetRecordFieldValue(record, field);
                fields.push({
                    fieldId: field.id,
                    label: field.label || field.name || field.id,
                    value,
                    reason: agentSafeString(fieldPatch.reason || fieldPatch.source || '', 600),
                    confidence: Math.max(0, Math.min(1, Number(fieldPatch.confidence || 0.7)))
                });
                diff.push({
                    fieldId: field.id,
                    label: field.label || field.name || field.id,
                    before: agentFormatDiffValue(beforeValue),
                    after: agentFormatDiffValue(value),
                    reason: agentSafeString(fieldPatch.reason || '', 600)
                });
            });

            if (!fields.length) return;
            actions.push({
                id,
                tool,
                title: raw.title || agentToolLabel(tool),
                description: agentSafeString(raw.description || `${fields.length} champ${fields.length > 1 ? 's' : ''} à enrichir`, 500),
                status: 'proposed',
                input: { fields },
                preview: { count: fields.length },
                diff
            });
            return;
        }

        if (tool === 'create_task') {
            const input = raw.input || raw;
            const title = agentSafeString(input.title || raw.title || '', 180);
            if (!title) return;
            const dueDate = input.dueDate || input.date || null;
            const listTitle = agentSafeString(input.listTitle || input.listName || input.taskList || input.project || '', 90);
            actions.push({
                id,
                tool,
                title: raw.title || agentToolLabel(tool),
                description: agentSafeString(raw.description || title, 500),
                status: 'proposed',
                input: {
                    title,
                    description: agentSafeString(input.description || '', 4000),
                    dueDate: dueDate ? agentSafeString(dueDate, 80) : '',
                    priority: ['Aucune', 'Basse', 'Moyenne', 'Haute', 'Urgente'].includes(input.priority) ? input.priority : 'Moyenne',
                    listTitle
                },
                preview: { title, dueDate: dueDate || '', meta: listTitle ? `Liste: ${listTitle}` : '' },
                diff: null
            });
            return;
        }

        if (tool === 'update_task') {
            const input = agentObjectInput(raw.input || raw);
            const task = agentResolveTaskRef(input, toolLookup);
            if (!task?.id) return;
            const fields = {};
            if (input.title !== undefined) fields.title = agentSafeString(input.title, 180);
            if (input.description !== undefined) fields.description = agentSafeString(input.description, 4000);
            if (input.status !== undefined) fields.status = agentSafeString(input.status, 80);
            if (input.priority !== undefined && ['Aucune', 'Basse', 'Moyenne', 'Haute', 'Urgente'].includes(input.priority)) fields.priority = input.priority;
            if (input.dueDate !== undefined || input.date !== undefined) fields.dueDate = agentSafeString(input.dueDate || input.date || '', 80);
            if (!Object.keys(fields).length) return;
            actions.push({
                id,
                tool,
                title: raw.title || agentToolLabel(tool),
                description: agentSafeString(raw.description || `Modifier la tâche "${task.title || task.id}"`, 500),
                status: 'proposed',
                input: { taskId: cleanId(task.id), fields },
                preview: {
                    title: fields.title || task.title || 'Tâche',
                    excerpt: fields.description || fields.status || fields.priority || fields.dueDate || '',
                    meta: 'Mise à jour tâche'
                },
                diff: Object.entries(fields).map(([key, value]) => ({
                    fieldId: `task:${task.id}:${key}`,
                    label: `Tâche: ${key}`,
                    before: task[key] || '',
                    after: value,
                    reason: agentSafeString(input.reason || raw.description || '', 400)
                }))
            });
            return;
        }

        if (tool === 'create_event') {
            const input = agentObjectInput(raw.input || raw);
            const fields = agentNormalizeEventInput(input, toolCatalog, { requireTitle: true });
            if (!fields?.title) return;
            if (!fields.date) fields.date = new Date().toISOString();
            if (!fields.duration && !fields.endDate) fields.duration = 30;
            actions.push({
                id,
                tool,
                title: raw.title || agentToolLabel(tool),
                description: agentSafeString(raw.description || `Créer l’événement "${fields.title}"`, 500),
                status: 'proposed',
                input: fields,
                preview: {
                    title: fields.title,
                    excerpt: [fields.date, fields.lieu, fields.type].filter(Boolean).join(' · '),
                    meta: 'Agenda'
                },
                diff: null
            });
            return;
        }

        if (tool === 'update_event') {
            const input = agentObjectInput(raw.input || raw);
            const event = agentResolveEventRef(input, toolLookup);
            if (!event?.id) return;
            const fields = agentNormalizeEventInput(input.fields || input, toolCatalog, { requireTitle: false });
            if (!fields || !Object.keys(fields).length) return;
            actions.push({
                id,
                tool,
                title: raw.title || agentToolLabel(tool),
                description: agentSafeString(raw.description || `Modifier l’événement "${event.title || event.id}"`, 500),
                status: 'proposed',
                input: { eventId: cleanId(event.id), fields },
                preview: {
                    title: fields.title || event.title || 'Événement',
                    excerpt: [fields.date, fields.endDate, fields.lieu, fields.status, fields.type].filter(Boolean).join(' · '),
                    target: event.title || event.id,
                    meta: 'Agenda'
                },
                diff: Object.entries(fields).map(([key, value]) => ({
                    fieldId: `event:${event.id}:${key}`,
                    label: `Événement: ${key}`,
                    before: event[key] || '',
                    after: value,
                    reason: agentSafeString(input.reason || raw.description || '', 400)
                }))
            });
        }
    });

    if (!actions.length && parsed.summary) {
        actions.push({
            id: `act_${crypto.randomBytes(6).toString('hex')}`,
            tool: 'create_note',
            title: 'Créer une note',
            description: 'Créer une note avec la synthèse produite par l’agent',
            status: 'proposed',
            input: {
                title: 'Analyse IA',
                contentMarkdown: agentSafeString(parsed.summary, 12000)
            },
            preview: {
                title: 'Analyse IA',
                excerpt: shortPlainText(parsed.summary, 520)
            },
            diff: null
        });
    }

    return actions;
}

function shortPlainText(value, max = 220) {
    const text = stripHtml(String(value || '')).replace(/\s+/g, ' ').trim();
    return text.length > max ? `${text.slice(0, max)}...` : text;
}

function agentNormalizePlan(parsed = {}) {
    const rawSteps = Array.isArray(parsed.steps) ? parsed.steps : (Array.isArray(parsed.plan?.steps) ? parsed.plan.steps : []);
    const steps = rawSteps.slice(0, 8).map((step, index) => ({
        id: agentSafeString(step.id || `step_${index + 1}`, 60),
        type: agentSafeString(step.type || 'analysis', 60),
        title: agentSafeString(step.title || step.label || `Étape ${index + 1}`, 180),
        detail: agentSafeString(step.detail || step.description || '', 600),
        status: ['pending', 'ready', 'done', 'skipped', 'failed'].includes(step.status) ? step.status : 'ready'
    }));

    return {
        title: agentSafeString(parsed.plan?.title || parsed.title || 'Plan agent', 160) || 'Plan agent',
        steps: steps.length ? steps : [
            { id: 'step_1', type: 'analysis', title: 'Analyser le contexte record', detail: '', status: 'ready' },
            { id: 'step_2', type: 'tools', title: 'Préparer les actions', detail: '', status: 'ready' },
            { id: 'step_3', type: 'review', title: 'Attendre validation', detail: '', status: 'ready' }
        ]
    };
}

function agentGoalHasContextKeyword(goal) {
    const text = normalizeSearchText(goal);
    if (!text) return false;
    return [
        /\b(analyse|analyser|resume|resumer|synthese|synthetise|extrais|extraire|extrait|extraits)\b/,
        /\b(cherche|trouve|identifie|verifie|controle|compare|audit|explique)\b/,
        /\b(document|documents|doc|docs|pdf|fichier|fichiers|image|photo|ocr|piece jointe|pieces jointes)\b/,
        /\b(cahier des charges|csc|dce|appel d offre|marche|soumission|soumettre|eligible|eligibilite)\b/,
        /\b(facture|devis|contrat|cin|registre|annexe|chapitre|page|pages|lot|lots)\b/,
        /\b(condition|conditions|critere|criteres|delai|deadline|echeance|date limite|adresse|montant|budget)\b/,
        /\b(enrichis|enrichir|complete|completer|remplis|mettre a jour|mets a jour)\b/,
        /\b(a partir|depuis|selon|dans le contexte|avec le contexte|source|sources)\b/
    ].some(pattern => pattern.test(text));
}

function agentGoalNeedsFullContext(goal) {
    const text = normalizeSearchText(goal);
    if (!text || agentGoalLooksStandalone(text)) return false;
    if (agentGoalLooksTemplateGeneration(text)) return false;

    return agentGoalHasContextKeyword(text);
}

function agentGoalLooksStandalone(goal) {
    const text = normalizeSearchText(goal);
    if (!text) return false;
    const explicitStandalone = [
        /\b(demo|demonstration|lorem|ipsum|test|exemple|exemples|fictif|fictive|placeholder)\b/,
        /\b(contenu|texte|paragraphe)\b.*\b(demo|test|exemple|lorem|ipsum)\b/,
        /\bcree[rz]?\b.*\b(note|tache|task)\b.*\b(sans contexte|sans document|vide)\b/
    ].some(pattern => pattern.test(text));
    if (explicitStandalone) return true;

    const lightweightAction = /\b(note|tache|task)\b.*\b(simple|rapide|courte|petit|petite)\b/.test(text);
    return lightweightAction && !agentGoalHasContextKeyword(text);
}

function agentGoalShouldUseDocuments(goal) {
    const text = normalizeSearchText(goal);
    if (!text || agentGoalLooksStandalone(text)) return false;
    if (agentGoalLooksTemplateGeneration(text)) return false;

    return [
        /\b(document|documents|doc|docs|pdf|fichier|fichiers|image|photo|ocr|piece jointe|pieces jointes)\b/,
        /\b(cahier des charges|csc|dce|appel d offre|marche|soumission|soumettre|eligible|eligibilite)\b/,
        /\b(facture|devis|contrat|cin|registre|annexe|chapitre|page|pages|lot|lots)\b/,
        /\b(condition|conditions|critere|criteres|delai|deadline|echeance|date limite|adresse|montant|budget)\b/
    ].some(pattern => pattern.test(text));
}

function agentGoalShouldUseNotes(goal) {
    const text = normalizeSearchText(goal);
    if (!text || agentGoalLooksStandalone(text)) return false;
    return /\b(note|notes|synthese|historique|resume)\b/.test(text);
}

function agentGoalMentionsDrive(goal) {
    const text = normalizeSearchText(goal);
    return /\b(drive|dossier drive|fichier drive|document drive|dans drive|sur drive)\b/.test(text);
}

function agentFileGoalScore(goal, file = {}) {
    const goalText = normalizeSearchText(goal);
    if (!goalText) return 0;

    const name = String(file.name || file.filename || '').replace(/\.[a-z0-9]{1,8}$/i, '');
    const folder = String(file.folder || '');
    const fileText = normalizeSearchText(`${name} ${folder}`);
    if (!fileText) return 0;

    const goalTokens = new Set(tokenizeSearch(goalText));
    const fileTokens = tokenizeSearch(fileText)
        .filter(token => token.length >= 3 && !['pdf', 'jpg', 'jpeg', 'png', 'webp', 'doc', 'docx', 'xls', 'xlsx'].includes(token));
    const matchedTokens = fileTokens.filter(token => goalTokens.has(token));
    let score = 0;

    if (goalText.includes(fileText) || fileText.includes(goalText)) score += 120;
    if (matchedTokens.length) score += matchedTokens.length * 14;
    if (matchedTokens.length >= Math.min(2, fileTokens.length)) score += 45;
    if (matchedTokens.some(token => token.length >= 5)) score += 12;
    if (file.source === 'drive' && agentGoalMentionsDrive(goal)) score += 8;

    return score;
}

function agentRelevantFilesForGoal(goal, files = [], max = RECORD_AI_RAG_MAX_DOCUMENTS) {
    return (files || [])
        .map(file => ({ file, score: agentFileGoalScore(goal, file) }))
        .filter(item => item.score >= 20)
        .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            const aDate = new Date(a.file.uploadedAt || 0).getTime() || 0;
            const bDate = new Date(b.file.uploadedAt || 0).getTime() || 0;
            return bDate - aDate;
        })
        .slice(0, max)
        .map(item => item.file);
}

function agentContextDecision(goal, requestedSelection = {}) {
    const requestedCount = selectionItemCount(requestedSelection);
    const standalone = agentGoalLooksStandalone(goal);
    const needsFullContext = agentGoalNeedsFullContext(goal);

    if (needsFullContext) {
        return {
            mode: 'full',
            reason: requestedCount > 0 ? 'selected_context_needed' : 'record_context_needed',
            requestedCount
        };
    }

    if (requestedCount > 0) {
        return {
            mode: 'inventory',
            reason: standalone ? 'standalone_request_skipped_selected_context' : 'selected_context_inventory_only',
            requestedCount
        };
    }

    return {
        mode: 'none',
        reason: standalone ? 'standalone_request' : 'no_context_signal',
        requestedCount
    };
}

function emptySelectedContext(contextDecision = {}) {
    return {
        text: '',
        fingerprint: hashText(JSON.stringify({ strategy: contextDecision.mode || 'none', reason: contextDecision.reason || '' })),
        stats: {
            sections: 0,
            chars: 0,
            estimatedTokens: 0,
            truncated: false,
            sources: [],
            errors: [],
            strategy: contextDecision.mode || 'none',
            reason: contextDecision.reason || ''
        },
        debug: {
            ocr: [],
            uploads: [],
            rag: null,
            limits: {}
        }
    };
}

function agentBuildContextInventoryText(items = [], requestedSelection = {}, contextDecision = {}) {
    const requestedCount = selectionItemCount(requestedSelection);
    if (!requestedCount) return '';

    const visibleItems = sanitizeContextItems(items).slice(0, 14);
    const lines = visibleItems.map(item => {
        const meta = item.meta || item.type || 'Contexte';
        return `- ${meta}: ${item.label}`;
    });
    const hiddenCount = Math.max(0, requestedCount - visibleItems.length);
    if (hiddenCount > 0) lines.push(`- ${hiddenCount} autre(s) source(s) sélectionnée(s)`);

    return [
        `Inventaire léger du contexte sélectionné (${requestedCount} source${requestedCount > 1 ? 's' : ''}).`,
        "Le contenu détaillé/OCR n'est pas envoyé car la demande semble pouvoir être traitée sans ces sources.",
        lines.length ? lines.join('\n') : '- Sources sélectionnées non résolues',
        `Stratégie contexte: ${contextDecision.reason || contextDecision.mode || 'inventory'}.`,
        "Si la demande exige une preuve venant des documents, n'invente rien: indique qu'il faut relancer avec le contexte détaillé."
    ].join('\n');
}

async function agentDefaultSelection(req, record, entity, goal = '') {
    const bootstrap = await buildBootstrap(req, record, entity);
    const allFiles = (bootstrap.files || []).filter(file => ['record', 'drive'].includes(file.source));
    const recordFiles = allFiles.filter(file => file.source === 'record');
    const driveFiles = allFiles.filter(file => file.source === 'drive');
    const useDocuments = agentGoalShouldUseDocuments(goal);
    const useNotes = agentGoalShouldUseNotes(goal);
    const standalone = agentGoalLooksStandalone(goal);
    const matchedFiles = standalone ? [] : agentRelevantFilesForGoal(goal, allFiles);
    const fallbackFiles = useDocuments
        ? [
            ...recordFiles,
            ...(agentGoalMentionsDrive(goal) ? driveFiles : [])
        ]
        : [];
    const selectedFiles = (matchedFiles.length ? matchedFiles : fallbackFiles)
        .slice(0, RECORD_AI_RAG_MAX_DOCUMENTS)
        .map(file => ({ id: file.id, source: file.source, name: file.name }));

    return normalizeSelection({
        fields: (bootstrap.fields || []).map(field => field.id).slice(0, 80),
        notes: useNotes
            ? (bootstrap.notes || []).filter(note => !note.isProtected).map(note => cleanId(note.id)).slice(0, 20)
            : [],
        chats: [],
        files: selectedFiles,
        uploads: []
    });
}

function agentRecordLinkValues(record = {}) {
    const values = [];
    if (record._id) values.push(record._id);
    const stringId = cleanId(record._id);
    if (stringId) values.push(stringId);
    const seen = new Set();
    return values.filter(value => {
        const key = `${typeof value}:${value?.toString ? value.toString() : value}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function agentDocumentRecordQuery(record = {}, documentId = null) {
    const recordIds = agentRecordLinkValues(record);
    const query = {
        isTemplate: { $ne: true },
        $or: [
            { 'linkedRecords.recordId': { $in: recordIds } },
            { draftRecordId: { $in: recordIds } },
            { 'generatedFile.recordId': { $in: recordIds } }
        ]
    };
    if (documentId) query._id = documentId;
    return query;
}

function agentEventRecordQuery(record = {}, eventsEntity = {}, eventId = null) {
    const recordIds = agentRecordLinkValues(record);
    const query = {
        entityId: eventsEntity._id,
        'relations.value': { $in: recordIds }
    };
    if (eventId) query._id = eventId;
    return query;
}

function agentEventFieldMap(eventsEntity = {}) {
    const map = {};
    (eventsEntity.customFields || []).forEach(field => {
        if (field?.name && field?._id) map[field.name] = cleanId(field._id);
    });
    return map;
}

function agentEventCustomFieldValue(event = {}, fieldMap = {}, fieldName = '') {
    const fieldId = fieldMap[fieldName];
    if (!fieldId) return '';
    const found = (event.customFields || []).find(item => cleanId(item.field_id?._id || item.field_id) === fieldId);
    return found ? found.value : '';
}

function agentEventStatusOptions(eventsEntity = {}) {
    return (eventsEntity.statusClassification?.options || []).map(option => ({
        id: cleanId(option._id),
        label: option.label || '',
        color: option.color || ''
    }));
}

function agentEventTypeOptions(eventsEntity = {}) {
    const typeField = (eventsEntity.customFields || []).find(field => field.name === 'type_evenement');
    return (typeField?.type_config?.options || []).map(option => ({
        value: option.value || option.label || '',
        label: option.label || option.value || ''
    }));
}

async function agentBuildToolCatalog(req, record, entity) {
    const RecordNote = await tenantCollection(req, 'RecordNote');
    const SmartDocTemplate = await tenantCollection(req, 'SmartDocTemplate');
    const Document = await tenantCollection(req, 'Document');
    const Record = await tenantCollection(req, 'Record');

    const notes = await RecordNote.find({
        recordId: record._id,
        archived: { $ne: true }
    })
        .select('title content isProtected pinned updatedAt')
        .sort({ pinned: -1, updatedAt: -1 })
        .limit(40)
        .lean();

    const visibilityClauses = [
        { scopeType: 'entity' },
        { scopeType: { $exists: false } },
        { scopeType: null },
        { scopeType: '' },
        { scopeType: 'record', scopeRecordId: record._id }
    ];

    const templates = record.entityId
        ? await SmartDocTemplate.find({
            entityId: record.entityId,
            active: true,
            $or: visibilityClauses
        })
            .select('name description documentId inputFields outputFormat outputNameTemplate scopeType icon color order')
            .sort({ order: 1, name: 1 })
            .limit(60)
            .lean()
        : [];
    const tasks = await GlobalRecordTask.find({ recordId: record._id })
        .select('title description status priority dueDate updatedAt')
        .sort({ updatedAt: -1 })
        .limit(60)
        .lean();
    const documents = await Document.find(agentDocumentRecordQuery(record))
        .select('name status isDraft draftOutputFormat generatedFrom generatedFile pages updatedAt createdAt')
        .sort({ updatedAt: -1 })
        .limit(60)
        .lean();
    const eventsEntity = await ensureEventsEntity(req);
    const fieldMap = agentEventFieldMap(eventsEntity);
    const events = await Record.find(agentEventRecordQuery(record, eventsEntity))
        .select('title date end_date customFields classificationValues updatedAt createdAt')
        .sort({ date: -1, updatedAt: -1 })
        .limit(60)
        .lean();
    const eventStatuses = agentEventStatusOptions(eventsEntity);
    const eventTypes = agentEventTypeOptions(eventsEntity);

    return {
        notes: notes.map(note => ({
            id: cleanId(note._id),
            title: note.title || 'Sans titre',
            protected: Boolean(note.isProtected),
            pinned: Boolean(note.pinned),
            preview: note.isProtected ? '[Note protégée]' : shortPlainText(note.content || '', 220),
            updatedAt: note.updatedAt
        })),
        templates: templates.map(template => ({
            id: cleanId(template._id),
            name: template.name || 'Template',
            description: template.description || '',
            documentId: cleanId(template.documentId),
            outputFormat: template.outputFormat || 'pdf',
            outputNameTemplate: template.outputNameTemplate || '{{templateName}} - {{recordTitle}}',
            scopeType: template.scopeType || 'entity',
            inputFields: (template.inputFields || []).map(field => ({
                key: field.key,
                label: field.label,
                type: field.type,
                required: field.required !== false,
                defaultValue: field.defaultValue,
                options: field.options || []
            }))
        })),
        tasks: tasks.map(task => ({
            id: cleanId(task._id),
            title: task.title || 'Tâche',
            description: task.description || '',
            status: task.status || '',
            priority: task.priority || '',
            dueDate: task.dueDate || '',
            updatedAt: task.updatedAt
        })),
        documents: documents.map(document => ({
            id: cleanId(document._id),
            name: document.name || 'Document',
            status: document.status || '',
            draft: Boolean(document.isDraft),
            generatedFrom: document.generatedFrom?.templateName || document.generatedFile?.generatedFromName || '',
            pageCount: Array.isArray(document.pages) ? document.pages.length : 0,
            preview: shortPlainText(document.pages?.[0]?.content || '', 220),
            updatedAt: document.updatedAt || document.createdAt
        })),
        events: events.map(event => {
            const statusOption = eventStatuses.find(option =>
                (event.classificationValues || []).some(cv => cleanId(cv.optionId) === option.id)
            );
            return {
                id: cleanId(event._id),
                title: event.title || 'Événement',
                date: event.date || '',
                endDate: event.end_date || '',
                duration: agentEventCustomFieldValue(event, fieldMap, 'duree_evenement') || '',
                type: agentEventCustomFieldValue(event, fieldMap, 'type_evenement') || '',
                lieu: agentEventCustomFieldValue(event, fieldMap, 'lieu_evenement') || '',
                notes: shortPlainText(agentEventCustomFieldValue(event, fieldMap, 'notes_evenement') || '', 220),
                status: statusOption?.label || '',
                updatedAt: event.updatedAt || event.createdAt
            };
        }),
        eventStatuses,
        eventTypes,
        tools: [
            'create_note',
            'update_note',
            'create_doc',
            'update_doc',
            'generate_doc',
            'update_fiche',
            'create_task',
            'update_task',
            'create_event',
            'update_event'
        ]
    };
}

function buildAgentInstructions(record, entity, fieldCatalog = [], toolCatalog = {}) {
    const fieldList = fieldCatalog.map(field => ({
        id: field.id,
        label: field.label,
        type: field.type,
        source: field.source
    }));

    return [
        `Tu es l'agent IA de la fiche "${record.computedTitle || record.title || 'Sans titre'}" (${entity?.nameSingular || entity?.name || 'record'}).`,
        "Tu ne modifies jamais les données directement. Tu proposes uniquement un plan et des tool calls à valider.",
        "Réponds en français et uniquement en JSON valide, sans markdown, sans bloc ```.",
        "Tools autorisés:",
        "- create_note: { title, contentMarkdown }. La note doit commencer par une décision/synthèse courte quand la demande parle d'éligibilité ou de soumission.",
        "- update_note: { noteId, title?, contentMarkdown?, mode }. Utilise noteId depuis le catalogue. mode vaut replace ou append. N'utilise pas les notes protégées.",
        "- create_doc: { name, contentMarkdown? ou contentHtml?, format?, orientation?, folder? }. Crée un document simple brouillon lié à la fiche.",
        "- update_doc: { documentId, name?, contentMarkdown? ou contentHtml?, mode }. Utilise documentId depuis le catalogue. mode vaut replace ou append.",
        "- generate_doc: { templateId, variables, outputName? }. Génère un brouillon depuis un SmartDoc template. Utilise les clés inputFields du catalogue seulement si l'utilisateur donne une valeur explicite.",
        "- update_fiche: { fields: [{ fieldId, label, value, reason, confidence }] }. Utilise uniquement les fieldId fournis.",
        "- create_task: { title, description, dueDate, priority, listTitle? }. Utilise listTitle quand l'utilisateur demande une liste/projet précis.",
        "- update_task: { taskId, fields }. fields peut contenir title, description, status, priority, dueDate. Utilise taskId depuis le catalogue.",
        "- create_event: { title, date, endDate?, duration?, type?, lieu?, notes?, status? }. Crée un événement Agenda lié à la fiche.",
        "- update_event: { eventId, fields }. fields peut contenir title, date, endDate, duration, type, lieu, notes, status. Utilise eventId depuis le catalogue.",
        "Si une information est incertaine, ne propose pas de mise à jour fiche; mentionne-la dans la note.",
        "Pour modifier une note, un document, un événement ou générer depuis un template, choisis l'identifiant exact fourni dans le catalogue. Si aucun identifiant fiable n'existe, crée plutôt une note explicative.",
        "Quand l'utilisateur demande de générer un document (facture, devis, contrat, attestation, offre...) et qu'un template du catalogue correspond, choisis toujours generate_doc avant create_doc.",
        "Pour generate_doc, laisse variables vide sauf si l'utilisateur fournit clairement des valeurs; les variables manquantes seront remplies automatiquement par le template, la fiche et les valeurs par défaut.",
        "N'utilise create_doc que pour un document libre sans template pertinent.",
        "Si le contexte détaillé n'est pas fourni et que la demande exige une preuve documentaire, n'invente pas: propose une action prudente ou demande le contexte détaillé.",
        "N'utilise les documents, OCR et sources que lorsqu'ils sont présents dans le bloc de contexte détaillé. Un inventaire léger n'est pas une source de contenu.",
        "Réponse compacte obligatoire: summary <= 400 caractères, plan <= 4 étapes, actions <= 10.",
        "Pour les actions create_task, garde title <= 90 caractères, description <= 180 caractères, input.description <= 700 caractères.",
        "Ne duplique pas un même préfixe dans tous les titres de tâches; mets le nom du projet dans input.description si nécessaire.",
        "Format strict:",
        '{"summary":"...","plan":{"title":"...","steps":[{"type":"analysis","title":"...","detail":"..."}]},"actions":[{"tool":"create_note","title":"...","description":"...","input":{"title":"...","contentMarkdown":"..."}},{"tool":"update_note","title":"...","description":"...","input":{"noteId":"...","title":"...","contentMarkdown":"...","mode":"replace"}},{"tool":"create_doc","title":"...","description":"...","input":{"name":"...","contentMarkdown":"...","folder":"Documents IA"}},{"tool":"update_doc","title":"...","description":"...","input":{"documentId":"...","contentMarkdown":"...","mode":"append"}},{"tool":"generate_doc","title":"...","description":"...","input":{"templateId":"...","variables":{"fieldKey":"value"},"outputName":"..."}},{"tool":"update_fiche","title":"...","description":"...","input":{"fields":[{"fieldId":"...","label":"...","value":"...","reason":"...","confidence":0.8}]}},{"tool":"create_task","title":"...","description":"...","input":{"title":"...","description":"...","dueDate":"YYYY-MM-DD","priority":"Moyenne","listTitle":"Projet"}},{"tool":"update_task","title":"...","description":"...","input":{"taskId":"...","fields":{"status":"En cours","priority":"Haute","dueDate":"YYYY-MM-DD"}}},{"tool":"create_event","title":"...","description":"...","input":{"title":"...","date":"YYYY-MM-DDTHH:mm:ssZ","duration":30,"type":"reunion","lieu":"...","notes":"..."}},{"tool":"update_event","title":"...","description":"...","input":{"eventId":"...","fields":{"status":"Confirmé","date":"YYYY-MM-DDTHH:mm:ssZ"}}}]}',
        "",
        "Champs fiche autorisés:",
        JSON.stringify(fieldList.slice(0, 120)),
        "",
        "Catalogue record disponible pour les tools:",
        JSON.stringify({
            notes: (toolCatalog.notes || []).slice(0, 40),
            templates: (toolCatalog.templates || []).slice(0, 60),
            documents: (toolCatalog.documents || []).slice(0, 60),
            tasks: (toolCatalog.tasks || []).slice(0, 60),
            events: (toolCatalog.events || []).slice(0, 60),
            eventStatuses: toolCatalog.eventStatuses || [],
            eventTypes: toolCatalog.eventTypes || []
        })
    ].join('\n');
}

function buildAgentInput(goal, selectedContext, contextMeta = {}) {
    const mode = contextMeta.mode || 'full';
    const detailedContext = selectedContext?.text?.trim();
    const inventoryText = String(contextMeta.inventoryText || '').trim();
    const historyText = String(contextMeta.historyText || '').trim();
    let contextBlock = "Aucun contexte détaillé envoyé. Traite la demande à partir du message utilisateur et des instructions système.";

    if (mode === 'full' && detailedContext) {
        contextBlock = detailedContext;
    } else if (mode === 'inventory' && inventoryText) {
        contextBlock = inventoryText;
    }

    return [
        'Demande utilisateur:',
        goal,
        '',
        historyText ? 'Historique récent de cette conversation agent:' : '',
        historyText ? '<historique>' : '',
        historyText,
        historyText ? '</historique>' : '',
        historyText ? '' : '',
        mode === 'full' ? 'Contexte record détaillé disponible:' : 'Contexte record envoyé:',
        '<contexte>',
        contextBlock,
        '</contexte>',
        '',
        "Prépare un plan agentique et des actions en mode review."
    ].join('\n');
}

function agentLooksRawJsonPayload(value = '') {
    const text = String(value || '').trim();
    return (text.startsWith('{') || /^```(?:json)?\s*\{/i.test(text)) && /"(summary|plan|actions)"\s*:/.test(text);
}

function agentParsedPayloadJson(value = '') {
    const raw = String(value || '').trim();
    if (!raw) return null;
    const parsed = agentTryParseJsonCandidate(raw) || agentTryParseJsonCandidate(agentBalancedJsonCandidate(raw));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
}

function agentRunHasRawFallbackNote(run = {}) {
    const actions = Array.isArray(run.proposedActions) ? run.proposedActions : [];
    if (actions.length !== 1 || actions[0]?.tool !== 'create_note') return false;
    const content = actions[0]?.input?.contentMarkdown || actions[0]?.input?.content || actions[0]?.preview?.excerpt || '';
    return agentLooksRawJsonPayload(content);
}

function agentSanitizeRunPayload(run = {}) {
    const plain = { ...(run || {}) };
    const parsedSummary = agentParsedPayloadJson(plain.summary);
    if (parsedSummary) {
        if (parsedSummary.summary) {
            plain.summary = agentSafeString(parsedSummary.summary, 3000);
        }
        if ((!plain.plan || plain.plan?.title === 'Plan agent') && (parsedSummary.plan || parsedSummary.steps)) {
            plain.plan = agentNormalizePlan(parsedSummary);
        }
    }

    const hasRawSummary = !parsedSummary && agentLooksRawJsonPayload(plain.summary);
    if (hasRawSummary || agentRunHasRawFallbackNote(plain)) {
        plain.summary = "La réponse de l'agent a été interrompue avant la fin. Relance la demande: la sortie agent est maintenant plus compacte.";
        plain.proposedActions = [];
        plain.status = 'error';
        plain.error = 'Réponse agent JSON incomplète, aucune action appliquable.';
        plain.plan = {
            title: 'Génération interrompue',
            steps: [
                {
                    id: 'interrupted',
                    type: 'error',
                    title: 'Relancer la demande',
                    detail: 'Le modèle a coupé sa réponse avant de fermer le JSON.',
                    status: 'failed'
                }
            ]
        };
    }

    if (plain.status === 'drafting') {
        const referenceDate = new Date(plain.updatedAt || plain.createdAt || Date.now()).getTime();
        if (Number.isFinite(referenceDate) && Date.now() - referenceDate > RECORD_AI_TIMEOUT_MS + 30000) {
            plain.status = 'error';
            plain.summary = 'La génération précédente a expiré avant de produire un plan.';
            plain.proposedActions = [];
            plain.error = 'Timeout agent.';
            plain.plan = {
                title: 'Génération expirée',
                steps: [
                    {
                        id: 'timeout',
                        type: 'error',
                        title: 'Relancer la demande',
                        detail: 'Aucune action n’a été créée pour ce run.',
                        status: 'failed'
                    }
                ]
            };
        }
    }

    return plain;
}

function agentRunPayload(req, run) {
    const source = run && typeof run.toObject === 'function' ? run.toObject() : { ...(run || {}) };
    const plain = agentSanitizeRunPayload(source);
    if (!isRecordAiDebugAdmin(req)) {
        delete plain.aiRaw;
        delete plain.debugPayload;
    }
    return plain;
}

function agentConversationTitleFromGoal(goal) {
    const title = shortPlainText(goal, 70);
    return title || 'Nouvelle conversation agent';
}

function agentConversationPayload(conversation) {
    if (!conversation) return null;
    const plain = conversation && typeof conversation.toObject === 'function'
        ? conversation.toObject()
        : { ...(conversation || {}) };
    return plain;
}

function isDefaultAgentConversationTitle(title) {
    const clean = normalizeSearchText(title);
    return !clean || ['nouvelle conversation agent', 'conversation agent', 'nouvelle conversation'].includes(clean);
}

async function updateAgentConversationFromRun(req, conversation, run) {
    if (!conversation || !run?._id) return conversation;
    const RecordAgentRun = await tenantCollection(req, 'RecordAgentRun');
    const count = await RecordAgentRun.countDocuments({
        conversationId: conversation._id,
        recordId: run.recordId,
        userId: run.userId,
        archived: { $ne: true }
    });

    if (isDefaultAgentConversationTitle(conversation.title)) {
        conversation.title = agentConversationTitleFromGoal(run.goal);
    }
    conversation.runCount = count;
    conversation.lastRun = {
        runId: run._id,
        goal: run.goal || '',
        status: run.status || '',
        actionCount: Array.isArray(run.proposedActions) ? run.proposedActions.length : 0,
        updatedAt: run.updatedAt || new Date()
    };
    await conversation.save();
    return conversation;
}

function agentHistoryMessagesFromRuns(runs = []) {
    return (Array.isArray(runs) ? runs : [])
        .slice(-8)
        .flatMap(run => {
            const actions = (run.proposedActions || [])
                .slice(0, 6)
                .map(action => `${action.tool}: ${action.title || action.description || action.status || 'action'}`)
                .join('; ');
            return [
                { role: 'user', content: run.goal || '' },
                {
                    role: 'assistant',
                    content: [
                        `Résumé agent précédent: ${run.summary || 'Aucun résumé.'}`,
                        `Statut: ${run.status || 'inconnu'}`,
                        actions ? `Actions: ${actions}` : ''
                    ].filter(Boolean).join('\n')
                }
            ];
        })
        .filter(message => message.content);
}

function agentHistoryTextFromRuns(runs = []) {
    const messages = agentHistoryMessagesFromRuns(runs);
    if (!messages.length) return '';
    return messages
        .map(message => `${message.role === 'user' ? 'Utilisateur' : 'Agent'}: ${message.content}`)
        .join('\n\n');
}

async function migrateLegacyAgentRunsToConversations(req, record, entity) {
    const RecordAgentRun = await tenantCollection(req, 'RecordAgentRun');
    const RecordAgentConversation = await tenantCollection(req, 'RecordAgentConversation');
    const legacyRuns = await RecordAgentRun.find({
        recordId: record._id,
        userId: String(req.user._id),
        $or: [{ conversationId: { $exists: false } }, { conversationId: null }],
        archived: { $ne: true }
    })
        .sort({ updatedAt: -1 })
        .limit(80);

    for (const run of legacyRuns) {
        const conversation = await RecordAgentConversation.create({
            recordId: record._id,
            entityId: record.entityId || entity?._id || null,
            userId: String(req.user._id),
            userName: req.user.name || req.user.email || '',
            title: agentConversationTitleFromGoal(run.goal),
            runCount: 1,
            lastRun: {
                runId: run._id,
                goal: run.goal || '',
                status: run.status || '',
                actionCount: Array.isArray(run.proposedActions) ? run.proposedActions.length : 0,
                updatedAt: run.updatedAt || run.createdAt || new Date()
            },
            createdAt: run.createdAt || new Date(),
            updatedAt: run.updatedAt || run.createdAt || new Date()
        });
        run.conversationId = conversation._id;
        await run.save();
    }
}

async function listAgentConversations(req, record, entity) {
    await migrateLegacyAgentRunsToConversations(req, record, entity);
    const RecordAgentConversation = await tenantCollection(req, 'RecordAgentConversation');
    return RecordAgentConversation.find({
        recordId: record._id,
        userId: String(req.user._id),
        archived: { $ne: true }
    })
        .select('title runCount lastRun archived updatedAt createdAt')
        .sort({ updatedAt: -1 })
        .lean();
}

async function ensureAgentConversation(req, record, entity, conversationId, goal) {
    const RecordAgentConversation = await tenantCollection(req, 'RecordAgentConversation');
    let conversation = null;

    if (isObjectId(conversationId)) {
        conversation = await RecordAgentConversation.findOne({
            _id: conversationId,
            recordId: record._id,
            userId: String(req.user._id),
            archived: { $ne: true }
        });
    }

    if (conversation) return conversation;

    return RecordAgentConversation.create({
        recordId: record._id,
        entityId: record.entityId || entity?._id || null,
        userId: String(req.user._id),
        userName: req.user.name || req.user.email || '',
        title: agentConversationTitleFromGoal(goal)
    });
}

async function requireAgentRun(req, recordId, runId) {
    const { record, entity } = await loadRecordBundle(req, recordId);
    const RecordAgentRun = await tenantCollection(req, 'RecordAgentRun');
    const run = await RecordAgentRun.findOne({
        _id: runId,
        recordId: record._id,
        userId: String(req.user._id),
        archived: { $ne: true }
    });
    if (!run) {
        const error = new Error('Run agent introuvable');
        error.statusCode = 404;
        throw error;
    }
    return { record, entity, run };
}

async function agentEnsureTaskList(req, recordId, requestedLabel = '') {
    const label = agentSafeString(requestedLabel || 'Actions IA', 90) || 'Actions IA';
    let list = await GlobalTaskList.findOne({ recordId, label });
    if (list) return { list, created: false };

    const maxOrder = await GlobalTaskList.findOne({ recordId }).sort({ order: -1 }).lean();
    list = await GlobalTaskList.create({
        recordId,
        label,
        color: '#4f46e5',
        icon: 'solar:magic-stick-3-bold-duotone',
        order: (maxOrder?.order || 0) + 1
    });
    return { list, created: true };
}

function agentLinkedRecordPayload(record = {}, entity = {}) {
    return {
        recordId: record._id,
        recordTitle: record.computedTitle || record.title || '',
        entityId: record.entityId || entity?._id || null,
        entityName: entity?.name || entity?.nameSingular || '',
        entityIcon: entity?.icon || '',
        entityColor: entity?.color || '',
        entitySlug: entity?.slug || '',
        alias: entity?.slug || 'record'
    };
}

function agentDocumentUrl(req, documentId) {
    return `/account/${req.account_number}/documents/${documentId}/edit-react`;
}

function agentDocContentHtml(action = {}) {
    const html = String(action.input?.contentHtml || '').trim();
    if (html) return html;
    return agentMarkdownToHtml(action.input?.contentMarkdown || '');
}

function agentDefaultDocDimensions(format = 'A4', orientation = 'portrait') {
    const portrait = {
        A3: { width: 1123, height: 1587 },
        A4: { width: 794, height: 1123 },
        A5: { width: 559, height: 794 },
        Letter: { width: 816, height: 1056 },
        Legal: { width: 816, height: 1344 }
    }[format] || { width: 794, height: 1123 };
    if (orientation === 'landscape') return { width: portrait.height, height: portrait.width };
    return portrait;
}

function agentCloneWithoutMongoIds(value) {
    if (Array.isArray(value)) return value.map(agentCloneWithoutMongoIds);
    if (!value || typeof value !== 'object') return value;
    const output = {};
    Object.entries(value).forEach(([key, item]) => {
        if (key === '_id' || key === '__v') return;
        output[key] = agentCloneWithoutMongoIds(item);
    });
    return output;
}

function agentTemplateFormatDate(value, mode = 'full') {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    if (mode === 'month') {
        return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function agentTemplateValueToString(value) {
    if (value === undefined || value === null) return '';
    if (value instanceof Date) return agentTemplateFormatDate(value);
    if (Array.isArray(value)) return value.map(agentTemplateValueToString).filter(Boolean).join(', ');
    if (typeof value !== 'object') return String(value);
    if (value.computedTitle) return String(value.computedTitle);
    if (value.title) return String(value.title);
    if (value.name) return String(value.name);
    return JSON.stringify(value);
}

function agentTemplateCustomFields(record = {}, entity = {}) {
    const result = {};
    const fieldDefs = Array.isArray(entity?.customFields) ? entity.customFields : [];
    const fields = record.customFields;

    if (Array.isArray(fields)) {
        fields.forEach(item => {
            const fieldId = cleanId(item?.field_id?._id || item?.field_id);
            if (!fieldId) return;
            const fieldDef = fieldDefs.find(field => cleanId(field?._id) === fieldId);
            const rawValue = item?.value !== undefined && item?.value !== null ? item.value : '';
            const value = fieldDef?.type === 'date' && rawValue
                ? agentTemplateFormatDate(rawValue)
                : agentTemplateValueToString(rawValue);
            const fieldName = fieldDef?.name || fieldDef?.label || '';
            if (fieldName) result[fieldName] = value;
            result[`cf_${fieldId}`] = value;
        });
        return result;
    }

    if (fields && typeof fields === 'object') {
        const entries = fields instanceof Map ? Object.fromEntries(fields) : fields;
        fieldDefs.forEach(fieldDef => {
            const fieldId = cleanId(fieldDef?._id);
            const fieldName = fieldDef?.name || fieldDef?.label || '';
            const rawValue = entries[fieldId] ?? entries[fieldName] ?? '';
            const value = fieldDef?.type === 'date' && rawValue
                ? agentTemplateFormatDate(rawValue)
                : agentTemplateValueToString(rawValue);
            if (fieldName) result[fieldName] = value;
            if (fieldId) result[`cf_${fieldId}`] = value;
        });
        Object.entries(entries).forEach(([key, item]) => {
            if (result[key] === undefined) result[key] = agentTemplateValueToString(item);
        });
    }

    return result;
}

function agentTemplateClassificationContext(record = {}, entity = {}) {
    const context = {};
    const allClassifications = [
        ...(entity?.statusClassification ? [entity.statusClassification] : []),
        ...(Array.isArray(entity?.classifications) ? entity.classifications : [])
    ];
    (record.classificationValues || []).forEach(value => {
        const definition = allClassifications.find(item => cleanId(item?._id) === cleanId(value?.classificationId));
        if (definition?.key) context[definition.key] = value.label || '';
        if (value?.classificationId) context[cleanId(value.classificationId)] = value.label || '';
    });
    return context;
}

function agentTemplateContext(record = {}, entity = {}, template = {}, variables = {}, user = {}, company = {}) {
    const recordTitle = record.computedTitle || record.title || '';
    const customFields = agentTemplateCustomFields(record, entity);
    const classification = agentTemplateClassificationContext(record, entity);
    const recordContext = {
        title: record.title || '',
        computedTitle: record.computedTitle || record.title || '',
        description: record.description || '',
        content: record.content || '',
        status: record.status || '',
        slug: record.slug || '',
        date: record.date ? agentTemplateFormatDate(record.date) : '',
        end_date: record.end_date ? agentTemplateFormatDate(record.end_date) : '',
        createdAt: record.createdAt ? agentTemplateFormatDate(record.createdAt) : '',
        updatedAt: record.updatedAt ? agentTemplateFormatDate(record.updatedAt) : '',
        ...customFields
    };
    if (Object.keys(classification).length) recordContext.classification = classification;

    const entityScoped = entity?.slug ? { [entity.slug]: recordContext } : {};

    return {
        templateName: template.name || '',
        recordTitle,
        title: recordTitle,
        computedTitle: recordTitle,
        description: record.description || '',
        slug: record.slug || '',
        date: record.date ? agentTemplateFormatDate(record.date) : '',
        end_date: record.end_date ? agentTemplateFormatDate(record.end_date) : '',
        createdAt: record.createdAt ? agentTemplateFormatDate(record.createdAt) : '',
        updatedAt: record.updatedAt ? agentTemplateFormatDate(record.updatedAt) : '',
        ...customFields,
        ...variables,
        today: agentTemplateFormatDate(new Date()),
        currentYear: new Date().getFullYear().toString(),
        currentMonth: agentTemplateFormatDate(new Date(), 'month'),
        currentTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        userName: user.name || user.fullName || user.email || '',
        record: recordContext,
        entity: {
            name: entity?.name || '',
            nameSingular: entity?.nameSingular || '',
            slug: entity?.slug || ''
        },
        ...entityScoped,
        user: {
            name: user.name || user.fullName || user.email || '',
            email: user.email || ''
        },
        company: {
            name: company.name || '',
            number: company.number || '',
            address: company.address || '',
            representative: company.representative || '',
            vat: company.vat || '',
            phone: company.phone || '',
            email: company.email || ''
        },
        input: variables,
        inputs: variables,
        variables
    };
}

function agentValueByPath(source = {}, pathValue = '') {
    const parts = String(pathValue || '').split('.').map(part => part.trim()).filter(Boolean);
    let current = source;
    for (const part of parts) {
        if (current && Object.prototype.hasOwnProperty.call(current, part)) {
            current = current[part];
        } else {
            return undefined;
        }
    }
    return current;
}

function agentResolveTemplateString(value, context = {}) {
    let result = String(value || '').replace(
        /<span[^>]*class="[^"]*template-token[^"]*"[^>]*data-token="([^"]*)"[^>]*>[^<]*<\/span>/gi,
        (match, encodedTokenData) => {
            try {
                const decoded = encodedTokenData
                    .replace(/&quot;/g, '"')
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&#39;/g, "'");
                const tokenData = JSON.parse(decoded);
                const resolved = agentValueByPath(context, tokenData.path);
                return agentTemplateValueToString(resolved);
            } catch (error) {
                console.warn('[RecordAI Agent] Could not parse template token:', error.message);
                return '';
            }
        }
    );

    result = result.replace(
        /<span[^>]*class="[^"]*template-token[^"]*"[^>]*data-token='([^']*)'[^>]*>[^<]*<\/span>/gi,
        (match, tokenDataStr) => {
            try {
                const tokenData = JSON.parse(tokenDataStr);
                const resolved = agentValueByPath(context, tokenData.path);
                return agentTemplateValueToString(resolved);
            } catch (_) {
                return '';
            }
        }
    );

    return result.replace(/{{\s*([^}]+)\s*}}/g, (match, key) => {
        const clean = String(key || '').trim();
        const resolved = agentValueByPath(context, clean);
        return agentTemplateValueToString(resolved);
    });
}

function agentResolveTemplateObject(value, context = {}) {
    if (typeof value === 'string') return agentResolveTemplateString(value, context);
    if (Array.isArray(value)) return value.map(item => agentResolveTemplateObject(item, context));
    if (!value || typeof value !== 'object') return value;
    const output = {};
    Object.entries(value).forEach(([key, item]) => {
        output[key] = agentResolveTemplateObject(item, context);
    });
    return output;
}

function agentTemplateVariables(template = {}, inputVariables = {}) {
    const variables = { ...agentObjectInput(inputVariables) };
    (template.inputFields || []).forEach(field => {
        if (variables[field.key] !== undefined && variables[field.key] !== null && variables[field.key] !== '') return;
        if (field.defaultValue !== undefined && field.defaultValue !== null) {
            variables[field.key] = field.defaultValue;
            return;
        }
        if (field.type === 'date') variables[field.key] = new Date().toISOString().slice(0, 10);
        else if (field.type === 'number') variables[field.key] = 0;
        else variables[field.key] = '';
    });
    return variables;
}

function agentResolveEventStatus(eventsEntity = {}, input = {}) {
    const raw = input.statusOptionId || input.statusId || input.status || input.statusLabel;
    const option = agentResolveCatalogOption(raw, agentEventStatusOptions(eventsEntity));
    const defaultOption = eventsEntity.statusClassification?.options?.[0] || null;
    const chosen = option
        ? (eventsEntity.statusClassification?.options || []).find(item => cleanId(item._id) === cleanId(option.id))
        : (input.statusOptionId || input.status ? null : defaultOption);
    if (!chosen) return null;
    return {
        classificationId: eventsEntity.statusClassification?._id,
        optionId: chosen._id,
        label: chosen.label || input.status || '',
        color: chosen.color || '#3b82f6'
    };
}

function agentSetEventCustomField(event, fieldMap = {}, fieldName = '', value) {
    if (value === undefined) return;
    const fieldId = fieldMap[fieldName];
    if (!fieldId) return;
    event.customFields = event.customFields || [];
    const index = event.customFields.findIndex(item => cleanId(item.field_id?._id || item.field_id) === fieldId);
    if (index >= 0) {
        event.customFields[index].value = value;
    } else {
        event.customFields.push({ field_id: fieldId, value });
    }
    if (typeof event.markModified === 'function') event.markModified('customFields');
}

function agentApplyEventFields(event, eventsEntity = {}, fields = {}, { includeDefaults = false } = {}) {
    const fieldMap = agentEventFieldMap(eventsEntity);
    const updates = agentObjectInput(fields);
    if (updates.title !== undefined) event.title = agentSafeString(updates.title, 180) || event.title || 'Nouvel événement';
    if (updates.date !== undefined) {
        const date = updates.date ? new Date(updates.date) : null;
        event.date = date && !Number.isNaN(date.getTime()) ? date : event.date;
    } else if (includeDefaults && !event.date) {
        event.date = new Date();
    }
    if (updates.endDate !== undefined) {
        const endDate = updates.endDate ? new Date(updates.endDate) : null;
        event.end_date = endDate && !Number.isNaN(endDate.getTime()) ? endDate : null;
        agentSetEventCustomField(event, fieldMap, 'heure_fin', updates.endDate || '');
    }
    if (updates.duration !== undefined) agentSetEventCustomField(event, fieldMap, 'duree_evenement', parseInt(updates.duration, 10) || 30);
    if (updates.type !== undefined) agentSetEventCustomField(event, fieldMap, 'type_evenement', agentNormalizeEventType(updates.type, { eventTypes: agentEventTypeOptions(eventsEntity) }));
    if (updates.lieu !== undefined) agentSetEventCustomField(event, fieldMap, 'lieu_evenement', agentSafeString(updates.lieu, 500));
    if (updates.notes !== undefined) agentSetEventCustomField(event, fieldMap, 'notes_evenement', agentSafeString(updates.notes, 4000));

    const statusPatch = updates.statusOptionId || updates.statusId || updates.status || updates.statusLabel;
    const statusValue = statusPatch || (includeDefaults ? '' : null);
    if (statusValue !== null && eventsEntity.statusClassification) {
        const status = agentResolveEventStatus(eventsEntity, updates);
        if (status?.optionId) {
            event.classificationValues = (event.classificationValues || []).filter(
                cv => cleanId(cv.classificationId) !== cleanId(eventsEntity.statusClassification._id)
            );
            event.classificationValues.push(status);
            if (typeof event.markModified === 'function') event.markModified('classificationValues');
        }
    }
}

async function agentComputeRecordDenorm(recordData, eventsEntity, Record, Entity) {
    try {
        const denormService = require('../../services/record-denorm.service');
        const source = typeof recordData.toObject === 'function'
            ? recordData.toObject({ depopulate: true })
            : recordData;
        const denorm = await denormService.computeDenorm(source, eventsEntity, Record, Entity);
        if (typeof recordData.set === 'function') recordData.set(denorm);
        else Object.assign(recordData, denorm);
    } catch (_) {
        // Denormalization is a display optimization; the event itself remains valid without it.
    }
}

async function applyAgentAction(req, record, entity, action) {
    if (action.tool === 'create_note') {
        const canEdit = await canEditRecordModule(req, record._id, 'notes');
        if (!canEdit) throw new Error("Accès en lecture seule aux notes");

        const RecordNote = await tenantCollection(req, 'RecordNote');
        const note = await RecordNote.create({
            recordId: record._id,
            entityId: record.entityId || entity?._id || null,
            title: action.input?.title || 'Note IA',
            content: agentMarkdownToHtml(action.input?.contentMarkdown || ''),
            color: '#4f46e5',
            icon: 'solar:magic-stick-3-bold-duotone',
            createdBy: String(req.user._id),
            createdByName: req.user.name || req.user.email || 'IA'
        });

        return {
            before: null,
            after: { noteId: cleanId(note._id), title: note.title },
            result: { noteId: cleanId(note._id), title: note.title },
            inverse: { tool: 'archive_note', noteId: cleanId(note._id) }
        };
    }

    if (action.tool === 'update_note') {
        const canEdit = await canEditRecordModule(req, record._id, 'notes');
        if (!canEdit) throw new Error("Accès en lecture seule aux notes");

        const RecordNote = await tenantCollection(req, 'RecordNote');
        const note = await RecordNote.findOne({
            _id: action.input?.noteId,
            recordId: record._id,
            archived: { $ne: true }
        });
        if (!note) throw new Error('Note introuvable');
        if (note.isProtected) throw new Error('Les notes protégées ne peuvent pas être modifiées par l’agent');

        const before = {
            noteId: cleanId(note._id),
            title: note.title || '',
            content: note.content || '',
            color: note.color || '',
            icon: note.icon || ''
        };
        if (action.input?.title) note.title = action.input.title;
        if (action.input?.contentMarkdown) {
            const nextContent = agentMarkdownToHtml(action.input.contentMarkdown);
            note.content = action.input.mode === 'append'
                ? `${note.content || ''}\n<hr>\n${nextContent}`
                : nextContent;
        }
        note.updatedAt = new Date();
        await note.save();

        return {
            before,
            after: { noteId: cleanId(note._id), title: note.title },
            result: { noteId: cleanId(note._id), title: note.title },
            inverse: { tool: 'restore_note', note: before }
        };
    }

    if (action.tool === 'create_doc') {
        const canEdit = await canEditRecordModule(req, record._id, 'docs');
        if (!canEdit) throw new Error('Accès en lecture seule aux documents');

        const Document = await tenantCollection(req, 'Document');
        const format = action.input?.format || 'A4';
        const orientation = action.input?.orientation || 'portrait';
        const dimensions = agentDefaultDocDimensions(format, orientation);
        const simpleFolder = String(action.input?.folder || '').trim() || 'Documents IA';
        const docName = action.input?.name || 'Document IA';
        const document = await Document.create({
            name: docName,
            format,
            orientation,
            dimensions,
            pages: [{
                content: agentDocContentHtml(action),
                mode: 'edition',
                elements: [],
                rows: [],
                background: { color: '#ffffff' },
                order: 0
            }],
            entityId: record.entityId || entity?._id || null,
            createdBy: req.user._id,
            isTemplate: false,
            isDraft: true,
            draftRecordId: record._id,
            draftOutputName: docName,
            draftOutputFormat: 'pdf',
            status: 'draft',
            linkedRecords: [agentLinkedRecordPayload(record, entity)],
            metadata: {
                docKind: 'simple',
                simpleFolder,
                createdByAgent: true,
                agentTool: action.tool,
                agentActionId: action.id
            }
        });

        return {
            before: null,
            after: { documentId: cleanId(document._id), name: document.name },
            result: {
                documentId: cleanId(document._id),
                name: document.name,
                url: agentDocumentUrl(req, document._id)
            },
            inverse: { tool: 'delete_document', documentId: cleanId(document._id) }
        };
    }

    if (action.tool === 'update_doc') {
        const canEdit = await canEditRecordModule(req, record._id, 'docs');
        if (!canEdit) throw new Error('Accès en lecture seule aux documents');

        const Document = await tenantCollection(req, 'Document');
        const document = await Document.findOne(agentDocumentRecordQuery(record, action.input?.documentId));
        if (!document) throw new Error('Document introuvable');

        const before = {
            documentId: cleanId(document._id),
            name: document.name || '',
            hadPage0: Boolean(document.pages?.[0]),
            page0Content: document.pages?.[0]?.content || ''
        };
        if (action.input?.name) document.name = action.input.name;
        if (action.input?.contentMarkdown || action.input?.contentHtml) {
            const nextContent = agentDocContentHtml(action);
            document.pages = Array.isArray(document.pages) ? document.pages : [];
            if (!document.pages[0]) {
                document.pages.push({
                    content: '',
                    mode: 'edition',
                    elements: [],
                    rows: [],
                    background: { color: '#ffffff' },
                    order: 0
                });
            }
            document.pages[0].content = action.input?.mode === 'append'
                ? `${document.pages[0].content || ''}\n<hr>\n${nextContent}`
                : nextContent;
            document.markModified('pages');
        }
        document.metadata = {
            ...(document.metadata?.toObject?.() || document.metadata || {}),
            updatedByAgent: true,
            lastAgentTool: action.tool,
            lastAgentActionId: action.id,
            lastAgentUpdatedAt: new Date()
        };
        await document.save();

        return {
            before,
            after: { documentId: cleanId(document._id), name: document.name },
            result: {
                documentId: cleanId(document._id),
                name: document.name,
                url: agentDocumentUrl(req, document._id)
            },
            inverse: { tool: 'restore_document', document: before }
        };
    }

    if (action.tool === 'generate_doc' || action.tool === 'use_template') {
        const canEdit = await canEditRecordModule(req, record._id, 'docs');
        if (!canEdit) throw new Error('Accès en lecture seule aux documents');

        const SmartDocTemplate = await tenantCollection(req, 'SmartDocTemplate');
        const Document = await tenantCollection(req, 'Document');
        const template = await SmartDocTemplate.findOne({
            _id: action.input?.templateId,
            active: true
        }).lean();
        if (!template) throw new Error('Template SmartDoc introuvable');
        if (template.entityId && cleanId(template.entityId) !== cleanId(record.entityId)) {
            throw new Error("Ce template n'est pas lié au type de fiche courant");
        }
        if (template.scopeType === 'record' && cleanId(template.scopeRecordId) !== cleanId(record._id)) {
            throw new Error("Ce template n'est pas disponible pour cette fiche");
        }

        const sourceDoc = await Document.findById(template.documentId).lean();
        if (!sourceDoc) throw new Error('Document template introuvable');

        const variables = agentTemplateVariables(template, action.input?.variables || {});
        let company = {};
        try {
            const Account = require('../../models/account.model');
            const account = await Account.findOne({ account_number: req.account_number }).lean();
            company = account?.company || {};
        } catch (error) {
            console.warn('[RecordAI Agent] Could not load account company for template context:', error.message);
        }
        const context = agentTemplateContext(record, entity, template, variables, req.user || {}, company);
        const outputName = agentResolveTemplateString(
            action.input?.outputName || template.outputNameTemplate || '{{templateName}} - {{recordTitle}}',
            context
        ) || `${template.name || sourceDoc.name || 'Document'} - ${record.computedTitle || record.title || 'Fiche'}`;
        const pages = agentResolveTemplateObject(agentCloneWithoutMongoIds(sourceDoc.pages || []), context);
        const headerHtml = agentResolveTemplateString(sourceDoc.headerHtml || '', context);
        const footerHtml = agentResolveTemplateString(sourceDoc.footerHtml || '', context);

        const draftDoc = await Document.create({
            name: outputName,
            pages: pages.length ? pages : [{
                content: '',
                mode: 'edition',
                elements: [],
                rows: [],
                background: { color: '#ffffff' },
                order: 0
            }],
            headerHtml,
            footerHtml,
            format: sourceDoc.format || 'A4',
            orientation: sourceDoc.orientation || 'portrait',
            margins: sourceDoc.margins || { top: 40, right: 40, bottom: 40, left: 40 },
            dimensions: sourceDoc.dimensions || agentDefaultDocDimensions(sourceDoc.format || 'A4', sourceDoc.orientation || 'portrait'),
            entityId: record.entityId || entity?._id || null,
            createdBy: req.user._id,
            isTemplate: false,
            isDraft: true,
            draftSourceTemplateId: template._id,
            draftRecordId: record._id,
            draftOutputName: outputName,
            draftOutputFormat: template.outputFormat || 'pdf',
            generatedFrom: {
                templateId: sourceDoc._id,
                smartDocId: template._id,
                templateName: template.name || sourceDoc.name || '',
                generatedAt: new Date()
            },
            linkedRecords: [agentLinkedRecordPayload(record, entity)],
            extractedData: { agentVariables: variables },
            status: 'draft',
            metadata: {
                createdByAgent: true,
                agentTool: action.tool,
                agentActionId: action.id
            }
        });

        return {
            before: null,
            after: { documentId: cleanId(draftDoc._id), name: draftDoc.name, templateId: cleanId(template._id) },
            result: {
                documentId: cleanId(draftDoc._id),
                name: draftDoc.name,
                templateId: cleanId(template._id),
                url: agentDocumentUrl(req, draftDoc._id)
            },
            inverse: { tool: 'delete_document', documentId: cleanId(draftDoc._id) }
        };
    }

    if (action.tool === 'update_fiche') {
        const canEdit = await canEditRecordModule(req, record._id, 'fiche')
            || await canEditRecordModule(req, record._id, 'overview');
        if (!canEdit) throw new Error('Accès en lecture seule à la fiche');

        const Record = await tenantCollection(req, 'Record');
        const editableRecord = await Record.findById(record._id);
        if (!editableRecord) throw new Error('Fiche introuvable');

        const fieldCatalog = agentBuildFieldCatalog(entity);
        const lookup = agentFieldLookup(fieldCatalog);
        const before = [];
        const after = [];
        const inverseFields = [];

        for (const patch of (action.input?.fields || []).slice(0, 12)) {
            const field = lookup.byId.get(cleanId(patch.fieldId));
            if (!field) continue;
            const beforeValue = agentGetRecordFieldValue(editableRecord, field);
            const value = agentCoerceFieldValue(patch.value, field);
            const meta = agentSetRecordFieldValue(editableRecord, field, value);
            before.push({ fieldId: field.id, label: field.label, value: beforeValue });
            after.push({ fieldId: field.id, label: field.label, value });
            inverseFields.push({ fieldId: field.id, beforeValue, existed: meta.existed });
        }

        if (!after.length) throw new Error('Aucun champ valide à mettre à jour');

        editableRecord.updatedBy = req.user._id;
        await editableRecord.save();

        return {
            before: { fields: before },
            after: { fields: after },
            result: { updatedFields: after.map(item => ({ fieldId: item.fieldId, label: item.label })) },
            inverse: { tool: 'restore_fiche', fields: inverseFields }
        };
    }

    if (action.tool === 'create_task') {
        const canEdit = await canEditRecordModule(req, record._id, 'tasks');
        if (!canEdit) throw new Error('Accès en lecture seule aux tâches');

        const { list, created } = await agentEnsureTaskList(req, record._id, action.input?.listTitle);
        const priorityColors = {
            'Aucune': '', 'Basse': '#22c55e', 'Moyenne': '#f59e0b', 'Haute': '#ef4444', 'Urgente': '#dc2626'
        };
        const dueDate = action.input?.dueDate ? new Date(action.input.dueDate) : null;
        const task = await GlobalRecordTask.create({
            taskListId: list._id,
            recordId: record._id,
            title: action.input?.title || 'Action IA',
            description: action.input?.description || '',
            status: 'À faire',
            statusColor: '#9ca3af',
            priority: action.input?.priority || 'Moyenne',
            priorityColor: priorityColors[action.input?.priority] || '#f59e0b',
            dueDate: dueDate && !Number.isNaN(dueDate.getTime()) ? dueDate : null
        });

        return {
            before: null,
            after: { taskId: cleanId(task._id), title: task.title },
            result: { taskId: cleanId(task._id), title: task.title },
            inverse: { tool: 'delete_task', taskId: cleanId(task._id), taskListId: cleanId(list._id), taskListCreated: created }
        };
    }

    if (action.tool === 'update_task') {
        const canEdit = await canEditRecordModule(req, record._id, 'tasks');
        if (!canEdit) throw new Error('Accès en lecture seule aux tâches');

        const task = await GlobalRecordTask.findOne({ _id: action.input?.taskId, recordId: record._id });
        if (!task) throw new Error('Tâche introuvable');

        const before = {
            taskId: cleanId(task._id),
            title: task.title,
            description: task.description,
            status: task.status,
            statusColor: task.statusColor,
            priority: task.priority,
            priorityColor: task.priorityColor,
            dueDate: task.dueDate
        };
        const fields = agentObjectInput(action.input?.fields || {});
        const priorityColors = {
            'Aucune': '', 'Basse': '#22c55e', 'Moyenne': '#f59e0b', 'Haute': '#ef4444', 'Urgente': '#dc2626'
        };
        if (fields.title !== undefined) task.title = agentSafeString(fields.title, 180) || task.title;
        if (fields.description !== undefined) task.description = agentSafeString(fields.description, 4000);
        if (fields.status !== undefined) task.status = agentSafeString(fields.status, 80) || task.status;
        if (fields.priority !== undefined && priorityColors[fields.priority] !== undefined) {
            task.priority = fields.priority;
            task.priorityColor = priorityColors[fields.priority];
        }
        if (fields.dueDate !== undefined) {
            const dueDate = fields.dueDate ? new Date(fields.dueDate) : null;
            task.dueDate = dueDate && !Number.isNaN(dueDate.getTime()) ? dueDate : null;
        }
        await task.save();

        return {
            before,
            after: { taskId: cleanId(task._id), title: task.title },
            result: { taskId: cleanId(task._id), title: task.title },
            inverse: { tool: 'restore_task', task: before }
        };
    }

    if (action.tool === 'create_event') {
        const canEdit = await canEditRecordModule(req, record._id, 'agenda');
        if (!canEdit) throw new Error("Accès en lecture seule à l'agenda");

        const Entity = await tenantCollection(req, 'Entity');
        const Record = await tenantCollection(req, 'Record');
        const eventsEntity = await ensureEventsEntity(req);
        const parentEntity = await Entity.findById(record.entityId).select('slug').lean();
        const relationKey = parentEntity?.slug ? `event_${parentEntity.slug}` : null;
        const event = new Record({
            entityId: eventsEntity._id,
            title: action.input?.title || 'Nouvel événement',
            date: new Date(),
            end_date: null,
            published: true,
            customFields: [],
            classificationValues: [],
            relations: relationKey ? [{ relationKey, value: cleanId(record._id) }] : [],
            createdBy: req.user?._id
        });
        agentApplyEventFields(event, eventsEntity, action.input || {}, { includeDefaults: true });
        await agentComputeRecordDenorm(event, eventsEntity, Record, Entity);
        await event.save();

        return {
            before: null,
            after: { eventId: cleanId(event._id), title: event.title },
            result: { eventId: cleanId(event._id), title: event.title },
            inverse: { tool: 'delete_event', eventId: cleanId(event._id) }
        };
    }

    if (action.tool === 'update_event') {
        const canEdit = await canEditRecordModule(req, record._id, 'agenda');
        if (!canEdit) throw new Error("Accès en lecture seule à l'agenda");

        const Record = await tenantCollection(req, 'Record');
        const eventsEntity = await ensureEventsEntity(req);
        const event = await Record.findOne(agentEventRecordQuery(record, eventsEntity, action.input?.eventId));
        if (!event) throw new Error('Événement introuvable');

        const before = {
            eventId: cleanId(event._id),
            title: event.title || '',
            date: event.date || null,
            end_date: event.end_date || null,
            customFields: agentCloneWithoutMongoIds((event.customFields || []).map(item =>
                typeof item.toObject === 'function' ? item.toObject({ depopulate: true }) : item
            )),
            classificationValues: agentCloneWithoutMongoIds((event.classificationValues || []).map(item =>
                typeof item.toObject === 'function' ? item.toObject({ depopulate: true }) : item
            ))
        };
        agentApplyEventFields(event, eventsEntity, action.input?.fields || {});
        await event.save();

        return {
            before,
            after: { eventId: cleanId(event._id), title: event.title },
            result: { eventId: cleanId(event._id), title: event.title },
            inverse: { tool: 'restore_event', event: before }
        };
    }

    throw new Error(`Tool non supporté: ${action.tool}`);
}

async function undoAgentLog(req, record, entity, log) {
    const inverse = log.inverse || {};

    if (inverse.tool === 'archive_note' && inverse.noteId) {
        const RecordNote = await tenantCollection(req, 'RecordNote');
        await RecordNote.updateOne(
            { _id: inverse.noteId, recordId: record._id },
            { $set: { archived: true, updatedAt: new Date() } }
        );
        return;
    }

    if (inverse.tool === 'restore_note' && inverse.note?.noteId) {
        const RecordNote = await tenantCollection(req, 'RecordNote');
        await RecordNote.updateOne(
            { _id: inverse.note.noteId, recordId: record._id },
            {
                $set: {
                    title: inverse.note.title || 'Sans titre',
                    content: inverse.note.content || '',
                    color: inverse.note.color || '#8b5cf6',
                    icon: inverse.note.icon || 'solar:notebook-bold-duotone',
                    updatedAt: new Date()
                }
            }
        );
        return;
    }

    if (inverse.tool === 'delete_document' && inverse.documentId) {
        const Document = await tenantCollection(req, 'Document');
        const DocumentLine = await tenantCollection(req, 'DocumentLine');
        await Document.deleteOne({
            _id: inverse.documentId,
            createdBy: req.user._id,
            $or: [
                { 'metadata.createdByAgent': true },
                { isDraft: true },
                { 'generatedFrom.smartDocId': { $exists: true } }
            ]
        });
        if (DocumentLine) await DocumentLine.deleteMany({ documentId: inverse.documentId });
        return;
    }

    if (inverse.tool === 'restore_document' && inverse.document?.documentId) {
        const Document = await tenantCollection(req, 'Document');
        const document = await Document.findOne(agentDocumentRecordQuery(record, inverse.document.documentId));
        if (!document) return;
        document.name = inverse.document.name || document.name || 'Document';
        document.pages = Array.isArray(document.pages) ? document.pages : [];
        if (!document.pages[0]) {
            document.pages.push({
                content: '',
                mode: 'edition',
                elements: [],
                rows: [],
                background: { color: '#ffffff' },
                order: 0
            });
        }
        document.pages[0].content = inverse.document.page0Content || '';
        document.markModified('pages');
        await document.save();
        return;
    }

    if (inverse.tool === 'restore_fiche') {
        const Record = await tenantCollection(req, 'Record');
        const editableRecord = await Record.findById(record._id);
        if (!editableRecord) throw new Error('Fiche introuvable');
        const lookup = agentFieldLookup(agentBuildFieldCatalog(entity));
        for (const patch of (inverse.fields || [])) {
            const field = lookup.byId.get(cleanId(patch.fieldId));
            if (field) agentRestoreRecordFieldValue(editableRecord, field, patch);
        }
        editableRecord.updatedBy = req.user._id;
        await editableRecord.save();
        return;
    }

    if (inverse.tool === 'delete_task' && inverse.taskId) {
        await GlobalRecordTask.deleteOne({ _id: inverse.taskId, recordId: record._id });
        if (inverse.taskListCreated && inverse.taskListId) {
            const remaining = await GlobalRecordTask.countDocuments({ taskListId: inverse.taskListId });
            if (!remaining) await GlobalTaskList.deleteOne({ _id: inverse.taskListId, recordId: record._id });
        }
        return;
    }

    if (inverse.tool === 'restore_task' && inverse.task?.taskId) {
        await GlobalRecordTask.updateOne(
            { _id: inverse.task.taskId, recordId: record._id },
            {
                $set: {
                    title: inverse.task.title || 'Tâche',
                    description: inverse.task.description || '',
                    status: inverse.task.status || 'À faire',
                    statusColor: inverse.task.statusColor || '#9ca3af',
                    priority: inverse.task.priority || 'Aucune',
                    priorityColor: inverse.task.priorityColor || '',
                    dueDate: inverse.task.dueDate || null
                }
            }
        );
        return;
    }

    if (inverse.tool === 'delete_event' && inverse.eventId) {
        const Record = await tenantCollection(req, 'Record');
        const eventsEntity = await ensureEventsEntity(req);
        await Record.deleteOne(agentEventRecordQuery(record, eventsEntity, inverse.eventId));
        return;
    }

    if (inverse.tool === 'restore_event' && inverse.event?.eventId) {
        const Record = await tenantCollection(req, 'Record');
        const eventsEntity = await ensureEventsEntity(req);
        await Record.updateOne(
            agentEventRecordQuery(record, eventsEntity, inverse.event.eventId),
            {
                $set: {
                    title: inverse.event.title || 'Événement',
                    date: inverse.event.date || null,
                    end_date: inverse.event.end_date || null,
                    customFields: inverse.event.customFields || [],
                    classificationValues: inverse.event.classificationValues || []
                }
            }
        );
        return;
    }

    throw new Error("Action d'annulation non supportée");
}

router.get('/:recordId/agent/conversations', async (req, res) => {
    try {
        const { record, entity } = await loadRecordBundle(req, req.params.recordId);
        const conversations = await listAgentConversations(req, record, entity);
        res.json({ success: true, conversations });
    } catch (error) {
        console.error('[RecordAgent] list conversations error:', error);
        res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
});

router.post('/:recordId/agent/conversations', async (req, res) => {
    try {
        const { record, entity } = await loadRecordBundle(req, req.params.recordId);
        const RecordAgentConversation = await tenantCollection(req, 'RecordAgentConversation');
        const title = agentSafeString(req.body.title || '', 120) || 'Nouvelle conversation agent';
        const conversation = await RecordAgentConversation.create({
            recordId: record._id,
            entityId: record.entityId || entity?._id || null,
            userId: String(req.user._id),
            userName: req.user.name || req.user.email || '',
            title
        });

        res.json({ success: true, conversation: agentConversationPayload(conversation) });
    } catch (error) {
        console.error('[RecordAgent] create conversation error:', error);
        res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
});

router.get('/:recordId/agent/conversations/:conversationId', async (req, res) => {
    try {
        const { record } = await loadRecordBundle(req, req.params.recordId);
        const RecordAgentConversation = await tenantCollection(req, 'RecordAgentConversation');
        const RecordAgentRun = await tenantCollection(req, 'RecordAgentRun');
        const conversation = await RecordAgentConversation.findOne({
            _id: req.params.conversationId,
            recordId: record._id,
            userId: String(req.user._id),
            archived: { $ne: true }
        }).lean();

        if (!conversation) return res.status(404).json({ success: false, error: 'Conversation agent introuvable' });

        const runs = await RecordAgentRun.find({
            conversationId: conversation._id,
            recordId: record._id,
            userId: String(req.user._id),
            archived: { $ne: true }
        })
            .sort({ createdAt: -1 })
            .limit(60)
            .lean();

        res.json({
            success: true,
            conversation,
            runs: runs.map(run => agentRunPayload(req, run))
        });
    } catch (error) {
        console.error('[RecordAgent] get conversation error:', error);
        res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
});

router.patch('/:recordId/agent/conversations/:conversationId', async (req, res) => {
    try {
        const { record } = await loadRecordBundle(req, req.params.recordId);
        const RecordAgentConversation = await tenantCollection(req, 'RecordAgentConversation');
        const title = agentSafeString(req.body.title || '', 120);
        if (!title) return res.status(400).json({ success: false, error: 'Titre requis' });

        const conversation = await RecordAgentConversation.findOneAndUpdate(
            {
                _id: req.params.conversationId,
                recordId: record._id,
                userId: String(req.user._id),
                archived: { $ne: true }
            },
            { $set: { title } },
            { new: true }
        ).lean();

        if (!conversation) return res.status(404).json({ success: false, error: 'Conversation agent introuvable' });
        res.json({ success: true, conversation });
    } catch (error) {
        console.error('[RecordAgent] rename conversation error:', error);
        res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
});

router.delete('/:recordId/agent/conversations/:conversationId', async (req, res) => {
    try {
        const { record } = await loadRecordBundle(req, req.params.recordId);
        const RecordAgentConversation = await tenantCollection(req, 'RecordAgentConversation');
        const RecordAgentRun = await tenantCollection(req, 'RecordAgentRun');
        const archivedAt = new Date();
        const conversation = await RecordAgentConversation.findOneAndUpdate(
            {
                _id: req.params.conversationId,
                recordId: record._id,
                userId: String(req.user._id),
                archived: { $ne: true }
            },
            { $set: { archived: true, archivedAt } },
            { new: true }
        ).lean();

        if (!conversation) return res.status(404).json({ success: false, error: 'Conversation agent introuvable' });

        await RecordAgentRun.updateMany(
            {
                conversationId: conversation._id,
                recordId: record._id,
                userId: String(req.user._id)
            },
            { $set: { archived: true, archivedAt } }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('[RecordAgent] delete conversation error:', error);
        res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
});

router.get('/:recordId/agent/runs', async (req, res) => {
    try {
        const { record, entity } = await loadRecordBundle(req, req.params.recordId);
        await migrateLegacyAgentRunsToConversations(req, record, entity);
        const RecordAgentRun = await tenantCollection(req, 'RecordAgentRun');
        const runs = await RecordAgentRun.find({
            recordId: record._id,
            userId: String(req.user._id),
            archived: { $ne: true }
        })
            .sort({ updatedAt: -1 })
            .limit(30)
            .lean();

        res.json({ success: true, runs: runs.map(run => agentRunPayload(req, run)) });
    } catch (error) {
        console.error('[RecordAgent] list runs error:', error);
        res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
});

router.post('/:recordId/agent/runs', async (req, res) => {
    let run = null;
    try {
        const goal = agentSafeString(req.body.goal || req.body.message || '', 4000);
        if (!goal) return res.status(400).json({ success: false, error: 'Demande agent requise' });

        const { record, entity } = await loadRecordBundle(req, req.params.recordId);
        const RecordAgentRun = await tenantCollection(req, 'RecordAgentRun');
        let agentConversation = await ensureAgentConversation(req, record, entity, req.body.conversationId, goal);
        const priorRuns = await RecordAgentRun.find({
            conversationId: agentConversation._id,
            recordId: record._id,
            userId: String(req.user._id),
            archived: { $ne: true }
        })
            .sort({ createdAt: -1 })
            .limit(8)
            .lean();
        const priorRunsChronological = [...priorRuns].reverse();
        const requestedSelection = normalizeSelection(req.body.contextSelections || {});
        let contextDecision = agentContextDecision(goal, requestedSelection);
        const requestedCount = selectionItemCount(requestedSelection);
        let autoSelection = null;
        if (!requestedCount && !agentGoalLooksStandalone(goal)) {
            autoSelection = await agentDefaultSelection(req, record, entity, goal);
            if (contextDecision.mode !== 'full' && documentSelectionItemCount(autoSelection) > 0) {
                contextDecision = {
                    mode: 'full',
                    reason: 'auto_matched_document',
                    requestedCount
                };
            }
        }
        let selection = normalizeSelection({});
        if (contextDecision.mode === 'full') {
            selection = requestedCount > 0
                ? requestedSelection
                : (autoSelection || await agentDefaultSelection(req, record, entity, goal));
        }
        const engineSettings = await getRecordAiEngineSettings(req);
        const engineRuntime = resolveEngineRuntime(engineSettings);
        let selectedContext = emptySelectedContext(contextDecision);
        let contextItems = [];
        let availableContextItems = [];
        let contextInventoryText = '';

        if (contextDecision.mode === 'full' && selectionItemCount(selection) > 0) {
            selectedContext = await buildSelectedContext(req, record, entity, selection, { query: goal, engineSettings });
            contextItems = await buildContextItems(req, record, entity, selection);
        } else if (contextDecision.mode === 'inventory' && requestedCount > 0) {
            availableContextItems = await buildContextItems(req, record, entity, requestedSelection);
            contextInventoryText = agentBuildContextInventoryText(availableContextItems, requestedSelection, contextDecision);
        }

        const contextStats = {
            ...(selectedContext.stats || {}),
            strategy: contextDecision.mode,
            reason: contextDecision.reason,
            requestedContextItems: requestedCount,
            usedContextItems: contextItems.length,
            inventoryContextItems: availableContextItems.length
        };
        const fieldCatalog = agentBuildFieldCatalog(entity);
        const toolCatalog = await agentBuildToolCatalog(req, record, entity);

        run = await RecordAgentRun.create({
            recordId: record._id,
            entityId: record.entityId,
            conversationId: agentConversation._id,
            userId: String(req.user._id),
            userName: req.user.name || req.user.email || '',
            goal,
            status: 'drafting',
            contextSelections: persistableSelection(selection),
            contextItems,
            contextFingerprint: selectedContext.fingerprint || '',
            contextStats,
            engine: engineRuntime,
            plan: agentNormalizePlan({}),
            proposedActions: []
        });

        const aiResult = await callRecordAI(req, {
            conversationId: agentConversation._id,
            recordId: record._id,
            instructions: buildAgentInstructions(record, entity, fieldCatalog, toolCatalog),
            input: buildAgentInput(goal, selectedContext, {
                ...contextDecision,
                inventoryText: contextInventoryText,
                historyText: agentHistoryTextFromRuns(priorRunsChronological)
            }),
            previousResponseId: null,
            engineSettings,
            historyMessages: [],
            maxOutputTokens: RECORD_AI_AGENT_OUTPUT_TOKENS
        });

        let parsed;
        try {
            parsed = agentExtractJson(aiResult.content);
        } catch (parseError) {
            const fallbackContent = agentFallbackTextFromAiContent(aiResult.content);
            parsed = {
                summary: shortPlainText(fallbackContent, 1200),
                plan: { title: 'Plan agent', steps: [{ type: 'review', title: 'Créer une note de synthèse', detail: 'La réponse IA n’était pas structurée en tools.' }] },
                actions: [{
                    tool: 'create_note',
                    title: 'Créer une note',
                    description: 'Créer une note avec la réponse de l’agent',
                    input: {
                        title: 'Analyse IA',
                        contentMarkdown: fallbackContent
                    }
                }]
            };
        }

        let actions = agentNormalizeActions(parsed, record, fieldCatalog, toolCatalog);
        actions = agentEnsureTemplateGenerationActions(actions, goal, parsed, toolCatalog);
        run.summary = agentSafeString(parsed.summary || 'Plan prêt à valider.', 3000);
        run.plan = agentNormalizePlan(parsed);
        run.proposedActions = actions;
        run.aiRaw = aiResult.content || '';
        run.status = actions.length ? 'review' : 'error';
        run.error = actions.length ? '' : "L'agent n'a proposé aucune action exploitable.";
        run.debugPayload = RECORD_AI_DEBUG_ENABLED ? {
            phase: 'agent',
            createdAt: new Date(),
            goal,
            contextDecision,
            requestedContextSelections: debugSelection(requestedSelection),
            contextSelections: debugSelection(selection),
            contextItems,
            availableContextItems,
            contextStats,
            contextInventoryText,
            contextText: clipDebugText(selectedContext.text || '').text,
            toolCatalog: {
                notes: (toolCatalog.notes || []).map(note => ({ id: note.id, title: note.title, protected: note.protected })),
                templates: (toolCatalog.templates || []).map(template => ({ id: template.id, name: template.name, inputFields: template.inputFields })),
                documents: (toolCatalog.documents || []).map(document => ({ id: document.id, name: document.name, status: document.status, draft: document.draft })),
                tasks: (toolCatalog.tasks || []).map(task => ({ id: task.id, title: task.title, status: task.status, priority: task.priority })),
                events: (toolCatalog.events || []).map(event => ({ id: event.id, title: event.title, date: event.date, status: event.status })),
                eventStatuses: toolCatalog.eventStatuses || [],
                eventTypes: toolCatalog.eventTypes || []
            },
            engineRuntime,
            parsed
        } : null;
        await run.save();
        agentConversation = await updateAgentConversationFromRun(req, agentConversation, run);

        res.json({ success: true, run: agentRunPayload(req, run), conversation: agentConversationPayload(agentConversation) });
    } catch (error) {
        console.error('[RecordAgent] create run error:', error);
        if (run) {
            run.status = 'error';
            run.error = error.message;
            await run.save().catch(() => {});
        }
        res.status(error.statusCode || 500).json({ success: false, error: error.message, run: run ? agentRunPayload(req, run) : null });
    }
});

router.get('/:recordId/agent/runs/:runId', async (req, res) => {
    try {
        const { run } = await requireAgentRun(req, req.params.recordId, req.params.runId);
        res.json({ success: true, run: agentRunPayload(req, run) });
    } catch (error) {
        console.error('[RecordAgent] get run error:', error);
        res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
});

router.post('/:recordId/agent/runs/:runId/apply', async (req, res) => {
    try {
        const { record, entity, run } = await requireAgentRun(req, req.params.recordId, req.params.runId);
        if (!['review', 'partial'].includes(run.status)) {
            return res.status(400).json({ success: false, error: 'Ce run ne peut pas être appliqué dans son état actuel' });
        }

        const requestedIds = Array.isArray(req.body.actionIds) ? new Set(req.body.actionIds.map(cleanId)) : null;
        const actions = (run.proposedActions || []).filter(action => {
            if (requestedIds && !requestedIds.has(action.id)) return false;
            return ['proposed', 'failed'].includes(action.status);
        });

        if (!actions.length) return res.status(400).json({ success: false, error: 'Aucune action à appliquer' });

        run.status = 'applying';
        await run.save();

        for (const action of actions) {
            try {
                const result = await applyAgentAction(req, record, entity, action);
                action.status = 'applied';
                action.error = '';
                action.result = result.result;
                action.appliedAt = new Date();
                run.executionLog.push({
                    actionId: action.id,
                    tool: action.tool,
                    status: 'applied',
                    before: result.before,
                    after: result.after,
                    inverse: result.inverse,
                    result: result.result,
                    appliedAt: action.appliedAt,
                    actorId: String(req.user._id)
                });
            } catch (actionError) {
                action.status = 'failed';
                action.error = actionError.message;
                run.executionLog.push({
                    actionId: action.id,
                    tool: action.tool,
                    status: 'failed',
                    error: actionError.message,
                    appliedAt: new Date(),
                    actorId: String(req.user._id)
                });
            }
        }

        const appliedCount = run.proposedActions.filter(action => action.status === 'applied').length;
        const failedCount = run.proposedActions.filter(action => action.status === 'failed').length;
        run.status = failedCount > 0 ? (appliedCount > 0 ? 'partial' : 'review') : 'applied';
        await run.save();
        let conversation = null;
        if (run.conversationId) {
            const RecordAgentConversation = await tenantCollection(req, 'RecordAgentConversation');
            conversation = await RecordAgentConversation.findOne({
                _id: run.conversationId,
                recordId: record._id,
                userId: String(req.user._id),
                archived: { $ne: true }
            });
            if (conversation) conversation = await updateAgentConversationFromRun(req, conversation, run);
        }

        res.json({ success: true, run: agentRunPayload(req, run), conversation: agentConversationPayload(conversation) });
    } catch (error) {
        console.error('[RecordAgent] apply run error:', error);
        res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
});

router.post('/:recordId/agent/runs/:runId/undo', async (req, res) => {
    try {
        const { record, entity, run } = await requireAgentRun(req, req.params.recordId, req.params.runId);
        const appliedLogs = (run.executionLog || [])
            .filter(log => log.status === 'applied')
            .reverse();

        if (!appliedLogs.length) return res.status(400).json({ success: false, error: 'Aucune action appliquée à annuler' });

        run.status = 'undoing';
        await run.save();

        for (const log of appliedLogs) {
            await undoAgentLog(req, record, entity, log);
            log.status = 'undone';
            log.undoneAt = new Date();
            const action = run.proposedActions.find(item => item.id === log.actionId);
            if (action) {
                action.status = 'undone';
                action.undoneAt = log.undoneAt;
            }
        }

        run.status = 'undone';
        await run.save();
        let conversation = null;
        if (run.conversationId) {
            const RecordAgentConversation = await tenantCollection(req, 'RecordAgentConversation');
            conversation = await RecordAgentConversation.findOne({
                _id: run.conversationId,
                recordId: record._id,
                userId: String(req.user._id),
                archived: { $ne: true }
            });
            if (conversation) conversation = await updateAgentConversationFromRun(req, conversation, run);
        }

        res.json({ success: true, run: agentRunPayload(req, run), conversation: agentConversationPayload(conversation) });
    } catch (error) {
        console.error('[RecordAgent] undo run error:', error);
        res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
});

module.exports = router;
