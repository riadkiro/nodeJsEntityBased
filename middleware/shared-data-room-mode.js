const { tenantCollection } = require('./tenant');

const SHARED_ROLES = new Set(['guest', 'external']);

function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
}

function stringId(value) {
    if (!value) return '';
    return String(value._id || value);
}

function isSharedRole(req) {
    if (req.user?.role === 'superadmin') return false;
    return SHARED_ROLES.has(req.workspaceRole);
}

function currentUserTeamIds(req) {
    const userId = stringId(req.user?._id);
    if (!userId || !req._workspaceAccount) return [];

    return (req._workspaceAccount.teams || [])
        .filter(team => (team.memberIds || []).map(String).includes(userId))
        .map(team => stringId(team._id));
}

function grantIsActive(grant, now) {
    return !grant.expiresAt || new Date(grant.expiresAt) > now;
}

function grantMatchesUser(req, grant, teamIds, now) {
    if (!grant || !grant.permissions?.read || !grantIsActive(grant, now)) return false;

    const granteeId = String(grant.granteeId || '');
    if (grant.granteeType === 'user') return granteeId === stringId(req.user?._id);
    if (grant.granteeType === 'team') return teamIds.includes(granteeId);
    return false;
}

function shareMatchesUser(req, share) {
    if (!share) return false;
    const email = normalizeEmail(req.user?.email);
    const userId = stringId(req.user?._id);
    const shareEmail = normalizeEmail(share.email);
    const shareUserId = stringId(share.userId);

    return Boolean(
        (email && shareEmail && email === shareEmail) ||
        (userId && shareUserId && userId === shareUserId)
    );
}

function collectDataRoomShares(record) {
    const dataRoom = record?.dataRoom || {};
    const shares = [];

    shares.push(...(dataRoom.shares || []));
    (dataRoom.folders || []).forEach(folder => shares.push(...(folder.shares || [])));
    (dataRoom.items || []).forEach(item => shares.push(...(item.shares || [])));

    return shares;
}

function recordHasMatchingDataRoomShare(req, record) {
    return collectDataRoomShares(record).some(share => shareMatchesUser(req, share));
}

function accessHasDataRoomGrant(req, accessDoc, teamIds, now) {
    return (accessDoc.grants || []).some(grant => {
        if (String(grant.note || '').trim().toLowerCase() !== 'data room') return false;
        return grantMatchesUser(req, grant, teamIds, now);
    });
}

function titleForRecord(record) {
    return record?.computedTitle || record?.title || 'Data Room';
}

function buildRoomUrl(req, entity, record) {
    return `/account/${req.account_number}/record/${encodeURIComponent(entity.slug || 'record')}/${record._id}/data-room`;
}

function sharedFallbackUrl(req, dataRooms) {
    if (dataRooms && dataRooms.length === 1) return dataRooms[0].url;
    return `/account/${req.account_number}/shared-with-you`;
}

async function resolveSharedDataRoomMode(req) {
    if (req._sharedDataRoomResolved) return req._sharedDataRoomResolved;

    const empty = {
        active: false,
        dataRooms: [],
        dataRoomRecordIds: [],
        nonDataRoomRecordIds: [],
    };

    if (!req.user || !req.account_number || !isSharedRole(req)) {
        req._sharedDataRoomResolved = empty;
        return empty;
    }

    try {
        const [RecordAccess, Record, Entity] = await Promise.all([
            tenantCollection(req, 'RecordAccess'),
            tenantCollection(req, 'Record'),
            tenantCollection(req, 'Entity'),
        ]);

        if (!RecordAccess || !Record || !Entity) {
            req._sharedDataRoomResolved = empty;
            return empty;
        }

        const email = normalizeEmail(req.user.email);
        const userId = stringId(req.user._id);
        const teamIds = currentUserTeamIds(req);
        const now = new Date();
        const or = [
            {
                grants: {
                    $elemMatch: {
                        granteeType: 'user',
                        granteeId: userId,
                        'permissions.read': true,
                    },
                },
            },
            { pendingInvites: { $elemMatch: { email } } },
        ];

        if (teamIds.length > 0) {
            or.push({
                grants: {
                    $elemMatch: {
                        granteeType: 'team',
                        granteeId: { $in: teamIds },
                        'permissions.read': true,
                    },
                },
            });
        }

        const accessDocs = await RecordAccess.find({ $or: or })
            .select('recordId entityId grants pendingInvites')
            .lean();

        const accessByRecordId = new Map();
        accessDocs.forEach(doc => {
            const hasGrant = (doc.grants || []).some(grant => grantMatchesUser(req, grant, teamIds, now));
            const hasPendingInvite = (doc.pendingInvites || []).some(invite => normalizeEmail(invite.email) === email);
            if (!hasGrant && !hasPendingInvite) return;
            accessByRecordId.set(stringId(doc.recordId), doc);
        });

        const recordIds = [...accessByRecordId.keys()];
        if (recordIds.length === 0) {
            req._sharedDataRoomResolved = empty;
            return empty;
        }

        const records = await Record.find({ _id: { $in: recordIds } })
            .select('title computedTitle entityId dataRoom')
            .lean();

        const entityIds = [...new Set(records.map(record => stringId(record.entityId)).filter(Boolean))];
        const entities = entityIds.length > 0
            ? await Entity.find({ _id: { $in: entityIds } }).select('name nameSingular slug icon color').lean()
            : [];
        const entityById = new Map(entities.map(entity => [stringId(entity._id), entity]));

        const dataRooms = [];
        const nonDataRoomRecordIds = [];

        records.forEach(record => {
            const recordId = stringId(record._id);
            const accessDoc = accessByRecordId.get(recordId);
            const isDataRoomShare = recordHasMatchingDataRoomShare(req, record)
                || accessHasDataRoomGrant(req, accessDoc, teamIds, now);

            if (!isDataRoomShare) {
                nonDataRoomRecordIds.push(recordId);
                return;
            }

            const entity = entityById.get(stringId(record.entityId)) || {};
            dataRooms.push({
                recordId,
                title: titleForRecord(record),
                entityId: stringId(record.entityId),
                entityName: entity.nameSingular || entity.name || 'Record',
                entitySlug: entity.slug || 'record',
                entityIcon: entity.icon || 'solar:shield-keyhole-bold-duotone',
                entityColor: entity.color || '#0f766e',
                url: buildRoomUrl(req, entity, record),
            });
        });

        dataRooms.sort((a, b) => a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' }));

        const result = {
            active: dataRooms.length > 0 && nonDataRoomRecordIds.length === 0,
            dataRooms,
            dataRoomRecordIds: dataRooms.map(room => room.recordId),
            nonDataRoomRecordIds,
        };

        req._sharedDataRoomResolved = result;
        return result;
    } catch (error) {
        console.error('[SharedDataRoom] resolve error:', error.message);
        req._sharedDataRoomResolved = empty;
        return empty;
    }
}

async function attachSharedDataRoomMode(req, res, next) {
    try {
        const info = await resolveSharedDataRoomMode(req);
        req.sharedDataRoomMode = info.active;
        req.sharedDataRooms = info.dataRooms;
        res.locals.sharedDataRoomMode = info.active;
        res.locals.sharedDataRooms = info.dataRooms;
        next();
    } catch (error) {
        next(error);
    }
}

function allowedSharedPath(req, info) {
    const path = req.path;

    if (path === '/shared-with-you' || path === '/shared-with-you/') return true;
    if (path === '/api/user/theme') return true;

    const moduleMatch = path.match(/^\/record\/[^/]+\/([^/]+)\/data-room\/?$/);
    if (moduleMatch) return info.dataRoomRecordIds.includes(moduleMatch[1]);

    const apiMatch = path.match(/^\/api\/records\/([^/]+)\/data-room(?:\/|$)/);
    if (apiMatch) return info.dataRoomRecordIds.includes(apiMatch[1]);

    return false;
}

async function enforceSharedDataRoomMode(req, res, next) {
    try {
        const info = await resolveSharedDataRoomMode(req);
        if (!info.active) return next();

        res.locals.sharedDataRoomMode = true;
        res.locals.sharedDataRooms = info.dataRooms;
        req.sharedDataRoomMode = true;
        req.sharedDataRooms = info.dataRooms;

        if (allowedSharedPath(req, info)) return next();

        if (req.method !== 'GET') {
            return res.status(403).json({
                success: false,
                error: 'Acces limite a la Data Room partagee.',
            });
        }

        return res.redirect(sharedFallbackUrl(req, info.dataRooms));
    } catch (error) {
        next(error);
    }
}

async function renderSharedWithYou(req, res, next) {
    try {
        const info = await resolveSharedDataRoomMode(req);
        req.sharedDataRoomMode = info.active;
        req.sharedDataRooms = info.dataRooms;
        res.locals.sharedDataRoomMode = info.active;
        res.locals.sharedDataRooms = info.dataRooms;

        res.render('account/account-shared-with-you', {
            layout: 'layout-app',
            user: req.user,
            account_number: req.account_number,
            sharedDataRooms: info.dataRooms,
            sharedDataRoomMode: info.active,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    resolveSharedDataRoomMode,
    attachSharedDataRoomMode,
    enforceSharedDataRoomMode,
    renderSharedWithYou,
};
