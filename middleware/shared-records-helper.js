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
async function canAccessRecord(req, recordId, entityId) {
    const role = req.workspaceRole;

    // Owner/Admin/Manager/Member have unrestricted access
    if (!role || !['guest', 'external'].includes(role)) return true;
    if (req.user?.role === 'superadmin') return true;

    try {
        const RecordAccess = await tenantCollection(req, 'RecordAccess');
        const userId = req.user._id.toString();

        // Check direct user grant
        const access = await RecordAccess.findOne({
            recordId,
            'grants': {
                $elemMatch: {
                    granteeId: userId,
                    granteeType: 'user',
                    'permissions.read': true,
                }
            }
        }).lean();

        if (access) return true;

        // Check email-based pending invite
        const emailAccess = await RecordAccess.findOne({
            recordId,
            'pendingInvites.email': req.user.email?.toLowerCase(),
        }).lean();

        if (emailAccess) return true;

        // Check team grants
        if (req._workspaceAccount) {
            const account = req._workspaceAccount;
            const userTeamIds = (account.teams || [])
                .filter(t => (t.memberIds || []).map(String).includes(userId))
                .map(t => t._id.toString());

            if (userTeamIds.length > 0) {
                const teamAccess = await RecordAccess.findOne({
                    recordId,
                    'grants': {
                        $elemMatch: {
                            granteeId: { $in: userTeamIds },
                            granteeType: 'team',
                            'permissions.read': true,
                        }
                    }
                }).lean();

                if (teamAccess) return true;
            }
        }

        return false;
    } catch (error) {
        console.error('[SharedRecords] Error checking record access:', error.message);
        return false; // Fail-secure
    }
}

module.exports = {
    getSharedRecordFilter,
    canAccessRecord,
};
