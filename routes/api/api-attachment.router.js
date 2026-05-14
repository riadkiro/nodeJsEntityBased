/**
 * Attachment API Router
 * 
 * Handles file upload, deletion and listing for record attachments.
 * Files are stored in /public/uploads/attachments/<accountNumber>/
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

// ============================================================================
// Multer Configuration
// ============================================================================

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../public/uploads/attachments', String(req.account_number));
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
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

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
    fileFilter: (req, file, cb) => {
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
router.post('/records/:recordId/attachments', upload.array('files', 10), async (req, res) => {
    try {
        const Record = await tenantCollection(req, 'Record');
        const record = await Record.findById(req.params.recordId);

        if (!record) {
            return res.status(404).json({ error: 'Record introuvable' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'Aucun fichier fourni' });
        }

        const folder = req.body.folder || '';

        const newAttachments = req.files.map(file => ({
            filename: file.filename,
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

        // Delete file from disk
        const filePath = path.join(__dirname, '../../public/uploads/attachments', String(req.account_number), attachment.filename);
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (e) {
            console.warn('[Attachment] Could not delete file:', filePath, e.message);
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

module.exports = router;
