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
const Account = require('../../models/account.model');
const User = require('../../models/user.model');
const mailer = require('../../services/mailer');

const DATA_ROOM_STORAGE_FOLDER = '__data_room';
const DEFAULT_DATA_ROOM_PERMISSIONS = Object.freeze({
    view: true,
    download: true,
    share: false,
    print: false,
    watermark: false
});

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
    if (!record.dataRoom.accessMode) record.dataRoom.accessMode = 'workspace';
    if (!record.dataRoom.permissions) record.dataRoom.permissions = { ...DEFAULT_DATA_ROOM_PERMISSIONS };
    if (!record.dataRoom.shares) record.dataRoom.shares = [];
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

function permissionsFromStored(value) {
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
        addedBy: req.user?._id,
        notifiedAt: raw.notifiedAt || undefined
    };
}

function shareKey(share) {
    const email = String(share.email || '').trim().toLowerCase();
    const userId = share.userId ? String(share.userId) : '';
    return email || userId;
}

function mergeSharesWithExisting(existingShares, nextShares) {
    const previous = new Map((existingShares || []).map(share => [shareKey(share), share]));
    return (nextShares || []).map(share => {
        const prev = previous.get(shareKey(share));
        if (!prev) return share;
        return {
            ...share,
            addedAt: prev.addedAt || share.addedAt,
            addedBy: prev.addedBy || share.addedBy,
            notifiedAt: prev.notifiedAt || share.notifiedAt
        };
    });
}

function normalizeShares(shares, shareStatus = {}) {
    return (shares || []).map(share => {
        const email = String(share.email || '').trim().toLowerCase();
        return {
            _id: share._id,
            email: share.email,
            userId: share.userId,
            role: share.role || 'viewer',
            permissions: {
                view: share.permissions?.view !== false,
                download: !!share.permissions?.download,
                share: !!share.permissions?.share
            },
            addedAt: share.addedAt,
            notifiedAt: share.notifiedAt,
            status: shareStatus[email] || { inviteStatus: share.notifiedAt ? 'sent' : 'none' }
        };
    });
}

function normalizeAccess(target, shareStatus) {
    return {
        accessMode: target?.accessMode || 'workspace',
        permissions: permissionsFromStored(target?.permissions),
        shares: normalizeShares(target?.shares || [], shareStatus)
    };
}

function folderById(record, folderId) {
    ensureDataRoom(record);
    return (record.dataRoom.folders || []).find(folder => String(folder._id) === String(folderId));
}

function folderByPath(record, folderPath) {
    ensureDataRoom(record);
    const clean = cleanPath(folderPath || '');
    return (record.dataRoom.folders || []).find(folder => cleanPath(folder.path || '') === clean);
}

function folderChainForPath(record, folderPath) {
    const clean = cleanPath(folderPath || '');
    if (!clean) return [];
    const folders = record.dataRoom?.folders || [];
    let pathSoFar = '';
    return clean.split('/').map(part => {
        pathSoFar = pathSoFar ? pathSoFar + '/' + part : part;
        return folders.find(folder => cleanPath(folder.path || '') === pathSoFar);
    }).filter(Boolean);
}

function roomScope(record) {
    return { type: 'room', label: 'Data Room', target: record.dataRoom };
}

function folderScopesForPath(record, folderPath) {
    return folderChainForPath(record, folderPath).map(folder => ({
        type: 'folder',
        label: folder.path || folder.name || 'Dossier',
        target: folder
    }));
}

function accessScopesForFolder(record, folder) {
    return [roomScope(record), ...folderScopesForPath(record, folder.path || '')];
}

function accessScopesForItem(record, item) {
    return [
        roomScope(record),
        ...folderScopesForPath(record, item.folder || ''),
        { type: 'item', label: item.displayName || 'Fichier', target: item }
    ];
}

function isDataRoomManager(req) {
    return ['owner', 'admin', 'manager'].includes(req.workspaceRole);
}

function shareMatchesUser(req, share) {
    const userId = req.user?._id ? String(req.user._id) : '';
    const email = String(req.user?.email || '').trim().toLowerCase();
    const shareUserId = share.userId ? String(share.userId) : '';
    const shareEmail = String(share.email || '').trim().toLowerCase();
    return (userId && shareUserId === userId) || (email && shareEmail === email);
}

function matchingShares(req, scopes) {
    return scopes.flatMap(scope =>
        (scope.target?.shares || [])
            .filter(share => shareMatchesUser(req, share))
            .map(share => ({ scope, share }))
    );
}

function shareAllowsCapability(share, capability) {
    if (capability === 'download') return !!share.permissions?.download;
    if (capability === 'share') return !!share.permissions?.share || share.role === 'manager';
    return share.permissions?.view !== false;
}

function permissionChainAllows(scopes, capability) {
    return scopes.every(scope => permissionsFromStored(scope.target?.permissions)[capability] !== false);
}

function hasRestrictedScope(scopes) {
    return scopes.some(scope => (scope.target?.accessMode || 'workspace') === 'restricted');
}

function effectivePermissions(scopes) {
    return {
        view: permissionChainAllows(scopes, 'view'),
        download: permissionChainAllows(scopes, 'download'),
        share: permissionChainAllows(scopes, 'share'),
        print: permissionChainAllows(scopes, 'print'),
        watermark: permissionChainAllows(scopes, 'watermark')
    };
}

function effectiveAccessMode(scopes) {
    return hasRestrictedScope(scopes) ? 'restricted' : 'workspace';
}

function canUseDataRoomScopes(req, scopes, capability) {
    if (isDataRoomManager(req)) return true;
    if (!permissionChainAllows(scopes, capability)) return false;
    if (!hasRestrictedScope(scopes)) return true;
    return matchingShares(req, scopes).some(({ share }) => shareAllowsCapability(share, capability));
}

function hasManagerShare(req, scopes) {
    return matchingShares(req, scopes).some(({ share }) => share.role === 'manager');
}

function canManageDataRoom(req, record) {
    if (isDataRoomManager(req)) return true;
    return hasManagerShare(req, [roomScope(record)]);
}

function canManageDataRoomFolder(req, record, folder) {
    if (isDataRoomManager(req)) return true;
    const userId = req.user?._id ? String(req.user._id) : '';
    if (folder.createdBy && userId && String(folder.createdBy) === userId) return true;
    return hasManagerShare(req, accessScopesForFolder(record, folder));
}

function canManageDataRoomPath(req, record, folderPath) {
    if (isDataRoomManager(req)) return true;
    const folder = folderPath ? folderByPath(record, folderPath) : null;
    if (!folder) return canManageDataRoom(req, record);
    return canManageDataRoomFolder(req, record, folder);
}

function canManageDataRoomItem(req, record, item) {
    if (isDataRoomManager(req)) return true;
    const userId = req.user?._id ? String(req.user._id) : '';
    if (item.addedBy && userId && String(item.addedBy) === userId) return true;
    return hasManagerShare(req, accessScopesForItem(record, item));
}

function canUseDataRoomFolder(req, record, folder, capability) {
    return canUseDataRoomScopes(req, accessScopesForFolder(record, folder), capability);
}

function canUseDataRoomItem(req, record, item, capability) {
    return canUseDataRoomScopes(req, accessScopesForItem(record, item), capability);
}

function normalizeFolder(record, folder, req, shareStatus) {
    const scopes = accessScopesForFolder(record, folder);
    const canManage = canManageDataRoomFolder(req, record, folder);
    const access = normalizeAccess(folder, shareStatus);
    if (!canManage) access.shares = [];
    return {
        _id: folder._id,
        name: folder.name,
        path: folder.path || '',
        parentPath: folder.parentPath || '',
        createdAt: folder.createdAt,
        ...access,
        effectiveAccessMode: effectiveAccessMode(scopes),
        effectivePermissions: effectivePermissions(scopes),
        canManage
    };
}

function normalizeItem(record, item, req, shareStatus) {
    const att = attachmentById(record, item.attachmentId);
    if (!att) return null;
    const scopes = accessScopesForItem(record, item);
    const effective = effectivePermissions(scopes);
    const canManage = canManageDataRoomItem(req, record, item);
    const access = normalizeAccess(item, shareStatus);
    if (!canManage) access.shares = [];
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
        ...access,
        effectiveAccessMode: effectiveAccessMode(scopes),
        effectivePermissions: effective,
        canManage,
        url: `/account/${req.account_number}/api/records/${record._id}/data-room/items/${item._id}/file`,
        downloadUrl: `/account/${req.account_number}/api/records/${record._id}/data-room/items/${item._id}/file?dl=1`,
        addedAt: item.addedAt,
        addedBy: item.addedBy
    };
}

function normalizeDataRoom(record, req, shareStatus = {}) {
    ensureDataRoom(record);
    const items = (record.dataRoom.items || [])
        .filter(item => canUseDataRoomItem(req, record, item, 'view'))
        .map(item => normalizeItem(record, item, req, shareStatus))
        .filter(Boolean)
        .sort((a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0));
    const visibleItemIds = new Set(items.map(item => String(item._id)));
    const visibleFolderPaths = new Set();

    items.forEach(item => {
        let pathSoFar = '';
        cleanPath(item.folder || '').split('/').filter(Boolean).forEach(part => {
            pathSoFar = pathSoFar ? pathSoFar + '/' + part : part;
            visibleFolderPaths.add(pathSoFar);
        });
    });

    (record.dataRoom.folders || []).forEach(folder => {
        if (!canUseDataRoomFolder(req, record, folder, 'view')) return;
        let pathSoFar = '';
        cleanPath(folder.path || '').split('/').filter(Boolean).forEach(part => {
            pathSoFar = pathSoFar ? pathSoFar + '/' + part : part;
            visibleFolderPaths.add(pathSoFar);
        });
    });

    const folders = (record.dataRoom.folders || [])
        .filter(folder => visibleFolderPaths.has(cleanPath(folder.path || '')))
        .map(folder => normalizeFolder(record, folder, req, shareStatus))
        .sort((a, b) => a.path.localeCompare(b.path));

    const logs = (record.dataRoom.logs || [])
        .filter(log => canManageDataRoom(req, record) || (log.itemId && visibleItemIds.has(String(log.itemId))))
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

    const roomCanManage = canManageDataRoom(req, record);
    const roomAccess = normalizeAccess(record.dataRoom, shareStatus);
    if (!roomCanManage) roomAccess.shares = [];

    return {
        access: {
            ...roomAccess,
            canManage: roomCanManage
        },
        folders,
        items,
        logs
    };
}

function collectDataRoomShareEmails(record) {
    ensureDataRoom(record);
    const emails = new Set();
    const collect = shares => (shares || []).forEach(share => {
        const email = String(share.email || '').trim().toLowerCase();
        if (email) emails.add(email);
    });
    collect(record.dataRoom.shares);
    (record.dataRoom.folders || []).forEach(folder => collect(folder.shares));
    (record.dataRoom.items || []).forEach(item => collect(item.shares));
    return [...emails];
}

async function buildShareStatus(req, record) {
    const emails = collectDataRoomShareEmails(record);
    if (emails.length === 0) return {};

    const status = Object.fromEntries(emails.map(email => [email, {
        email,
        inviteStatus: 'none',
        workspaceStatus: 'none',
        recordAccessStatus: 'none'
    }]));

    const account = await Account.findOne({ account_number: req.account_number })
        .select('users invitations')
        .lean();
    const users = await User.find({ email: { $in: emails } }).select('_id email').lean();
    const usersByEmail = Object.fromEntries(users.map(user => [String(user.email || '').trim().toLowerCase(), user]));

    if (account) {
        emails.forEach(email => {
            const member = (account.users || []).find(user =>
                String(user.email || '').trim().toLowerCase() === email && user.status === 'active'
            );
            const invite = (account.invitations || []).find(entry =>
                String(entry.email || '').trim().toLowerCase() === email &&
                ['pending', 'accepted', 'expired'].includes(entry.status)
            );

            if (member) {
                status[email].workspaceStatus = 'active';
                status[email].workspaceRole = member.role || 'guest';
                status[email].inviteStatus = 'accepted';
            } else if (invite) {
                status[email].workspaceStatus = invite.status || 'pending';
                status[email].workspaceRole = invite.role || 'guest';
                status[email].inviteStatus = invite.status === 'accepted' ? 'accepted' : invite.status === 'expired' ? 'expired' : 'pending';
            }
        });
    }

    const RecordAccess = await tenantCollection(req, 'RecordAccess');
    const access = RecordAccess
        ? await RecordAccess.findOne({ recordId: record._id }).lean()
        : null;

    if (access) {
        emails.forEach(email => {
            const user = usersByEmail[email];
            const hasGrant = user && (access.grants || []).some(grant =>
                grant.granteeType === 'user' &&
                String(grant.granteeId) === String(user._id) &&
                grant.permissions?.read !== false &&
                (!grant.expiresAt || new Date(grant.expiresAt) > new Date())
            );
            const hasPending = (access.pendingInvites || []).some(invite =>
                String(invite.email || '').trim().toLowerCase() === email
            );

            if (hasGrant) {
                status[email].recordAccessStatus = 'grant';
                status[email].inviteStatus = 'accepted';
                status[email].userId = String(user._id);
            } else if (hasPending) {
                status[email].recordAccessStatus = 'pending';
                if (status[email].inviteStatus === 'none') status[email].inviteStatus = 'pending';
            }
        });
    }

    return status;
}

async function dataRoomPayload(req, record, extra = {}) {
    return {
        success: true,
        dataRoom: normalizeDataRoom(record, req, await buildShareStatus(req, record)),
        ...extra
    };
}

async function dataRoomUrlForRecord(req, record) {
    let entitySlug = 'record';
    try {
        const Entity = await tenantCollection(req, 'Entity');
        const entity = Entity
            ? await Entity.findById(record.entityId).select('slug name').lean()
            : null;
        entitySlug = entity?.slug || entitySlug;
    } catch (err) {
        console.warn('[DataRoom] entity lookup for share URL failed:', err.message);
    }
    return `${req.protocol}://${req.get('host')}/account/${req.account_number}/record/${encodeURIComponent(entitySlug)}/${record._id}/data-room`;
}

function recordTitle(record) {
    return record.computedTitle || record.title || 'Data Room';
}

function scopeLabel(scope, target) {
    if (scope === 'folder') return `Dossier ${target?.path || target?.name || ''}`.trim();
    if (scope === 'item') return `Fichier ${target?.displayName || 'document'}`;
    return 'Toute la Data Room';
}

async function ensureWorkspaceAccessInvite(req, account, email) {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const activeMember = (account.users || []).some(user =>
        String(user.email || '').trim().toLowerCase() === cleanEmail && user.status === 'active'
    );
    if (activeMember) return { requiresWorkspaceAccept: false, actionUrl: null };

    let invite = (account.invitations || []).find(entry =>
        String(entry.email || '').trim().toLowerCase() === cleanEmail && entry.status === 'pending'
    );

    if (!invite) {
        invite = {
            email: cleanEmail,
            role: 'guest',
            token: crypto.randomBytes(32).toString('hex'),
            invitedBy: req.user?._id,
            invitedAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: 'pending'
        };
        account.invitations.push(invite);
        await account.save();
    }

    return {
        requiresWorkspaceAccept: true,
        actionUrl: `${req.protocol}://${req.get('host')}/auth/invite/${invite.token}`
    };
}

function recordPermissionsFromShare(share) {
    return {
        read: share.permissions?.view !== false,
        update: false,
        delete: false,
        share: !!share.permissions?.share || share.role === 'manager',
        modules: {
            overview: false,
            fiche: false,
            docs: false,
            drive: false,
            dataRoom: true,
            tasks: false,
            agenda: false,
            chat: false,
            emails: false,
            notes: false,
            team: false,
        },
    };
}

async function ensureRecordAccessForShares(req, record, shares) {
    const emails = [...new Set((shares || [])
        .map(share => String(share.email || '').trim().toLowerCase())
        .filter(Boolean))];
    if (emails.length === 0) return;

    const [RecordAccess, account, users] = await Promise.all([
        tenantCollection(req, 'RecordAccess'),
        Account.findOne({ account_number: req.account_number }).select('users').lean(),
        User.find({ email: { $in: emails } }).select('_id email').lean()
    ]);
    if (!RecordAccess) return;

    const usersByEmail = Object.fromEntries(users.map(user => [String(user.email || '').trim().toLowerCase(), user]));
    let access = await RecordAccess.findOne({ recordId: record._id });
    if (!access) access = new RecordAccess({ recordId: record._id, entityId: String(record.entityId || '') });

    let changed = false;
    for (const share of shares || []) {
        const email = String(share.email || '').trim().toLowerCase();
        if (!email) continue;
        const permissions = recordPermissionsFromShare(share);
        const user = usersByEmail[email];
        const isActiveMember = (account?.users || []).some(member =>
            String(member.email || '').trim().toLowerCase() === email && member.status === 'active'
        );

        if (user && isActiveMember) {
            const granteeId = String(user._id);
            const grantIdx = (access.grants || []).findIndex(grant =>
                grant.granteeType === 'user' && String(grant.granteeId) === granteeId
            );
            const grant = {
                granteeType: 'user',
                granteeId,
                permissions,
                grantedBy: req.user?._id,
                grantedAt: new Date(),
                expiresAt: null,
                note: 'Data Room'
            };

            if (grantIdx >= 0) {
                access.grants[grantIdx].permissions = permissions;
                access.grants[grantIdx].grantedBy = req.user?._id;
                access.grants[grantIdx].grantedAt = new Date();
                access.grants[grantIdx].expiresAt = null;
                access.grants[grantIdx].note = 'Data Room';
            } else {
                access.grants.push(grant);
            }
            access.pendingInvites = (access.pendingInvites || []).filter(invite =>
                String(invite.email || '').trim().toLowerCase() !== email
            );
            changed = true;
            continue;
        }

        const pendingIdx = (access.pendingInvites || []).findIndex(invite =>
            String(invite.email || '').trim().toLowerCase() === email
        );
        const pendingInvite = {
            email,
            permissions,
            invitedBy: req.user?._id,
            invitedAt: new Date()
        };

        if (pendingIdx >= 0) {
            access.pendingInvites[pendingIdx].permissions = permissions;
        } else {
            access.pendingInvites = access.pendingInvites || [];
            access.pendingInvites.push(pendingInvite);
        }
        changed = true;
    }

    if (changed) await access.save();
}

async function notifyDataRoomShares(req, record, shares, scope, target) {
    const pending = (shares || []).filter(share => share.email && !share.notifiedAt);
    if (pending.length === 0) return { sent: 0, dryRun: 0, failed: 0 };

    const account = await Account.findOne({ account_number: req.account_number });
    if (!account) return { sent: 0, dryRun: 0, failed: pending.length };

    const accountName = account.name || `Compte ${req.account_number}`;
    const inviterName = userLabel(req);
    const dataRoomUrl = await dataRoomUrlForRecord(req, record);
    const notification = { sent: 0, dryRun: 0, failed: 0 };

    for (const share of pending) {
        const email = String(share.email || '').trim().toLowerCase();
        if (!email) continue;

        try {
            const workspaceAccess = await ensureWorkspaceAccessInvite(req, account, email);
            const actionUrl = workspaceAccess.actionUrl || dataRoomUrl;
            const info = await mailer.sendDataRoomShare({
                to: email,
                accountName,
                inviterName,
                recordTitle: recordTitle(record),
                scopeLabel: scopeLabel(scope, target),
                role: share.role || 'viewer',
                actionUrl,
                requiresWorkspaceAccept: workspaceAccess.requiresWorkspaceAccept
            });

            if (info?.dryRun) {
                notification.dryRun++;
            } else {
                share.notifiedAt = new Date();
                notification.sent++;
            }
        } catch (mailErr) {
            notification.failed++;
            console.error('[DataRoom] share email failed:', email, mailErr.message);
        }
    }

    return notification;
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
    return Record.findById(req.params.recordId).select(select || 'attachments dataRoom title computedTitle entityId');
}

router.get('/records/:recordId/data-room', async (req, res) => {
    try {
        const record = await loadRecord(req);
        if (!record) return res.status(404).json({ error: 'Record introuvable' });
        ensureDataRoom(record);
        res.json(await dataRoomPayload(req, record));
    } catch (err) {
        console.error('[DataRoom] list error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.patch('/records/:recordId/data-room/access', async (req, res) => {
    try {
        const record = await loadRecord(req);
        if (!record) return res.status(404).json({ error: 'Record introuvable' });
        ensureDataRoom(record);
        if (!canManageDataRoom(req, record)) return res.status(403).json({ error: 'Permission refusée' });

        if (req.body.accessMode !== undefined) {
            record.dataRoom.accessMode = req.body.accessMode === 'restricted' ? 'restricted' : 'workspace';
        }
        if (req.body.permissions !== undefined) {
            record.dataRoom.permissions = permissionsFromBody(req.body.permissions);
        }
        let notification = { sent: 0, dryRun: 0, failed: 0 };
        if (req.body.shares !== undefined) {
            const shares = Array.isArray(req.body.shares) ? req.body.shares : [];
            const nextShares = shares.map(share => normalizeShare(share, req)).filter(Boolean);
            record.dataRoom.shares = mergeSharesWithExisting(record.dataRoom.shares, nextShares);
        }

        pushLog(record, null, req, 'room.access_updated', 'Data Room');
        record.markModified('dataRoom');
        await record.save();

        if (req.body.shares !== undefined) {
            await ensureRecordAccessForShares(req, record, record.dataRoom.shares);
            notification = await notifyDataRoomShares(req, record, record.dataRoom.shares, 'room', record.dataRoom);
            if (notification.sent > 0) {
                record.markModified('dataRoom');
                await record.save();
            }
        }

        res.json(await dataRoomPayload(req, record, { notification }));
    } catch (err) {
        console.error('[DataRoom] room access error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/records/:recordId/data-room/drive-files', async (req, res) => {
    try {
        const record = await loadRecord(req);
        if (!record) return res.status(404).json({ error: 'Record introuvable' });
        ensureDataRoom(record);
        if (!canManageDataRoomPath(req, record, cleanPath(req.query.folder || ''))) return res.status(403).json({ error: 'Permission refusée' });
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
        if (!canManageDataRoomPath(req, record, parentPath)) {
            return res.status(403).json({ error: 'Permission refusée' });
        }
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
        res.json(await dataRoomPayload(req, record));
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
        if (!canManageDataRoomFolder(req, record, folder)) return res.status(403).json({ error: 'Permission refusée' });
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
        res.json(await dataRoomPayload(req, record));
    } catch (err) {
        console.error('[DataRoom] rename folder error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.patch('/records/:recordId/data-room/folders/:folderId/access', async (req, res) => {
    try {
        const record = await loadRecord(req);
        if (!record) return res.status(404).json({ error: 'Record introuvable' });
        ensureDataRoom(record);

        const folder = folderById(record, req.params.folderId);
        if (!folder) return res.status(404).json({ error: 'Dossier introuvable' });
        if (!canManageDataRoomFolder(req, record, folder)) return res.status(403).json({ error: 'Permission refusée' });

        if (req.body.accessMode !== undefined) folder.accessMode = req.body.accessMode === 'restricted' ? 'restricted' : 'workspace';
        if (req.body.permissions !== undefined) folder.permissions = permissionsFromBody(req.body.permissions);
        let notification = { sent: 0, dryRun: 0, failed: 0 };
        if (req.body.shares !== undefined) {
            const shares = Array.isArray(req.body.shares) ? req.body.shares : [];
            const nextShares = shares.map(share => normalizeShare(share, req)).filter(Boolean);
            folder.shares = mergeSharesWithExisting(folder.shares, nextShares);
        }

        pushLog(record, null, req, 'folder.access_updated', folder.path || folder.name || '');
        record.markModified('dataRoom');
        await record.save();

        if (req.body.shares !== undefined) {
            await ensureRecordAccessForShares(req, record, folder.shares);
            notification = await notifyDataRoomShares(req, record, folder.shares, 'folder', folder);
            if (notification.sent > 0) {
                record.markModified('dataRoom');
                await record.save();
            }
        }

        res.json(await dataRoomPayload(req, record, { notification }));
    } catch (err) {
        console.error('[DataRoom] folder access error:', err);
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
        if (!canManageDataRoomPath(req, record, folder)) {
            return res.status(403).json({ error: 'Permission refusée' });
        }
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
        res.json(await dataRoomPayload(req, record, { added }));
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
        if (!canManageDataRoomPath(req, record, folder)) {
            cleanupUploadedFiles(req.files);
            return res.status(403).json({ error: 'Permission refusée' });
        }
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
        res.json(await dataRoomPayload(req, record, { added: addedItems.length }));
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
        if (!canManageDataRoomItem(req, record, item)) return res.status(403).json({ error: 'Permission refusée' });

        if (req.body.displayName !== undefined) item.displayName = String(req.body.displayName || '').trim();
        if (req.body.folder !== undefined) {
            const nextFolder = cleanPath(req.body.folder || '');
            if (!canManageDataRoomPath(req, record, nextFolder)) return res.status(403).json({ error: 'Permission refusée' });
            item.folder = nextFolder;
        }
        if (req.body.accessMode !== undefined) item.accessMode = req.body.accessMode === 'restricted' ? 'restricted' : 'workspace';
        if (req.body.permissions !== undefined) item.permissions = permissionsFromBody(req.body.permissions);
        let notification = { sent: 0, dryRun: 0, failed: 0 };
        if (req.body.shares !== undefined) {
            const shares = Array.isArray(req.body.shares) ? req.body.shares : [];
            const nextShares = shares.map(share => normalizeShare(share, req)).filter(Boolean);
            item.shares = mergeSharesWithExisting(item.shares, nextShares);
        }

        pushLog(record, item, req, 'item.permissions_updated', item.displayName || '');
        record.markModified('dataRoom');
        await record.save();

        if (req.body.shares !== undefined) {
            await ensureRecordAccessForShares(req, record, item.shares);
            notification = await notifyDataRoomShares(req, record, item.shares, 'item', item);
            if (notification.sent > 0) {
                record.markModified('dataRoom');
                await record.save();
            }
        }

        res.json(await dataRoomPayload(req, record, { notification }));
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
        if (!canManageDataRoomItem(req, record, item)) return res.status(403).json({ error: 'Permission refusée' });

        pushLog(record, item, req, 'item.removed', item.displayName || '');
        record.dataRoom.items = record.dataRoom.items.filter(i => String(i._id) !== String(req.params.itemId));
        record.markModified('dataRoom');
        await record.save();
        res.json(await dataRoomPayload(req, record));
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
        if (!canUseDataRoomItem(req, record, item, 'view')) return res.status(403).json({ error: 'Permission refusée' });
        const action = String(req.body.action || 'item.viewed').slice(0, 60);
        pushLog(record, item, req, action, String(req.body.details || '').slice(0, 300));
        await record.save();
        res.json(await dataRoomPayload(req, record));
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
        if (!canUseDataRoomItem(req, record, item, isDownload ? 'download' : 'view')) {
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
