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

        const newAttachments = req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            category: detectCategory(file.mimetype),
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

        // Remove from record
        record.attachments.pull(req.params.attachmentId);
        await record.save();

        res.json({ success: true });
    } catch (error) {
        console.error('[Attachment] Delete error:', error);
        res.status(500).json({ error: error.message || 'Erreur lors de la suppression' });
    }
});

/**
 * GET /api/records/:recordId/attachments
 * List all attachments for a record
 */
router.get('/records/:recordId/attachments', async (req, res) => {
    try {
        const Record = await tenantCollection(req, 'Record');
        const record = await Record.findById(req.params.recordId).select('attachments');

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
            isGenerated: att.isGenerated,
            generatedFrom: att.generatedFrom,
            url: `/account/${req.account_number}/uploads/attachments/${att.filename}`,
            uploadedAt: att.uploadedAt,
            uploadedBy: att.uploadedBy
        }));

        res.json({ attachments });
    } catch (error) {
        console.error('[Attachment] List error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
