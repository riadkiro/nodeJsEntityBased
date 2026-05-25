/**
 * Shared Records Helper
 * ─────────────────────
 * For guest/external users, restricts data access to only
 * records explicitly shared with them via RecordAccess grants.
 * 
 * Usage:
 *   const { getSharedRecordFilter } = require('../middleware/shared-records-helper');
 *   const filter = await getSharedRecordFilter(req, entityId);
 *   if (filter) query._id = filter._id;
 */

const { tenantCollection } = require('./tenant');

const RECORD_MODULE_KEYS = ['overview', 'fiche', 'docs', 'drive', 'dataRoom', 'tasks', 'agenda', 'chat', 'emails', 'notes', 'team'];
const MODULE_ROUTE_KEYS = {
    dataRoom: 'data-room',
};
const MODULE_PERMISSION_KEYS = {
    'data-room': 'dataRoom',
};

function normalizeModuleKey(moduleName) {
    return MODULE_PERMISSION_KEYS[moduleName] || moduleName;
}

function routeModuleKey(moduleKey) {
    return MODULE_ROUTE_KEYS[moduleKey] || moduleKey;
}

function defaultModules(permissions = {}) {
    return Object.fromEntries(RECORD_MODULE_KEYS.map(key => [
        key,
        key === 'team' ? permissions.share === true : true,
    ]));
}

function modulesFromPermissions(permissions = {}) {
    const modules = { ...defaultModules(permissions) };
    const source = permissions.modules && typeof permissions.modules === 'object'
        ? permissions.modules
        : null;

    if (source) {
        RECORD_MODULE_KEYS.forEach(key => {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                modules[key] = source[key] !== false;
            }
        });
    }

    if (permissions.share !== true) modules.team = false;
    return modules;
}

function modulesAllowedByPermissions(permissions = {}) {
    if (permissions.read === false) return [];
    const modules = modulesFromPermissions(permissions);
    return RECORD_MODULE_KEYS
        .filter(key => modules[key] === true)
        .map(routeModuleKey);
}

function permissionAllowsModule(permissions = {}, moduleName) {
    if (!moduleName) return modulesAllowedByPermissions(permissions).length > 0;
    const key = normalizeModuleKey(moduleName);
    if (permissions.read === false) return false;
    return modulesFromPermissions(permissions)[key] === true;
}

function currentUserTeamIds(req) {
    if (!req._workspaceAccount || !req.user?._id) return [];
    const userId = req.user._id.toString();
    return (req._workspaceAccount.teams || [])
        .filter(t => (t.memberIds || []).map(String).includes(userId))
        .map(t => t._id.toString());
}

function grantMatches(req, grant, teamIds, now) {
    if (!grant || grant.permissions?.read === false) return false;
    if (grant.expiresAt && new Date(grant.expiresAt) < now) return false;

    const userId = req.user._id.toString();
    if (grant.granteeType === 'user' && grant.granteeId === userId) return true;
    if (grant.granteeType === 'team' && teamIds.includes(grant.granteeId)) return true;
    return false;
}

/**
 * Returns a MongoDB filter to restrict record queries to only shared records.
 * Returns null if the user has unrestricted access (owner/admin/manager/member).
 * 
 * @param {Object} req - Express request (must have workspaceRole, user._id)
 * @param {string} entityId - The entity ID to filter for (optional, filters by entity)
 * @returns {Object|null} - { _id: { $in: [...] } } or null if no restriction
 */
async function getSharedRecordFilter(req, entityId) {
    const role = req.workspaceRole;

    // Owner/Admin/Manager/Member have unrestricted access
    if (!role || !['guest', 'external'].includes(role)) return null;

    // Superadmin bypasses all
    if (req.user?.role === 'superadmin') return null;

    try {
        const RecordAccess = await tenantCollection(req, 'RecordAccess');
        const userId = req.user._id.toString();

        // Build query for RecordAccess documents where user has a grant
        const accessQuery = {
            'grants': {
                $elemMatch: {
                    granteeId: userId,
                    granteeType: 'user',
                    'permissions.read': true,
                }
            }
        };

        // Optionally filter by entity
        if (entityId) {
            accessQuery.entityId = entityId.toString();
        }

        const accesses = await RecordAccess.find(accessQuery)
            .select('recordId')
            .lean();

        const recordIds = accesses.map(a => a.recordId);

        // Also check pendingInvites by email (user may have been invited by email)
        const emailAccesses = await RecordAccess.find({
            ...(entityId ? { entityId: entityId.toString() } : {}),
            'pendingInvites.email': req.user.email?.toLowerCase(),
        }).select('recordId').lean();

        emailAccesses.forEach(a => {
            if (!recordIds.some(id => id.toString() === a.recordId.toString())) {
                recordIds.push(a.recordId);
            }
        });

        // Also check team-based grants
        if (req._workspaceAccount) {
            const account = req._workspaceAccount;
            const userTeamIds = (account.teams || [])
                .filter(t => (t.memberIds || []).map(String).includes(userId))
                .map(t => t._id.toString());

            if (userTeamIds.length > 0) {
                const teamAccesses = await RecordAccess.find({
                    ...(entityId ? { entityId: entityId.toString() } : {}),
                    'grants': {
                        $elemMatch: {
                            granteeId: { $in: userTeamIds },
                            granteeType: 'team',
                            'permissions.read': true,
                        }
                    }
                }).select('recordId').lean();

                teamAccesses.forEach(a => {
                    if (!recordIds.some(id => id.toString() === a.recordId.toString())) {
                        recordIds.push(a.recordId);
                    }
                });
            }
        }

        return { _id: { $in: recordIds } };
    } catch (error) {
        console.error('[SharedRecords] Error resolving shared records:', error.message);
        // Fail-secure: return empty set (no access)
        return { _id: { $in: [] } };
    }
}

/**
 * Check if a specific record is accessible by a guest/external user.
 * Returns true if the user has access, false otherwise.
 */
async function canAccessRecord(req, recordId, entityId, moduleName = null) {
    const role = req.workspaceRole;

    // Owner/Admin/Manager/Member have unrestricted access
    if (!role || !['guest', 'external'].includes(role)) return true;
    if (req.user?.role === 'superadmin') return true;

    try {
        const modules = await getAccessibleRecordModules(req, recordId);
        if (!Array.isArray(modules)) return true;
        if (!moduleName) return modules.length > 0;
        return modules.includes(moduleName);
    } catch (error) {
        console.error('[SharedRecords] Error checking record access:', error.message);
        return false; // Fail-secure
    }
}

async function getAccessibleRecordModules(req, recordId) {
    const role = req.workspaceRole;

    // null means unrestricted at record-grant level.
    if (!role || !['guest', 'external'].includes(role)) return null;
    if (req.user?.role === 'superadmin') return null;

    try {
        const RecordAccess = await tenantCollection(req, 'RecordAccess');
        const access = await RecordAccess.findOne({ recordId }).lean();
        if (!access) return [];

        const now = new Date();
        const teamIds = currentUserTeamIds(req);
        const allowed = new Set();

        (access.grants || []).forEach(grant => {
            if (!grantMatches(req, grant, teamIds, now)) return;
            modulesAllowedByPermissions(grant.permissions || {}).forEach(moduleName => allowed.add(moduleName));
        });

        const email = req.user.email?.toLowerCase();
        (access.pendingInvites || []).forEach(invite => {
            if (!email || invite.email !== email) return;
            modulesAllowedByPermissions(invite.permissions || {}).forEach(moduleName => allowed.add(moduleName));
        });

        return [...allowed];
    } catch (error) {
        console.error('[SharedRecords] Error resolving record modules:', error.message);
        return [];
    }
}

module.exports = {
    getSharedRecordFilter,
    canAccessRecord,
    getAccessibleRecordModules,
    permissionAllowsModule,
    modulesAllowedByPermissions,
};
