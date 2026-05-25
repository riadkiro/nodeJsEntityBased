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
const { tenantCollection } = require('../../middleware/tenant');
const { sanitizeUploadedFilename } = require('../../utils/filename-encoding');

// ============================================================================
// Multer Configuration
// ============================================================================

const crypto = require('crypto');

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

        const folder = req.body.folder !== undefined ? req.body.folder : 'uploads';

        const newAttachments = req.files.map(file => ({
            filename: file.dbFilename || file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            category: detectCategory(file.mimetype),
            folder: folder,
            uploadedAt: new Date(),
            uploadedBy: req.user?._id
        }));

        record.attachments = record.attachments || [];
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
        const mongoose = require('mongoose');
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

        const mongoose = require('mongoose');
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
        const record = await Record.findById(req.params.recordId).select('attachments driveFolders');

        if (!record) {
            return res.status(404).json({ error: 'Record introuvable' });
        }

        const attachments = (record.attachments || []).map(att => ({
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
            url: `/account/${req.account_number}/uploads/attachments/${att.filename}`,
            uploadedAt: att.uploadedAt,
            uploadedBy: att.uploadedBy
        }));

        res.json({ success: true, attachments, driveFolders: record.driveFolders || [] });
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
