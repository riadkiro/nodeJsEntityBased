/**
 * Data Room API Router
 *
 * A Data Room is a record-level secure layer over existing Drive attachments.
 * Items selected from Drive reference the same attachment; uploads are stored
 * as hidden record attachments and are not listed in the normal Drive.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const { tenantCollection } = require('../../middleware/tenant');
const { sanitizeUploadedFilename } = require('../../utils/filename-encoding');

const DATA_ROOM_STORAGE_FOLDER = '__data_room';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uuid = crypto.randomUUID ? crypto.randomUUID() : (Date.now() + '-' + Math.round(Math.random() * 1E9));
        const dir = path.join(__dirname, '../../private_uploads/attachments', String(req.account_number), uuid);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, file.originalname)
});

const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo',
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4',
    'application/zip', 'application/x-rar-compressed', 'application/gzip',
    'text/plain', 'text/csv',
    'application/json', 'application/xml'
];

const forbiddenExts = [
    '.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.msi', '.msp', '.mst',
    '.js', '.jse', '.vbs', '.vbe', '.wsf', '.wsh', '.ps1', '.psm1', '.psd1',
    '.php', '.php3', '.php4', '.php5', '.phtml', '.py', '.rb', '.pl', '.cgi', '.asp', '.aspx', '.jsp',
    '.jar', '.war', '.class',
    '.sh', '.bash', '.zsh', '.ksh',
    '.dll', '.so', '.dylib',
    '.hta', '.inf', '.reg', '.rgs', '.sct', '.url', '.lnk',
    '.app', '.command', '.action'
];

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        file.originalname = sanitizeUploadedFilename(file.originalname);
        const ext = path.extname(file.originalname).toLowerCase();
        if (forbiddenExts.includes(ext)) {
            return cb(new Error(`Extension de fichier interdite pour des raisons de sécurité: ${ext}`), false);
        }

        const parts = file.originalname.split('.');
        if (parts.length > 2) {
            for (let i = 1; i < parts.length; i++) {
                const possibleExt = '.' + parts[i].toLowerCase();
                if (forbiddenExts.includes(possibleExt)) {
                    return cb(new Error(`Extension cachée détectée (double extension): ${file.originalname}`), false);
                }
            }
        }

        if (allowedMimeTypes.includes(file.mimetype)) return cb(null, true);
        return cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`), false);
    }
});

function cleanPath(value) {
    return String(value || '')
        .replace(/\\/g, '/')
        .replace(/^\/+|\/+$/g, '')
        .split('/')
        .filter(Boolean)
        .join('/');
}

function childNameFromPath(folderPath) {
    const clean = cleanPath(folderPath);
    return clean ? clean.split('/').pop() : '';
}

function parentPathFromPath(folderPath) {
    const parts = cleanPath(folderPath).split('/').filter(Boolean);
    parts.pop();
    return parts.join('/');
}

function formatSize(bytes) {
    if (!bytes) return '0 o';
    if (bytes < 1024) return bytes + ' o';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' Go';
}

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

function ensureDataRoom(record) {
    if (!record.dataRoom) record.dataRoom = {};
    if (!record.dataRoom.folders) record.dataRoom.folders = [];
    if (!record.dataRoom.items) record.dataRoom.items = [];
    if (!record.dataRoom.logs) record.dataRoom.logs = [];
}

function attachmentById(record, attachmentId) {
    return (record.attachments || []).find(att => String(att._id) === String(attachmentId));
}

function dataRoomItemById(record, itemId) {
    ensureDataRoom(record);
    return (record.dataRoom.items || []).find(item => String(item._id) === String(itemId));
}

function userLabel(req) {
    return req.user?.name || req.user?.email || 'Utilisateur';
}

function pushLog(record, item, req, action, details) {
    ensureDataRoom(record);
    record.dataRoom.logs.push({
        itemId: item?._id,
        attachmentId: item?.attachmentId,
        action,
        actorId: req.user?._id,
        actorName: userLabel(req),
        details: details || '',
        at: new Date()
    });
    if (record.dataRoom.logs.length > 300) {
        record.dataRoom.logs = record.dataRoom.logs.slice(record.dataRoom.logs.length - 300);
    }
}

function permissionsFromBody(value) {
    const source = value || {};
    return {
        view: source.view !== false,
        download: source.download !== false,
        share: !!source.share,
        print: !!source.print,
        watermark: !!source.watermark
    };
}

function sharePermissionsFromBody(value) {
    const source = value || {};
    return {
        view: source.view !== false,
        download: !!source.download,
        share: !!source.share
    };
}

function normalizeShare(raw, req) {
    const email = String(raw.email || '').trim().toLowerCase();
    if (!email) return null;
    return {
        email,
        userId: raw.userId && mongoose.Types.ObjectId.isValid(raw.userId) ? raw.userId : undefined,
        role: ['viewer', 'reviewer', 'manager'].includes(raw.role) ? raw.role : 'viewer',
        permissions: sharePermissionsFromBody(raw.permissions),
        addedAt: raw.addedAt || new Date(),
        addedBy: req.user?._id
    };
}

function normalizeItem(record, item, req) {
    const att = attachmentById(record, item.attachmentId);
    if (!att) return null;
    return {
        _id: item._id,
        attachmentId: item.attachmentId,
        source: item.source || 'drive',
        displayName: item.displayName || att.originalName,
        originalName: att.originalName,
        filename: att.filename,
        mimeType: att.mimeType,
        size: att.size || 0,
        sizeFormatted: formatSize(att.size || 0),
        category: att.category || detectCategory(att.mimeType),
        folder: item.folder || '',
        accessMode: item.accessMode || 'workspace',
        permissions: {
            view: item.permissions?.view !== false,
            download: item.permissions?.download !== false,
            share: !!item.permissions?.share,
            print: !!item.permissions?.print,
            watermark: !!item.permissions?.watermark
        },
        shares: (item.shares || []).map(share => ({
            _id: share._id,
            email: share.email,
            userId: share.userId,
            role: share.role || 'viewer',
            permissions: {
                view: share.permissions?.view !== false,
                download: !!share.permissions?.download,
                share: !!share.permissions?.share
            },
            addedAt: share.addedAt
        })),
        url: `/account/${req.account_number}/api/records/${record._id}/data-room/items/${item._id}/file`,
        downloadUrl: `/account/${req.account_number}/api/records/${record._id}/data-room/items/${item._id}/file?dl=1`,
        addedAt: item.addedAt,
        addedBy: item.addedBy
    };
}

function canUseDataRoomItem(req, item, capability) {
    const permissions = item.permissions || {};
    if (capability === 'view' && permissions.view === false) return false;
    if (capability === 'download' && permissions.download === false) return false;

    if (['owner', 'admin'].includes(req.workspaceRole)) return true;
    if ((item.accessMode || 'workspace') !== 'restricted') return true;

    const userId = req.user?._id ? String(req.user._id) : '';
    const email = String(req.user?.email || '').trim().toLowerCase();
    if (item.addedBy && userId && String(item.addedBy) === userId) return true;

    const share = (item.shares || []).find(entry => {
        const shareUserId = entry.userId ? String(entry.userId) : '';
        const shareEmail = String(entry.email || '').trim().toLowerCase();
        return (userId && shareUserId === userId) || (email && shareEmail === email);
    });
    if (!share) return false;
    if (capability === 'download') return !!share.permissions?.download;
    return share.permissions?.view !== false;
}

function canManageDataRoomItem(req, item) {
    if (['owner', 'admin'].includes(req.workspaceRole)) return true;
    const userId = req.user?._id ? String(req.user._id) : '';
    const email = String(req.user?.email || '').trim().toLowerCase();
    if (item.addedBy && userId && String(item.addedBy) === userId) return true;
    return (item.shares || []).some(entry => {
        const shareUserId = entry.userId ? String(entry.userId) : '';
        const shareEmail = String(entry.email || '').trim().toLowerCase();
        return entry.role === 'manager' && ((userId && shareUserId === userId) || (email && shareEmail === email));
    });
}

function normalizeDataRoom(record, req) {
    ensureDataRoom(record);
    const folders = (record.dataRoom.folders || [])
        .map(folder => ({
            _id: folder._id,
            name: folder.name,
            path: folder.path || '',
            parentPath: folder.parentPath || '',
            createdAt: folder.createdAt
        }))
        .sort((a, b) => a.path.localeCompare(b.path));

    const items = (record.dataRoom.items || [])
        .filter(item => canUseDataRoomItem(req, item, 'view'))
        .map(item => normalizeItem(record, item, req))
        .filter(Boolean)
        .sort((a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0));
    const visibleItemIds = new Set(items.map(item => String(item._id)));

    const logs = (record.dataRoom.logs || [])
        .filter(log => !log.itemId || visibleItemIds.has(String(log.itemId)))
        .slice(-120)
        .reverse()
        .map(log => ({
            _id: log._id,
            itemId: log.itemId,
            attachmentId: log.attachmentId,
            action: log.action,
            actorName: log.actorName || 'Utilisateur',
            details: log.details || '',
            at: log.at
        }));

    return { folders, items, logs };
}

async function validateFilesOrFail(files) {
    const fileType = require('file-type');
    for (const file of files) {
        const type = await fileType.fromFile(file.path);
        if (type && !allowedMimeTypes.includes(type.mime)) {
            throw new Error(`Contenu de fichier non autorisé ou falsifié: ${file.originalname} (détecté: ${type.mime})`);
        }
        if (!type) {
            const ext = path.extname(file.originalname).toLowerCase();
            const textExtensions = ['.txt', '.csv', '.json', '.xml', '.svg'];
            if (!textExtensions.includes(ext)) {
                throw new Error(`Fichier corrompu ou falsifié (signature invalide): ${file.originalname}`);
            }
        }
        const uuid = path.basename(path.dirname(file.path));
        file.dbFilename = `${uuid}/${file.filename}`;
    }
}

function cleanupUploadedFiles(files) {
    (files || []).forEach(file => {
        try {
            fs.rmSync(path.dirname(file.path), { recursive: true, force: true });
        } catch (e) {
            console.warn('[DataRoom] cleanup error:', e.message);
        }
    });
}

async function loadRecord(req, select) {
    const Record = await tenantCollection(req, 'Record');
    return Record.findById(req.params.recordId).select(select || 'attachments dataRoom title entityId');
}

router.get('/records/:recordId/data-room', async (req, res) => {
    try {
        const record = await loadRecord(req);
        if (!record) return res.status(404).json({ error: 'Record introuvable' });
        ensureDataRoom(record);
        res.json({ success: true, dataRoom: normalizeDataRoom(record, req) });
    } catch (err) {
        console.error('[DataRoom] list error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/records/:recordId/data-room/drive-files', async (req, res) => {
    try {
        const record = await loadRecord(req);
        if (!record) return res.status(404).json({ error: 'Record introuvable' });
        ensureDataRoom(record);
        const linked = new Set((record.dataRoom.items || []).map(item => String(item.attachmentId)));
        const files = (record.attachments || [])
            .filter(att => !att.isDataRoomOnly)
            .map(att => ({
                _id: att._id,
                originalName: att.originalName,
                mimeType: att.mimeType,
                size: att.size || 0,
                sizeFormatted: formatSize(att.size || 0),
                category: att.category || detectCategory(att.mimeType),
                folder: att.folder || '',
                isGenerated: !!att.isGenerated,
                inDataRoom: linked.has(String(att._id)),
                uploadedAt: att.uploadedAt
            }))
            .sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0));
        res.json({ success: true, files });
    } catch (err) {
        console.error('[DataRoom] drive files error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/records/:recordId/data-room/folders', async (req, res) => {
    try {
        const record = await loadRecord(req);
        if (!record) return res.status(404).json({ error: 'Record introuvable' });
        ensureDataRoom(record);

        const name = String(req.body.name || '').trim();
        if (!name) return res.status(400).json({ error: 'Nom de dossier requis' });
        if (name.includes('/') || name.includes('\\')) return res.status(400).json({ error: 'Le nom du dossier ne peut pas contenir /' });

        const parentPath = cleanPath(req.body.parentPath || '');
        const folderPath = cleanPath(parentPath ? parentPath + '/' + name : name);
        if ((record.dataRoom.folders || []).some(folder => folder.path === folderPath)) {
            return res.status(400).json({ error: 'Ce dossier existe déjà dans la Data Room' });
        }

        record.dataRoom.folders.push({
            name,
            path: folderPath,
            parentPath,
            createdBy: req.user?._id,
            createdAt: new Date()
        });
        pushLog(record, null, req, 'folder.created', folderPath);
        await record.save();
        res.json({ success: true, dataRoom: normalizeDataRoom(record, req) });
    } catch (err) {
        console.error('[DataRoom] create folder error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.patch('/records/:recordId/data-room/folders/:folderId', async (req, res) => {
    try {
        const record = await loadRecord(req);
        if (!record) return res.status(404).json({ error: 'Record introuvable' });
        ensureDataRoom(record);

        const folder = (record.dataRoom.folders || []).find(f => String(f._id) === String(req.params.folderId));
        if (!folder) return res.status(404).json({ error: 'Dossier introuvable' });
        const oldPath = folder.path;
        const name = String(req.body.name || '').trim();
        if (!name) return res.status(400).json({ error: 'Nom de dossier requis' });

        const newPath = cleanPath(folder.parentPath ? folder.parentPath + '/' + name : name);
        if ((record.dataRoom.folders || []).some(f => String(f._id) !== String(folder._id) && f.path === newPath)) {
            return res.status(400).json({ error: 'Ce dossier existe déjà' });
        }

        folder.name = name;
        folder.path = newPath;
        (record.dataRoom.folders || []).forEach(child => {
            if (child.parentPath === oldPath || (child.path || '').startsWith(oldPath + '/')) {
                child.parentPath = child.parentPath === oldPath ? newPath : child.parentPath.replace(oldPath + '/', newPath + '/');
                child.path = (child.path || '').replace(oldPath + '/', newPath + '/');
                child.name = childNameFromPath(child.path);
            }
        });
        (record.dataRoom.items || []).forEach(item => {
            if (item.folder === oldPath || (item.folder || '').startsWith(oldPath + '/')) {
                item.folder = item.folder === oldPath ? newPath : item.folder.replace(oldPath + '/', newPath + '/');
            }
        });
        pushLog(record, null, req, 'folder.renamed', `${oldPath} -> ${newPath}`);
        record.markModified('dataRoom');
        await record.save();
        res.json({ success: true, dataRoom: normalizeDataRoom(record, req) });
    } catch (err) {
        console.error('[DataRoom] rename folder error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/records/:recordId/data-room/from-drive', async (req, res) => {
    try {
        const record = await loadRecord(req);
        if (!record) return res.status(404).json({ error: 'Record introuvable' });
        ensureDataRoom(record);

        const attachmentIds = Array.isArray(req.body.attachmentIds)
            ? req.body.attachmentIds
            : [req.body.attachmentId || req.body.attachmentIds].filter(Boolean);
        const folder = cleanPath(req.body.folder || '');
        const existing = new Set((record.dataRoom.items || []).map(item => String(item.attachmentId)));
        let added = 0;

        attachmentIds.forEach(attachmentId => {
            const att = attachmentById(record, attachmentId);
            if (!att || att.isDataRoomOnly || existing.has(String(att._id))) return;
            record.dataRoom.items.push({
                attachmentId: att._id,
                source: 'drive',
                displayName: att.originalName,
                folder,
                accessMode: 'workspace',
                permissions: { view: true, download: true, share: false, print: false, watermark: false },
                addedBy: req.user?._id,
                addedAt: new Date()
            });
            const item = record.dataRoom.items[record.dataRoom.items.length - 1];
            pushLog(record, item, req, 'item.linked', att.originalName);
            existing.add(String(att._id));
            added++;
        });

        await record.save();
        res.json({ success: true, added, dataRoom: normalizeDataRoom(record, req) });
    } catch (err) {
        console.error('[DataRoom] add from drive error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/records/:recordId/data-room/upload', (req, res, next) => {
    upload.array('files', 10)(req, res, (err) => {
        if (err) return res.status(400).json({ error: err.message });
        next();
    });
}, async (req, res) => {
    try {
        const record = await loadRecord(req);
        if (!record) {
            cleanupUploadedFiles(req.files);
            return res.status(404).json({ error: 'Record introuvable' });
        }
        if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'Aucun fichier fourni' });
        ensureDataRoom(record);

        await validateFilesOrFail(req.files);

        const folder = cleanPath(req.body.folder || '');
        const existingItems = new Set((record.dataRoom.items || []).map(item => String(item.attachmentId)));
        const addedItems = [];

        for (const file of req.files) {
            let att = (record.attachments || []).find(existing =>
                existing.isDataRoomOnly &&
                existing.originalName === file.originalname &&
                Number(existing.size || 0) === Number(file.size || 0)
            );

            if (att) {
                cleanupUploadedFiles([file]);
            } else {
                record.attachments.push({
                    filename: file.dbFilename || file.filename,
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                    category: detectCategory(file.mimetype),
                    folder: DATA_ROOM_STORAGE_FOLDER,
                    isDataRoomOnly: true,
                    dataRoomStorageFolder: DATA_ROOM_STORAGE_FOLDER,
                    uploadedAt: new Date(),
                    uploadedBy: req.user?._id
                });
                att = record.attachments[record.attachments.length - 1];
            }

            if (existingItems.has(String(att._id))) continue;
            record.dataRoom.items.push({
                attachmentId: att._id,
                source: 'upload',
                displayName: att.originalName,
                folder,
                accessMode: 'workspace',
                permissions: { view: true, download: true, share: false, print: false, watermark: false },
                addedBy: req.user?._id,
                addedAt: new Date()
            });
            const item = record.dataRoom.items[record.dataRoom.items.length - 1];
            pushLog(record, item, req, 'item.uploaded', att.originalName);
            existingItems.add(String(att._id));
            addedItems.push(item);
        }

        await record.save();
        res.json({ success: true, added: addedItems.length, dataRoom: normalizeDataRoom(record, req) });
    } catch (err) {
        cleanupUploadedFiles(req.files);
        console.error('[DataRoom] upload error:', err);
        res.status(400).json({ error: err.message });
    }
});

router.patch('/records/:recordId/data-room/items/:itemId', async (req, res) => {
    try {
        const record = await loadRecord(req);
        if (!record) return res.status(404).json({ error: 'Record introuvable' });
        const item = dataRoomItemById(record, req.params.itemId);
        if (!item) return res.status(404).json({ error: 'Élément introuvable' });
        if (!canManageDataRoomItem(req, item)) return res.status(403).json({ error: 'Permission refusée' });

        if (req.body.displayName !== undefined) item.displayName = String(req.body.displayName || '').trim();
        if (req.body.folder !== undefined) item.folder = cleanPath(req.body.folder || '');
        if (req.body.accessMode !== undefined) item.accessMode = req.body.accessMode === 'restricted' ? 'restricted' : 'workspace';
        if (req.body.permissions !== undefined) item.permissions = permissionsFromBody(req.body.permissions);
        if (req.body.shares !== undefined) {
            const shares = Array.isArray(req.body.shares) ? req.body.shares : [];
            item.shares = shares.map(share => normalizeShare(share, req)).filter(Boolean);
        }

        pushLog(record, item, req, 'item.permissions_updated', item.displayName || '');
        record.markModified('dataRoom');
        await record.save();
        res.json({ success: true, dataRoom: normalizeDataRoom(record, req) });
    } catch (err) {
        console.error('[DataRoom] update item error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/records/:recordId/data-room/items/:itemId', async (req, res) => {
    try {
        const record = await loadRecord(req);
        if (!record) return res.status(404).json({ error: 'Record introuvable' });
        ensureDataRoom(record);
        const item = dataRoomItemById(record, req.params.itemId);
        if (!item) return res.status(404).json({ error: 'Élément introuvable' });
        if (!canManageDataRoomItem(req, item)) return res.status(403).json({ error: 'Permission refusée' });

        pushLog(record, item, req, 'item.removed', item.displayName || '');
        record.dataRoom.items = record.dataRoom.items.filter(i => String(i._id) !== String(req.params.itemId));
        record.markModified('dataRoom');
        await record.save();
        res.json({ success: true, dataRoom: normalizeDataRoom(record, req) });
    } catch (err) {
        console.error('[DataRoom] delete item error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/records/:recordId/data-room/items/:itemId/log', async (req, res) => {
    try {
        const record = await loadRecord(req);
        if (!record) return res.status(404).json({ error: 'Record introuvable' });
        const item = dataRoomItemById(record, req.params.itemId);
        if (!item) return res.status(404).json({ error: 'Élément introuvable' });
        const action = String(req.body.action || 'item.viewed').slice(0, 60);
        pushLog(record, item, req, action, String(req.body.details || '').slice(0, 300));
        await record.save();
        res.json({ success: true, dataRoom: normalizeDataRoom(record, req) });
    } catch (err) {
        console.error('[DataRoom] log error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/records/:recordId/data-room/items/:itemId/file', async (req, res) => {
    try {
        const record = await loadRecord(req);
        if (!record) return res.status(404).send('Record introuvable');
        const item = dataRoomItemById(record, req.params.itemId);
        if (!item) return res.status(404).send('Élément introuvable');
        const att = attachmentById(record, item.attachmentId);
        if (!att) return res.status(404).send('Fichier introuvable');

        const isDownload = req.query.dl !== undefined;
        if (!canUseDataRoomItem(req, item, isDownload ? 'download' : 'view')) {
            return res.status(403).send(isDownload ? 'Téléchargement interdit' : 'Accès interdit');
        }

        const relativePath = String(att.filename || '');
        if (!relativePath || relativePath.includes('..')) return res.status(400).send('Requête invalide');
        let filePath = path.join(__dirname, '../../private_uploads/attachments', String(req.account_number), relativePath);
        if (!fs.existsSync(filePath)) {
            filePath = path.join(__dirname, '../../public/uploads/attachments', String(req.account_number), relativePath);
        }
        if (!fs.existsSync(filePath)) return res.status(404).send('Document introuvable');

        pushLog(record, item, req, isDownload ? 'item.downloaded' : 'item.viewed', att.originalName);
        await record.save();

        res.setHeader('X-Content-Type-Options', 'nosniff');
        if (att.mimeType) res.type(att.mimeType);
        if (isDownload) {
            res.setHeader('Content-Disposition', 'attachment; filename="' + String(att.originalName || 'document').replace(/"/g, '\\"') + '"');
        } else {
            const ext = path.extname(relativePath).toLowerCase();
            if (['.html', '.htm', '.svg', '.xml'].includes(ext)) {
                res.setHeader('Content-Disposition', 'attachment; filename="' + String(att.originalName || path.basename(relativePath)).replace(/"/g, '\\"') + '"');
            }
        }
        res.sendFile(filePath);
    } catch (err) {
        console.error('[DataRoom] file error:', err);
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;
