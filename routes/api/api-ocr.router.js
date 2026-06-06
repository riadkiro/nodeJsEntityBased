/**
 * OCR API Router
 *
 * Converts PDFs and raster images to plain text so the result can be sent to an
 * AI model for analysis. Supports direct uploads, Drive files, and record
 * attachments.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const crypto = require('crypto');
const fileType = require('file-type');
const { tenantCollection } = require('../../middleware/tenant');
const { sanitizeUploadedFilename } = require('../../utils/filename-encoding');
const OcrService = require('../../services/ocr.service');
const { createOpenAIVisionOcrPageCallback } = require('../../services/openai-vision-ocr.service');

const OCR_UPLOAD_ROOT = path.join(__dirname, '../../private_uploads/ocr-temp');
const MAX_UPLOAD_SIZE = Number(process.env.OCR_MAX_UPLOAD_MB || 50) * 1024 * 1024;
const OCR_OPENAI_FALLBACK_ENABLED = process.env.OCR_OPENAI_FALLBACK_ENABLED !== 'false';
const OCR_OPENAI_FALLBACK_MAX_PAGES = boundedInt(process.env.OCR_OPENAI_FALLBACK_MAX_PAGES, 2, 0, 20);

const allowedMimeTypes = new Set([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/bmp',
    'image/tiff',
    'image/gif'
]);

const allowedExtensions = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tif', '.tiff', '.gif']);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uuid = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const dir = path.join(OCR_UPLOAD_ROOT, String(req.account_number), uuid);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        file.originalname = sanitizeUploadedFilename(file.originalname);
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: MAX_UPLOAD_SIZE },
    fileFilter: (req, file, cb) => {
        file.originalname = sanitizeUploadedFilename(file.originalname);
        const ext = path.extname(file.originalname).toLowerCase();
        if (!allowedMimeTypes.has(file.mimetype) && !allowedExtensions.has(ext)) {
            return cb(new Error(`Type de fichier non supporté par l'OCR: ${file.mimetype || ext}`), false);
        }
        cb(null, true);
    }
});

router.get('/ocr/health', (req, res) => {
    res.json({
        success: true,
        service: 'ocr',
        supportedMimeTypes: Array.from(allowedMimeTypes),
        defaultLanguage: process.env.OCR_DEFAULT_LANGUAGE || 'fra+eng',
        defaultMaxPages: Number(process.env.OCR_MAX_PAGES || 20)
    });
});

/**
 * POST /api/ocr/extract
 * multipart/form-data:
 *   - file: PDF or image
 *   - language: optional, default fra+eng
 *   - mode: auto | text | ocr
 *   - maxPages: optional PDF page limit
 */
router.post('/ocr/extract', (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) return res.status(400).json({ success: false, error: err.message });
        next();
    });
}, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Aucun fichier fourni.' });
        }

        await validateUploadedFile(req.file);
        const result = await extractFromPath(req.file.path, {
            originalName: req.file.originalname,
            mimeType: req.file.detectedMimeType || req.file.mimetype,
            body: req.body,
            req
        });

        res.json(result);
    } catch (error) {
        console.error('[OCR] extract upload error:', error);
        res.status(500).json({ success: false, error: error.message || 'OCR impossible.' });
    } finally {
        await cleanupUpload(req.file);
    }
});

/**
 * POST /api/ocr/drive/:fileId
 * OCR an existing account-level Drive file.
 */
router.post('/ocr/drive/:fileId', async (req, res) => {
    try {
        const DriveFile = await tenantCollection(req, 'DriveFile');
        const file = await DriveFile.findById(req.params.fileId).lean();
        if (!file) return res.status(404).json({ success: false, error: 'Fichier Drive introuvable.' });

        const filePath = resolveAttachmentPath(req.account_number, file.filename);
        const result = await extractFromPath(filePath, {
            originalName: file.originalName || file.filename,
            mimeType: file.mimeType,
            body: req.body,
            req
        });

        res.json(result);
    } catch (error) {
        console.error('[OCR] drive file error:', error);
        res.status(500).json({ success: false, error: error.message || 'OCR impossible.' });
    }
});

/**
 * POST /api/ocr/records/:recordId/attachments/:attachmentId
 * OCR an existing record attachment.
 */
router.post('/ocr/records/:recordId/attachments/:attachmentId', async (req, res) => {
    try {
        const Record = await tenantCollection(req, 'Record');
        const record = await Record.findById(req.params.recordId);
        if (!record) return res.status(404).json({ success: false, error: 'Record introuvable.' });

        const attachment = record.attachments?.id(req.params.attachmentId);
        if (!attachment) return res.status(404).json({ success: false, error: 'Pièce jointe introuvable.' });
        if (attachment.isDataRoomOnly) {
            return res.status(403).json({ success: false, error: 'Ce fichier est réservé à la Data Room.' });
        }

        const filePath = resolveAttachmentPath(req.account_number, attachment.filename);
        const result = await extractFromPath(filePath, {
            originalName: attachment.originalName || attachment.filename,
            mimeType: attachment.mimeType,
            body: req.body,
            req
        });

        res.json(result);
    } catch (error) {
        console.error('[OCR] attachment error:', error);
        res.status(500).json({ success: false, error: error.message || 'OCR impossible.' });
    }
});

async function extractFromPath(filePath, { originalName, mimeType, body, req }) {
    const visionFallback = buildVisionFallbackOptions(body);
    const options = {
        originalName,
        mimeType,
        language: body?.language,
        mode: body?.mode,
        maxPages: body?.maxPages,
        renderScale: body?.renderScale
    };

    if (visionFallback.enabled && req?.tenantDbConnection) {
        options.visionFallback = visionFallback;
        options.visionOcrPage = createOpenAIVisionOcrPageCallback(req);
    }

    return OcrService.extractTextFromFile(filePath, options);
}

function buildVisionFallbackOptions(body = {}) {
    const rawMode = body?.visionFallback ?? body?.openAiFallback ?? body?.openaiFallback ?? 'auto';
    const normalized = String(rawMode || 'auto').trim().toLowerCase();
    const disabled = ['false', '0', 'off', 'none', 'local'].includes(normalized);
    const mode = ['force', 'always'].includes(normalized) ? 'force' : (disabled ? 'off' : 'auto');

    return {
        enabled: OCR_OPENAI_FALLBACK_ENABLED && !disabled,
        mode,
        maxPages: boundedInt(body?.visionMaxPages || body?.fallbackMaxPages, OCR_OPENAI_FALLBACK_MAX_PAGES, 0, 20),
        query: body?.query || body?.prompt || body?.goal || body?.message || '',
        requestedPages: body?.requestedPages,
        fallbackImages: body?.fallbackImages,
        fallbackTables: body?.fallbackTables,
        minChars: body?.fallbackMinChars,
        minConfidence: body?.fallbackMinConfidence,
        forceRequestedPages: body?.forceRequestedPages
    };
}

async function validateUploadedFile(file) {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const detected = await fileType.fromFile(file.path);
    const effectiveMime = detected?.mime || file.mimetype;

    if (!allowedExtensions.has(ext)) {
        throw new Error(`Extension non supportée par l'OCR: ${ext || 'sans extension'}`);
    }

    if (detected && !allowedMimeTypes.has(detected.mime)) {
        throw new Error(`Contenu de fichier non supporté par l'OCR: ${detected.mime}`);
    }

    if (!detected && ext !== '.bmp') {
        throw new Error(`Signature de fichier invalide ou fichier corrompu: ${file.originalname}`);
    }

    if (!allowedMimeTypes.has(effectiveMime) && !(ext === '.bmp' && file.mimetype === 'image/bmp')) {
        throw new Error(`Type de fichier non supporté par l'OCR: ${effectiveMime}`);
    }

    file.detectedMimeType = effectiveMime;
}

function resolveAttachmentPath(accountNumber, filename) {
    if (!filename || filename.includes('..')) {
        throw new Error('Chemin de fichier invalide.');
    }

    const privatePath = path.join(__dirname, '../../private_uploads/attachments', String(accountNumber), filename);
    if (fs.existsSync(privatePath)) return privatePath;

    const publicPath = path.join(__dirname, '../../public/uploads/attachments', String(accountNumber), filename);
    if (fs.existsSync(publicPath)) return publicPath;

    throw new Error('Fichier introuvable sur le disque.');
}

async function cleanupUpload(file) {
    if (!file?.path) return;
    const dir = path.dirname(file.path);
    try {
        await fsp.rm(dir, { recursive: true, force: true });
    } catch (error) {
        console.warn('[OCR] cleanup failed:', error.message);
    }
}

function boundedInt(value, fallback, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, Math.round(number)));
}

module.exports = router;
