/**
 * Attachment API Router
 * 
 * Handles file upload, deletion and listing for record attachments.
 * Files are stored in /private_uploads/attachments/<accountNumber>/<uuid>/
 * and are NOT accessible via direct URL. Downloads require authentication
 * through the /account/:id/uploads/attachments/* route.
 * 
 * Security:
 *   - MIME whitelist + extension blacklist (forbidden executables)
 *   - Magic number validation via file-type (binary signature check)
 *   - Double-extension detection (e.g. file.pdf.exe)
 *   - Filename sanitization (null bytes, path traversal)
 *   - Fail-closed on validation errors
 * 
 * Routes:
 *   POST   /api/records/:recordId/attachments       - Upload file(s)
 *   DELETE /api/records/:recordId/attachments/:attachmentId - Delete a file
 *   GET    /api/records/:recordId/attachments         - List files
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { tenantCollection } = require('../../middleware/tenant');
const {
    sanitizeUploadedFilename,
    normalizeFieldArray,
    uploadPathBasename,
    uploadPathDirname,
    joinUploadFolder,
} = require('../../utils/filename-encoding');

// ============================================================================
// Multer Configuration
// ============================================================================

const crypto = require('crypto');

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

function attachmentRagStatusPayload(document, canonicalDocument = null, fallback = {}) {
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

async function ensureAttachmentIdsPersisted(Record, record) {
    if (!Record?.collection || !record?._id || !Array.isArray(record.attachments) || record.attachments.length === 0) {
        return false;
    }

    const raw = await Record.collection.findOne(
        { _id: record._id },
        { projection: { attachments: 1 } }
    );
    const rawAttachments = Array.isArray(raw?.attachments) ? raw.attachments : [];
    const missingIdIndexes = rawAttachments
        .map((attachment, index) => (!attachment?._id ? index : -1))
        .filter(index => index >= 0);

    if (!missingIdIndexes.length) return false;

    const nextAttachments = rawAttachments.map((attachment, index) => {
        if (attachment?._id) return attachment;
        const hydratedId = record.attachments[index]?._id;
        return {
            ...attachment,
            _id: hydratedId && mongoose.Types.ObjectId.isValid(cleanId(hydratedId))
                ? hydratedId
                : new mongoose.Types.ObjectId()
        };
    });

    await Record.collection.updateOne(
        { _id: record._id },
        { $set: { attachments: nextAttachments } }
    );

    nextAttachments.forEach((attachment, index) => {
        if (record.attachments[index]) {
            record.attachments[index]._id = attachment._id;
        }
    });

    return true;
}

async function enrichAttachmentsWithRagStatus(req, attachments = []) {
    if (!attachments.length || !RECORD_AI_RAG_ENABLED) return attachments;

    let RecordAiDocument;
    try {
        RecordAiDocument = await tenantCollection(req, 'RecordAiDocument');
    } catch (_) {
        return attachments;
    }
    if (!RecordAiDocument) return attachments;

    const sourceIds = attachments.map(file => cleanId(file._id)).filter(Boolean);
    const directDocs = sourceIds.length
        ? await RecordAiDocument.find({
            source: 'record',
            sourceId: { $in: sourceIds },
            status: 'ready',
            chunkCount: { $gt: 0 }
        }).sort({ indexedAt: 1, updatedAt: 1 }).lean()
        : [];
    const directBySourceId = new Map();
    directDocs.forEach(document => {
        if (!directBySourceId.has(document.sourceId)) directBySourceId.set(document.sourceId, document);
    });

    const configHash = ragConfigHash();
    const sizes = [...new Set(attachments.map(file => Number(file.size || 0)).filter(size => size > 0))];
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

    const hashByAttachmentId = new Map();
    const getContentHashForAttachment = async (file) => {
        const key = cleanId(file._id);
        if (hashByAttachmentId.has(key)) return hashByAttachmentId.get(key);
        if (!file.filename) {
            hashByAttachmentId.set(key, '');
            return '';
        }
        try {
            const filePath = resolveAttachmentPath(req.account_number, file.filename);
            const contentHash = await hashFileContent(filePath);
            hashByAttachmentId.set(key, contentHash);
            return contentHash;
        } catch (_) {
            hashByAttachmentId.set(key, '');
            return '';
        }
    };

    const enriched = [];
    for (const file of attachments) {
        const sourceId = cleanId(file._id);
        const direct = directBySourceId.get(sourceId);
        const directCanonical = direct?.contentHash ? canonicalByHash.get(direct.contentHash) : null;

        if (direct) {
            enriched.push({
                ...file,
                rag: attachmentRagStatusPayload(direct, directCanonical || direct)
            });
            continue;
        }

        const sizeCandidates = candidatesBySize.get(Number(file.size || 0)) || [];
        if (sizeCandidates.length) {
            const contentHash = await getContentHashForAttachment(file);
            const canonical = contentHash ? canonicalByHash.get(contentHash) : null;
            if (canonical) {
                enriched.push({
                    ...file,
                    rag: attachmentRagStatusPayload(canonical, canonical, {
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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uuid = crypto.randomUUID ? crypto.randomUUID() : (Date.now() + '-' + Math.round(Math.random() * 1E9));
        const dir = path.join(__dirname, '../../private_uploads/attachments', String(req.account_number), uuid);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Keep exact original filename
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
        // Sanitize the original filename
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
    if (bytes < 1024) return bytes + ' o';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
    return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
}

// ============================================================================
// Routes
// ============================================================================

/**
 * POST /api/records/:recordId/attachments
 * Upload one or more files
 */
router.post('/records/:recordId/attachments', (req, res, next) => {
    // Run Multer manually so we can catch fileFilter errors as JSON
    upload.array('files', 10)(req, res, (err) => {
        if (err) {
            // Multer rejected the file (extension, MIME, size, etc.)
            return res.status(400).json({ error: err.message });
        }
        next();
    });
}, async (req, res) => {
    try {
        const Record = await tenantCollection(req, 'Record');
        const record = await Record.findById(req.params.recordId);

        if (!record) {
            return res.status(404).json({ error: 'Record introuvable' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'Aucun fichier fourni' });
        }

        // Validation stricte du contenu (Magic Numbers) avec file-type
        const fileType = require('file-type');
        for (const file of req.files) {
            try {
                const type = await fileType.fromFile(file.path);
                
                // Si le type binaire est détecté mais non autorisé
                if (type && !allowedMimeTypes.includes(type.mime)) {
                    req.files.forEach(f => {
                        const dir = path.dirname(f.path);
                        fs.rmSync(dir, { recursive: true, force: true });
                    });
                    return res.status(400).json({ error: `Contenu de fichier non autorisé ou falsifié: ${file.originalname} (détecté: ${type.mime})` });
                }
                
                // Si file-type ne trouve RIEN (undefined) ça veut dire que c'est souvent un fichier texte (script, txt, csv)
                // Si l'extension prétend être un binaire (pdf, png, jpg, docx...), c'est une falsification !
                if (!type) {
                    const ext = path.extname(file.originalname).toLowerCase();
                    const textExtensions = ['.txt', '.csv', '.json', '.xml', '.svg']; // Les seuls sans signature binaire "stricte"
                    if (!textExtensions.includes(ext)) {
                        req.files.forEach(f => {
                            const dir = path.dirname(f.path);
                            fs.rmSync(dir, { recursive: true, force: true });
                        });
                        return res.status(400).json({ error: `Fichier corrompu ou falsifié (signature invalide): ${file.originalname}` });
                    }
                }
                // Extraire le UUID du path parent
                const uuid = path.basename(path.dirname(file.path));
                file.dbFilename = `${uuid}/${file.filename}`;
            } catch (err) {
                console.warn('[Attachment] file-type validation error:', err.message);
                // Fail-closed pour la sécurité !
                req.files.forEach(f => {
                    const dir = path.dirname(f.path);
                    fs.rmSync(dir, { recursive: true, force: true });
                });
                return res.status(500).json({ error: `Erreur interne lors de l'analyse de sécurité du fichier: ${file.originalname}` });
            }
        }

        const baseFolder = req.body.folder !== undefined ? req.body.folder : 'uploads';
        const relativePaths = normalizeFieldArray(req.body.relativePaths);
        const foldersToPersist = new Set();

        const newAttachments = req.files.map((file, index) => {
            const relativePath = relativePaths[index] || file.originalname;
            const relativeFolder = uploadPathDirname(relativePath);
            const targetFolder = joinUploadFolder(baseFolder, relativeFolder);
            const originalName = uploadPathBasename(relativePath, file.originalname);
            if (targetFolder) foldersToPersist.add(targetFolder);

            return {
                filename: file.dbFilename || file.filename,
                originalName,
                mimeType: file.mimetype,
                size: file.size,
                category: detectCategory(file.mimetype),
                folder: targetFolder,
                uploadedAt: new Date(),
                uploadedBy: req.user?._id
            };
        });

        record.attachments = record.attachments || [];
        record.driveFolders = record.driveFolders || [];
        foldersToPersist.forEach(folderName => {
            if (!record.driveFolders.includes(folderName)) record.driveFolders.push(folderName);
        });
        record.attachments.push(...newAttachments);
        await record.save();

        // Return enriched attachments with URLs
        const enriched = newAttachments.map(att => ({
            ...att,
            _id: record.attachments[record.attachments.length - newAttachments.length + newAttachments.indexOf(att)]._id,
            url: `/account/${req.account_number}/uploads/attachments/${att.filename}`,
            sizeFormatted: formatSize(att.size)
        }));

        res.json({ success: true, attachments: enriched });
    } catch (error) {
        console.error('[Attachment] Upload error:', error);
        res.status(500).json({ error: error.message || 'Erreur lors de l\'upload' });
    }
});

/**
 * DELETE /api/records/:recordId/attachments/:attachmentId
 * Delete a specific attachment
 */
router.delete('/records/:recordId/attachments/:attachmentId', async (req, res) => {
    try {
        const Record = await tenantCollection(req, 'Record');
        const record = await Record.findById(req.params.recordId);

        if (!record) {
            return res.status(404).json({ error: 'Record introuvable' });
        }

        await ensureAttachmentIdsPersisted(Record, record);

        const attachment = record.attachments?.id(req.params.attachmentId);
        if (!attachment) {
            return res.status(404).json({ error: 'Attachement introuvable' });
        }

        // Delete file from disk (and its UUID folder)
        let filePath = path.join(__dirname, '../../private_uploads/attachments', String(req.account_number), attachment.filename);
        if (!fs.existsSync(filePath)) {
            // Fallback for older files stored in public
            filePath = path.join(__dirname, '../../public/uploads/attachments', String(req.account_number), attachment.filename);
        }
        
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                // Try to delete the parent UUID folder if it is empty and inside private_uploads
                if (filePath.includes('private_uploads')) {
                    const dirPath = path.dirname(filePath);
                    if (fs.readdirSync(dirPath).length === 0) {
                        fs.rmdirSync(dirPath);
                    }
                }
            }
        } catch (e) {
            console.warn('[Attachment] Could not delete file/folder:', filePath, e.message);
        }

        // Remove from record using updateOne to bypass schema validations
        if (!mongoose.Types.ObjectId.isValid(req.params.attachmentId)) {
            return res.status(400).json({ error: 'ID de document invalide' });
        }
        await Record.updateOne(
            { _id: req.params.recordId },
            { $pull: { attachments: { _id: new mongoose.Types.ObjectId(req.params.attachmentId) } } }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('[Attachment] Delete error:', error);
        res.status(500).json({ error: error.message || 'Erreur lors de la suppression' });
    }
});

/**
 * POST /api/records/:recordId/attachments/bulk-delete
 * Delete multiple attachments at once
 */
router.post('/records/:recordId/attachments/bulk-delete', async (req, res) => {
    try {
        const Record = await tenantCollection(req, 'Record');
        const { ids } = req.body; // array of attachment IDs
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'ids requis' });
        }

        const record = await Record.findById(req.params.recordId).select('attachments');
        if (!record) return res.status(404).json({ error: 'Record introuvable' });

        await ensureAttachmentIdsPersisted(Record, record);

        const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));

        // Delete physical files
        for (const id of validIds) {
            const att = record.attachments?.id(id);
            if (att) {
                let filePath = path.join(__dirname, '../../private_uploads/attachments', String(req.account_number), att.filename);
                if (!fs.existsSync(filePath)) {
                    filePath = path.join(__dirname, '../../public/uploads/attachments', String(req.account_number), att.filename);
                }
                try { 
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        if (filePath.includes('private_uploads')) {
                            const dirPath = path.dirname(filePath);
                            if (fs.readdirSync(dirPath).length === 0) fs.rmdirSync(dirPath);
                        }
                    } 
                } catch (e) { /* ignore */ }
            }
        }

        // Remove from DB
        await Record.updateOne(
            { _id: req.params.recordId },
            { $pull: { attachments: { _id: { $in: validIds.map(id => new mongoose.Types.ObjectId(id)) } } } }
        );

        res.json({ success: true, deletedCount: validIds.length });
    } catch (error) {
        console.error('[Attachment] Bulk delete error:', error);
        res.status(500).json({ error: error.message });
    }
});


/**
 * PATCH /api/records/:recordId/attachments/:attachmentId
 * Update attachment metadata (e.g. move to folder)
 */
router.patch('/records/:recordId/attachments/:attachmentId', async (req, res) => {
    try {
        const Record = await tenantCollection(req, 'Record');
        const { folder, originalName } = req.body;

        if (folder === undefined && originalName === undefined) {
            return res.status(400).json({ error: 'Aucun champ à mettre à jour' });
        }

        const mongoose = require('mongoose');
        const update = {};
        if (folder !== undefined) update['attachments.$.folder'] = folder || '';
        if (originalName !== undefined) update['attachments.$.originalName'] = originalName.trim();

        await Record.updateOne(
            { _id: req.params.recordId, 'attachments._id': new mongoose.Types.ObjectId(req.params.attachmentId) },
            { $set: update }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('[Attachment] Patch error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/records/:recordId/attachments
 * List all attachments for a record
 */
router.get('/records/:recordId/attachments', async (req, res) => {
    try {
        const Record = await tenantCollection(req, 'Record');
        const Document = await tenantCollection(req, 'Document');
        const DocumentFolder = await tenantCollection(req, 'DocumentFolder');
        const record = await Record.findById(req.params.recordId).select('attachments driveFolders');

        if (!record) {
            return res.status(404).json({ error: 'Record introuvable' });
        }

        await ensureAttachmentIdsPersisted(Record, record);

        const attachments = (record.attachments || [])
        .filter(att => !att.isDataRoomOnly)
        .map(att => ({
            _id: att._id,
            filename: att.filename,
            originalName: att.originalName,
            mimeType: att.mimeType,
            size: att.size,
            sizeFormatted: formatSize(att.size),
            category: att.category,
            folder: att.folder || '',
            isGenerated: att.isGenerated,
            generatedFrom: att.generatedFrom,
            generatedFromName: att.generatedFromName,
            generatedFromDocumentId: att.generatedFromDocumentId,
            snapshotDocumentId: att.snapshotDocumentId,
            url: `/account/${req.account_number}/uploads/attachments/${att.filename}`,
            uploadedAt: att.uploadedAt,
            uploadedBy: att.uploadedBy
        }));

        let documentFolders = [];
        const folderNameById = new Map();
        const folderIdByName = new Map();
        const normalizeFolderName = (name) => String(name || '').trim().toLowerCase();
        if (DocumentFolder) {
            documentFolders = await DocumentFolder.find({
                createdBy: req.user._id,
                scope: 'record',
                recordId: record._id
            }).sort({ order: 1, createdAt: 1 }).lean();
            documentFolders.forEach(folder => {
                const folderId = cleanId(folder._id);
                folderNameById.set(folderId, folder.name);
                folderIdByName.set(normalizeFolderName(folder.name), folderId);
            });
        }

        const folderInfoForDoc = (doc) => {
            const folderId = cleanId(doc?.folderId);
            const name = (folderId && folderNameById.get(folderId))
                || doc?.metadata?.simpleFolder
                || (doc?.metadata?.createdByAgent ? 'Documents IA' : 'Documents');
            return {
                id: folderId || folderIdByName.get(normalizeFolderName(name)) || '',
                name
            };
        };

        const isSimpleDocument = (doc) => {
            if (!doc) return false;
            if (doc.metadata?.docKind === 'simple') return true;
            return Boolean(doc.metadata?.createdByAgent && !doc.draftSourceTemplateId && !doc.generatedFrom?.smartDocId);
        };

        const includeTemplateDrafts = ['1', 'true', 'yes'].includes(String(req.query.includeDrafts || req.query.includeTemplateDrafts || '').toLowerCase());
        let enrichedAttachments = await enrichAttachmentsWithRagStatus(req, attachments);
        let agentDocuments = [];
        let templateDraftDocuments = [];

        if (Document) {
            const snapshotIds = enrichedAttachments
                .map(att => cleanId(att.snapshotDocumentId))
                .filter(Boolean);
            const snapshotDocs = snapshotIds.length
                ? await Document.find({ _id: { $in: snapshotIds } })
                    .select('_id name metadata folderId draftSourceTemplateId generatedFrom')
                    .lean()
                : [];
            const snapshotById = new Map(snapshotDocs.map(doc => [cleanId(doc._id), doc]));

            enrichedAttachments = enrichedAttachments.map(att => {
                const snapshot = snapshotById.get(cleanId(att.snapshotDocumentId));
                if (!isSimpleDocument(snapshot)) return att;
                const simpleFolder = folderInfoForDoc(snapshot);
                return {
                    ...att,
                    isSimpleDoc: true,
                    simpleFolder: simpleFolder.name,
                    simpleFolderId: simpleFolder.id,
                    generatedFromName: simpleFolder.name
                };
            });

            const docs = await Document.find({
                isTemplate: false,
                isGenerationSnapshot: { $ne: true },
                $and: [
                    {
                        $or: [
                            { 'metadata.docKind': 'simple' },
                            {
                                'metadata.createdByAgent': true,
                                draftSourceTemplateId: null,
                                'generatedFrom.smartDocId': { $exists: false }
                            }
                        ]
                    },
                    {
                        $or: [
                            { draftRecordId: record._id },
                            { 'linkedRecords.recordId': record._id }
                        ]
                    }
                ]
            })
                .select('_id name status createdAt updatedAt generatedFrom linkedRecords metadata folderId')
                .sort({ updatedAt: -1 })
                .limit(80)
                .lean();

            agentDocuments = docs.map(doc => {
                const simpleFolder = folderInfoForDoc(doc);
                return {
                    _id: doc._id,
                    filename: '',
                    originalName: doc.name || 'Document IA',
                    mimeType: 'application/x-dexio-document',
                    size: 0,
                    sizeFormatted: 'Brouillon',
                    category: 'document',
                    folder: '',
                    isGenerated: true,
                    isAgentDraft: true,
                    isSimpleDoc: true,
                    simpleFolder: simpleFolder.name,
                    simpleFolderId: simpleFolder.id,
                    generatedFrom: doc.generatedFrom || {},
                    generatedFromName: simpleFolder.name,
                    generatedFromDocumentId: doc.generatedFrom?.templateId || null,
                    snapshotDocumentId: doc._id,
                    url: `/account/${req.account_number}/documents/${doc._id}/edit-react`,
                    editUrl: `/account/${req.account_number}/documents/${doc._id}/edit-react`,
                    uploadedAt: doc.updatedAt || doc.createdAt,
                    uploadedBy: null
                };
            });

            if (includeTemplateDrafts) {
                let templateNameById = new Map();
                try {
                    const SmartDocTemplate = await tenantCollection(req, 'SmartDocTemplate');
                    if (SmartDocTemplate) {
                        const draftTemplateIds = await Document.distinct('draftSourceTemplateId', {
                            isTemplate: false,
                            isDraft: true,
                            isGenerationSnapshot: { $ne: true },
                            draftSourceTemplateId: { $exists: true, $ne: null },
                            $or: [
                                { draftRecordId: record._id },
                                { 'linkedRecords.recordId': record._id }
                            ]
                        });
                        const templates = draftTemplateIds.length
                            ? await SmartDocTemplate.find({ _id: { $in: draftTemplateIds } })
                                .select('_id name documentId')
                                .lean()
                            : [];
                        templateNameById = new Map(templates.map(template => [cleanId(template._id), template.name || 'Template']));
                    }
                } catch (templateError) {
                    console.warn('[Attachment] Could not enrich template draft names:', templateError.message);
                }

                const templateDrafts = await Document.find({
                    isTemplate: false,
                    isDraft: true,
                    isGenerationSnapshot: { $ne: true },
                    draftSourceTemplateId: { $exists: true, $ne: null },
                    $or: [
                        { draftRecordId: record._id },
                        { 'linkedRecords.recordId': record._id }
                    ]
                })
                    .select('_id name status createdAt updatedAt generatedFrom draftSourceTemplateId draftOutputFormat')
                    .sort({ updatedAt: -1 })
                    .limit(80)
                    .lean();

                templateDraftDocuments = templateDrafts.map(doc => {
                    const smartDocId = cleanId(doc.generatedFrom?.smartDocId || doc.draftSourceTemplateId);
                    const templateName = doc.generatedFrom?.templateName || templateNameById.get(smartDocId) || 'Template';
                    return {
                        _id: doc._id,
                        filename: '',
                        originalName: doc.name || `Brouillon ${templateName}`,
                        mimeType: 'application/x-dexio-document',
                        size: 0,
                        sizeFormatted: 'Brouillon',
                        category: 'document',
                        folder: '',
                        isGenerated: true,
                        isAgentDraft: true,
                        isTemplateDraft: true,
                        isSimpleDoc: false,
                        generatedFrom: {
                            ...(doc.generatedFrom || {}),
                            smartDocId
                        },
                        generatedFromName: templateName,
                        generatedFromDocumentId: doc.generatedFrom?.templateId || null,
                        snapshotDocumentId: doc._id,
                        url: `/account/${req.account_number}/documents/${doc._id}/edit-react`,
                        editUrl: `/account/${req.account_number}/documents/${doc._id}/edit-react`,
                        uploadedAt: doc.updatedAt || doc.createdAt,
                        uploadedBy: null
                    };
                });
            }
        }

        res.json({
            success: true,
            attachments: [...agentDocuments, ...templateDraftDocuments, ...enrichedAttachments],
            driveFolders: record.driveFolders || [],
            documentFolders: documentFolders.map(folder => ({
                _id: folder._id,
                name: folder.name,
                color: folder.color,
                icon: folder.icon,
                order: folder.order
            }))
        });
    } catch (error) {
        console.error('[Attachment] List error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/records/:recordId/drive-folders
 * Create a custom Drive folder
 */
router.post('/records/:recordId/drive-folders', async (req, res) => {
    try {
        const Record = await tenantCollection(req, 'Record');
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Nom de dossier requis' });
        }
        const folderName = name.trim();
        const record = await Record.findById(req.params.recordId).select('driveFolders attachments');
        if (!record) return res.status(404).json({ error: 'Record introuvable' });

        // Check for duplicates (in custom folders AND in attachment folders)
        const existingFolders = record.driveFolders || [];
        const attachmentFolders = [...new Set((record.attachments || []).filter(a => a.folder).map(a => a.folder))];
        if (existingFolders.includes(folderName) || attachmentFolders.includes(folderName)) {
            return res.status(409).json({ error: 'Ce dossier existe déjà' });
        }

        record.driveFolders = record.driveFolders || [];
        record.driveFolders.push(folderName);
        await record.save();
        res.json({ success: true, folder: folderName });
    } catch (error) {
        console.error('[Drive] Create folder error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/records/:recordId/drive-folders/:folderName
 * Delete a custom Drive folder (files stay in root)
 */
router.delete('/records/:recordId/drive-folders/:folderName', async (req, res) => {
    try {
        const Record = await tenantCollection(req, 'Record');
        const folderName = decodeURIComponent(req.params.folderName);
        const record = await Record.findById(req.params.recordId).select('driveFolders attachments');
        if (!record) return res.status(404).json({ error: 'Record introuvable' });

        // Remove from driveFolders
        record.driveFolders = (record.driveFolders || []).filter(f => f !== folderName);

        // Move files in this folder back to root
        let movedCount = 0;
        (record.attachments || []).forEach(att => {
            if (att.folder === folderName) {
                att.folder = '';
                movedCount++;
            }
        });
        if (movedCount > 0) record.markModified('attachments');

        await record.save();
        res.json({ success: true, movedCount });
    } catch (error) {
        console.error('[Drive] Delete folder error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PATCH /api/records/:recordId/drive-folders/:folderName
 * Rename a custom Drive folder (including all files inside)
 */
router.patch('/records/:recordId/drive-folders/:folderName', async (req, res) => {
    try {
        const Record = await tenantCollection(req, 'Record');
        const oldName = decodeURIComponent(req.params.folderName);
        const { newName } = req.body;
        if (!newName || !newName.trim()) {
            return res.status(400).json({ error: 'Nouveau nom requis' });
        }
        const cleanNewName = newName.trim();
        const record = await Record.findById(req.params.recordId).select('driveFolders attachments');
        if (!record) return res.status(404).json({ error: 'Record introuvable' });

        // Check for duplicates
        const existingFolders = record.driveFolders || [];
        const attachmentFolders = [...new Set((record.attachments || []).filter(a => a.folder).map(a => a.folder))];
        if (existingFolders.includes(cleanNewName) || attachmentFolders.includes(cleanNewName)) {
            return res.status(409).json({ error: 'Ce dossier existe déjà' });
        }

        // Update name in driveFolders list
        let found = false;
        record.driveFolders = (record.driveFolders || []).map(f => {
            if (f === oldName) {
                found = true;
                return cleanNewName;
            }
            return f;
        });

        // Also update any files inside this folder
        let updatedCount = 0;
        (record.attachments || []).forEach(att => {
            if (att.folder === oldName) {
                att.folder = cleanNewName;
                updatedCount++;
            }
        });

        if (updatedCount > 0 || found) {
            record.markModified('driveFolders');
            if (updatedCount > 0) record.markModified('attachments');
            await record.save();
        }

        res.json({ success: true, folder: cleanNewName, updatedCount });
    } catch (error) {
        console.error('[Drive] Rename folder error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
