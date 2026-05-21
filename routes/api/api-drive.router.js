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
    return name
        .replace(/[\x00-\x1f]/g, '')  // control chars
        .replace(/[/\\]/g, '_')        // path separators
        .replace(/\.\./g, '_')         // double dots
        .trim();
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
        if (req.query.folder) query.folder = req.query.folder;
        else query.folder = { $in: ['', null] }; // root files
        const files = await DriveFile.find(query).sort({ uploadedAt: -1 }).lean();
        // Format files
        const formatted = files.map(f => ({
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
        }));
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
        const folder = req.body.folder || '';
        const saved = [];
        for (const file of req.files) {
            // Get the UUID/filename path for DB storage
            const uuid = path.basename(path.dirname(file.path));
            const dbFilename = `${uuid}/${file.filename}`;
            const doc = await DriveFile.create({
                filename: dbFilename,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                category: detectCategory(file.mimetype),
                folder,
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
        res.json({ success: true, files: saved });
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
            let attachments = record.attachments || [];
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
                    url: `/account/${req.account_number}/uploads/attachments/${att.filename}`,
                    uploadedAt: att.uploadedAt,
                    recordId: record._id,
                    recordTitle: recordTitle,
                    entityName: entity.name,
                    entitySlug: entity.slug
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

