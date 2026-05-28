/**
 * Global Drive API Router
 * 
 * Aggregates all attachments across all records in the tenant,
 * grouped by Entity > Record > Folder.
 * Also provides account-level Drive: folders & files (DriveFile collection).
 * 
 * Routes:
 *   GET /api/drive          - Get all attachments grouped by entity/record
 *   GET /api/drive/files    - List account-level drive files
 *   POST /api/drive/folders - Create an account-level folder
 *   PUT /api/drive/folders/:name    - Rename a folder
 *   DELETE /api/drive/folders/:name - Delete a folder
 *   POST /api/drive/upload          - Upload files at account level
 *   DELETE /api/drive/files/:id     - Delete a drive file
 *   PATCH /api/drive/files/:id      - Update file metadata
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');
const { tenantCollection } = require('../../middleware/tenant');
const Account = require('../../models/account.model');
const {
    sanitizeUploadedFilename,
    normalizeFieldArray,
    uploadPathBasename,
    uploadPathDirname,
    joinUploadFolder,
} = require('../../utils/filename-encoding');

const RECORD_AI_RAG_ENABLED = process.env.RECORD_AI_RAG_ENABLED !== 'false';
const RECORD_AI_RAG_MAX_PAGES = boundedInt(process.env.RECORD_AI_RAG_MAX_PAGES, 200, 1, 250);
const RECORD_AI_RAG_CHUNK_CHARS = boundedInt(process.env.RECORD_AI_RAG_CHUNK_CHARS, 1800, 600, 5000);
const RECORD_AI_RAG_CHUNK_OVERLAP = boundedInt(process.env.RECORD_AI_RAG_CHUNK_OVERLAP, 220, 0, 1200);

function boundedInt(value, fallback, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, Math.round(number)));
}

function cleanId(value) {
    if (!value || value === 'null' || value === 'undefined') return '';
    return String(value);
}

function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hashText(value) {
    return crypto.createHash('sha256').update(String(value || '')).digest('hex');
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

function driveRagStatusPayload(document, canonicalDocument = null, fallback = {}) {
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

async function enrichDriveFilesWithRagStatus(req, files = []) {
    if (!files.length || !RECORD_AI_RAG_ENABLED) return files;

    let RecordAiDocument;
    try {
        RecordAiDocument = await tenantCollection(req, 'RecordAiDocument');
    } catch (_) {
        return files;
    }
    if (!RecordAiDocument) return files;

    const sourceFilters = files
        .filter(file => file._id)
        .map(file => ({ source: 'drive', sourceId: cleanId(file._id) }));
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

    const hashByFileId = new Map();
    const getContentHashForFile = async (file) => {
        const key = cleanId(file._id);
        if (hashByFileId.has(key)) return hashByFileId.get(key);
        if (!file.filename) {
            hashByFileId.set(key, '');
            return '';
        }
        try {
            const filePath = resolveAttachmentPath(req.account_number, file.filename);
            const contentHash = await hashFileContent(filePath);
            hashByFileId.set(key, contentHash);
            return contentHash;
        } catch (_) {
            hashByFileId.set(key, '');
            return '';
        }
    };

    const enriched = [];
    for (const file of files) {
        const sourceId = cleanId(file._id);
        const direct = directBySource.get(`drive:${sourceId}`);
        const directCanonical = direct?.contentHash ? canonicalByHash.get(direct.contentHash) : null;

        if (direct) {
            enriched.push({
                ...file,
                rag: driveRagStatusPayload(direct, directCanonical || direct)
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
                    rag: driveRagStatusPayload(canonical, canonical, {
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

async function directRagStatusMap(req, source, sourceIds = []) {
    const ids = [...new Set(sourceIds.map(cleanId).filter(Boolean))];
    if (!ids.length || !RECORD_AI_RAG_ENABLED) return new Map();

    let RecordAiDocument;
    try {
        RecordAiDocument = await tenantCollection(req, 'RecordAiDocument');
    } catch (_) {
        return new Map();
    }
    if (!RecordAiDocument) return new Map();

    const documents = await RecordAiDocument.find({
        source,
        sourceId: { $in: ids },
        status: 'ready',
        chunkCount: { $gt: 0 }
    }).sort({ indexedAt: 1, updatedAt: 1 }).lean();
    if (!documents.length) return new Map();

    const configHash = ragConfigHash();
    const hashes = [...new Set(documents.map(document => document.contentHash).filter(Boolean))];
    const canonicalByHash = new Map();
    if (hashes.length) {
        const canonicalDocs = await RecordAiDocument.find({
            contentHash: { $in: hashes },
            ragConfigHash: configHash,
            status: 'ready',
            chunkCount: { $gt: 0 }
        }).sort({ indexedAt: 1, updatedAt: 1 }).lean();
        canonicalDocs.forEach(document => {
            if (document.contentHash && !canonicalByHash.has(document.contentHash)) {
                canonicalByHash.set(document.contentHash, document);
            }
        });
    }

    const statuses = new Map();
    documents.forEach(document => {
        if (statuses.has(document.sourceId)) return;
        statuses.set(document.sourceId, driveRagStatusPayload(document, canonicalByHash.get(document.contentHash) || document));
    });
    return statuses;
}

// ============================================================================
// Multer Configuration (same security as api-attachment.router.js)
// ============================================================================

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uuid = crypto.randomUUID ? crypto.randomUUID() : (Date.now() + '-' + Math.round(Math.random() * 1E9));
        const dir = path.join(__dirname, '../../private_uploads/attachments', String(req.account_number), uuid);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

// Allowed MIME types
const allowedMimeTypes = [
    // Images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp',
    // PDF
    'application/pdf',
    // Word
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Excel
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // PowerPoint
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Video
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo',
    // Audio
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4',
    // Archives
    'application/zip', 'application/x-rar-compressed', 'application/gzip',
    // Text
    'text/plain', 'text/csv',
    // Other
    'application/json', 'application/xml'
];

// Strict extension blocklist for executables and malicious scripts
const forbiddenExts = [
    // Windows executables
    '.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.msi', '.msp', '.mst',
    // Script files
    '.js', '.jse', '.vbs', '.vbe', '.wsf', '.wsh', '.ps1', '.psm1', '.psd1',
    // Server-side scripts
    '.php', '.php3', '.php4', '.php5', '.phtml', '.py', '.rb', '.pl', '.cgi', '.asp', '.aspx', '.jsp',
    // Java / .NET
    '.jar', '.war', '.class',
    // Shell scripts
    '.sh', '.bash', '.zsh', '.ksh',
    // Dynamic libraries
    '.dll', '.so', '.dylib',
    // Windows special
    '.hta', '.inf', '.reg', '.rgs', '.sct', '.url', '.lnk',
    // macOS
    '.app', '.command', '.action',
];

/**
 * Sanitize a filename to remove dangerous characters
 */
function sanitizeFilename(name) {
    return sanitizeUploadedFilename(name);
}

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
    fileFilter: (req, file, cb) => {
        file.originalname = sanitizeFilename(file.originalname);

        const ext = path.extname(file.originalname).toLowerCase();

        // Block forbidden extensions
        if (forbiddenExts.includes(ext)) {
            return cb(new Error(`Extension de fichier interdite pour des raisons de sécurité: ${ext}`), false);
        }

        // Block double extensions (e.g. file.pdf.exe, image.jpg.php)
        const parts = file.originalname.split('.');
        if (parts.length > 2) {
            for (let i = 1; i < parts.length; i++) {
                const possibleExt = '.' + parts[i].toLowerCase();
                if (forbiddenExts.includes(possibleExt)) {
                    return cb(new Error(`Extension cachée détectée (double extension): ${file.originalname}`), false);
                }
            }
        }

        // Check MIME whitelist
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`), false);
        }
    }
});

// ============================================================================
// Helpers
// ============================================================================

/**
 * Detect file category from MIME type
 */
function detectCategory(mimeType) {
    if (!mimeType) return 'other';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'word';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'excel';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'other';
}

/**
 * Format file size for display
 */
function formatSize(bytes) {
    if (!bytes) return '0 o';
    if (bytes < 1024) return bytes + ' o';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' Go';
}

// ============================================================================
// Account-Level Drive: Folders & Files
// ============================================================================

/**
 * GET /api/drive/files
 * List files at account level, optionally filtered by folder
 * Query: ?folder=Marketing
 */
router.get('/drive/files', async (req, res) => {
    try {
        const DriveFile = await tenantCollection(req, 'DriveFile');
        const account = await Account.findOne({ account_number: req.account_number }).lean();
        const query = {};
        if (req.query.folder) query.folder = { $regex: `^${escapeRegex(req.query.folder)}($|/)` };
        else query.folder = { $in: ['', null] }; // root files
        const files = await DriveFile.find(query).sort({ uploadedAt: -1 }).lean();
        // Format files
        const formatted = await enrichDriveFilesWithRagStatus(req, files.map(f => ({
            _id: f._id,
            filename: f.filename,
            originalName: f.originalName,
            mimeType: f.mimeType,
            size: f.size,
            sizeFormatted: formatSize(f.size),
            category: f.category || 'other',
            folder: f.folder || '',
            url: `/account/${req.account_number}/uploads/attachments/${f.filename}`,
            uploadedAt: f.uploadedAt,
        })));
        res.json({ success: true, files: formatted, folders: account?.driveFolders || [] });
    } catch(err) {
        console.error('[Drive] files error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/drive/folders
 * Create a folder at account level
 * Body: { name: 'Marketing' }
 */
router.post('/drive/folders', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ error: 'Nom requis' });
        const account = await Account.findOne({ account_number: req.account_number });
        if (!account) return res.status(404).json({ error: 'Account introuvable' });
        if (!account.driveFolders) account.driveFolders = [];
        const trimmed = name.trim();
        if (account.driveFolders.includes(trimmed)) return res.status(400).json({ error: 'Ce dossier existe déjà' });
        account.driveFolders.push(trimmed);
        await account.save();
        res.json({ success: true, folders: account.driveFolders });
    } catch(err) {
        console.error('[Drive] create folder error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * PUT /api/drive/folders/:name
 * Rename a folder
 * Body: { newName: 'RH' }
 */
router.put('/drive/folders/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const { newName } = req.body;
        if (!newName || !newName.trim()) return res.status(400).json({ error: 'Nouveau nom requis' });
        const account = await Account.findOne({ account_number: req.account_number });
        if (!account) return res.status(404).json({ error: 'Account introuvable' });
        const idx = (account.driveFolders || []).indexOf(name);
        if (idx === -1) return res.status(404).json({ error: 'Dossier introuvable' });
        const trimmed = newName.trim();
        if (account.driveFolders.includes(trimmed)) return res.status(400).json({ error: 'Ce nom existe déjà' });
        account.driveFolders[idx] = trimmed;
        await account.save();
        // Also rename folder on all drive files
        const DriveFile = await tenantCollection(req, 'DriveFile');
        await DriveFile.updateMany({ folder: name }, { $set: { folder: trimmed } });
        res.json({ success: true, folders: account.driveFolders });
    } catch(err) {
        console.error('[Drive] rename folder error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /api/drive/folders/:name
 * Delete a folder (files move to root)
 */
router.delete('/drive/folders/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const account = await Account.findOne({ account_number: req.account_number });
        if (!account) return res.status(404).json({ error: 'Account introuvable' });
        account.driveFolders = (account.driveFolders || []).filter(f => f !== name);
        await account.save();
        // Move files to root
        const DriveFile = await tenantCollection(req, 'DriveFile');
        await DriveFile.updateMany({ folder: name }, { $set: { folder: '' } });
        res.json({ success: true, folders: account.driveFolders });
    } catch(err) {
        console.error('[Drive] delete folder error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/drive/upload
 * Upload files at account level
 * Body: multipart/form-data with 'files' field + optional 'folder' field
 */
router.post('/drive/upload', (req, res, next) => {
    upload.array('files', 20)(req, res, (err) => {
        if (err) return res.status(400).json({ error: err.message });
        next();
    });
}, async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'Aucun fichier' });
        const DriveFile = await tenantCollection(req, 'DriveFile');
        const baseFolder = req.body.folder || '';
        const relativePaths = normalizeFieldArray(req.body.relativePaths);
        const foldersToPersist = new Set();
        const saved = [];
        for (const [index, file] of req.files.entries()) {
            // Get the UUID/filename path for DB storage
            const uuid = path.basename(path.dirname(file.path));
            const dbFilename = `${uuid}/${file.filename}`;
            const relativePath = relativePaths[index] || file.originalname;
            const relativeFolder = uploadPathDirname(relativePath);
            const targetFolder = joinUploadFolder(baseFolder, relativeFolder);
            const originalName = uploadPathBasename(relativePath, file.originalname);
            if (targetFolder) foldersToPersist.add(targetFolder);

            const doc = await DriveFile.create({
                filename: dbFilename,
                originalName,
                mimeType: file.mimetype,
                size: file.size,
                category: detectCategory(file.mimetype),
                folder: targetFolder,
                uploadedAt: new Date(),
            });
            saved.push({
                _id: doc._id,
                filename: doc.filename,
                originalName: doc.originalName,
                mimeType: doc.mimeType,
                size: doc.size,
                sizeFormatted: formatSize(doc.size),
                category: doc.category,
                folder: doc.folder,
                url: `/account/${req.account_number}/uploads/attachments/${doc.filename}`,
                uploadedAt: doc.uploadedAt,
            });
        }
        if (foldersToPersist.size > 0) {
            await Account.updateOne(
                { account_number: req.account_number },
                { $addToSet: { driveFolders: { $each: Array.from(foldersToPersist) } } }
            );
        }
        res.json({ success: true, files: saved, folders: Array.from(foldersToPersist) });
    } catch(err) {
        console.error('[Drive] upload error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /api/drive/files/:id
 * Delete an account-level drive file
 */
router.delete('/drive/files/:id', async (req, res) => {
    try {
        const DriveFile = await tenantCollection(req, 'DriveFile');
        const file = await DriveFile.findById(req.params.id);
        if (!file) return res.status(404).json({ error: 'Fichier introuvable' });
        // Delete physical file
        const filePath = path.join(__dirname, '../../private_uploads/attachments', String(req.account_number), file.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            // Try to remove the parent UUID folder if empty
            const dirPath = path.dirname(filePath);
            try {
                if (fs.readdirSync(dirPath).length === 0) fs.rmdirSync(dirPath);
            } catch (e) { /* ignore */ }
        }
        await DriveFile.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch(err) {
        console.error('[Drive] delete file error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * PATCH /api/drive/files/:id
 * Update file metadata (rename, move to folder)
 * Body: { originalName, folder }
 */
router.patch('/drive/files/:id', async (req, res) => {
    try {
        const DriveFile = await tenantCollection(req, 'DriveFile');
        const file = await DriveFile.findById(req.params.id);
        if (!file) return res.status(404).json({ error: 'Fichier introuvable' });
        if (req.body.originalName !== undefined) file.originalName = req.body.originalName;
        if (req.body.folder !== undefined) file.folder = req.body.folder;
        await file.save();
        res.json({ success: true, file });
    } catch(err) {
        console.error('[Drive] update file error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/drive/download-remote
 * Télécharge une image distante (ex: Unsplash) et l'enregistre localement (Record ou Drive global)
 */
router.post('/drive/download-remote', async (req, res) => {
    let tempFilePath = null;
    let tempDir = null;
    try {
        const { url, originalName, recordId } = req.body;
        if (!url) return res.status(400).json({ error: 'URL requise' });

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return res.status(400).json({ error: 'URL invalide' });
        }

        const axios = require('axios');
        const fileType = require('file-type');
        const mongoose = require('mongoose');

        const cleanName = sanitizeFilename(originalName || 'unsplash-image.jpg');
        const ext = path.extname(cleanName).toLowerCase() || '.jpg';
        
        if (forbiddenExts.includes(ext)) {
            return res.status(400).json({ error: 'Extension interdite' });
        }

        const uuid = crypto.randomUUID ? crypto.randomUUID() : (Date.now() + '-' + Math.round(Math.random() * 1E9));
        const dir = path.join(__dirname, '../../private_uploads/attachments', String(req.account_number), uuid);
        fs.mkdirSync(dir, { recursive: true });
        tempDir = dir;

        const filePath = path.join(dir, cleanName);
        tempFilePath = filePath;

        // Téléchargement en flux
        const writer = fs.createWriteStream(filePath);
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
            timeout: 15000
        });

        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // Magic number check
        let mimeType = 'image/jpeg';
        try {
            const type = await fileType.fromFile(filePath);
            if (type) {
                mimeType = type.mime;
                if (!allowedMimeTypes.includes(mimeType)) {
                    throw new Error(`MIME non autorisé: ${mimeType}`);
                }
            } else if (!ext.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i)) {
                throw new Error('Type de fichier inconnu');
            }
        } catch (err) {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            if (fs.existsSync(dir)) fs.rmdirSync(dir);
            return res.status(400).json({ error: `Sécurité : ${err.message}` });
        }

        const fileSize = fs.statSync(filePath).size;
        const dbFilename = `${uuid}/${cleanName}`;

        if (recordId) {
            const Record = await tenantCollection(req, 'Record');
            const record = await Record.findById(recordId);
            if (!record) {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                if (fs.existsSync(dir)) fs.rmdirSync(dir);
                return res.status(404).json({ error: 'Record introuvable' });
            }

            const newAttachment = {
                filename: dbFilename,
                originalName: cleanName,
                mimeType: mimeType,
                size: fileSize,
                category: 'image',
                folder: 'uploads',
                uploadedAt: new Date(),
                uploadedBy: req.user?._id
            };

            record.attachments = record.attachments || [];
            record.attachments.push(newAttachment);
            await record.save();

            const savedAttachment = record.attachments[record.attachments.length - 1];

            return res.json({
                success: true,
                attachment: {
                    _id: savedAttachment._id,
                    filename: savedAttachment.filename,
                    originalName: savedAttachment.originalName,
                    mimeType: savedAttachment.mimeType,
                    size: savedAttachment.size,
                    url: `/account/${req.account_number}/uploads/attachments/${savedAttachment.filename}`,
                }
            });
        } else {
            const DriveFile = await tenantCollection(req, 'DriveFile');
            const doc = await DriveFile.create({
                filename: dbFilename,
                originalName: cleanName,
                mimeType: mimeType,
                size: fileSize,
                category: 'image',
                folder: '',
                uploadedAt: new Date(),
            });

            return res.json({
                success: true,
                file: {
                    _id: doc._id,
                    filename: doc.filename,
                    originalName: doc.originalName,
                    mimeType: doc.mimeType,
                    size: doc.size,
                    url: `/account/${req.account_number}/uploads/attachments/${doc.filename}`,
                }
            });
        }

    } catch (error) {
        console.error('[Drive] Remote download error:', error);
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            try { fs.unlinkSync(tempFilePath); } catch (e) {}
        }
        if (tempDir && fs.existsSync(tempDir)) {
            try { fs.rmdirSync(tempDir); } catch (e) {}
        }
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// Record-Level Drive (existing aggregation endpoint)
// ============================================================================

/**
 * GET /api/drive
 * Returns all attachments grouped by entity > record
 * Query params:
 *   ?search=     - Filter by filename
 *   ?category=   - Filter by category (image, pdf, word, excel, video, audio, other)
 *   ?entityId=   - Filter by entity
 *   ?generated=  - Filter generated docs (true/false)
 */
router.get('/drive', async (req, res) => {
    try {
        const Record = await tenantCollection(req, 'Record');
        const Entity = await tenantCollection(req, 'Entity');

        const { search, category, entityId, generated } = req.query;

        // Build record query
        const recordQuery = { 'attachments.0': { $exists: true } }; // Only records with attachments
        if (entityId) {
            const mongoose = require('mongoose');
            recordQuery.entityId = new mongoose.Types.ObjectId(entityId);
        }

        // Fetch all records with attachments
        const records = await Record.find(recordQuery)
            .select('title computedTitle entityId attachments driveFolders')
            .lean();
        const recordAttachmentIds = records.flatMap(record => (record.attachments || [])
            .filter(attachment => !attachment.isDataRoomOnly)
            .map(attachment => attachment._id));
        const recordRagById = await directRagStatusMap(req, 'record', recordAttachmentIds);

        // Fetch all entities for labeling
        const entityIds = [...new Set(records.map(r => String(r.entityId)))];
        const entities = await Entity.find({ _id: { $in: entityIds } })
            .select('name nameSingular slug icon color')
            .lean();
        const entityMap = {};
        entities.forEach(e => { entityMap[String(e._id)] = e; });

        // Build grouped structure
        const grouped = {};
        let totalFiles = 0;
        let totalSize = 0;
        const categoryCounts = {};

        records.forEach(record => {
            const eId = String(record.entityId);
            const entity = entityMap[eId];
            if (!entity) return;

            const recordTitle = record.computedTitle || record.title || 'Sans titre';

            // Filter attachments
            let attachments = (record.attachments || []).filter(a => !a.isDataRoomOnly);
            if (search) {
                const q = search.toLowerCase();
                attachments = attachments.filter(a =>
                    (a.originalName || '').toLowerCase().includes(q) ||
                    (a.folder || '').toLowerCase().includes(q)
                );
            }
            if (category) {
                attachments = attachments.filter(a => a.category === category);
            }
            if (generated === 'true') {
                attachments = attachments.filter(a => a.isGenerated);
            } else if (generated === 'false') {
                attachments = attachments.filter(a => !a.isGenerated);
            }

            if (attachments.length === 0) return;

            // Group by entity
            if (!grouped[eId]) {
                grouped[eId] = {
                    entityId: eId,
                    entityName: entity.name,
                    entitySlug: entity.slug,
                    entityIcon: entity.icon || 'solar:database-bold-duotone',
                    entityColor: entity.color || '#4361ee',
                    records: [],
                    fileCount: 0,
                    totalSize: 0
                };
            }

            // Build record entry with folders
            const folders = {};
            const rootFiles = [];

            attachments.forEach(att => {
                const file = {
                    _id: att._id,
                    filename: att.filename,
                    originalName: att.originalName,
                    mimeType: att.mimeType,
                    size: att.size,
                    sizeFormatted: formatSize(att.size),
                    category: att.category || 'other',
                    folder: att.folder || '',
                    isGenerated: att.isGenerated || false,
                    generatedFromName: att.generatedFromName,
                    generatedFromDocumentId: att.generatedFromDocumentId,
                    snapshotDocumentId: att.snapshotDocumentId,
                    url: `/account/${req.account_number}/uploads/attachments/${att.filename}`,
                    uploadedAt: att.uploadedAt,
                    recordId: record._id,
                    recordTitle: recordTitle,
                    entityName: entity.name,
                    entitySlug: entity.slug,
                    rag: recordRagById.get(cleanId(att._id)) || null
                };

                totalFiles++;
                totalSize += att.size || 0;
                categoryCounts[file.category] = (categoryCounts[file.category] || 0) + 1;

                if (att.folder) {
                    if (!folders[att.folder]) folders[att.folder] = [];
                    folders[att.folder].push(file);
                } else {
                    rootFiles.push(file);
                }
            });

            // Include empty custom drive folders
            (record.driveFolders || []).forEach(f => {
                if (!folders[f]) folders[f] = [];
            });

            const recordEntry = {
                recordId: record._id,
                recordTitle: recordTitle,
                folders: Object.entries(folders).map(([name, files]) => ({
                    name,
                    files,
                    fileCount: files.length
                })),
                rootFiles: rootFiles,
                fileCount: attachments.length,
                totalSize: attachments.reduce((sum, a) => sum + (a.size || 0), 0)
            };

            grouped[eId].records.push(recordEntry);
            grouped[eId].fileCount += attachments.length;
            grouped[eId].totalSize += recordEntry.totalSize;
        });

        // Sort entities by name
        const result = Object.values(grouped).sort((a, b) => a.entityName.localeCompare(b.entityName));

        // Sort records within each entity
        result.forEach(entity => {
            entity.records.sort((a, b) => a.recordTitle.localeCompare(b.recordTitle));
            entity.totalSizeFormatted = formatSize(entity.totalSize);
        });

        res.json({
            success: true,
            entities: result,
            stats: {
                totalFiles,
                totalSize,
                totalSizeFormatted: formatSize(totalSize),
                categoryCounts,
                entityCount: result.length,
                recordCount: result.reduce((sum, e) => sum + e.records.length, 0)
            }
        });
    } catch (error) {
        console.error('[Global Drive] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
