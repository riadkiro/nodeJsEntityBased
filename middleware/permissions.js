/**
 * Workspace Permissions Middleware
 * ────────────────────────────────
 * Centralized role-based permission system.
 * 
 * Roles: owner > admin > member
 * 
 * Usage:
 *   const { requirePerm } = require('../middleware/permissions');
 *   router.post('/api/invite', requirePerm('members.invite'), controller.invite);
 * 
 * In templates:
 *   <% if (can('members.invite')) { %> ... <% } %>
 */

const Account = require('../models/account.model');

// ═══════════════════════════════════════════
// Permission Matrix
// ═══════════════════════════════════════════
const PERMISSIONS = {
    // Settings
    'settings.view':       ['owner', 'admin'],
    'settings.update':     ['owner', 'admin'],

    // Members
    'members.view':        ['owner', 'admin'],
    'members.invite':      ['owner', 'admin'],
    'members.remove':      ['owner', 'admin'],
    'members.changeRole':  ['owner', 'admin'],

    // Invitations
    'invites.cancel':      ['owner', 'admin'],

    // Account-level (destructive)
    'account.delete':      ['owner'],
    'account.export':      ['owner'],

    // Admin role assignment (only owner can promote to admin)
    'members.inviteAdmin': ['owner'],
    'members.promoteAdmin':['owner'],

    // Integrations
    'integrations.manage': ['owner', 'admin'],

    // Records (data)
    'records.create':      ['owner', 'admin'],
    'records.update':      ['owner', 'admin'],
    'records.delete':      ['owner', 'admin'],
    'records.read':        ['owner', 'admin', 'member'],

    // Entities
    'entities.manage':     ['owner', 'admin'],

    // General access
    'dashboard.view':      ['owner', 'admin', 'member'],
    'agenda.view':         ['owner', 'admin', 'member'],
    'team.view':           ['owner', 'admin', 'member'],
    'chat.view':           ['owner', 'admin', 'member'],
};

// ═══════════════════════════════════════════
// Role hierarchy (for comparisons)
// ═══════════════════════════════════════════
const ROLE_HIERARCHY = { owner: 3, admin: 2, member: 1 };

function getRoleLevel(role) {
    return ROLE_HIERARCHY[role] || 0;
}

// ═══════════════════════════════════════════
// Check if role has a specific permission
// ═══════════════════════════════════════════
function hasPermission(role, permission) {
    const allowedRoles = PERMISSIONS[permission];
    if (!allowedRoles) {
        // Unknown permission → deny by default
        console.warn(`[Permissions] Unknown permission: ${permission}`);
        return false;
    }
    return allowedRoles.includes(role);
}

// ═══════════════════════════════════════════
// Middleware: Hydrate workspace role on req
// ═══════════════════════════════════════════
async function hydrateWorkspaceRole(req, res, next) {
    if (!req.user || !req.account_number) return next();

    try {
        // Cache the account lookup per request (avoid duplicate queries)
        if (!req._workspaceAccount) {
            req._workspaceAccount = await Account.findOne(
                { account_number: req.account_number },
                { users: 1, name: 1 }
            ).lean();
        }

        const account = req._workspaceAccount;
        if (!account) return next();

        const memberEntry = account.users.find(
            u => String(u.userId) === String(req.user._id) && u.status === 'active'
        );

        if (memberEntry) {
            // Normalize legacy roles
            let role = memberEntry.role;
            if (role === 'manager') role = 'admin';
            if (role === 'viewer') role = 'member';

            req.workspaceRole = role;
            req.workspaceMember = memberEntry;
        } else {
            req.workspaceRole = null;
            req.workspaceMember = null;
        }

        // Attach helper function
        req.can = (permission) => {
            if (!req.workspaceRole) return false;
            // Superadmin bypasses all checks
            if (req.user.role === 'superadmin') return true;
            return hasPermission(req.workspaceRole, permission);
        };

        next();
    } catch (err) {
        console.error('[Permissions] Hydration error:', err.message);
        next();
    }
}

// ═══════════════════════════════════════════
// Route guard: requirePerm('permission.name')
// ═══════════════════════════════════════════
function requirePerm(permission) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        if (!req.workspaceRole) {
            return res.status(403).json({ error: 'Vous n\'êtes pas membre de cet espace' });
        }

        if (!req.can(permission)) {
            return res.status(403).json({
                error: 'Permission refusée',
                required: permission,
                role: req.workspaceRole,
            });
        }

        next();
    };
}

// ═══════════════════════════════════════════
// Template helper: build "can" object for EJS
// ═══════════════════════════════════════════
function buildCanObject(role) {
    const can = {};
    for (const perm of Object.keys(PERMISSIONS)) {
        can[perm] = hasPermission(role, perm);
    }
    return can;
}

module.exports = {
    PERMISSIONS,
    ROLE_HIERARCHY,
    getRoleLevel,
    hasPermission,
    hydrateWorkspaceRole,
    requirePerm,
    buildCanObject,
};
