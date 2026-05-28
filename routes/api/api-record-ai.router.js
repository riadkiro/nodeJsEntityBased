const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const mongoose = require('mongoose');
const { tenantCollection } = require('../../middleware/tenant');
const { canAccessRecord } = require('../../middleware/shared-records-helper');
const OcrService = require('../../services/ocr.service');
const IntegrationService = require('../../src/integrations/services/IntegrationService');
const IntegrationProvider = require('../../src/integrations/models/IntegrationProvider.model');
const IntegrationAction = require('../../src/integrations/models/IntegrationAction.model');
const IntegrationConnectionSchema = require('../../src/integrations/models/IntegrationConnection.model').schema;
const IntegrationLogSchema = require('../../src/integrations/models/IntegrationLog.model').schema;

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
const OCR_CACHE_DIR = path.join(__dirname, '../../private_uploads/ocr-cache/record-ai');

const OCR_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tif', '.tiff', '.gif']);
const OCR_MIME_PREFIXES = ['image/'];
const OCR_MIME_TYPES = new Set(['application/pdf']);

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
            .filter(upload => upload.text.trim())
        : [];

    return {
        fields: [...new Set(fields)],
        notes: [...new Set(notes)],
        chats: [...new Set(chats)],
        files: uniqueFiles(files),
        uploads
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

async function buildBootstrap(req, record, entity) {
    const RecordNote = await tenantCollection(req, 'RecordNote');
    const Conversation = await tenantCollection(req, 'Conversation');
    const DriveFile = await tenantCollection(req, 'DriveFile');

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

    return {
        record: {
            id: record._id,
            title: record.computedTitle || record.title || 'Sans titre',
            entityName: entity?.nameSingular || entity?.name || 'Fiche'
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
        files: [...recordFiles, ...driveFiles],
        limits: {
            maxContextChars: MAX_CONTEXT_CHARS
        }
    };
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

async function buildSelectedContext(req, record, entity, selection) {
    const stats = { sections: 0, chars: 0, truncated: false, sources: [], errors: [] };
    const sections = [];

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

    if (selection.files?.length) {
        const fileBlocks = [];
        for (const file of selection.files.slice(0, 5)) {
            try {
                const extracted = await extractSelectedFile(req, record, file);
                const limited = limitText(extracted.text, MAX_FILE_CHARS);
                fileBlocks.push(`### ${extracted.name}\n${limited.text}`);
                stats.truncated = stats.truncated || limited.truncated;
            } catch (error) {
                stats.errors.push(`${file.name || file.id}: ${error.message}`);
            }
        }
        addSection(sections, stats, 'Documents OCR sélectionnés', fileBlocks.join('\n\n'), MAX_FILE_CHARS, { type: 'files' });
    }

    if (selection.uploads?.length) {
        const text = selection.uploads
            .slice(0, 4)
            .map(upload => {
                const limited = limitText(upload.text, MAX_UPLOAD_CHARS);
                stats.truncated = stats.truncated || limited.truncated;
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
        stats
    };
}

async function extractSelectedFile(req, record, selectedFile) {
    if (selectedFile.source === 'drive') {
        const DriveFile = await tenantCollection(req, 'DriveFile');
        const driveFile = await DriveFile.findById(selectedFile.id).lean();
        if (!driveFile) throw new Error('Fichier Drive introuvable');
        return extractFileWithCache(req, {
            source: 'drive',
            id: driveFile._id,
            filename: driveFile.filename,
            name: driveFile.originalName || driveFile.filename,
            mimeType: driveFile.mimeType
        });
    }

    const attachment = (record.attachments || []).find(file => cleanId(file._id) === selectedFile.id);
    if (!attachment) throw new Error('Pièce jointe introuvable');
    if (attachment.isDataRoomOnly) throw new Error('Fichier réservé à la Data Room');

    return extractFileWithCache(req, {
        source: 'record',
        id: attachment._id,
        filename: attachment.filename,
        name: attachment.originalName || attachment.filename,
        mimeType: attachment.mimeType
    });
}

async function extractFileWithCache(req, file) {
    const filePath = resolveAttachmentPath(req.account_number, file.filename);
    const stat = await fsp.stat(filePath);
    const cacheKey = hashText([
        req.account_number,
        file.source,
        file.id,
        file.filename,
        stat.size,
        stat.mtimeMs,
        'maxPages:12'
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
        maxPages: 12
    });

    const payload = {
        name: file.name,
        text: result.text || '',
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
        "Ne propose pas de correctifs ou d'actions à appliquer sauf si l'utilisateur le demande explicitement.",
        "Quand tu t'appuies sur un document, une note ou un chat précis, cite brièvement la source dans la réponse."
    ].join('\n');
}

async function callRecordAI(req, { conversationId, recordId, instructions, input, previousResponseId }) {
    const { ConnectionModel, LogModel } = getTenantIntegrationModels(req);
    const action = await IntegrationAction.findOne({
        providerKey: 'openai',
        actionKey: 'responses'
    });

    if (!action) throw new Error('Responses action not found. Please seed the OpenAI actions.');

    const inputPayload = {
        model: RECORD_AI_MODEL,
        input,
        max_output_tokens: 3500,
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
    if (!/^gpt-5(?:[.-]|$)/.test(RECORD_AI_MODEL)) inputPayload.temperature = 0.35;

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
        responseId: result.data?.id || result.raw?.id || ''
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
            contextStats: message.contextStats || undefined,
            createdAt: message.createdAt ? new Date(message.createdAt) : new Date()
        }));
}

function defaultConversationTitle(message) {
    const clean = stripHtml(message || '').replace(/\s+/g, ' ').trim();
    if (!clean) return 'Nouvelle conversation';
    return clean.length > 48 ? `${clean.slice(0, 48)}...` : clean;
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

        res.json({ success: true, ...bootstrap, conversations });
    } catch (error) {
        console.error('[RecordAI] bootstrap error:', error);
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

        const conversation = await RecordAiConversation.create({
            recordId: record._id,
            entityId: record.entityId,
            userId: String(req.user._id),
            title: title.slice(0, 120),
            model: RECORD_AI_MODEL,
            contextSelections: persistableSelection(selection)
        });

        res.json({ success: true, conversation });
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
        res.json({ success: true, conversation });
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
        res.json({ success: true, conversation });
    } catch (error) {
        console.error('[RecordAI] patch conversation error:', error);
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

        const selection = normalizeSelection(req.body.contextSelections || conversation.contextSelections || {});
        const selectedContext = await buildSelectedContext(req, record, entity, selection);
        const previousResponseId = conversation.openAI?.responseId || null;
        const contextChanged = selectedContext.fingerprint !== conversation.contextFingerprint;
        const includeContext = Boolean(selectedContext.text && (!previousResponseId || contextChanged || req.body.forceContext));
        const input = buildAiInput(message, includeContext ? selectedContext.text : '');

        const aiResult = await callRecordAI(req, {
            conversationId: conversation._id,
            recordId: record._id,
            instructions: previousResponseId ? null : buildInstructions(record, entity),
            input,
            previousResponseId
        });

        const userMessage = {
            role: 'user',
            content: message,
            contextStats: {
                sections: selectedContext.stats.sections,
                chars: selectedContext.stats.chars,
                estimatedTokens: selectedContext.stats.estimatedTokens,
                included: includeContext
            },
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
        conversation.model = RECORD_AI_MODEL;
        conversation.contextSelections = persistableSelection(selection);
        conversation.contextFingerprint = selectedContext.fingerprint;
        conversation.openAI = {
            responseId: aiResult.responseId || '',
            updatedAt: aiResult.responseId ? new Date() : null
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
            conversation: conversation.toObject(),
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

module.exports = router;
